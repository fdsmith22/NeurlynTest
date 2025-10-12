const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configurations - different answer patterns
const testPatterns = [
  {
    name: 'High_Neuroticism_Low_Conscientiousness',
    description: 'High anxiety, low organization',
    generateResponse: (questionIndex, total) => {
      // Vary responses but tend toward extremes
      if (questionIndex % 3 === 0) return 5; // High anxiety answers
      if (questionIndex % 3 === 1) return 2; // Low organization
      return 3 + (questionIndex % 2); // Mixed
    }
  },
  {
    name: 'High_Extraversion_High_Openness',
    description: 'Very social and creative',
    generateResponse: (questionIndex, total) => {
      if (questionIndex % 2 === 0) return 5; // High extraversion
      return 4; // High openness
    }
  },
  {
    name: 'Balanced_Moderate',
    description: 'All moderate responses',
    generateResponse: (questionIndex, total) => 3 // All neutral
  },
  {
    name: 'Low_Extraversion_High_Conscientiousness',
    description: 'Introverted and organized',
    generateResponse: (questionIndex, total) => {
      if (questionIndex % 3 === 0) return 2; // Low extraversion
      if (questionIndex % 3 === 1) return 5; // High conscientiousness
      return 3; // Moderate
    }
  },
  {
    name: 'High_ADHD_Indicators',
    description: 'Strong ADHD patterns',
    generateResponse: (questionIndex, total) => {
      // Focus on executive function challenges
      if (questionIndex % 4 === 0) return 5; // Difficulty with organization
      if (questionIndex % 4 === 1) return 5; // Difficulty with focus
      if (questionIndex % 4 === 2) return 4; // Some hyperactivity
      return 3;
    }
  },
  {
    name: 'High_Autism_Sensory',
    description: 'Autism and sensory sensitivity',
    generateResponse: (questionIndex, total) => {
      if (questionIndex % 5 === 0) return 5; // Sensory sensitivity
      if (questionIndex % 5 === 1) return 5; // Social challenges
      if (questionIndex % 5 === 2) return 4; // Pattern preferences
      return 3;
    }
  },
  {
    name: 'Random_Varied',
    description: 'Truly random responses',
    generateResponse: (questionIndex, total) => {
      return Math.floor(Math.random() * 3) + 2; // 2-4
    }
  },
  {
    name: 'Extreme_Low',
    description: 'All low responses',
    generateResponse: (questionIndex, total) => {
      return questionIndex % 2 === 0 ? 1 : 2;
    }
  },
  {
    name: 'Extreme_High',
    description: 'All high responses',
    generateResponse: (questionIndex, total) => {
      return questionIndex % 2 === 0 ? 5 : 4;
    }
  },
  {
    name: 'Alternating_Pattern',
    description: 'Alternating high and low',
    generateResponse: (questionIndex, total) => {
      return questionIndex % 2 === 0 ? 5 : 1;
    }
  }
];

