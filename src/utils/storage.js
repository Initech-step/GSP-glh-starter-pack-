// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import { loadAudioIdByName, loadPDFIdByName } from '../data/audioLoader';
import * as FileSystem from 'expo-file-system/legacy';

const KEYS = {
  PROGRESS: '@glh_progress', //stores progress level, week and audios
  CURRENT_LEVEL: '@glh_current_level',
  CURRENT_WEEK: '@glh_current_week',
  CURRENT_AUDIO: '@glh_current_audio',
  PLAYBACK_POSITION: '@glh_playback_position', // stores playback for resumption
  NOTES: '@glh_notes',
  ONBOARDING_COMPLETED: '@glh_onboarding',
  AUDIO_FOLDER_KEY: '@glh_audio_folder_path',
  AUDIO_URI: '@glh_audio_uri',
  PDF_URI: '@glh_pdf_uri'
};

// Progress tracking
export const saveProgress = async (audioId, completed = false, position = 0) => {
  try {
    const progressData = await getProgress();
    progressData[audioId] = {
      completed,
      position,
      lastPlayed: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

export const getProgress = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting progress:', error);
    return {};
  }
};

export const isAudioCompleted = async (audioId) => {
  try {
    const progress = await getProgress();
    return progress[audioId]?.completed || false;
  } catch (error) {
    return false;
  }
};

// Current position tracking
export const saveCurrentPosition = async (level, weekNumber, audioId) => {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_LEVEL, level);
    await AsyncStorage.setItem(KEYS.CURRENT_WEEK, weekNumber.toString());
    await AsyncStorage.setItem(KEYS.CURRENT_AUDIO, audioId);
  } catch (error) {
    console.error('Error saving current position:', error);
  }
};

export const getCurrentPosition = async () => {
  try {
    const level = await AsyncStorage.getItem(KEYS.CURRENT_LEVEL);
    const week = await AsyncStorage.getItem(KEYS.CURRENT_WEEK);
    const audio = await AsyncStorage.getItem(KEYS.CURRENT_AUDIO);
    
    return {
      level: level || 'beginners',
      weekNumber: week ? parseInt(week) : 1,
      audioId: audio || null,
    };
  } catch (error) {
    console.error('Error getting current position:', error);
    return { level: 'beginners', weekNumber: 1, audioId: null };
  }
};

// Playback position for resume
export const savePlaybackPosition = async (audioId, position) => {
  try {
    const positions = await getPlaybackPositions();
    positions[audioId] = position;
    await AsyncStorage.setItem(KEYS.PLAYBACK_POSITION, JSON.stringify(positions));
  } catch (error) {
    console.error('Error saving playback position:', error);
  }
};

export const getPlaybackPosition = async (audioId) => {
  try {
    const positions = await getPlaybackPositions();
    return positions[audioId] || 0;
  } catch (error) {
    return 0;
  }
};

export const getPlaybackPositions = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PLAYBACK_POSITION);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

// Notes functionality
export const saveNote = async (audioId, noteText) => {
  try {
    const notes = await getNotes();
    notes[audioId] = {
      text: noteText,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

export const getNote = async (audioId) => {
  try {
    const notes = await getNotes();
    return notes[audioId]?.text || '';
  } catch (error) {
    return '';
  }
};

export const getNotes = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

export const deleteNote = async (audioId) => {
  try {
    const notes = await getNotes();
    delete notes[audioId];
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

// Onboarding
export const setOnboardingCompleted = async () => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error setting onboarding:', error);
  }
};

export const hasCompletedOnboarding = async () => {
  try {
    const completed = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  } catch (error) {
    return false;
  }
};

// Clear all data (for testing/reset)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PROGRESS,
      KEYS.CURRENT_LEVEL,
      KEYS.CURRENT_WEEK,
      KEYS.CURRENT_AUDIO,
      KEYS.PLAYBACK_POSITION,
      KEYS.NOTES,
      KEYS.ONBOARDING_COMPLETED,
      KEYS.AUDIO_FOLDER_KEY,
      KEYS.AUDIO_URI,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// ============================================
// SAVE SELECTED FOLDER PATH
// ============================================
export const saveAudioFolderPath = async (folderUri) => {
  try {
    await AsyncStorage.setItem(KEYS.AUDIO_FOLDER_KEY, folderUri);
    console.log('✅ Audio folder path saved:', folderUri);
    return true;
  } catch (error) {
    console.error('❌ Error saving folder path:', error);
    return false;
  }
};

// ============================================
// GET SAVED FOLDER PATH
// ============================================
export const getAudioFolderPath = async () => {
  try {
    const path = await AsyncStorage.getItem(KEYS.AUDIO_FOLDER_KEY);
    console.log('📂 Audio folder path:', path);
    return path;
  } catch (error) {
    console.error('❌ Error getting folder path:', error);
    return null;
  }
};

// ============================================
// CHECK IF FOLDER IS CONFIGURED
// ============================================
export const isAudioFolderConfigured = async () => {
  const path = await getAudioFolderPath();
  return path !== null;
};


export const getAudioUris = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.AUDIO_URI);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting URI:', error);
    return {};
  }
};

