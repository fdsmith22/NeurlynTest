/**
 * Validate Question Answer Types
 * Checks for mismatches between question text and answer options
 */

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

const QuestionBank = require('../models/QuestionBank');

// Define expected answer types for different question patterns
const ANSWER_TYPE_RULES = {
  // Frequency questions (GAD-7, PHQ-9, etc.)
  frequency: {
    patterns: [
      /how often/i,
      /how frequently/i,
      /over the past.*weeks?.*how (much|many)/i,
      /during the past.*weeks?/i
    ],
    expectedOptions: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    expectedScores: [0, 1, 2, 3],
    instruments: ['GAD-7', 'PHQ-9']
  },

  // PHQ-15 somatic symptoms
  somatic_bothered: {
    patterns: [
      /how much.*bothered/i,
      /bothered by/i
    ],
    expectedOptions: ['Not bothered at all', 'Bothered a little', 'Bothered a lot'],
    expectedScores: [0, 1, 2],
    instruments: ['PHQ-15']
  },

  // Binary Yes/No questions (MDQ, PQ-B, ACEs, DAST)
  binary: {
    patterns: [
      /^(have you|did you|were you|has there)/i,
      /yes or no/i
    ],
    expectedOptions: ['No', 'Yes'],
    expectedScores: [0, 1],
    instruments: ['MDQ', 'PQ-B', 'PSYCHOSIS', 'ACEs', 'DAST', 'MANIA']
  },

  // Likert agreement scale (most personality questions)
  likert: {
    patterns: [
      /^i (am|feel|find|tend|like|prefer|enjoy|believe)/i,
      /describes? (you|me)/i,
      /^my /i
    ],
    expectedOptions: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    expectedScores: [1, 2, 3, 4, 5],
    instruments: ['NEO-PI-R', 'BFI-2', 'HEXACO', 'Big Five']
  }
};

async function validateQuestions() {
  const issues = [];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const questions = await QuestionBank.find({ active: true });
    console.log(`📊 Analyzing ${questions.length} active questions...\n`);

    for (const question of questions) {
      const issue = validateQuestionAnswerType(question);
      if (issue) {
        issues.push(issue);
      }
    }

    // Report findings
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`VALIDATION COMPLETE: ${issues.length} issues found`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (issues.length > 0) {
      // Group by issue type
      const byType = {};
      issues.forEach(issue => {
        if (!byType[issue.expectedType]) byType[issue.expectedType] = [];
        byType[issue.expectedType].push(issue);
      });

      Object.entries(byType).forEach(([type, typeIssues]) => {
        console.log(`\n🔴 ${type.toUpperCase()} QUESTIONS WITH WRONG ANSWERS (${typeIssues.length} found):`);
        console.log('─────────────────────────────────────────────────────────────');

        typeIssues.forEach((issue, idx) => {
          console.log(`\n${idx + 1}. [${issue.questionId}] ${issue.category} > ${issue.subcategory}`);
          console.log(`   Instrument: ${issue.instrument || 'N/A'}`);
          console.log(`   Text: "${issue.text.substring(0, 100)}${issue.text.length > 100 ? '...' : ''}"`);
          console.log(`   Current options: ${JSON.stringify(issue.currentOptions)}`);
          console.log(`   Expected options: ${JSON.stringify(issue.expectedOptions)}`);
          console.log(`   Reason: ${issue.reason}`);
        });
      });

      console.log('\n\n📝 SUMMARY BY CATEGORY:');
      console.log('─────────────────────────────────────────────────────────────');
      Object.entries(byType).forEach(([type, typeIssues]) => {
        console.log(`${type}: ${typeIssues.length} questions`);
      });

      console.log('\n\n💡 RECOMMENDED ACTION:');
      console.log('Run fix script to correct these questions:');
      console.log('node scripts/fix-question-answer-types.js');
    } else {
      console.log('✅ All questions have appropriate answer options!\n');
    }

    await mongoose.disconnect();
    process.exit(issues.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

function validateQuestionAnswerType(question) {
  const text = question.text;
  const options = question.options || [];
  const currentLabels = options.map(o => o.label || o.value);
  const currentScores = options.map(o => o.score);

  // PRIORITY 1: Check instrument match first (more reliable)
  if (question.instrument) {
    for (const [typeName, rule] of Object.entries(ANSWER_TYPE_RULES)) {
      const matchesInstrument = rule.instruments.some(inst =>
        question.instrument.includes(inst) || inst.includes(question.instrument)
      );

      if (matchesInstrument) {
        const optionsMatch = arraysEqual(currentLabels, rule.expectedOptions);

        if (!optionsMatch) {
          return {
            questionId: question.questionId,
            category: question.category,
            subcategory: question.subcategory,
            instrument: question.instrument,
            text: text,
            expectedType: typeName,
            currentOptions: currentLabels,
            expectedOptions: rule.expectedOptions,
            currentScores: currentScores,
            expectedScores: rule.expectedScores,
            reason: `Instrument ${question.instrument} uses ${typeName} format`
          };
        }
        // Options match - this is correct, don't check text patterns
        return null;
      }
    }
  }

  // PRIORITY 2: Fall back to text pattern matching (only if no instrument match)
  for (const [typeName, rule] of Object.entries(ANSWER_TYPE_RULES)) {
    const matchesPattern = rule.patterns.some(pattern => pattern.test(text));

    if (matchesPattern) {
      const optionsMatch = arraysEqual(currentLabels, rule.expectedOptions);

      if (!optionsMatch) {
        return {
          questionId: question.questionId,
          category: question.category,
          subcategory: question.subcategory,
          instrument: question.instrument,
          text: text,
          expectedType: typeName,
          currentOptions: currentLabels,
          expectedOptions: rule.expectedOptions,
          currentScores: currentScores,
          expectedScores: rule.expectedScores,
          reason: `Question text pattern suggests ${typeName} format`
        };
      }
    }
  }

  return null;
}

function arraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => val === arr2[idx]);
}

// Run validation
validateQuestions();
