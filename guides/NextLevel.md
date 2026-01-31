# Implementation Guide: Bug Fixes & New Features

## Overview
This guide walks you through fixing bugs and implementing new features for your listening app step by step.

---

## 🐛 BUG FIX 1: Time and Progress Tracking - Mark Audio as Completed

### Problem
When an audio is completed (reaches 95-98%), it's not being saved to the progress storage.

### Root Cause
In `PlayerScreen.jsx`, the `handleAudioCompletion()` function shows an alert but never calls the AppContext's `markAudioCompleted()` function.

### Solution Steps

#### Step 1: Import missing function in PlayerScreen.jsx

**Location:** `PlayerScreen.jsx` - Line 14

**Current code:**
```javascript
import { useAudio } from '../contexts/AudioContext';
```

**Add this import:**
```javascript
import { useApp } from '../contexts/AppContext';
```

#### Step 2: Get the markAudioCompleted function from AppContext

**Location:** `PlayerScreen.jsx` - After line 44 (after the useAudio() hook)

**Add this code:**
```javascript
  // Get completion function from AppContext
  const { markAudioCompleted } = useApp();
```

#### Step 3: Update handleAudioCompletion function

**Location:** `PlayerScreen.jsx` - Replace lines 140-183

**Replace with:**
```javascript
  const handleAudioCompletion = async () => {
    setCompletionNotified(true);
    
    // Pause the audio
    pause();
    
    // ✅ SAVE COMPLETION TO STORAGE
    try {
      await markAudioCompleted(audio.id);
      console.log('✅ Audio marked as completed:', audio.id);
    } catch (error) {
      console.error('❌ Error marking audio as completed:', error);
    }
    
    // Show completion dialog with options
    Alert.alert(
      '🎉 Message Completed!',
      `You've finished "${audio.title}"\n\nWhat would you like to do next?`,
      [
        {
          text: 'Take Notes',
          onPress: () => {
            navigation.navigate('Notes', { audioId: audio.id });
          }
        },
        {
          text: 'Replay',
          onPress: () => {
            seekTo(0);
            setHasReached95Percent(false);
            setCompletionNotified(false);
            play();
          }
        },
        {
          text: 'Next Message',
          onPress: () => {
            // TODO: Navigate to next audio in sequence
            console.log('Navigate to next message');
          }
        },
        {
          text: 'Done',
          style: 'cancel',
          onPress: () => {
            navigation.goBack();
          }
        }
      ],
      { cancelable: true }
    );
  };
```

---

## 🐛 BUG FIX 2: Notes - Add Notes Icon to Player Screen

### Problem
1. Notes can be added but not retrieved
2. No quick way to access notes from the player screen

### Solution Steps

#### Step 1: Fix the saveNote function in storage.js

**Location:** `storage.js` - Lines 85-96

**Current code (has a bug):**
```javascript
export const saveNote = async (audioId, noteText) => {
  try {
    const notes = await getNotes();
    notes[audioId] = {
      text: noteText,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify());  // ❌ BUG: missing notes parameter
  } catch (error) {
    console.error('Error saving note:', error);
  }
};
```

**Fix to:**
```javascript
export const saveNote = async (audioId, noteText) => {
  try {
    const notes = await getNotes();
    notes[audioId] = {
      text: noteText,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));  // ✅ FIXED: added notes parameter
  } catch (error) {
    console.error('Error saving note:', error);
  }
};
```

#### Step 2: Add Notes Button to Player Screen

**Location:** `PlayerScreen.jsx` - After line 463 (in the info box section)

**Add this code:**
```javascript
        {/* Notes Button */}
        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => navigation.navigate('Notes', { audioId: audio.id })}
          activeOpacity={0.7}
        >
          <MaterialIcons name="notes" size={24} color="#360f5a" />
          <Text style={styles.notesButtonText}>Take Notes</Text>
        </TouchableOpacity>
```

#### Step 3: Add styles for the notes button

**Location:** `PlayerScreen.jsx` - Add to styles object (after line 732)

**Add these styles:**
```javascript
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  notesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#360f5a',
  },
