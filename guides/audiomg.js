import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Directory where cached audio files live.
 * This is app-managed and safe to delete from.
 */
const CACHE_DIR = FileSystem.cacheDirectory + 'audio-cache/';

/**
 * AsyncStorage key storing cache metadata
 */
const CACHE_INDEX_KEY = '@audio_cache_index';

/**
 * Maximum cache size in bytes.
 * Example: 2 GB (adjust as needed)
 */
const MAX_CACHE_BYTES = 2 * 1024 * 1024 * 1024;

/**
 * Cache index structure:
 * {
 *   [audioId]: {
 *     uri: 'file:///...',
 *     size: number,
 *     lastAccessed: number (timestamp)
 *   }
 * }
 */

/* -------------------------------------------------- */
/* Initialization                                     */
/* -------------------------------------------------- */

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

async function loadIndex() {
  const raw = await AsyncStorage.getItem(CACHE_INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveIndex(index) {
  await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
}

/* -------------------------------------------------- */
/* Utility helpers                                    */
/* -------------------------------------------------- */

function generateCachePath(audioId) {
  return `${CACHE_DIR}${audioId}.mp3`;
}

function getTotalCacheSize(index) {
  return Object.values(index).reduce((sum, entry) => sum + entry.size, 0);
}

/**
 * Evict least-recently-used files until under limit
 */
async function enforceCacheLimit(index) {
  let totalSize = getTotalCacheSize(index);

  if (totalSize <= MAX_CACHE_BYTES) return index;

  // Sort by last accessed (oldest first)
  const sorted = Object.entries(index).sort(
    (a, b) => a[1].lastAccessed - b[1].lastAccessed
  );

  for (const [audioId, entry] of sorted) {
    await FileSystem.deleteAsync(entry.uri, { idempotent: true });
    delete index[audioId];
    totalSize -= entry.size;

    if (totalSize <= MAX_CACHE_BYTES) break;
  }

  await saveIndex(index);
  return index;
}

/* -------------------------------------------------- */
/* Public API                                         */
/* -------------------------------------------------- */

/**
 * Ensures audio exists as file:// and returns playable URI.
 *
 * @param {string} audioId - Logical audio ID
 * @param {string} sourceUri - content:// or http(s)://
 */
export async function getPlayableAudioUri(audioId, sourceUri) {
  await ensureCacheDir();

  const index = await loadIndex();
  const cached = index[audioId];

  // Case 1: Already cached
  if (cached) {
    index[audioId].lastAccessed = Date.now();
    await saveIndex(index);
    return cached.uri;
  }

  // Case 2: Need to copy into cache
  const cachePath = generateCachePath(audioId);

  await FileSystem.copyAsync({
    from: sourceUri,
    to: cachePath,
  });

  const info = await FileSystem.getInfoAsync(cachePath);

  index[audioId] = {
    uri: cachePath,
    size: info.size ?? 0,
    lastAccessed: Date.now(),
  };

  await saveIndex(index);
  await enforceCacheLimit(index);

  return cachePath;
}

/**
 * Optional manual cleanup (settings screen)
 */
export async function clearAudioCache() {
  await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  await AsyncStorage.removeItem(CACHE_INDEX_KEY);
}


















// PART 2: INTEGRATION
import React, { createContext, useContext, useRef, useState } from 'react';
import { AudioPro } from 'react-native-audio-pro';
import { getPlayableAudioUri } from '../utils/audioCacheManager';
import { loadAudioById } from '../utils/storage';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const playerRef = useRef(null);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Play audio by logical ID
   */
  const playAudio = async (audioId) => {
    try {
      // Get original URI (content://)
      const sourceUri = await loadAudioById(audioId);
      if (!sourceUri) throw new Error('Audio URI not found');

      // Convert → file:// via cache manager
      const playableUri = await getPlayableAudioUri(audioId, sourceUri);

      // Stop existing playback
      if (playerRef.current) {
        await playerRef.current.stop();
      }

      // Create new player instance
      const player = new AudioPro({
        source: playableUri,
        autoPlay: true,
        background: true,
      });

      playerRef.current = player;
      setCurrentAudioId(audioId);
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio playback failed:', err);
    }
  };

  const pause = async () => {
    if (playerRef.current) {
      await playerRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (playerRef.current) {
      await playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const stop = async () => {
    if (playerRef.current) {
      await playerRef.current.stop();
      playerRef.current = null;
      setIsPlaying(false);
      setCurrentAudioId(null);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playAudio,
        pause,
        resume,
        stop,
        isPlaying,
        currentAudioId,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used inside AudioProvider');
  }
  return ctx;
};
