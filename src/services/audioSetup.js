import { AudioPro, AudioProEventType, AudioProState } from 'react-native-audio-pro';
import { prepareNextAudioTrack, preparePreviousAudioTrack } from '../utils/audioSequenceService';
import { getSleepTimerEnabled, saveProgress } from '../utils/storage';

// OFFICIAL AUDIO SETUP

const SLEEP_TIMER_MS = 2 * 60 * 1000;
let sleepTimerTimeout = null;
let sleepTimerDeadline = null;
let sleepTimerEnabledCache = false;

export function setupAudio() {
  AudioPro.configure({
    debug: __DEV__,
    debugIncludesProgress: false,
    progressIntervalMs: 1000,
    showNextPrevControls: false,
    showSkipControls: false
  });

  setupPersistentListeners();
  refreshSleepTimerPreference();
}

function getTimeRemainingMs() {
  if (!sleepTimerDeadline) {
    return null;
  }

  return Math.max(0, sleepTimerDeadline - Date.now());
}

function clearSleepTimer() {
  if (sleepTimerTimeout) {
    clearTimeout(sleepTimerTimeout);
    sleepTimerTimeout = null;
  }
}

async function scheduleSleepTimerFromDeadline() {
  const enabled = sleepTimerEnabledCache;

  clearSleepTimer();

  if (!enabled || !sleepTimerDeadline || AudioPro.getState() !== AudioProState.PLAYING) {
    return;
  }

  const remainingMs = getTimeRemainingMs();

  if (remainingMs == null) {
    return;
  }

  if (remainingMs <= 0) {
    AudioPro.pause();
    clearSleepTimer();
    return;
  }

  sleepTimerTimeout = setTimeout(() => {
    AudioPro.pause();
    clearSleepTimer();
  }, remainingMs);
}

export async function registerSleepTimerInteraction() {
  clearSleepTimer();

  if (!sleepTimerEnabledCache) {
    sleepTimerDeadline = null;
    return;
  }

  sleepTimerDeadline = Date.now() + SLEEP_TIMER_MS;
  await scheduleSleepTimerFromDeadline();
}

function setupPersistentListeners() {
  const subscription = AudioPro.addEventListener((event) => {
    switch (event.type) {
      case AudioProEventType.PROGRESS:
        handleProgress(event);
        break;

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

      default:
        if (__DEV__) {
          console.log('🎵 AudioPro event:', event.type);
        }
    }
  });

  return subscription;
}

/**
 * Auto-play next audio when track ends.
 * 
 * FIX: The TRACK_ENDED event shape from react-native-audio-pro is:
 *   { type, track: { id, title, ... }, payload: { position, duration } }
 * 
 * The completed track is at event.track, NOT event.payload.playingTrack.
 * The final position/duration are in event.payload (ms).
 */
async function handleTrackEnded(event) {
  // ✅ FIX: Read track from event.track (not event.payload.playingTrack)
  const completedTrack = event.track;
  if (!completedTrack) {
    // console.log('⚠️ No track info in TRACK_ENDED event');
    return;
  }

  try {
    // ✅ FIX: Use duration from event.payload as the final position (track fully played),
    // falling back to AudioPro.getTimings() if payload is unavailable.
    const durationMs = event.payload?.duration;
    const posSeconds = durationMs != null
      ? durationMs / 1000
      : AudioPro.getTimings().position / 1000;

    if (posSeconds > 0) {
      await saveProgress(completedTrack.id, true, posSeconds);
      // console.log('💾 Final progress saved for:', completedTrack.id, 'at', posSeconds.toFixed(2), 's');
    }

    // Prepare and play next audio
    // console.log('🔄 Preparing next audio...');
    const nextTrack = await prepareNextAudioTrack(completedTrack.id);

    if (nextTrack) {
      // console.log('▶️ Auto-playing next audio:', nextTrack.title);

      AudioPro.play(nextTrack, {
        autoPlay: true,
        startTimeMs: 0,
      });
      await scheduleSleepTimerFromDeadline();
      // console.log('✅ Successfully transitioned to next audio');
    } 
    // else {
    //   console.log('📭 No next audio available - playlist complete');
    // }
  } catch (error) {
    console.error('❌ Error in handleTrackEnded:', error);
  }
}

