#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const AdaptiveAssessmentEngine = require('../services/adaptive-assessment-engine');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// Test profiles simulating different user types
const TEST_PROFILES = [
  {
    name: "High Openness Creative",
    description: "Artist/Creative type with high openness",
    traits: {
      openness: 85,
      conscientiousness: 45,
      extraversion: 60,
      agreeableness: 65,
      neuroticism: 40
    }
  },
  {
    name: "Low Conscientiousness Flexible",
    description: "Spontaneous person with low conscientiousness",
    traits: {
      openness: 55,
      conscientiousness: 25,
      extraversion: 65,
      agreeableness: 70,
      neuroticism: 35
    }
  },
  {
    name: "High Neuroticism Anxious",
    description: "Person with anxiety/stress patterns",
    traits: {
      openness: 50,
      conscientiousness: 60,
      extraversion: 35,
      agreeableness: 75,
      neuroticism: 80
    }
  },
  {
    name: "Balanced Middle Profile",
    description: "Person with all traits in middle range",
    traits: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    }
  },
  {
    name: "Extreme Mixed Profile",
    description: "Person with extreme highs and lows",
    traits: {
      openness: 90,
      conscientiousness: 20,
      extraversion: 85,
      agreeableness: 15,
      neuroticism: 90
    }
  },
  {
    name: "Introverted Analytical",
    description: "Quiet, systematic thinker",
    traits: {
      openness: 65,
      conscientiousness: 80,
      extraversion: 20,
      agreeableness: 55,
      neuroticism: 40
    }
  }
];

// Simulate baseline responses for different patterns
function generateBaselineResponses(pattern) {
  const responses = [];
  const baselineQuestions = [
    'BFI_OPEN_001', 'BFI_CONSC_001', 'BFI_EXTRA_001', 'BFI_AGREE_001', 'BFI_NEURO_001',
    'BFI_OPEN_002', 'BFI_CONSC_002', 'BFI_EXTRA_002', 'BFI_AGREE_002', 'BFI_NEURO_002'
  ];

  baselineQuestions.forEach((qId, index) => {
    let score;
    switch(pattern) {
      case 'high_openness':
        score = qId.includes('OPEN') ? 5 : 3;
        break;
      case 'low_conscientiousness':
        score = qId.includes('CONSC') ? 1 : 3;
        break;
      case 'high_neuroticism':
        score = qId.includes('NEURO') ? 5 : 3;
        break;
      case 'balanced':
        score = 3;
        break;
      case 'extreme':
        score = index % 2 === 0 ? 5 : 1;
        break;
      default:
        score = Math.floor(Math.random() * 5) + 1;
    }

    responses.push({
      questionId: qId,
      response: score,
      responseTime: Math.random() * 5000 + 1000
    });
  });

  return responses;
}

