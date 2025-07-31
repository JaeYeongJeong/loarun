// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

config.resolver.blacklistRE = exclusionList([
  /__tests__\/.*/,
  /.*\.test\.tsx?$/,
]);

module.exports = config;