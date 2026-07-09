import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/** Old Testament — a Torah scroll: two rolled staves with ruled parchment between. */
export function ScrollIcon({ size = 24, color = '#000', gradient }) {
  const id = useGradientId('scroll');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />

      {/* parchment */}
      <Rect x="6.5" y="5.5" width="11" height="13" rx="0.75" fill={fill} opacity={0.28} />

      {/* ruled text lines */}
      <Rect x="9" y="8.5" width="6" height="1.1" rx="0.55" fill={fill} opacity={0.75} />
      <Rect x="9" y="11.45" width="6" height="1.1" rx="0.55" fill={fill} opacity={0.75} />
      <Rect x="9" y="14.4" width="4" height="1.1" rx="0.55" fill={fill} opacity={0.75} />

      {/* rolled staves */}
      <Rect x="3.5" y="3.5" width="3.4" height="17" rx="1.7" fill={fill} />
      <Rect x="17.1" y="3.5" width="3.4" height="17" rx="1.7" fill={fill} />
    </Svg>
  );
}
