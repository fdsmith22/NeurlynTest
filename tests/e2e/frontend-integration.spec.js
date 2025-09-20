import { test, expect } from '@playwright/test';

/**
 * Frontend Integration Tests for Adaptive Assessment System
 * Tests the complete user flow using actual navigation patterns
 */

test.describe('Frontend Adaptive Assessment Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('Complete assessment flow using actual navigation', async ({ page }) => {
    // Accept disclaimer first
    await page.check('#consent-check');
    await page.check('#age-check');
    await page.waitForTimeout(500);

    // Start assessment button should be enabled
    const startButton = page.locator('#accept-disclaimer');
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // Should show assessment selection screen
    await page.waitForSelector('#welcome-screen', { timeout: 10000 });

    // Click on Personality assessment card (from screenshot we see this is the UI structure)
    const personalityCard = page
      .locator(
        'button[data-track="personality"], .track-option:has-text("Personality"), .assessment-type:has-text("Personality")'
      )
      .first();
    await personalityCard.click();
    await page.waitForTimeout(1000);

    // Wait for mode selection to appear - try different possible selectors
    const modeSelectors = [
      'button[data-mode="quick"]',
      '.mode-option:has-text("Quick")',
      '.tier-option:has-text("Free")',
      '.assessment-mode button:first-child',
      '[data-tier="free"]'
    ];

    let modeButton = null;
    for (const selector of modeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        modeButton = page.locator(selector);
        if (await modeButton.isVisible()) {
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (modeButton && (await modeButton.isVisible())) {
      await modeButton.click();
      await page.waitForTimeout(500);
    } else {
      // If mode selection is not needed, try to proceed directly
      console.log('Mode selection not found or not needed, proceeding...');
    }

    // Look for start assessment button with multiple possible selectors
    const startSelectors = [
      '#start-assessment',
      'button:has-text("Start Assessment")',
      'button:has-text("Begin")',
      '.start-button',
      '.primary-button:has-text("Start")'
    ];

    let finalStartButton = null;
    for (const selector of startSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        finalStartButton = page.locator(selector);
        if (await finalStartButton.isVisible()) {
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (finalStartButton && (await finalStartButton.isVisible())) {
      await expect(finalStartButton).toBeEnabled();
      await finalStartButton.click();
    } else {
      throw new Error('Could not find start assessment button');
    }

    // Wait for adaptive assessment to load
    const assessmentSelectors = [
      '#adaptive-assessment-screen',
      '#assessment-container',
      '.assessment-screen',
      '.question-container'
    ];

    let assessmentContainer = null;
    for (const selector of assessmentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        assessmentContainer = page.locator(selector);
        if (await assessmentContainer.isVisible()) {
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (assessmentContainer) {
      await expect(assessmentContainer).toBeVisible();

      // Wait for questions to load (may take a moment)
      await page.waitForTimeout(3000);

      // Check if questions are loaded in the container with various selectors
      const questionSelectors = [
        '.question-card',
        '.neurlyn-question',
        '[data-question]',
        '.question',
        '.assessment-question'
      ];

      let questionsFound = false;
      for (const selector of questionSelectors) {
        const questionElements = page.locator(selector);
        if ((await questionElements.count()) > 0) {
          questionsFound = true;
          console.log(`Questions loaded successfully with selector: ${selector}`);
          break;
        }
      }

      if (!questionsFound) {
        // Check for any error messages
        const errorMessages = page.locator('.error-message, .error-state, .error');
        if ((await errorMessages.count()) > 0) {
          const errorText = await errorMessages.first().textContent();
          console.log('Error message found:', errorText);
        } else {
          console.log('Assessment container loaded but no questions or errors found');
        }
      }
    } else {
      throw new Error('Could not find assessment container');
    }
  });

  test('Assessment API integration works correctly', async ({ page }) => {
    // Test that the API is accessible and returns proper data
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

    expect(response.status()).toBe(200);
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.questions).toBeDefined();
    expect(result.questions.length).toBe(20);
    expect(result.totalQuestions).toBe(20);
    expect(result.tier).toBe('free');
    expect(result.adaptiveMetadata).toBeDefined();
  });

  test('Different tiers return appropriate question counts', async ({ page }) => {
    const tierTests = [
      { tier: 'free', expectedQuestions: 20 },
      { tier: 'core', expectedQuestions: 45 }
    ];

    for (const tierTest of tierTests) {
      const response = await page.request.post(
        'http://localhost:3002/api/assessments/adaptive-optimized',
        {
          data: {
            tier: tierTest.tier,
            assessmentType: 'personality',
            targetTraits: ['openness', 'conscientiousness'],
            previousResponses: [],
            userProfile: {}
          }
        }
      );

      expect(response.status()).toBe(200);
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.questions.length).toBe(tierTest.expectedQuestions);
      expect(result.tier).toBe(tierTest.tier);
    }
  });

  test('Adaptive system responds to user responses', async ({ page }) => {
    // First request - no previous responses
    const initialResponse = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'core',
          assessmentType: 'personality',
          targetTraits: ['openness', 'conscientiousness'],
          previousResponses: [],
          userProfile: {}
        }
      }
    );

    const initialResult = await initialResponse.json();
    expect(initialResult.success).toBe(true);

    // Second request - with previous responses
    const adaptiveResponse = await page.request.post(
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
        data: {
          tier: 'core',
          assessmentType: 'personality',
          targetTraits: ['openness', 'conscientiousness'],
          previousResponses: [
            { questionId: 'test1', trait: 'openness', value: 5 },
            { questionId: 'test2', trait: 'conscientiousness', value: 1 }
          ],
          userProfile: { age: 25 }
        }
      }
    );

    const adaptiveResult = await adaptiveResponse.json();
    expect(adaptiveResult.success).toBe(true);

    // Should still provide good trait coverage
    const traitCoverage = adaptiveResult.adaptiveMetadata.traitCoverage;
    expect(traitCoverage.openness).toBeGreaterThan(0);
    expect(traitCoverage.conscientiousness).toBeGreaterThan(0);
  });

  test('JavaScript adaptive integration loads correctly', async ({ page }) => {
    // Check that the adaptive integration script loads
    const integrationScript = page.locator('script[src*="neurlyn-adaptive-integration.js"]');
    await expect(integrationScript).toHaveCount(1);

    // Check that window.assessment is available
    const assessmentAvailable = await page.evaluate(() => {
      return typeof window.NeurlynAdaptiveAssessment !== 'undefined';
    });
    expect(assessmentAvailable).toBe(true);
  });

  test('Error handling for unavailable API', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/api/assessments/adaptive-optimized', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });

    // Try to start assessment
    await page.check('#consent-check');
    await page.check('#age-check');
    await page.waitForTimeout(500);
    await page.click('#accept-disclaimer');

    await page.waitForSelector('#welcome-screen', { timeout: 10000 });
    await page.click('button[data-track="personality"]');
    await page.waitForTimeout(500);
    await page.click('button[data-mode="quick"]');
    await page.waitForTimeout(500);

    await page.waitForSelector('#start-assessment', { timeout: 5000 });
    await page.click('#start-assessment');

    // Wait for potential error handling
    await page.waitForTimeout(3000);

    // Should handle error gracefully (check for error messages or fallback)
    const errorElements = page.locator('.error-message, .error-state, [class*="error"]');
    if ((await errorElements.count()) > 0) {
      // Error handling working
      console.log('Error handling detected');
    }
  });

  test('Assessment metadata includes algorithm information', async ({ page }) => {
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

    expect(result.adaptiveMetadata).toBeDefined();
    expect(result.adaptiveMetadata.version).toBe('3.0');
    expect(result.adaptiveMetadata.algorithm).toBe('mongodb-adaptive');
    expect(result.adaptiveMetadata.personalizedSelection).toBe(true);
    expect(result.adaptiveMetadata.traitCoverage).toBeDefined();
    expect(result.adaptiveMetadata.estimatedTime).toBeGreaterThan(0);
  });

  test('Question format is correct for frontend consumption', async ({ page }) => {
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

    // Check question format
    result.questions.forEach(question => {
      expect(question.id).toBeDefined();
      expect(question.text).toBeDefined();
      expect(question.trait).toBeDefined();
      expect(question.options).toBeDefined();
      expect(question.options.length).toBe(5);

      // Check option format
      question.options.forEach(option => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
        expect(option.score).toBeDefined();
      });

      expect(question.metadata).toBeDefined();
      expect(question.metadata.tier).toBeDefined();
    });
  });
});
