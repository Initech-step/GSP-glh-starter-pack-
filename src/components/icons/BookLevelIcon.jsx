import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

const LEVEL_COUNT = { beginner: 1, intermediate: 2, advanced: 3 };

/**
 * Recommended-book levels. Replaces 📗/📘/📙, which only differed by colour.
 * The number of stacked volumes encodes the level, so the icon still reads in
 * monochrome and for colour-blind users.
 */
export function BookLevelIcon({ size = 24, color = '#000', gradient, level = 'beginner' }) {
  const id = useGradientId('booklevel');
  const fill = resolveFill(gradient, id, color);
  const count = LEVEL_COUNT[level] ?? 1;

  // Stack upward from a fixed baseline, so a 1-volume icon shares the same
  // bottom edge as a 3-volume one. Alternating inset reads as separate books.
  const books = Array.from({ length: count }, (_, i) => ({
    y: 16.6 - i * 5.6,
    x: i % 2 === 0 ? 3.5 : 5.2,
    width: i % 2 === 0 ? 17 : 15.3,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />
      {books.map((b) => (
        <Rect key={b.y} x={b.x} y={b.y} width={b.width} height="4.2" rx="1.3" fill={fill} />
      ))}
    </Svg>
  );
}
