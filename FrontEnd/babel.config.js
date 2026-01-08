module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      require.resolve('./scripts/worklets-plugin-mock.js'),
      'react-native-reanimated/plugin',
    ],
  };
};