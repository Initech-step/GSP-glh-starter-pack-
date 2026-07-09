import React, { useEffect } from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../theme';
import { GRADIENT_DIRECTION } from '../../theme/gradients';
import { PressableScale } from './PressableScale';

const SIZES = {
  sm: { paddingVertical: 10, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
};

/**
 * The full-width purple pill repeated as submitButton / startButton /
 * selectFolderButton / saveButton. The shadow lives on the outer pressable and
 * the radius + clip on the gradient itself — see Surface for why.
 */
export function GradientButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  gradient = 'play',
  size = 'lg',
  icon,
  fullWidth = true,
  style,
  textStyle,
  ...rest
}) {
  const { colors, gradients, radii, shadows, typography } = useTheme();
  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      style={[
        { borderRadius: radii.md, backgroundColor: colors.surface },
        !inactive && shadows.lg,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      <LinearGradient
        colors={inactive ? [colors.disabled, colors.disabled] : gradients[gradient]}
        start={GRADIENT_DIRECTION.start}
        end={GRADIENT_DIRECTION.end}
        style={[styles.inner, SIZES[size], { borderRadius: radii.md }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[typography.textStyles.button, { color: colors.onPrimary }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

/**
 * Circular gradient button — the Player's 80px play/pause control.
 * `pulsing` emits a slow halo while audio is playing, and stops on pause.
 */
export function GradientIconButton({
  onPress,
  disabled = false,
  gradient = 'play',
  size = 80,
  pulsing = false,
  children,
  style,
  ...rest
}) {
  const { colors, gradients, shadows } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (pulsing) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
    return () => cancelAnimation(pulse);
  }, [pulsing, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: (1 - pulse.value) * 0.3,
    transform: [{ scale: 1 + pulse.value * 0.28 }],
  }));

  return (
    <View style={styles.iconButtonWrap}>
      {pulsing ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryGlow },
            haloStyle,
          ]}
        />
      ) : null}

      <PressableScale
        onPress={onPress}
        disabled={disabled}
        style={[
          { borderRadius: size / 2, backgroundColor: colors.surface },
          !disabled && shadows.lg,
          style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={disabled ? [colors.disabled, colors.disabled] : gradients[gradient]}
          start={GRADIENT_DIRECTION.start}
          end={GRADIENT_DIRECTION.end}
          style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}
        >
          {children}
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    marginRight: 10,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  iconButtonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
});
