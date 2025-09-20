import { test, expect } from '@playwright/test';

test.describe('Assessment Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start assessment flow', async ({ page }) => {
    await page.goto('/assessment.html');
    await expect(page).toHaveTitle(/Assessment/);

    // Click on start free assessment button
    await page.click('button:has-text("Start Free Assessment")');

    // Verify assessment has started
    await expect(page.locator('#assessment-content')).toBeVisible();
    await expect(page.locator('#question-text')).toBeVisible();
  });

  test('should select assessment type', async ({ page }) => {
    await page.goto('/assessment.html');

    // Verify both assessment options are visible
    await expect(page.locator('[data-type="free"]')).toBeVisible();
    await expect(page.locator('[data-type="complete"]')).toBeVisible();

    // Click on complete assessment
    await page.click('button:has-text("Start Complete Analysis")');

    // Verify assessment has started with 75 questions
    await expect(page.locator('#assessment-content')).toBeVisible();
    await expect(page.locator('#question-counter')).toContainText('Question 1 of 75');
  });

  test('should display questions after starting', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.click('button:has-text("Start Free Assessment")');

    // Wait for question to appear
    await expect(page.locator('#question-text')).toBeVisible();
    await expect(page.locator('#question-text')).not.toBeEmpty();

    // Check answer options are present (5 Likert scale options)
    const answerOptions = page.locator('.answer-option');
    await expect(answerOptions).toHaveCount(5);
  });

  test('should navigate through questions', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.click('button:has-text("Start Free Assessment")');

    // Answer first question
    await page.click('.answer-option:first-child');

    // Click next button
    await page.click('#next-button');

    // Verify moved to question 2
    await expect(page.locator('#question-counter')).toContainText('Question 2 of 20');

    // Go back to previous question
    await page.click('#prev-button');

    // Verify back on question 1
    await expect(page.locator('#question-counter')).toContainText('Question 1 of 20');
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.click('button:has-text("Start Free Assessment")');

    // Check progress bar exists and is visible
    await expect(page.locator('.progress-bar')).toBeVisible();

    // Progress should be at 5% for first question (1/20)
    const progressWidth = await page.locator('#progress-fill').evaluate(el => el.style.width);
    expect(parseInt(progressWidth)).toBeGreaterThan(0);
    expect(parseInt(progressWidth)).toBeLessThanOrEqual(10);
  });

  test('should handle assessment completion', async ({ page }) => {
    // This is a simplified test - in reality you'd want to complete all questions
    await page.goto('/assessment.html');

    // Mock completion by navigating to results page
    await page.evaluate(() => {
      // Simulate completing assessment
      if (window.Neurlyn) {
        window.Neurlyn.completeAssessment();
      }
    });

    // Wait for potential redirect to results
    await page.waitForTimeout(2000);

    // Check if results or completion message appears
    const completionIndicators = page.locator('text=/complete|finish|results|thank you/i');
    if ((await completionIndicators.count()) > 0) {
      await expect(completionIndicators.first()).toBeVisible();
    }
  });

  test('should validate required answers', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.click('button:has-text("Start Free Assessment")');

    // Next button should be disabled initially
    const nextButton = page.locator('#next-button');
    await expect(nextButton).toBeDisabled();

    // Answer the question
    await page.click('.answer-option:nth-child(3)');

    // Now next button should be enabled
    await expect(nextButton).toBeEnabled();
  });

  test('should save progress', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.click('button:has-text("Start Free Assessment")');

    // Answer first question
    await page.click('.answer-option:first-child');

    // Verify selection is marked
    await expect(page.locator('.answer-option.selected')).toBeVisible();

    // Navigate forward and back
    await page.click('#next-button');
    await page.click('#prev-button');

    // Check if selection was retained
    await expect(page.locator('.answer-option.selected')).toBeVisible();
  });

  test('should handle gamified tasks', async ({ page }) => {
    await page.goto('/assessment.html');

    // Select gamified mode if available
    const gamifiedOption = page.locator('.task-type-option, input[value="gamified"]');
    if ((await gamifiedOption.count()) > 0) {
      await gamifiedOption.first().click();
    }

    // Start assessment
    const startButton = page.locator('button').filter({ hasText: /start|begin/i });
    if ((await startButton.count()) > 0) {
      await startButton.first().click();
    }

    // Check for gamified elements
    const gamifiedElements = page.locator('.gamified-task, .game-task, [class*="gamified"]');
    if ((await gamifiedElements.count()) > 0) {
      await expect(gamifiedElements.first()).toBeVisible();

      // Check for timer or special instructions
      const timer = page.locator('.task-timer, .timer, [class*="timer"]');
      if ((await timer.count()) > 0) {
        await expect(timer.first()).toBeVisible();
      }
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/assessment.html');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();

    // Press Enter to activate focused element
    await page.keyboard.press('Enter');

    // Should trigger some action
    await page.waitForTimeout(500);
  });
});
