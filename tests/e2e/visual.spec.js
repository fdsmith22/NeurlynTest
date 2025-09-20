import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of full page
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('homepage hero section snapshot', async ({ page }) => {
    await page.goto('/');

    const hero = page.locator('.hero, #hero, [class*="hero"]').first();
    await expect(hero).toHaveScreenshot('hero-section.png');
  });

  test('navigation bar snapshot', async ({ page }) => {
    await page.goto('/');

    const navbar = page.locator('nav, .navbar').first();
    await expect(navbar).toHaveScreenshot('navbar.png');
  });

  test('assessment page snapshot', async ({ page }) => {
    await page.goto('/assessment.html');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('assessment-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('mobile homepage snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('tablet homepage snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('dark mode snapshot if available', async ({ page }) => {
    await page.goto('/');

    // Try to toggle dark mode
    const darkModeToggle = page.locator('[class*="dark"], [class*="theme"], [aria-label*="theme"]');

    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.first().click();
      await page.waitForTimeout(500); // Wait for theme transition

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('question card snapshot', async ({ page }) => {
    await page.goto('/assessment.html');

    // Start assessment if needed
    const startButton = page.locator('button').filter({ hasText: /start|begin/i });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(1000);
    }

    const questionCard = page.locator('.question-card, .question, [class*="question"]').first();

    if (await questionCard.count() > 0) {
      await expect(questionCard).toHaveScreenshot('question-card.png');
    }
  });
});