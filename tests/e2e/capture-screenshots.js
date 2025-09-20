import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('📸 Capturing homepage...');
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });

  console.log('📸 Capturing assessment page...');
  await page.goto('http://localhost:8080/assessment.html');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/assessment.png', fullPage: true });

  // Click on Assessment link if available
  console.log('📸 Trying to start assessment...');
  const assessmentButton = page.locator('a, button').filter({ hasText: /assessment|start|begin/i }).first();
  if (await assessmentButton.count() > 0) {
    await assessmentButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/assessment-started.png', fullPage: true });
  }

  console.log('📸 Screenshots captured successfully!');

  // Keep browser open for 5 seconds so you can see it
  await page.waitForTimeout(5000);

  await browser.close();
})();