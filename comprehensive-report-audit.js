/**
 * Comprehensive Report Audit Script
 * Compares console log scores with PDF report display to identify inconsistencies
 */

const fs = require('fs');
const path = require('path');

// ===== CONSOLE LOG ANALYSIS =====
const consoleData = {
  // From user's console logs
  assessment: {
    sessionId: 'ADAPTIVE_1759873600737_xa9optyew',
    tier: 'comprehensive',
    intelligent: true,
    totalQuestions: 70
  },

  // Big Five Scores (from report data shown in console)
  bigFive: {
    openness: 48,
    conscientiousness: 42,
    extraversion: 30,
    agreeableness: 20,
    neuroticism: 30
  },

  // RUO Classification
  ruo: {
    primaryType: 'resilient',
    confidence: 0.421,
    isHybrid: false
  },

  // Interpersonal Style
  interpersonal: {
    agency: 33,
    communion: 25,
    octant: 'JK'
  },

  // Neurodiversity Data (need to verify from actual backend logs)
  neurodiversity: {
    adhd: {
      score: null, // Unknown from console
      domains: {}
    },
    autism: {
      score: null, // Unknown from console
      indicators: {}
    },
    sensory: {
      visual: null,
      auditory: null,
      tactile: null,
      vestibular: null,
      oral: null,
      olfactory: null
    },
    executiveFunction: {
      overall: null,
      domains: {}
    }
  }
};

// ===== EXPECTED CALCULATIONS =====
const expectedCalculations = {
  bigFive: {
    // Verify trait scores are within valid range (0-100)
    openness: { min: 0, max: 100, actual: 48, valid: true },
    conscientiousness: { min: 0, max: 100, actual: 42, valid: true },
    extraversion: { min: 0, max: 100, actual: 30, valid: true },
    agreeableness: { min: 0, max: 100, actual: 20, valid: true },
    neuroticism: { min: 0, max: 100, actual: 30, valid: true }
  },

  // Derived calculations
  derived: {
    // RUO should be based on: E (high = resilient), N (high = undercontrolled), C (high = overcontrolled)
    ruoExpected: {
      resilient: consoleData.bigFive.extraversion >= 50 && consoleData.bigFive.neuroticism <= 50 && consoleData.bigFive.agreeableness >= 50,
      undercontrolled: consoleData.bigFive.neuroticism >= 60 && consoleData.bigFive.conscientiousness <= 40 && consoleData.bigFive.agreeableness <= 40,
      overcontrolled: consoleData.bigFive.neuroticism >= 60 && consoleData.bigFive.conscientiousness >= 60
    },

    // With E=30, N=30, A=20, C=42:
    // - NOT resilient (E=30 < 50)
    // - NOT undercontrolled (N=30 < 60)
    // - NOT overcontrolled (N=30 < 60)
    // Actual: "resilient" with 42% confidence - POTENTIALLY INCORRECT

    // Interpersonal: Agency = Dominance (E + low A), Communion = Warmth (E + A)
    interpersonalExpected: {
      // Agency = f(Extraversion, Agreeableness reversed)
      // Communion = f(Extraversion, Agreeableness)
      agency: Math.round((consoleData.bigFive.extraversion + (100 - consoleData.bigFive.agreeableness)) / 2),
      communion: Math.round((consoleData.bigFive.extraversion + consoleData.bigFive.agreeableness) / 2)
    }
    // Expected: Agency = (30 + 80) / 2 = 55, Communion = (30 + 20) / 2 = 25
    // Actual: Agency = 33, Communion = 25
    // Communion MATCHES but Agency is INCORRECT (should be 55, not 33)
  }
};

