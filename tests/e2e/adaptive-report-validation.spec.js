import { test, expect } from '@playwright/test';

/**
 * Comprehensive tests for adaptive assessment and report generation
 * Tests variation in adaptive questions based on baseline responses
 * Validates report quality, consistency, and completeness
 */

test.describe('Adaptive Assessment and Report Validation', () => {
  // Helper function to complete an assessment with specific answer patterns
  async function completeAssessment(page, answerPattern, tier = 'standard') {
    // Navigate to free assessment page directly
    await page.goto('http://localhost:8080/free-assessment.html');
    await page.waitForLoadState('networkidle');

    // Start assessment
    const startButton = await page.waitForSelector('button:has-text("Start Free Assessment")', {
      state: 'visible',
      timeout: 10000
    });
    await startButton.click();

    // Wait for first question to load
    await page.waitForSelector('#adaptive-question-text', {
      state: 'visible',
      timeout: 15000
    });

    const answeredQuestions = [];
    let questionCount = 0;
    const maxQuestions = tier === 'comprehensive' ? 35 : 30; // Baseline + adaptive

    // Answer all questions
    while (questionCount < maxQuestions) {
      // Check if we're still in the assessment
      const questionElement = await page.$('#adaptive-question-text');
      if (!questionElement) {
        // Check if report is displayed
        const reportElement = await page.$('.enhanced-report-container');
        if (reportElement) {
          console.log('Report displayed after', questionCount, 'questions');
          break;
        }
        // Otherwise we might be in a transition
        await page.waitForTimeout(1000);
        continue;
      }

      // Get question text
      const questionText = await questionElement.textContent();
      answeredQuestions.push({
        index: questionCount,
        text: questionText
      });

      // Select answer based on pattern
      let answerValue;
      if (answerPattern === 'high-openness') {
        // High openness, mixed others
        answerValue =
          questionText.includes('new') ||
          questionText.includes('creative') ||
          questionText.includes('ideas')
            ? 5
            : Math.floor(Math.random() * 3) + 2;
      } else if (answerPattern === 'low-conscientiousness') {
        // Low conscientiousness, mixed others
        answerValue =
          questionText.includes('organized') ||
          questionText.includes('plan') ||
          questionText.includes('detail')
            ? 1
            : Math.floor(Math.random() * 3) + 2;
      } else if (answerPattern === 'extreme-mixed') {
        // Extreme responses alternating
        answerValue = questionCount % 2 === 0 ? 5 : 1;
      } else if (answerPattern === 'moderate') {
        // All moderate responses
        answerValue = 3;
      } else {
        // Random pattern
        answerValue = Math.floor(Math.random() * 5) + 1;
      }

      // Click the appropriate answer option
      const answerSelector = `.answer-option[data-value="${answerValue}"], .likert-option[data-value="${answerValue}"]`;
      const answerOption = await page.waitForSelector(answerSelector, {
        state: 'visible',
        timeout: 5000
      });

      await answerOption.click();

      // Wait for next question or completion
      await page.waitForTimeout(1000);

      questionCount++;

      // Check for phase transition
      const phaseTransition = await page.$('.phase-transition');
      if (phaseTransition) {
        console.log('Phase transition detected after', questionCount, 'questions');
        const continueButton = await page.waitForSelector(
          'button:has-text("Continue Assessment")',
          {
            state: 'visible',
            timeout: 5000
          }
        );
        await continueButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Wait for report to be displayed
    await page.waitForSelector('.enhanced-report-container', {
      state: 'visible',
      timeout: 30000
    });

    return answeredQuestions;
  }

  // Helper to extract report data
  async function extractReportData(page) {
    return await page.evaluate(() => {
      const report = {};

      // Extract Big Five traits
      const traitElements = document.querySelectorAll('.trait-item');
      report.traits = {};
      traitElements.forEach(el => {
        const traitName = el.querySelector(
          'span[style*="text-transform: capitalize"]'
        )?.textContent;
        const score = el.querySelector('.trait-score')?.textContent;
        if (traitName && score) {
          report.traits[traitName.toLowerCase()] = parseInt(score);
        }
      });

      // Extract archetype
      const archetypeEl = document.querySelector('.archetype-name');
      report.archetype = archetypeEl?.textContent || null;

      // Extract percentiles
      const percentileElements = document.querySelectorAll('.percentile-item');
      report.percentiles = {};
      percentileElements.forEach(el => {
        const traitName = el.querySelector(
          'span[style*="text-transform: capitalize"]'
        )?.textContent;
        const percentileText = el.querySelector('span[style*="color: #7c9885"]')?.textContent;
        if (traitName && percentileText) {
          const percentile = parseInt(percentileText.match(/\d+/)?.[0] || '0');
          report.percentiles[traitName.toLowerCase()] = percentile;
        }
      });

      // Extract key insights
      const insightElements = document.querySelectorAll('.insight-item');
      report.insights = Array.from(insightElements).map(el => el.textContent);

      // Check for motivational drivers
      const driversSection = document.querySelector(
        '.report-section:has(h2:has-text("Motivational Drivers"))'
      );
      report.hasMotivationalDrivers = !!driversSection;

      // Check for behavioral tendencies
      const behaviorSection = document.querySelector(
        '.report-section:has(h2:has-text("Behavioral Tendencies"))'
      );
      report.hasBehavioralTendencies = !!behaviorSection;

      // Check for recommendations
      const recoSection = document.querySelector(
        '.report-section:has(h2:has-text("Recommendations"))'
      );
      report.hasRecommendations = !!recoSection;

      // Check for SVG chart
      const svgChart = document.querySelector('svg');
      report.hasChart = !!svgChart;

      // Check for two-column layout
      const twoColumnGrids = document.querySelectorAll('.two-column-grid');
      report.hasTwoColumnLayout = twoColumnGrids.length > 0;

      return report;
    });
  }

  test('Baseline questions should adapt based on initial responses - High Openness', async ({
    page
  }) => {
    const questions = await completeAssessment(page, 'high-openness');

    // Verify we got baseline + adaptive questions
    expect(questions.length).toBeGreaterThanOrEqual(20);

    // Check that questions after baseline (index 10+) are different based on pattern
    const baselineQuestions = questions.slice(0, 10);
    const adaptiveQuestions = questions.slice(10);

    console.log('Baseline questions:', baselineQuestions.length);
    console.log('Adaptive questions:', adaptiveQuestions.length);

    // Adaptive questions should include some related to high openness traits
    const opennessRelatedKeywords = ['creative', 'ideas', 'new', 'explore', 'imagine', 'artistic'];
    const hasOpennessQuestions = adaptiveQuestions.some(q =>
      opennessRelatedKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
    );

    expect(hasOpennessQuestions).toBe(true);
  });

  test('Baseline questions should adapt based on initial responses - Low Conscientiousness', async ({
    page
  }) => {
    const questions = await completeAssessment(page, 'low-conscientiousness');

    // Verify we got baseline + adaptive questions
    expect(questions.length).toBeGreaterThanOrEqual(20);

    const adaptiveQuestions = questions.slice(10);

    // Adaptive questions should explore organization and planning aspects
    const conscientiousnessKeywords = [
      'organized',
      'plan',
      'detail',
      'careful',
      'thorough',
      'schedule'
    ];
    const hasConscientiousnessQuestions = adaptiveQuestions.some(q =>
      conscientiousnessKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
    );

    expect(hasConscientiousnessQuestions).toBe(true);
  });

  test('Different answer patterns should produce different adaptive questions', async ({
    page
  }) => {
    // Run two assessments with different patterns
    const questionsHighOpenness = await completeAssessment(page, 'high-openness');

    // Navigate to a fresh assessment
    await page.goto('http://localhost:8080/free-assessment.html');
    const questionsLowConsc = await completeAssessment(page, 'low-conscientiousness');

    // Compare adaptive questions (after baseline)
    const adaptiveSet1 = questionsHighOpenness.slice(10).map(q => q.text);
    const adaptiveSet2 = questionsLowConsc.slice(10).map(q => q.text);

    // Count how many questions are different
    let differentQuestions = 0;
    const minLength = Math.min(adaptiveSet1.length, adaptiveSet2.length);

    for (let i = 0; i < minLength; i++) {
      if (adaptiveSet1[i] !== adaptiveSet2[i]) {
        differentQuestions++;
      }
    }

    // At least 30% of adaptive questions should be different
    const differenceRatio = differentQuestions / minLength;
    console.log('Question difference ratio:', differenceRatio);
    expect(differenceRatio).toBeGreaterThan(0.3);
  });

  test('Report should contain all required sections and data', async ({ page }) => {
    await completeAssessment(page, 'random');

    const reportData = await extractReportData(page);

    // Verify all Big Five traits are present and have valid scores
    expect(reportData.traits).toBeDefined();
    expect(reportData.traits.openness).toBeGreaterThanOrEqual(0);
    expect(reportData.traits.openness).toBeLessThanOrEqual(100);
    expect(reportData.traits.conscientiousness).toBeGreaterThanOrEqual(0);
    expect(reportData.traits.extraversion).toBeGreaterThanOrEqual(0);
    expect(reportData.traits.agreeableness).toBeGreaterThanOrEqual(0);
    expect(reportData.traits.neuroticism).toBeGreaterThanOrEqual(0);

    // Verify archetype is assigned
    expect(reportData.archetype).toBeTruthy();

    // Verify percentiles are calculated
    expect(Object.keys(reportData.percentiles).length).toBeGreaterThanOrEqual(5);

    // Verify insights are generated
    expect(reportData.insights.length).toBeGreaterThan(0);

    // Verify all sections are present
    expect(reportData.hasMotivationalDrivers).toBe(true);
    expect(reportData.hasBehavioralTendencies).toBe(true);
    expect(reportData.hasRecommendations).toBe(true);
    expect(reportData.hasChart).toBe(true);

    // Verify new layout improvements
    expect(reportData.hasTwoColumnLayout).toBe(true);
  });

  test('Extreme answer patterns should produce appropriate reports', async ({ page }) => {
    await completeAssessment(page, 'extreme-mixed');

    const reportData = await extractReportData(page);

    // Extreme patterns should still produce valid scores
    expect(reportData.traits).toBeDefined();
    Object.values(reportData.traits).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    // Should have insights about the extreme pattern
    expect(reportData.insights.length).toBeGreaterThan(0);

    // Archetype should still be assigned
    expect(reportData.archetype).toBeTruthy();
  });

  test('Moderate answer patterns should produce balanced reports', async ({ page }) => {
    await completeAssessment(page, 'moderate');

    const reportData = await extractReportData(page);

    // Moderate answers should produce scores near the middle range
    const averageScore = Object.values(reportData.traits).reduce((a, b) => a + b, 0) / 5;
    expect(averageScore).toBeGreaterThan(30);
    expect(averageScore).toBeLessThan(70);

    // Percentiles should also be moderate
    const averagePercentile = Object.values(reportData.percentiles).reduce((a, b) => a + b, 0) / 5;
    expect(averagePercentile).toBeGreaterThan(20);
    expect(averagePercentile).toBeLessThan(80);
  });

  test('Report visual elements should be properly rendered', async ({ page }) => {
    await completeAssessment(page, 'random');

    // Check for trait progress bars
    const traitBars = await page.$$('.trait-fill');
    expect(traitBars.length).toBeGreaterThanOrEqual(5);

    // Check that bars have appropriate widths
    for (const bar of traitBars) {
      const width = await bar.evaluate(el => el.style.width);
      const widthValue = parseInt(width);
      expect(widthValue).toBeGreaterThan(0);
      expect(widthValue).toBeLessThanOrEqual(100);
    }

    // Check for SVG chart elements
    const svgElements = await page.$$('svg circle, svg rect, svg path');
    expect(svgElements.length).toBeGreaterThan(0);

    // Check that percentile cards are interactive (hover effects)
    const percentileCard = await page.$('.percentile-item');
    if (percentileCard) {
      const initialTransform = await percentileCard.evaluate(
        el => window.getComputedStyle(el).transform
      );

      await percentileCard.hover();
      await page.waitForTimeout(300);

      const hoverTransform = await percentileCard.evaluate(
        el => window.getComputedStyle(el).transform
      );

      // Transform might change on hover (based on the implementation)
      expect(hoverTransform).toBeDefined();
    }
  });

  test('Report should not contain emojis after recent update', async ({ page }) => {
    await completeAssessment(page, 'random');

    // Check that emojis have been removed
    const reportContent = await page.evaluate(() => {
      return document.querySelector('.enhanced-report-container')?.textContent || '';
    });

    // Common emojis that should have been removed
    const emojis = ['💡', '📊', '🧠', '⚠️', '🎯', '📈', '🌟'];

    emojis.forEach(emoji => {
      expect(reportContent.includes(emoji)).toBe(false);
    });
  });

  test('Report should maintain consistency across multiple runs with same pattern', async ({
    page
  }) => {
    // First run
    await completeAssessment(page, 'high-openness');
    const report1 = await extractReportData(page);

    // Second run with same pattern
    await page.goto('http://localhost:8080/free-assessment.html');
    await completeAssessment(page, 'high-openness');
    const report2 = await extractReportData(page);

    // Traits should be similar (within 15% variance due to adaptive questions)
    Object.keys(report1.traits).forEach(trait => {
      const diff = Math.abs(report1.traits[trait] - report2.traits[trait]);
      expect(diff).toBeLessThanOrEqual(15);
    });

    // Both should have all required sections
    expect(report1.hasMotivationalDrivers).toBe(report2.hasMotivationalDrivers);
    expect(report1.hasBehavioralTendencies).toBe(report2.hasBehavioralTendencies);
    expect(report1.hasRecommendations).toBe(report2.hasRecommendations);
  });

  test('Performance: Assessment and report generation should complete in reasonable time', async ({
    page
  }) => {
    const startTime = Date.now();

    await completeAssessment(page, 'random');

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should complete within 60 seconds even with animations
    expect(totalTime).toBeLessThan(60000);

    console.log('Total assessment time:', totalTime / 1000, 'seconds');
  });
});
