const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

mongoose.connect('mongodb://localhost:27017/neurlyn_test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const questionIds = [
  'BASELINE_OPENNESS_1', 'BASELINE_CONSCIENTIOUSNESS_1', 'BASELINE_EXTRAVERSION_1',
  'ANXIETY_OCD_4', 'BASELINE_AGREEABLENESS_1', 'NEO_FACET_1073', 'HEXACO_H1_1',
  'COG_ANALY_001', 'NEO_FACET_1001', 'NEO_FACET_1019', 'HEXACO_H2_1',
  'SOMATIC_HEALTH_ANXIETY_1', 'NEO_FACET_1037', 'HEXACO_H3_1', 'NEO_FACET_1055',
  'ATT_ANX_002', 'NEO_FACET_1076', 'HEXACO_H4_1', 'NEO_FACET_1079', 'NDV_ADHD_001',
  'NEO_FACET_1004', 'NEO_FACET_1022', 'NEO_FACET_1058', 'ATTACHMENT_ANXIOUS_1',
  'NEO_FACET_1082', 'SUBSTANCE_ALCOHOL_1', 'NEO_FACET_1007', 'NEO_FACET_1040',
  'NEO_FACET_1025', 'ATTACHMENT_AVOIDANT_1', 'MANIA_MDQ_1', 'BASELINE_EF_1',
  'NEO_FACET_1061', 'NEO_FACET_1043', 'SUBSTANCE_ALCOHOL_2', 'NEO_FACET_1010',
  'MANIA_MDQ_2', 'NEO_FACET_1085', 'SUICIDE_SCREEN_1', 'NEO_FACET_1028',
  'NEO_FACET_1064', 'SUICIDE_SCREEN_5', 'NEO_FACET_1046', 'NDV_GEN_003',
  'NEO_FACET_1088', 'SUICIDE_SCREEN_2', 'NEO_FACET_1013', 'TREATMENT_MOTIVATION_1',
  'NEO_FACET_1031', 'SUICIDE_SCREEN_6', 'NEO_FACET_1067', 'NEO_FACET_1016',
  'NEO_FACET_1034', 'ENNE_GEN_001', 'NEO_FACET_1070', 'NEO_FACET_1049',
  'SUICIDE_SCREEN_3', 'NEO_FACET_1052', 'LEARN_KINESTHETI_001', 'SUICIDE_SCREEN_7',
  'ENNE_GEN_002', 'PROBE_WORRY_1', 'SUICIDE_SCREEN_4', 'NDV_HYPER_002',
  'LEARN_VISUAL_002', 'IIP_DOMINEERING_1', 'VALIDITY_INCONS_1A', 'RESILIENCE_ADAPT_1',
  'TREATMENT_SUPPORT_1', 'JUNG_NI_001'
];

(async () => {
  const questions = await QuestionBank.find({ questionId: { $in: questionIds } });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  NEURLYN INTELLIGENT ASSESSMENT TEST RUN ANALYSIS');
  console.log('  Session: ADAPTIVE_1759938885818_8d1z0n6oq');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('=== QUESTION VALIDATION ===');
  console.log(`Total questions asked: ${questionIds.length}`);
  console.log(`Questions found in DB: ${questions.length}`);
  console.log(`Missing questions: ${questionIds.length - questions.length}`);

  const foundIds = new Set(questions.map(q => q.questionId));
  const missing = questionIds.filter(id => !foundIds.has(id));
  if (missing.length > 0) {
    console.log('\n⚠️  MISSING QUESTION IDs:');
    missing.forEach(id => console.log(`  - ${id}`));
  } else {
    console.log('✓ All questions found in database\n');
  }

  console.log('=== QUESTION DISTRIBUTION ===');
  const byCategory = {};
  const byInstrument = {};
  const bySensitivity = {};
  const byTrait = {};

  questions.forEach(q => {
    byCategory[q.category] = (byCategory[q.category] || 0) + 1;
    byInstrument[q.instrument] = (byInstrument[q.instrument] || 0) + 1;
    bySensitivity[q.sensitivity || 'NONE'] = (bySensitivity[q.sensitivity || 'NONE'] || 0) + 1;
    if (q.trait) byTrait[q.trait] = (byTrait[q.trait] || 0) + 1;
  });

  console.log('\nBy Category:');
  Object.entries(byCategory).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    const pct = ((count / questions.length) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(20)} ${count.toString().padStart(2)} (${pct}%)`);
  });

  console.log('\nBy Instrument:');
  Object.entries(byInstrument).sort((a,b) => b[1] - a[1]).forEach(([inst, count]) => {
    const pct = ((count / questions.length) * 100).toFixed(1);
    console.log(`  ${inst.padEnd(30)} ${count.toString().padStart(2)} (${pct}%)`);
  });

  console.log('\nBy Sensitivity Level:');
  Object.entries(bySensitivity).forEach(([sens, count]) => {
    const pct = ((count / questions.length) * 100).toFixed(1);
    console.log(`  ${sens.padEnd(15)} ${count.toString().padStart(2)} (${pct}%)`);
  });

  console.log('\nBy Trait (Big Five + Clinical):');
  Object.entries(byTrait).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([trait, count]) => {
    console.log(`  ${trait.padEnd(25)} ${count}`);
  });

  // Check for baseline questions
  const baselineQuestions = questions.filter(q => q.adaptive && q.adaptive.isBaseline === true);
  console.log(`\n=== BASELINE QUESTIONS (${baselineQuestions.length}) ===`);
  baselineQuestions.forEach(q => {
    console.log(`  ✓ ${q.questionId.padEnd(30)} trait: ${q.trait}`);
  });

  // Check suicide screening sequence
  const suicideQuestions = questions.filter(q => q.questionId.startsWith('SUICIDE_SCREEN_')).sort((a,b) => a.questionId.localeCompare(b.questionId));
  console.log(`\n=== SUICIDE SCREENING SEQUENCE (${suicideQuestions.length}/7) ===`);
  suicideQuestions.forEach(q => {
    const num = q.questionId.split('_')[2];
    console.log(`  ${num}. ${q.text.substring(0, 70)}...`);
  });

  // Check HIGH sensitivity questions and when they appeared
  const highSensQuestions = questions.filter(q => q.sensitivity === 'HIGH');
  console.log(`\n=== HIGH SENSITIVITY QUESTIONS (${highSensQuestions.length}) ===`);
  highSensQuestions.forEach(q => {
    const position = questionIds.indexOf(q.questionId) + 1;
    console.log(`  Q${position.toString().padStart(2)}: ${q.questionId.padEnd(25)} ${q.text.substring(0, 50)}...`);
  });

  // Check neurodiversity questions
  const neurodivQuestions = questions.filter(q => q.questionId.startsWith('NDV_'));
  console.log(`\n=== NEURODIVERSITY QUESTIONS (${neurodivQuestions.length}) ===`);
  neurodivQuestions.forEach(q => {
    const position = questionIds.indexOf(q.questionId) + 1;
    console.log(`  Q${position.toString().padStart(2)}: ${q.questionId.padEnd(20)} ${q.text.substring(0, 55)}...`);
  });

  // Check personality facet coverage
  const facetQuestions = questions.filter(q => q.facet);
  const uniqueFacets = [...new Set(facetQuestions.map(q => q.facet))];
  console.log(`\n=== NEO FACET COVERAGE (${uniqueFacets.length} unique facets) ===`);
  uniqueFacets.sort().forEach(facet => {
    const count = facetQuestions.filter(q => q.facet === facet).length;
    console.log(`  ${facet.padEnd(25)} ${count} question(s)`);
  });

  mongoose.disconnect();
})();
