/**
 * Analyze Question Wording for Clinical Tone and Sensitivity
 * Identifies questions that may be too clinical or need more sensitive wording
 */

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/neurlyn-test';

const QuestionBank = require('../models/QuestionBank');

// Clinical/harsh terms to flag
const CLINICAL_TERMS = {
  // DSM terminology that could be softer
  harsh: [
    /\bsuicidal\b/i,
    /\bpsychotic\b/i,
    /\bdelusional\b/i,
    /\bhallucinations?\b/i,
    /\bparanoid\b/i,
    /\bdisorder\b/i,
    /\bpathological\b/i,
    /\babnormal\b/i,
    /\bdysfunctional\b/i,
    /\bimpaired\b/i,
    /\bdeficit\b/i,
    /\bseverely\b/i,
    /\bcrazy\b/i,
    /\binsane\b/i
  ],

  // Very clinical phrasing
  medical: [
    /have you ever experienced/i,
    /do you suffer from/i,
    /are you diagnosed with/i,
    /exhibit/i,
    /manifest/i,
    /symptom/i
  ],

  // Potentially triggering content
  sensitive: [
    /kill (yourself|myself)/i,
    /end (your|my) life/i,
    /self[ -]harm/i,
    /cutting/i,
    /overdose/i,
    /abuse(d)?/i,
    /assault/i,
    /molest/i,
    /rape/i,
    /violent/i
  ]
};

// Suggested rewordings for common patterns
const REWORDING_SUGGESTIONS = {
  'suicidal thoughts': 'thoughts of not wanting to be alive',
  'suicidal ideation': 'thoughts of ending your life',
  'hallucinations': 'experiences that others don\'t seem to share',
  'delusional': 'strong beliefs that others question',
  'paranoid': 'feeling that others might be against you',
  'psychotic': 'unusual perceptual experiences',
  'disorder': 'difficulty',
  'dysfunction': 'challenge',
  'impaired': 'having difficulty with',
  'deficit': 'lower than expected',
  'abnormal': 'different from typical',
  'pathological': 'concerning',
  'severely': 'significantly',
  'do you suffer from': 'do you experience',
  'have you been diagnosed with': 'have you experienced',
  'exhibit symptoms of': 'experience',
  'are you impaired': 'do you have difficulty',
  'kill yourself': 'end your life',
  'kill myself': 'end my life'
};

