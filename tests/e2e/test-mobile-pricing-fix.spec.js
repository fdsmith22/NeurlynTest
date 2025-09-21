const { test, expect } = require('@playwright/test');

test.describe('Mobile Pricing Cards Layout Fix', () => {
  test('Pricing cards should stack vertically on mobile', async ({ page }) => {
    // Test on iPhone 12 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    // Check pricing section layout
    const pricingSection = await page.locator('.pricing-section');
    const sectionStyles = await pricingSection.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        gap: styles.gap
      };
    });

    console.log('Pricing section styles:', sectionStyles);

    // Should be flex column
    expect(sectionStyles.display).toBe('flex');
    expect(sectionStyles.flexDirection).toBe('column');

    // Check individual cards
    const cards = await page.locator('.pricing-card').all();
    expect(cards.length).toBeGreaterThan(0);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardBox = await card.boundingBox();
      const viewportWidth = 390;

      console.log(`Card ${i + 1} width: ${cardBox.width}px (viewport: ${viewportWidth}px)`);

      // Cards should take full width
      expect(cardBox.width).toBeGreaterThan(350); // Should be nearly full width
      expect(cardBox.width).toBeLessThanOrEqual(viewportWidth);
    }

    // Check if cards are stacked vertically
    if (cards.length >= 2) {
      const firstCardBox = await cards[0].boundingBox();
      const secondCardBox = await cards[1].boundingBox();

      console.log(`First card Y: ${firstCardBox.y}, Second card Y: ${secondCardBox.y}`);

      // Second card should be below first card (higher Y value)
      expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height);
    }
  });

  test('Checkbox positioning and visibility', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    const checkboxes = await page.locator('.pricing-card-select').all();

    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i];
      const isVisible = await checkbox.isVisible();
      expect(isVisible).toBe(true);

      const box = await checkbox.boundingBox();
      console.log(`Checkbox ${i + 1} dimensions: ${box.width}x${box.height}px`);

      // Check minimum size for touch targets
      expect(box.width).toBeGreaterThanOrEqual(24);
      expect(box.height).toBeGreaterThanOrEqual(24);

      // Check position within card header
      const header = await checkbox.locator('xpath=..').first();
      const headerStyles = await header.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          flexDirection: styles.flexDirection,
          justifyContent: styles.justifyContent
        };
      });

      console.log(`Header ${i + 1} styles:`, headerStyles);
      expect(headerStyles.display).toBe('flex');
    }
  });

  test('Start assessment button visibility and size', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');

    const acceptButton = await page.locator('#accept-disclaimer');
    const isVisible = await acceptButton.isVisible();
    expect(isVisible).toBe(true);

    const box = await acceptButton.boundingBox();
    console.log(`Start button dimensions: ${box.width}x${box.height}px`);

    // Should meet minimum touch target size
    expect(box.height).toBeGreaterThanOrEqual(44);

    // Should be nearly full width on mobile
    expect(box.width).toBeGreaterThan(300);
  });

  test('Test on multiple mobile devices', async ({ page }) => {
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Mini', width: 360, height: 780 },
      { name: 'Pixel 5', width: 393, height: 851 }
    ];

    for (const device of devices) {
      console.log(`\nTesting on ${device.name}`);
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('http://localhost:8080');
      await page.waitForLoadState('networkidle');

      // Check pricing section
      const pricingSection = await page.locator('.pricing-section');
      const flexDirection = await pricingSection.evaluate(
        el => window.getComputedStyle(el).flexDirection
      );

      expect(flexDirection).toBe('column');
      console.log(`✓ ${device.name}: Cards stack vertically`);

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      expect(hasOverflow).toBe(false);
      console.log(`✓ ${device.name}: No horizontal overflow`);
    }
  });
});
