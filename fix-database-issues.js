const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

// Default Likert options
const defaultLikertOptions = [
  { value: 1, label: 'Strongly Disagree', score: 1 },
  { value: 2, label: 'Disagree', score: 2 },
  { value: 3, label: 'Neutral', score: 3 },
  { value: 4, label: 'Agree', score: 4 },
  { value: 5, label: 'Strongly Agree', score: 5 }
];

// Mapping of traits to facets (based on NEO-PI-R and Big Five)
const traitToFacet = {
  // Openness facets
  'openness': 'openness_facets',
  'fantasy': 'fantasy',
  'aesthetics': 'aesthetics',
  'feelings': 'feelings',
  'actions': 'actions',
  'ideas': 'ideas',
  'values': 'values',

  // Conscientiousness facets
  'conscientiousness': 'conscientiousness_facets',
  'competence': 'competence',
  'order': 'order',
  'dutifulness': 'dutifulness',
  'achievement_striving': 'achievement_striving',
  'self_discipline': 'self_discipline',
  'deliberation': 'deliberation',

  // Extraversion facets
  'extraversion': 'extraversion_facets',
  'warmth': 'warmth',
  'gregariousness': 'gregariousness',
  'assertiveness': 'assertiveness',
  'activity': 'activity',
  'excitement_seeking': 'excitement_seeking',
  'positive_emotions': 'positive_emotions',

  // Agreeableness facets
  'agreeableness': 'agreeableness_facets',
  'trust': 'trust',
  'straightforwardness': 'straightforwardness',
  'altruism': 'altruism',
  'compliance': 'compliance',
  'modesty': 'modesty',
  'tender_mindedness': 'tender_mindedness',

  // Neuroticism facets
  'neuroticism': 'neuroticism_facets',
  'anxiety': 'anxiety',
  'angry_hostility': 'angry_hostility',
  'depression': 'depression',
  'self_consciousness': 'self_consciousness',
  'impulsiveness': 'impulsiveness',
  'vulnerability': 'vulnerability',

  // Neurodiversity
  'adhd': 'attention',
  'autism': 'social_communication',
  'executive_function': 'executive_function',
  'sensory': 'sensory_sensitivity',
  'visual': 'visual_processing',
  'auditory': 'sensory_processing',
  'tactile': 'sensory_sensitivity',
  'olfactory': 'sensory_sensitivity',
  'oral': 'sensory_sensitivity',

  // Attachment
  'anxious': 'attachment_anxiety',
  'avoidant': 'attachment_avoidance',
  'secure': 'attachment_style',

  // Cognitive
  'processing': 'cognitive_style',
  'communication': 'social_communication'
};

// Mapping of categories to default subcategories
const categoryToSubcategory = {
  'personality': 'personality_facets',
  'neurodiversity': 'neurodiversity_screening',
  'cognitive': 'cognitive_style',
  'attachment': 'attachment_style',
  'enneagram': 'enneagram',
  'cognitive_functions': 'cognitive_functions',
  'trauma_screening': 'trauma_screening',
  'learning_style': 'learning_style'
};

