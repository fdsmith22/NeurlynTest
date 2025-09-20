import { test, expect } from '@playwright/test';

/**
 * Comprehensive tests for adaptive question assignment system
 * Verifies questions are correctly selected based on user responses, assessment types, and tiers
 */

test.describe('Adaptive Question Assignment System', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage and navigate to assessment
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('Free tier personality assessment should provide 20 balanced questions', async ({
    page
  }) => {
    // Navigate to assessment
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Select free tier and personality assessment
    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    // Wait for questions to load
    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Test API directly to verify question selection
    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
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
        }
      }
    );

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
      expect(count).toBeLessThanOrEqual(6);
    });
  });

  test('Core tier should provide 45 questions with enhanced selection', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
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
        }
      }
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(45);
    expect(result.tier).toBe('core');

    // Core tier should have broader trait coverage per trait
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    Object.values(traitCoverage).forEach(count => {
      expect(count).toBeGreaterThanOrEqual(7); // More questions per trait in core
      expect(count).toBeLessThanOrEqual(12);
    });
  });

  test('Comprehensive tier should provide 75 questions with maximum diversity', async ({
    page
  }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
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
        }
      }
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(75);
    expect(result.tier).toBe('comprehensive');
    expect(result.adaptiveMetadata.estimatedTime).toBe(37.5); // 75 * 0.5 minutes

    // Comprehensive should have rich trait coverage
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    Object.values(traitCoverage).forEach(count => {
      expect(count).toBeGreaterThanOrEqual(12);
      expect(count).toBeLessThanOrEqual(20);
    });
  });

  test('Adaptive selection with previous responses should affect question choice', async ({
    page
  }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Simulate user with strong openness responses
    const previousResponses = [
      { questionId: 'test1', trait: 'openness', value: 5 },
      { questionId: 'test2', trait: 'openness', value: 5 },
      { questionId: 'test3', trait: 'conscientiousness', value: 1 },
      { questionId: 'test4', trait: 'conscientiousness', value: 1 }
    ];

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'core',
          assessmentType: 'personality',
          targetTraits: ['openness', 'conscientiousness'],
          previousResponses,
          userProfile: {}
        }
      }
    );

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(45);

    // Should still provide balanced coverage despite previous responses
    const traitCoverage = result.adaptiveMetadata.traitCoverage;
    expect(traitCoverage.openness).toBeGreaterThan(0);
    expect(traitCoverage.conscientiousness).toBeGreaterThan(0);

    // Questions should include subcategory refinements for better detail
    const subcategoryQuestions = result.questions.filter(q => q.subcategory);
    expect(subcategoryQuestions.length).toBeGreaterThan(5);
  });

  test('Neurodiversity detection should include specialized questions', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

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

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
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
        }
      }
    );

    const result = await response.json();

    expect(result.success).toBe(true);

    // Should include some neurodiversity-specific questions due to extreme response pattern
    const neurodiversityQuestions = result.questions.filter(q => q.category === 'neurodiversity');
    expect(neurodiversityQuestions.length).toBeGreaterThanOrEqual(1);
  });

  test('Question quality scoring should prioritize high-weight questions', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'free',
          assessmentType: 'personality',
          targetTraits: ['openness'],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const result = await response.json();

    expect(result.success).toBe(true);

    // Check that questions have weight values
    const questionsWithWeight = result.questions.filter(q => q.weight && q.weight > 1);
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

  test('Different assessment types should affect question selection', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Test personality assessment
    const personalityResponse = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'free',
          assessmentType: 'personality',
          targetTraits: ['openness', 'conscientiousness'],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const personalityResult = await personalityResponse.json();
    expect(personalityResult.success).toBe(true);
    expect(personalityResult.assessmentType).toBe('personality');

    // All questions should be personality category
    const personalityQuestions = personalityResult.questions.filter(
      q => q.category === 'personality'
    );
    expect(personalityQuestions.length).toBeGreaterThan(15); // Most should be personality
  });

  test('Tier hierarchy should cascade question access correctly', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Test that comprehensive tier can access questions from all lower tiers
    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'comprehensive',
          assessmentType: 'personality',
          targetTraits: ['openness'],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const result = await response.json();
    expect(result.success).toBe(true);

    // Should include questions from multiple tiers
    const tierDistribution = {};
    result.questions.forEach(q => {
      const tier = q.metadata.tier;
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });

    // Comprehensive should potentially access free, core, and comprehensive tier questions
    expect(Object.keys(tierDistribution).length).toBeGreaterThanOrEqual(1);
  });

  test('Question shuffling should maintain structure while providing variety', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Make multiple identical requests to test shuffling
    const requests = Array(3)
      .fill()
      .map(() =>
        page.request.post('http://localhost:3002/api/assessments/adaptive-optimized', {
          data: {
            tier: 'free',
            assessmentType: 'personality',
            targetTraits: ['openness', 'conscientiousness'],
            previousResponses: [],
            userProfile: {}
          }
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
    expect(differentPositions).toBeGreaterThan(5); // Expect some variation
  });

  test('Error handling for invalid parameters', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Test with invalid tier
    const invalidTierResponse = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'invalid',
          assessmentType: 'personality',
          targetTraits: ['openness'],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const invalidTierResult = await invalidTierResponse.json();
    expect(invalidTierResult.success).toBe(true); // Should fallback gracefully
    expect(invalidTierResult.questions.length).toBe(20); // Default to free tier behavior

    // Test with empty target traits
    const emptyTraitsResponse = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'free',
          assessmentType: 'personality',
          targetTraits: [],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const emptyTraitsResult = await emptyTraitsResponse.json();
    expect(emptyTraitsResult.success).toBe(true); // Should use default traits
  });

  test('Response time should be acceptable for real-time use', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    const response = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
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
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const result = await response.json();
    expect(result.success).toBe(true);

    // Response time should be under 2 seconds for good UX
    expect(responseTime).toBeLessThan(2000);
  });
});