export const getPDFUris = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PDF_URI);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting URI:', error);
    return {};
  }
};

export const saveAudioUris = async (uri, audioID) => {
  const audioUris = await getAudioUris();
  audioUris[audioID] = uri;
  console.log('Saving audio URI:', audioID, uri);
  try{
    await AsyncStorage.setItem(KEYS.AUDIO_URI, JSON.stringify(audioUris));
  } catch (error) {
    console.error('Error saving URI:', error);
  }
};

export const SavePDFUris = async (uri, pdfID) => {
  const PDFUris = await getPDFUris();
  PDFUris[pdfID] = uri;
  console.log('Saving pdf URI:', pdfID, uri);
  try{
    await AsyncStorage.setItem(KEYS.PDF_URI, JSON.stringify(PDFUris));
  } catch (error) {
    console.error('Error saving URI:', error);
  }
};

export const getAudioUri = async (audioID) => {
  try {
    const audioUris = await getAudioUris();
    return audioUris[audioID] || null;
  } catch (error) {
    return null;
  }
}

async function saveURIItem(directory, indent = 0) {  
  const contents = await directory.list();
  
  for (const item of contents) {
    if (item instanceof Directory) {
      await saveURIItem(item, indent + 2);
    } else {
      console.log(' '.repeat(indent) + '- ' + item.name + ' (' + item.extension + ')');
      if (item.extension === '.mp3') {
        const audioID = loadAudioIdByName(item.name);
        await saveAudioUris(item.uri, audioID);
      }
      else if(item.extension === ".pdf"){
        console.log('Found PDF file:', item.name);
        console.log('File URI:', item.uri);
        const pdfID = loadPDFIdByName(item.name);
        await SavePDFUris(item.uri, pdfID);
      }
      else{
        console.log('Ignoring file (not audio/pdf):', item.name);
      }
    }
  }
}


// Pick directory (SDK 54 recommended API)
export const pickAudioFolder = async () => {
  try {
    // Defensive: ensure Directory API exists
    if (typeof Directory === 'undefined' || !Directory.pickDirectoryAsync) {
      console.warn('Directory API not available in this runtime (likely Expo Go).');
      return null;
    }

    // On iOS Directory.pickDirectoryAsync will grant temporary access for the session.
    // On Android this is the preferred way to get a content-uri backed Directory.
    console.log('📁 Opening directory picker...');
    const directory = await Directory.pickDirectoryAsync();

    if (!directory) {
      console.log('User cancelled directory selection or no directory returned.');
      return null;
    }

    // directory is a Directory instance. Save its uri string for later.
    const uri = directory.uri ?? directory.toString?.() ?? String(directory);
    await saveAudioFolderPath(uri);
    await saveURIItem(directory)

    return uri;
  } catch (error) {
    console.error('❌ Error picking folder:', error);
    return null;
  }
};

export const loadAudioById = async (audioId) => {
  try {
    const audioURI = await getAudioUri(audioId);
    console.log('Loaded audio URI for ID', audioId, ':', audioURI);
    return audioURI; 
  } catch (error) {
    console.error('❌ Error loading audio:', error);
    return null;
  }
};


export const getPDFUri = async (audioID) => {
  try {
    const audioUris = await getPDFUris();
    return audioUris[audioID] || null;
  } catch (error) {
    return null;
  }
}

export const loadPDFById = async (pdfId) => {
  try {
    const pdfURI = await getPDFUri(pdfId);
    console.log('Loaded PDF URI for ID', pdfId, ':', pdfURI);

    // spot to cache the uri into app cache
    const cachePath = `${FileSystem.cacheDirectory}pdf_${pdfId}.pdf`;
    await FileSystem.copyAsync({
      from: pdfURI,
      to: cachePath,
    });
    return cachePath;

  } catch (error) {
    console.error('❌ Error loading PDF:', error);
    return null;
  }
};