// ===== REPORT SECTION MAPPING =====
const reportSections = {
  personality: {
    subsections: [
      { name: 'Big Five Overview', dataSource: 'report.personality.bigFive', verified: false },
      { name: 'Big Five Facets', dataSource: 'report.detailed.subDimensions', verified: false },
      { name: 'Confidence Bands', dataSource: 'report.personality.confidences', verified: false }
    ]
  },

  psychological: {
    subsections: [
      { name: 'RUO Classification', dataSource: 'report.personality.ruoPrototype', verified: false, issue: 'Classification logic may be incorrect' },
      { name: 'Interpersonal Style', dataSource: 'report.personality.interpersonalStyle', verified: false, issue: 'Agency calculation incorrect' },
      { name: 'HEXACO Estimate', dataSource: 'report.detailed.hexaco', verified: false },
      { name: 'Temperament Analysis', dataSource: 'report.detailed.temperament', verified: false }
    ]
  },

  neurodiversity: {
    subsections: [
      { name: 'ADHD Screening', dataSource: 'report.detailed.neurodiversity.adhd', verified: false },
      { name: 'Autism Screening', dataSource: 'report.detailed.neurodiversity.autism', verified: false },
      { name: 'Executive Function', dataSource: 'report.detailed.neurodiversity.executiveFunction', verified: true, note: 'Fixed - now 0-100 scale' },
      { name: 'Sensory Processing', dataSource: 'report.detailed.neurodiversity.sensoryProfile', verified: true, note: 'Fixed - now 0-100 scale with 7 levels' }
    ]
  },

  clinical: {
    subsections: [
      { name: 'Depression (PHQ-9)', dataSource: 'report.clinical.depression', verified: false },
      { name: 'Anxiety (GAD-7)', dataSource: 'report.clinical.anxiety', verified: false },
      { name: 'Mania (MDQ)', dataSource: 'report.clinical.mania', verified: false },
      { name: 'Psychosis Screening', dataSource: 'report.clinical.psychosis', verified: false },
      { name: 'Borderline Traits', dataSource: 'report.clinical.borderline', verified: false },
      { name: 'Somatic Symptoms', dataSource: 'report.clinical.somatic', verified: false },
      { name: 'Trauma (ACEs)', dataSource: 'report.clinical.trauma', verified: false },
      { name: 'Attachment Style', dataSource: 'report.clinical.attachment', verified: false },
      { name: 'Resilience', dataSource: 'report.clinical.resilience', verified: false },
      { name: 'Treatment Indicators', dataSource: 'report.clinical.treatmentIndicators', verified: false }
    ]
  },

  behavioral: {
    subsections: [
      { name: 'Behavioral Fingerprint', dataSource: 'report.detailed.behavioralFingerprint', verified: false },
      { name: 'Career Insights', dataSource: 'report.detailed.careerInsights', verified: false },
      { name: 'Relationship Insights', dataSource: 'report.detailed.relationshipInsights', verified: false }
    ]
  }
};

// ===== KNOWN ISSUES =====
const knownIssues = [
  {
    priority: 'HIGH',
    section: 'Interpersonal Style - Agency Calculation',
    issue: 'Agency score (33) appears inconsistent with formula',
    expected: 'Agency = (E + (100 - A)) / 2 = (30 + 80) / 2 = 55',
    actual: 'Agency = 33',
    location: 'services/interpersonal-circumplex.js',
    status: 'NEEDS FIX'
  },
  {
    priority: 'HIGH',
    section: 'RUO Classification',
    issue: 'User classified as "Resilient" despite low Extraversion and Agreeableness',
    expected: 'Should NOT be Resilient (E=30 < 50, A=20 < 50)',
    actual: 'Classified as Resilient with 42.1% confidence',
    location: 'services/ruo-classifier.js',
    status: 'NEEDS VERIFICATION'
  },
  {
    priority: 'MEDIUM',
    section: 'Neurodiversity Scores - Raw Data Missing',
    issue: 'Cannot verify ADHD, Autism, EF, Sensory scores from console',
    expected: 'Need backend server logs with [ND-DEBUG] output',
    actual: 'No debug output visible in provided console logs',
    location: 'services/neurodiversity-scoring.js',
    status: 'NEEDS SERVER LOGS'
  },
  {
    priority: 'MEDIUM',
    section: 'Clinical Assessment Mapping',
    issue: 'Unknown if all 10 clinical scorers are executed and displayed',
    expected: 'All scorers should run and be included in report.clinical',
    actual: 'Need to verify report.clinical contains all assessments',
    location: 'services/comprehensive-report-generator.js:5888-6000',
    status: 'NEEDS VERIFICATION'
  },
  {
    priority: 'LOW',
    section: 'Consistency Across Sections',
    issue: 'Different sections may interpret same traits differently',
    expected: 'E=30, A=20, N=30 should be consistently interpreted as "introverted, direct/critical, emotionally stable"',
    actual: 'Need to audit: personality summary, career insights, relationship insights, archetype description',
    location: 'Multiple files',
    status: 'NEEDS AUDIT'
  }
];

