module.exports = {
  env: {
    es2021: true,
    node: true,
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
    describe: true,
    it: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-shadow': ['error'],
    'import/no-unresolved': 'off', // handled by typescript
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'no-shadow': 'off',
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
