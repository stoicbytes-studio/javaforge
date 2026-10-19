// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Playwright fixtures call a function named `use`; it is not the React hook.
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    files: ['jest.setup.js', 'src/__tests__/**', 'src/test-utils/**'],
    languageOptions: { globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' } },
  },
  {
    ignores: ['dist/*', 'dist-e2e/*', 'public/monaco/*', 'executor/*', 'supabase/*', 'test-results/*', 'playwright-report/*'],
  },
]);
