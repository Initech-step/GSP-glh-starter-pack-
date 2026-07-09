// src/screens/PlayerScreen.js - Using React Native Audio Pro via AudioContext
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAudio } from '../contexts/AudioContext';
import { useApp } from '../contexts/AppContext';
import { loadAudioById } from '../utils/storage';
import { getAudioMetadataById, getPlaylistInfo } from '../utils/audioSequenceService';
import { useTheme, useThemedStyles } from '../theme';
import { Screen, Card, Surface, Badge, GradientIconButton } from '../components/ui';
import { HeadphonesIcon } from '../components/icons';

const { width, height } = Dimensions.get('window');
const albumArtSize = Math.max(165, Math.min(width * 0.64, height * 0.23, 230));

/** Pill in the utility row; fills with the play gradient when toggled on. */
function UtilityPill({ active, disabled, onPress, icon, label }) {
  const { colors, gradients, radii } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const tint = disabled ? colors.disabled : active ? colors.onGradient : colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={styles.utilityWrap}
    >
      <Surface
        gradient={active && !disabled ? gradients.play : undefined}
        backgroundColor={colors.surface}
        elevation={false}
        radius={radii.md}
        innerStyle={[styles.utilityInner, !active && styles.utilityBordered]}
      >
        <View style={styles.utilityContent}>
          {React.cloneElement(icon, { color: tint })}
          <Text style={[styles.utilityText, { color: tint }]}>{label}</Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

export default function PlayerScreen({ route, navigation }) {
  const { audio } = route.params;
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

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
    seekForward,
    seekBackward,
    repeatCurrentChapterEnabled,
    setRepeatCurrentChapterEnabled,
    skipToNextChapter,
    skipToPreviousChapter,
    isAudioLoaded,
    setPlaybackRate,
  } = useAudio();

  const { markAudioCompleted } = useApp();

  const activeAudio = currentAudio?.metadata ?? currentAudio ?? audio;
  const activeAudioId = activeAudio?.id ?? audio.id;
  // Chapter titles are raw filenames in the data, so resolve book/chapter here.
  const chapter = useMemo(() => getAudioMetadataById(activeAudioId), [activeAudioId]);
  const playlistInfo = useMemo(() => getPlaylistInfo(activeAudioId), [activeAudioId]);
  const hasPreviousChapter = playlistInfo.hasPrevious;
  const hasNextChapter = playlistInfo.hasNext;

  // ============================================
  // LOCAL STATE
  // ============================================
  const [audioPath, setAudioPath] = useState(null);

  // PLAYBACK STATE
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const completionHandledRef = useRef(null);
  const lastLoadedRouteAudioRef = useRef(null);

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
          setAudioPath(path);
        }
      } catch (error) {
        if (mounted) {
          Alert.alert('Error', 'Failed to load audio file. Please try again.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }
    };

    loadPath();

    return () => {
      mounted = false;
    };
  }, [audio.id, navigation]);

  useEffect(() => {
    setPlaybackSpeed(1.0);
    setPlaybackRate(1.0);
  }, [audio.id]);

  // ============================================
  // LOAD AUDIO INTO PLAYER
  // Once we have the path, load it into AudioContext
  // AudioContext will handle restoring saved position
  // ============================================
  useEffect(() => {
    if (!audioPath) return;

    const setup = async () => {
      if (lastLoadedRouteAudioRef.current === audio.id) {
        return;
      }

      const alreadyLoaded = currentAudio?.id === audio.id;

      // Only load if this audio isn't already loaded
      if (!alreadyLoaded) {
        await loadAudio(audioPath, audio);
      }

      lastLoadedRouteAudioRef.current = audio.id;
    };

    setup();
  }, [audio.id, audioPath]);

  // ============================================
  // MONITOR COMPLETION
  // Sets the `completed` flag (which cloud sync carries) when playback reaches
  // the end while this screen is mounted. It deliberately does NOT increment
  // the listen count or the streak — audioSetup's TRACK_ENDED handler owns
  // that, because it also fires with the screen off.
  // ============================================
  useEffect(() => {
    completionHandledRef.current = null;
  }, [activeAudioId]);

  useEffect(() => {
    if (!isLoaded || !duration || duration === 0) return;

    const progressPercentage = (position / duration) * 100;

    if (progressPercentage >= 99.999 && completionHandledRef.current !== activeAudioId) {
      completionHandledRef.current = activeAudioId;

      const handleCompletion = async () => {
        try {
          await markAudioCompleted(activeAudioId);
        } catch (error) {
          console.error('Error marking audio as completed:', error);
        }
      };

      handleCompletion();
    }
  }, [activeAudioId, duration, isLoaded, markAudioCompleted, position]);

  // ============================================
  // PLAYBACK CONTROLS
  // ============================================

  const togglePlayPause = () => {
    if (!isAudioLoaded(activeAudioId)) {
      Alert.alert('Audio Changed', 'Another audio is currently loaded. Load this audio first.', [
        { text: 'OK' },
      ]);
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
    if (!isAudioLoaded(activeAudioId)) return;
    seekBackward(30); // 30 seconds backward
  };

  const handleSpeedChange = async (speed) => {
    setPlaybackSpeed(speed);
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    await AsyncStorage.setItem('@preferred_speed', speed.toString());
  };

  // Predefined speed options
  const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '1.75x', value: 1.75 },
    { label: '2x', value: 2.0 },
  ];

  // Use the new seekForward method from AudioContext
  const handleForward = () => {
    if (!isAudioLoaded(activeAudioId)) return;
    seekForward(30); // 30 seconds forward
  };

  const handleRepeatToggle = async () => {
    await setRepeatCurrentChapterEnabled(!repeatCurrentChapterEnabled);
  };

  const handleNextChapter = async () => {
    if (!isAudioLoaded(activeAudioId) || !hasNextChapter) return;
    await skipToNextChapter();
  };

  const handlePreviousChapter = async () => {
    if (!isAudioLoaded(activeAudioId) || !hasPreviousChapter) return;
    await skipToPreviousChapter();
  };

  // use on mount to restore the saved rate
  useEffect(() => {
    const loadSpeedPreference = async () => {
      const saved = await AsyncStorage.getItem('@preferred_speed');
      if (saved) {
        const speed = parseFloat(saved);
        setPlaybackSpeed(speed);
        setPlaybackRate(speed);
      }
    };
    loadSpeedPreference();
  }, []);

  // Determine if controls should be disabled
  const controlsDisabled = !isLoaded || isLoading;
  const prevDisabled = controlsDisabled || !hasPreviousChapter;
  const nextDisabled = controlsDisabled || !hasNextChapter;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AUDIO INFO CARD */}
        <Card gradient style={styles.infoCard} contentStyle={styles.infoContent}>
          {chapter && <Badge label={chapter.testamentName.toUpperCase()} />}

          <Text style={styles.audioTitle}>
            {chapter
              ? `${chapter.bookName} · Chapter ${chapter.chapterNumber}`
              : activeAudio?.title ?? audio.title}
          </Text>

          {activeAudio?.date && <Text style={styles.audioDate}>{activeAudio.date}</Text>}

          {/* Active Indicator - shows when this audio is loaded */}
          {isAudioLoaded(activeAudioId) && (
            <View style={styles.activeIndicator}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active Audio</Text>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.activeIndicator}>
              <Feather name="download-cloud" size={16} color={colors.primary} />
              <Text style={styles.loadingText}>Loading audio...</Text>
            </View>
          )}
        </Card>

        {/* ALBUM ART */}
        <Surface
          gradient={gradients.hero}
          elevation="lg"
          radius={20}
          style={styles.albumArt}
          innerStyle={styles.albumArtInner}
        >
          <HeadphonesIcon size={albumArtSize * 0.42} color={colors.onGradient} />
        </Surface>

        {/* PLAYBACK CONTROLS */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePreviousChapter}
            disabled={prevDisabled}
            style={[styles.chapterNavButton, prevDisabled && styles.chapterNavButtonDisabled]}
          >
            <Feather
              name="skip-back"
              size={18}
              color={prevDisabled ? colors.disabled : colors.primary}
            />
          </TouchableOpacity>

          {/* Backward 30s Button */}
          <TouchableOpacity
            onPress={handleBackward}
            disabled={controlsDisabled}
            style={styles.controlButton}
          >
            <Feather
              name="rotate-ccw"
              size={24}
              color={controlsDisabled ? colors.disabled : colors.primary}
            />
            <Text style={[styles.controlLabel, controlsDisabled && styles.controlLabelDisabled]}>
              -30s
            </Text>
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <GradientIconButton
            onPress={togglePlayPause}
            disabled={controlsDisabled}
            size={80}
            pulsing={isPlaying && !controlsDisabled}
          >
            <Feather
              name={isLoading ? 'download-cloud' : isPlaying ? 'pause' : 'play'}
              size={34}
              color={colors.onGradient}
            />
          </GradientIconButton>

          {/* Forward 30s Button */}
          <TouchableOpacity
            onPress={handleForward}
            disabled={controlsDisabled}
            style={styles.controlButton}
          >
            <Feather
              name="rotate-cw"
              size={24}
              color={controlsDisabled ? colors.disabled : colors.primary}
            />
            <Text style={[styles.controlLabel, controlsDisabled && styles.controlLabelDisabled]}>
              +30s
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextChapter}
            disabled={nextDisabled}
            style={[styles.chapterNavButton, nextDisabled && styles.chapterNavButtonDisabled]}
          >
            <Feather
              name="skip-forward"
              size={18}
              color={nextDisabled ? colors.disabled : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.utilityRow}>
          <UtilityPill
            active={repeatCurrentChapterEnabled}
            disabled={controlsDisabled}
            onPress={handleRepeatToggle}
            icon={<Feather name="repeat" size={20} />}
            label="Repeat One"
          />
          <UtilityPill
            active={false}
            disabled={controlsDisabled}
            onPress={() => setShowSpeedMenu(true)}
            icon={<Feather name="fast-forward" size={20} />}
            label={`${playbackSpeed}x Speed`}
          />
        </View>

        {/* NOTES */}
        <Card
          onPress={() => navigation.navigate('Notes', { audioId: activeAudioId })}
          elevation="sm"
          contentStyle={styles.notesContent}
        >
          <Feather name="edit-3" size={20} color={colors.primary} />
          <Text style={styles.notesButtonText}>Take Notes</Text>
        </Card>

        {/* SPEED SELECTION MODAL */}
        <Modal
          visible={showSpeedMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSpeedMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSpeedMenu(false)}
          >
            <View style={styles.speedModalContent}>
              <View style={styles.speedModalHeader}>
                <Text style={styles.speedModalTitle}>Playback Speed</Text>
                <TouchableOpacity onPress={() => setShowSpeedMenu(false)} hitSlop={12}>
                  <Feather name="x" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.speedOptionsContainer}>
                {speedOptions.map((option) => {
                  const selected = playbackSpeed === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.speedOption, selected && styles.speedOptionActive]}
                      onPress={() => handleSpeedChange(option.value)}
                    >
                      <Text
                        style={[styles.speedOptionText, selected && styles.speedOptionTextActive]}
                      >
                        {option.label}
                      </Text>
                      {selected && <Feather name="check" size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.speedHintRow}>
                <Feather name="zap" size={14} color={colors.textFaint} />
                <Text style={styles.speedHint}>
                  Increase speed to listen faster, or decrease for better comprehension
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = ({ colors, typography, spacing, radii, shadows }) =>
  StyleSheet.create({
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },

    /* Info card */
    infoCard: {
      marginBottom: spacing.xl,
    },
    infoContent: {
      padding: spacing.lg,
    },
    audioTitle: {
      ...typography.textStyles.displayTitle,
      color: colors.text,
      marginTop: spacing.md,
    },
    audioDate: {
      ...typography.textStyles.caption,
      color: colors.textMuted,
      marginTop: spacing.xs,
    },
    activeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    activeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    activeText: {
      ...typography.textStyles.caption,
      color: colors.success,
    },
    loadingText: {
      ...typography.textStyles.caption,
      color: colors.primary,
    },

    /* Album art */
    albumArt: {
      width: albumArtSize,
      height: albumArtSize,
      alignSelf: 'center',
      marginBottom: spacing.xl,
    },
    albumArtInner: {
      width: albumArtSize,
      height: albumArtSize,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Controls */
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    },
    chapterNavButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chapterNavButtonDisabled: {
      opacity: 0.5,
    },
    controlButton: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    controlLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.micro,
      color: colors.primary,
    },
    controlLabelDisabled: {
      color: colors.disabled,
    },

    /* Utility row */
    utilityRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.base,
    },
    utilityWrap: {
      flex: 1,
    },
    utilityInner: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    utilityBordered: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    utilityContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 14,
    },
    utilityText: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.body,
    },

    /* Notes */
    notesContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 14,
    },
    notesButtonText: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.md,
      color: colors.primary,
    },

    /* Speed modal */
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: 'flex-end',
    },
    speedModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
      ...shadows.lg,
    },
    speedModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.base,
    },
    speedModalTitle: {
      ...typography.textStyles.sectionTitle,
      color: colors.text,
    },
    speedOptionsContainer: {
      gap: spacing.sm,
    },
    speedOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: spacing.base,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: colors.bg,
    },
    speedOptionActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    speedOptionText: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.md,
      color: colors.text,
    },
    speedOptionTextActive: {
      fontFamily: typography.fonts.bold,
      color: colors.primary,
    },
    speedHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.base,
    },
    speedHint: {
      flex: 1,
      ...typography.textStyles.caption,
      color: colors.textFaint,
    },
  });
