import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useGradientId, IconGradient, resolveFill } from './IconBase';

/** Empty state for the notes list. Replaces the 📝 glyph. */
export function NotesEmptyIcon({ size = 24, color = '#000', gradient }) {
  const id = useGradientId('notesempty');
  const fill = resolveFill(gradient, id, color);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconGradient id={id} colors={gradient} />

      {/* page with a folded corner */}
      <Path
        d="M6 2.6h7.2L19.4 8.8V20a1.4 1.4 0 0 1-1.4 1.4H6A1.4 1.4 0 0 1 4.6 20V4A1.4 1.4 0 0 1 6 2.6Z"
        fill={fill}
        opacity={0.25}
      />
      <Path
        d="M6 2.6h7.2L19.4 8.8V20a1.4 1.4 0 0 1-1.4 1.4H6A1.4 1.4 0 0 1 4.6 20V4A1.4 1.4 0 0 1 6 2.6Z"
        stroke={fill}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M13.2 2.6v6.2h6.2"
        stroke={fill}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ruled lines */}
      <Rect x="7.6" y="12.4" width="8.8" height="1.4" rx="0.7" fill={fill} />
      <Rect x="7.6" y="16" width="5.6" height="1.4" rx="0.7" fill={fill} />
    </Svg>
  );
}
