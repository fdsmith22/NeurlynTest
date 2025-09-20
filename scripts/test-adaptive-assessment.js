#!/usr/bin/env node

/**
 * Test script for Enhanced Adaptive Assessment System
 * Validates branching, question selection, and report generation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const EnhancedAdaptiveEngine = require('../services/enhanced-adaptive-engine');
const EnhancedReportGenerator = require('../js/enhanced-report-generator');
const logger = require('../utils/logger');

async function testAdaptiveSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
    logger.info('Connected to MongoDB for testing');

    // console.log('\n🧪 Testing Enhanced Adaptive Assessment System\n');
    // console.log('='.repeat(50));

    // Test different user profiles
    const testProfiles = [
      {
        name: 'ADHD-focused Young Adult',
        demographics: { age: 22, gender: 'male' },
        concerns: ['adhd', 'anxiety'],
        tier: 'standard'
      },
      {
        name: 'Autism-focused Adult Woman',
        demographics: { age: 35, gender: 'female' },
        concerns: ['autism', 'masking'],
        tier: 'deep'
      },
      {
        name: 'Twice-Exceptional Teen',
        demographics: { age: 17, gender: 'non-binary' },
        concerns: ['gifted', 'adhd', 'autism'],
        tier: 'standard'
      },
      {
        name: 'Trauma-Informed Assessment',
        demographics: { age: 28, gender: 'female' },
        concerns: ['trauma', 'anxiety', 'depression'],
        tier: 'quick'
      }
    ];

    for (const profile of testProfiles) {
      // console.log(`\n📋 Testing Profile: ${profile.name}`);
      // console.log('-'.repeat(40));

      // Initialize engine
      const engine = new EnhancedAdaptiveEngine();

      // Generate adaptive assessment
      const assessment = await engine.generatePersonalizedAssessment(profile.tier, {
        concerns: profile.concerns,
        demographics: profile.demographics
      });

      // Display results
      // console.log(`✅ Generated ${assessment.totalQuestions} questions for ${profile.tier} tier`);
      // console.log(`📊 Adaptation Strategy: ${assessment.adaptiveMetadata.adaptationStrategy}`);
      // console.log(
      //         `🎯 Active Pathways: ${assessment.adaptiveMetadata.pathways.join(', ') || 'None'}`
      //       );

      // Analyze question distribution
      const categories = {};
      const subcategories = {};

      assessment.questions.forEach(q => {
        categories[q.category] = (categories[q.category] || 0) + 1;
        if (q.subcategory) {
          subcategories[q.subcategory] = (subcategories[q.subcategory] || 0) + 1;
        }
      });

      // console.log('\n📈 Question Distribution:');
      Object.entries(categories).forEach(([cat, count]) => {
        const percentage = Math.round((count / assessment.totalQuestions) * 100);
        // console.log(`   ${cat}: ${count} (${percentage}%)`);
      });

      if (Object.keys(subcategories).length > 0) {
        // console.log('\n🔍 Subcategory Focus:');
        Object.entries(subcategories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([subcat, count]) => {
            // console.log(`   ${subcat}: ${count}`);
          });
      }

      // Simulate user responses for report generation
      // console.log('\n🎭 Simulating User Responses...');
      const simulatedResponses = simulateResponses(assessment.questions, profile);

      // Analyze response patterns
      const responseAnalysis = engine.analyzeResponsePatterns(
        simulatedResponses.responses,
        simulatedResponses.timings
      );

      // console.log('\n🧠 Response Pattern Analysis:');
      // console.log(`   Response Style: ${responseAnalysis.patterns.responseStyle}`);
      // console.log(`   Engagement: ${responseAnalysis.patterns.engagement}`);
      // console.log(`   Confidence: ${responseAnalysis.patterns.confidence}`);
      // console.log(
      //         `   Activated Pathways: ${Object.keys(responseAnalysis.pathwayActivations).join(', ') || 'None'}`
      //       );

      // Generate personalization profile
      const personalizationProfile = engine.generatePersonalizationProfile(
        simulatedResponses.responses,
        responseAnalysis
      );

      // console.log('\n💡 Personalization Insights:');
      // console.log(`   Cognitive Style: ${personalizationProfile.cognitiveProfile.processingStyle}`);
      // console.log(`   Learning Style: ${personalizationProfile.cognitiveProfile.learningStyle}`);
      // console.log(
      //         `   Emotional Awareness: ${personalizationProfile.emotionalProfile.emotionalAwareness}`
      //       );
      // console.log(`   Stress Response: ${personalizationProfile.emotionalProfile.stressResponse}`);

      if (personalizationProfile.hiddenPatterns.length > 0) {
        // console.log('\n🔮 Hidden Patterns Detected:');
        personalizationProfile.hiddenPatterns.forEach(pattern => {
          // console.log(`   - ${pattern.type}: ${pattern.description}`);
          // console.log(`     Confidence: ${Math.round(pattern.confidence * 100)}%`);
        });
      }

      // Test report generation
      // console.log('\n📝 Generating Personalized Report...');
      const reportGenerator = new EnhancedReportGenerator();
      const reportData = {
        responses: simulatedResponses.responses,
        userProfile: assessment.userProfile,
        behavioralData: responseAnalysis.behavioralMarkers,
        pathwayActivations: responseAnalysis.pathwayActivations,
        personalizationProfile: personalizationProfile,
        timingData: simulatedResponses.timings,
        tier: profile.tier
      };

      const report = await reportGenerator.generatePersonalizedReport(reportData);

      // console.log('\n📊 Report Generated Successfully:');
      // console.log(`   Headline: ${report.executiveSummary.headline}`);
      // console.log(`   Engagement Level: ${report.meta.engagementLevel}`);
      // console.log(`   Confidence Level: ${report.meta.confidenceLevel}`);
      // console.log(`   Response Consistency: ${report.meta.responseConsistency}`);

      // Display key insights
      if (report.neurodiversityInsights.profile.adhd) {
        // console.log(
        //           `\n   ADHD Presence: ${Math.round(report.neurodiversityInsights.profile.adhd.presence * 100)}%`
        //         );
      }
      if (report.neurodiversityInsights.profile.autism) {
        // console.log(
        //           `   Autism Presence: ${Math.round(report.neurodiversityInsights.profile.autism.presence * 100)}%`
        //         );
      }
      if (report.hiddenStrengths.discovered.length > 0) {
        // console.log('\n   Hidden Strengths Discovered:');
        report.hiddenStrengths.discovered.forEach(strength => {
          // console.log(`   - ${strength.strength}`);
        });
      }
    }

    // console.log('\n' + '='.repeat(50));
    // console.log('✨ All tests completed successfully!');
    // console.log('='.repeat(50));

    // Test pathway effectiveness
    // console.log('\n🔄 Testing Pathway Branching Effectiveness:');
    await testPathwayBranching();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

/**
 * Simulate user responses based on profile
 */
