
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { AudioPro, AudioProEventType, AudioProState } from 'react-native-audio-pro';
import { AppState } from 'react-native';
import {
  savePlaybackPosition,
  getPlaybackPosition,
} from '../utils/storage';
import { getPlayableAudioUri } from '../utils/audioCacheManager';

const AudioContext = createContext();

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
    console.log('🎵 AudioContext: Setting up context-specific listeners');
    
    // Set up event listeners for this Context
    setupContextListeners();
    
    // Monitor app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      if (eventSubscriptionRef.current) {
        eventSubscriptionRef.current.remove();
      }
    };
  }, []);

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

    console.log('💾 Progress saving interval started (every 30 seconds)');
  };

  const stopProgressSavingInterval = () => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
      saveProgressIntervalRef.current = null;
      console.log('💾 Progress saving interval stopped');
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
          console.log(`💾 Progress saved: ${audioId} at ${posSeconds.toFixed(2)}s`);
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
      switch (event.type) {
        case AudioProEventType.STATE_CHANGED:
          // Update our React state when AudioPro state changes
          handleStateChange(event.payload?.state);
          break;

        case AudioProEventType.PROGRESS:
          // Update position and duration from progress events
          if (event.payload) {
            setPosition(event.payload.positionMs / 1000); // Convert ms to seconds
            setDuration(event.payload.durationMs / 1000); // Convert ms to seconds
          }
          break;

        case AudioProEventType.TRACK_ENDED:
          // Audio finished playing - update state
          console.log('✅ Track ended in Context');
          setIsPlaying(false);
          // Save final progress
          saveProgress();
          break;

        case AudioProEventType.PLAYBACK_ERROR:
          // Handle playback errors
          console.error('❌ Playback error in Context:', event.payload);
          setIsPlaying(false);
          setIsLoaded(false);
          setIsLoading(false);
          break;

        // Remote control events are handled in audioSetup.js
        // We don't need to handle them here unless we want
        // Context-specific behavior

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
    console.log('🔄 AudioContext: State changed to:', state);
    
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
      console.log('📱 App came to foreground - syncing state');
      syncStateWithAudioPro();
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('📱 App went to background - saving progress');
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
      }

      console.log('✅ State synced with AudioPro');
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
      console.log('🎵 Loading new audio:', audioMetadata.title);
      setIsLoading(true);

      // Update current audio metadata
      setCurrentAudio(audioMetadata);
      currentAudioIdRef.current = audioMetadata.id;

      // convert content:\\ to file
      const playableUri = await getPlayableAudioUri(audioMetadata.id, audioSource);

      // Prepare the track object for AudioPro
      // const track = {
      //   id: audioMetadata.id,
      //   url: 'https://res.cloudinary.com/dhsnrwwwn/video/upload/v1768213956/2c._Stages_of_Christian_Growth-_Sons_of_God_adjklw.mp3',
      //   title: audioMetadata.title,
      //   artist: 'Pst. Ita Udoh', // Use speaker as artist
      //   artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png'
      // };
      const track = {
        id: audioMetadata.id,
        url: playableUri,
        title: audioMetadata.title,
        artist: 'Pst. Ita Udoh', // Use speaker as artist
        artwork: 'https://res.cloudinary.com/dhsnrwwwn/image/upload/v1768211441/SELECT_ME_aevm3j.png'
      };

      // Check if we should restore previous position
      // const savedPosition = await getPlaybackPosition(audioMetadata.id);
      // const startTimeMs = savedPosition && savedPosition > 0 ? savedPosition * 1000 : 0;

      // Set up progress saving interval (every 30 seconds)
      startProgressSavingInterval();

      // Load and play the track
      // AudioPro.play() automatically handles stopping the previous track
      AudioPro.play(track, {
        autoPlay: false, // Start playing automatically
        //startTimeMs, // Start from saved position if available
      });

      // if (savedPosition && savedPosition > 0) {
      //   console.log(`✅ Resuming from saved position: ${savedPosition.toFixed(2)}s`);
      // }

      console.log('✅ Audio loaded successfully:', audioMetadata.title);
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
      console.log('▶️ Resuming playback');
    } catch (error) {
      console.error('❌ Error playing:', error);
    }
  };

  const pause = () => {
    try {
      AudioPro.pause();
      console.log('⏸️ Paused audio');
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
      console.log('⏩ Seeked to:', timeInSeconds.toFixed(2), 'seconds');
    } catch (error) {
      console.error('❌ Error seeking:', error);
    }
  };

  const setPlaybackRate = (rate) => {
    try {
      AudioPro.setPlaybackSpeed(rate);
      console.log('⚡ Playback rate set to:', rate);
    } catch (error) {
      console.error('❌ Error setting rate:', error);
    }
  };

  const seekForward = (seconds = 30) => {
    try {
      // AudioPro has a built-in seekForward method
      AudioPro.seekForward(seconds * 1000);
      console.log('⏩ Seeked forward:', seconds, 'seconds');
    } catch (error) {
      console.error('❌ Error seeking forward:', error);
    }
  };

  const seekBackward = (seconds = 30) => {
    try {
      // AudioPro has a built-in seekBack method
      AudioPro.seekBack(seconds * 1000);
      console.log('⏪ Seeked backward:', seconds, 'seconds');
    } catch (error) {
      console.error('❌ Error seeking backward:', error);
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
      
      console.log('✅ Audio released');
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
    
    // Controls
    loadAudio,
    play,
    pause,
    seekTo,
    seekForward,
    seekBackward,
    setPlaybackRate,
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

