import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // E2E lives in tests/e2e and is driven by Playwright, not Vitest.
    include: ['tests/unit/**/*.test.ts'],
  },
});
