import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { useTheme, useThemedStyles } from '../../theme';

/** Replaces the per-screen `sectionTitle` styles, which drifted between 18 and 20px. */
export function SectionHeader({ title, overline = false, style }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[overline ? styles.overline : styles.title, style]}>{title}</Text>;
}

const makeStyles = ({ colors, typography, spacing }) =>
  StyleSheet.create({
    title: {
      ...typography.textStyles.sectionTitle,
      color: colors.text,
      marginBottom: spacing.base,
    },
    overline: {
      ...typography.textStyles.overline,
      color: colors.textMuted,
      marginBottom: spacing.md,
    },
  });
