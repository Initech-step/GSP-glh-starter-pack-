// src/utils/listenTracking.js
//
// Cumulative listen counts + daily streak. Both are device-local: api.js
// replaceAllProgress() overwrites @glh_progress wholesale, so anything stored
// in there would be erased by a cloud restore.
//
// Plain module (no React) so audioSetup.js, which runs before the React tree
// mounts, can drive the single completion write path.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getProgress } from './storage';
import { emitProgressChanged } from './progressEvents';

// ============================================
// DATE BUCKETING
// Local components only. toISOString() buckets by UTC midnight, which shifts
// the day boundary for every user not on UTC and silently breaks their streak.
// ============================================
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayKey(now = new Date()) {
  // Day underflow is normalised by the Date constructor, so this is DST-safe.
  return getLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

// ============================================
// READS
// ============================================
export async function getListenCounts() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LISTEN_COUNTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting listen counts:', error);
    return {};
  }
}

export async function getStreak() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting streak:', error);
    return null;
  }
}

export function getListenCount(counts, audioId) {
  return counts?.[audioId] || 0;
}

/** Badge copy: nothing at 0, "Listened" at 1, "Listened ×N" beyond. */
export function formatListenedLabel(count) {
  if (!count) return null;
  return count === 1 ? 'Listened' : `Listened ×${count}`;
}

/**
 * A book's count is the LOWEST count among its chapters: the book has been
 * heard through N times only when every chapter has been heard N times.
 * Early-breaks at 0, which is the overwhelmingly common case.
 */
export function computeBookListenCount(book, counts) {
  const audios = book?.audios || [];
  if (audios.length === 0) return 0;

  let min = Infinity;
  for (const audio of audios) {
    const count = counts?.[audio.id] || 0;
    if (count < min) min = count;
    if (min === 0) break;
  }
  return min === Infinity ? 0 : min;
}

/**
 * Derived, never persisted. Returns 0 the moment a streak lapses, so a broken
 * streak reads correctly without any midnight background job.
 * lastDate === yesterday still counts: the day isn't over yet.
 */
export function deriveCurrentStreak(streak, now = new Date()) {
  if (!streak?.lastDate) return 0;
  const today = getLocalDateKey(now);
  const yesterday = getYesterdayKey(now);
  return streak.lastDate === today || streak.lastDate === yesterday ? streak.current : 0;
}

export function hasListenedToday(streak, now = new Date()) {
  return Boolean(streak?.lastDate) && streak.lastDate === getLocalDateKey(now);
}

// ============================================
// WRITE PATH
// Serialised so back-to-back autoplay completions can't clobber each other's
// read-modify-write.
// ============================================
let writeQueue = Promise.resolve();

function enqueue(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

async function incrementListenCount(audioId) {
  const counts = await getListenCounts();
  counts[audioId] = (counts[audioId] || 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.LISTEN_COUNTS, JSON.stringify(counts));
  return counts[audioId];
}

async function recordStreakForDate(now = new Date()) {
  const today = getLocalDateKey(now);
  const yesterday = getYesterdayKey(now);
  const streak = (await getStreak()) || { current: 0, longest: 0, lastDate: null, startDate: null };

  if (streak.lastDate === today) {
    return streak; // already earned today
  }

  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
    streak.startDate = today;
  }

  streak.lastDate = today;
  streak.longest = Math.max(streak.longest || 0, streak.current);

  await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

// ============================================
// COMPLETION DEDUPE
//
// A natural finish is observed by both audioSetup's TRACK_ENDED handler and
// PlayerScreen's ~100% effect. Only TRACK_ENDED counts (it fires with the
// screen off), but the guard also absorbs a duplicate TRACK_ENDED.
//
// Missing from the map means "armed" — a cold start mid-chapter should count.
// ============================================
const armed = new Map();

export function armChapterCompletion(audioId) {
  if (audioId) armed.set(audioId, true);
}

/**
 * The single write path for a completed chapter. Increments the chapter's
 * count and records the day for the streak.
 */
export async function recordChapterCompletion(audioId) {
  if (!audioId) return null;
  if (armed.get(audioId) === false) return null;

  // Disarm synchronously, before the first await: a racing duplicate must
  // observe the disarmed state rather than interleave inside the read-modify-write.
  armed.set(audioId, false);

  try {
    const result = await enqueue(async () => {
      const count = await incrementListenCount(audioId);
      const streak = await recordStreakForDate();
      return { count, streak };
    });
    emitProgressChanged('chapterCompleted');
    return result;
  } catch (error) {
    console.error('Error recording chapter completion:', error);
    armed.set(audioId, true); // let a retry through
    return null;
  }
}

// ============================================
// MIGRATION
// Existing installs have progress[id].completed but no counts.
// ============================================
export async function ensureListenDataSeeded() {
  try {
    if ((await AsyncStorage.getItem(STORAGE_KEYS.LISTEN_SEEDED)) === 'true') return;

    await enqueue(async () => {
      const progress = await getProgress();
      const counts = await getListenCounts();
      let newestCompletion = null;

      for (const [audioId, entry] of Object.entries(progress)) {
        if (!entry?.completed) continue;
        // Merge, never overwrite: a completion racing the seed must survive.
        if (counts[audioId] == null) counts[audioId] = 1;
        if (entry.lastPlayed && (!newestCompletion || entry.lastPlayed > newestCompletion)) {
          newestCompletion = entry.lastPlayed;
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.LISTEN_COUNTS, JSON.stringify(counts));

      // @glh_progress holds no per-day log, so historical streaks are
      // unreconstructable. Seed a single day at the newest completion and let
      // deriveCurrentStreak decide whether it is still alive.
      const existing = await getStreak();
      if (!existing?.lastDate && newestCompletion) {
        const day = getLocalDateKey(new Date(newestCompletion));
        await AsyncStorage.setItem(
          STORAGE_KEYS.STREAK,
          JSON.stringify({ current: 1, longest: 1, lastDate: day, startDate: day })
        );
      }

      await AsyncStorage.setItem(STORAGE_KEYS.LISTEN_SEEDED, 'true');
    });
  } catch (error) {
    console.error('Error seeding listen data:', error);
  }
}
