const fs = require('fs');
const path = require('path');

function analyzeAssessmentDifferences(resultsDir) {
  console.log('🔍 Analyzing Assessment Report Differences\n');
  console.log(`Reading results from: ${resultsDir}\n`);

  // Load all result files
  const files = fs.readdirSync(resultsDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8'));
      return { filename: f, ...data };
    });

  console.log(`Loaded ${files.length} test results\n`);

  if (files.length < 2) {
    console.log('⚠️  Need at least 2 test results to compare');
    return;
  }

  // Analysis structure
  const analysis = {
    summary: {
      totalTests: files.length,
      patterns: files.map(f => f.pattern)
    },
    responseVariation: analyzeResponseVariation(files),
    personalityVariation: analyzePersonalitySection(files),
    neurodiversityVariation: analyzeNeurodiversitySection(files),
    executiveFunctionVariation: analyzeExecutiveFunction(files),
    sensoryVariation: analyzeSensoryProcessing(files),
    archetypeVariation: analyzeArchetypes(files),
    identicalSections: findIdenticalSections(files),
    recommendations: []
  };

  // Generate recommendations
  generateRecommendations(analysis);

  // Print detailed analysis
  printAnalysis(analysis);

  // Save analysis
  const analysisPath = path.join(resultsDir, '_analysis_report.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 Full analysis saved to: ${analysisPath}`);

  return analysis;
}

