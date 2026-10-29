import { defineConfig, devices } from '@playwright/test';

// By default the tests run against a local copy of the site.
// Set BASE_URL to test somewhere else, e.g. the live site:
//   BASE_URL=https://chigwellroundtable.co.uk npx playwright test
const liveUrl = process.env.BASE_URL;
const baseURL = liveUrl ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: liveUrl
    ? undefined
    : {
        command: 'npm run serve',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
