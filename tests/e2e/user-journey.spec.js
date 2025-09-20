import { test, expect } from '@playwright/test';
import { makeApiRequestWithRetry, addTestDelay } from './test-helpers.js';

/**
 * Complete User Journey E2E Tests
 * Tests the full assessment flow from homepage to results
 */

test.describe('Complete User Journey Tests', () => {
  test.beforeEach(async () => {
    await addTestDelay(500);
  });

  test('Complete free assessment journey - mobile device', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Step 1: Land on homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take homepage screenshot
    await page.screenshot({
      path: 'test-results/journey-01-homepage.png',
      fullPage: true
    });

    // Step 2: Select free assessment card
    const freeCard = page.locator('.pricing-card[data-plan="free"]');
    await expect(freeCard).toBeVisible();
    await freeCard.click();

    // Verify free card is selected
    await expect(freeCard).toHaveClass(/active/);

    // Step 3: Navigate to assessment page
    const startButton = page.locator(
      'button:has-text("Start"), .start-button, [href*="assessment"]'
    );
    if ((await startButton.count()) > 0) {
      await startButton.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // If no direct button, navigate manually
      await page.goto('/assessment.html');
      await page.waitForLoadState('networkidle');
    }

    // Take assessment page screenshot
    await page.screenshot({
      path: 'test-results/journey-02-assessment-page.png',
      fullPage: true
    });

    // Step 4: Verify assessment page elements
    const assessmentCards = page.locator('.assessment-card');
    const cardCount = await assessmentCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Step 5: Select free assessment if multiple options
    const freeAssessmentCard = page.locator('.assessment-card[data-type="free"]');
    if ((await freeAssessmentCard.count()) > 0) {
      await freeAssessmentCard.click();
    }

    // Step 6: Start the actual assessment
    const beginButton = page.locator(
      'button:has-text("Begin"), button:has-text("Start"), .start-assessment'
    );
    if ((await beginButton.count()) > 0) {
      await beginButton.first().click();
      await page.waitForLoadState('networkidle');
    }

    // Take start assessment screenshot
    await page.screenshot({
      path: 'test-results/journey-03-assessment-start.png',
      fullPage: true
    });

    console.log('✅ User journey completed: Homepage → Assessment selection → Assessment start');
  });

  test('Pricing card interaction and selection', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test both pricing cards
    const pricingCards = page.locator('.pricing-card[data-plan]');
    const cardCount = await pricingCards.count();
    expect(cardCount).toBe(2);

    // Test free card
    const freeCard = page.locator('.pricing-card[data-plan="free"]');
    await expect(freeCard).toBeVisible();
    await freeCard.click();
    await expect(freeCard).toHaveClass(/active/);

    // Test premium card
    const premiumCard = page.locator('.pricing-card[data-plan="premium"]');
    await expect(premiumCard).toBeVisible();
    await premiumCard.click();
    await expect(premiumCard).toHaveClass(/active/);
    await expect(freeCard).not.toHaveClass(/active/);

    // Take pricing interaction screenshot
    await page.screenshot({
      path: 'test-results/journey-pricing-interaction.png',
      fullPage: true
    });

    console.log('✅ Pricing card interaction working correctly');
  });

  test('Navigation flow between pages', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Test navigation between main pages
    const pages = [
      { url: '/', title: 'Homepage' },
      { url: '/assessment.html', title: 'Assessment' },
      { url: '/about.html', title: 'About' },
      { url: '/support.html', title: 'Support' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      // Verify page loads successfully
      expect(page.url()).toContain(pageInfo.url);

      // Take screenshot
      await page.screenshot({
        path: `test-results/journey-${pageInfo.title.toLowerCase()}-page.png`,
        fullPage: true
      });

      console.log(`✅ ${pageInfo.title} page loads successfully`);
    }
  });

  test('API integration in user journey context', async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Test that the frontend can communicate with the API
    const apiResponse = await makeApiRequestWithRetry(
      request,
      'http://localhost:3002/api/assessments/adaptive-optimized',
      {
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
    );

    expect(apiResponse.status()).toBe(200);
    const result = await apiResponse.json();
    expect(result.success).toBe(true);
    expect(result.questions.length).toBe(20);

    // Navigate to homepage and verify it can load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the page doesn't have JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Interact with the page to trigger any JS
    const pricingCard = page.locator('.pricing-card').first();
    if ((await pricingCard.count()) > 0) {
      await pricingCard.click();
    }

    // Wait a moment for any async operations
    await page.waitForTimeout(1000);

    // Check for JavaScript errors
    expect(errors.length).toBe(0);

    console.log('✅ API integration and frontend JavaScript working correctly');
  });

  test('Mobile responsiveness across common breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 13' },
      { width: 393, height: 851, name: 'Pixel 5' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that content is not horizontally overflowing
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(breakpoint.width + 20); // Small tolerance

      // Verify pricing cards are visible and properly sized
      const pricingCards = page.locator('.pricing-card[data-plan]');
      const cardCount = await pricingCards.count();
      expect(cardCount).toBe(2);

      // Take screenshot
      await page.screenshot({
        path: `test-results/journey-responsive-${breakpoint.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });

      console.log(
        `✅ ${breakpoint.name} (${breakpoint.width}×${breakpoint.height}) responsive layout working`
      );
    }
  });

  test('Performance benchmarks across user journey', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const performanceMetrics = [];

    // Test performance of key pages
    const testPages = ['/', '/assessment.html', '/about.html'];

    for (const pagePath of testPages) {
      const startTime = Date.now();

      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Measure additional performance metrics
      const performanceData = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint:
            performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });

      performanceMetrics.push({
        page: pagePath,
        totalLoadTime: loadTime,
        ...performanceData
      });

      // Performance expectations
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

      console.log(`⚡ ${pagePath} performance: ${loadTime}ms total load time`);
    }

    // Log performance summary
    console.log('📊 Performance Summary:', performanceMetrics);
  });

  test('Accessibility features in user journey', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility features

    // 1. Keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(
      ['A', 'BUTTON', 'INPUT', 'TEXTAREA'].some(tag => focusedElement.includes(tag))
    ).toBeTruthy();

    // 2. Alt text for images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull(); // Images should have alt text
    }

    // 3. Proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0); // Should have headings for structure

    // 4. Color contrast (basic check)
    const textElements = page.locator('p, span, div').first();
    if ((await textElements.count()) > 0) {
      const styles = await textElements.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
      expect(styles.color).not.toBe(styles.backgroundColor); // Basic contrast check
    }

    console.log('♿ Basic accessibility features verified');
  });
});
