module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo injects react-native-worklets/plugin (required by
  // react-native-reanimated) automatically, and it must stay last.
  return {
    presets: ['babel-preset-expo'],
  };
};
