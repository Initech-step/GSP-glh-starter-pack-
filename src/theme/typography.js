// Fraunces (optical serif) carries scripture + book display titles.
// Inter carries all UI chrome.
//
// IMPORTANT: when a custom `fontFamily` is set, React Native ignores
// `fontWeight` on iOS and synthesises a fake bold on Android. Weight lives in
// the family name — never pair `fontFamily` with `fontWeight`.
export const fonts = {
  body: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  mono: 'monospace',
};

export const fontSizes = {
  micro: 10,
  tiny: 11,
  caption: 12,
  small: 13,
  body: 14,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  display: 24,
  hero: 30,
  giant: 32,
};

// Reusable text presets. Spread these, then override colour from theme.colors.
export const textStyles = {
  heroTitle: { fontFamily: fonts.display, fontSize: fontSizes.hero, lineHeight: 36 },
  displayTitle: { fontFamily: fonts.display, fontSize: fontSizes.display, lineHeight: 30 },
  bookTitle: { fontFamily: fonts.displaySemi, fontSize: fontSizes.xxl, lineHeight: 28 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSizes.xl },
  cardTitle: { fontFamily: fonts.semibold, fontSize: fontSizes.lg },
  body: { fontFamily: fonts.body, fontSize: fontSizes.body, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: fontSizes.base },
  caption: { fontFamily: fonts.body, fontSize: fontSizes.small, lineHeight: 18 },
  overline: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.bold, fontSize: fontSizes.md },
};

export const typography = { fonts, fontSizes, textStyles };
