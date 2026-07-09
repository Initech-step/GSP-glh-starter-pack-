import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/** Player album-art placeholder. Replaces the 🎧 text glyph. */
export function HeadphonesIcon({ size = 24, color = '#000', gradient }) {
  const id = useGradientId('headphones');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />

      {/* headband */}
      <Path
        d="M3.6 15V12a8.4 8.4 0 0 1 16.8 0v3"
        stroke={fill}
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />

      {/* ear cups */}
      <Rect x="1.9" y="13.4" width="4.9" height="8.1" rx="2.45" fill={fill} />
      <Rect x="17.2" y="13.4" width="4.9" height="8.1" rx="2.45" fill={fill} />
    </Svg>
  );
}
