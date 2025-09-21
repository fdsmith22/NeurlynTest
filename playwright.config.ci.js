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

  /* Web servers configuration - Playwright will manage these automatically */
  webServer: [
    {
      command: 'npx http-server -p 8080 --no-dotfiles',
      port: 8080,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'node backend.js',
      port: 3002,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'development',
        PORT: '3002',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test',
        JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-ci-testing-purposes-only-32chars'
      }
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
