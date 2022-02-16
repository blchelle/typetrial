module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/prismaMock.ts'],
  testRegex: 'src/spec/.*\\.spec\\.ts$',
};
