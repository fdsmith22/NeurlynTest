const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function inspectQuestions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('=== QUESTION DATABASE INSPECTION ===\n');

    // Get total count
    const total = await QuestionBank.countDocuments();
    console.log(`Total questions: ${total}\n`);

    // Get sample question
    const sample = await QuestionBank.findOne();
    console.log('Sample question structure:');
    console.log(JSON.stringify(sample, null, 2));
    console.log('\n');

    // Get unique categories
    const categories = await QuestionBank.distinct('category');
    console.log('Categories:', categories);
    console.log('\n');

    // Get unique subcategories
    const subcategories = await QuestionBank.distinct('subcategory');
    console.log('Subcategories:', subcategories);
    console.log('\n');

    // Get unique traits
    const traits = await QuestionBank.distinct('trait');
    console.log('Traits (facets):', traits);
    console.log('\n');

    // Get unique facets
    const facets = await QuestionBank.distinct('facet');
    console.log('Facets:', facets);
    console.log('\n');

    // Get unique instruments
    const instruments = await QuestionBank.distinct('instrument');
    console.log('Instruments:', instruments);
    console.log('\n');

    // Check if questions have tags field
    const questionsWithTags = await QuestionBank.countDocuments({ tags: { $exists: true, $ne: [] } });
    console.log(`Questions with tags: ${questionsWithTags}`);

    // Sample tags
    const sampleWithTags = await QuestionBank.findOne({ tags: { $exists: true, $ne: [] } });
    if (sampleWithTags) {
      console.log('Sample tags:', sampleWithTags.tags);
    }
    console.log('\n');

    // Get baseline questions count
    const baselineCount = await QuestionBank.countDocuments({ baseline: true });
    console.log(`Baseline questions: ${baselineCount}`);

    // Get questions by category
    for (const cat of categories) {
      const count = await QuestionBank.countDocuments({ category: cat });
      console.log(`  ${cat}: ${count} questions`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

inspectQuestions();
