
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { AudioPro, AudioProEventType, AudioProState } from 'react-native-audio-pro';
import { AppState } from 'react-native';
import {
  getRepeatCurrentChapterEnabled,
  savePlaybackPosition,
  getPlaybackPosition,
  setRepeatCurrentChapterEnabled as persistRepeatCurrentChapterEnabled,
} from '../utils/storage';
import { getPlayableAudioUri } from '../utils/audioCacheManager';
import {
  getAudioMetadataById,
  prepareNextAudioTrack,
  preparePreviousAudioTrack,
} from '../utils/audioSequenceService';
import { armChapterCompletion } from '../utils/listenTracking';
import {
  refreshRepeatCurrentChapterPreference,
  registerSleepTimerInteraction,
} from '../services/audioSetup';

const AudioContext = createContext();

// A saved position this close to the end counts as "finished".
const END_THRESHOLD_SECONDS = 2;

export const AudioProvider = ({ children }) => {
  // ============================================
  // STATE - React state that mirrors AudioPro
  // ============================================
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repeatCurrentChapterEnabled, setRepeatCurrentChapterEnabledState] = useState(false);
  
  // ============================================
  // REFS - For avoiding stale closures
  // ============================================
  const currentAudioIdRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const saveProgressIntervalRef = useRef(null);
  const eventSubscriptionRef = useRef(null);

  // ============================================
  // SETUP ON MOUNT
  // Note: AudioPro.configure() is called in audioSetup.js
  // We only need to set up Context-specific listeners here
  // ============================================
  useEffect(() => {    
    // Set up event listeners for this Context
    setupContextListeners();
    loadRepeatCurrentChapterPreference();
    
    // Monitor app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.remove();
      }
    };
  }, []);

  const loadRepeatCurrentChapterPreference = async () => {
    const enabled = await getRepeatCurrentChapterEnabled();
    setRepeatCurrentChapterEnabledState(enabled);
    await refreshRepeatCurrentChapterPreference();
  };

  // ============================================
  // PROGRESS SAVING INTERVAL
  // Saves playback position every 30 seconds
  // ============================================
  const startProgressSavingInterval = () => {
    // Clear any existing interval
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }

    // Save progress every 30 seconds
    saveProgressIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 30000); // 30 seconds

  };

  const stopProgressSavingInterval = () => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
      saveProgressIntervalRef.current = null;
    }
  };

  // ============================================
  // SAVE PROGRESS FUNCTION
  // Called by interval and when pausing/backgrounding
  // ============================================
  const saveProgress = async () => {
    try {
      const audioId = currentAudioIdRef.current;
      const currentState = AudioPro.getState();
      
      // Only save if audio is loaded and not idle
      if (audioId && currentState !== AudioProState.IDLE) {
        const { position: posMs } = AudioPro.getTimings();
        const posSeconds = posMs / 1000;
        
        if (posSeconds > 0) {
          await savePlaybackPosition(audioId, posSeconds);
        }
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  };

  // ============================================
  // CONTEXT-SPECIFIC EVENT LISTENERS
  // These update the Context state based on AudioPro events
  // Global event handlers are in audioSetup.js
  // ============================================
  const setupContextListeners = () => {
    const subscription = AudioPro.addEventListener((event) => {
      if (event.track) {
        setCurrentAudio(event.track);
        currentAudioIdRef.current = event.track.id;
      } else if (event.track === null) {
        setCurrentAudio(null);
        currentAudioIdRef.current = null;
      }

      switch (event.type) {
        case AudioProEventType.STATE_CHANGED:
          // Update our React state when AudioPro state changes
          handleStateChange(event.payload?.state);
          break;

        case AudioProEventType.PROGRESS:
          // Update position and duration from progress events
          if (event.payload) {
            setPosition(event.payload.position / 1000); // Convert ms to seconds
            setDuration(event.payload.duration / 1000); // Convert ms to seconds
          }
          break;

        case AudioProEventType.TRACK_ENDED:
          // Audio finished playing - update state
          setIsPlaying(false); 
          // Save final progress
          saveProgress();
          setTimeout(() => {
            syncStateWithAudioPro();
          }, 0);
          break;

        case AudioProEventType.PLAYBACK_ERROR:
          // Handle playback errors
          console.error('❌ Playback error in Context:', event.payload);
          setIsPlaying(false);
          setIsLoaded(false);
          setIsLoading(false);
          break;

        default:
          // Other events handled in audioSetup.js
          break;
      }
    });

    // Store subscription reference
    eventSubscriptionRef.current = subscription;
  };

  // ============================================
  // STATE CHANGE HANDLER
  // Maps AudioPro states to our React state
  // ============================================
  const handleStateChange = (state) => {
    
    switch (state) {
      case AudioProState.PLAYING:
        setIsPlaying(true);
        setIsLoaded(true);
        setIsLoading(false);
        break;

      case AudioProState.PAUSED:
        setIsPlaying(false);
        setIsLoaded(true);
        setIsLoading(false);
        break;

      case AudioProState.STOPPED:
        setIsPlaying(false);
        setIsLoaded(true); // Track is still loaded, just stopped
        setIsLoading(false);
        break;

      case AudioProState.LOADING:
        setIsLoading(true);
        setIsLoaded(false);
        break;

      case AudioProState.IDLE:
        setIsPlaying(false);
        setIsLoaded(false);
        setIsLoading(false);
        break;

      default:
        break;
    }
  };

  // ============================================
  // APP STATE CHANGE HANDLER
  // Save progress when app goes to background
  // Sync state when app comes to foreground
  // ============================================
  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      syncStateWithAudioPro();
    } else if (nextAppState.match(/inactive|background/)) {
      saveProgress();
    }
    appState.current = nextAppState;
  };

  // ============================================
  // SYNC STATE WITH AUDIOPRO
  // Manually sync our React state with AudioPro's current state
  // Useful when app returns to foreground
  // ============================================
  const syncStateWithAudioPro = () => {
    try {
      const state = AudioPro.getState();
      const { position: posMs, duration: durMs } = AudioPro.getTimings();
      const track = AudioPro.getPlayingTrack();

      handleStateChange(state);
      setPosition(posMs / 1000);
      setDuration(durMs / 1000);
      
      if (track) {
        setCurrentAudio(track);
        currentAudioIdRef.current = track.id;
      } else {
        setCurrentAudio(null);
        currentAudioIdRef.current = null;
      }

    } catch (error) {
      console.error('❌ Error syncing state:', error);
    }
  };

  // ============================================
  // LOAD AND PLAY NEW AUDIO
  // Main function to load a new audio track
  // ============================================
  const loadAudio = async (audioSource, audioMetadata) => {
    try {
      setIsLoading(true);

      // Update current audio metadata
      setCurrentAudio(audioMetadata);
      currentAudioIdRef.current = audioMetadata.id;

      // A fresh load is a fresh listen. Arming here (rather than on position 0)
      // also covers resuming a chapter that was left at 90%.
      armChapterCompletion(audioMetadata.id);

      // convert content:\\ to file
      const playableUri = await getPlayableAudioUri(audioMetadata.id, audioSource);

      // Match the lock-screen title autoplay uses, instead of the raw filename.
      const chapter = getAudioMetadataById(audioMetadata.id);

      const track = {
        id: audioMetadata.id,
        url: playableUri,
        title: chapter ? `${chapter.bookName} - Chapter ${chapter.chapterNumber}` : audioMetadata.title,
        artist: 'ESV Audio Bible',
        artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png'
      };

      // Check if we should restore previous position.
      // A finished chapter has its position saved at the very end; resuming
      // there would fire TRACK_ENDED at once and bank a listen the user never
      // heard. Replay such a chapter from the top instead.
      const savedPosition = await getPlaybackPosition(audioMetadata.id);
      const totalSeconds = audioMetadata.duration ?? chapter?.duration ?? 0;
      const atEnd = totalSeconds > 0 && savedPosition >= totalSeconds - END_THRESHOLD_SECONDS;
      const startTimeMs = savedPosition > 0 && !atEnd ? savedPosition * 1000 : 0;

      // Set up progress saving interval (every 30 seconds)
      startProgressSavingInterval();

      // Load and play the track
      AudioPro.play(track, {
        autoPlay: false, // Start playing automatically
        startTimeMs, // Start from saved position if available
      });

      return true;
    } catch (error) {
      console.error('❌ Error loading audio:', error);
      setIsLoading(false);
      return false;
    }
  };

  // ============================================
  // PLAYBACK CONTROLS
  // Simple wrappers around AudioPro methods
  // ============================================
  
  const play = () => {
    try {
      AudioPro.resume();
      registerSleepTimerInteraction();
    } catch (error) {
      console.error('❌ Error playing:', error);
    }
  };

  const pause = () => {
    try {
      AudioPro.pause();
      registerSleepTimerInteraction();
      // Save progress when pausing
      saveProgress();
    } catch (error) {
      console.error('❌ Error pausing:', error);
    }
  };

  const seekTo = (timeInSeconds) => {
    try {
      // AudioPro.seekTo expects milliseconds
      AudioPro.seekTo(timeInSeconds * 1000);
      registerSleepTimerInteraction();
    } catch (error) {
      console.error('❌ Error seeking:', error);
    }
  };

  const setPlaybackRate = (rate) => {
    try {
      AudioPro.setPlaybackSpeed(rate);
    } catch (error) {
      console.error('❌ Error setting rate:', error);
    }
  };

  const seekForward = (seconds = 30) => {
    try {
      // AudioPro has a built-in seekForward method
      AudioPro.seekForward(seconds * 1000);
      registerSleepTimerInteraction();
    } catch (error) {
      console.error('❌ Error seeking forward:', error);
    }
  };

  const seekBackward = (seconds = 30) => {
    try {
      // AudioPro has a built-in seekBack method
      AudioPro.seekBack(seconds * 1000);
      registerSleepTimerInteraction();
    } catch (error) {
      console.error('❌ Error seeking backward:', error);
    }
  };

  const setRepeatCurrentChapterEnabled = async (enabled) => {
    try {
      await persistRepeatCurrentChapterEnabled(enabled);
      setRepeatCurrentChapterEnabledState(enabled);
      await refreshRepeatCurrentChapterPreference();
    } catch (error) {
      console.error('❌ Error setting repeat current chapter:', error);
    }
  };

  const skipToNextChapter = async () => {
    try {
      const currentTrack = AudioPro.getPlayingTrack();
      if (!currentTrack?.id) {
        return false;
      }

      const nextTrack = await prepareNextAudioTrack(currentTrack.id);
      if (!nextTrack) {
        return false;
      }

      armChapterCompletion(nextTrack.id);
      AudioPro.play(nextTrack, {
        autoPlay: true,
        startTimeMs: 0,
      });
      await registerSleepTimerInteraction();
      return true;
    } catch (error) {
      console.error('❌ Error skipping to next chapter:', error);
      return false;
    }
  };

  const skipToPreviousChapter = async () => {
    try {
      const currentTrack = AudioPro.getPlayingTrack();
      if (!currentTrack?.id) {
        return false;
      }

      const previousTrack = await preparePreviousAudioTrack(currentTrack.id);
      if (!previousTrack) {
        return false;
      }

      armChapterCompletion(previousTrack.id);
      AudioPro.play(previousTrack, {
        autoPlay: true,
        startTimeMs: 0,
      });
      await registerSleepTimerInteraction();
      return true;
    } catch (error) {
      console.error('❌ Error skipping to previous chapter:', error);
      return false;
    }
  };

  // ============================================
  // RELEASE AUDIO
  // Completely stops and clears the audio player
  // ============================================
  const releaseAudio = () => {
    try {
      // Save progress before releasing
      saveProgress();
      
      // Clear the player (stops playback and releases resources)
      AudioPro.clear();
      
      // Reset our state
      setCurrentAudio(null);
      currentAudioIdRef.current = null;
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setIsLoaded(false);
      setIsLoading(false);

      // stop progress saving:
      stopProgressSavingInterval()
      
    } catch (error) {
      console.error('❌ Error releasing audio:', error);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const isAudioLoaded = (audioId) => {
    const playingTrack = AudioPro.getPlayingTrack();
    return playingTrack?.id === audioId;
  };

  const getCurrentTrack = () => {
    return AudioPro.getPlayingTrack();
  };

  const getPlaybackState = () => {
    return AudioPro.getState();
  };

  // ============================================
  // CONTEXT VALUE
  // Everything we expose to consuming components
  // ============================================
  const value = {
    // State
    currentAudio,
    isPlaying,
    position,
    duration,
    isLoaded,
    isLoading,
    repeatCurrentChapterEnabled,
    
    // Controls
    loadAudio,
    play,
    pause,
    seekTo,
    seekForward,
    seekBackward,
    setPlaybackRate,
    setRepeatCurrentChapterEnabled,
    skipToNextChapter,
    skipToPreviousChapter,
    releaseAudio,
    
    // Helpers
    isAudioLoaded,
    getCurrentTrack,
    getPlaybackState,
    saveProgress, // Expose saveProgress for manual calls if needed
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// ============================================
// HOOK TO USE AUDIO CONTEXT
// ============================================
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
