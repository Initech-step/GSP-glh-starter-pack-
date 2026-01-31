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
  } = useAudio();

  // ============================================
  // LOCAL STATE
  // ============================================
  const [audioPath, setAudioPath] = useState(null);
  
  // Completion tracking state
  const [hasReached95Percent, setHasReached95Percent] = useState(false);
  const [completionNotified, setCompletionNotified] = useState(false);
  
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
    
    // Check if reached 95% (completion threshold)
    if (progressPercentage >= 95 && !hasReached95Percent) {
      console.log('🎯 User reached 95% of audio');
      setHasReached95Percent(true);
    }
    
    // Check if completed (98% to be safe)
    if (progressPercentage >= 98 && hasReached95Percent && !completionNotified) {
      console.log('✅ Audio completed!');
      handleAudioCompletion();
    }
  }, [position, duration, hasReached95Percent, completionNotified]);

  // ============================================
  // HANDLE AUDIO COMPLETION
  // Called when user reaches 98% of audio
  // ============================================
  const handleAudioCompletion = () => {
    setCompletionNotified(true);
    
    // Pause the audio
    pause();
    
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

  // ============================================
  // PAN RESPONDER FOR DRAGGABLE PROGRESS BAR
  // Allows user to drag the progress thumb to seek
  // ============================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        // User started touching the progress bar
        setIsDragging(true);
        
        // Calculate initial position from touch
        const touchX = evt.nativeEvent.locationX;
        const newPosition = Math.max(0, Math.min(touchX, progressBarWidth));
        setDragPosition(newPosition);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // User is dragging - update drag position
        const newPosition = Math.max(0, Math.min(gestureState.moveX - 20, progressBarWidth));
        setDragPosition(newPosition);
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // User released finger - seek to new position
        setIsDragging(false);
        
        if (!duration) return;
        
        // Calculate percentage based on drag position
        const touchX = Math.max(0, Math.min(gestureState.moveX - 20, progressBarWidth));
        const percentage = touchX / progressBarWidth;
        
        // Calculate new time in seconds
        const newTime = percentage * duration;
        
        console.log(`⏩ Seeking to ${newTime.toFixed(2)}s (${(percentage * 100).toFixed(1)}%)`);
        
        // Seek to new position using AudioContext
        seekTo(newTime);
      },
    })
  ).current;

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

  // ============================================
  // CALCULATE PROGRESS
  // Shows either actual progress or drag preview
  // ============================================
  const progressPercentage = duration > 0 ? ((position || 0) / duration) * 100 : 0;
  const displayPercentage = isDragging 
    ? (dragPosition / progressBarWidth) * 100 
    : progressPercentage;

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

          {/* Completion Badge - shows when user reaches 95% */}
          {hasReached95Percent && (
            <View style={styles.completionBadge}>
              <FontAwesome name="check-circle" size={14} color="#22c55e" />
              <Text style={styles.completionText}>Completed</Text>
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
            PROGRESS SECTION
            ============================================ */}
        <View style={styles.progressSection}>
          {/* Progress Bar */}
          <View 
            style={styles.progressBarContainer}
            {...panResponder.panHandlers}
          >
            <View style={styles.progressBar}>
              {/* Progress Fill */}
              <View 
                style={[
                  styles.progressFill,
                  { width: `${displayPercentage}%` }
                ]}
              />
              {/* Progress Thumb */}
              <View
                style={[
                  styles.progressThumb,
                  isDragging && styles.progressThumbActive,
                  { left: `${displayPercentage}%` }
                ]}
              />
            </View>
          </View>

          {/* Time Display */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatTime(isDragging ? (dragPosition / progressBarWidth) * duration : position)}
            </Text>
            <Text style={styles.progressText}>
              {displayPercentage.toFixed(1)}%
            </Text>
            <Text style={styles.timeText}>
              {formatTime(duration)}
            </Text>
          </View>
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
              <AntDesign name="pause" size={32} color="#fff" />
            ) : (
              <AntDesign name="caretright" size={32} color="#fff" />
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
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={24} color="#360f5a" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Background Playback Active:</Text>
              {'\n'}
              Navigate away and your audio will continue playing in the background
              with lock screen controls.
            </Text>
          </View>
        </View>

        {/* ============================================
            DEBUG INFO
            Useful for development - remove in production
            ============================================ */}
        {__DEV__ && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>Debug Status:</Text>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Progress:</Text>
              <Text style={styles.debugValue}>
                {progressPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Completed:</Text>
              <Text style={styles.debugValue}>
                {hasReached95Percent ? '✅ Yes' : '❌ Not yet'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Playing:</Text>
              <Text style={styles.debugValue}>
                {isPlaying ? '▶️ Yes' : '⏸️ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Loaded:</Text>
              <Text style={styles.debugValue}>
                {isLoaded ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Loading:</Text>
              <Text style={styles.debugValue}>
                {isLoading ? '⏳ Yes' : '✅ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Dragging:</Text>
              <Text style={styles.debugValue}>
                {isDragging ? '👆 Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.debugRow}>
              <Text style={styles.debugLabel}>Position:</Text>
              <Text style={styles.debugValue}>
                {position.toFixed(2)}s / {duration.toFixed(2)}s
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
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

