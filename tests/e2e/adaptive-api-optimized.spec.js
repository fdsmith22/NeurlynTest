import { test, expect } from '@playwright/test';
import { makeApiRequestWithRetry, addTestDelay } from './test-helpers.js';

/**
 * Optimized API tests with retry logic for rate limiting
 * Tests the core adaptive logic without UI dependencies
 */

test.describe('Adaptive Question API Tests - Optimized', () => {
  const apiUrl = 'http://localhost:3002/api/assessments/adaptive-optimized';

  // Add delay between tests to reduce rate limiting
  test.beforeEach(async () => {
    await addTestDelay(300);
  });

  test('Free tier provides 20 balanced questions', async ({ request }) => {
    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'free',
      assessmentType: 'personality',
      targetTraits: [
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism'
      ],
      previousResponses: [],
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions).toBeDefined();
    expect(result.questions.length).toBe(20);
    expect(result.tier).toBe('free');
  });

  test('Core tier provides 45 questions', async ({ request }) => {
    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'core',
      assessmentType: 'personality',
      targetTraits: [
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism'
      ],
      previousResponses: [],
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(45);
    expect(result.tier).toBe('core');
  });

  test('Comprehensive tier provides maximum available questions', async ({ request }) => {
    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'comprehensive',
      assessmentType: 'personality',
      targetTraits: [
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism'
      ],
      previousResponses: [],
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    // We have 61 personality questions from seed-master-questions.js
    // The API returns all available personality questions for comprehensive tier
    expect(result.questions.length).toBeGreaterThanOrEqual(61);
    expect(result.questions.length).toBeLessThanOrEqual(75); // Max limit is 75
    expect(result.tier).toBe('comprehensive');
  });

  test('API response includes proper metadata', async ({ request }) => {
    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'core',
      assessmentType: 'personality',
      targetTraits: ['openness', 'conscientiousness'],
      previousResponses: [],
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.adaptiveMetadata).toBeDefined();
    expect(result.adaptiveMetadata.version).toBe('3.0');
    expect(result.adaptiveMetadata.algorithm).toBe('mongodb-adaptive');
  });

  test('Response time is acceptable', async ({ request }) => {
    const startTime = Date.now();

    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'free',
      assessmentType: 'personality',
      targetTraits: ['openness'],
      previousResponses: [],
      userProfile: {}
    });

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(responseTime).toBeLessThan(3000); // Allow 3 seconds for retry logic
  });
});
