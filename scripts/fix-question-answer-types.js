/**
 * Fix Question Answer Types
 * Automatically corrects mismatched question/answer types
 */

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

const QuestionBank = require('../models/QuestionBank');

// Define correct answer options for each type
const ANSWER_OPTIONS = {
  // Frequency scale (GAD-7, PHQ-9, AUDIT frequency questions)
  frequency: [
    { value: 0, label: 'Not at all', score: 0 },
    { value: 1, label: 'Several days', score: 1 },
    { value: 2, label: 'More than half the days', score: 2 },
    { value: 3, label: 'Nearly every day', score: 3 }
  ],

  // PHQ-15 somatic bothered scale
  somatic_bothered: [
    { value: 0, label: 'Not bothered at all', score: 0 },
    { value: 1, label: 'Bothered a little', score: 1 },
    { value: 2, label: 'Bothered a lot', score: 2 }
  ],

  // Binary Yes/No (MDQ, PQ-B, ACEs, DAST)
  binary: [
    { value: 0, label: 'No', score: 0 },
    { value: 1, label: 'Yes', score: 1 }
  ],

  // Likert agreement scale (personality, most clinical questions)
  likert: [
    { value: 1, label: 'Strongly Disagree', score: 1 },
    { value: 2, label: 'Disagree', score: 2 },
    { value: 3, label: 'Neutral', score: 3 },
    { value: 4, label: 'Agree', score: 4 },
    { value: 5, label: 'Strongly Agree', score: 5 }
  ]
};

// Detection rules (same as validation script)
const DETECTION_RULES = {
  frequency: {
    patterns: [
      /how often/i,
      /how frequently/i,
      /over the past.*weeks?.*how (much|many)/i,
      /during the past.*weeks?/i,
      /during the last.*weeks?/i
    ],
    instruments: ['GAD-7', 'PHQ-9', 'AUDIT']
  },

  somatic_bothered: {
    patterns: [
      /how much.*bothered/i,
      /bothered by/i
    ],
    instruments: ['PHQ-15']
  },

  binary: {
    patterns: [
      /^(have you|did you|were you|has there|have there)/i,
      /yes or no/i
    ],
    instruments: ['MDQ', 'PQ-B', 'PSYCHOSIS', 'ACEs', 'DAST', 'MANIA']
  },

  likert: {
    patterns: [
      /^i (am|feel|find|tend|like|prefer|enjoy|believe|have)/i,
      /describes? (you|me)/i,
      /^my /i
    ],
    instruments: ['NEO-PI-R', 'BFI-2', 'HEXACO', 'Big Five', 'NEURLYN']
  }
};

async function fixQuestions() {
  let fixedCount = 0;
  const fixes = [];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const questions = await QuestionBank.find({ active: true });
    console.log(`📊 Analyzing ${questions.length} active questions...\n`);

    for (const question of questions) {
      const correctType = detectCorrectType(question);

      if (correctType) {
        const currentLabels = (question.options || []).map(o => o.label || o.value);
        const correctLabels = ANSWER_OPTIONS[correctType].map(o => o.label);

        // Check if options need fixing
        const needsFix = !arraysEqual(currentLabels, correctLabels);

        if (needsFix) {
          // Apply fix
          question.options = ANSWER_OPTIONS[correctType];
          await question.save();

          fixedCount++;
          fixes.push({
            questionId: question.questionId,
            text: question.text,
            type: correctType,
            oldOptions: currentLabels,
            newOptions: correctLabels
          });

          if (fixedCount % 10 === 0) {
            process.stdout.write(`\r✏️  Fixed ${fixedCount} questions...`);
          }
        }
      }
    }

    console.log(`\n\n═══════════════════════════════════════════════════════════`);
    console.log(`✅ FIX COMPLETE: ${fixedCount} questions corrected`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    if (fixedCount > 0) {
      // Group by type
      const byType = {};
      fixes.forEach(fix => {
        if (!byType[fix.type]) byType[fix.type] = [];
        byType[fix.type].push(fix);
      });

      Object.entries(byType).forEach(([type, typeFixes]) => {
        console.log(`\n📝 ${type.toUpperCase()} (${typeFixes.length} fixed):`);
        console.log('─────────────────────────────────────────────────────────────');
        console.log(`Sample fix: ${typeFixes[0].questionId}`);
        console.log(`  Text: "${typeFixes[0].text.substring(0, 80)}..."`);
        console.log(`  Old: ${JSON.stringify(typeFixes[0].oldOptions.slice(0, 3))}`);
        console.log(`  New: ${JSON.stringify(typeFixes[0].newOptions.slice(0, 3))}`);
      });

      console.log('\n\n📊 SUMMARY:');
      console.log('─────────────────────────────────────────────────────────────');
      Object.entries(byType).forEach(([type, typeFixes]) => {
        console.log(`${type}: ${typeFixes.length} questions fixed`);
      });
      console.log(`\n✅ Total: ${fixedCount} questions corrected\n`);
    } else {
      console.log('✅ No questions needed fixing!\n');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

function detectCorrectType(question) {
  const text = question.text;

  // PRIORITY 1: Check instrument match first (more reliable than text patterns)
  if (question.instrument) {
    for (const [typeName, rule] of Object.entries(DETECTION_RULES)) {
      const matchesInstrument = rule.instruments.some(inst =>
        question.instrument.includes(inst) || inst.includes(question.instrument)
      );

      if (matchesInstrument) {
        return typeName;
      }
    }
  }

  // PRIORITY 2: Fall back to text pattern matching
  for (const [typeName, rule] of Object.entries(DETECTION_RULES)) {
    const matchesPattern = rule.patterns.some(pattern => pattern.test(text));

    if (matchesPattern) {
      return typeName;
    }
  }

  return null;
}

function arraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => val === arr2[idx]);
}

// Run fix
console.log('\n🔧 NEURLYN QUESTION ANSWER TYPE FIX');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('This script will fix questions with incorrect answer options.\n');

fixQuestions();
