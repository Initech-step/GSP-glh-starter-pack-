# Feature Porting Notes

This document summarizes the changes made across the app so they can be replayed on other branches feature by feature.

## 1. Live Progress Refresh After Playback Updates

Goal:
When audio completes or playback position changes, the UI should refresh immediately without requiring the app to be killed and reopened.

Files:
- `src/utils/progressEvents.js`
- `src/utils/storage.js`
- `src/contexts/AppContext.js`

What changed:
- Added a tiny in-app event bus in `src/utils/progressEvents.js`.
- `saveProgress()` in `src/utils/storage.js` now emits a progress-change event after writing progress.
- `savePlaybackPosition()` in `src/utils/storage.js` now also mirrors position into the main progress object, then emits a progress-change event.
- `AppContext` subscribes to progress-change events and reloads saved state.
- `AppContext` also reloads saved state when the app returns to foreground.

Functions to port:
- `emitProgressChanged()`
- `subscribeToProgressChanges()`
- `saveProgress()`
- `savePlaybackPosition()`
- `loadSavedState()` usage inside `AppContext`

Why it matters:
- Completed badges and in-progress state update immediately.
- Background playback changes are reconciled when the app becomes active again.

## 2. Audio Context Sync With Auto-Transition

Goal:
Keep the React playback state in sync with `react-native-audio-pro`, especially when tracks end and the next track starts automatically.

Files:
- `src/contexts/AudioContext.js`

What changed:
- The audio context now updates `currentAudio` directly from player events when `event.track` is present.
- When `TRACK_ENDED` fires, the context saves progress and resyncs from AudioPro.
- `syncStateWithAudioPro()` now clears `currentAudio` if there is no active track.

Functions/areas to port:
- `setupContextListeners()`
- `syncStateWithAudioPro()`
- `TRACK_ENDED` handling

Why it matters:
- Player UI reflects the actual active track.
- Auto-next transitions stop feeling stale or disconnected from the screen state.

## 3. Player Screen Stability And Auto-Transition Fixes

Goal:
Prevent render loops, repeated completion updates, speed-reset spam, and the old route audio overriding the newly auto-played track.

Files:
- `src/screens/PlayerScreen.jsx`

What changed:
- Added `activeAudio`, `activeAudioId`, and `activeWeekNumber` so the screen can follow the true current track.
- Added `completionHandledRef` so completion marking only happens once per track.
- Removed unstable effect behavior that was repeatedly calling `setPlaybackRate()` and `loadAudio()`.
- Added `lastLoadedRouteAudioRef` so the route audio is only loaded once and does not reassert itself after auto-next.
- Notes navigation from the player now uses the active audio id, not just the route param id.

Key refs/variables to port:
- `activeAudio`
- `activeAudioId`
- `activeWeekNumber`
- `completionHandledRef`
- `lastLoadedRouteAudioRef`

Important behavior:
- When the audio service auto-advances, the screen no longer loads the previous route audio again.
- Completion no longer triggers a maximum-update-depth loop.

## 4. Full Reset / Clear All Data

Goal:
Allow the user to fully wipe local app state, not just progress.

Files:
- `src/utils/storage.js`
- `src/utils/audioCacheManager.js`
- `src/screens/SettingsScreen.jsx`

What changed:
- `clearAllData()` in `src/utils/storage.js` was expanded to clear:
  - progress
  - current level/week/audio
  - playback positions
  - notes
  - onboarding flag
  - selected folder path
  - saved audio URIs
  - saved PDF URIs
  - preferred speed
  - sleep timer preference
- `clearAllData()` now also clears:
  - cached audio via `clearAudioCache()`
  - cached PDFs created in app cache
- After clearing, a progress-change event is emitted.
- Settings gained a destructive `Reset App Data` action.
- Reset flow also clears the active player before wiping storage.

Functions to port:
- `clearAllData()`
- `clearCachedPdfFiles()`
- `clearAudioCache()`
- `handleResetAllData()` in settings

Why it matters:
- This is the branch-safe version of “wipe everything local”.

## 5. Sleep Timer Setting In Settings

Goal:
Expose a 60-minute sleep timer toggle to users.

Files:
- `src/utils/storage.js`
- `src/screens/SettingsScreen.jsx`
- `src/services/audioSetup.js`

What changed:
- Added `SLEEP_TIMER_ENABLED` storage key.
- Added:
  - `getSleepTimerEnabled()`
  - `setSleepTimerEnabled()`
- Settings gained an `Audio` section with a `Sleep Timer` switch.
- Toggling the setting calls `refreshSleepTimerPreference()` so the timer updates immediately.

Functions to port:
- `getSleepTimerEnabled()`
- `setSleepTimerEnabled()`
- `handleSleepTimerToggle()`
- `refreshSleepTimerPreference()`

Why it matters:
- Users can turn the timer on or off without editing code.

## 6. Sleep Timer Runtime Logic

