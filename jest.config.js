module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@rneui/themed$': '<rootDir>/__mocks__/RneUi.js',
    '^@rneui/base$': '<rootDir>/__mocks__/RneUi.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/Reanimated.js',
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/VectorIcon.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      '@react-native/jest-preset/jest/assetFileTransformer.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-drawer-layout)/)',
  ],
};
