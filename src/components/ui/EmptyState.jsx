import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemedStyles } from '../../theme';

export function EmptyState({ icon, title, subtitle, style }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.wrap, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing }) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    icon: {
      marginBottom: spacing.base,
    },
    title: {
      ...typography.textStyles.cardTitle,
      color: colors.text,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.textStyles.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
