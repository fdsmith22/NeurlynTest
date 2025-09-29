const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

async function checkNeurodiversityQuestions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to database');

    // Check for ADHD questions
    const adhdQuestions = await QuestionBank.find({
      $or: [
        { category: /adhd/i },
        { subcategory: /adhd/i },
        { instrument: /asrs|adhd/i },
        { text: /attention|hyperactive|impulsive|focus|concentrate|distracted/i }
      ],
      tier: { $in: ['comprehensive', 'both'] }
    }).limit(10);

    console.log('\n=== ADHD Questions ===');
    console.log(`Found ${adhdQuestions.length} ADHD-related questions`);
    adhdQuestions.forEach(q => {
      console.log(`- [${q.instrument}] ${q.text.substring(0, 80)}...`);
    });

    // Check for Autism/ASD questions
    const autismQuestions = await QuestionBank.find({
      $or: [
        { category: /autism|asd/i },
        { subcategory: /autism|asd/i },
        { instrument: /aq|raads|autism/i },
        { text: /routine|social|sensory|eye contact|literal|pattern/i }
      ],
      tier: { $in: ['comprehensive', 'both'] }
    }).limit(10);

    console.log('\n=== Autism/ASD Questions ===');
    console.log(`Found ${autismQuestions.length} autism-related questions`);
    autismQuestions.forEach(q => {
      console.log(`- [${q.instrument}] ${q.text.substring(0, 80)}...`);
    });

    // Check for general neurodiversity questions
    const neurodiversityQuestions = await QuestionBank.find({
      $or: [
        { category: /neurodiversity/i },
        { subcategory: /neurodiversity|executive|sensory/i },
        { instrument: /neuro|executive|sensory/i }
      ],
      tier: { $in: ['comprehensive', 'both'] }
    }).limit(10);

    console.log('\n=== General Neurodiversity Questions ===');
    console.log(`Found ${neurodiversityQuestions.length} neurodiversity questions`);
    neurodiversityQuestions.forEach(q => {
      console.log(`- [${q.category}] ${q.text.substring(0, 80)}...`);
    });

    // Get unique instruments for neurodiversity
    const allNeuroDivQuestions = await QuestionBank.find({
      $or: [
        { category: /adhd|autism|asd|neurodiversity/i },
        { subcategory: /adhd|autism|asd|neurodiversity|executive|sensory/i },
        { instrument: /asrs|aq|raads|adhd|autism|neuro/i }
      ]
    });

    const uniqueInstruments = [...new Set(allNeuroDivQuestions.map(q => q.instrument))].filter(
      Boolean
    );
    console.log('\n=== Unique Neurodiversity Instruments ===');
    console.log(uniqueInstruments.join(', '));

    // Count by category
    const categoryCounts = {};
    allNeuroDivQuestions.forEach(q => {
      const cat = q.category || 'unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    console.log('\n=== Questions by Category ===');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} questions`);
    });

    console.log(`\nTotal neurodiversity-related questions: ${allNeuroDivQuestions.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNeurodiversityQuestions();
