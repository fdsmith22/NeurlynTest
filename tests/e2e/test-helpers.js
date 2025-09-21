import { expect } from '@playwright/test';

/**
 * Centralized test helpers and utilities for E2E tests
 * Reduces duplication and improves test maintainability
 */

// Centralized selectors to avoid duplication across test files
export const SELECTORS = {
  // Assessment flow selectors
  pricingCard: {
    free: '.pricing-card[data-plan="free"]',
    premium: '.pricing-card[data-plan="premium"]',
    enterprise: '.pricing-card[data-plan="enterprise"]'
  },
  startAssessment: '#start-assessment',
  assessmentTrack: {
    personality: '.track-option[data-track="personality"]',
    neurodiversity: '.track-option[data-track="neurodiversity"]',
    cognitive: '.track-option[data-track="cognitive"]'
  },
  assessmentMode: {
    quick: '.mode-option[data-mode="quick"]',
    standard: '.mode-option[data-mode="standard"]',
    comprehensive: '.mode-option[data-mode="comprehensive"]'
  },
  assessmentStyle: {
    visual: '.style-option[data-style="visual"]',
    textFocused: '.style-option[data-style="text-focused"]',
    gamified: '.style-option[data-style="gamified"]'
  },

  // Question and response selectors
  questionText: '#question-text',
  questionOptions: '.question-option',
  nextButton: '#next-question',
  progressBar: '#progress-bar',

  // Results and reports
  resultsContainer: '#results-container',
  downloadReportBtn: '#download-report',

  // Navigation
  navigation: {
    menu: '#nav-menu',
    menuButton: '#menu-button',
    closeMenu: '#close-menu'
  },

  // Forms
  consent: {
    checkbox: '#consent-checkbox',
    form: '#consent-form'
  }
};

// API endpoints configuration
export const API_ENDPOINTS = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  adaptive: '/api/assessments/adaptive-optimized',
  questions: '/api/questions',
  health: '/health',
  reports: '/api/reports'
};

// Test data configurations
export const TEST_TIERS = {
  free: { questionCount: 20, minTime: 10, maxTime: 15 },
  core: { questionCount: 45, minTime: 22.5, maxTime: 30 },
  comprehensive: { questionCount: 61, minTime: 30, maxTime: 45 } // Adjusted to actual DB content
};

export const BIG_FIVE_TRAITS = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism'
];

/**
 * Smart wait function that replaces waitForTimeout
 * Waits for element or network idle state instead of hard delays
 */
export async function smartWait(page, options = {}) {
  const { selector = null, state = 'visible', timeout = 5000, waitForNetwork = false } = options;

  if (selector) {
    await page.waitForSelector(selector, { state, timeout });
  }

  if (waitForNetwork) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  return true;
}

/**
 * Make API request with automatic retry and exponential backoff
 * Handles rate limiting gracefully
 */
export async function makeApiRequestWithRetry(page, endpoint, data, options = {}) {
  const { maxRetries = 3, initialDelay = 100, backoffMultiplier = 2 } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await page.request.post(`${API_ENDPOINTS.baseUrl}${endpoint}`, {
        data,
        timeout: 10000
      });

      // Handle rate limiting
      if (response.status() === 429) {
        if (attempt < maxRetries) {
          await page.waitForTimeout(delay);
          delay *= backoffMultiplier;
          continue;
        }
      }

      if (!response.ok() && attempt < maxRetries) {
        await page.waitForTimeout(delay);
        delay *= backoffMultiplier;
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await page.waitForTimeout(delay);
        delay *= backoffMultiplier;
      }
    }
  }

  throw lastError;
}

/**
 * Navigate through assessment selection flow
 * Consolidates repeated navigation logic
 */