```

---

## 🚀 FEATURE 3: Upload and Recovery of Progress

This involves creating backend APIs and frontend functions to sync progress to the cloud.

### Backend Implementation (app.py)

#### Step 1: Install required dependencies

**Run this command:**
```bash
pip install fastapi uvicorn pymongo python-multipart bcrypt python-jose[cryptography] passlib
```

#### Step 2: Create database utilities

**Create a new file:** `utils/database.py`

```python
from pymongo import MongoClient
import os

def connect_to_db():
    # Replace with your MongoDB connection string
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(MONGO_URI)
    return client["glh_audio_app"]
```

#### Step 3: Create Pydantic models

**Location:** `app.py` - Add after imports

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 30  # 30 days

# Models
class UserRegister(BaseModel):
    phone_or_email: str
    password: str

class UserLogin(BaseModel):
    phone_or_email: str
    password: str

class ProgressData(BaseModel):
    user_identifier: str  # phone or email
    progress: Dict[str, Any]  # The entire progress object
    current_level: str
    current_week: int
    current_audio: Optional[str] = None
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class NoteData(BaseModel):
    user_identifier: str
    audio_id: str
    note_text: str
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class NotesBackup(BaseModel):
    user_identifier: str
    notes: Dict[str, Any]  # All notes
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

#### Step 4: Implement Authentication APIs

**Location:** `app.py` - Replace the "Mini User Auth APIS" section

```python
"""
User Auth APIS
"""

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    """Register a new user with phone/email and password"""
    users_collection = database["users_collection"]
    
    # Check if user already exists
    existing_user = users_collection.find_one({"phone_or_email": user.phone_or_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone/email already exists"
        )
    
    # Hash password and save user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "phone_or_email": user.phone_or_email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    try:
        result = users_collection.insert_one(user_data)
        # Create access token
        access_token = create_access_token(data={"sub": user.phone_or_email})
        
        return {
            "status": True,
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@app.post("/api/auth/login")
def login_user(user: UserLogin):
    """Login user and return access token"""
    users_collection = database["users_collection"]
    
    # Find user
    db_user = users_collection.find_one({"phone_or_email": user.phone_or_email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.phone_or_email})
    
    return {
        "status": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user_identifier": user.phone_or_email
    }
```

#### Step 5: Implement Progress Sync APIs

**Location:** `app.py` - Replace "User Progress APIS" section

```python
"""
User Progress APIS
"""

@app.post("/api/progress/upload", status_code=status.HTTP_200_OK)
def upload_progress(progress_data: ProgressData):
    """Upload user's local progress to cloud"""
    progress_collection = database["progress_collection"]
    
    try:
        # Upsert (update if exists, insert if not)
        progress_collection.update_one(
            {"user_identifier": progress_data.user_identifier},
            {
                "$set": {
                    "progress": progress_data.progress,
                    "current_level": progress_data.current_level,
                    "current_week": progress_data.current_week,
                    "current_audio": progress_data.current_audio,
                    "updated_at": progress_data.updated_at
                }
            },
            upsert=True
        )
        
        return {
            "status": True,
            "message": "Progress uploaded successfully"
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload progress"
        )

@app.get("/api/progress/download/{user_identifier}")
def download_progress(user_identifier: str):
    """Download user's progress from cloud"""
    progress_collection = database["progress_collection"]
    
    try:
        progress_data = progress_collection.find_one(
            {"user_identifier": user_identifier},
            {"_id": 0}  # Exclude MongoDB ID
        )
        
        if not progress_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No progress found for this user"
            )
        
        return {
            "status": True,
            "data": progress_data
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download progress"
        )
```

#### Step 6: Implement Notes Backup APIs

**Location:** `app.py` - Replace "Notes APIS" section

```python
"""
Notes Backup APIS
"""

@app.post("/api/notes/backup", status_code=status.HTTP_200_OK)
def backup_notes(notes_data: NotesBackup):
    """Backup all user notes to cloud"""
    notes_collection = database["notes_collection"]
    
    try:
        # Upsert notes
        notes_collection.update_one(
            {"user_identifier": notes_data.user_identifier},
            {
                "$set": {
                    "notes": notes_data.notes,
                    "updated_at": notes_data.updated_at
                }
            },
            upsert=True
        )
        
        return {
            "status": True,
            "message": "Notes backed up successfully"
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to backup notes"
        )

@app.get("/api/notes/retrieve/{user_identifier}")
def retrieve_notes(user_identifier: str):
    """Retrieve user's notes from cloud"""
    notes_collection = database["notes_collection"]
    
    try:
        notes_data = notes_collection.find_one(
            {"user_identifier": user_identifier},
            {"_id": 0}  # Exclude MongoDB ID
        )
        
        if not notes_data:
            return {
                "status": True,
                "data": {
                    "notes": {},
                    "message": "No notes found"
                }
            }
        
        return {
            "status": True,
            "data": notes_data
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notes"
        )
```

#### Step 7: Run the backend

**Create a requirements.txt file:**
```txt
fastapi
uvicorn[standard]
pymongo
python-multipart
bcrypt
python-jose[cryptography]
passlib
```

**Run the server:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Implementation

#### Step 8: Create API service

**Create a new file:** `utils/api.js`

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-server-url:8000/api';  // Change this to your server URL

// Storage keys for auth
const AUTH_TOKEN_KEY = '@glh_auth_token';
const USER_IDENTIFIER_KEY = '@glh_user_identifier';

/**
 * Save auth token and user identifier
 */
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

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to download progress');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Download progress error:', error);
    return { success: false, error: error.message };
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to retrieve notes');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Retrieve notes error:', error);
    return { success: false, error: error.message };
  }
};
```

#### Step 9: Add sync functions to SettingsScreen.jsx

**Location:** `SettingsScreen.jsx` - Add after imports

```javascript
import {
  isLoggedIn,
  uploadProgress,
  downloadProgress,
  backupNotes,
  retrieveNotes,
} from '../utils/api';
import {
  getProgress,
  getNotes,
  saveProgress,
  saveNote,
  getCurrentPosition,
} from '../utils/storage';
```

**Add these functions inside SettingsScreen component (after line 73):**

```javascript
  const handleUploadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert('Not Logged In', 'Please login first to upload progress');
      // TODO: Navigate to login screen
      return;
    }

    Alert.alert(
      'Upload Progress',
      'Upload your local progress to the cloud?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload',
          onPress: async () => {
            try {
              const progress = await getProgress();
              const position = await getCurrentPosition();

              const result = await uploadProgress(
                progress,
                position.level,
                position.weekNumber,
                position.audioId
              );

              if (result.success) {
                Alert.alert('Success', 'Progress uploaded successfully!');
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to upload progress');
            }
          },
        },
      ]
    );
  };

  const handleDownloadProgress = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert('Not Logged In', 'Please login first to download progress');
      // TODO: Navigate to login screen
      return;
    }

    Alert.alert(
      'Download Progress',
      'Download progress from cloud? This will overwrite your local progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await downloadProgress();

              if (result.success) {
                const { progress, current_level, current_week, current_audio } = result.data;

                // Save to local storage
                for (const [audioId, audioProgress] of Object.entries(progress)) {
                  await saveProgress(
                    audioId,
                    audioProgress.completed,
                    audioProgress.position
                  );
                }

                // Refresh the app
                await refreshProgress();

                Alert.alert('Success', 'Progress downloaded and synced!');
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to download progress');
            }
          },
        },
      ]
    );
  };

  const handleBackupNotes = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert('Not Logged In', 'Please login first to backup notes');
      return;
    }

    try {
      const notes = await getNotes();
      const result = await backupNotes(notes);

      if (result.success) {
        Alert.alert('Success', 'Notes backed up successfully!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to backup notes');
    }
  };

  const handleRestoreNotes = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert('Not Logged In', 'Please login first to restore notes');
      return;
    }

    Alert.alert(
      'Restore Notes',
      'Restore notes from cloud? This will overwrite your local notes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await retrieveNotes();

              if (result.success && result.data.notes) {
                const notes = result.data.notes;

                // Save each note locally
                for (const [audioId, noteData] of Object.entries(notes)) {
                  await saveNote(audioId, noteData.text);
                }

                Alert.alert('Success', 'Notes restored successfully!');
              } else {
                Alert.alert('Info', 'No notes found in cloud');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restore notes');
            }
          },
        },
      ]
    );
  };
```

**Add buttons to the settings sections array (after line 103):**

```javascript
    {
      title: 'Cloud Sync',
      items: [
        {
          label: 'Upload Progress',
          type: 'button',
          onPress: handleUploadProgress,
          icon: '☁️',
          description: 'Backup your progress to the cloud',
        },
        {
          label: 'Download Progress',
          type: 'button',
          onPress: handleDownloadProgress,
          icon: '⬇️',
          description: 'Restore progress from cloud',
        },
        {
          label: 'Backup Notes',
          type: 'button',
          onPress: handleBackupNotes,
          icon: '📝',
          description: 'Backup your notes to the cloud',
        },
        {
          label: 'Restore Notes',
          type: 'button',
          onPress: handleRestoreNotes,
          icon: '📥',
          description: 'Restore notes from cloud',
        },
      ],
    },
```

---

## 🚀 FEATURE 4: Active Listening (Keep Playing Button)

This feature pauses the audio every 30 minutes (configurable) and requires users to click "Keep Playing" to continue.

### Implementation Steps

#### Step 1: Add Active Listening state to AudioContext.js

**Location:** `AudioContext.js` - Add after line 39 (after the state declarations)

```javascript
  // Active Listening state
  const [activeListenTimer, setActiveListenTimer] = useState(null);
  const [showKeepPlayingPrompt, setShowKeepPlayingPrompt] = useState(false);
  const activeListenDuration = 30 * 60; // 30 minutes in seconds
```

#### Step 2: Add Active Listening functions to AudioContext.js

**Location:** `AudioContext.js` - Add before the loadAudio function (around line 280)

```javascript
  // ============================================
  // ACTIVE LISTENING MANAGEMENT
  // ============================================
  
  const startActiveListenTimer = () => {
    // Clear any existing timer
    if (activeListenTimer) {
      clearTimeout(activeListenTimer);
    }

    // Set new timer for 30 minutes
    const timerId = setTimeout(() => {
      console.log('⏰ Active listen timer expired - prompting user');
      handleActiveListenTimeout();
    }, activeListenDuration * 1000);

    setActiveListenTimer(timerId);
    console.log('⏰ Active listen timer started (30 minutes)');
  };

  const stopActiveListenTimer = () => {
    if (activeListenTimer) {
      clearTimeout(activeListenTimer);
      setActiveListenTimer(null);
      console.log('⏰ Active listen timer stopped');
    }
  };

  const resetActiveListenTimer = () => {
    console.log('⏰ Active listen timer reset');
    stopActiveListenTimer();
    startActiveListenTimer();
  };

  const handleActiveListenTimeout = () => {
    // Pause the audio
    try {
      AudioPro.pause();
      setShowKeepPlayingPrompt(true);
      console.log('⏸️ Audio paused - waiting for user confirmation');
    } catch (error) {
      console.error('❌ Error pausing for active listen:', error);
    }
  };

  const handleKeepPlaying = () => {
    setShowKeepPlayingPrompt(false);
    resetActiveListenTimer();
    play();
    console.log('▶️ User confirmed active listening - resuming');
  };

  const handleStopListening = () => {
    setShowKeepPlayingPrompt(false);
    stopActiveListenTimer();
    pause();
    // Save progress
    saveProgress();
    console.log('⏹️ User stopped active listening');
  };
```

#### Step 3: Integrate Active Listening with playback controls

**Location:** `AudioContext.js` - Modify the play() function (around line 394)

**Replace the play function with:**

```javascript
  const play = () => {
    try {
      AudioPro.resume();
      // Start active listen timer when playing
      if (!activeListenTimer) {
        startActiveListenTimer();
      }
      console.log('▶️ Resuming playback');
    } catch (error) {
      console.error('❌ Error playing:', error);
    }
  };
```

**Modify the pause function (around line 403):**

```javascript
  const pause = () => {
    try {
      AudioPro.pause();
      // Stop active listen timer when pausing
      stopActiveListenTimer();
      console.log('⏸️ Paused audio');
      // Save progress when pausing
      saveProgress();
    } catch (error) {
      console.error('❌ Error pausing:', error);
    }
  };
```

#### Step 4: Add cleanup for Active Listening timer

**Location:** `AudioContext.js` - Modify the releaseAudio function (around line 443)

**Add this line after saveProgress() call:**

```javascript
      // Stop active listen timer
      stopActiveListenTimer();
```

#### Step 5: Export Active Listening functions from AudioContext

**Location:** `AudioContext.js` - Update the value object (around line 473)

**Add these to the value object:**

```javascript
    // Active Listening
    showKeepPlayingPrompt,
    handleKeepPlaying,
    handleStopListening,
    resetActiveListenTimer,
```

#### Step 6: Add Keep Playing Modal to PlayerScreen.jsx

**Location:** `PlayerScreen.jsx` - Add after imports

```javascript
import { Modal } from 'react-native';
```

**Get the Active Listening functions from AudioContext:**

**Location:** `PlayerScreen.jsx` - Update useAudio() call (around line 30-44)

**Add these to the destructured variables:**

```javascript
    showKeepPlayingPrompt,
    handleKeepPlaying,
    handleStopListening,
```

**Add the Keep Playing Modal to the UI:**

**Location:** `PlayerScreen.jsx` - Add before the closing </View> tag of the container (before line 517)

```javascript
      {/* Active Listening Modal */}
      <Modal
        visible={showKeepPlayingPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏰ Still Listening?</Text>
            <Text style={styles.modalText}>
              You've been listening for 30 minutes.{'\n'}
              Are you still actively listening?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleStopListening}
              >
                <Text style={styles.modalButtonSecondaryText}>Stop</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleKeepPlaying}
              >
                <Text style={styles.modalButtonPrimaryText}>Keep Playing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
```

#### Step 7: Add Modal styles to PlayerScreen.jsx

**Location:** `PlayerScreen.jsx` - Add to styles object (after line 762)

```javascript
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width - 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#360f5a',
  },
  modalButtonSecondary: {
    backgroundColor: '#E2E8F0',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonSecondaryText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
```

---

## 📝 Summary of Changes

### Files Modified:
1. **PlayerScreen.jsx** - Added completion tracking, notes button, active listening modal
2. **storage.js** - Fixed notes bug
3. **AudioContext.js** - Added active listening timer logic
4. **SettingsScreen.jsx** - Added cloud sync buttons
5. **app.py** - Added all backend APIs
6. **utils/api.js** - Created (new file) for API calls
7. **utils/database.py** - Created (new file) for MongoDB connection

### APIs Created:
1. POST `/api/auth/register` - Register user
2. POST `/api/auth/login` - Login user
3. POST `/api/progress/upload` - Upload progress
4. GET `/api/progress/download/{user_identifier}` - Download progress
5. POST `/api/notes/backup` - Backup notes
6. GET `/api/notes/retrieve/{user_identifier}` - Retrieve notes

### Features Added:
1. ✅ Audio completion tracking
2. ✅ Notes button in player screen
3. ✅ Fixed notes storage bug
4. ✅ Cloud sync for progress
5. ✅ Cloud backup for notes
6. ✅ Active listening (30-minute timer)

---

## 🚀 Next Steps

1. **Test all changes locally** - Test each feature individually
2. **Set up MongoDB** - Install and configure MongoDB for your backend
3. **Update API_BASE_URL** - Change the URL in `utils/api.js` to your server's address
4. **Create Login/Register Screens** - Build UI screens for authentication
5. **Test cloud sync** - Register a user and test uploading/downloading progress
6. **Adjust active listening timer** - Change `activeListenDuration` if needed

Let me know if you need clarification on any step!