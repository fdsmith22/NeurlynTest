import { test, expect, devices } from '@playwright/test';

/**
 * Mobile Viewport Testing Suite
 * Tests layouts across different device viewports
 */

const MOBILE_DEVICES = [
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Galaxy S9+', device: devices['Galaxy S9+'] },
  { name: 'iPad Mini', device: devices['iPad Mini'] },
  { name: 'iPad Pro 11', device: devices['iPad Pro 11'] }
];

const CRITICAL_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/assessment.html', name: 'Assessment' },
  { path: '/monitoring-dashboard.html', name: 'Dashboard' }
];

test.describe('Mobile Viewport Compatibility Tests', () => {
  MOBILE_DEVICES.forEach(({ name, device }) => {
    test.describe(`${name} viewport`, () => {
      test.use(device);

      CRITICAL_PAGES.forEach(({ path, name: pageName }) => {
        test(`${pageName} should render correctly`, async ({ page }) => {
          await page.goto(path);

          // Check no horizontal scroll
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = await page.evaluate(() => window.innerWidth);
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance

          // Check critical elements are visible
          const navigation = page.locator('nav, .navbar, .main-nav').first();
          await expect(navigation).toBeVisible();

          // Check footer is accessible (not fixed overlapping)
          const footer = page.locator('footer, .footer').first();
          if ((await footer.count()) > 0) {
            const footerPosition = await footer.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.position;
            });

            if (footerPosition === 'fixed') {
              // Check footer doesn't overlap content
              const footerHeight = await footer.evaluate(el => el.offsetHeight);
              const lastElement = page.locator('body > *:last-child');
              const lastElementBottom = await lastElement.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.bottom;
              });
              const viewportHeight = await page.evaluate(() => window.innerHeight);

              expect(lastElementBottom).toBeLessThanOrEqual(viewportHeight - footerHeight);
            }
          }

          // Check text is readable (not too small)
          const bodyFontSize = await page.evaluate(() => {
            const style = window.getComputedStyle(document.body);
            return parseInt(style.fontSize);
          });
          expect(bodyFontSize).toBeGreaterThanOrEqual(14);

          // Take screenshot for visual review
          await page.screenshot({
            path: `screenshots/${name.replace(/ /g, '-')}-${pageName.toLowerCase()}.png`,
            fullPage: true
          });
        });

        test(`${pageName} pricing cards should be properly sized`, async ({ page }) => {
          await page.goto(path);

          const pricingCards = page.locator('.pricing-card');
          const cardCount = await pricingCards.count();

          if (cardCount > 0) {
            for (let i = 0; i < cardCount; i++) {
              const card = pricingCards.nth(i);

              // Check card is visible
              await expect(card).toBeVisible();

              // Check card width doesn't overflow
              const cardBox = await card.boundingBox();
              if (cardBox) {
                expect(cardBox.width).toBeLessThanOrEqual(viewportWidth);
                expect(cardBox.width).toBeGreaterThan(200); // Minimum usable width
              }

              // Check text isn't truncated
              const hasOverflow = await card.evaluate(el => {
                return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
              });
              expect(hasOverflow).toBe(false);
            }
          }
        });

        test(`${pageName} touch targets should be adequate`, async ({ page }) => {
          await page.goto(path);

          // Check all buttons and links have adequate touch target size
          const interactiveElements = page.locator(
            'button, a, input[type="checkbox"], input[type="radio"]'
          );
          const elementCount = await interactiveElements.count();

          for (let i = 0; i < Math.min(elementCount, 10); i++) {
            // Check first 10 elements
            const element = interactiveElements.nth(i);
            const box = await element.boundingBox();

            if (box && (await element.isVisible())) {
              // Minimum touch target size should be 44x44px (iOS guideline)
              expect(box.width).toBeGreaterThanOrEqual(44);
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }
        });
      });
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle portrait to landscape transition', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');

      // Take portrait screenshot
      await page.screenshot({ path: 'screenshots/orientation-portrait.png' });

      // Switch to landscape
      await page.setViewportSize({ width: 812, height: 375 });

      // Check layout adjusts properly
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

      // Take landscape screenshot
      await page.screenshot({ path: 'screenshots/orientation-landscape.png' });
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const BREAKPOINTS = [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Medium', width: 375, height: 667 },
      { name: 'Mobile Large', width: 414, height: 896 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop Small', width: 1024, height: 768 },
      { name: 'Desktop Large', width: 1920, height: 1080 }
    ];

    BREAKPOINTS.forEach(({ name, width, height }) => {
      test(`should render properly at ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');

        // Check no horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // Check pricing section specifically
        const pricingSection = page.locator('.pricing-section');
        if ((await pricingSection.count()) > 0) {
          const sectionBox = await pricingSection.boundingBox();
          if (sectionBox) {
            expect(sectionBox.width).toBeLessThanOrEqual(width);
          }
        }

        // Screenshot for visual regression testing
        await page.screenshot({
          path: `screenshots/breakpoint-${name.toLowerCase().replace(/ /g, '-')}.png`,
          fullPage: false
        });
      });
    });
  });
});
