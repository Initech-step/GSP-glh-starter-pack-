I'll guide you step-by-step through migrating from expo-av to expo-audio for your audio playback needs.

## Step-by-Step Migration Guide: expo-av → expo-audio

### Step 1: Install expo-audio

```bash
npx expo install expo-audio
```

### Step 2: Remove expo-av (optional but recommended)

```bash
npm uninstall expo-av
```

### Step 3: Update Your Imports

**Before (expo-av):**
```javascript
import { Audio } from 'expo-av';
```

**After (expo-audio):**
```javascript
import { useAudioPlayer, AudioSource } from 'expo-audio';
```

### Step 4: Understand the Key Differences

| expo-av | expo-audio |
|---------|-----------|
| `Audio.Sound.createAsync()` | `useAudioPlayer()` hook |
| Imperative API | Declarative/Hook-based API |
| Manual state management | Built-in state management |
| `sound.playAsync()` | `player.play()` |
| `sound.pauseAsync()` | `player.pause()` |

### Step 5: Migrate Your Audio Player Component

Here's a complete example showing the migration:### Step 6: Key API Reference

Here's a quick reference for common operations:

**Basic Operations:**
```javascript
const player = useAudioPlayer(audioSource);

// Playback control
player.play();
player.pause();
player.seekTo(seconds);

// State (read-only)
player.playing        // boolean
player.currentTime    // number (seconds)
player.duration       // number (seconds)
player.muted          // boolean
player.volume         // number (0-1)

// Modifying state
player.volume = 0.5;  // Set volume to 50%
player.muted = true;  // Mute audio
```

### Step 7: Handle Audio Session (Optional)

If you need background audio or audio session configuration:

```javascript
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Configure audio session
await setAudioModeAsync({
  playsInSilentMode: true,
  staysActiveInBackground: true,
});
```

### Step 8: Testing Checklist

- [ ] Audio loads and plays correctly
- [ ] Pause/resume works
- [ ] Seeking works as expected
- [ ] State updates properly (position, duration)
- [ ] Component cleanup (no memory leaks)
- [ ] Multiple audio sources work
- [ ] Background playback (if needed)

### Step 9: Common Gotchas

1. **Hook rules**: `useAudioPlayer` must be at component top level
2. **Source changes**: Changing the audio source will automatically reload
3. **Async operations**: Most operations in expo-audio are synchronous (unlike expo-av)
4. **State updates**: Use the player's built-in state instead of managing your own

### Step 10: Migration Benefits

✅ **Cleaner code** - Hook-based API is more React-friendly  
✅ **Better performance** - Optimized for modern React Native  
✅ **Simpler state management** - Built-in state tracking  
✅ **Future-proof** - Active development and support  
✅ **Type safety** - Better TypeScript support

Would you like me to help you migrate a specific audio component from your GLH Messages app, or do you need help with any particular audio feature like playlists, background playback, or audio streaming?