async function fixDatabaseIssues() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('=== FIXING DATABASE ISSUES ===\n');

    let fixCount = 0;

    // Fix 0: Clean invalid correlatedTraits enum values
    console.log('0. Cleaning invalid correlatedTraits values...');
    const validCorrelatedTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const questionsWithCorrelatedTraits = await QuestionBank.find({
      'adaptive.correlatedTraits': { $exists: true, $ne: [] }
    });

    let cleanedCount = 0;
    for (const question of questionsWithCorrelatedTraits) {
      if (question.adaptive && question.adaptive.correlatedTraits) {
        const before = question.adaptive.correlatedTraits.length;
        question.adaptive.correlatedTraits = question.adaptive.correlatedTraits.filter(
          trait => validCorrelatedTraits.includes(trait)
        );
        const after = question.adaptive.correlatedTraits.length;

        if (before !== after) {
          await question.save();
          cleanedCount++;
          console.log(`   Cleaned ${question.questionId}: ${before} -> ${after} correlatedTraits`);
        }
      }
    }
    console.log(`   ✅ Cleaned ${cleanedCount} questions with invalid correlatedTraits\n`);

    // Fix 1: Add missing options to Likert questions
    console.log('1. Fixing missing Likert options...');
    const missingOptions = await QuestionBank.find({
      responseType: 'likert',
      $or: [
        { options: { $exists: false } },
        { options: { $size: 0 } }
      ]
    });

    for (const question of missingOptions) {
      question.options = defaultLikertOptions;
      await question.save();
      fixCount++;
    }
    console.log(`   ✅ Fixed ${missingOptions.length} questions with missing options\n`);

    // Fix 2: Add missing subcategories
    console.log('2. Fixing missing subcategories...');
    const missingSubcategory = await QuestionBank.find({
      $or: [
        { subcategory: { $exists: false } },
        { subcategory: null },
        { subcategory: '' }
      ]
    });

    for (const question of missingSubcategory) {
      // Try to infer from category or instrument
      if (question.instrument && question.instrument.includes('FACET')) {
        // It's a facet question
        if (question.trait && traitToFacet[question.trait]) {
          question.subcategory = traitToFacet[question.trait];
        } else if (question.category) {
          question.subcategory = categoryToSubcategory[question.category] || question.category;
        }
      } else if (question.category) {
        question.subcategory = categoryToSubcategory[question.category] || question.category;
      }

      await question.save();
      fixCount++;
    }
    console.log(`   ✅ Fixed ${missingSubcategory.length} questions with missing subcategories\n`);

    // Fix 3: Add missing facets
    console.log('3. Fixing missing facets...');
    const missingFacet = await QuestionBank.find({
      $or: [
        { facet: { $exists: false } },
        { facet: null },
        { facet: '' }
      ]
    });

    for (const question of missingFacet) {
      // Infer facet from trait
      if (question.trait && traitToFacet[question.trait]) {
        question.facet = traitToFacet[question.trait];
      } else if (question.subcategory) {
        // Use subcategory as facet if no better option
        question.facet = question.subcategory;
      } else if (question.trait) {
        // Use trait as facet
        question.facet = question.trait;
      }

      if (question.facet) {
        await question.save();
        fixCount++;
      }
    }
    console.log(`   ✅ Fixed ${fixCount} questions with missing facets\n`);

    // Fix 4: Ensure all gateway questions have proper metadata
    console.log('4. Fixing gateway questions...');
    const gatewayQuestions = await QuestionBank.find({
      questionId: /^gateway_/
    });

    for (const question of gatewayQuestions) {
      // Add missing options
      if (!question.options || question.options.length === 0) {
        question.options = defaultLikertOptions;
      }

      // Add subcategory based on question ID
      if (!question.subcategory) {
        if (question.questionId.includes('sensory')) {
          question.subcategory = 'sensory_processing';
          question.facet = 'sensory_sensitivity';
        } else if (question.questionId.includes('executive')) {
          question.subcategory = 'executive_function';
          question.facet = 'executive_function';
        } else if (question.questionId.includes('social')) {
          question.subcategory = 'social_communication';
          question.facet = 'social_cues';
        } else if (question.questionId.includes('routine')) {
          question.subcategory = 'routine_preference';
          question.facet = 'routine_preference';
        } else if (question.questionId.includes('attention')) {
          question.subcategory = 'attention';
          question.facet = 'attention';
        }
      }

      await question.save();
    }
    console.log(`   ✅ Fixed ${gatewayQuestions.length} gateway questions\n`);

    // Verify fixes
    console.log('=== VERIFICATION ===\n');

    const stillMissingOptions = await QuestionBank.countDocuments({
      responseType: 'likert',
      $or: [
        { options: { $exists: false } },
        { options: { $size: 0 } }
      ]
    });

    const stillMissingSubcategory = await QuestionBank.countDocuments({
      $or: [
        { subcategory: { $exists: false } },
        { subcategory: null },
        { subcategory: '' }
      ]
    });

    const stillMissingFacet = await QuestionBank.countDocuments({
      $or: [
        { facet: { $exists: false } },
        { facet: null },
        { facet: '' }
      ]
    });

    console.log(`Remaining issues:`);
    console.log(`  Missing options: ${stillMissingOptions}`);
    console.log(`  Missing subcategory: ${stillMissingSubcategory}`);
    console.log(`  Missing facet: ${stillMissingFacet}\n`);

    if (stillMissingOptions === 0 && stillMissingSubcategory === 0 && stillMissingFacet === 0) {
      console.log('✅ All issues fixed successfully!\n');
    } else {
      console.log('⚠️  Some issues remain - may need manual review\n');
    }

    console.log(`Total fixes applied: ${fixCount}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Fix error:', error);
    process.exit(1);
  }
}

fixDatabaseIssues();
