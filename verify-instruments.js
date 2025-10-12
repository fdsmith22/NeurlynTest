/**
 * Verify Clinical Instruments in Database
 */

const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function verifyInstruments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    // Check if instrument field exists and is populated
    console.log('=== INSTRUMENT FIELD CHECK ===');

    const allQuestions = await QuestionBank.countDocuments();
    console.log(`Total questions: ${allQuestions}`);

    const withInstrument = await QuestionBank.countDocuments({ instrument: { $exists: true, $ne: null, $ne: '' } });
    console.log(`Questions with instrument field: ${withInstrument}`);

    const withoutInstrument = allQuestions - withInstrument;
    console.log(`Questions without instrument field: ${withoutInstrument}\n`);

    // List all unique instruments
    console.log('=== INSTRUMENTS FOUND ===');
    const instruments = await QuestionBank.aggregate([
      { $match: { instrument: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (instruments.length > 0) {
      instruments.forEach(inst => {
        console.log(`${inst._id}: ${inst.count} questions`);
      });
    } else {
      console.log('❌ NO INSTRUMENTS FOUND IN DATABASE');
    }
    console.log('');

    // Check specific clinical instrument IDs
    console.log('=== CHECKING SPECIFIC CLINICAL QUESTIONS ===');

    const phq9_1 = await QuestionBank.findOne({ questionId: 'DEPRESSION_PHQ9_1' });
    if (phq9_1) {
      console.log(`✓ DEPRESSION_PHQ9_1 found`);
      console.log(`  instrument: ${phq9_1.instrument || 'NULL'}`);
      console.log(`  category: ${phq9_1.category}`);
      console.log(`  subcategory: ${phq9_1.subcategory || 'NULL'}`);
    } else {
      console.log(`❌ DEPRESSION_PHQ9_1 NOT FOUND`);
    }

    const gad7_1 = await QuestionBank.findOne({ questionId: 'ANXIETY_GAD7_1' });
    if (gad7_1) {
      console.log(`✓ ANXIETY_GAD7_1 found`);
      console.log(`  instrument: ${gad7_1.instrument || 'NULL'}`);
      console.log(`  category: ${gad7_1.category}`);
      console.log(`  subcategory: ${gad7_1.subcategory || 'NULL'}`);
    } else {
      console.log(`❌ ANXIETY_GAD7_1 NOT FOUND`);
    }

    // Check for PHQ-9 and GAD-7 by pattern
    console.log('\n=== SEARCHING BY QUESTION ID PATTERNS ===');

    const phq9Questions = await QuestionBank.find({ questionId: /^DEPRESSION_PHQ9_/ });
    console.log(`PHQ-9 questions (by ID pattern): ${phq9Questions.length}`);
    if (phq9Questions.length > 0) {
      console.log('Sample:', phq9Questions[0].questionId, '- instrument:', phq9Questions[0].instrument || 'NULL');
    }

    const gad7Questions = await QuestionBank.find({ questionId: /^ANXIETY_GAD7_/ });
    console.log(`GAD-7 questions (by ID pattern): ${gad7Questions.length}`);
    if (gad7Questions.length > 0) {
      console.log('Sample:', gad7Questions[0].questionId, '- instrument:', gad7Questions[0].instrument || 'NULL');
    }

    // Check discriminationIndex
    console.log('\n=== DISCRIMINATION INDEX CHECK ===');
    const withDiscrimination = await QuestionBank.countDocuments({ discriminationIndex: { $exists: true, $ne: null } });
    console.log(`Questions with discriminationIndex: ${withDiscrimination}/${allQuestions}`);

    if (withDiscrimination > 0) {
      const sample = await QuestionBank.findOne({ discriminationIndex: { $exists: true, $ne: null } });
      console.log(`Sample discriminationIndex: ${sample.discriminationIndex} (${sample.questionId})`);
    }

    // Check baseline field
    console.log('\n=== BASELINE FIELD CHECK ===');
    const withBaseline = await QuestionBank.countDocuments({ baseline: true });
    console.log(`Questions with baseline=true: ${withBaseline}/${allQuestions}`);

    // Check tags field
    console.log('\n=== TAGS FIELD CHECK ===');
    const withTags = await QuestionBank.countDocuments({ tags: { $exists: true, $ne: null, $ne: [] } });
    console.log(`Questions with tags: ${withTags}/${allQuestions}`);

    if (withTags > 0) {
      const sampleTags = await QuestionBank.aggregate([
        { $match: { tags: { $exists: true, $ne: null, $ne: [] } } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      console.log('Top 10 tags:');
      sampleTags.forEach(tag => console.log(`  ${tag._id}: ${tag.count}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyInstruments();
