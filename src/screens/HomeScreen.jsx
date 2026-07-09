// src/screens/HomeScreen.js
import React, { useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { useApp } from '../contexts/AppContext';
import { book_curriculum } from '../data/curriculum';
import { getAudioMetadataById } from '../utils/audioSequenceService';
import { useCountUp } from '../utils/useCountUp';
import { useTheme, useThemedStyles } from '../theme';
import { ScreenScrollView, Card, Surface, Scrim, SectionHeader } from '../components/ui';
import { ScrollIcon, CrossIcon, BookLevelIcon, FlameIcon } from '../components/icons';

const BIBLE_TESTAMENTS = [
  {
    key: 'old_testament',
    name: 'Old Testament',
    Icon: ScrollIcon,
    description: 'English Standard Version (ESV)',
  },
  {
    key: 'new_testament',
    name: 'New Testament',
    Icon: CrossIcon,
    description: 'English Standard Version (ESV)',
  },
];

const BOOK_LEVELS = [
  { key: 'beginner', level: 'beginner' },
  { key: 'intermediate', level: 'intermediate' },
  { key: 'advanced', level: 'advanced' },
];

const TESTAMENT_BACKGROUND_IMAGES = {
  old_testament: require('../../assets/old_testament.jpg'),
  new_testament: require('../../assets/new_testament.jpg'),
};

/** Gradient tile holding an identity icon — the visual anchor of every list row. */
function IconChip({ children }) {
  const styles = useThemedStyles(makeStyles);
  const { gradients } = useTheme();

  return (
    <Surface gradient={gradients.play} elevation={false} style={styles.chip} radius={14}>
      <View style={styles.chipInner}>{children}</View>
    </Surface>
  );
}

export default function HomeScreen({ navigation }) {
  const { currentAudioId, currentStreak, loading } = useApp();
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notes')}
            hitSlop={12}
            accessibilityLabel="My Notes"
          >
            <Feather name="edit-3" size={22} color={colors.headerTint} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            hitSlop={12}
            accessibilityLabel="Settings"
          >
            <Feather name="settings" size={22} color={colors.headerTint} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, styles, colors]);

  // The Continue card resolves its label from the audio id, since Bible
  // chapters carry no level/week.
  const currentChapter = useMemo(
    () => (currentAudioId ? getAudioMetadataById(currentAudioId) : null),
    [currentAudioId]
  );
  const continueCardBackground = currentChapter
    ? TESTAMENT_BACKGROUND_IMAGES[currentChapter.testament]
    : null;

  const handleContinue = () => {
    if (!currentChapter) return;

    navigation.navigate('Player', {
      level: currentChapter.testament,
      weekNumber: null,
      audio: currentChapter,
    });
  };

  const handleTestamentPress = (testament) => {
    navigation.navigate('TestamentBooks', { testament, title: testament.name });
  };

  const handleBookLevelPress = (levelData) => {
    navigation.navigate('BooksByLevel', { level: levelData, title: levelData.title });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const streakActive = currentStreak > 0;
  const displayedStreak = useCountUp(currentStreak);

  return (
    <ScreenScrollView>
      {/* Daily streak */}
      <Card gradient elevation="md" style={styles.streakCard} contentStyle={styles.streakContent}>
        <FlameIcon
          size={36}
          gradient={streakActive ? gradients.accent : undefined}
          color={colors.borderStrong}
        />
        <View style={styles.streakInfo}>
          <Text style={styles.streakCount}>{displayedStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <Text style={styles.streakHint}>
          {streakActive
            ? 'Finish a chapter today to keep it going.'
            : 'Finish a chapter to start your streak.'}
        </Text>
      </Card>

      {/* Continue Section */}
      {currentChapter && (
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.85} style={styles.continueWrap}>
          <Surface
            gradient={gradients.hero}
            gradientOpacity={continueCardBackground ? 0.85 : 1}
            elevation="lg"
            behind={
              continueCardBackground ? (
                <ImageBackground
                  source={continueCardBackground}
                  style={StyleSheet.absoluteFill}
                  imageStyle={styles.continueImage}
                />
              ) : null
            }
            overlay={continueCardBackground ? <Scrim strength={0.5} /> : null}
          >
            <View style={styles.continueContent}>
              <View style={styles.continueHeader}>
                <Text style={styles.continueLabel}>CONTINUE LISTENING</Text>
                <Feather name="play-circle" size={30} color={colors.onGradient} />
              </View>
              <Text style={styles.continueLevel}>{currentChapter.bookName}</Text>
              <Text style={styles.continueWeek}>
                Chapter {currentChapter.chapterNumber} · {currentChapter.testamentName}
              </Text>
            </View>
          </Surface>
        </TouchableOpacity>
      )}

      {/* AUDIO BIBLE DRAMATISED */}
      <View style={styles.section}>
        <SectionHeader title="Audio Bible Dramatised" />

        {BIBLE_TESTAMENTS.map(({ key, name, description, Icon }) => (
          <Card
            key={key}
            gradient
            onPress={() => handleTestamentPress({ key, name, description })}
            style={styles.levelCard}
            contentStyle={styles.levelContent}
          >
            <IconChip>
              <Icon size={26} color={colors.onGradient} />
            </IconChip>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{name}</Text>
              <Text style={styles.levelDescription}>{description}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textFaint} />
          </Card>
        ))}
      </View>

      {/* Spiritual Books */}
      <View style={styles.section}>
        <SectionHeader title="Recommended Books" />

        {BOOK_LEVELS.map((item) => {
          const levelData = book_curriculum[item.key];

          return (
            <Card
              key={item.key}
              gradient
              onPress={() => handleBookLevelPress(levelData)}
              style={styles.levelCard}
              contentStyle={styles.levelContent}
            >
              <IconChip>
                <BookLevelIcon size={26} color={colors.onGradient} level={item.level} />
              </IconChip>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{levelData.title}</Text>
                <Text style={styles.levelDescription}>{levelData.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textFaint} />
            </Card>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
    },

    chip: {
      width: 48,
      height: 48,
    },
    chipInner: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },

    streakCard: {
      marginBottom: spacing.xl,
      borderRadius: radii.lg,
    },
    streakContent: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    streakInfo: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginLeft: spacing.md,
      gap: spacing.xs + 2,
    },
    streakCount: {
      fontFamily: typography.fonts.display,
      fontSize: typography.fontSizes.giant,
      color: colors.text,
    },
    streakLabel: {
      ...typography.textStyles.label,
      color: colors.textMuted,
    },
    streakHint: {
      flexBasis: '100%',
      marginTop: spacing.sm + 2,
      ...typography.textStyles.caption,
      color: colors.textFaint,
    },

    continueWrap: {
      marginBottom: spacing.xl,
    },
    continueImage: {
      opacity: 0.35,
      resizeMode: 'cover',
    },
    continueContent: {
      padding: spacing.lg,
    },
    continueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    continueLabel: {
      ...typography.textStyles.overline,
      color: colors.onGradientMuted,
    },
    continueLevel: {
      ...typography.textStyles.bookTitle,
      color: colors.onGradient,
      marginBottom: spacing.xs,
    },
    continueWeek: {
      ...typography.textStyles.body,
      fontSize: typography.fontSizes.md,
      color: colors.onGradientMuted,
    },

    section: {
      marginBottom: spacing.xl,
    },
    levelCard: {
      marginBottom: spacing.md,
    },
    levelContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      gap: spacing.md,
    },
    levelInfo: {
      flex: 1,
    },
    levelTitle: {
      ...typography.textStyles.cardTitle,
      color: colors.text,
      marginBottom: 2,
    },
    levelDescription: {
      ...typography.textStyles.caption,
      color: colors.textMuted,
    },
  });
