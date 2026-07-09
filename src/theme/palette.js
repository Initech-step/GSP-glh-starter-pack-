// Raw "Violet Aurora" brand hexes. Non-semantic: these are facts, not decisions.
// Screens must never import from here — use colors.js semantic keys instead.
export const AURORA = {
  deep: '#2A0A47',
  base: '#360F5A', // the app's original brand purple, retained
  mid: '#6D28D9',
  bright: '#8B5CF6',
  glow: '#A78BFA',
  pale: '#C4B5FD',
  amber: '#F59E0B',
  amberBright: '#FBBF24',
};

// Slate ramp used by the light scheme.
export const SLATE = {
  50: '#F8FAFC',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  800: '#1E293B',
};

// Violet-tinted neutrals used by the dark scheme, so greys never read as
// "dead grey" against the aurora gradients.
export const NIGHT = {
  canvas: '#140A24',
  surface: '#1E1233',
  raised: '#241640',
  muted: '#2A1B47',
  border: '#33244F',
  borderStrong: '#443463',
  textFaint: '#9A8CB8',
  textMuted: '#B9A9D6',
  text: '#F5F3FF',
};
