import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for CI Environment
 * This configuration is optimized for GitHub Actions
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Reduce parallelism to avoid rate limiting */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* Add retries for rate limiting issues */
  retries: 2,
  /* Limit workers to reduce API load */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

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
    }
  ],

  /* CI starts its own servers, so we don't need webServer config */
  /* The workflow starts servers separately before running tests */

  /* Timeout configurations */
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000
  },

  /* Output folder for test artifacts */
  outputDir: 'test-results/'
});
