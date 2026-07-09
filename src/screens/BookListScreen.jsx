// src/screens/BookListScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { useTheme, useThemedStyles } from '../theme';
import { ScreenScrollView, Card, Surface, SectionHeader } from '../components/ui';

export default function BookListScreen({ route, navigation }) {
  const { level } = route.params;
  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const handleBookPress = async (book) => {
    navigation.navigate('ReadBook', {
      book,
      title: book.title,
    });
  };

  return (
    <ScreenScrollView>
      {/* Level header */}
      <Card gradient style={styles.headerCard} contentStyle={styles.headerContent}>
        <Text style={styles.levelLabel}>{level.title}</Text>
        <Text style={styles.levelDescription}>{level.description}</Text>
      </Card>

      <View style={styles.booksSection}>
        <SectionHeader title="Books" />

        {level.books.map((book) => (
          <Card
            key={book.id}
            gradient
            onPress={() => handleBookPress(book)}
            elevation="sm"
            style={styles.bookCard}
            contentStyle={styles.bookContent}
          >
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
            </View>

            <Surface
              gradient={gradients.play}
              elevation={false}
              radius={12}
              style={styles.bookIcon}
              innerStyle={styles.bookIconInner}
            >
              <Feather name="book-open" size={20} color={colors.onGradient} />
            </Surface>
          </Card>
        ))}
      </View>
    </ScreenScrollView>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    headerCard: {
      marginBottom: spacing.xl,
      borderRadius: radii.lg,
    },
    headerContent: {
      padding: spacing.lg,
    },
    levelLabel: {
      ...typography.textStyles.overline,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    levelDescription: {
      ...typography.textStyles.cardTitle,
      color: colors.text,
    },

    booksSection: {
      marginBottom: spacing.lg,
    },
    bookCard: {
      marginBottom: spacing.md,
    },
    bookContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.base,
      gap: spacing.md,
    },
    bookInfo: {
      flex: 1,
    },
    bookTitle: {
      fontFamily: typography.fonts.semibold,
      fontSize: typography.fontSizes.base,
      color: colors.text,
      marginBottom: spacing.xs,
      lineHeight: 20,
    },
    bookAuthor: {
      ...typography.textStyles.caption,
      fontSize: typography.fontSizes.caption,
      color: colors.textMuted,
    },
    bookIcon: {
      width: 44,
      height: 44,
    },
    bookIconInner: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
