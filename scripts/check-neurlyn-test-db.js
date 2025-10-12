/**
 * Check neurlyn-test database for clinical questions
 */

const mongoose = require('mongoose');
require('dotenv').config();

const QuestionBank = require('../models/QuestionBank');

async function checkTestDatabase() {
  try {
    // Connect to neurlyn-test database
    await mongoose.connect('mongodb://127.0.0.1:27017/neurlyn-test');

    console.log('✅ Connected to neurlyn-test database\n');

    // Count total questions
    const total = await QuestionBank.countDocuments({ active: true });
    console.log(`Total active questions: ${total}\n`);

    // Check for clinical instruments
    console.log('Clinical Instruments Check:\n');

    const phq9 = await QuestionBank.countDocuments({ questionId: /PHQ9|DEPRESSION_PHQ9/i, active: true });
    console.log(`  PHQ-9 (Depression): ${phq9} questions`);

    const gad7 = await QuestionBank.countDocuments({ questionId: /GAD7|ANXIETY_GAD7/i, active: true });
    console.log(`  GAD-7 (Anxiety): ${gad7} questions`);

    const mdq = await QuestionBank.countDocuments({ questionId: /MDQ|MANIA_MDQ/i, active: true });
    console.log(`  MDQ (Mania): ${mdq} questions`);

    const pqb = await QuestionBank.countDocuments({ questionId: /PQB|PSYCHOSIS/i, active: true });
    console.log(`  PQ-B (Psychosis): ${pqb} questions`);

    const aces = await QuestionBank.countDocuments({ questionId: /ACES_|ACE_/i, active: true });
    console.log(`  ACEs (Trauma): ${aces} questions`);

    const bpd = await QuestionBank.countDocuments({ questionId: /BORDERLINE|MSI_BPD|BPD_/i, active: true });
    console.log(`  MSI-BPD (Borderline): ${bpd} questions`);

    const phq15 = await QuestionBank.countDocuments({ questionId: /PHQ15|SOMATIC/i, active: true });
    console.log(`  PHQ-15 (Somatic): ${phq15} questions`);

    const iip = await QuestionBank.countDocuments({ questionId: /IIP_/i, active: true });
    console.log(`  IIP-32 (Interpersonal): ${iip} questions`);

    const resilience = await QuestionBank.countDocuments({ questionId: /RESILIENCE_|CDRISC/i, active: true });
    console.log(`  CD-RISC (Resilience): ${resilience} questions`);

    const hexaco = await QuestionBank.countDocuments({ questionId: /HEXACO_H/i, active: true });
    console.log(`  HEXACO H-H: ${hexaco} questions`);

    console.log('\n\nCategory distribution:');
    const categories = await QuestionBank.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    categories.forEach(({ _id, count }) => {
      console.log(`  ${(_id || 'null').padEnd(30)} ${count} questions`);
    });

    // Sample some PHQ-9 questions
    if (phq9 > 0) {
      console.log('\n\nSample PHQ-9 questions:');
      const samples = await QuestionBank.find({
        questionId: /PHQ9|DEPRESSION_PHQ9/i,
        active: true
      }).limit(3);

      samples.forEach(q => {
        console.log(`  - ${q.questionId}: "${q.text.substring(0, 60)}..."`);
      });
    }

    // Sample some GAD-7 questions
    if (gad7 > 0) {
      console.log('\n\nSample GAD-7 questions:');
      const samples = await QuestionBank.find({
        questionId: /GAD7|ANXIETY_GAD7/i,
        active: true
      }).limit(3);

      samples.forEach(q => {
        console.log(`  - ${q.questionId}: "${q.text.substring(0, 60)}..."`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run check
if (require.main === module) {
  checkTestDatabase();
}

module.exports = checkTestDatabase;
