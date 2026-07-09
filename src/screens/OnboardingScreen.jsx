import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';

import { pickAudioFolder, isAudioFolderConfigured, setOnboardingCompleted } from '../utils/storage';
import { useTheme, useThemedStyles } from '../theme';
import { Surface, GradientButton } from '../components/ui';
import { CrossIcon, FlameIcon, NotesEmptyIcon } from '../components/icons';

const { width, height } = Dimensions.get('window');

const ICON_SIZE = 52;

const slides = [
  {
    id: '1',
    title: 'Welcome to the Audio Bible',
    description:
      "God's Lighthouse brings you the dramatised English Standard Version, read from Genesis to Revelation.",
    renderIcon: (color) => <Feather name="book-open" size={ICON_SIZE} color={color} />,
  },
  {
    id: '2',
    title: 'Old and New Testament',
    description:
      'All 66 books, 1,189 chapters. Start anywhere, and the next chapter plays automatically.',
    renderIcon: (color) => <CrossIcon size={ICON_SIZE} color={color} />,
  },
  {
    id: '3',
    title: 'Build a Daily Streak',
    description:
      'Finish a chapter each day to grow your streak. Every chapter you complete is counted, so you can see what you have heard and how often.',
    renderIcon: (color) => <FlameIcon size={ICON_SIZE} color={color} />,
  },
  {
    id: '4',
    title: 'Take Notes',
    description:
      'Capture insights and revelations as you listen. Your notes are saved for each chapter.',
    renderIcon: (color) => <NotesEmptyIcon size={ICON_SIZE} color={color} />,
  },
  {
    id: '5',
    title: 'Offline Audio',
    description: 'All audio is stored on your memory card. No internet required!',
    renderIcon: (color) => <Feather name="smartphone" size={ICON_SIZE} color={color} />,
  },
  {
    id: '6',
    title: 'Select Audio Folder',
    description: 'Point the app to your audio folder.',
    renderIcon: (color) => <Feather name="folder" size={ICON_SIZE} color={color} />,
    isSetup: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [folderSelected, setFolderSelected] = useState(false);
  const flatListRef = useRef(null);

  const { colors, gradients, scheme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      handleComplete();
    }
  };

  // ============================================
  // FOLDER SELECTION HANDLER
  // ============================================
  const handleSelectFolder = async () => {
    try {
      setIsSelecting(true);

      // Open folder picker
      const folderPath = await pickAudioFolder();

      if (!folderPath) {
        Alert.alert('No Folder Selected', 'Please select a folder to continue.');
        setIsSelecting(false);
        return;
      }

      // Success!
      setFolderSelected(true);
      Alert.alert('Folder Selected', 'You can now access all audio messages offline.', [
        { text: 'Continue', onPress: handleNext },
      ]);
    } catch (error) {
      console.error('Error selecting folder:', error);
      Alert.alert('Error', 'Could not access the folder. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleComplete = async () => {
    // Check if folder is configured
    const configured = await isAudioFolderConfigured();

    if (!configured) {
      Alert.alert('Audio Folder Required', 'Please select the audio folder before continuing.', [
        { text: 'OK' },
      ]);
      return;
    }

    await setOnboardingCompleted();
    navigation.replace('Home');
  };

  const renderIconCircle = (slide) => (
    <Surface
      gradient={gradients.play}
      elevation="lg"
      radius={60}
      style={styles.iconCircle}
      innerStyle={styles.iconCircleInner}
    >
      {slide.renderIcon(colors.onGradient)}
    </Surface>
  );

  const renderItem = ({ item }) => {
    if (item.isSetup) {
      // Special setup slide with folder selection
      return (
        <View style={styles.slide}>
          {renderIconCircle(item)}
          <Text style={styles.title}>{item.title}</Text>

          {/* Folder Selection Button */}
          <GradientButton
            title={folderSelected ? 'Folder Selected' : 'Select Audio Folder'}
            onPress={handleSelectFolder}
            loading={isSelecting}
            gradient={folderSelected ? 'success' : 'play'}
            size="md"
            fullWidth={false}
            style={styles.selectFolderButton}
            icon={
              <Feather
                name={folderSelected ? 'check-circle' : 'folder'}
                size={20}
                color={colors.onPrimary}
              />
            }
          />

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <View style={styles.instructionsHeader}>
              <Feather name="list" size={16} color={colors.primary} />
              <Text style={styles.instructionsTitle}>Instructions</Text>
            </View>
            <Text style={styles.instructionsText}>1. Tap &quot;Select Audio Folder&quot;</Text>
            <Text style={styles.instructionsText}>2. Navigate to the GLH_Audio folder</Text>
            <Text style={styles.instructionsText}>3. Select the SELECT ME file</Text>
          </View>
        </View>
      );
    }

    // Regular slide
    return (
      <View style={styles.slide}>
        {renderIconCircle(item)}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Onboarding hides the gradient header, so the bar must follow the scheme. */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={!isSelecting}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[styles.dot, currentIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {isLastSlide ? (
          <GradientButton
            title="Get Started"
            onPress={handleComplete}
            disabled={!folderSelected || isSelecting}
          />
        ) : (
          <GradientButton title="Next" onPress={handleNext} disabled={isSelecting} />
        )}
      </View>
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    slide: {
      width,
      height: height * 0.75,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xxxl,
    },
    iconCircle: {
      width: 120,
      height: 120,
      marginBottom: spacing.xxl,
    },
    iconCircleInner: {
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.textStyles.displayTitle,
      fontSize: 28,
      lineHeight: 34,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.base,
    },
    description: {
      ...typography.textStyles.body,
      fontSize: typography.fontSizes.md,
      lineHeight: 24,
      color: colors.textMuted,
      textAlign: 'center',
    },

    selectFolderButton: {
      marginTop: spacing.sm,
    },

    instructionsBox: {
      marginTop: spacing.xl,
      alignSelf: 'stretch',
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.md,
      padding: spacing.base,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    instructionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    instructionsTitle: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.body,
      color: colors.text,
    },
    instructionsText: {
      ...typography.textStyles.caption,
      color: colors.textMuted,
      marginBottom: 2,
    },

    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.borderStrong,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },

    buttonContainer: {
      paddingHorizontal: spacing.xxxl,
      paddingBottom: spacing.xxxl,
    },
  });
