module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  globals: {
    NodeJS: true,
    JSX: true,
  },
  rules: {
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/function-component-definition': 'off',
    'react/button-has-type': 'off',
    'react/require-default-props': 'off',
    'import/no-unresolved': 'off', // handled by typescript
    'import/extensions': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