export async function navigateToAssessment(page, options = {}) {
  const { tier = 'free', track = 'personality', mode = 'quick', style = 'visual' } = options;

  // Go to homepage
  await page.goto('http://localhost:8080');
  await smartWait(page, { waitForNetwork: true });

  // Select pricing tier
  await smartWait(page, { selector: SELECTORS.pricingCard[tier] });
  await page.click(SELECTORS.pricingCard[tier]);

  // Click start assessment
  await smartWait(page, { selector: SELECTORS.startAssessment });
  await page.click(SELECTORS.startAssessment);

  // Select assessment track
  await smartWait(page, { selector: SELECTORS.assessmentTrack[track] });
  await page.click(SELECTORS.assessmentTrack[track]);

  // Select mode
  await smartWait(page, { selector: SELECTORS.assessmentMode[mode] });
  await page.click(SELECTORS.assessmentMode[mode]);

  // Select style if visible
  const styleSelector = SELECTORS.assessmentStyle[style];
  const styleVisible = await page.isVisible(styleSelector).catch(() => false);
  if (styleVisible) {
    await page.click(styleSelector);
  }

  // Wait for questions to load
  await smartWait(page, { selector: SELECTORS.questionText, timeout: 15000 });

  return true;
}

/**
 * Batch multiple API requests for parallel execution
 */
export async function batchApiRequests(page, requests) {
  const promises = requests.map(({ endpoint, data, name }) =>
    makeApiRequestWithRetry(page, endpoint, data)
      .then(async response => ({
        name,
        response,
        data: await response.json()
      }))
      .catch(error => ({
        name,
        error: error.message
      }))
  );

  return Promise.all(promises);
}

/**
 * Validate adaptive API response structure
 */
export function validateAdaptiveResponse(result, expectedTier = 'free') {
  expect(result.success).toBe(true);
  expect(result.questions).toBeDefined();
  expect(Array.isArray(result.questions)).toBe(true);
  expect(result.tier).toBe(expectedTier);
  expect(result.assessmentType).toBeDefined();
  expect(result.adaptiveMetadata).toBeDefined();

  // Validate question structure
  if (result.questions.length > 0) {
    const firstQuestion = result.questions[0];
    expect(firstQuestion.id).toBeDefined();
    expect(firstQuestion.text).toBeDefined();
    expect(firstQuestion.trait).toBeDefined();
    expect(firstQuestion.options).toBeDefined();
    expect(Array.isArray(firstQuestion.options)).toBe(true);
  }

  return true;
}

/**
 * Check trait coverage for personality assessments
 */
export function validateTraitCoverage(traitCoverage, tier = 'free') {
  const minCoverage = tier === 'free' ? 2 : tier === 'core' ? 5 : 12;
  const maxCoverage = tier === 'free' ? 6 : tier === 'core' ? 12 : 20;

  BIG_FIVE_TRAITS.forEach(trait => {
    expect(traitCoverage[trait]).toBeGreaterThanOrEqual(minCoverage);
    expect(traitCoverage[trait]).toBeLessThanOrEqual(maxCoverage);
  });

  return true;
}

/**
 * Setup test environment with proper cleanup
 */
export async function setupTestEnvironment(page) {
  // Set default viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  // Wait for services to be ready
  const healthCheck = await page.request.get(`${API_ENDPOINTS.baseUrl}${API_ENDPOINTS.health}`);
  expect(healthCheck.ok()).toBe(true);

  return true;
}

/**
 * Mobile device configurations for testing
 */
export const MOBILE_DEVICES = {
  critical: ['iPhone 12', 'Pixel 5'], // For CI
  comprehensive: ['iPhone 12', 'iPhone SE', 'Pixel 5', 'Galaxy S8+'] // For nightly
};

/**
 * Extract response times from API calls for performance tracking
 */
export async function measureApiPerformance(page, endpoint, data) {
  const startTime = Date.now();
  const response = await makeApiRequestWithRetry(page, endpoint, data);
  const endTime = Date.now();

  return {
    endpoint,
    responseTime: endTime - startTime,
    status: response.status(),
    ok: response.ok()
  };
}

/**
 * Helper to take screenshots only on failure
 */
export async function conditionalScreenshot(page, testInfo, name) {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach(name, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    });
  }
}

/**
 * Add delay between tests to reduce rate limiting (backwards compatibility)
 */
export async function addTestDelay(ms = 500) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Export all helpers as default object for convenience
export default {
  SELECTORS,
  API_ENDPOINTS,
  TEST_TIERS,
  BIG_FIVE_TRAITS,
  MOBILE_DEVICES,
  smartWait,
  makeApiRequestWithRetry,
  navigateToAssessment,
  batchApiRequests,
  validateAdaptiveResponse,
  validateTraitCoverage,
  setupTestEnvironment,
  measureApiPerformance,
  conditionalScreenshot,
  addTestDelay
};
