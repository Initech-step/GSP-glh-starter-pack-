import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Bottom-weighted dark wash for text sitting over a photograph.
 *
 * The aurora gradient is drawn at <1 opacity so the photo reads through it,
 * which lightens its terminal stop and can push white text under 4.5:1. This
 * scrim restores the contrast without hiding the image.
 */
export function Scrim({ strength = 0.62, style }) {
  return (
    <LinearGradient
      colors={['rgba(15,7,26,0)', `rgba(15,7,26,${strength})`]}
      start={{ x: 0, y: 0.15 }}
      end={{ x: 0, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    />
  );
}