async function runComprehensiveTest() {
  console.log('🔬 Starting Comprehensive Assessment Testing\n');
  console.log(`Testing ${testPatterns.length} different response patterns...\n`);

  const browser = await puppeteer.launch({
    headless: false, // Set to true for faster execution
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const resultsDir = '/tmp/assessment-test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const allResults = [];

  try {
    for (let i = 0; i < testPatterns.length; i++) {
      const pattern = testPatterns[i];
      console.log(`\n━━━ Test ${i + 1}/${testPatterns.length}: ${pattern.name} ━━━`);
      console.log(`Description: ${pattern.description}`);

      const page = await browser.newPage();

      // Navigate to test suite
      await page.goto(`file://${path.resolve('/home/freddy/Neurlyn/comprehensive-test-suite.html')}`, {
        waitUntil: 'networkidle0'
      });

      // Click paid tier toggle
      console.log('  ✓ Clicking paid tier toggle...');
      await page.evaluate(() => {
        const toggle = document.getElementById('paidTierToggle');
        if (toggle && !toggle.checked) {
          toggle.click();
        }
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Intercept network requests to capture report
      let capturedReport = null;

      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/reports/generate')) {
          try {
            const data = await response.json();
            capturedReport = data;
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      });

      // Generate assessment with custom response pattern
      console.log('  ✓ Generating assessment...');
      const functionString = pattern.generateResponse.toString();
      const result = await page.evaluate(async (funcStr, patternName) => {
        // Reconstruct function from string - handle both arrow functions with and without braces
        let functionBody;
        const bracesMatch = funcStr.match(/\{([\s\S]*)\}/);

        if (bracesMatch) {
          // Function with curly braces: (args) => { body }
          functionBody = bracesMatch[1];
        } else {
          // Arrow function without braces: (args) => expression
          const arrowMatch = funcStr.match(/=>\s*(.+?)(?:\/\/.*)?$/);
          if (arrowMatch) {
            functionBody = 'return ' + arrowMatch[1].trim();
          } else {
            throw new Error('Could not parse function');
          }
        }

        const generateResponse = new Function('questionIndex', 'total', functionBody);

        // Start session
        const startResponse = await fetch('http://localhost:3456/api/adaptive/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'test-' + Date.now(), tier: 'deep' })
        });

        const startData = await startResponse.json();
        const sessionId = startData.sessionId;

        let currentBatch = startData.currentBatch || [];
        let batchNum = 1;
        let totalAnswered = 0;
        let allResponses = [];

        // Answer all batches
        while (currentBatch.length > 0) {
          const responses = currentBatch.map((q, idx) => {
            const value = generateResponse(totalAnswered + idx, 100);
            return { questionId: q.questionId, value };
          });

          allResponses.push(...responses);
          totalAnswered += responses.length;

          const nextData = await fetch('http://localhost:3456/api/adaptive/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, responses })
          }).then(r => r.json());

          currentBatch = nextData.currentBatch || [];
          batchNum++;
        }

        // Complete assessment
        await fetch('http://localhost:3456/api/adaptive/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        // Generate report
        const reportResponse = await fetch('http://localhost:3456/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId: startData.userId })
        });

        const report = await reportResponse.json();

        return {
          sessionId,
          patternName,
          totalAnswered,
          responses: allResponses,
          report: report
        };

      }, functionString, pattern.name);

      // Wait for report capture
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (result && result.report) {
        console.log(`  ✓ Assessment completed: ${result.totalAnswered} questions answered`);

        // Save detailed results
        const resultData = {
          pattern: pattern.name,
          description: pattern.description,
          timestamp: new Date().toISOString(),
          sessionId: result.sessionId,
          totalQuestions: result.totalAnswered,
          responses: result.responses,
          report: result.report
        };

        const filename = `${pattern.name}_${Date.now()}.json`;
        fs.writeFileSync(
          path.join(resultsDir, filename),
          JSON.stringify(resultData, null, 2)
        );

        allResults.push(resultData);
        console.log(`  ✓ Saved: ${filename}`);
      } else {
        console.log(`  ✗ Failed to generate report`);
      }

      await page.close();
    }

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }

  console.log(`\n✅ Testing complete! Generated ${allResults.length} reports`);
  console.log(`📁 Results saved to: ${resultsDir}`);

  // Save summary
  const summary = {
    testDate: new Date().toISOString(),
    totalTests: testPatterns.length,
    successfulTests: allResults.length,
    patterns: testPatterns.map(p => ({ name: p.name, description: p.description }))
  };

  fs.writeFileSync(
    path.join(resultsDir, '_test_summary.json'),
    JSON.stringify(summary, null, 2)
  );

  return { resultsDir, allResults };
}

// Run the tests
runComprehensiveTest()
  .then(({ resultsDir, allResults }) => {
    console.log('\n📊 Next step: Run the analysis script to compare results');
    console.log(`   node /tmp/analyze-assessment-differences.js ${resultsDir}`);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
