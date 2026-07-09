import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/** New Testament — a latin cross. Replaces the decorative `˗ˏˋ ✞ ˎˊ˗` text glyph. */
export function CrossIcon({ size = 24, color = '#000', gradient }) {
  const id = useGradientId('cross');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />
      <Rect x="10.15" y="2" width="3.7" height="20" rx="1.6" fill={fill} />
      <Rect x="5.5" y="7.15" width="13" height="3.7" rx="1.6" fill={fill} />
    </Svg>
  );
}
