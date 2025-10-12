/**
 * Comprehensive Question Bank Audit
 * Deep dive into all questions, tags, categories, instruments
 */

const mongoose = require('mongoose');
const QuestionBank = require('./models/QuestionBank');

async function comprehensiveAudit() {
  try {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
    console.log('Connected to neurlyn-test database\n');

    // Get ALL questions
    const allQuestions = await QuestionBank.find({}).lean();
    console.log(`=== TOTAL QUESTIONS: ${allQuestions.length} ===\n`);

    // 1. CATEGORY BREAKDOWN
    console.log('=== CATEGORY BREAKDOWN WITH SAMPLE QUESTIONS ===');
    const byCategory = {};
    allQuestions.forEach(q => {
      const cat = q.category || 'UNCATEGORIZED';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(q);
    });

    for (const [category, questions] of Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n${category}: ${questions.length} questions`);

      // Show subcategories
      const subCats = {};
      questions.forEach(q => {
        const sub = q.subcategory || q.trait || 'no-subcategory';
        if (!subCats[sub]) subCats[sub] = 0;
        subCats[sub]++;
      });

      console.log('  Subcategories:');
      Object.entries(subCats).sort((a, b) => b[1] - a[1]).forEach(([sub, count]) => {
        console.log(`    ${sub}: ${count}`);
      });

      // Sample question IDs
      console.log('  Sample questionIds:', questions.slice(0, 3).map(q => q.questionId).join(', '));
    }

    // 2. CLINICAL QUESTIONS DEEP DIVE
    console.log('\n\n=== CLINICAL QUESTIONS DEEP DIVE ===');
    const clinicalQuestions = allQuestions.filter(q =>
      q.category === 'clinical_psychopathology' ||
      q.questionId?.includes('DEPRESSION') ||
      q.questionId?.includes('ANXIETY') ||
      q.questionId?.includes('MANIA') ||
      q.questionId?.includes('PSYCHOSIS') ||
      q.questionId?.includes('PTSD') ||
      q.questionId?.includes('OCD') ||
      q.questionId?.includes('PANIC') ||
      q.questionId?.includes('SOCIAL_ANXIETY')
    );

    console.log(`Total clinical questions found: ${clinicalQuestions.length}\n`);

    // Group by instrument
    const byInstrument = {};
    clinicalQuestions.forEach(q => {
      const inst = q.instrument || 'NO_INSTRUMENT';
      if (!byInstrument[inst]) byInstrument[inst] = [];
      byInstrument[inst].push(q);
    });

    console.log('Clinical questions by INSTRUMENT:');
    for (const [instrument, questions] of Object.entries(byInstrument).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n  ${instrument}: ${questions.length} questions`);
      questions.slice(0, 5).forEach(q => {
        console.log(`    - ${q.questionId} (category: ${q.category}, subcategory: ${q.subcategory || 'none'})`);
      });
      if (questions.length > 5) console.log(`    ... and ${questions.length - 5} more`);
    }

    // 3. SEARCH FOR SPECIFIC CLINICAL INSTRUMENTS
    console.log('\n\n=== SEARCHING FOR SPECIFIC CLINICAL INSTRUMENTS ===');

    const clinicalInstruments = [
      'PHQ-9', 'PHQ-2', 'GAD-7', 'GAD-2', 'MDQ', 'PQ-B', 'MSI-BPD',
      'PTSD', 'PCL-5', 'ITQ', 'OCD', 'YBOCS', 'PANIC', 'PDSS',
      'AUDIT', 'DAST', 'ACEs', 'CD-RISC', 'PHQ-15'
    ];

    for (const inst of clinicalInstruments) {
      const found = allQuestions.filter(q =>
        q.instrument === inst ||
        q.instrument?.includes(inst) ||
        q.questionId?.includes(inst.replace(/-/g, ''))
      );

      if (found.length > 0) {
        console.log(`\n✓ ${inst}: ${found.length} questions`);
        console.log(`  Sample IDs: ${found.slice(0, 3).map(q => q.questionId).join(', ')}`);
        console.log(`  Instruments: ${[...new Set(found.map(q => q.instrument))].join(', ')}`);
      } else {
        console.log(`\n✗ ${inst}: NOT FOUND`);
      }
    }

    // 4. TAG ANALYSIS
    console.log('\n\n=== TAG ANALYSIS ===');
    const allTags = {};
    allQuestions.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => {
          if (!allTags[tag]) allTags[tag] = 0;
          allTags[tag]++;
        });
      } else if (q.tags && typeof q.tags === 'string') {
        if (!allTags[q.tags]) allTags[q.tags] = 0;
        allTags[q.tags]++;
      }
    });

    console.log('Top 30 tags:');
    Object.entries(allTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}`);
      });

    // 5. CLINICAL TAGS SPECIFICALLY
    console.log('\n\n=== CLINICAL-RELATED TAGS ===');
    const clinicalTags = Object.entries(allTags)
      .filter(([tag]) =>
        tag.includes('depression') ||
        tag.includes('anxiety') ||
        tag.includes('mania') ||
        tag.includes('psychosis') ||
        tag.includes('ptsd') ||
        tag.includes('ocd') ||
        tag.includes('panic') ||
        tag.includes('phq') ||
        tag.includes('gad') ||
        tag.includes('clinical')
      )
      .sort((a, b) => b[1] - a[1]);

    clinicalTags.forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count}`);
    });

    // 6. QUESTIONS WITH NO INSTRUMENT
    console.log('\n\n=== QUESTIONS WITH NO INSTRUMENT ===');
    const noInstrument = allQuestions.filter(q => !q.instrument || q.instrument === '');
    console.log(`Total questions without instrument: ${noInstrument.length}`);

    if (noInstrument.length > 0) {
      console.log('Sample questionIds without instrument:');
      noInstrument.slice(0, 10).forEach(q => {
        console.log(`  ${q.questionId} (category: ${q.category}, subcategory: ${q.subcategory || 'none'})`);
      });
    }

    // 7. DEPRESSION QUESTIONS SPECIFICALLY
    console.log('\n\n=== DEPRESSION QUESTIONS DETAILED ===');
    const depressionQuestions = allQuestions.filter(q =>
      q.questionId?.includes('DEPRESSION') ||
      q.questionId?.includes('PHQ9') ||
      q.subcategory === 'depression' ||
      q.tags?.includes('depression')
    );

    console.log(`Total depression-related questions: ${depressionQuestions.length}`);
    depressionQuestions.forEach(q => {
      console.log(`  ${q.questionId}`);
      console.log(`    instrument: ${q.instrument || 'NONE'}`);
      console.log(`    category: ${q.category}`);
      console.log(`    subcategory: ${q.subcategory || 'NONE'}`);
      console.log(`    tags: ${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || 'NONE')}`);
    });

    // 8. ANXIETY QUESTIONS SPECIFICALLY
    console.log('\n\n=== ANXIETY QUESTIONS DETAILED ===');
    const anxietyQuestions = allQuestions.filter(q =>
      q.questionId?.includes('ANXIETY') ||
      q.questionId?.includes('GAD7') ||
      q.subcategory === 'anxiety' ||
      q.subcategory === 'gad' ||
      q.tags?.includes('anxiety')
    );

    console.log(`Total anxiety-related questions: ${anxietyQuestions.length}`);
    anxietyQuestions.forEach(q => {
      console.log(`  ${q.questionId}`);
      console.log(`    instrument: ${q.instrument || 'NONE'}`);
      console.log(`    category: ${q.category}`);
      console.log(`    subcategory: ${q.subcategory || 'NONE'}`);
      console.log(`    tags: ${Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || 'NONE')}`);
    });

    // 9. RESPONSE TYPE BREAKDOWN
    console.log('\n\n=== RESPONSE TYPE BREAKDOWN ===');
    const byResponseType = {};
    allQuestions.forEach(q => {
      const rt = q.responseType || 'UNKNOWN';
      if (!byResponseType[rt]) byResponseType[rt] = 0;
      byResponseType[rt]++;
    });

    Object.entries(byResponseType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 10. SAMPLE FULL QUESTION OBJECTS
    console.log('\n\n=== SAMPLE FULL QUESTION OBJECTS ===');

    // PHQ-9 sample
    const phq9Sample = allQuestions.find(q => q.questionId === 'DEPRESSION_PHQ9_1');
    if (phq9Sample) {
      console.log('\nSample PHQ-9 Question (DEPRESSION_PHQ9_1):');
      console.log(JSON.stringify(phq9Sample, null, 2));
    }

    // GAD-7 sample
    const gad7Sample = allQuestions.find(q => q.questionId === 'ANXIETY_GAD7_1');
    if (gad7Sample) {
      console.log('\nSample GAD-7 Question (ANXIETY_GAD7_1):');
      console.log(JSON.stringify(gad7Sample, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

comprehensiveAudit();
