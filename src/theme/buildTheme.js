import { lightColors, darkColors } from './colors';
import { lightGradients, darkGradients } from './gradients';
import { makeShadows } from './shadows';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';

// Lives apart from index.js so ThemeContext can import it without creating an
// import cycle (index.js re-exports ThemeContext).
export const buildTheme = (scheme) => ({
  scheme,
  colors: scheme === 'dark' ? darkColors : lightColors,
  gradients: scheme === 'dark' ? darkGradients : lightGradients,
  shadows: makeShadows(scheme),
  spacing,
  radii,
  typography,
});

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
