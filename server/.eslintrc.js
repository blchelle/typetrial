module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  globals: {
    jest: true,
    beforeEach: true,
    beforeAll: true,
    describe: true,
    it: true,
  },
  ignorePatterns: ['scripts/**/*.ts'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-shadow': ['error'],
    'import/no-unresolved': 'off', // handled by typescript
    'import/prefer-default-export': 'off',
    'max-len': ['error', { code: 120, ignoreRegExpLiterals: true }],
    'import/extensions': 'off',
    'no-shadow': 'off',
    'no-param-reassign': 'off',
  },
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        'no-unused-expressions': 'off',
        'max-len': 'off',
      },
    },
  ],
};
