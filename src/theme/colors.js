import { AURORA, SLATE, NIGHT } from './palette';

// Both schemes MUST expose the identical key set, so makeStyles(theme) never
// has to branch on theme.scheme.
export const lightColors = {
  bg: SLATE[50],
  surface: '#FFFFFF',
  surfaceAlt: '#FAF5FF',
  surfaceMuted: '#EEF2FF',

  primary: AURORA.base,
  primaryBright: AURORA.mid,
  primaryGlow: AURORA.bright,
  primaryTint: '#EDE4FB',
  onPrimary: '#FFFFFF',
  // For content sitting on an ALWAYS-white surface (the solid Badge on a hero
  // banner). `primary` cannot be used there: in dark it is a pale violet.
  primaryOnWhite: AURORA.base,

  text: SLATE[800],
  // Darkened from slate-500/400: the old muted pair sat at 4.76:1 and 2.56:1
  // on white, and textFaint carries 12–13px meta text.
  textMuted: SLATE[600],
  textFaint: SLATE[500],
  onGradient: '#FFFFFF',
  onGradientMuted: 'rgba(255,255,255,0.85)',

  border: SLATE[200],
  borderStrong: SLATE[300],

  // Deepened so the flame icon clears 3:1 and the status text clears 4.5:1.
  accent: '#D97706',
  accentTint: '#FEF3C7',
  success: '#15803D',
  successTint: '#F0FDF4',
  danger: '#C81E1E',
  dangerTint: '#FEF2F2',
  dangerBorder: '#FEE2E2',

  headerBg: AURORA.base,
  headerTint: '#FFFFFF',

  switchTrackOff: SLATE[300],
  switchTrackOn: AURORA.glow,
  switchThumbOff: '#F1F5F9',
  switchThumbOn: AURORA.base,

  overlay: 'rgba(54,15,90,0.72)',
  scrim: 'rgba(0,0,0,0.5)',
  disabled: SLATE[300],
};

export const darkColors = {
  bg: NIGHT.canvas,
  surface: NIGHT.surface,
  surfaceAlt: NIGHT.raised,
  surfaceMuted: NIGHT.muted,

  // The base purple #360F5A is effectively invisible on a #140A24 canvas,
  // so dark promotes the brighter end of the ramp for interactive elements.
  // #8B5CF6 only reached 4.17:1 on `surface`, hence glow rather than bright.
  primary: AURORA.glow,
  primaryBright: AURORA.pale,
  primaryGlow: '#DDD6FE',
  primaryTint: NIGHT.muted,
  onPrimary: '#FFFFFF',
  // The solid Badge pill stays white in dark mode, so its content needs a
  // deep violet, never `primary`.
  primaryOnWhite: '#4C1D95',

  text: NIGHT.text,
  textMuted: NIGHT.textMuted,
  textFaint: NIGHT.textFaint,
  onGradient: '#FFFFFF',
  onGradientMuted: 'rgba(255,255,255,0.85)',

  border: NIGHT.border,
  borderStrong: NIGHT.borderStrong,

  accent: AURORA.amberBright,
  accentTint: '#3A2A0A',
  success: '#4ADE80',
  successTint: '#12241A',
  danger: '#F87171',
  dangerTint: '#2A1414',
  dangerBorder: '#4C1D1D',

  headerBg: NIGHT.surface,
  headerTint: NIGHT.text,

  switchTrackOff: NIGHT.borderStrong,
  switchTrackOn: AURORA.mid,
  switchThumbOff: NIGHT.textFaint,
  switchThumbOn: AURORA.glow,

  overlay: 'rgba(10,4,22,0.78)',
  scrim: 'rgba(0,0,0,0.65)',
  disabled: NIGHT.borderStrong,
};
