const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function validateAllQuestions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');

    console.log('=== COMPREHENSIVE QUESTION VALIDATION ===\n');

    const allQuestions = await QuestionBank.find({});
    const total = allQuestions.length;

    console.log(`Total questions in database: ${total}\n`);

    // Validation categories
    const issues = {
      missingQuestionId: [],
      missingText: [],
      missingCategory: [],
      missingSubcategory: [],
      missingTrait: [],
      missingFacet: [],
      missingInstrument: [],
      missingTags: [],
      emptyOptions: [],
      missingResponseType: [],
      invalidResponseType: [],
      missingActive: [],
      missingTier: [],
      duplicateQuestionIds: new Map(),
      incompleteMetadata: []
    };

    const stats = {
      withOptions: 0,
      withoutOptions: 0,
      byCategory: {},
      bySubcategory: {},
      byTrait: {},
      byInstrument: {},
      byResponseType: {},
      byTier: {},
      withTags: 0,
      withoutTags: 0,
      baseline: 0,
      adaptive: 0
    };

    // Validate each question
    allQuestions.forEach((q, index) => {
      // Required fields
      if (!q.questionId) issues.missingQuestionId.push(index);
      if (!q.text) issues.missingText.push(index);
      if (!q.category) issues.missingCategory.push(index);
      if (!q.trait) issues.missingTrait.push(index);
      if (!q.instrument) issues.missingInstrument.push(index);
      if (!q.responseType) issues.missingResponseType.push(index);

      // Optional but important fields
      if (!q.subcategory) issues.missingSubcategory.push(q.questionId);
      if (!q.facet) issues.missingFacet.push(q.questionId);
      if (!q.tags || q.tags.length === 0) issues.missingTags.push(q.questionId);
      if (q.active === undefined) issues.missingActive.push(q.questionId);
      if (!q.tier) issues.missingTier.push(q.questionId);

      // Options validation for Likert
      if (q.responseType === 'likert') {
        if (!q.options || q.options.length === 0) {
          issues.emptyOptions.push(q.questionId);
          stats.withoutOptions++;
        } else {
          stats.withOptions++;
        }
      }

      // Response type validation
      const validTypes = ['likert', 'multiple-choice', 'multiple_choice', 'word-association'];
      if (q.responseType && !validTypes.includes(q.responseType)) {
        issues.invalidResponseType.push({ id: q.questionId, type: q.responseType });
      }

      // Duplicate questionId check
      if (q.questionId) {
        if (issues.duplicateQuestionIds.has(q.questionId)) {
          issues.duplicateQuestionIds.get(q.questionId).push(index);
        } else {
          issues.duplicateQuestionIds.set(q.questionId, [index]);
        }
      }

      // Stats collection
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      stats.bySubcategory[q.subcategory] = (stats.bySubcategory[q.subcategory] || 0) + 1;
      stats.byTrait[q.trait] = (stats.byTrait[q.trait] || 0) + 1;
      stats.byInstrument[q.instrument] = (stats.byInstrument[q.instrument] || 0) + 1;
      stats.byResponseType[q.responseType] = (stats.byResponseType[q.responseType] || 0) + 1;
      stats.byTier[q.tier] = (stats.byTier[q.tier] || 0) + 1;

      if (q.tags && q.tags.length > 0) stats.withTags++;
      else stats.withoutTags++;

      if (q.adaptive?.isBaseline) stats.baseline++;
      if (q.tags?.includes('adaptive')) stats.adaptive++;

      // Check metadata completeness score
      let metadataScore = 0;
      if (q.questionId) metadataScore++;
      if (q.text) metadataScore++;
      if (q.category) metadataScore++;
      if (q.subcategory) metadataScore++;
      if (q.trait) metadataScore++;
      if (q.facet) metadataScore++;
      if (q.instrument) metadataScore++;
      if (q.tags && q.tags.length > 0) metadataScore++;
      if (q.responseType) metadataScore++;
      if (q.options && q.options.length > 0) metadataScore++;

      if (metadataScore < 8) {
        issues.incompleteMetadata.push({
          id: q.questionId,
          score: metadataScore,
          missing: []
        });
        if (!q.subcategory) issues.incompleteMetadata[issues.incompleteMetadata.length - 1].missing.push('subcategory');
        if (!q.facet) issues.incompleteMetadata[issues.incompleteMetadata.length - 1].missing.push('facet');
        if (!q.tags || q.tags.length === 0) issues.incompleteMetadata[issues.incompleteMetadata.length - 1].missing.push('tags');
        if (!q.options || q.options.length === 0) issues.incompleteMetadata[issues.incompleteMetadata.length - 1].missing.push('options');
      }
    });

    // Filter duplicate questionIds (only show actual duplicates)
    const actualDuplicates = Array.from(issues.duplicateQuestionIds.entries())
      .filter(([id, indexes]) => indexes.length > 1);

    // Print validation results
    console.log('=== CRITICAL ISSUES ===\n');

    if (issues.missingQuestionId.length > 0) {
      console.log(`❌ Missing questionId: ${issues.missingQuestionId.length} questions`);
      console.log(`   Indexes: ${issues.missingQuestionId.slice(0, 5).join(', ')}${issues.missingQuestionId.length > 5 ? '...' : ''}\n`);
    }

    if (issues.missingText.length > 0) {
      console.log(`❌ Missing text: ${issues.missingText.length} questions`);
      console.log(`   Indexes: ${issues.missingText.slice(0, 5).join(', ')}${issues.missingText.length > 5 ? '...' : ''}\n`);
    }

    if (issues.missingCategory.length > 0) {
      console.log(`❌ Missing category: ${issues.missingCategory.length} questions`);
      console.log(`   Indexes: ${issues.missingCategory.slice(0, 5).join(', ')}${issues.missingCategory.length > 5 ? '...' : ''}\n`);
    }

    if (actualDuplicates.length > 0) {
      console.log(`❌ Duplicate questionIds: ${actualDuplicates.length}`);
      actualDuplicates.slice(0, 5).forEach(([id, indexes]) => {
        console.log(`   ${id}: appears at indexes ${indexes.join(', ')}`);
      });
      console.log();
    }

    if (issues.invalidResponseType.length > 0) {
      console.log(`❌ Invalid responseType: ${issues.invalidResponseType.length} questions`);
      issues.invalidResponseType.slice(0, 5).forEach(item => {
        console.log(`   ${item.id}: "${item.type}"`);
      });
      console.log();
    }

    console.log('=== WARNINGS ===\n');

    if (issues.emptyOptions.length > 0) {
      console.log(`⚠️  Likert questions with empty options: ${issues.emptyOptions.length}`);
      console.log(`   Examples: ${issues.emptyOptions.slice(0, 5).join(', ')}`);
      console.log(`   (Fallback options will be generated)\n`);
    }

    if (issues.missingSubcategory.length > 0) {
      console.log(`⚠️  Missing subcategory: ${issues.missingSubcategory.length} questions`);
      console.log(`   Examples: ${issues.missingSubcategory.slice(0, 5).join(', ')}\n`);
    }

    if (issues.missingFacet.length > 0) {
      console.log(`⚠️  Missing facet: ${issues.missingFacet.length} questions`);
      console.log(`   Examples: ${issues.missingFacet.slice(0, 5).join(', ')}\n`);
    }

    if (issues.missingTags.length > 0) {
      console.log(`⚠️  Missing tags: ${issues.missingTags.length} questions`);
      console.log(`   Examples: ${issues.missingTags.slice(0, 5).join(', ')}\n`);
    }

    if (issues.incompleteMetadata.length > 0) {
      console.log(`⚠️  Incomplete metadata (score < 8/10): ${issues.incompleteMetadata.length} questions`);
      console.log(`   Top 5 examples:`);
      issues.incompleteMetadata.slice(0, 5).forEach(item => {
        console.log(`   ${item.id}: score ${item.score}/10, missing: ${item.missing.join(', ')}`);
      });
      console.log();
    }

    console.log('=== STATISTICS ===\n');

    console.log(`Options Status:`);
    console.log(`  With options: ${stats.withOptions}`);
    console.log(`  Without options: ${stats.withoutOptions}\n`);

    console.log(`Tags:`);
    console.log(`  With tags: ${stats.withTags}`);
    console.log(`  Without tags: ${stats.withoutTags}\n`);

    console.log(`Question Types:`);
    console.log(`  Baseline: ${stats.baseline}`);
    console.log(`  Adaptive: ${stats.adaptive}\n`);

    console.log(`By Category:`);
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });

    console.log(`\nBy Response Type:`);
    Object.entries(stats.byResponseType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

    console.log(`\nBy Tier:`);
    Object.entries(stats.byTier)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tier, count]) => {
        console.log(`  ${tier || 'undefined'}: ${count}`);
      });

    console.log(`\nTop 10 Instruments:`);
    Object.entries(stats.byInstrument)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([inst, count]) => {
        console.log(`  ${inst || 'undefined'}: ${count}`);
      });

    console.log(`\nTop 15 Traits:`);
    Object.entries(stats.byTrait)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([trait, count]) => {
        console.log(`  ${trait || 'undefined'}: ${count}`);
      });

    console.log(`\nTop 15 Subcategories:`);
    Object.entries(stats.bySubcategory)
      .sort((a, b) => b[1] - a[1])
      .filter(([cat]) => cat && cat !== 'undefined')
      .slice(0, 15)
      .forEach(([subcat, count]) => {
        console.log(`  ${subcat}: ${count}`);
      });

    console.log('\n=== VALIDATION SUMMARY ===\n');

    const criticalIssues =
      issues.missingQuestionId.length +
      issues.missingText.length +
      issues.missingCategory.length +
      actualDuplicates.length +
      issues.invalidResponseType.length;

    const warnings =
      issues.emptyOptions.length +
      issues.missingSubcategory.length +
      issues.missingFacet.length +
      issues.missingTags.length;

    if (criticalIssues === 0) {
      console.log('✅ No critical issues found!');
    } else {
      console.log(`❌ Found ${criticalIssues} critical issues that need fixing`);
    }

    if (warnings === 0) {
      console.log('✅ No warnings!');
    } else {
      console.log(`⚠️  Found ${warnings} warnings (non-blocking)`);
    }

    console.log(`\nMetadata completeness: ${Math.round((total - issues.incompleteMetadata.length) / total * 100)}%`);
    console.log(`Questions ready for adaptive selection: ${total - criticalIssues}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
}

validateAllQuestions();
