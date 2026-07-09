// src/services/notificationReminders.js
//
// Reminds the user to keep listening 4 hours after they last did.
//
// expo-notifications cannot evaluate a condition when a notification fires, and
// the app may be force-killed, so no JS is guaranteed to run at fire time. Every
// condition ("has the user listened today?", "is it the middle of the night?")
// is therefore baked in at SCHEDULE time, using one-shot DATE triggers with
// fixed identifiers that we cancel and recompute whenever the app is alive.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { STORAGE_KEYS, getRemindersEnabled } from '../utils/storage';
import { getStreak, hasListenedToday } from '../utils/listenTracking';

const IDLE_WINDOW_MS = 4 * 60 * 60 * 1000;
const QUIET_START_HOUR = 22; // inclusive
const QUIET_END_HOUR = 7; // exclusive — 07:00 itself is allowed
const FALLBACK_HOUR = 9;
const ACTIVITY_FLUSH_MS = 30 * 1000;
const MIN_LEAD_MS = 60 * 1000; // never schedule in the past

const CHANNEL_ID = 'listen-reminders';
const REMINDER_IDS = {
  idle: 'glh-reminder-idle',
  fallback1: 'glh-reminder-fallback-1',
  fallback2: 'glh-reminder-fallback-2',
};

const IDLE_MESSAGE = {
  title: 'Dear Soldier',
  body: 'Your next chapter is waiting. Keep the streak alive.',
};
const FALLBACK_MESSAGE = {
  title: 'Dear Soldier',
  body: 'A few minutes in the Word today?',
};

let remindersEnabledCache = true;
let lastActivityMs = null;
let lastFlushedMs = 0;

// ============================================
// TIME MATH (pure — exported for testing)
// ============================================

/** Push any instant inside [22:00, 07:00) forward to 07:00 local. */
export function clampToWakingHours(candidate) {
  const date = new Date(candidate.getTime());
  const hour = date.getHours();
  const inQuietHours = hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;

  if (!inQuietHours) return date;

  // 22:00–23:59 belongs to the next morning; 00:00–06:59 to this one.
  if (hour >= QUIET_START_HOUR) date.setDate(date.getDate() + 1);
  date.setHours(QUIET_END_HOUR, 0, 0, 0);
  return date;
}

export function computeIdleFireTime(lastActivityAtMs, now = Date.now()) {
  let fireAt = lastActivityAtMs + IDLE_WINDOW_MS;
  // The app can be reopened long after the window lapsed; don't schedule the past.
  if (fireAt <= now + MIN_LEAD_MS) fireAt = now + MIN_LEAD_MS;
  return clampToWakingHours(new Date(fireAt));
}

export function morningAfter(daysAhead, now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead, FALLBACK_HOUR, 0, 0, 0);
}

// ============================================
// SETUP + PERMISSIONS
// ============================================
export async function ensureNotificationSetup() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Listening Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // The old build scheduled a repeating notification under a random id, which
    // targeted cancels can never reach. Clear it exactly once.
    if ((await AsyncStorage.getItem(STORAGE_KEYS.NOTIF_MIGRATED)) !== 'true') {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_MIGRATED, 'true');
    }
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
}

/**
 * @param {{ request?: boolean }} options - request:true may show the OS dialog.
 */
export async function ensurePermission({ request = false } = {}) {
  try {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    if (!request || !canAskAgain) return false;

    const result = await Notifications.requestPermissionsAsync();
    return result.status === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

// ============================================
// SCHEDULING
// ============================================
export async function cancelOurReminders() {
  await Promise.all(
    Object.values(REMINDER_IDS).map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}

async function schedule(identifier, message, date) {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { ...message, data: { type: 'listen-reminder' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  });
}

async function readLastActivity() {
  if (lastActivityMs != null) return lastActivityMs;
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY_AT);
  lastActivityMs = stored ? Number(stored) : null;
  return lastActivityMs;
}

// Each arm cancels before it schedules, so two overlapping arms could cancel a
// reminder the other just scheduled. Serialise them.
let armQueue = Promise.resolve();

/**
 * Cancel our reminders and recompute them from current state. Safe to call often.
 */
export function armReminders() {
  const run = armQueue.then(armRemindersNow, armRemindersNow);
  armQueue = run.catch(() => {});
  return run;
}

async function armRemindersNow() {
  try {
    await cancelOurReminders();

    if (!remindersEnabledCache) return;
    if (!(await ensurePermission({ request: false }))) return;

    const now = new Date();
    const streak = await getStreak();
    const earnedToday = hasListenedToday(streak, now);
    const lastActivityAt = await readLastActivity();

    // Someone who already finished a chapter today has done the thing; the idle
    // nudge exists for people who dabbled but didn't finish.
    let idleFireAt = null;
    if (!earnedToday && lastActivityAt) {
      idleFireAt = computeIdleFireTime(lastActivityAt, now.getTime());
      await schedule(REMINDER_IDS.idle, IDLE_MESSAGE, idleFireAt);
    }

    // If the app is force-killed and never reopened, nothing re-arms. These two
    // one-shots keep the habit alive; reopening cancels and recomputes them.
    const fallbacks = [
      [REMINDER_IDS.fallback1, morningAfter(1, now)],
      [REMINDER_IDS.fallback2, morningAfter(2, now)],
    ];

    for (const [id, date] of fallbacks) {
      if (date.getTime() <= now.getTime() + MIN_LEAD_MS) continue;
      // Don't nudge twice within a few hours of the idle reminder.
      if (idleFireAt && Math.abs(date.getTime() - idleFireAt.getTime()) < IDLE_WINDOW_MS) continue;
      await schedule(id, FALLBACK_MESSAGE, date);
    }
  } catch (error) {
    console.error('Error arming reminders:', error);
  }
}

// ============================================
// ACTIVITY TRACKING
// ============================================

/**
 * Called on every progress tick (~1/s). Keeps the timestamp warm in memory and
 * flushes to storage at most every 30s. Never reschedules — a reschedule storm
 * would cost a native call per second while playing.
 */
export function touchActivity() {
  const now = Date.now();
  lastActivityMs = now;

  if (now - lastFlushedMs >= ACTIVITY_FLUSH_MS) {
    lastFlushedMs = now;
    AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, String(now)).catch(() => {});
  }
}

/** Discrete events (pause, stop, background, track end): persist and reschedule. */
export async function recordActivity() {
  const now = Date.now();
  lastActivityMs = now;
  lastFlushedMs = now;

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY_AT, String(now));
  } catch (error) {
    console.error('Error saving last activity:', error);
  }

  await armReminders();
}

/**
 * First completed chapter is the moment the app has earned the right to ask.
 * Asking on cold mount fires the OS dialog before the user has seen any value.
 */
export async function onChapterCompleted() {
  if (remindersEnabledCache) {
    await ensurePermission({ request: true });
  }
  await recordActivity();
}

export async function refreshReminderPreference() {
  remindersEnabledCache = await getRemindersEnabled();

  if (!remindersEnabledCache) {
    await cancelOurReminders();
    return;
  }

  await armReminders();
}
