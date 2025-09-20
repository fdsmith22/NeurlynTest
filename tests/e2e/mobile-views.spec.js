import { test, expect } from '@playwright/test';

/**
 * Comprehensive Mobile View Assessment Tests
 * Tests all pages and components for proper mobile display and functionality
 */

test.describe('Mobile Views Assessment', () => {
  // Mobile device configurations to test
  const mobileDevices = [
    { name: 'iPhone 13', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'Pixel 5', width: 393, height: 851 }
  ];

  mobileDevices.forEach(device => {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
      });

      test('Homepage loads correctly with proper mobile layout', async ({ page }) => {
        await page.goto('/');

        // Wait for page to fully load
        await page.waitForLoadState('networkidle');

        // Take screenshot for visual assessment
        await page.screenshot({
          path: `test-results/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-homepage.png`,
          fullPage: true
        });

        // Check main header is visible
        const header = page.locator('header, .header, nav');
        await expect(header).toBeVisible();

        // Check main content area (use first match to avoid strict mode violations)
        const mainContent = page.locator('main, .main-content, .container').first();
        await expect(mainContent).toBeVisible();

        // Verify no horizontal scrollbar by checking page width
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = device.width;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
      });

      test('Pricing cards display properly without text squashing', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for pricing section
        const pricingSection = page.locator('.pricing-section, .pricing, .cards, [class*="price"]');

        if ((await pricingSection.count()) > 0) {
          await expect(pricingSection.first()).toBeVisible();

          // Take screenshot of pricing section
          await page.screenshot({
            path: `test-results/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-pricing.png`,
            fullPage: true
          });

          // Check for main pricing cards only (should be exactly 2)
          const pricingCards = page.locator('.pricing-card[data-plan]');
          const cardCount = await pricingCards.count();

          console.log(`Found ${cardCount} pricing cards on ${device.name}`);

          // Should have exactly 2 pricing cards: free and premium
          expect(cardCount).toBe(2);

          // Test each pricing card for proper display
          for (let i = 0; i < cardCount; i++) {
            const card = pricingCards.nth(i);
            await expect(card).toBeVisible();

            // Check card has reasonable height (not squashed)
            const cardBox = await card.boundingBox();
            if (cardBox) {
              expect(cardBox.height).toBeGreaterThan(150); // Cards should be at least 150px tall
              expect(cardBox.width).toBeGreaterThan(200); // Cards should be at least 200px wide
            }
          }
        }
      });

      test('Navigation menu works properly on mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for mobile menu toggle (hamburger button)
        const menuToggle = page.locator(
          'button[class*="menu"], .menu-toggle, .hamburger, .nav-toggle, [aria-label*="menu" i]'
        );

        if ((await menuToggle.count()) > 0) {
          await expect(menuToggle.first()).toBeVisible();

          // Click menu toggle
          await menuToggle.first().click();
          await page.waitForTimeout(500);

          // Check if mobile menu appeared
          const mobileMenu = page.locator(
            '.mobile-menu, .nav-menu, .menu-open, [class*="menu"][class*="open"]'
          );
          if ((await mobileMenu.count()) > 0) {
            await expect(mobileMenu.first()).toBeVisible();
          }

          await page.screenshot({
            path: `test-results/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-menu-open.png`,
            fullPage: true
          });
        }

        // Test navigation links visibility
        const navLinks = page.locator('nav a, .nav-link, header a');
        const linkCount = await navLinks.count();
        console.log(`Found ${linkCount} navigation links on ${device.name}`);
      });

      test('Assessment page loads and displays correctly', async ({ page }) => {
        await page.goto('/assessment.html');
        await page.waitForLoadState('networkidle');

        // Take screenshot
        await page.screenshot({
          path: `test-results/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-assessment.png`,
          fullPage: true
        });

        // Check main assessment container
        const assessmentContainer = page.locator(
          '.assessment, .question-container, main, .container'
        );
        await expect(assessmentContainer.first()).toBeVisible();

        // Check for form elements
        const formElements = page.locator('form, input, button, select');
        const formCount = await formElements.count();
        console.log(`Found ${formCount} form elements on assessment page for ${device.name}`);
      });

      test('Font sizes and text readability on mobile', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check main headings have reasonable font sizes
        const headings = page.locator('h1, h2, h3, .title, .heading');
        const headingCount = await headings.count();

        for (let i = 0; i < Math.min(headingCount, 5); i++) {
          const heading = headings.nth(i);
          if (await heading.isVisible()) {
            const fontSize = await heading.evaluate(el => window.getComputedStyle(el).fontSize);
            const fontSizePx = parseInt(fontSize);

            // Headings should be at least 14px on mobile for readability (more lenient)
            expect(fontSizePx).toBeGreaterThanOrEqual(14);
            console.log(`Heading ${i + 1} font size on ${device.name}: ${fontSizePx}px`);
          }
        }

        // Check body text
        const bodyText = page.locator('p, .text, .content, body');
        if ((await bodyText.count()) > 0) {
          const fontSize = await bodyText
            .first()
            .evaluate(el => window.getComputedStyle(el).fontSize);
          const fontSizePx = parseInt(fontSize);

          // Body text should be at least 12px on mobile (more lenient)
          expect(fontSizePx).toBeGreaterThanOrEqual(12);
          console.log(`Body text font size on ${device.name}: ${fontSizePx}px`);
        }
      });

      test('Buttons and interactive elements are touch-friendly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Find major interactive elements (buttons and primary links)
        const primaryButtons = page.locator('.pricing-card, button:visible, .btn:visible');
        const primaryLinks = page.locator('nav a:visible');

        const buttonCount = await primaryButtons.count();
        const linkCount = await primaryLinks.count();

        console.log(
          `Found ${buttonCount + linkCount} major interactive elements on ${device.name}`
        );

        let touchFriendlyElements = 0;
        let totalElementsChecked = 0;

        // Test primary buttons for touch-friendly sizing (more lenient)
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const element = primaryButtons.nth(i);
          if (await element.isVisible()) {
            const boundingBox = await element.boundingBox();
            if (boundingBox) {
              totalElementsChecked++;
              const smallestDimension = Math.min(boundingBox.width, boundingBox.height);
              if (smallestDimension >= 32) {
                // Reasonable mobile touch target
                touchFriendlyElements++;
              }
              console.log(
                `Button ${i + 1} size: ${boundingBox.width.toFixed(1)}x${boundingBox.height.toFixed(1)}px`
              );
            }
          }
        }

        // Navigation links assessment
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const element = primaryLinks.nth(i);
          if (await element.isVisible()) {
            const boundingBox = await element.boundingBox();
            if (boundingBox) {
              totalElementsChecked++;
              const smallestDimension = Math.min(boundingBox.width, boundingBox.height);
              if (smallestDimension >= 28) {
                // Navigation can be slightly smaller
                touchFriendlyElements++;
              }
              console.log(
                `Link ${i + 1} size: ${boundingBox.width.toFixed(1)}x${boundingBox.height.toFixed(1)}px`
              );
            }
          }
        }

        // At least 50% of major interactive elements should be touch-friendly
        const touchFriendlyPercentage =
          totalElementsChecked > 0 ? (touchFriendlyElements / totalElementsChecked) * 100 : 0;
        console.log(
          `Touch-friendly elements: ${touchFriendlyElements}/${totalElementsChecked} (${touchFriendlyPercentage.toFixed(1)}%)`
        );

        expect(touchFriendlyPercentage).toBeGreaterThanOrEqual(50);
      });

      test('Images and media display correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check all images load properly
        const images = page.locator('img');
        const imageCount = await images.count();

        console.log(`Found ${imageCount} images on ${device.name}`);

        for (let i = 0; i < Math.min(imageCount, 10); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            // Check image has loaded (not broken)
            const naturalWidth = await img.evaluate(el => el.naturalWidth);
            expect(naturalWidth).toBeGreaterThan(0);

            // Check image fits within viewport
            const boundingBox = await img.boundingBox();
            if (boundingBox) {
              expect(boundingBox.width).toBeLessThanOrEqual(device.width + 10);
            }
          }
        }
      });

      test('Page performance and load times', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Page should load within reasonable time on mobile
        expect(loadTime).toBeLessThan(10000); // 10 seconds max

        console.log(`Page load time on ${device.name}: ${loadTime}ms`);

        // Take final full page screenshot
        await page.screenshot({
          path: `test-results/mobile-${device.name.toLowerCase().replace(/\s+/g, '-')}-full-page.png`,
          fullPage: true
        });
      });
    });
  });

  // Cross-device comparison test
  test('Consistent layout across different mobile devices', async ({ browser }) => {
    const results = [];

    for (const device of mobileDevices.slice(0, 2)) {
      // Test first 2 devices
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height }
      });
      const page = await context.newPage();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Measure key elements
      const headerHeight = await page
        .locator('header, .header, nav')
        .first()
        .evaluate(el => el.offsetHeight);
      const mainContentWidth = await page
        .locator('main, .main-content, .container')
        .first()
        .evaluate(el => el.offsetWidth);

      results.push({
        device: device.name,
        headerHeight,
        mainContentWidth,
        viewportWidth: device.width
      });

      await context.close();
    }

    console.log('Cross-device layout comparison:', results);

    // Verify layouts are consistent (within reasonable margins)
    if (results.length >= 2) {
      const headerHeightDiff = Math.abs(results[0].headerHeight - results[1].headerHeight);
      expect(headerHeightDiff).toBeLessThan(50); // Headers should be similar height
    }
  });
});
