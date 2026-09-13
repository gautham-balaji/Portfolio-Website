import { defineConfig, devices } from '@playwright/test';

/**
 * Browser test configuration.
 *
 * Phase 1 establishes the harness with a small smoke suite. The projects below
 * are the viewports DESIGN_SYSTEM.md §64 requires; later phases add the
 * keyboard, reduced-motion and JavaScript-disabled suites described in
 * REBUILD_PLAN.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  // No `webServer` block on purpose.
  //
  // Astro 7 daemonises `astro dev` when stdout is not a TTY: the foreground
  // process exits 0 while the server keeps running. Playwright reads that exit
  // as a crashed web server, so it cannot manage the lifecycle itself.
  //
  // The server is started and stopped by the `pretest:e2e` / `posttest:e2e`
  // npm lifecycle scripts instead. Run the suite with `npm run test:e2e`.
  //
  // `astro preview` is not used either: @astrojs/vercel ships no preview
  // server, so exercising the real production output would need `vercel dev`
  // and the Vercel CLI. `npm run build` stays a separate quality gate.

  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
});
