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
    jest: true,
    beforeEach: true,
    describe: true,
    it: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/function-component-definition': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/button-has-type': 'off',
    'import/no-unresolved': 'off', // handled by typescript
    'import/extensions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-use-before-define': 'off',
    'no-unused-vars': 'off',
    'import/prefer-default-export': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  overrides: [
    {
      files: ['*.spec.tsx'],
      rules: {
        'no-unused-expressions': 'off',
        'max-len': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
