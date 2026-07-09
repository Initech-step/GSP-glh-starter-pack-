import { AURORA } from './palette';

// Drop shadows read as muddy grey halos on a dark canvas, so dark mode relies
// on surface-tone separation plus Android elevation only.
//
// Pitfall baked in here: never combine these presets with overflow:'hidden' on
// the SAME view. iOS clips the shadow, and Android drops elevation entirely.
// Pattern: outer view carries the shadow, inner view carries radius + clip.
export const makeShadows = (scheme) => {
  if (scheme === 'dark') {
    return {
      sm: { elevation: 2 },
      md: { elevation: 4 },
      lg: { elevation: 8 },
    };
  }

  return {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: AURORA.base,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
  };
};
