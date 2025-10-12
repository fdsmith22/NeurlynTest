#!/usr/bin/env node

/**
 * Check Assessment Structure
 * Examine actual assessment data structure to find where scores/archetypes are stored
 */

const mongoose = require('mongoose');
const AssessmentSession = require('../models/AssessmentSession');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

async function checkAssessmentStructure() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get the most recent assessment
    const latest = await AssessmentSession.findOne()
      .sort({ startTime: -1 })
      .limit(1);

    if (!latest) {
      console.log('❌ No assessments found');
      await mongoose.disconnect();
      return;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LATEST ASSESSMENT STRUCTURE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`Session ID: ${latest.sessionId}`);
    console.log(`Phase: ${latest.phase}`);
    console.log(`Tier: ${latest.tier}`);
    console.log(`Assessment Tier: ${latest.assessmentTier}`);
    console.log(`Started: ${latest.startTime}`);
    console.log(`Completed: ${latest.completedAt || 'N/A'}`);
    console.log(`Questions Answered: ${latest.questionsAnswered}`);
    console.log('');

    console.log('Final Report Structure:');
    if (latest.finalReport) {
      console.log(`  generated: ${latest.finalReport.generated}`);
      console.log(`  reportId: ${latest.finalReport.reportId || 'N/A'}`);
      console.log(`  completionTime: ${latest.finalReport.completionTime || 'N/A'}`);
      console.log(`  insights: ${latest.finalReport.insights?.length || 0} items`);
      console.log(`  recommendations: ${latest.finalReport.recommendations?.length || 0} items`);

      if (latest.finalReport.neurodivergentScreening) {
        console.log('\n  Neurodivergent Screening:');
        Object.entries(latest.finalReport.neurodivergentScreening).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            console.log(`    ${key}: score=${value.score}, confidence=${value.confidence}`);
          } else {
            console.log(`    ${key}: ${value}`);
          }
        });
      }
    } else {
      console.log('  No finalReport object found');
    }

    console.log('\nBaseline Profile:');
    if (latest.baselineProfile) {
      if (latest.baselineProfile.traits) {
        console.log('  Big Five Traits:');
        Object.entries(latest.baselineProfile.traits).forEach(([trait, score]) => {
          console.log(`    ${trait}: ${score}`);
        });
      }
      if (latest.baselineProfile.archetype) {
        console.log(`  Archetype: ${latest.baselineProfile.archetype.name} (similarity: ${latest.baselineProfile.archetype.similarity})`);
      }
      if (latest.baselineProfile.patterns) {
        console.log(`  Patterns: ${latest.baselineProfile.patterns.length} detected`);
      }
    } else {
      console.log('  No baselineProfile found');
    }

    // Get all assessments to check which ones have completed reports
    const allAssessments = await AssessmentSession.find({})
      .sort({ startTime: -1 })
      .limit(10)
      .select('sessionId phase finalReport.generated questionsAnswered');

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  RECENT ASSESSMENTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Session ID'.padEnd(40) + '| Phase      | Questions | Report?');
    console.log('─'.repeat(80));

    allAssessments.forEach(a => {
      const id = a.sessionId.slice(0, 38).padEnd(40);
      const phase = (a.phase || 'unknown').padEnd(10);
      const questions = (a.questionsAnswered || 0).toString().padStart(3);
      const report = a.finalReport?.generated ? '✓' : '✗';
      console.log(`${id}| ${phase} | ${questions}       | ${report}`);
    });

    console.log('\n✅ Structure check complete!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAssessmentStructure();
