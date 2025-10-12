#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');

const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

async function comprehensiveCoverageAnalysis() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const allQuestions = await QuestionBank.find({ active: true });

    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('COMPREHENSIVE QUESTION BANK COVERAGE ANALYSIS');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');

    // 1. Overall Statistics
    console.log('📊 OVERALL STATISTICS');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    console.log(`Total Active Questions: ${allQuestions.length}`);
    console.log(`Baseline Questions: ${allQuestions.filter(q => q.isBaseline).length}`);
    console.log(`Adaptive Questions: ${allQuestions.filter(q => !q.isBaseline).length}\n`);

    // 2. Category Distribution
    console.log('📂 CATEGORY DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const categoryDist = {};
    allQuestions.forEach(q => {
      categoryDist[q.category] = (categoryDist[q.category] || 0) + 1;
    });
    Object.entries(categoryDist).sort(([,a], [,b]) => b - a).forEach(([cat, count]) => {
      console.log(`${cat.padEnd(30)} ${count} questions`);
    });
    console.log();

    // 3. Subcategory Distribution
    console.log('🔍 SUBCATEGORY DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const subcategoryDist = {};
    allQuestions.forEach(q => {
      if (q.subcategory) {
        subcategoryDist[q.subcategory] = (subcategoryDist[q.subcategory] || 0) + 1;
      }
    });
    Object.entries(subcategoryDist).sort(([,a], [,b]) => b - a).forEach(([subcat, count]) => {
      console.log(`${subcat.padEnd(35)} ${count} questions`);
    });
    console.log();

    // 4. NEO Facet Coverage (30 facets)
    console.log('🎯 NEO FACET COVERAGE (30 Facets Across Big Five)');
    console.log('─────────────────────────────────────────────────────────────────────────────────');

    const NEO_FACETS = {
      openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
      conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
      extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
      agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
      neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability']
    };

    const facetDist = {};
    const facetCoverage = { covered: 0, missing: 0, missingFacets: [] };

    Object.entries(NEO_FACETS).forEach(([trait, facets]) => {
      console.log(`\n${trait.toUpperCase()}:`);
      facets.forEach(facet => {
        const count = allQuestions.filter(q => q.trait === trait && q.facet === facet).length;
        facetDist[`${trait}.${facet}`] = count;
        console.log(`  ${facet.padEnd(25)} ${count} questions ${count === 0 ? '❌ MISSING' : count < 3 ? '⚠️  LOW' : '✅'}`);

        if (count === 0) {
          facetCoverage.missing++;
          facetCoverage.missingFacets.push(`${trait}.${facet}`);
        } else {
          facetCoverage.covered++;
        }
      });
    });

    console.log('\n─────────────────────────────────────────────────────────────────────────────────');
    console.log(`Facet Coverage: ${facetCoverage.covered}/30 facets (${Math.round(facetCoverage.covered/30*100)}%)`);
    if (facetCoverage.missing > 0) {
      console.log(`Missing Facets: ${facetCoverage.missingFacets.join(', ')}`);
    }
    console.log();

    // 5. Neurodiversity Domain Coverage
    console.log('🧠 NEURODIVERSITY DOMAIN COVERAGE');
    console.log('─────────────────────────────────────────────────────────────────────────────────');

    const ndTags = {};
    allQuestions.forEach(q => {
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          ndTags[tag] = (ndTags[tag] || 0) + 1;
        });
      }
    });
    Object.entries(ndTags).sort(([,a], [,b]) => b - a).forEach(([tag, count]) => {
      console.log(`${tag.padEnd(30)} ${count} questions`);
    });
    console.log();

    // 6. Executive Function Domain Coverage
    console.log('⚡ EXECUTIVE FUNCTION DOMAIN COVERAGE');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const efDomains = {};
    allQuestions.forEach(q => {
      if (q.adaptive?.efDomain) {
        efDomains[q.adaptive.efDomain] = (efDomains[q.adaptive.efDomain] || 0) + 1;
      }
    });
    if (Object.keys(efDomains).length > 0) {
      Object.entries(efDomains).sort(([,a], [,b]) => b - a).forEach(([domain, count]) => {
        console.log(`${domain.padEnd(30)} ${count} questions`);
      });
    } else {
      console.log('⚠️  No EF domain metadata found');
    }
    console.log();

    // 7. Sensory Processing Domain Coverage
    console.log('👂 SENSORY PROCESSING DOMAIN COVERAGE');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const sensoryDomains = {};
    allQuestions.forEach(q => {
      if (q.adaptive?.sensoryDomain) {
        sensoryDomains[q.adaptive.sensoryDomain] = (sensoryDomains[q.adaptive.sensoryDomain] || 0) + 1;
      }
    });
    if (Object.keys(sensoryDomains).length > 0) {
      Object.entries(sensoryDomains).sort(([,a], [,b]) => b - a).forEach(([domain, count]) => {
        console.log(`${domain.padEnd(30)} ${count} questions`);
      });
    } else {
      console.log('⚠️  No sensory domain metadata found');
    }
    console.log();

    // 8. Diagnostic Weight Distribution
    console.log('💎 DIAGNOSTIC WEIGHT DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const diagnosticWeights = { high: 0, medium: 0, low: 0, none: 0 };
    allQuestions.forEach(q => {
      if (!q.diagnosticWeight) diagnosticWeights.none++;
      else if (q.diagnosticWeight >= 0.7) diagnosticWeights.high++;
      else if (q.diagnosticWeight >= 0.4) diagnosticWeights.medium++;
      else diagnosticWeights.low++;
    });
    console.log(`High (≥0.7):     ${diagnosticWeights.high} questions`);
    console.log(`Medium (0.4-0.7): ${diagnosticWeights.medium} questions`);
    console.log(`Low (<0.4):      ${diagnosticWeights.low} questions`);
    console.log(`No Weight:       ${diagnosticWeights.none} questions ❌`);
    console.log();

    // 9. Pathway Mapping Analysis
    console.log('🛤️  PATHWAY COVERAGE SIMULATION');
    console.log('─────────────────────────────────────────────────────────────────────────────────');

    const pathways = {
      executive_function: { tags: { $in: ['executive_function'] } },
      sensory_processing: { $or: [{ tags: { $in: ['sensory_processing'] } }, { subcategory: 'sensory_processing' }] },
      adhd_deep: { tags: { $in: ['adhd'] }, subcategory: { $nin: ['executive_function'] } },
      autism_deep: { tags: { $in: ['autism'] }, subcategory: { $nin: ['sensory_processing', 'sensory_sensitivity', 'masking'] } },
      masking: { subcategory: 'masking' },
      attachment: { subcategory: 'attachment' },
      trauma_screening: { subcategory: 'trauma_screening' }
    };

    for (const [pathwayName, query] of Object.entries(pathways)) {
      const count = await QuestionBank.countDocuments({ active: true, ...query });
      console.log(`${pathwayName.padEnd(25)} ${count} questions available ${count === 0 ? '❌' : count < 5 ? '⚠️' : '✅'}`);
    }
    console.log();

    // 10. Metadata Completeness
    console.log('📋 METADATA COMPLETENESS');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const metadata = {
      hasCategory: allQuestions.filter(q => q.category).length,
      hasSubcategory: allQuestions.filter(q => q.subcategory).length,
      hasTags: allQuestions.filter(q => q.tags && q.tags.length > 0).length,
      hasDiagnosticWeight: allQuestions.filter(q => q.diagnosticWeight).length,
      hasCorrelatedTraits: allQuestions.filter(q => q.adaptive?.correlatedTraits && q.adaptive.correlatedTraits.length > 0).length,
      hasFacet: allQuestions.filter(q => q.facet).length,
      hasEFDomain: allQuestions.filter(q => q.adaptive?.efDomain).length,
      hasSensoryDomain: allQuestions.filter(q => q.adaptive?.sensoryDomain).length
    };

    const total = allQuestions.length;
    console.log(`Category:           ${metadata.hasCategory}/${total} (${Math.round(metadata.hasCategory/total*100)}%)`);
    console.log(`Subcategory:        ${metadata.hasSubcategory}/${total} (${Math.round(metadata.hasSubcategory/total*100)}%)`);
    console.log(`Tags:               ${metadata.hasTags}/${total} (${Math.round(metadata.hasTags/total*100)}%)`);
    console.log(`Diagnostic Weight:  ${metadata.hasDiagnosticWeight}/${total} (${Math.round(metadata.hasDiagnosticWeight/total*100)}%)`);
    console.log(`Correlated Traits:  ${metadata.hasCorrelatedTraits}/${total} (${Math.round(metadata.hasCorrelatedTraits/total*100)}%)`);
    console.log(`Facet:              ${metadata.hasFacet}/${total} (${Math.round(metadata.hasFacet/total*100)}%)`);
    console.log(`EF Domain:          ${metadata.hasEFDomain}/${total} (${Math.round(metadata.hasEFDomain/total*100)}%)`);
    console.log(`Sensory Domain:     ${metadata.hasSensoryDomain}/${total} (${Math.round(metadata.hasSensoryDomain/total*100)}%)`);
    console.log();

    // 11. Instrument Distribution
    console.log('🎼 INSTRUMENT/SOURCE DISTRIBUTION');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const instruments = {};
    allQuestions.forEach(q => {
      if (q.instrument) {
        instruments[q.instrument] = (instruments[q.instrument] || 0) + 1;
      } else {
        instruments['No Instrument'] = (instruments['No Instrument'] || 0) + 1;
      }
    });
    Object.entries(instruments).sort(([,a], [,b]) => b - a).forEach(([inst, count]) => {
      console.log(`${inst.padEnd(30)} ${count} questions`);
    });
    console.log();

    // 12. Missing/Weak Areas Summary
    console.log('⚠️  IDENTIFIED GAPS & WEAK AREAS');
    console.log('─────────────────────────────────────────────────────────────────────────────────');
    const gaps = [];

    if (facetCoverage.missing > 0) {
      gaps.push(`❌ ${facetCoverage.missing} missing NEO facets (${facetCoverage.missingFacets.slice(0, 3).join(', ')}...)`);
    }

    const lowFacets = Object.entries(facetDist).filter(([, count]) => count > 0 && count < 3);
    if (lowFacets.length > 0) {
      gaps.push(`⚠️  ${lowFacets.length} facets with <3 questions (insufficient depth)`);
    }

    if (diagnosticWeights.none > 0) {
      gaps.push(`❌ ${diagnosticWeights.none} questions missing diagnostic weight`);
    }

    const lowPathways = Object.entries(pathways).filter(([name]) => {
      // This is approximate - would need to run actual query
      return false; // We'll check in the pathway section above
    });

    if (gaps.length === 0) {
      console.log('✅ No critical gaps identified - excellent coverage!');
    } else {
      gaps.forEach(gap => console.log(gap));
    }
    console.log();

    console.log('════════════════════════════════════════════════════════════════════════════════');
    console.log('END OF COVERAGE ANALYSIS');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

comprehensiveCoverageAnalysis();