async function analyzeAdaptiveSelection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    console.log('=' . repeat(80));
    console.log('ADAPTIVE QUESTION SELECTION ANALYSIS');
    console.log('=' . repeat(80));

    const engine = new AdaptiveAssessmentEngine();

    // Test 1: Verify Baseline Questions
    console.log('\n1. BASELINE QUESTION SELECTION');
    console.log('-' . repeat(40));

    for (const tier of ['standard', 'comprehensive']) {
      const baseline = await QuestionBank.getBaselineQuestions(tier);
      console.log(`\n${tier.toUpperCase()} Tier:`);
      console.log(`  Questions retrieved: ${baseline.length}`);

      // Check trait coverage
      const traitCoverage = {};
      baseline.forEach(q => {
        if (q.trait) {
          traitCoverage[q.trait] = (traitCoverage[q.trait] || 0) + 1;
        }
      });

      console.log('  Trait coverage:');
      Object.entries(traitCoverage).forEach(([trait, count]) => {
        console.log(`    ${trait}: ${count} questions`);
      });

      // Check priority distribution
      const priorities = baseline.map(q => q.adaptive?.baselinePriority).filter(p => p);
      if (priorities.length > 0) {
        console.log(`  Priority range: ${Math.min(...priorities)} - ${Math.max(...priorities)}`);
      }
    }

    // Test 2: Adaptive Selection for Different Profiles
    console.log('\n2. ADAPTIVE SELECTION BY PROFILE TYPE');
    console.log('-' . repeat(40));

    for (const profile of TEST_PROFILES) {
      console.log(`\n${profile.name}:`);
      console.log(`  ${profile.description}`);

      // Get baseline question IDs to exclude
      const baseline = await QuestionBank.getBaselineQuestions('standard');
      const excludeIds = baseline.map(q => q.questionId);

      // Get adaptive questions
      const adaptiveQuestions = await QuestionBank.getAdaptiveQuestions(
        { traits: profile.traits, patterns: {} },
        excludeIds,
        20
      );

      // Analyze the selection
      const analysis = {
        total: adaptiveQuestions.length,
        byCategory: {},
        byTrait: {},
        byInstrument: {},
        facetQuestions: 0,
        communicationQuestions: 0,
        processingQuestions: 0,
        neurodiversityQuestions: 0
      };

      adaptiveQuestions.forEach(q => {
        // Count by category
        if (q.category) {
          analysis.byCategory[q.category] = (analysis.byCategory[q.category] || 0) + 1;
        }

        // Count by trait
        if (q.trait) {
          analysis.byTrait[q.trait] = (analysis.byTrait[q.trait] || 0) + 1;
        }

        // Count by instrument
        if (q.instrument) {
          analysis.byInstrument[q.instrument] = (analysis.byInstrument[q.instrument] || 0) + 1;
        }

        // Count special types
        if (q.facet) analysis.facetQuestions++;
        if (q.instrument === 'NEURLYN_COMMUNICATION') analysis.communicationQuestions++;
        if (q.instrument === 'NEURLYN_PROCESSING') analysis.processingQuestions++;
        if (q.category === 'neurodiversity') analysis.neurodiversityQuestions++;
      });

      console.log(`  Total adaptive questions: ${analysis.total}`);
      console.log('  Categories:');
      Object.entries(analysis.byCategory).forEach(([cat, count]) => {
        const percentage = ((count / analysis.total) * 100).toFixed(1);
        console.log(`    ${cat}: ${count} (${percentage}%)`);
      });

      console.log('  Special question types:');
      console.log(`    NEO-PI-R Facets: ${analysis.facetQuestions}`);
      console.log(`    Communication: ${analysis.communicationQuestions}`);
      console.log(`    Processing: ${analysis.processingQuestions}`);
      console.log(`    Neurodiversity: ${analysis.neurodiversityQuestions}`);
    }

    // Test 3: Verify Targeting Logic
    console.log('\n3. TARGETING VERIFICATION');
    console.log('-' . repeat(40));

    // Test extreme trait targeting
    const extremeProfile = {
      traits: {
        openness: 95,      // Very high - should get high openness questions
        conscientiousness: 15,  // Very low - should get low conscientiousness questions
        extraversion: 50,   // Middle - should get clarification questions
        agreeableness: 50,  // Middle
        neuroticism: 85     // Very high
      },
      patterns: {}
    };

    const baseline = await QuestionBank.getBaselineQuestions('standard');
    const extremeAdaptive = await QuestionBank.getAdaptiveQuestions(
      extremeProfile,
      baseline.map(q => q.questionId),
      30
    );

    // Count questions targeting extreme traits
    let highOpenness = 0, lowConscientiousness = 0, highNeuroticism = 0, middleTraits = 0;

    extremeAdaptive.forEach(q => {
      if (q.trait === 'openness') highOpenness++;
      if (q.trait === 'conscientiousness') lowConscientiousness++;
      if (q.trait === 'neuroticism') highNeuroticism++;
      if (q.trait === 'extraversion' || q.trait === 'agreeableness') middleTraits++;
    });

    console.log('\nExtreme trait targeting test:');
    console.log('  Profile: High Openness(95), Low Conscientiousness(15), High Neuroticism(85)');
    console.log('  Questions selected:');
    console.log(`    Targeting high openness: ${highOpenness}`);
    console.log(`    Targeting low conscientiousness: ${lowConscientiousness}`);
    console.log(`    Targeting high neuroticism: ${highNeuroticism}`);
    console.log(`    Targeting middle traits: ${middleTraits}`);

    // Test 4: Diversity Check
    console.log('\n4. QUESTION DIVERSITY ANALYSIS');
    console.log('-' . repeat(40));

    const standardProfile = {
      traits: { openness: 60, conscientiousness: 55, extraversion: 65, agreeableness: 70, neuroticism: 45 },
      patterns: {}
    };

    // Get multiple rounds of adaptive questions to check for variety
    const rounds = 3;
    const questionSets = [];

    for (let i = 0; i < rounds; i++) {
      const adaptive = await QuestionBank.getAdaptiveQuestions(
        standardProfile,
        baseline.map(q => q.questionId),
        20
      );
      questionSets.push(adaptive.map(q => q.questionId));
    }

    // Check overlap between rounds
    console.log('\nConsistency check across multiple rounds:');
    for (let i = 0; i < rounds - 1; i++) {
      for (let j = i + 1; j < rounds; j++) {
        const overlap = questionSets[i].filter(q => questionSets[j].includes(q)).length;
        const similarity = (overlap / 20) * 100;
        console.log(`  Round ${i+1} vs Round ${j+1}: ${overlap}/20 overlap (${similarity.toFixed(1)}% similar)`);
      }
    }

    // Test 5: Check Comprehensive Tier
    console.log('\n5. COMPREHENSIVE TIER ANALYSIS');
    console.log('-' . repeat(40));

    const comprehensiveBaseline = await QuestionBank.getBaselineQuestions('comprehensive');
    const comprehensiveAdaptive = await QuestionBank.getComprehensiveAdaptiveQuestions(
      standardProfile,
      comprehensiveBaseline.map(q => q.questionId),
      50,
      'comprehensive'
    );

    console.log(`\nComprehensive tier (70 questions total):`);
    console.log(`  Baseline questions: ${comprehensiveBaseline.length}`);
    console.log(`  Adaptive questions: ${comprehensiveAdaptive.length}`);

    // Analyze comprehensive coverage
    const compAnalysis = {
      personality: 0,
      neurodiversity: 0,
      cognitive: 0,
      attachment: 0,
      other: 0
    };

    comprehensiveAdaptive.forEach(q => {
      switch(q.category) {
        case 'personality': compAnalysis.personality++; break;
        case 'neurodiversity': compAnalysis.neurodiversity++; break;
        case 'cognitive': compAnalysis.cognitive++; break;
        case 'attachment': compAnalysis.attachment++; break;
        default: compAnalysis.other++;
      }
    });

    console.log('  Category distribution:');
    Object.entries(compAnalysis).forEach(([cat, count]) => {
      if (count > 0) {
        const percentage = ((count / comprehensiveAdaptive.length) * 100).toFixed(1);
        console.log(`    ${cat}: ${count} (${percentage}%)`);
      }
    });

    // Test 6: Response Pattern Detection
    console.log('\n6. RESPONSE PATTERN DETECTION');
    console.log('-' . repeat(40));

    const patterns = ['high_openness', 'low_conscientiousness', 'high_neuroticism', 'balanced', 'extreme'];

    for (const pattern of patterns) {
      const responses = generateBaselineResponses(pattern);
      const analysis = await engine.analyzeResponsePatterns(responses);

      console.log(`\n${pattern.toUpperCase()} pattern:`);
      console.log(`  Average score: ${analysis.averageScore.toFixed(2)}`);
      console.log(`  Response style: ${analysis.responseStyle}`);
      console.log(`  Consistency: ${analysis.consistency}`);
      console.log('  Detected traits:', Object.entries(analysis.traits)
        .filter(([_, score]) => score > 0)
        .map(([trait, score]) => `${trait}=${(score * 100).toFixed(0)}%`)
        .join(', '));
    }

    // Summary
    console.log('\n' + '=' . repeat(80));
    console.log('SUMMARY');
    console.log('=' . repeat(80));

    const totalQuestions = await QuestionBank.countDocuments();
    const withAdaptiveCriteria = await QuestionBank.countDocuments({
      'adaptive.adaptiveCriteria': { $exists: true }
    });
    const withFacets = await QuestionBank.countDocuments({ facet: { $exists: true, $ne: null } });

    console.log(`\nDatabase Statistics:`);
    console.log(`  Total questions: ${totalQuestions}`);
    console.log(`  With adaptive criteria: ${withAdaptiveCriteria}`);
    console.log(`  With NEO-PI-R facets: ${withFacets}`);

    console.log(`\n✅ Adaptive system verification complete!`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the analysis
if (require.main === module) {
  analyzeAdaptiveSelection();
}

module.exports = analyzeAdaptiveSelection;
