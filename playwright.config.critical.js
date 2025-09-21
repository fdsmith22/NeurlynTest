import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for Critical Path Tests
 * Runs only essential tests for faster CI feedback (~8-10 minutes)
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Test files to include - only critical tests */
  testMatch: [
    '**/adaptive-api-core.spec.js', // Consolidated adaptive API tests
    '**/homepage.spec.js', // Basic homepage smoke tests
    '**/assessment.spec.js' // Core assessment flow
  ],
  /* Exclude non-critical tests */
  testIgnore: [
    '**/adaptive-questions.spec.js', // Redundant - covered by adaptive-api-core
    '**/adaptive-api.spec.js', // Redundant - covered by adaptive-api-core
    '**/adaptive-api-optimized.spec.js', // Redundant - covered by adaptive-api-core
    '**/visual.spec.js', // Visual regression - for nightly
    '**/mobile-layout-analysis.spec.js', // Detailed mobile - for nightly
    '**/test-mobile-pricing-fix.spec.js' // Specific fix test - for nightly
  ],
  /* Maximum parallel execution for speed */
  fullyParallel: true,
  /* No test.only in production */
  forbidOnly: !!process.env.CI,
  /* Minimal retries for faster feedback */
  retries: 1,
  /* More workers for faster execution */
  workers: process.env.CI ? 3 : 6,
  /* Reporter configuration */
  reporter: [['list'], ['html', { open: 'never' }], process.env.CI ? ['github'] : null].filter(
    Boolean
  ),
  /* Shared settings */
  use: {
    /* Base URL */
    baseURL: 'http://localhost:8080',
    /* Only capture on failure to save time */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Standard viewport */
    viewport: { width: 1280, height: 720 },
    /* Faster timeouts for critical tests */
    actionTimeout: 10000,
    navigationTimeout: 15000
  },
  /* Single browser for critical path tests */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Tag critical tests with @critical */
        grep: /@critical/
      }
    }
  ],
  /* Web servers configuration */
  webServer: [
    {
      command: 'npx http-server -p 8080 --no-dotfiles',
      port: 8080,
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'node backend.js',
      port: 3002,
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'development',
        PORT: '3002',
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test',
        JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-ci-testing-purposes-only-32chars'
      }
    }
  ],
  /* Faster timeouts for critical tests */
  timeout: 20 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  /* Output folder */
  outputDir: 'test-results/'
});
