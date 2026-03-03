import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for A11y audit (S8-04 / S8-05).
 * Serves src/ at port 3001 so both client and pseudo-assets are accessible.
 * Run: npx playwright test --config playwright.a11y.config.js
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '*.a11y.e2e.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report-a11y' }], ['list']],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx serve src/ -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