async function analyzeWording() {
  const issues = [];

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const questions = await QuestionBank.find({ active: true });
    console.log(`📝 Analyzing wording for ${questions.length} questions...\n`);

    for (const q of questions) {
      const text = q.text;
      const concerns = [];
      const suggestions = [];

      // Check for harsh clinical terms
      CLINICAL_TERMS.harsh.forEach(pattern => {
        if (pattern.test(text)) {
          concerns.push(`Contains clinical term: ${text.match(pattern)[0]}`);
        }
      });

      // Check for overly medical phrasing
      CLINICAL_TERMS.medical.forEach(pattern => {
        if (pattern.test(text)) {
          concerns.push(`Medical phrasing: ${text.match(pattern)[0]}`);
        }
      });

      // Check for sensitive/triggering content
      let isSensitive = false;
      CLINICAL_TERMS.sensitive.forEach(pattern => {
        if (pattern.test(text)) {
          concerns.push(`SENSITIVE CONTENT: ${text.match(pattern)[0]}`);
          isSensitive = true;
        }
      });

      // Generate rewording suggestions
      Object.entries(REWORDING_SUGGESTIONS).forEach(([harsh, gentle]) => {
        if (text.toLowerCase().includes(harsh.toLowerCase())) {
          suggestions.push(`Consider: "${harsh}" → "${gentle}"`);
        }
      });

      // Check question length (too long = confusing)
      if (text.length > 200) {
        concerns.push(`Very long question (${text.length} chars) - consider splitting`);
      }

      // Check for double negatives
      if (/\bnot\b.*\bn't\b|\bn't\b.*\bnot\b/i.test(text)) {
        concerns.push('Contains double negative - confusing');
      }

      // Flag if has concerns
      if (concerns.length > 0 || suggestions.length > 0) {
        issues.push({
          questionId: q.questionId,
          category: q.category,
          subcategory: q.subcategory,
          text: text,
          concerns: concerns,
          suggestions: suggestions,
          severity: isSensitive ? 'HIGH' : (concerns.length > 2 ? 'MODERATE' : 'LOW')
        });
      }
    }

    // Generate report
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`QUESTION WORDING ANALYSIS COMPLETE`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Total questions: ${questions.length}`);
    console.log(`Questions flagged: ${issues.length}\n`);

    // Group by severity
    const bySeverity = {
      HIGH: issues.filter(i => i.severity === 'HIGH'),
      MODERATE: issues.filter(i => i.severity === 'MODERATE'),
      LOW: issues.filter(i => i.severity === 'LOW')
    };

    // High severity (sensitive content)
    if (bySeverity.HIGH.length > 0) {
      console.log(`\n🔴 HIGH SEVERITY - SENSITIVE CONTENT (${bySeverity.HIGH.length}):`);
      console.log('═══════════════════════════════════════════════════════════');
      bySeverity.HIGH.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. [${issue.questionId}] ${issue.category} > ${issue.subcategory}`);
        console.log(`   Text: "${issue.text}"`);
        console.log(`   Concerns:`);
        issue.concerns.forEach(c => console.log(`     - ${c}`));
        if (issue.suggestions.length > 0) {
          console.log(`   Suggestions:`);
          issue.suggestions.forEach(s => console.log(`     - ${s}`));
        }
      });
    }

    // Moderate severity (clinical language)
    if (bySeverity.MODERATE.length > 0) {
      console.log(`\n\n⚠️  MODERATE - CLINICAL LANGUAGE (${bySeverity.MODERATE.length}):`);
      console.log('═══════════════════════════════════════════════════════════');
      bySeverity.MODERATE.slice(0, 10).forEach((issue, idx) => {
        console.log(`\n${idx + 1}. [${issue.questionId}]`);
        console.log(`   Text: "${issue.text.substring(0, 100)}${issue.text.length > 100 ? '...' : ''}"`);
        console.log(`   Concerns: ${issue.concerns.join(', ')}`);
        if (issue.suggestions.length > 0) {
          console.log(`   Suggestion: ${issue.suggestions[0]}`);
        }
      });
      if (bySeverity.MODERATE.length > 10) {
        console.log(`\n   ... and ${bySeverity.MODERATE.length - 10} more`);
      }
    }

    // Low severity (minor issues)
    if (bySeverity.LOW.length > 0) {
      console.log(`\n\n💡 LOW - MINOR IMPROVEMENTS (${bySeverity.LOW.length}):`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Sample questions that could be improved:`);
      bySeverity.LOW.slice(0, 5).forEach(issue => {
        console.log(`  - [${issue.questionId}]: ${issue.concerns[0]}`);
      });
    }

    console.log('\n\n📊 SUMMARY BY CATEGORY:');
    console.log('─────────────────────────────────────────────────────────────');
    const byCategory = {};
    issues.forEach(i => {
      if (!byCategory[i.category]) byCategory[i.category] = 0;
      byCategory[i.category]++;
    });
    Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} questions`);
    });

    console.log('\n\n💡 GENERAL RECOMMENDATIONS:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('1. Use person-first language ("person experiencing..." vs "psychotic person")');
    console.log('2. Avoid DSM/medical terminology when possible');
    console.log('3. Frame questions compassionately ("Have you experienced..." vs "Do you suffer from...")');
    console.log('4. For sensitive topics (suicide, self-harm), use validated scale wording');
    console.log('5. Keep questions concise and clear (avoid double negatives)');

    console.log('\n\n📝 NEXT STEPS:');
    console.log('─────────────────────────────────────────────────────────────');
    if (bySeverity.HIGH.length > 0) {
      console.log(`1. Review ${bySeverity.HIGH.length} high-severity questions for sensitive wording`);
    }
    if (bySeverity.MODERATE.length > 0) {
      console.log(`2. Consider rewording ${bySeverity.MODERATE.length} questions with clinical language`);
    }
    console.log(`3. Create rewording script to apply suggested improvements`);
    console.log('\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('\n📖 QUESTION WORDING ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

analyzeWording();
