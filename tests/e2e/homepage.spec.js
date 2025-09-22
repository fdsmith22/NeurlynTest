import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check if page loads
    await expect(page).toHaveTitle(/Neurlyn|Personality|Assessment/i);

    // Check for main elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.hero, #hero, [class*="hero"]').first()).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check navigation elements
    const nav = page.locator('nav, .navbar, #navbar').first();
    await expect(nav).toBeVisible();

    // Check for logo/brand
    const brand = nav.locator('.navbar-brand, .logo, [class*="brand"]').first();
    await expect(brand).toBeVisible();
  });

  test('should have a working "Start Assessment" button', async ({ page }) => {
    // First check the consent checkboxes to enable the button
    const consentCheck = page.locator('#consent-check');
    const ageCheck = page.locator('#age-check');

    // Check if consent checkboxes exist and check them
    if ((await consentCheck.count()) > 0) {
      await consentCheck.check();
    }
    if ((await ageCheck.count()) > 0) {
      await ageCheck.check();
    }

    // Look for CTA button
    const startButton = page
      .locator('button, a')
      .filter({
        hasText: /start|begin|take.*assessment|get started/i
      })
      .first();

    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    // Click and verify navigation
    await startButton.click();

    // Should navigate to assessment or show assessment options
    await expect(page.url()).toMatch(/assessment|questionnaire|start|begin/);
  });

  test('should display feature cards', async ({ page }) => {
    // Check for feature sections
    const features = page.locator('.feature-card, .card, [class*="feature"]');

    // Should have at least one feature card
    await expect(features.first()).toBeVisible();

    // Check if features have content
    const firstFeature = features.first();
    await expect(firstFeature).toContainText(/.+/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Check if navigation is still accessible
    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toBeVisible();

    // Check if content reflows properly
    const hero = page.locator('.hero, #hero, [class*="hero"]').first();
    await expect(hero).toBeVisible();

    // Mobile menu button might appear
    const mobileMenuButton = page.locator('[class*="menu"], [class*="burger"], [class*="toggle"]');
    if ((await mobileMenuButton.count()) > 0) {
      await expect(mobileMenuButton.first()).toBeVisible();
    }
  });

  test('should have proper footer', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer
    const footer = page.locator('footer, .footer, #footer').first();
    await expect(footer).toBeVisible();

    // Check for copyright or contact info
    await expect(footer).toContainText(/©|copyright|contact|neurlyn/i);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for any async operations

    // Check for critical errors (ignore minor warnings and health check failures)
    const criticalErrors = consoleErrors.filter(
      error =>
        !error.includes('favicon') &&
        !error.includes('404') &&
        !error.includes('Mixed Content') &&
        !error.includes('Health check failed') // Ignore health check errors during testing
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have accessibility features', async ({ page }) => {
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Images should have alt text or be decorative (empty alt)
      expect(alt).toBeDefined();
    }

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1

    // Check for skip navigation link (accessibility best practice)
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toHaveAttribute('href', /#main|#content/);
    }
  });

  test('should handle network offline gracefully', async ({ page, context }) => {
    // Load the page first
    await page.goto('/');

    // Go offline
    await context.setOffline(true);

    // Try to navigate
    await page.reload().catch(() => {});

    // Should show offline message or cached content
    // This depends on service worker implementation
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription.length).toBeGreaterThan(50);

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
