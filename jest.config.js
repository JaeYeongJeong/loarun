// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
    '|@react-native' +
    '|@react-navigation' +
    '|expo-modules-core' +
    '|expo' + 
    '|@expo' +
    '|react-native' +
    '|@unimodules' +
    '|@react-native/js-polyfills)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
