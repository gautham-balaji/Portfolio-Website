import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',

      // Legacy hand-written site, pending removal in a later phase. It is not
      // part of the new application and is deliberately not linted. Running
      // ESLint over it reports 11 real errors, including the `isPaused` scope
      // leak documented in REBUILD_PLAN C-02.
      'index.html',
      'styles.css',
      'script.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Surface unused code, but allow the `_foo` convention for intentional gaps.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Strict typing is a Phase 1 requirement: `any` must be justified, not casual.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Config files run in Node and legitimately use console.
  {
    files: ['*.config.{js,mjs,ts}', 'tests/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
);
