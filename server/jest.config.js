module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/spec/prismaMock.ts'],
  testRegex: 'src/spec/.*\\.spec\\.ts$',
};
