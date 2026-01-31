

import { AudioPro, AudioProEventType, AudioProState } from 'react-native-audio-pro';

// ============================================
// AUDIO CONFIGURATION
// This sets up AudioPro with optimal settings for your app
// ============================================
export function setupAudio() {
  console.log('🎵 Setting up React Native Audio Pro');

  // Configure AudioPro for background playback
  AudioPro.configure({
    debug: __DEV__, // Enable debug logs in development
    debugIncludesProgress: false, // Don't log every progress event (too noisy)
    progressIntervalMs: 1000, // Update progress every 1000ms for smooth UI
    showNextPrevControls: false,
	  showSkipControls: false
  });

  // Set up persistent event listeners
  setupPersistentListeners();

  console.log('✅ Audio setup complete');
}

// ============================================
// PERSISTENT EVENT LISTENERS
// These listeners run for the entire lifetime of the app
// and continue working even when React components unmount
// ============================================
function setupPersistentListeners() {
  const subscription = AudioPro.addEventListener((event) => {
    switch (event.type) {
      case AudioProEventType.TRACK_ENDED:
        handleTrackEnded(event);
        break;

      case AudioProEventType.REMOTE_NEXT:
        handleRemoteNext(event);
        break;

      case AudioProEventType.REMOTE_PREV:
        handleRemotePrev(event);
        break;

      case AudioProEventType.REMOTE_PLAY:
        handleRemotePlay(event);
        break;

      case AudioProEventType.REMOTE_PAUSE:
        handleRemotePause(event);
        break;

      case AudioProEventType.REMOTE_SEEK:
        handleRemoteSeek(event);
        break;

      case AudioProEventType.PLAYBACK_ERROR:
        handlePlaybackError(event);
        break;

      case AudioProEventType.STATE_CHANGED:
        handleStateChange(event);
        break;

      case AudioProEventType.PROGRESS:
        // Progress events are handled by AudioContext
        // We don't need to do anything here
        break;

      default:
        if (__DEV__) {
          console.log('🎵 AudioPro event:', event.type);
        }
    }
  });

  return subscription;
}

// ============================================
// EVENT HANDLERS
// ============================================

function handleTrackEnded(event) {
  console.log('✅ Track ended:', event.payload?.playingTrack?.title);
  
  // AUTO-PLAY NEXT TRACK
  // You can implement auto-play logic here
  // For example, get the next track from your curriculum/playlist
  // and play it automatically
  
  // Example (commented out - implement based on your app structure):
  /*
  const nextTrack = getNextTrackFromPlaylist();
  if (nextTrack) {
    AudioPro.play(nextTrack);
  }
  */
}

function handleRemoteNext(event) {
  console.log('⏭️ Remote Next button pressed');
  
  // HANDLE NEXT TRACK FROM LOCK SCREEN
  // User pressed the "next" button on lock screen or notification
  // Load and play the next track in your sequence
  
  // Example (commented out - implement based on your app structure):
  /*
  const nextTrack = getNextTrackFromPlaylist();
  if (nextTrack) {
    AudioPro.play(nextTrack);
  }
  */
}

function handleRemotePrev(event) {
  console.log('⏮️ Remote Previous button pressed');
  
  // HANDLE PREVIOUS TRACK FROM LOCK SCREEN
  // User pressed the "previous" button on lock screen or notification
  // Load and play the previous track in your sequence
  
  // Example (commented out - implement based on your app structure):
  /*
  const prevTrack = getPreviousTrackFromPlaylist();
  if (prevTrack) {
    AudioPro.play(prevTrack);
  }
  */
}

function handleRemotePlay(event) {
  console.log('▶️ Remote Play button pressed');
  
  // User pressed play on lock screen/notification
  // AudioPro automatically handles this, but you can add custom logic here
  AudioPro.resume();
}

function handleRemotePause(event) {
  console.log('⏸️ Remote Pause button pressed');
  
  // User pressed pause on lock screen/notification
  // AudioPro automatically handles this, but you can add custom logic here
  AudioPro.pause();
}

function handleRemoteSeek(event) {
  console.log('⏩ Remote Seek:', event.payload);
  
  // User seeked from lock screen (iOS)
  // AudioPro automatically handles this
}

function handlePlaybackError(event) {
  console.error('❌ Playback error:', event.payload);
  
  // HANDLE PLAYBACK ERRORS
  // You can implement error recovery here, such as:
  // - Retry loading the track
  // - Skip to next track
  // - Show a notification to the user
  
  const error = event.payload;
  if (error) {
    console.error('Error code:', error.errorCode);
    console.error('Error message:', error.error);
    
    // Example error recovery (commented out):
    /*
    if (error.errorCode === 'NETWORK_ERROR') {
      // Retry after a delay
      setTimeout(() => {
        const currentTrack = AudioPro.getPlayingTrack();
        if (currentTrack) {
          AudioPro.play(currentTrack);
        }
      }, 3000);
    }
    */
  }
}

function handleStateChange(event) {
  const state = event.payload?.state;
  if (__DEV__) {
    console.log('🔄 Player state changed to:', state);
  }
  
  // You can implement custom logic based on state changes here
  // For example, update a notification, save analytics, etc.
  
  switch (state) {
    case AudioProState.PLAYING:
      // Track started playing
      break;
    case AudioProState.PAUSED:
      // Track was paused
      break;
    case AudioProState.STOPPED:
      // Track was stopped
      break;
    case AudioProState.LOADING:
      // Track is loading
      break;
    case AudioProState.IDLE:
      // No track loaded
      break;
  }
}
