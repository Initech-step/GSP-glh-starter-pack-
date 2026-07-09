import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';

import { useApp } from '../contexts/AppContext';
import { formatListenedLabel } from '../utils/listenTracking';
import { useTheme, useThemedStyles } from '../theme';
import {
  Screen,
  Card,
  HeroBanner,
  Badge,
  NumberChip,
  SectionHeader,
  EmptyState,
} from '../components/ui';

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function BookChapters({ route, navigation }) {
  const { book, testament } = route.params;
  // book = { id, name, audios: [{ id, title, duration, date, filePath, ... }] }
  const { listenCounts, updateCurrentPosition } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const audios = book.audios ?? [];

  const handleAudioPress = async (audio) => {
    // Records the chapter as "current" so Home's Continue card can resume it.
    await updateCurrentPosition(testament?.key, null, audio.id);

    navigation.navigate('Player', {
      level: testament?.key,
      weekNumber: null,
      audio,
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HeroBanner
          label={testament?.name ?? 'Bible'}
          title={book.name}
          badge={
            <Badge
              variant="solid"
              label={`${audios.length} ${audios.length === 1 ? 'Chapter' : 'Chapters'}`}
              icon={<Feather name="list" size={13} />}
            />
          }
        />

        <View style={styles.listSection}>
          <SectionHeader title="Chapters" />

          {audios.length === 0 && (
            <EmptyState
              icon={<Feather name="inbox" size={40} color={colors.borderStrong} />}
              title="No chapters available"
            />
          )}

          {audios.map((audio, index) => {
            const listenedLabel = formatListenedLabel(listenCounts[audio.id]);

            return (
              <Card
                key={audio.id}
                index={index}
                gradient
                onPress={() => handleAudioPress(audio)}
                elevation="sm"
                style={styles.chapterCard}
                contentStyle={styles.chapterContent}
              >
                <NumberChip label={String(index + 1)} />

                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterTitle}>Chapter {index + 1}</Text>
                  {audio.duration ? (
                    <View style={styles.metaRow}>
                      <Feather name="clock" size={11} color={colors.textFaint} />
                      <Text style={styles.metaText}>{formatDuration(audio.duration)}</Text>
                      {audio.size ? (
                        <>
                          <Text style={styles.metaDot}>·</Text>
                          <Text style={styles.metaText}>{audio.size}</Text>
                        </>
                      ) : null}
                    </View>
                  ) : null}
                  {listenedLabel ? (
                    <View style={styles.listenedRow}>
                      <Feather name="check-circle" size={11} color={colors.primary} />
                      <Text style={styles.listenedText}>{listenedLabel}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.playBtn}>
                  <Feather name="play" size={14} color={colors.primary} />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: 48,
    },
    listSection: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
    },
    chapterCard: {
      marginBottom: spacing.sm + 2,
    },
    chapterContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 14,
    },
    chapterInfo: {
      flex: 1,
    },
    chapterTitle: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    listenedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    listenedText: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.caption,
      color: colors.primary,
    },
    metaText: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.caption,
      color: colors.textFaint,
    },
    metaDot: {
      fontSize: typography.fontSizes.caption,
      color: colors.borderStrong,
    },
    playBtn: {
      width: 36,
      height: 36,
      borderRadius: radii.sm + 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryTint,
    },
  });
