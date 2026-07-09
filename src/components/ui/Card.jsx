import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { Surface } from './Surface';
import { PressableScale } from './PressableScale';

const STAGGER_MS = 45;
// Psalms has 150 chapters; without a cap the last card would enter ~7s late.
const MAX_STAGGERED = 8;

/**
 * The white rounded card repeated across every screen. Pass `gradient` to get
 * the theme's subtle card ramp (white -> violet tint in light, violet surface
 * ramp in dark), and `index` to stagger the entrance inside a list.
 */
export function Card({
  children,
  onPress,
  gradient,
  elevation = 'md',
  radius,
  style,
  contentStyle,
  accentColor,        // renders the 4px left accent stripe
  index,              // list position, drives the stagger
  ...rest
}) {
  const { gradients, radii } = useTheme();

  const entering =
    index != null
      ? FadeInUp.delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS).duration(260)
      : undefined;

  const surface = (
    <Surface
      gradient={gradient ? gradients.card : undefined}
      elevation={elevation}
      radius={radius ?? radii.md}
      style={style}
      innerStyle={accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : undefined}
    >
      <View style={contentStyle}>{children}</View>
    </Surface>
  );

  if (!onPress) {
    return <Animated.View entering={entering}>{surface}</Animated.View>;
  }

  return (
    <PressableScale onPress={onPress} entering={entering} {...rest}>
      {surface}
    </PressableScale>
  );
}
