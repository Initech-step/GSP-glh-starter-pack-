import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme, useThemedStyles } from '../../theme';
import { GRADIENT_DIRECTION } from '../../theme/gradients';
import { Scrim } from './Scrim';

/**
 * The full-bleed banner at the top of TestamentBooks / BookChapters.
 *
 * An <ImageBackground> paints opaquely, so the gradient must be an
 * absolute-fill SIBLING ABOVE the image with alpha — never behind it, where it
 * would be invisible.
 *
 * No shadow here, so overflow:'hidden' on the wrapper is safe.
 */
export function HeroBanner({
  label,
  title,
  subtitle,
  badge,
  backgroundImage,
  gradient = 'hero',
  style,
}) {
  const { gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.wrap, style]}>
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          imageStyle={styles.image}
        />
      ) : null}

      <LinearGradient
        colors={gradients[gradient]}
        start={GRADIENT_DIRECTION.start}
        end={GRADIENT_DIRECTION.end}
        style={[StyleSheet.absoluteFill, backgroundImage ? styles.overlay : null]}
      />

      {/* The photo showing through lightens the gradient's terminal stop, so
          the text needs a wash to stay legible. */}
      {backgroundImage ? <Scrim /> : null}

      <View style={styles.content}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {badge ? <View style={styles.badge}>{badge}</View> : null}
      </View>
    </View>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    wrap: {
      minHeight: 180,
      justifyContent: 'flex-end',
      borderBottomLeftRadius: radii.banner,
      borderBottomRightRadius: radii.banner,
      overflow: 'hidden',
    },
    image: {
      resizeMode: 'cover',
    },
    overlay: {
      // Let the photograph read through the aurora.
      opacity: 0.88,
    },
    content: {
      padding: spacing.lg,
      paddingTop: spacing.xxl,
    },
    label: {
      ...typography.textStyles.overline,
      color: colors.onGradientMuted,
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.textStyles.heroTitle,
      color: colors.onGradient,
    },
    subtitle: {
      ...typography.textStyles.body,
      color: colors.onGradientMuted,
      marginTop: spacing.xs,
    },
    badge: {
      marginTop: spacing.base,
    },
  });
