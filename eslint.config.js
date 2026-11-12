import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const sourceFiles = ['**/*.{js,jsx}'];

export default [
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  { ...react.configs.flat.recommended, files: sourceFiles },
  { ...react.configs.flat['jsx-runtime'], files: sourceFiles },
  {
    files: sourceFiles,
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Без TypeScript и PropTypes: контракты компонентов описаны в JSDoc.
      'react/prop-types': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
