import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useMemo } from 'react';
import Feather from '@expo/vector-icons/Feather';

import { bible_curriculum } from '../data/curriculum';
import { getTestamentConfig } from '../data/testamentConfig';
import { useApp } from '../contexts/AppContext';
import { computeBookListenCount, formatListenedLabel } from '../utils/listenTracking';
import { useTheme, useThemedStyles } from '../theme';
import { Screen, Card, HeroBanner, Badge, NumberChip, SectionHeader } from '../components/ui';

export default function TestamentBooks({ route, navigation }) {
  const { testament } = route.params;
  const { listenCounts } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const config = getTestamentConfig(testament.key, testament.name);
  const books = bible_curriculum[testament.key]?.books ?? [];

  // Recomputed only when counts change. computeBookListenCount early-breaks at
  // the first unheard chapter, so most books cost a single lookup.
  const bookListenCounts = useMemo(() => {
    const result = {};
    for (const book of books) {
      result[book.id] = computeBookListenCount(book, listenCounts);
    }
    return result;
  }, [books, listenCounts]);

  const handleBookPress = (book) => {
    navigation.navigate('BookChapters', { book, testament });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HeroBanner
          label={config.label}
          title={testament.name}
          subtitle={testament.description}
          backgroundImage={config.backgroundImage}
          badge={
            <Badge
              variant="solid"
              label={`${books.length} Books`}
              icon={<Feather name="book-open" size={13} />}
            />
          }
        />

        <View style={styles.booksSection}>
          <SectionHeader title="Select a Book" />

          {books.map((book, index) => {
            const listenedLabel = formatListenedLabel(bookListenCounts[book.id]);

            return (
              <Card
                key={book.id}
                index={index}
                gradient
                onPress={() => handleBookPress(book)}
                elevation="sm"
                style={styles.bookCard}
                contentStyle={styles.bookContent}
              >
                <NumberChip label={String(index + 1).padStart(2, '0')} />

                <View style={styles.bookInfo}>
                  <Text style={styles.bookName}>{book.name}</Text>
                  <View style={styles.bookMeta}>
                    <Feather name="headphones" size={12} color={colors.textFaint} />
                    <Text style={styles.bookMetaText}>
                      {book.audios?.length ?? 0}{' '}
                      {(book.audios?.length ?? 0) === 1 ? 'chapter' : 'chapters'}
                    </Text>
                    {listenedLabel ? (
                      <>
                        <Text style={styles.bookMetaDot}>·</Text>
                        <Feather name="check-circle" size={12} color={colors.primary} />
                        <Text style={styles.bookListenedText}>{listenedLabel}</Text>
                      </>
                    ) : null}
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <Feather name="chevron-right" size={18} color={colors.primary} />
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
    booksSection: {
      paddingHorizontal: spacing.lg,
      marginTop: 28,
    },
    bookCard: {
      marginBottom: spacing.sm + 2,
    },
    bookContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 14,
    },
    bookInfo: {
      flex: 1,
    },
    bookName: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    bookMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    bookMetaText: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.caption,
      color: colors.textFaint,
    },
    bookMetaDot: {
      fontSize: typography.fontSizes.caption,
      color: colors.borderStrong,
      marginHorizontal: 2,
    },
    bookListenedText: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.caption,
      color: colors.primary,
    },
    arrowContainer: {
      width: 32,
      height: 32,
      borderRadius: radii.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primaryTint,
    },
  });
