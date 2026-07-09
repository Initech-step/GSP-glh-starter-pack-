import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/**
 * Replaces the original src/components/Icons.jsx, whose arrow body never
 * returned its JSX and used HTML attribute names (stroke-width, fill-rule)
 * that react-native-svg rejects.
 */
export function PlayIcon({ size = 24, color = '#000', gradient, filled = true }) {
  const id = useGradientId('play');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />
      {filled ? (
        <>
          <Circle cx="12" cy="12" r="10" fill={fill} />
          <Path d="M10.1 8.35a.9.9 0 0 1 1.36-.78l5.1 3.65a.9.9 0 0 1 0 1.56l-5.1 3.65a.9.9 0 0 1-1.36-.78Z" fill="#FFFFFF" />
        </>
      ) : (
        <Path
          d="M8.6 6.4a.9.9 0 0 1 1.37-.77l9.1 5.6a.9.9 0 0 1 0 1.54l-9.1 5.6A.9.9 0 0 1 8.6 17.6Z"
          fill={fill}
        />
      )}
    </Svg>
  );
}