/**
 * Handle skip to next audio from lock screen
 */
async function handleRemoteNext(event) {
  // console.log('⏭️ Remote Next button pressed');
  try {
    const currentTrack = AudioPro.getPlayingTrack();
    if (!currentTrack) {
      // console.log('⚠️ No current track to skip from');
      return;
    }
    const nextTrack = await prepareNextAudioTrack(currentTrack.id);

    if (nextTrack) {
      // console.log('▶️ Playing next audio:', nextTrack.title);
      AudioPro.play(nextTrack, {
        autoPlay: true,
        startTimeMs: 0,
      });
      await registerSleepTimerInteraction();
    } else {
      console.log('📭 No next audio available');
    }
  } catch (error) {
    console.error('❌ Error handling remote next:', error);
  }
}

/**
 * Handle skip to previous audio from lock screen
 */
async function handleRemotePrev(event) {
  // console.log('⏮️ Remote Previous button pressed');
  try {
    const currentTrack = AudioPro.getPlayingTrack();
    if (!currentTrack) {
      // console.log('⚠️ No current track to go back from');
      return;
    }

    const previousTrack = await preparePreviousAudioTrack(currentTrack.id);
    if (previousTrack) {
      // console.log('▶️ Playing previous audio:', previousTrack.title);
      AudioPro.play(previousTrack, {
        autoPlay: true,
        startTimeMs: 0,
      });
      await registerSleepTimerInteraction();
    }
  } catch (error) {
    console.error('❌ Error handling remote previous:', error);
  }
}

function handleRemotePlay(event) {
  // console.log('??????? Remote Play button pressed');
  if (sleepTimerEnabledCache) {
    sleepTimerDeadline = Date.now() + SLEEP_TIMER_MS;
  }
  AudioPro.resume();
  scheduleSleepTimerFromDeadline();
}

function handleRemotePause(event) {
  // console.log('??????? Remote Pause button pressed');
  if (sleepTimerEnabledCache) {
    sleepTimerDeadline = Date.now() + SLEEP_TIMER_MS;
  }
  AudioPro.pause();
  clearSleepTimer();
}

function handleRemoteSeek(event) {
  // console.log('??? Remote Seek:', event.payload);
  registerSleepTimerInteraction();
}

function handlePlaybackError(event) {
  console.error('??? Playback error:', event.payload);
  const error = event.payload;
  if (error) {
    console.error('Error code:', error.errorCode);
    console.error('Error message:', error.error);
  }
}

function handleProgress(event) {
  enforceSleepTimerDeadline();
}

function handleStateChange(event) {
  const state = event.payload?.state;

  if (state === AudioProState.PLAYING) {
    scheduleSleepTimerFromDeadline();
    return;
  }

  if (
    state === AudioProState.PAUSED ||
    state === AudioProState.STOPPED ||
    state === AudioProState.IDLE ||
    state === AudioProState.ERROR
  ) {
    clearSleepTimer();
  }
}

export async function refreshSleepTimerPreference() {
  const enabled = await getSleepTimerEnabled();
  sleepTimerEnabledCache = enabled;

  if (!enabled) {
    sleepTimerDeadline = null;
    clearSleepTimer();
    return;
  }

  if (!sleepTimerDeadline && AudioPro.getState() === AudioProState.PLAYING) {
    sleepTimerDeadline = Date.now() + SLEEP_TIMER_MS;
  }

  await scheduleSleepTimerFromDeadline();
}

function enforceSleepTimerDeadline() {
  if (!sleepTimerDeadline) {
    return;
  }

  if (AudioPro.getState() !== AudioProState.PLAYING) {
    return;
  }

  const remainingMs = getTimeRemainingMs();

  if (remainingMs != null && remainingMs <= 0) {
    AudioPro.pause();
    clearSleepTimer();
  }
}
