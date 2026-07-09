// Every gradient is an array of >=2 colour stops, passed straight to
// <LinearGradient colors={...} />.
//
// CONTRAST RULE: any gradient that carries white text or white icons must keep
// its LIGHTEST stop at >=4.5:1 against #FFFFFF. That rules out #8B5CF6 (4.23:1)
// and #A78BFA (2.72:1) as terminal stops — #7C3AED (5.70:1) is the lightest
// violet that is safe to end on.
export const lightGradients = {
  hero: ['#2A0A47', '#5B21B6', '#7C3AED'],
  play: ['#5B21B6', '#7C3AED'],
  card: ['#FFFFFF', '#FAF5FF'],
  progress: ['#7C3AED', '#D97706'],
  header: ['#360F5A', '#6D28D9'],
  accent: ['#D97706', '#F59E0B'],
  success: ['#166534', '#15803D'],
};

export const darkGradients = {
  // Darkened so white body text still clears contrast on the hero surfaces.
  hero: ['#1B0B33', '#3B1E6E', '#5B3AA0'],
  play: ['#5B21B6', '#7C3AED'],
  // The light `card` gradient (#FFFFFF -> #FAF5FF) is nonsense on a dark
  // canvas; dark cards ramp between the two violet surface tones instead.
  card: ['#1E1233', '#241640'],
  progress: ['#A78BFA', '#F59E0B'],
  header: ['#241640', '#3B1E6E'],
  accent: ['#F59E0B', '#FBBF24'],
  success: ['#166534', '#15803D'],
};

// Consistent diagonal for every gradient surface in the app.
export const GRADIENT_DIRECTION = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
