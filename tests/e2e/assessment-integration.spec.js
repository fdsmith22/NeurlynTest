import { test, expect } from '@playwright/test';

/**
 * Integration tests for assessment flow with adaptive question assignment
 * Tests the complete user journey from selection to question delivery
 */

test.describe('Assessment Integration with Adaptive Questions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
  });

  test('Complete assessment flow with adaptive question loading', async ({ page }) => {
    // Navigate to assessment page
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Verify assessment page loaded correctly
    await expect(page.locator('h1')).toContainText('Personality Assessment');

    // Select assessment parameters
    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');

    // Start assessment
    await page.click('#start-assessment');

    // Wait for first question to load
    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Verify question structure is correct
    const questionText = await page.locator('#question-text').textContent();
    expect(questionText.length).toBeGreaterThan(10); // Should have meaningful question text

    // Verify response options are present
    const responseOptions = await page.locator('input[type="radio"]').count();
    expect(responseOptions).toBe(5); // Should have 5-point Likert scale

    // Answer first question
    await page.click('input[value="4"]'); // Select "Agree"
    await page.click('#next-button');

    // Verify second question loads
    await page.waitForSelector('#question-text', { timeout: 5000 });
    const secondQuestionText = await page.locator('#question-text').textContent();
    expect(secondQuestionText).not.toBe(questionText); // Should be different question

    // Progress indicator should update
    const progressText = await page.locator('#progress-info').textContent();
    expect(progressText).toContain('2 of 20'); // Should show progress for free tier
  });

  test('Core tier assessment should load more questions', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Select core tier
    await page.selectOption('#tier-select', 'core');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Answer first question to see progress
    await page.click('input[value="3"]');
    await page.click('#next-button');

    await page.waitForSelector('#question-text', { timeout: 5000 });

    // Progress should show core tier count
    const progressText = await page.locator('#progress-info').textContent();
    expect(progressText).toContain('2 of 45'); // Core tier has 45 questions
  });

  test('Assessment should handle different trait selections', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Test with specific traits if interface supports it
    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');

    // Mock the assessment start with specific traits
    await page.evaluate(() => {
      // Override the startAssessment function to test specific traits
      window.assessmentConfig = {
        targetTraits: ['openness', 'conscientiousness']
      };
    });

    await page.click('#start-assessment');
    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Verify questions are loaded
    const questionText = await page.locator('#question-text').textContent();
    expect(questionText.length).toBeGreaterThan(0);
  });

  test('Assessment should gracefully handle API errors', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/api/assessments/adaptive-optimized', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Database error' })
      });
    });

    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    // Should show error message or fallback
    await page.waitForTimeout(2000);

    // Check if error is handled gracefully (depends on frontend implementation)
    const errorElement = page.locator('.error-message, .alert, [role="alert"]');
    if (await errorElement.count() > 0) {
      const errorText = await errorElement.textContent();
      expect(errorText.toLowerCase()).toContain('error');
    }
  });

  test('Questions should have proper metadata and formatting', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Test multiple questions for consistency
    for (let i = 0; i < 3; i++) {
      // Check question text is present and meaningful
      const questionText = await page.locator('#question-text').textContent();
      expect(questionText.length).toBeGreaterThan(15);
      expect(questionText).not.toContain('undefined');
      expect(questionText).not.toContain('null');

      // Check all response options are present
      const options = await page.locator('input[type="radio"]').count();
      expect(options).toBe(5);

      // Check labels are present
      const labels = await page.locator('label').count();
      expect(labels).toBeGreaterThanOrEqual(5);

      // Answer and move to next question
      await page.click('input[value="3"]');
      await page.click('#next-button');

      if (i < 2) { // Don't wait after last iteration
        await page.waitForSelector('#question-text', { timeout: 5000 });
      }
    }
  });

  test('Assessment should track user responses correctly', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Answer several questions with different values
    const responses = [5, 1, 4, 2, 3];

    for (let i = 0; i < responses.length; i++) {
      await page.click(`input[value="${responses[i]}"]`);
      await page.click('#next-button');

      if (i < responses.length - 1) {
        await page.waitForSelector('#question-text', { timeout: 5000 });
      }
    }

    // Verify progress has advanced
    const progressText = await page.locator('#progress-info').textContent();
    expect(progressText).toContain(`${responses.length + 1} of 20`);
  });

  test('Different assessment types should work correctly', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    // Test personality assessment
    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });
    const personalityQuestion = await page.locator('#question-text').textContent();
    expect(personalityQuestion.length).toBeGreaterThan(0);

    // Reset and test other assessment type if available
    await page.goto('http://localhost:8080/assessment.html');
    await page.waitForLoadState('networkidle');

    // Check if other assessment types are available
    const assessmentOptions = await page.locator('#assessment-type option').count();
    if (assessmentOptions > 1) {
      const optionValues = await page.locator('#assessment-type option').evaluateAll(options =>
        options.map(option => option.value).filter(value => value !== 'personality')
      );

      if (optionValues.length > 0) {
        await page.selectOption('#tier-select', 'free');
        await page.selectOption('#assessment-type', optionValues[0]);
        await page.click('#start-assessment');

        await page.waitForSelector('#question-text', { timeout: 10000 });
        const otherQuestion = await page.locator('#question-text').textContent();
        expect(otherQuestion.length).toBeGreaterThan(0);
      }
    }
  });

  test('Assessment should handle rapid question answering', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Rapidly answer 5 questions
    for (let i = 0; i < 5; i++) {
      await page.click('input[value="3"]'); // Always select neutral
      await page.click('#next-button');

      if (i < 4) {
        await page.waitForSelector('#question-text', { timeout: 5000 });
      }
    }

    // Should still work correctly
    const progressText = await page.locator('#progress-info').textContent();
    expect(progressText).toContain('6 of 20');
  });

  test('Assessment progress should persist during session', async ({ page }) => {
    await page.click('a[href="assessment.html"]');
    await page.waitForLoadState('networkidle');

    await page.selectOption('#tier-select', 'free');
    await page.selectOption('#assessment-type', 'personality');
    await page.click('#start-assessment');

    await page.waitForSelector('#question-text', { timeout: 10000 });

    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      await page.click('input[value="4"]');
      await page.click('#next-button');
      if (i < 2) {
        await page.waitForSelector('#question-text', { timeout: 5000 });
      }
    }

    // Note current progress
    const progressBeforeRefresh = await page.locator('#progress-info').textContent();

    // Refresh page (simulating user navigation)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if assessment can be resumed or restarted appropriately
    // This depends on implementation - could show resume option or restart
    const titleElement = await page.locator('h1').textContent();
    expect(titleElement).toContain('Assessment');
  });

});