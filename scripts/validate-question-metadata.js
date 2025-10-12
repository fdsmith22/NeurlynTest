/**
 * Comprehensive Question Metadata Validation
 * Validates all question fields: tags, facets, categories, instruments, etc.
 */

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

const QuestionBank = require('../models/QuestionBank');

// Valid values for each field
const VALID_VALUES = {
  categories: [
    'personality',
    'neurodiversity',
    'clinical_psychopathology',
    'attachment',
    'trauma_screening',
    'cognitive_functions',
    'cognitive',  // Cognitive functions
    'learning_style',
    'enneagram',
    'validity_scales'  // Validity checks
  ],

  // Personality subcategories
  personalitySubcategories: [
    'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
    'hexaco_honesty_humility', 'honesty_humility',  // HEXACO 6th dimension
    'resilience_coping', 'interpersonal_circumplex'
  ],

  // Personality facets (NEO-PI-R)
  facets: {
    openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
    conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
    extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
    agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
    neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability']
  },

  // Clinical instruments
  clinicalInstruments: [
    'GAD-7', 'PHQ-9', 'PHQ-15', 'MDQ', 'PQ-B', 'AUDIT', 'DAST',
    'MSI-BPD', 'CD-RISC', 'ECR-R', 'IIP-32', 'MSPSS',
    'NEURLYN', 'NEO-PI-R', 'BFI-2', 'HEXACO-60'
  ],

  // Tags
  requiredTagsByCategory: {
    neurodiversity: ['adhd', 'autism', 'executive_function', 'sensory', 'masking'],
    clinical_psychopathology: ['depression', 'anxiety', 'mania', 'psychosis', 'substance', 'ocd', 'ptsd', 'borderline', 'somatic'],
    attachment: ['attachment', 'anxious_attachment', 'avoidant_attachment'],
    trauma_screening: ['trauma', 'aces', 'complex_ptsd']
  }
};

