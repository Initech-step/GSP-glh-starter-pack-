import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useThemedStyles } from '../../theme';

/** The `container` + `scrollContent` pair that every screen re-declared. */
export function ScreenScrollView({ children, contentContainerStyle, style, animate = true, ...rest }) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {animate ? (
          <Animated.View entering={FadeInDown.duration(280)}>{children}</Animated.View>
        ) : (
          children
        )}
      </ScrollView>
    </View>
  );
}

/** Same themed background, but without the ScrollView (for FlatList screens). */
export function Screen({ children, style }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.container, style]}>{children}</View>;
}

const makeStyles = ({ colors, spacing }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
  });
