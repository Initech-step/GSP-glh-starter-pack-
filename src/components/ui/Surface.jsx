import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../theme';
import { GRADIENT_DIRECTION } from '../../theme/gradients';

/**
 * The one place the gradient/shadow clipping rules live.
 *
 * Two pitfalls, both solved by splitting into an outer and inner view:
 *
 *  1. iOS clips a shadow when the same view sets overflow:'hidden'; Android
 *     drops `elevation` entirely. So the OUTER view carries the shadow and is
 *     never clipped.
 *  2. <LinearGradient> does not inherit a parent's borderRadius. So the INNER
 *     view carries the radius plus overflow:'hidden', which clips the gradient
 *     and any children to the rounded corners.
 *
 * The outer view also needs an opaque backgroundColor or iOS renders no shadow
 * at all.
 */
export function Surface({
  children,
  gradient,          // array of colour stops, or undefined for a flat surface
  gradientOpacity,   // < 1 lets an ImageBackground show through from below
  backgroundColor,
  radius,
  elevation = 'md',  // 'sm' | 'md' | 'lg' | false
  style,
  innerStyle,
  behind,            // rendered beneath the gradient (e.g. an ImageBackground)
  overlay,           // rendered above the gradient, below children (e.g. a Scrim)
  ...rest
}) {
  const { colors, radii, shadows } = useTheme();
  const borderRadius = radius ?? radii.lg;
  const shadow = elevation ? shadows[elevation] : null;
  const base = backgroundColor ?? colors.surface;

  return (
    <View
      style={[{ borderRadius, backgroundColor: base }, shadow, style]}
      {...rest}
    >
      <View style={[styles.inner, { borderRadius }, innerStyle]}>
        {behind}
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={GRADIENT_DIRECTION.start}
            end={GRADIENT_DIRECTION.end}
            style={[StyleSheet.absoluteFill, gradientOpacity != null && { opacity: gradientOpacity }]}
          />
        ) : null}
        {overlay}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
  },
});
