// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// 테스트 파일 번들 제외
config.resolver.blockList = [
  /__tests__\/.*/,
  /.*\.test\.tsx?$/,
];

module.exports = config;