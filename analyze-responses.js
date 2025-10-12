const mongoose = require('mongoose');
const AssessmentSession = require('./models/AssessmentSession');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test').then(async () => {
  console.log('\n=== RESPONSE STRUCTURE ANALYSIS ===\n');

  const session = await AssessmentSession.findOne({
    sessionId: 'ADAPTIVE_1759950799594_to5uj5v30'
  });

  if (!session) {
    console.log('Session not found');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  console.log('Session:', session.sessionId);
  console.log('Total responses:', session.responses.length);

  // Check response structure
  console.log('\nFirst 5 response structures:');
  session.responses.slice(0, 5).forEach((r, i) => {
    console.log(`\n  Response ${i+1}:`);
    console.log(`    questionId: ${r.questionId}`);
    console.log(`    value: ${r.value}`);
    console.log(`    trait: ${r.trait}`);
    console.log(`    category: ${r.category}`);
    console.log(`    facet: ${r.facet}`);
    console.log(`    subcategory: ${r.subcategory}`);
    console.log(`    instrument: ${r.instrument}`);
  });

  // Count responses with facet
  const withFacet = session.responses.filter(r => r.facet).length;
  const withTrait = session.responses.filter(r => r.trait).length;
  const withCategory = session.responses.filter(r => r.category).length;

  console.log('\nField population in responses:');
  console.log(`  Responses with facet: ${withFacet}/${session.responses.length}`);
  console.log(`  Responses with trait: ${withTrait}/${session.responses.length}`);
  console.log(`  Responses with category: ${withCategory}/${session.responses.length}`);

  // Check if questions asked have facets in DB
  const QuestionBank = require('./models/QuestionBank');
  const questionIds = session.responses.map(r => r.questionId);
  const questions = await QuestionBank.find({ questionId: { $in: questionIds } });

  console.log('\n=== QUESTION BANK vs RESPONSES ===\n');
  const questionsWithFacets = questions.filter(q => q.facet).length;
  console.log(`Questions in DB with facet field: ${questionsWithFacets}/${questions.length}`);

  // Show mismatch examples
  console.log('\nExamples of facet data in DB but not in responses:');
  const mismatch = questions.filter(q => q.facet).slice(0, 3);
  mismatch.forEach(q => {
    const response = session.responses.find(r => r.questionId === q.questionId);
    console.log(`  ${q.questionId}:`);
    console.log(`    DB has facet: "${q.facet}"`);
    console.log(`    Response has facet: "${response?.facet || 'undefined'}"`);
  });

  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