function analyzeResponseVariation(files) {
  console.log('━━━ Response Variation Analysis ━━━\n');

  const stats = files.map(f => {
    const responses = f.responses || [];
    const values = responses.map(r => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const unique = new Set(values).size;

    return {
      pattern: f.pattern,
      count: responses.length,
      average: avg.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min, max, unique
    };
  });

  stats.forEach(s => {
    console.log(`${s.pattern}:`);
    console.log(`  Responses: ${s.count}, Avg: ${s.average}, StdDev: ${s.stdDev}`);
    console.log(`  Range: ${s.min}-${s.max}, Unique values: ${s.unique}\n`);
  });

  return stats;
}

function analyzePersonalitySection(files) {
  console.log('━━━ Personality (Big Five) Variation Analysis ━━━\n');

  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const variations = {};

  traits.forEach(trait => {
    const values = files.map(f => {
      const score = f.report?.report?.personality?.bigFive?.[trait];
      return score !== undefined ? score : null;
    }).filter(v => v !== null);

    if (values.length > 0) {
      const unique = new Set(values).size;
      const range = Math.max(...values) - Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      variations[trait] = {
        uniqueValues: unique,
        range,
        average: avg.toFixed(1),
        min: Math.min(...values),
        max: Math.max(...values),
        allSame: unique === 1
      };

      console.log(`${trait.toUpperCase()}:`);
      console.log(`  Unique values: ${unique}/${files.length}`);
      console.log(`  Range: ${Math.min(...values)} - ${Math.max(...values)} (spread: ${range})`);
      console.log(`  Average: ${avg.toFixed(1)}`);

      if (unique === 1) {
        console.log(`  ⚠️  WARNING: All tests produced IDENTICAL score (${values[0]})`);
      } else if (range < 20) {
        console.log(`  ⚠️  Low variation: Only ${range} point spread`);
      } else {
        console.log(`  ✓ Good variation`);
      }
      console.log();
    }
  });

  return variations;
}

function analyzeNeurodiversitySection(files) {
  console.log('━━━ Neurodiversity Section Variation ━━━\n');

  const ndSections = ['adhd', 'autism'];
  const variations = {};

  ndSections.forEach(section => {
    const scores = files.map(f => {
      const nd = f.report?.report?.detailed?.neurodiversity;
      return nd?.[section]?.score;
    }).filter(v => v !== undefined);

    const reportable = files.map(f => {
      const nd = f.report?.report?.detailed?.neurodiversity;
      return nd?.[section]?.reportable;
    }).filter(v => v !== undefined);

    if (scores.length > 0) {
      const unique = new Set(scores).size;
      const range = Math.max(...scores) - Math.min(...scores);
      const reportableCount = reportable.filter(r => r !== false).length;

      variations[section] = {
        uniqueScores: unique,
        range,
        reportableCount: `${reportableCount}/${reportable.length}`,
        allSame: unique === 1
      };

      console.log(`${section.toUpperCase()}:`);
      console.log(`  Unique scores: ${unique}/${files.length}`);
      console.log(`  Range: ${Math.min(...scores).toFixed(1)} - ${Math.max(...scores).toFixed(1)}`);
      console.log(`  Reportable: ${reportableCount}/${reportable.length} tests`);

      if (unique === 1) {
        console.log(`  ⚠️  WARNING: All tests produced IDENTICAL score`);
      } else if (reportableCount === 0) {
        console.log(`  ℹ️  INFO: Confidence filtering working - no false positives`);
      }
      console.log();
    }
  });

  return variations;
}

function analyzeExecutiveFunction(files) {
  console.log('━━━ Executive Function Variation ━━━\n');

  const domains = ['planning', 'organization', 'timeManagement', 'workingMemory',
                   'emotionalRegulation', 'taskInitiation', 'sustainedAttention', 'flexibility'];

  const variations = {};

  domains.forEach(domain => {
    const scores = files.map(f => {
      const nd = f.report?.report?.detailed?.neurodiversity;
      return nd?.executiveFunction?.domains?.[domain];
    }).filter(v => v !== undefined);

    if (scores.length > 0) {
      const unique = new Set(scores).size;
      const range = Math.max(...scores) - Math.min(...scores);

      variations[domain] = {
        uniqueValues: unique,
        range,
        allSame: unique === 1
      };

      if (unique === 1) {
        console.log(`${domain}: ⚠️  ALL IDENTICAL (${scores[0]})`);
      } else if (range < 10) {
        console.log(`${domain}: ⚠️  Low variation (range: ${range})`);
      } else {
        console.log(`${domain}: ✓ Good variation (${unique} unique, range: ${range})`);
      }
    }
  });

  console.log();
  return variations;
}

function analyzeSensoryProcessing(files) {
  console.log('━━━ Sensory Processing Variation ━━━\n');

  const domains = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
  const variations = {};

  domains.forEach(domain => {
    const scores = files.map(f => {
      const nd = f.report?.report?.detailed?.neurodiversity;
      return nd?.sensoryProfile?.[domain];
    }).filter(v => v !== undefined && v !== 0);

    if (scores.length > 0) {
      const unique = new Set(scores).size;
      const range = Math.max(...scores) - Math.min(...scores);

      variations[domain] = {
        scoresPresent: scores.length,
        uniqueValues: unique,
        range,
        allSame: unique === 1
      };

      if (scores.length < files.length / 2) {
        console.log(`${domain}: ⚠️  Only ${scores.length}/${files.length} tests have data`);
      } else if (unique === 1) {
        console.log(`${domain}: ⚠️  ALL IDENTICAL (${scores[0]})`);
      } else {
        console.log(`${domain}: ✓ ${unique} unique values, range: ${range}`);
      }
    } else {
      console.log(`${domain}: ⚠️  NO DATA in any test`);
    }
  });

  console.log();
  return variations;
}

function analyzeArchetypes(files) {
  console.log('━━━ Archetype Variation ━━━\n');

  const archetypes = files.map(f => ({
    pattern: f.pattern,
    archetype: f.report?.report?.archetype?.name || 'Unknown'
  }));

  const uniqueArchetypes = new Set(archetypes.map(a => a.archetype)).size;

  console.log(`Unique archetypes: ${uniqueArchetypes}/${files.length}\n`);

  archetypes.forEach(a => {
    console.log(`${a.pattern}: ${a.archetype}`);
  });

  if (uniqueArchetypes === 1) {
    console.log(`\n⚠️  WARNING: All tests produced the same archetype!`);
  } else if (uniqueArchetypes < files.length / 2) {
    console.log(`\n⚠️  Low archetype variation`);
  }

  console.log();
  return { uniqueArchetypes, archetypes };
}

function findIdenticalSections(files) {
  console.log('━━━ Identifying Identical Sections ━━━\n');

  const issues = [];

  // Check if entire reports are identical
  const reportStrings = files.map(f => JSON.stringify(f.report));
  const uniqueReports = new Set(reportStrings).size;

  if (uniqueReports === 1) {
    issues.push({
      severity: 'CRITICAL',
      section: 'ENTIRE_REPORT',
      description: 'All reports are COMPLETELY IDENTICAL despite different inputs'
    });
    console.log('🚨 CRITICAL: All reports are COMPLETELY IDENTICAL!\n');
  }

  return issues;
}

function generateRecommendations(analysis) {
  const recs = [];

  // Check personality variation
  Object.entries(analysis.personalityVariation || {}).forEach(([trait, data]) => {
    if (data.allSame) {
      recs.push({
        severity: 'HIGH',
        area: 'Personality Scoring',
        issue: `${trait} always produces the same score`,
        action: `Check ${trait} scoring logic in personality calculation`
      });
    } else if (data.range < 20) {
      recs.push({
        severity: 'MEDIUM',
        area: 'Personality Scoring',
        issue: `${trait} has low variation (range: ${data.range})`,
        action: `Review ${trait} question weights and scoring formula`
      });
    }
  });

  // Check EF variation
  Object.entries(analysis.executiveFunctionVariation || {}).forEach(([domain, data]) => {
    if (data.allSame) {
      recs.push({
        severity: 'HIGH',
        area: 'Executive Function',
        issue: `${domain} always produces the same score`,
        action: `Check ${domain} scoring in neurodiversity-scoring.js`
      });
    }
  });

  // Check sensory variation
  Object.entries(analysis.sensoryVariation || {}).forEach(([domain, data]) => {
    if (data.scoresPresent === 0) {
      recs.push({
        severity: 'HIGH',
        area: 'Sensory Processing',
        issue: `${domain} never has data`,
        action: `Check if ${domain} baseline questions exist and are being asked`
      });
    }
  });

  analysis.recommendations = recs;

  if (recs.length > 0) {
    console.log('━━━ Recommendations ━━━\n');
    recs.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.severity}] ${rec.area}`);
      console.log(`   Issue: ${rec.issue}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  } else {
    console.log('✅ No critical issues found!\n');
  }
}

function printAnalysis(analysis) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('              ANALYSIS SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const highSeverity = analysis.recommendations.filter(r => r.severity === 'HIGH').length;
  const criticalIssues = analysis.identicalSections.filter(i => i.severity === 'CRITICAL').length;

  if (criticalIssues > 0) {
    console.log(`🚨 CRITICAL ISSUES: ${criticalIssues}`);
  }
  if (highSeverity > 0) {
    console.log(`⚠️  HIGH PRIORITY: ${highSeverity}`);
  }
  if (criticalIssues === 0 && highSeverity === 0) {
    console.log(`✅ No critical issues detected`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (require.main === module) {
  const resultsDir = process.argv[2] || '/tmp/assessment-test-results';

  if (!fs.existsSync(resultsDir)) {
    console.error(`Error: Results directory not found: ${resultsDir}`);
    process.exit(1);
  }

  analyzeAssessmentDifferences(resultsDir);
}

module.exports = { analyzeAssessmentDifferences };