function simulateResponses(questions, profile) {
  const responses = [];
  const timings = [];

  questions.forEach(question => {
    // Simulate response based on profile concerns
    let score = 3; // Default neutral
    let responseTime = 3000 + Math.random() * 5000; // 3-8 seconds

    // ADHD profile responses
    if (profile.concerns.includes('adhd')) {
      if (question.subcategory === 'executive_function') {
        score = Math.random() > 0.3 ? 4 + Math.floor(Math.random() * 2) : 3;
        responseTime = 1500 + Math.random() * 2000; // Faster responses
      }
      if (question.subcategory === 'emotional_regulation') {
        score = Math.random() > 0.4 ? 4 : 3;
      }
    }

    // Autism profile responses
    if (profile.concerns.includes('autism')) {
      if (question.subcategory === 'sensory_processing') {
        score = Math.random() > 0.3 ? 4 + Math.floor(Math.random() * 2) : 2;
        responseTime = 5000 + Math.random() * 5000; // Slower, more deliberate
      }
      if (question.subcategory === 'masking') {
        score =
          profile.demographics.gender === 'female'
            ? Math.random() > 0.2
              ? 4 + Math.floor(Math.random() * 2)
              : 3
            : 3;
      }
      if (question.subcategory === 'special_interests') {
        score = Math.random() > 0.4 ? 5 : 3;
      }
    }

    // Trauma profile responses
    if (profile.concerns.includes('trauma')) {
      if (question.category === 'trauma_screening') {
        score = Math.random() > 0.4 ? 4 : 3;
        responseTime = 8000 + Math.random() * 4000; // Very deliberate
      }
      if (question.category === 'attachment') {
        score = Math.random() > 0.5 ? 4 : 2;
      }
    }

    // Gifted profile responses
    if (profile.concerns.includes('gifted')) {
      if (question.category === 'cognitive_functions') {
        score = Math.random() > 0.3 ? 4 + Math.floor(Math.random() * 2) : 3;
      }
      if (question.category === 'learning_style') {
        score = Math.random() > 0.4 ? 4 : 3;
      }
    }

    responses.push({
      question: question,
      score: score,
      value: score,
      responseTime: responseTime
    });

    timings.push(responseTime);
  });

  return { responses, timings };
}

