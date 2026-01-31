// src/contexts/AppContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { curriculum } from '../data/curriculum';
import {
  getProgress,
  getCurrentPosition,
  saveCurrentPosition,
  saveProgress,
} from '../utils/storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState('beginners');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Load saved state on app start
  useEffect(() => {
    loadSavedState();
    setupSixHourlyNotification();
  }, []);

  const loadSavedState = async () => {
    try {
      const position = await getCurrentPosition();
      const progressData = await getProgress();
      
      setCurrentLevel(position.level);
      setCurrentWeek(position.weekNumber);
      setCurrentAudioId(position.audioId);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading saved state:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update current position
  const updateCurrentPosition = async (level, weekNumber, audioId) => {
    setCurrentLevel(level);
    setCurrentWeek(weekNumber);
    setCurrentAudioId(audioId);
    await saveCurrentPosition(level, weekNumber, audioId);
  };

  // Mark audio as completed
  const markAudioCompleted = async (audioId) => {
    await saveProgress(audioId, true);
    const updatedProgress = await getProgress();
    setProgress(updatedProgress);
  };

  // Get next audio in sequence
  const getNextAudio = () => {
    const levelData = curriculum[currentLevel];
    const weekData = levelData.weeks.find(w => w.weekNumber === currentWeek);
    
    if (!weekData) return null;

    // Find current audio index
    const currentIndex = weekData.audios.findIndex(a => a.id === currentAudioId);
    
    // Next audio in same week
    if (currentIndex < weekData.audios.length - 1) {
      return {
        level: currentLevel,
        week: currentWeek,
        audio: weekData.audios[currentIndex + 1],
      };
    }

    // Next week in same level
    if (currentWeek < levelData.weeks.length) {
      const nextWeek = levelData.weeks.find(w => w.weekNumber === currentWeek + 1);
      if (nextWeek) {
        return {
          level: currentLevel,
          week: nextWeek.weekNumber,
          audio: nextWeek.audios[0],
        };
      }
    }

    // Next level
    const levelOrder = ['beginners', 'intermediary', 'advanced'];
    const currentLevelIndex = levelOrder.indexOf(currentLevel);
    
    if (currentLevelIndex < levelOrder.length - 1) {
      const nextLevel = levelOrder[currentLevelIndex + 1];
      const nextLevelData = curriculum[nextLevel];
      
      if (nextLevelData && nextLevelData.weeks.length > 0) {
        return {
          level: nextLevel,
          week: 1,
          audio: nextLevelData.weeks[0].audios[0],
        };
      }
    }

    return null; // Completed all content
  };

  // Check if week is unlocked (sequential progression)
  const isWeekUnlocked = (level, weekNumber) => {
    // Week 1 of beginners is always unlocked
    if (level === 'beginners' && weekNumber === 1) return true;

    const levelData = curriculum[level];
    const previousWeek = levelData.weeks.find(w => w.weekNumber === weekNumber - 1);

    // Check if previous week in same level is completed
    if (previousWeek) {
      const allPreviousCompleted = previousWeek.audios.every(
        audio => progress[audio.id]?.completed
      );
      return allPreviousCompleted;
    }

    // If no previous week, check if previous level is completed
    const levelOrder = ['beginners', 'intermediary', 'advanced'];
    const currentLevelIndex = levelOrder.indexOf(level);
    
    if (currentLevelIndex > 0 && weekNumber === 1) {
      const previousLevel = levelOrder[currentLevelIndex - 1];
      const previousLevelData = curriculum[previousLevel];
      const lastWeek = previousLevelData.weeks[previousLevelData.weeks.length - 1];
      
      const allPreviousLevelCompleted = lastWeek.audios.every(
        audio => progress[audio.id]?.completed
      );
      return allPreviousLevelCompleted;
    }

    return false;
  };

  // Get completion stats
  const getCompletionStats = (level) => {
    const levelData = curriculum[level];
    let totalAudios = 0;
    let completedAudios = 0;

    levelData.weeks.forEach(week => {
      week.audios.forEach(audio => {
        totalAudios++;
        if (progress[audio.id]?.completed) {
          completedAudios++;
        }
      });
    });

    return {
      total: totalAudios,
      completed: completedAudios,
      percentage: totalAudios > 0 ? (completedAudios / totalAudios) * 100 : 0,
    };
  };

  const value = {
    currentLevel,
    currentWeek,
    currentAudioId,
    progress,
    loading,
    updateCurrentPosition,
    markAudioCompleted,
    getNextAudio,
    isWeekUnlocked,
    getCompletionStats,
    refreshProgress: loadSavedState
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


/**
 * Schedules a local notification every 6 hours
 */
async function setupSixHourlyNotification() {
  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Android channel (required)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('six-hourly', {
      name: '6 Hour Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Prevent duplicate schedules
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule repeating notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Dear Soldier!!',
      body: "Continue listening to the starter kit.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 6 * 60 * 60, // 6 hours
      repeats: true,
    },
  });
}