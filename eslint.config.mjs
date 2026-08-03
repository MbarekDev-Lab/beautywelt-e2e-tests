import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'allure-results/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'draft/**',
      '*.min.js',
      '**/*.min.js',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
);
