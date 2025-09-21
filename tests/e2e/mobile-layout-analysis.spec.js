import { test, expect, devices } from '@playwright/test';

// Test different mobile viewports
const mobileDevices = [
  { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
  { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
  { name: 'Pixel 5', viewport: { width: 393, height: 851 } },
  { name: 'Galaxy S21', viewport: { width: 384, height: 854 } },
  { name: 'iPhone 12 Mini', viewport: { width: 360, height: 780 } }
];

test.describe('Mobile Layout Analysis', () => {
  for (const device of mobileDevices) {
    test(`Analyze layout on ${device.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(device.viewport);

      // Navigate to the main page
      await page.goto('http://localhost:8080');

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      console.log(
        `\n📱 Analyzing ${device.name} (${device.viewport.width}x${device.viewport.height})`
      );
      console.log('='.repeat(60));

      // Analyze Hero Section
      const heroSection = await analyzeHeroSection(page);
      console.log('\n🏠 Hero Section:');
      console.log(heroSection);

      // Analyze Pricing Cards
      const pricingAnalysis = await analyzePricingCards(page);
      console.log('\n💳 Pricing Cards:');
      console.log(pricingAnalysis);

      // Analyze Feature Items
      const featureAnalysis = await analyzeFeatureItems(page);
      console.log('\n✨ Feature Items:');
      console.log(featureAnalysis);

      // Check for overflow issues
      const overflowIssues = await checkOverflow(page);
      console.log('\n⚠️ Overflow Issues:');
      console.log(overflowIssues);

      // Check text rendering
      const textIssues = await checkTextRendering(page);
      console.log('\n📝 Text Rendering:');
      console.log(textIssues);

      // Take screenshots for visual reference
      await page.screenshot({
        path: `screenshots/mobile-${device.name.replace(/\s+/g, '-').toLowerCase()}-full.png`,
        fullPage: true
      });

      // Scroll to pricing section and capture
      await page.evaluate(() => {
        const pricingSection = document.querySelector('.pricing-section');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `screenshots/mobile-${device.name.replace(/\s+/g, '-').toLowerCase()}-pricing.png`
      });
    });
  }
});

async function analyzeHeroSection(page) {
  return await page.evaluate(() => {
    const analysis = { issues: [], measurements: {} };

    // Find hero title
    const heroTitle = document.querySelector('h1');
    if (heroTitle) {
      const styles = window.getComputedStyle(heroTitle);
      const rect = heroTitle.getBoundingClientRect();

      analysis.measurements.title = {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        width: rect.width,
        height: rect.height,
        writingMode: styles.writingMode,
        transform: styles.transform,
        overflow: styles.overflow
      };

      // Check for vertical text
      if (styles.writingMode && styles.writingMode !== 'horizontal-tb') {
        analysis.issues.push('❌ Title has vertical writing mode: ' + styles.writingMode);
      }

      // Check for overflow
      if (rect.width > window.innerWidth) {
        analysis.issues.push(
          `❌ Title overflows viewport: ${rect.width}px > ${window.innerWidth}px`
        );
      }

      // Check font size
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 14) {
        analysis.issues.push(`⚠️ Title font too small: ${fontSize}px`);
      } else if (fontSize > 40) {
        analysis.issues.push(`⚠️ Title font too large for mobile: ${fontSize}px`);
      } else {
        analysis.issues.push(`✅ Title font size appropriate: ${fontSize}px`);
      }
    }

    // Find hero description
    const heroDesc = document.querySelector('p[style*="Inter"]');
    if (heroDesc) {
      const styles = window.getComputedStyle(heroDesc);
      const rect = heroDesc.getBoundingClientRect();

      analysis.measurements.description = {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        width: rect.width
      };

      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 12) {
        analysis.issues.push(`⚠️ Description font too small: ${fontSize}px`);
      } else {
        analysis.issues.push(`✅ Description font size appropriate: ${fontSize}px`);
      }
    }

    return analysis;
  });
}

async function analyzePricingCards(page) {
  return await page.evaluate(() => {
    const analysis = { issues: [], cards: [] };

    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach((card, index) => {
      const cardAnalysis = { index, issues: [] };
      const rect = card.getBoundingClientRect();
      const styles = window.getComputedStyle(card);

      // Check card dimensions
      cardAnalysis.width = rect.width;
      cardAnalysis.height = rect.height;

      // Check if card fits in viewport
      if (rect.width > window.innerWidth) {
        cardAnalysis.issues.push(
          `❌ Card ${index + 1} overflows: ${rect.width}px > ${window.innerWidth}px`
        );
      } else {
        cardAnalysis.issues.push(`✅ Card ${index + 1} fits viewport`);
      }

      // Check header layout
      const header = card.querySelector('.pricing-card-header');
      if (header) {
        const headerStyles = window.getComputedStyle(header);
        const flexDirection = headerStyles.flexDirection;

        if (flexDirection === 'column') {
          cardAnalysis.issues.push(`❌ Header has vertical layout (flex-direction: column)`);
        } else {
          cardAnalysis.issues.push(`✅ Header has horizontal layout`);
        }
      }

      // Check title
      const title = card.querySelector('.pricing-card-title');
      if (title) {
        const titleStyles = window.getComputedStyle(title);
        const titleRect = title.getBoundingClientRect();

        // Check for vertical text
        if (titleStyles.writingMode && titleStyles.writingMode !== 'horizontal-tb') {
          cardAnalysis.issues.push(`❌ Title has vertical text: ${titleStyles.writingMode}`);
        }

        // Check if text is truncated
        if (title.scrollWidth > title.clientWidth) {
          cardAnalysis.issues.push(`⚠️ Title text may be truncated`);
        }
      }

      // Check checkbox alignment
      const checkbox = card.querySelector('.pricing-card-select');
      if (checkbox && header) {
        const checkboxRect = checkbox.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();

        // Check if checkbox is on the right
        if (checkboxRect.left < headerRect.left + headerRect.width / 2) {
          cardAnalysis.issues.push(`❌ Checkbox not aligned to the right`);
        } else {
          cardAnalysis.issues.push(`✅ Checkbox properly aligned`);
        }
      }

      // Check features list
      const features = card.querySelectorAll('.pricing-card-features li');
      features.forEach((feature, fIndex) => {
        const featureStyles = window.getComputedStyle(feature);
        const flexDirection = featureStyles.flexDirection || featureStyles.display;

        if (flexDirection === 'column') {
          cardAnalysis.issues.push(`❌ Feature ${fIndex + 1} has vertical layout`);
        }

        // Check for icon and text alignment
        const svg = feature.querySelector('svg');
        if (svg) {
          const svgRect = svg.getBoundingClientRect();
          if (svgRect.width < 14 || svgRect.height < 14) {
            cardAnalysis.issues.push(`⚠️ Feature ${fIndex + 1} icon too small`);
          }
        }
      });

      analysis.cards.push(cardAnalysis);
    });

    return analysis;
  });
}

async function analyzeFeatureItems(page) {
  return await page.evaluate(() => {
    const analysis = { issues: [], items: [] };

    const featureItems = document.querySelectorAll('.feature-item');

    featureItems.forEach((item, index) => {
      const itemAnalysis = { index, issues: [] };
      const rect = item.getBoundingClientRect();
      const styles = window.getComputedStyle(item);

      // Check layout
      const flexDirection = styles.flexDirection || 'row';
      if (flexDirection === 'column' && window.innerWidth > 375) {
        itemAnalysis.issues.push(`⚠️ Feature item ${index + 1} has column layout on wider screen`);
      } else {
        itemAnalysis.issues.push(`✅ Feature item ${index + 1} layout appropriate`);
      }

      // Check overflow
      if (rect.width > window.innerWidth) {
        itemAnalysis.issues.push(`❌ Feature item ${index + 1} overflows viewport`);
      }

      // Check text
      const textElements = item.querySelectorAll('p, strong, span');
      textElements.forEach(text => {
        const textStyles = window.getComputedStyle(text);
        if (textStyles.writingMode && textStyles.writingMode !== 'horizontal-tb') {
          itemAnalysis.issues.push(`❌ Text has vertical writing mode`);
        }
      });

      analysis.items.push(itemAnalysis);
    });

    return analysis;
  });
}

async function checkOverflow(page) {
  return await page.evaluate(() => {
    const issues = [];
    const viewportWidth = window.innerWidth;

    // Check body overflow
    if (document.body.scrollWidth > viewportWidth) {
      issues.push(
        `❌ Body has horizontal overflow: ${document.body.scrollWidth}px > ${viewportWidth}px`
      );
    } else {
      issues.push(`✅ No horizontal overflow on body`);
    }

    // Check all elements for overflow
    const allElements = document.querySelectorAll('*');
    const overflowingElements = [];

    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > viewportWidth || rect.right > viewportWidth) {
        const tag = el.tagName.toLowerCase();
        const className = el.className || 'no-class';
        overflowingElements.push({
          element: `${tag}.${className}`,
          width: rect.width,
          right: rect.right
        });
      }
    });

    if (overflowingElements.length > 0) {
      issues.push(`❌ Found ${overflowingElements.length} overflowing elements:`);
      overflowingElements.slice(0, 5).forEach(el => {
        issues.push(`  - ${el.element}: width=${el.width}px, right=${el.right}px`);
      });
    } else {
      issues.push(`✅ No elements overflow the viewport`);
    }

    return issues;
  });
}

async function checkTextRendering(page) {
  return await page.evaluate(() => {
    const issues = [];

    // Check all text elements
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li');
    let verticalTextCount = 0;
    let truncatedCount = 0;
    let tooSmallCount = 0;

    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);

      // Check for vertical text
      if (styles.writingMode && styles.writingMode !== 'horizontal-tb') {
        verticalTextCount++;
      }

      // Check for text truncation
      if (el.scrollWidth > el.clientWidth) {
        truncatedCount++;
      }

      // Check font size
      const fontSize = parseFloat(styles.fontSize);
      if (fontSize < 12 && el.textContent.trim().length > 0) {
        tooSmallCount++;
      }
    });

    if (verticalTextCount > 0) {
      issues.push(`❌ Found ${verticalTextCount} elements with vertical text`);
    } else {
      issues.push(`✅ No vertical text found`);
    }

    if (truncatedCount > 0) {
      issues.push(`⚠️ Found ${truncatedCount} elements with truncated text`);
    } else {
      issues.push(`✅ No truncated text found`);
    }

    if (tooSmallCount > 0) {
      issues.push(`⚠️ Found ${tooSmallCount} elements with font size < 12px`);
    } else {
      issues.push(`✅ All text is readable size`);
    }

    return issues;
  });
}

export default test;
