import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '../../theme';

/**
 * Pill badge. `variant="solid"` is the white pill used on gradient heroes;
 * `variant="tint"` is the pale in-card label.
 */
export function Badge({ label, icon, variant = 'tint', style, textStyle }) {
  const { colors, radii, typography } = useTheme();
  const solid = variant === 'solid';

  // The solid pill is white in BOTH schemes, so its content must not use
  // `primary` (a pale violet in dark). Badge owns the colour so no caller can
  // get it wrong.
  const content = solid ? colors.primaryOnWhite : colors.primary;

  return (
    <View
      style={[
        styles.badge,
        {
          borderRadius: radii.xl,
          backgroundColor: solid ? colors.onGradient : colors.primaryTint,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={styles.icon}>{React.cloneElement(icon, { color: content })}</View>
      ) : null}
      <Text
        style={[{ fontFamily: typography.fonts.bold, fontSize: 12, color: content }, textStyle]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 6,
  },
});
