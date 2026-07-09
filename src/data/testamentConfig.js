// Was duplicated verbatim in TestamentBooks.jsx and BookChapters.jsx.
// Accent colours now come from the theme, so only the non-visual identity of a
// testament lives here. (The old `gradient: '#9007df'` key was dead — nothing
// ever consumed it.)
export const TESTAMENT_CONFIG = {
  old_testament: {
    label: 'OLD TESTAMENT',
    backgroundImage: require('../../assets/old_testament.jpg'),
  },
  new_testament: {
    label: 'NEW TESTAMENT',
    backgroundImage: require('../../assets/new_testament.jpg'),
  },
};

export const getTestamentConfig = (key, fallbackName) =>
  TESTAMENT_CONFIG[key] ?? { label: fallbackName?.toUpperCase() ?? 'BIBLE', backgroundImage: null };
