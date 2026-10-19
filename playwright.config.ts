import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the static web export.
 * Build first: `npm run export:web` (writes dist/), then `npm run e2e`.
 * Set PLAYWRIGHT_CHROMIUM to use a preinstalled Chromium binary.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM;
const launchOptions = executablePath ? { executablePath } : {};
const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 }, launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],
  webServer: {
    command: `npx serve -s dist -l ${PORT} --no-port-switching`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
