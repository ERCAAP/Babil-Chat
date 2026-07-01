module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Required for react-native-reanimated (must be last)
      "react-native-reanimated/plugin",
    ],
  };
}; 