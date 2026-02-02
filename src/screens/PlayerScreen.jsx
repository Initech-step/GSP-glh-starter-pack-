// src/screens/PlayerScreen.js - Using React Native Audio Pro via AudioContext
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { useApp } from '../contexts/AppContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { loadAudioById } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { level, weekNumber, audio } = route.params;

  // ============================================
  // GET AUDIO CONTEXT
  // All playback state and controls come from Context
  // Context now uses React Native Audio Pro under the hood
  // ============================================
  const {
    currentAudio,
    isPlaying,
    position,
    duration,
    isLoaded,
    isLoading,
    loadAudio,
    play,
    pause,
    seekTo,
    seekForward,
    seekBackward,
    isAudioLoaded,
    releaseAudio
  } = useAudio();

  const { 
    markAudioCompleted,
    getNextAudio
  } = useApp();

  // ============================================
  // LOCAL STATE
  // ============================================
  const [audioPath, setAudioPath] = useState(null);
  
  // Dragging state for progress bar
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const progressBarWidth = width - 40; // Account for padding

  // ============================================
  // LOAD AUDIO PATH ON MOUNT
  // First, resolve the audio file path from storage
  // ============================================
  useEffect(() => {
    let mounted = true;

    const loadPath = async () => {
      try {
        const path = await loadAudioById(audio.id);
        if (mounted) {
          console.log('📂 Audio path loaded:', path);
          setAudioPath(path);
        }
      } catch (error) {
        console.error('❌ Error loading audio path:', error);
        if (mounted) {
          Alert.alert(
            'Error',
            'Failed to load audio file. Please try again.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    };

    loadPath();
    return () => {
      mounted = false;
    };
  }, [audio.id]);

  // ============================================
  // LOAD AUDIO INTO PLAYER
  // Once we have the path, load it into AudioContext
  // AudioContext will handle restoring saved position
  // ============================================
  useEffect(() => {
    if (!audioPath) return;

    const setup = async () => {
      // Only load if this audio isn't already loaded
      if (!isAudioLoaded(audio.id)) {
        console.log('🎵 Loading audio into player:', audio.title);
        await loadAudio(audioPath, audio);
      } else {
        console.log('✅ Audio already loaded:', audio.title);
      }
    };

    setup();
  }, [audioPath]);

  // ============================================
  // MONITOR COMPLETION (95% THRESHOLD)
  // Track when user reaches 95% to mark as completed
  // Show completion dialog at 98%
  // ============================================
  useEffect(() => {
    if (!isLoaded || !duration || duration === 0) return;

    const progressPercentage = (position / duration) * 100;
    console.log(progressPercentage);
    
    if (progressPercentage >= 99.9) {
      console.log("AUDIO COMPLETED!");
      
      // ✅ Create an async function inside useEffect
      const handleCompletion = async () => {
        try {
          await markAudioCompleted(audio.id);
          console.log('✅ Audio marked as completed:', audio.id);
          releaseAudio();

          // ✅ Get next audio
          // const nextAudio = getNextAudio();
          
          // if (nextAudio != null) {
          //   // ✅ Destructure the returned object correctly
          //   navigation.replace('Player', {
          //     level: nextAudio.level,           // Not audio.level
          //     weekNumber: nextAudio.week,       // Not audio.week, it's 'week'
          //     audio: nextAudio.audio,           // This is the actual audio object
          //   });
          // } else {
          //   // No more audios - go back or show completion message
          //   Alert.alert(
          //     '🎉 Congratulations!',
          //     'You have completed all available content!',
          //     [
          //       {
          //         text: 'OK',
          //         onPress: () => navigation.navigate('Home')
          //       }
          //     ]
          //   );
          // }
          
        } catch (error) {
          console.error('❌ Error marking audio as completed:', error);
        }
      };
      
      // ✅ Call the async function
      handleCompletion();
    }
  }, [position, duration]);

  // ============================================
  // PLAYBACK CONTROLS
  // ============================================

  const togglePlayPause = () => {
    if (!isAudioLoaded(audio.id)) {
      Alert.alert(
        'Audio Changed',
        'Another audio is currently loaded. Load this audio first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Use the new seekBackward method from AudioContext
  const handleBackward = () => {
    if (!isAudioLoaded(audio.id)) return;
    seekBackward(30); // 30 seconds backward
  };

  // Use the new seekForward method from AudioContext
  const handleForward = () => {
    if (!isAudioLoaded(audio.id)) return;
    seekForward(30); // 30 seconds forward
  };

  // ============================================
  // TIME FORMATTING HELPER
  // ============================================
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };


  // Determine if controls should be disabled
  const controlsDisabled = !isLoaded || isLoading;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ============================================
            AUDIO INFO CARD
            ============================================ */}
        <View style={styles.infoCard}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Week {weekNumber}
            </Text>
          </View>
          
          <Text style={styles.audioTitle}>{audio.title}</Text>
          
          {audio.date && (
            <Text style={styles.audioDate}>{audio.date}</Text>
          )}
          
          {/* Active Indicator - shows when this audio is loaded */}
          {isAudioLoaded(audio.id) && (
            <View style={styles.activeIndicator}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active Audio</Text>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <MaterialIcons name="downloading" size={16} color="#360f5a" />
              <Text style={styles.loadingText}>Loading audio...</Text>
            </View>
          )}

          
        </View>

        {/* ============================================
            ALBUM ART PLACEHOLDER
            ============================================ */}
        <View style={styles.albumArt}>
          <Text style={styles.albumArtEmoji}>🎧</Text>
        </View>

        {/* ============================================
            PLAYBACK CONTROLS
            ============================================ */}
        <View style={styles.controls}>
          {/* Backward 30s Button */}
          <TouchableOpacity
            onPress={handleBackward}
            disabled={controlsDisabled}
            style={styles.controlButton}
          >
            <MaterialIcons
              name="replay-30"
              size={32}
              color={controlsDisabled ? '#CBD5E1' : '#360f5a'}
            />
            <Text style={[
              styles.controlLabel,
              controlsDisabled && styles.controlLabelDisabled
            ]}>
              -30s
            </Text>
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={togglePlayPause}
            disabled={controlsDisabled}
            style={[
              styles.playButton,
              controlsDisabled && styles.playButtonDisabled
            ]}
          >
            {isLoading ? (
              <MaterialIcons name="downloading" size={40} color="#fff" />
            ) : isPlaying ? (
              <FontAwesome name="pause" size={40} color="#ffff" />
            ) : (
              <FontAwesome name="play" size={40} color="#ffff" />
            )}
          </TouchableOpacity>

          {/* Forward 30s Button */}
          <TouchableOpacity
            onPress={handleForward}
            disabled={controlsDisabled}
            style={styles.controlButton}
          >
            <MaterialIcons
              name="forward-30"
              size={32}
              color={controlsDisabled ? '#CBD5E1' : '#360f5a'}
            />
            <Text style={[
              styles.controlLabel,
              controlsDisabled && styles.controlLabelDisabled
            ]}>
              +30s
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================
            INFO BOX
            ============================================ */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => navigation.navigate('Notes', { audioId: audio.id })}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notes" size={24} color="#360f5a" />
            <Text style={styles.notesButtonText}>Take Notes</Text>
          </TouchableOpacity>
        </View>
       
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelBadge: {
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#360f5a',
    fontWeight: 'bold',
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 28,
  },
  audioDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  activeText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#360f5a',
    fontWeight: '600',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 6,
  },
  completionText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    alignSelf: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  albumArtEmoji: {
    fontSize: 80,
  },
  progressSection: {
    marginBottom: 32,
  },
  progressBarContainer: {
    paddingVertical: 10,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#360f5a',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#360f5a',
    top: -7,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  progressThumbActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -9,
    marginLeft: -12,
    backgroundColor: '#5b21b6',
    shadowOpacity: 0.4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#360f5a',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  controlLabelDisabled: {
    color: '#CBD5E1',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#360f5a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#360f5a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0.1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#360f5a',
    lineHeight: 18,
  },
  debugBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#360f5a',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#360f5a',
    marginBottom: 12,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  debugLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  debugValue: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'monospace',
  },
});