async function validateMetadata() {
  const issues = {
    missingFields: [],
    invalidCategories: [],
    invalidSubcategories: [],
    invalidFacets: [],
    invalidInstruments: [],
    missingTags: [],
    emptyOptions: [],
    missingReverse: []
  };

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const questions = await QuestionBank.find({ active: true });
    console.log(`📊 Validating metadata for ${questions.length} questions...\n`);

    for (const q of questions) {
      // Check required fields
      if (!q.questionId) issues.missingFields.push({ id: q._id, field: 'questionId' });
      if (!q.text) issues.missingFields.push({ id: q.questionId || q._id, field: 'text' });
      if (!q.category) issues.missingFields.push({ id: q.questionId, field: 'category' });

      // Validate category
      if (q.category && !VALID_VALUES.categories.includes(q.category)) {
        issues.invalidCategories.push({ id: q.questionId, category: q.category });
      }

      // Validate personality subcategories and facets
      if (q.category === 'personality') {
        if (q.trait && !VALID_VALUES.personalitySubcategories.includes(q.trait) && !Object.keys(VALID_VALUES.facets).includes(q.trait)) {
          issues.invalidSubcategories.push({ id: q.questionId, trait: q.trait });
        }

        if (q.facet && q.trait) {
          const validFacets = VALID_VALUES.facets[q.trait];
          if (validFacets && !validFacets.includes(q.facet)) {
            issues.invalidFacets.push({ id: q.questionId, trait: q.trait, facet: q.facet });
          }
        }
      }

      // Validate instrument
      if (q.instrument) {
        const validInstrument = VALID_VALUES.clinicalInstruments.some(inst =>
          q.instrument.includes(inst) || inst.includes(q.instrument)
        );
        if (!validInstrument && q.instrument !== 'NEURLYN_ATTACHMENT' && !q.instrument.startsWith('NEURLYN')) {
          issues.invalidInstruments.push({ id: q.questionId, instrument: q.instrument });
        }
      }

      // Check for empty options
      if (!q.options || q.options.length === 0) {
        issues.emptyOptions.push({ id: q.questionId, category: q.category });
      }

      // Check for missing reverse scoring on personality questions
      if (q.category === 'personality' && q.reverseScored === undefined) {
        issues.missingReverse.push({ id: q.questionId, trait: q.trait, facet: q.facet });
      }

      // Check for missing tags on clinical questions
      if (q.category === 'clinical_psychopathology' && (!q.tags || q.tags.length === 0)) {
        issues.missingTags.push({ id: q.questionId, subcategory: q.subcategory });
      }
    }

    // Generate report
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`METADATA VALIDATION COMPLETE`);
    console.log('═══════════════════════════════════════════════════════════\n');

    let totalIssues = 0;

    if (issues.missingFields.length > 0) {
      console.log(`\n🔴 MISSING REQUIRED FIELDS (${issues.missingFields.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      issues.missingFields.slice(0, 10).forEach(i => {
        console.log(`  ${i.id}: Missing ${i.field}`);
      });
      if (issues.missingFields.length > 10) console.log(`  ... and ${issues.missingFields.length - 10} more`);
      totalIssues += issues.missingFields.length;
    }

    if (issues.invalidCategories.length > 0) {
      console.log(`\n🔴 INVALID CATEGORIES (${issues.invalidCategories.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      issues.invalidCategories.slice(0, 10).forEach(i => {
        console.log(`  ${i.id}: Invalid category "${i.category}"`);
      });
      totalIssues += issues.invalidCategories.length;
    }

    if (issues.invalidSubcategories.length > 0) {
      console.log(`\n🔴 INVALID SUBCATEGORIES/TRAITS (${issues.invalidSubcategories.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      issues.invalidSubcategories.slice(0, 10).forEach(i => {
        console.log(`  ${i.id}: Invalid trait "${i.trait}"`);
      });
      totalIssues += issues.invalidSubcategories.length;
    }

    if (issues.invalidFacets.length > 0) {
      console.log(`\n🔴 INVALID FACETS (${issues.invalidFacets.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      issues.invalidFacets.slice(0, 10).forEach(i => {
        console.log(`  ${i.id}: Invalid facet "${i.facet}" for trait "${i.trait}"`);
      });
      totalIssues += issues.invalidFacets.length;
    }

    if (issues.emptyOptions.length > 0) {
      console.log(`\n🔴 EMPTY OPTIONS ARRAY (${issues.emptyOptions.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      console.log('  All questions should have answer options');
      issues.emptyOptions.slice(0, 5).forEach(i => {
        console.log(`  ${i.id} (${i.category})`);
      });
      if (issues.emptyOptions.length > 5) console.log(`  ... and ${issues.emptyOptions.length - 5} more`);
      totalIssues += issues.emptyOptions.length;
    }

    if (issues.missingReverse.length > 0) {
      console.log(`\n⚠️  MISSING REVERSE SCORING INDICATOR (${issues.missingReverse.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      console.log('  Personality questions should have reverseScored field (true/false)');
      console.log(`  Sample: ${issues.missingReverse.slice(0, 5).map(i => i.id).join(', ')}`);
      // This is a warning, not a critical error
    }

    if (issues.missingTags.length > 0) {
      console.log(`\n⚠️  MISSING TAGS (${issues.missingTags.length}):`);
      console.log('─────────────────────────────────────────────────────────────');
      console.log('  Clinical questions should have relevant tags');
      issues.missingTags.slice(0, 10).forEach(i => {
        console.log(`  ${i.id} (${i.subcategory})`);
      });
      // This is a warning, not a critical error
    }

    console.log('\n\n📊 SUMMARY:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`Total questions: ${questions.length}`);
    console.log(`Critical issues: ${totalIssues}`);
    console.log(`Warnings: ${issues.missingReverse.length + issues.missingTags.length}`);

    if (totalIssues === 0) {
      console.log('\n✅ All questions have valid metadata!\n');
    } else {
      console.log(`\n❌ ${totalIssues} critical metadata issues found\n`);
    }

    await mongoose.disconnect();
    process.exit(totalIssues > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('\n🔍 NEURLYN QUESTION METADATA VALIDATION');
console.log('═══════════════════════════════════════════════════════════\n');

validateMetadata();
