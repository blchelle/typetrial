module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/spec/prismaMock.ts', './src/spec/dateMock.ts'],
  testRegex: 'src/spec/.*\\.spec\\.ts$',
};