// ===== AUDIT RECOMMENDATIONS =====
const recommendations = [
  {
    priority: 1,
    action: 'Verify Interpersonal Circumplex calculations',
    file: 'services/interpersonal-circumplex.js',
    test: 'Add debug logging for Agency and Communion calculations',
    validate: 'Compare against published IPC-32 scoring algorithms'
  },
  {
    priority: 2,
    action: 'Review RUO classification thresholds',
    file: 'services/ruo-classifier.js',
    test: 'Run classification with E=30, N=30, A=20, C=42 and verify correct prototype',
    validate: 'Compare against Block & Block (2006) RUO criteria'
  },
  {
    priority: 3,
    action: 'Add comprehensive backend logging',
    file: 'services/neurodiversity-scoring.js',
    test: 'Enable all [ND-DEBUG], [ADHD-DEBUG], [AUTISM-DEBUG] console logs',
    validate: 'Run assessment and capture full server.log output'
  },
  {
    priority: 4,
    action: 'Audit all clinical scorers',
    file: 'services/comprehensive-report-generator.js',
    test: 'Add logging for each clinical scorer execution',
    validate: 'Confirm all 10 scorers execute and populate report.clinical'
  },
  {
    priority: 5,
    action: 'Create consistency validator',
    file: 'NEW: services/report-consistency-validator.js',
    test: 'Cross-check interpretations across all report sections',
    validate: 'Ensure no conflicting descriptions of same trait'
  }
];

// ===== OUTPUT AUDIT REPORT =====
console.log('═══════════════════════════════════════════════════════════');
console.log('   NEURLYN COMPREHENSIVE REPORT AUDIT');
console.log('   Session: ' + consoleData.assessment.sessionId);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📊 BIG FIVE SCORES (Verified)');
console.log('─────────────────────────────────────────────────────────');
Object.entries(consoleData.bigFive).forEach(([trait, score]) => {
  const status = (score >= 0 && score <= 100) ? '✓' : '✗';
  console.log(`${status} ${trait.padEnd(20)} ${score}/100`);
});

console.log('\n🧬 DERIVED CALCULATIONS (Verification Needed)');
console.log('─────────────────────────────────────────────────────────');
console.log('RUO Classification:');
console.log(`  Actual: ${consoleData.ruo.primaryType} (${Math.round(consoleData.ruo.confidence * 100)}% confidence)`);
console.log(`  Expected: NOT Resilient (E=30 < 50, A=20 < 50, N=30 ≈ neutral)`);
console.log(`  Status: ⚠️  NEEDS REVIEW\n`);

console.log('Interpersonal Style:');
console.log(`  Agency Actual: ${consoleData.interpersonal.agency}`);
console.log(`  Agency Expected: ${expectedCalculations.derived.interpersonalExpected.agency}`);
console.log(`  Communion Actual: ${consoleData.interpersonal.communion}`);
console.log(`  Communion Expected: ${expectedCalculations.derived.interpersonalExpected.communion}`);
console.log(`  Status: ⚠️  AGENCY CALCULATION INCORRECT\n`);

console.log('\n🔍 KNOWN ISSUES');
console.log('─────────────────────────────────────────────────────────');
knownIssues.forEach((issue, idx) => {
  console.log(`${idx + 1}. [${issue.priority}] ${issue.section}`);
  console.log(`   Issue: ${issue.issue}`);
  console.log(`   Expected: ${issue.expected}`);
  console.log(`   Actual: ${issue.actual}`);
  console.log(`   Status: ${issue.status}\n`);
});

console.log('\n📋 REPORT SECTIONS VERIFICATION STATUS');
console.log('─────────────────────────────────────────────────────────');
Object.entries(reportSections).forEach(([section, data]) => {
  console.log(`\n${section.toUpperCase()}:`);
  data.subsections.forEach(subsection => {
    const status = subsection.verified ? '✓' : '⏳';
    const note = subsection.issue || subsection.note || '';
    console.log(`  ${status} ${subsection.name} ${note ? `(${note})` : ''}`);
  });
});

console.log('\n\n🛠️  RECOMMENDED ACTIONS');
console.log('─────────────────────────────────────────────────────────');
recommendations.forEach((rec, idx) => {
  console.log(`\nPriority ${rec.priority}: ${rec.action}`);
  console.log(`  File: ${rec.file}`);
  console.log(`  Test: ${rec.test}`);
  console.log(`  Validate: ${rec.validate}`);
});

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('   END OF AUDIT');
console.log('═══════════════════════════════════════════════════════════\n');

// Export audit data for further analysis
module.exports = {
  consoleData,
  expectedCalculations,
  reportSections,
  knownIssues,
  recommendations
};