Goal:
Pause playback automatically after 60 minutes of no manual interaction, including during background playback.

Files:
- `src/services/audioSetup.js`
- `src/contexts/AudioContext.js`

What changed in `audioSetup.js`:
- Added timer state:
  - `SLEEP_TIMER_MS`
  - `sleepTimerTimeout`
  - `sleepTimerDeadline`
  - `sleepTimerEnabledCache`
  - `lastKnownState`
  - `lastKnownTrackId`
- Added deadline-based helpers:
  - `getTimeRemainingMs()`
  - `clearSleepTimer()`
  - `scheduleSleepTimerFromDeadline()`
  - `registerSleepTimerInteraction()`
  - `enforceSleepTimerDeadline()`
- `PROGRESS` events now enforce the sleep deadline so background playback can still be paused even if `setTimeout` is unreliable.
- Auto-next transitions use `scheduleSleepTimerFromDeadline()` so they keep the existing inactivity window instead of resetting it.
- Manual interactions such as remote next/previous resume the full timer window.
- `handleStateChange()` detects `PAUSED -> PLAYING` on the same track and treats that as a manual resume from the notification bar.
- `refreshSleepTimerPreference()` now updates a cached enabled-state value and either clears or schedules the timer accordingly.

What changed in `AudioContext.js`:
- Manual in-app controls now call `registerSleepTimerInteraction()`:
  - `play()`
  - `pause()`
  - `seekTo()`
  - `seekForward()`
  - `seekBackward()`

Behavior after porting:
- If the user does not manually interact for 60 minutes, playback pauses.
- If the user manually pauses, resumes, or seeks, the 60-minute window restarts.
- Auto-playing the next track does not restart the timer.
- Notification-bar resume should continue smoothly after an auto-pause.

Important implementation note:
- During testing, `SLEEP_TIMER_MS` may temporarily be reduced. Before release, ensure it is set to:

```js
const SLEEP_TIMER_MS = 60 * 60 * 1000;
```

## 7. Bible Note Title Resolution

Goal:
Show a meaningful title when notes are taken on Bible audio instead of `Unknown Message`.

Files:
- `src/screens/NotesScreen.jsx`
- `src/utils/audioSequenceService.js`

What changed:
- `NotesScreen` now imports `getAudioMetadataById()` from `audioSequenceService`.
- Added `resolveAudioTitle(audioId)` in `NotesScreen`.
- Title resolution now works in this order:
  1. search curriculum audio
  2. fall back to metadata from `getAudioMetadataById()`
  3. for Bible audio, display `Book - Chapter N`
  4. otherwise use metadata title or `Unknown Message`
- This resolver is used for:
  - current note editor title
  - viewing another note
  - the all-notes list

Why it matters:
- Bible notes now show titles like `Genesis - Chapter 2`.

## 8. Settings Screen Integration

Goal:
Expose the new features inside the app UI.

Files:
- `src/screens/SettingsScreen.jsx`

What changed:
- Added `Audio` section with the sleep timer switch.
- Added `Data` section with a destructive `Reset App Data` item.
- Reset action:
  - clears the player with `AudioPro.clear()`
  - calls `clearAllData()`
  - refreshes progress
  - refreshes sleep timer preference
  - reloads current path and timer state in UI

Porting reminder:
- If the destination branch has a different Settings layout, port the handlers first, then add equivalent UI controls to that branch’s design.

## 9. Files Involved Overall

These are the main files touched across the features above:

- `src/utils/progressEvents.js`
- `src/utils/storage.js`
- `src/contexts/AppContext.js`
- `src/contexts/AudioContext.js`
- `src/screens/PlayerScreen.jsx`
- `src/screens/SettingsScreen.jsx`
- `src/services/audioSetup.js`
- `src/screens/NotesScreen.jsx`

## 10. Suggested Porting Order

If you want to replay this safely on another branch, use this order:

1. Port `src/utils/progressEvents.js`
2. Port `src/utils/storage.js`
3. Port `src/contexts/AppContext.js`
4. Port `src/contexts/AudioContext.js`
5. Port `src/services/audioSetup.js`
6. Port `src/screens/PlayerScreen.jsx`
7. Port `src/screens/NotesScreen.jsx`
8. Port `src/screens/SettingsScreen.jsx`

Reason:
- storage and event plumbing come first
- playback/runtime logic comes next
- screens come last once the underlying behavior exists

## 11. Quick Verification Checklist

After porting to another branch, verify:

- completing audio updates week/list UI immediately
- background completion is reflected when app returns active
- auto-next does not snap back to the previous track
- player screen follows the active track
- sleep timer toggle persists
- sleep timer pauses in foreground
- sleep timer pauses in background
- notification-bar resume works after sleep-timer pause
- full reset clears notes, progress, onboarding, URIs, and cached files
- Bible notes show `Book - Chapter N` instead of `Unknown Message`