/**
 * Test pathway branching effectiveness
 */
async function testPathwayBranching() {
  const engine = new EnhancedAdaptiveEngine();

  // Test ADHD pathway activation
  const adhdResponses = [
    { score: 5, question: { subcategory: 'executive_function' } },
    { score: 4, question: { subcategory: 'executive_function' } },
    { score: 5, question: { subcategory: 'emotional_regulation' } }
  ];

  const adhdAnalysis = engine.analyzeResponsePatterns(adhdResponses);
  // console.log('\n   ADHD Pathway Test:');
  // console.log(`   - Activated: ${adhdAnalysis.pathwayActivations.adhd ? 'Yes ✅' : 'No ❌'}`);

  // Test Autism pathway activation
  const autismResponses = [
    { score: 5, question: { subcategory: 'sensory_processing' } },
    { score: 4, question: { subcategory: 'masking' } },
    { score: 5, question: { subcategory: 'special_interests' } }
  ];

  const autismAnalysis = engine.analyzeResponsePatterns(autismResponses);
  // console.log('\n   Autism Pathway Test:');
  // console.log(`   - Activated: ${autismAnalysis.pathwayActivations.autism ? 'Yes ✅' : 'No ❌'}`);

  // Test AuDHD (combined) pathway
  const audhdResponses = [...adhdResponses, ...autismResponses];
  const audhdAnalysis = engine.analyzeResponsePatterns(audhdResponses);
  // console.log('\n   AuDHD Combined Pathway Test:');
  // console.log(`   - ADHD: ${audhdAnalysis.pathwayActivations.adhd ? 'Yes ✅' : 'No ❌'}`);
  // console.log(`   - Autism: ${audhdAnalysis.pathwayActivations.autism ? 'Yes ✅' : 'No ❌'}`);

  // Test hidden pattern detection
  const complexResponses = [
    { score: 5, question: { category: 'cognitive_functions' } },
    { score: 5, question: { category: 'cognitive_functions' } },
    { score: 4, question: { subcategory: 'executive_function' } },
    { score: 4, question: { subcategory: 'sensory_processing' } }
  ];

  const complexProfile = engine.generatePersonalizationProfile(
    complexResponses,
    engine.analyzeResponsePatterns(complexResponses)
  );

  // console.log('\n   Hidden Pattern Detection:');
  if (complexProfile.hiddenPatterns.length > 0) {
    complexProfile.hiddenPatterns.forEach(pattern => {
      // console.log(`   - ${pattern.type}: Detected ✅`);
    });
  } else {
    // console.log('   - No hidden patterns detected');
  }
}

// Run tests
if (require.main === module) {
  testAdaptiveSystem();
}

module.exports = { testAdaptiveSystem };
