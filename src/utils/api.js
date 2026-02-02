import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'https://gsp-server-gr8z.vercel.app/api';

const AUTH_TOKEN_KEY = '@glh_auth_token';
const USER_IDENTIFIER_KEY = '@glh_user_identifier';
const KEYS = {
  PROGRESS: '@glh_progress',
  CURRENT_LEVEL: '@glh_current_level',
  CURRENT_WEEK: '@glh_current_week',
  CURRENT_AUDIO: '@glh_current_audio',
  PLAYBACK_POSITION: '@glh_playback_position',
  NOTES: '@glh_notes',
  ONBOARDING_COMPLETED: '@glh_onboarding',
  AUDIO_FOLDER_KEY: '@glh_audio_folder_path',
  AUDIO_URI: '@glh_audio_uri',
  PDF_URI: '@glh_pdf_uri'
};

export const saveAuthData = async (token, userIdentifier) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_IDENTIFIER_KEY, userIdentifier);
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

/**
 * Get auth token
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get user identifier
 */
export const getUserIdentifier = async () => {
  try {
    return await AsyncStorage.getItem(USER_IDENTIFIER_KEY);
  } catch (error) {
    console.error('Error getting user identifier:', error);
    return null;
  }
};

/**
 * Clear auth data (logout)
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_IDENTIFIER_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  const token = await getAuthToken();
  return token !== null;
};

/**
 * Register new user
 */
export const registerUser = async (phoneOrEmail, password) => {
  try {
    console.log(`reg fired with ${phoneOrEmail} and ${password}`)
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_or_email: phoneOrEmail,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed');
    }

    // Save auth data
    await saveAuthData(data.access_token, phoneOrEmail);

    return { success: true, data };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login user
 */
export const loginUser = async (phoneOrEmail, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_or_email: phoneOrEmail,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    // Save auth data
    await saveAuthData(data.access_token, data.user_identifier);

    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Replace current position (used when downloading from cloud)
 */
export const replaceCurrentPosition = async (level, weekNumber, audioId) => {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_LEVEL, level);
    await AsyncStorage.setItem(KEYS.CURRENT_WEEK, weekNumber.toString());
    if (audioId) {
      await AsyncStorage.setItem(KEYS.CURRENT_AUDIO, audioId);
    }
    console.log('✅ Current position replaced:', { level, weekNumber, audioId });
    return true;
  } catch (error) {
    console.error('Error replacing current position:', error);
    return false;
  }
};

/**
 * Upload progress to cloud
 */
export const uploadProgress = async (progressData, currentLevel, currentWeek, currentAudio) => {
  try {
    const userIdentifier = await getUserIdentifier();
    if (!userIdentifier) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/progress/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_identifier: userIdentifier,
        progress: progressData,
        current_level: currentLevel,
        current_week: currentWeek,
        current_audio: currentAudio,
        updated_at: new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to upload progress');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Upload progress error:', error);
    return { success: false, error: error.message };
  }
};

/* replace local function */
export const replaceAllProgress = async (progressData) => {
  try {
    // Directly replace the entire progress object
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressData));
    console.log('✅ All progress replaced with cloud data');
    return true;
  } catch (error) {
    console.error('Error replacing progress:', error);
    return false;
  }
};


/**
 * Download progress from cloud
 */
export const downloadProgress = async () => {
  try {
    const userIdentifier = await getUserIdentifier();
    if (!userIdentifier) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/progress/download/${userIdentifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    const { 
      progress,
      current_level, 
      current_week, 
      current_audio 
    } = data.data;

    // ✅ REPLACE entire progress (not merge)
    const progressReplaced = await replaceAllProgress(progress);
    
    // ✅ REPLACE current position
    const positionReplaced = await replaceCurrentPosition(
      current_level,
      current_week,
      current_audio
    );

    return { 
      success: true, 
      message: 'Progress and position replaced successfully' 
    };
  } catch (error) {
    console.error('Download progress error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Replace all notes data (used when downloading from cloud)
 * This completely overwrites local notes instead of merging
 */
export const replaceAllNotes = async (notesData) => {
  try {
    // Directly replace the entire notes object
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notesData));
    console.log('✅ All notes replaced with cloud data');
    return true;
  } catch (error) {
    console.error('Error replacing notes:', error);
    return false;
  }
};

/**
 * Backup notes to cloud
 */
export const backupNotes = async (notesData) => {
  try {
    const userIdentifier = await getUserIdentifier();
    if (!userIdentifier) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/notes/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_identifier: userIdentifier,
        notes: notesData,
        updated_at: new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to backup notes');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Backup notes error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Retrieve notes from cloud
 */
export const retrieveNotes = async () => {
  try {
    const userIdentifier = await getUserIdentifier();
    if (!userIdentifier) {
      throw new Error('User not logged in');
    }

    const response = await fetch(`${API_BASE_URL}/notes/retrieve/${userIdentifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to retrieve notes');
    }
    const data = await response.json();
    const cloudNotes = data.data.notes;

    // ✅ REPLACE entire notes object (not merge)
    const notesReplaced = await replaceAllNotes(cloudNotes);
    return { success: true, message: 'Notes replaced successfully' };
    
  } catch (error) {
    console.error('Retrieve notes error:', error);
    return { success: false, error: error.message };
  }
};

