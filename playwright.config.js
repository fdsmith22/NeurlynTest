import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Reduce parallelism to avoid rate limiting */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Add retries for rate limiting issues */
  retries: process.env.CI ? 3 : 2,
  /* Limit workers to reduce API load */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:8080',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Viewport size */
    viewport: { width: 1280, height: 720 }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' }
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'python3 -m http.server 8080',
      port: 8080,
      timeout: 120 * 1000,
      reuseExistingServer: true
    },
    {
      command: 'node scripts/start-test-backend.js',
      port: 3002,
      timeout: 120 * 1000,
      reuseExistingServer: true
    }
  ],

  /* Timeout configurations */
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000
  },

  /* Output folder for test artifacts */
  outputDir: 'test-results/'
});
