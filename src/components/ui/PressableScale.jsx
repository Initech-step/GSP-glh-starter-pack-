import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 260, mass: 0.6 };

/**
 * Press feedback for every tappable surface. Replaces TouchableOpacity's
 * dimming with a soft scale, which reads better on gradient fills.
 *
 * withSpring defaults to ReduceMotion.System, so this is already a no-op for
 * users who have "Reduce Motion" enabled.
 */
export function PressableScale({ children, style, scaleTo = 0.97, disabled, ...rest }) {
  const pressed = useSharedValue(0);

  const onPressIn = useCallback(() => {
    pressed.value = 1;
  }, [pressed]);

  const onPressOut = useCallback(() => {
    pressed.value = 0;
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? scaleTo : 1, SPRING) }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
