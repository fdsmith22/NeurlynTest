/**
 * Deep Question Analysis
 * Examines all questions in detail to ensure proper categorization, tagging, and alignment
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';
const QuestionBank = require('../models/QuestionBank');

async function deepQuestionAnalysis() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('='.repeat(80));
    console.log('                 DEEP QUESTION ANALYSIS REPORT');
    console.log('='.repeat(80));

    const allQuestions = await QuestionBank.find({ active: true });

    console.log(`\n📊 Analyzing ${allQuestions.length} active questions...\n`);

    // Track issues
    const issues = {
      missingCorrelatedTraits: [],
      missingTags: [],
      categoryMismatch: [],
      traitMismatch: [],
      instrumentMismatch: [],
      subcategoryMissing: [],
      sensoryIssues: [],
      neurodiversityIssues: [],
      personalityIssues: []
    };

    // 1. CATEGORY ALIGNMENT CHECK
    console.log('🔍 CATEGORY ALIGNMENT CHECK\n');

    const categoryRules = {
      personality: ['BFI-2', 'NEO-PI', 'HEXACO'],
      neurodiversity: ['ASRS', 'AQ-', 'NEURLYN_SENSORY', 'NEURLYN_EXECUTIVE', 'NEURLYN_MASKING'],
      attachment: ['NEURLYN_ATTACHMENT', 'ECR'],
      cognitive: ['NEURLYN_PROCESSING', 'COGNITIVE_STYLE', 'NEURLYN_DECISION'],
      enneagram: ['NEURLYN_ENNEAGRAM'],
      trauma_screening: ['NEURLYN_TRAUMA', 'ACE', 'PCL']
    };

    allQuestions.forEach(q => {
      const category = q.category;
      const instrument = q.instrument;

      // Check if instrument matches category
      let expectedCategory = null;
      for (const [cat, patterns] of Object.entries(categoryRules)) {
        if (patterns.some(pattern => instrument && instrument.includes(pattern))) {
          expectedCategory = cat;
          break;
        }
      }

      if (expectedCategory && expectedCategory !== category) {
        issues.categoryMismatch.push({
          id: q.questionId,
          text: q.text.substring(0, 60),
          currentCategory: category,
          expectedCategory: expectedCategory,
          instrument: instrument
        });
      }
    });

    console.log(`Category mismatches: ${issues.categoryMismatch.length}`);
    if (issues.categoryMismatch.length > 0 && issues.categoryMismatch.length <= 10) {
      issues.categoryMismatch.slice(0, 5).forEach(issue => {
        console.log(`  ⚠️  ${issue.id}: category="${issue.currentCategory}" but instrument="${issue.instrument}"`);
        console.log(`      Expected: "${issue.expectedCategory}"`);
      });
    }

    // 2. TRAIT ALIGNMENT CHECK
    console.log('\n🎯 TRAIT ALIGNMENT CHECK\n');

    const bigFiveTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const sensoryTraits = ['visual', 'auditory', 'tactile', 'vestibular', 'oral', 'olfactory'];
    const attachmentTraits = ['anxious', 'avoidant', 'secure', 'disorganized'];

    allQuestions.forEach(q => {
      const category = q.category;
      const trait = q.trait;
      const instrument = q.instrument;

      // Personality questions should have Big Five traits
      if (category === 'personality' && instrument && instrument.includes('BFI')) {
        if (!bigFiveTraits.includes(trait)) {
          issues.traitMismatch.push({
            id: q.questionId,
            text: q.text.substring(0, 60),
            category: category,
            trait: trait,
            expected: 'Big Five trait',
            instrument: instrument
          });
        }
      }

      // Sensory questions should have sensory domain traits
      if (instrument === 'NEURLYN_SENSORY') {
        if (!sensoryTraits.includes(trait)) {
          issues.traitMismatch.push({
            id: q.questionId,
            text: q.text.substring(0, 60),
            category: category,
            trait: trait,
            expected: 'Sensory domain (visual, auditory, etc.)',
            instrument: instrument
          });
        }
      }

      // Attachment questions should have attachment traits
      if (category === 'attachment') {
        if (!attachmentTraits.includes(trait)) {
          issues.traitMismatch.push({
            id: q.questionId,
            text: q.text.substring(0, 60),
            category: category,
            trait: trait,
            expected: 'Attachment trait (anxious, avoidant, etc.)',
            instrument: instrument
          });
        }
      }
    });

    console.log(`Trait mismatches: ${issues.traitMismatch.length}`);
    if (issues.traitMismatch.length > 0 && issues.traitMismatch.length <= 10) {
      issues.traitMismatch.slice(0, 5).forEach(issue => {
        console.log(`  ⚠️  ${issue.id}: trait="${issue.trait}" (expected: ${issue.expected})`);
      });
    }

    // 3. METADATA COMPLETENESS CHECK
    console.log('\n📋 METADATA COMPLETENESS CHECK\n');

    allQuestions.forEach(q => {
      // Check correlatedTraits
      if (!q.adaptive?.correlatedTraits || q.adaptive.correlatedTraits.length === 0) {
        issues.missingCorrelatedTraits.push({
          id: q.questionId,
          category: q.category,
          instrument: q.instrument,
          trait: q.trait
        });
      }

      // Check tags
      if (!q.tags || q.tags.length === 0) {
        issues.missingTags.push({
          id: q.questionId,
          category: q.category,
          instrument: q.instrument
        });
      }

      // Check subcategory for neurodiversity questions
      if (q.category === 'neurodiversity' && (!q.subcategory || q.subcategory === '')) {
        issues.subcategoryMissing.push({
          id: q.questionId,
          instrument: q.instrument
        });
      }
    });

    console.log(`Questions missing correlatedTraits: ${issues.missingCorrelatedTraits.length}/${allQuestions.length}`);
    console.log(`Questions missing tags: ${issues.missingTags.length}/${allQuestions.length}`);
    console.log(`Neurodiversity questions missing subcategory: ${issues.subcategoryMissing.length}`);

    // 4. SENSORY QUESTIONS DETAILED CHECK
    console.log('\n👁️  SENSORY QUESTIONS DETAILED ANALYSIS\n');

    const sensoryQuestions = allQuestions.filter(q =>
      q.instrument === 'NEURLYN_SENSORY' ||
      q.category === 'sensory' ||
      q.subcategory === 'sensory_processing'
    );

    console.log(`Total sensory questions: ${sensoryQuestions.length}`);

    // Check domain distribution
    const sensoryByDomain = {};
    sensoryQuestions.forEach(q => {
      const domain = q.trait;
      sensoryByDomain[domain] = (sensoryByDomain[domain] || 0) + 1;

      // Check if sensory questions have proper metadata
      if (!q.correlatedTraits || q.correlatedTraits.length === 0) {
        issues.sensoryIssues.push({
          id: q.questionId,
          issue: 'Missing correlatedTraits',
          text: q.text.substring(0, 50)
        });
      }

      if (q.category !== 'neurodiversity') {
        issues.sensoryIssues.push({
          id: q.questionId,
          issue: `Wrong category: ${q.category} (should be neurodiversity)`,
          text: q.text.substring(0, 50)
        });
      }

      if (q.subcategory !== 'sensory_processing') {
        issues.sensoryIssues.push({
          id: q.questionId,
          issue: `Missing/wrong subcategory: ${q.subcategory || 'NONE'}`,
          text: q.text.substring(0, 50)
        });
      }
    });

    console.log('\nSensory Domain Distribution:');
    Object.entries(sensoryByDomain).sort().forEach(([domain, count]) => {
      const status = count >= 3 ? '✓' : '⚠️';
      console.log(`  ${status} ${domain}: ${count} questions`);
    });

    console.log(`\nSensory questions with issues: ${issues.sensoryIssues.length}`);
    if (issues.sensoryIssues.length > 0) {
      console.log('\nSample sensory issues:');
      issues.sensoryIssues.slice(0, 5).forEach(issue => {
        console.log(`  ⚠️  ${issue.id}: ${issue.issue}`);
        console.log(`      "${issue.text}..."`);
      });
    }

    // 5. NEURODIVERSITY QUESTIONS CHECK
    console.log('\n🧠 NEURODIVERSITY QUESTIONS ANALYSIS\n');

    const neurodivQuestions = allQuestions.filter(q => q.category === 'neurodiversity');
    console.log(`Total neurodiversity questions: ${neurodivQuestions.length}`);

    // Check by subcategory
    const ndBySubcategory = {};
    neurodivQuestions.forEach(q => {
      const subcat = q.subcategory || 'NONE';
      ndBySubcategory[subcat] = (ndBySubcategory[subcat] || 0) + 1;

      // Check for proper metadata
      if (!q.subcategory) {
        issues.neurodiversityIssues.push({
          id: q.questionId,
          issue: 'Missing subcategory',
          instrument: q.instrument
        });
      }

      if (!q.correlatedTraits || q.correlatedTraits.length === 0) {
        issues.neurodiversityIssues.push({
          id: q.questionId,
          issue: 'Missing correlatedTraits',
          instrument: q.instrument
        });
      }
    });

    console.log('\nNeurodiversity by Subcategory:');
    Object.entries(ndBySubcategory).sort().forEach(([subcat, count]) => {
      console.log(`  ${subcat}: ${count} questions`);
    });

    console.log(`\nNeurodiversity questions with issues: ${issues.neurodiversityIssues.length}`);

    // 6. PERSONALITY QUESTIONS CHECK
    console.log('\n🎭 PERSONALITY QUESTIONS ANALYSIS\n');

    const personalityQuestions = allQuestions.filter(q => q.category === 'personality');
    console.log(`Total personality questions: ${personalityQuestions.length}`);

    // Check Big Five distribution
    const byBigFive = {};
    personalityQuestions.forEach(q => {
      const trait = q.trait;
      if (bigFiveTraits.includes(trait)) {
        byBigFive[trait] = (byBigFive[trait] || 0) + 1;
      } else {
        issues.personalityIssues.push({
          id: q.questionId,
          issue: `Invalid trait: ${trait}`,
          instrument: q.instrument
        });
      }

      // Check for correlatedTraits
      if (!q.correlatedTraits || q.correlatedTraits.length === 0) {
        issues.personalityIssues.push({
          id: q.questionId,
          issue: 'Missing correlatedTraits',
          trait: trait
        });
      }
    });

    console.log('\nBig Five Distribution:');
    bigFiveTraits.forEach(trait => {
      const count = byBigFive[trait] || 0;
      console.log(`  ${trait}: ${count} questions`);
    });

    console.log(`\nPersonality questions with issues: ${issues.personalityIssues.length}`);

    // 7. INSTRUMENT CONSISTENCY CHECK
    console.log('\n🔬 INSTRUMENT CONSISTENCY CHECK\n');

    const instrumentStats = {};
    allQuestions.forEach(q => {
      const inst = q.instrument;
      if (!instrumentStats[inst]) {
        instrumentStats[inst] = {
          count: 0,
          categories: new Set(),
          traits: new Set(),
          hasCorrelatedTraits: 0,
          hasTags: 0
        };
      }
      instrumentStats[inst].count++;
      instrumentStats[inst].categories.add(q.category);
      instrumentStats[inst].traits.add(q.trait);
      if (q.correlatedTraits && q.correlatedTraits.length > 0) {
        instrumentStats[inst].hasCorrelatedTraits++;
      }
      if (q.tags && q.tags.length > 0) {
        instrumentStats[inst].hasTags++;
      }
    });

    // Find instruments with inconsistencies
    Object.entries(instrumentStats).forEach(([inst, stats]) => {
      if (stats.categories.size > 1) {
        console.log(`⚠️  ${inst}: Used in ${stats.categories.size} different categories`);
        console.log(`    Categories: ${Array.from(stats.categories).join(', ')}`);
      }

      const metadataRate = (stats.hasCorrelatedTraits / stats.count * 100).toFixed(0);
      if (metadataRate < 100) {
        console.log(`⚠️  ${inst}: Only ${metadataRate}% have correlatedTraits (${stats.hasCorrelatedTraits}/${stats.count})`);
      }
    });

    // 8. SUMMARY OF CRITICAL ISSUES
    console.log('\n' + '='.repeat(80));
    console.log('                        CRITICAL ISSUES SUMMARY');
    console.log('='.repeat(80) + '\n');

    const criticalIssues = [];

    if (issues.missingCorrelatedTraits.length > 0) {
      criticalIssues.push({
        severity: 'CRITICAL',
        issue: `${issues.missingCorrelatedTraits.length} questions missing correlatedTraits`,
        impact: 'Breaks adaptive question selection algorithm',
        fix: 'Add correlatedTraits to all questions based on their category/trait'
      });
    }

    if (issues.missingTags.length > 0) {
      criticalIssues.push({
        severity: 'HIGH',
        issue: `${issues.missingTags.length} questions missing tags`,
        impact: 'Reduces question discoverability and filtering',
        fix: 'Add relevant tags to all questions'
      });
    }

    if (issues.sensoryIssues.length > 0) {
      criticalIssues.push({
        severity: 'CRITICAL',
        issue: `${issues.sensoryIssues.length} sensory question issues`,
        impact: 'Sensory profile scoring may fail or be inaccurate',
        fix: 'Fix sensory questions metadata (category, subcategory, correlatedTraits)'
      });
    }

    if (issues.categoryMismatch.length > 0) {
      criticalIssues.push({
        severity: 'MEDIUM',
        issue: `${issues.categoryMismatch.length} questions in wrong category`,
        impact: 'Questions may not be selected properly',
        fix: 'Realign categories based on instrument type'
      });
    }

    if (issues.traitMismatch.length > 0) {
      criticalIssues.push({
        severity: 'MEDIUM',
        issue: `${issues.traitMismatch.length} questions with wrong trait`,
        impact: 'Scoring may be inaccurate',
        fix: 'Correct trait assignments'
      });
    }

    if (criticalIssues.length === 0) {
      console.log('✓ No critical issues found! Database is well-structured.\n');
    } else {
      criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.severity}] ${issue.issue}`);
        console.log(`   Impact: ${issue.impact}`);
        console.log(`   Fix: ${issue.fix}`);
        console.log('');
      });
    }

    // 9. RECOMMENDED FIXES
    console.log('='.repeat(80));
    console.log('                        RECOMMENDED FIXES');
    console.log('='.repeat(80) + '\n');

    console.log('Priority 1 - CRITICAL:');
    console.log('1. Add correlatedTraits to ALL questions');
    console.log('   - Personality questions: correlatedTraits based on Big Five');
    console.log('   - Sensory questions: ["neuroticism", "openness"]');
    console.log('   - ADHD questions: ["conscientiousness", "neuroticism"]');
    console.log('   - Autism questions: ["openness", "agreeableness"]');
    console.log('');
    console.log('2. Fix sensory questions:');
    console.log('   - Ensure category = "neurodiversity"');
    console.log('   - Ensure subcategory = "sensory_processing"');
    console.log('   - Add correlatedTraits = ["neuroticism", "openness"]');
    console.log('');
    console.log('Priority 2 - HIGH:');
    console.log('3. Add tags to all questions for better categorization');
    console.log('4. Add missing sensory domain questions (vestibular, oral, olfactory)');
    console.log('');
    console.log('Priority 3 - MEDIUM:');
    console.log('5. Fix category mismatches');
    console.log('6. Fix trait mismatches');
    console.log('7. Add subcategories to all neurodiversity questions');

    console.log('\n' + '='.repeat(80));
    console.log('                       ANALYSIS COMPLETE');
    console.log('='.repeat(80) + '\n');

    // Save detailed report to file
    const fs = require('fs');
    const report = {
      timestamp: new Date().toISOString(),
      totalQuestions: allQuestions.length,
      issues: {
        categoryMismatches: issues.categoryMismatch,
        traitMismatches: issues.traitMismatch,
        missingCorrelatedTraits: issues.missingCorrelatedTraits.map(i => i.id),
        missingTags: issues.missingTags.map(i => i.id),
        sensoryIssues: issues.sensoryIssues,
        neurodiversityIssues: issues.neurodiversityIssues,
        personalityIssues: issues.personalityIssues
      },
      criticalIssues: criticalIssues
    };

    fs.writeFileSync('database-analysis-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: database-analysis-report.json\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deepQuestionAnalysis();
