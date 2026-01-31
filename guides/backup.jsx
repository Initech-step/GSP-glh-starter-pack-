// src/screens/PlayerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { useApp } from '../contexts/AppContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  savePlaybackPosition,
  getPlaybackPosition,
  saveProgress,
} from '../utils/storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ route, navigation }) {
  const { level, weekNumber, audio } = route.params;
  const { markAudioCompleted, getNextAudio, updateCurrentPosition } = useApp();
  
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const positionUpdateInterval = useRef(null);

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [audio.id]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Get saved position
      const savedPosition = await getPlaybackPosition(audio.id);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioPath,
        {
          shouldPlay: false,
          positionMillis: savedPosition,
          rate: playbackSpeed,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      // Auto-save position every 5 seconds
      if (status.isPlaying && status.positionMillis % 5000 < 100) {
        savePlaybackPosition(audio.id, status.positionMillis);
      }

      // Check if audio finished
      if (status.didJustFinish) {
        handleAudioComplete();
      }
    }
  };

  const handleAudioComplete = async () => {
    await markAudioCompleted(audio.id);
    await savePlaybackPosition(audio.id, 0);
    
    Alert.alert(
      'Message Completed! ',
      'Would you like to continue to the next message?',
      [
        {
          text: 'Take Notes',
          onPress: () => navigation.navigate('Notes', { audioId: audio.id }),
        },
        {
          text: 'Next Message',
          onPress: playNextAudio,
        },
        {
          text: 'Later',
          style: 'cancel',
        },
      ]
    );
  };

  const playNextAudio = () => {
    const nextAudio = getNextAudio();
    if (nextAudio) {
      navigation.replace('Player', {
        level: nextAudio.level,
        weekNumber: nextAudio.week,
        audio: nextAudio.audio,
      });
    } else {
      Alert.alert(
        'Congratulations! 🎉',
        "You've completed all available messages!",
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(position + 15000, duration);
    await sound.setPositionAsync(newPosition);
  };

  const skipBackward = async () => {
    if (!sound) return;
    const newPosition = Math.max(position - 15000, 0);
    await sound.setPositionAsync(newPosition);
  };

  const changeSpeed = async () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    setPlaybackSpeed(nextSpeed);
    
    if (sound) {
      await sound.setRateAsync(nextSpeed, true);
    }
  };

  const seekToPosition = async (value) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const openNotes = () => {
    navigation.navigate('Notes', { audioId: audio.id });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#360f5a" />
        <Text style={styles.loadingText}>Loading audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Audio Info */}
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
        </View>

        {/* Album Art Placeholder */}
        <View style={styles.albumArt}>
          <Text style={styles.albumArtEmoji}>🎵</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(position / duration) * 100}%` }
              ]} 
            />
            <TouchableOpacity
              style={[
                styles.progressThumb,
                { left: `${(position / duration) * 100}%` }
              ]}
              onPressIn={() => {
                // You can add drag functionality here
              }}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={skipBackward}
          >
            <AntDesign style={styles.controlIcon} name="backward" size={50} color="#360f5a" />
            <Text style={styles.controlLabel}>15s</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <Text style={styles.playIcon}>
              {isPlaying ? <FontAwesome name="pause" size={50} color="#ffff" /> : <FontAwesome name="play" size={50} color="#ffff" />}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={skipForward}
          >
            <AntDesign style={styles.controlIcon} name="forward" size={50} color="#360f5a" />
            <Text style={styles.controlLabel}>15s</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={changeSpeed}
          >
            <Text style={styles.secondaryButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={openNotes}
          >
            <MaterialIcons style={styles.secondaryButtonEmoji} name="notes" size={24} color="#360f5a" />
            <Text style={styles.secondaryButtonText}>Notes</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={playNextAudio}
          >
            <Text style={styles.secondaryButtonEmoji}>⏭️</Text>
            <Text style={styles.secondaryButtonText}>Next</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
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
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#360f5a',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#360f5a',
    top: -6,
    marginLeft: -8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlIcon: {
    fontSize: 28,
  },
  controlLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
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
  playIcon: {
    fontSize: 32,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
});
