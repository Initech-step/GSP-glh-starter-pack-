// src/contexts/AppContext.js
import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { AppState } from 'react-native';
import {
  getProgress,
  getCurrentPosition,
  saveCurrentPosition,
  saveProgress,
} from '../utils/storage';
import {
  ensureListenDataSeeded,
  getListenCounts,
  getStreak,
  deriveCurrentStreak,
} from '../utils/listenTracking';
import {
  ensureNotificationSetup,
  refreshReminderPreference,
  armReminders,
  recordActivity,
} from '../services/notificationReminders';
import { subscribeToProgressChanges } from '../utils/progressEvents';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [progress, setProgress] = useState({});
  const [listenCounts, setListenCounts] = useState({});
  const [streakInfo, setStreakInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved state on app start
  useEffect(() => {
    bootstrap();

    const unsubscribe = subscribeToProgressChanges(() => {
      loadSavedState();
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadSavedState();
        // Catch-up after the app was killed: nothing re-armed while it was dead.
        armReminders();
      } else {
        recordActivity();
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  const bootstrap = async () => {
    // Seed before the first read so existing completions surface as counts.
    await ensureListenDataSeeded();
    await loadSavedState();
    await ensureNotificationSetup();
    await refreshReminderPreference();
  };

  const loadSavedState = async () => {
    try {
      const [position, progressData, counts, streak] = await Promise.all([
        getCurrentPosition(),
        getProgress(),
        getListenCounts(),
        getStreak(),
      ]);

      setCurrentAudioId(position.audioId);
      setProgress(progressData);
      setListenCounts(counts);
      setStreakInfo(streak);
    } catch (error) {
      console.error('Error loading saved state:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update current position
  const updateCurrentPosition = async (testamentKey, weekNumber, audioId) => {
    setCurrentAudioId(audioId);
    await saveCurrentPosition(testamentKey, weekNumber, audioId);
  };

  // Marks the `completed` flag only. Listen counts and the streak are owned by
  // audioSetup's TRACK_ENDED handler so they also fire with the screen off.
  const markAudioCompleted = async (audioId) => {
    await saveProgress(audioId, true);
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
  };

  // Derived on read, so a lapsed streak shows 0 without any background job.
  const currentStreak = useMemo(() => deriveCurrentStreak(streakInfo), [streakInfo]);

  const value = {
    currentAudioId,
    progress,
    listenCounts,
    streakInfo,
    currentStreak,
    loading,
    updateCurrentPosition,
    markAudioCompleted,
    refreshProgress: loadSavedState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
