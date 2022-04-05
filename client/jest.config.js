const path = require('path');

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./src/spec/setupSpecs.ts', './src/spec/axiosMock.ts', 'jest-localstorage-mock'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: path.join(__dirname, 'src') }),
  testRegex: 'src/spec/.*\\.spec\\.tsx?$',
  transform: {
    '.+\\.(css|styl|less|sass|scss)$': 'jest-transform-css',
  },
};
