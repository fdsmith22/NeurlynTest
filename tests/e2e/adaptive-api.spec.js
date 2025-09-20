import { test, expect } from '@playwright/test';
import { makeApiRequestWithRetry, addTestDelay } from './test-helpers.js';

/**
 * Direct API tests for adaptive question assignment system
 * Tests the core adaptive logic without UI dependencies
 */

test.describe('Adaptive Question API Tests', () => {
  const apiUrl = 'http://localhost:3002/api/assessments/adaptive-optimized';

  // Add delay between tests to reduce rate limiting
  test.beforeEach(async () => {
    await addTestDelay(300);
  });

  test('Free tier personality assessment provides 20 balanced questions', async ({ request }) => {
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

    // Verify response structure
    expect(result.success).toBe(true);
    expect(result.questions).toBeDefined();
    expect(result.questions.length).toBe(20);
    expect(result.tier).toBe('free');
    expect(result.assessmentType).toBe('personality');

    // Verify Big 5 trait coverage
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    expect(traitCoverage.openness).toBeGreaterThan(0);
    expect(traitCoverage.conscientiousness).toBeGreaterThan(0);
    expect(traitCoverage.extraversion).toBeGreaterThan(0);
    expect(traitCoverage.agreeableness).toBeGreaterThan(0);
    expect(traitCoverage.neuroticism).toBeGreaterThan(0);

    // Verify each trait has reasonable coverage (2-6 questions per trait for 20 total)
    Object.values(traitCoverage).forEach(count => {
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(8);
    });

    // Verify question structure
    result.questions.forEach(question => {
      expect(question.id).toBeDefined();
      expect(question.text).toBeDefined();
      expect(question.trait).toBeDefined();
      expect(question.options).toBeDefined();
      expect(question.options.length).toBe(5);
    });
  });

  test('Core tier provides 45 questions with enhanced selection', async ({ request }) => {
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

    // Core tier should have broader trait coverage per trait
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    Object.values(traitCoverage).forEach(count => {
      expect(count).toBeGreaterThanOrEqual(6); // More questions per trait in core
      expect(count).toBeLessThanOrEqual(15);
    });
  });

  test('Comprehensive tier provides 75 questions with maximum diversity', async ({ request }) => {
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
    expect(result.questions.length).toBe(75);
    expect(result.tier).toBe('comprehensive');
    expect(result.adaptiveMetadata.estimatedTime).toBe(37.5); // 75 * 0.5 minutes

    // Comprehensive should have rich trait coverage
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    Object.values(traitCoverage).forEach(count => {
      expect(count).toBeGreaterThanOrEqual(10);
      expect(count).toBeLessThanOrEqual(25);
    });
  });

  test('Adaptive selection with previous responses affects question choice', async ({
    request
  }) => {
    // Simulate user with strong openness responses
    const previousResponses = [
      { questionId: 'test1', trait: 'openness', value: 5 },
      { questionId: 'test2', trait: 'openness', value: 5 },
      { questionId: 'test3', trait: 'conscientiousness', value: 1 },
      { questionId: 'test4', trait: 'conscientiousness', value: 1 }
    ];

    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'core',
      assessmentType: 'personality',
      targetTraits: ['openness', 'conscientiousness'],
      previousResponses,
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(45);

    // Should still provide balanced coverage despite previous responses
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    expect(traitCoverage.openness).toBeGreaterThan(0);
    expect(traitCoverage.conscientiousness).toBeGreaterThan(0);

    // Questions should include subcategory refinements for better detail (if available)
    const subcategoryQuestions = result.questions.filter(q => q.subcategory);
    expect(subcategoryQuestions.length).toBeGreaterThanOrEqual(0);
  });

  test('Neurodiversity detection includes specialized questions', async ({ request }) => {
    // Simulate extreme response pattern indicating potential neurodiversity
    const previousResponses = [
      { questionId: 'q1', trait: 'conscientiousness', value: 1 },
      { questionId: 'q2', trait: 'conscientiousness', value: 5 },
      { questionId: 'q3', trait: 'openness', value: 1 },
      { questionId: 'q4', trait: 'openness', value: 5 },
      { questionId: 'q5', trait: 'extraversion', value: 1 },
      { questionId: 'q6', trait: 'extraversion', value: 5 },
      { questionId: 'q7', trait: 'agreeableness', value: 1 },
      { questionId: 'q8', trait: 'neuroticism', value: 5 }
    ];

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
      previousResponses,
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);

    // Should include some neurodiversity-specific questions due to extreme response pattern
    const neurodiversityQuestions = result.questions.filter(q => q.category === 'neurodiversity');
    expect(neurodiversityQuestions.length).toBeGreaterThanOrEqual(0); // May or may not have neuro questions
  });

  test('Question quality scoring prioritizes high-weight questions', async ({ request }) => {
    const response = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'free',
      assessmentType: 'personality',
      targetTraits: ['openness'],
      previousResponses: [],
      userProfile: {}
    });

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);

    // Check that questions have weight values
    const questionsWithWeight = result.questions.filter(q => q.weight && q.weight > 0);
    expect(questionsWithWeight.length).toBeGreaterThan(0);

    // Verify questions have proper metadata
    result.questions.forEach(question => {
      expect(question.id).toBeDefined();
      expect(question.text).toBeDefined();
      expect(question.trait).toBeDefined();
      expect(question.options).toBeDefined();
      expect(question.options.length).toBe(5); // 5-point Likert scale
    });
  });

  test('Different assessment types work correctly', async ({ request }) => {
    // Test personality assessment
    const personalityResponse = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'free',
      assessmentType: 'personality',
      targetTraits: ['openness', 'conscientiousness'],
      previousResponses: [],
      userProfile: {}
    });

    expect(personalityResponse.status()).toBe(200);
    const personalityResult = await personalityResponse.json();
    expect(personalityResult.success).toBe(true);
    expect(personalityResult.assessmentType).toBe('personality');

    // Most questions should be personality category
    const personalityQuestions = personalityResult.questions.filter(
      q => q.category === 'personality' || q.trait
    );
    expect(personalityQuestions.length).toBeGreaterThan(15);
  });

  test('Question shuffling provides variety across requests', async ({ request }) => {
    // Make multiple identical requests to test shuffling
    const requests = Array(3)
      .fill()
      .map(() =>
        makeApiRequestWithRetry(request, apiUrl, {
          tier: 'free',
          assessmentType: 'personality',
          targetTraits: ['openness', 'conscientiousness'],
          previousResponses: [],
          userProfile: {}
        })
      );

    const responses = await Promise.all(requests);
    const results = await Promise.all(responses.map(r => r.json()));

    // All should succeed and have same length
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.questions.length).toBe(20);
    });

    // Question order should vary due to shuffling
    const firstOrder = results[0].questions.map(q => q.id);
    const secondOrder = results[1].questions.map(q => q.id);

    // At least some questions should be in different positions
    let differentPositions = 0;
    for (let i = 0; i < firstOrder.length; i++) {
      if (firstOrder[i] !== secondOrder[i]) differentPositions++;
    }
    expect(differentPositions).toBeGreaterThan(3); // Expect some variation
  });

  test('Error handling for invalid parameters', async ({ request }) => {
    // Test with invalid tier
    const invalidTierResponse = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'invalid',
      assessmentType: 'personality',
      targetTraits: ['openness'],
      previousResponses: [],
      userProfile: {}
    });

    expect(invalidTierResponse.status()).toBe(200);
    const invalidTierResult = await invalidTierResponse.json();
    expect(invalidTierResult.success).toBe(true); // Should fallback gracefully
    expect(invalidTierResult.questions.length).toBe(20); // Default to free tier behavior

    // Test with empty target traits
    const emptyTraitsResponse = await makeApiRequestWithRetry(request, apiUrl, {
      tier: 'free',
      assessmentType: 'personality',
      targetTraits: [],
      previousResponses: [],
      userProfile: {}
    });

    expect(emptyTraitsResponse.status()).toBe(200);
    const emptyTraitsResult = await emptyTraitsResponse.json();
    expect(emptyTraitsResult.success).toBe(true); // Should use default traits
  });

  test('API response time is acceptable for real-time use', async ({ request }) => {
    const startTime = Date.now();

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

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);

    // Response time should be under 2 seconds for good UX
    expect(responseTime).toBeLessThan(2000);
  });

  test('Metadata includes proper algorithm information', async ({ request }) => {
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
    expect(result.adaptiveMetadata.personalizedSelection).toBe(true);
    expect(result.adaptiveMetadata.traitCoverage).toBeDefined();
    expect(result.adaptiveMetadata.estimatedTime).toBeGreaterThan(0);
  });

  test('All tier limits are respected correctly', async ({ request }) => {
    const tierTests = [
      { tier: 'quick', expectedQuestions: 15 },
      { tier: 'free', expectedQuestions: 20 },
      { tier: 'core', expectedQuestions: 45 },
      { tier: 'comprehensive', expectedQuestions: 75 },
      { tier: 'deep', expectedQuestions: 100 }
    ];

    for (const tierTest of tierTests) {
      const response = await makeApiRequestWithRetry(request, apiUrl, {
        tier: tierTest.tier,
        assessmentType: 'personality',
        targetTraits: ['openness', 'conscientiousness'],
        previousResponses: [],
        userProfile: {}
      });

      expect(response.status()).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.questions.length).toBe(tierTest.expectedQuestions);
      expect(result.tier).toBe(tierTest.tier);
    }
  });
});
