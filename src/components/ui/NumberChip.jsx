import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '../../theme';

/** The tinted square holding a zero-padded index — book list, chapter list. */
export function NumberChip({ label, size = 44, style, textStyle }) {
  const { colors, radii, typography } = useTheme();

  return (
    <View
      style={[
        styles.chip,
        {
          width: size,
          height: size,
          borderRadius: radii.sm + 2,
          backgroundColor: colors.primaryTint,
        },
        style,
      ]}
    >
      <Text
        style={[
          { fontFamily: typography.fonts.bold, fontSize: 16, color: colors.primary },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
