const path = require('path');

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./src/spec/setupSpecs.ts', './src/spec/axiosMock.ts', 'jest-localstorage-mock'],
  moduleNameMapper: { ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: path.join(__dirname, 'src') }), '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/spec/fileMock.js' },
  testRegex: 'src/spec/.*\\.spec\\.tsx?$',
  transform: {
    '.+\\.(css|scss|png|jpg|svg)$': 'jest-transform-stub',
  },
};
