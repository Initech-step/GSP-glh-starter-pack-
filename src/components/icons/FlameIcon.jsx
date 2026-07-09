import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/**
 * Daily streak. Replaces the AntDesign star — a flame reads as "kept alight"
 * rather than "rated", which is what a streak actually means.
 */
export function FlameIcon({ size = 24, color = '#000', gradient }) {
  const id = useGradientId('flame');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />
      <Path
        d="M12 2.2c.55 2.7 2.15 4.85 4.05 6.4C18 10.25 19.2 12.3 19.2 14.7A7.2 7.2 0 0 1 4.8 14.7c0-1.2.42-2.38 1.05-3.15a2.6 2.6 0 0 0 2.6 2.6 2.6 2.6 0 0 0 2.6-2.6c0-1.42-.52-2.08-1.03-3.1-1.1-2.22-.24-4.2 2.08-6.25Z"
        fill={fill}
      />
      {/* inner core, lightened so the flame reads as layered */}
      <Path
        d="M12 19.6a3.6 3.6 0 0 0 3.6-3.6c0-1.35-.75-2.3-1.72-3.1-.62-.5-1.2-1.15-1.55-1.95-.72 1.5-1.9 2.1-2.72 3.05-.6.7-1.21 1.5-1.21 2.6A3.6 3.6 0 0 0 12 19.6Z"
        fill="#FFFFFF"
        opacity={0.28}
      />
    </Svg>
  );
}
