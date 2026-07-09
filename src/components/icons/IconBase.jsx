import React, { useId } from 'react';
import { Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * react-native-svg registers <Defs> ids in a GLOBAL, document-flat namespace on
 * each platform renderer. Two icons sharing a hardcoded id (e.g. "grad") will
 * collide: on Android the last registration wins and both icons render the same
 * fill, and on fast-refresh or list re-renders fills go missing or swap.
 *
 * So every mounted instance derives its own id from React's useId().
 *
 * useId() returns strings shaped like ":r0:" — the colons are not valid inside
 * an SVG `url(#...)` reference, so they are stripped.
 */
export function useGradientId(prefix) {
  const raw = useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Renders nothing when `colors` is undefined, so icons stay solid-fill by default. */
export function IconGradient({ id, colors }) {
  if (!colors || colors.length < 2) return null;

  return (
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        {colors.map((stopColor, i) => (
          <Stop key={stopColor + i} offset={i / (colors.length - 1)} stopColor={stopColor} />
        ))}
      </LinearGradient>
    </Defs>
  );
}

/** `gradient` wins over `color` when both are supplied. */
export function resolveFill(gradient, id, color) {
  return gradient && gradient.length >= 2 ? `url(#${id})` : color;
}
