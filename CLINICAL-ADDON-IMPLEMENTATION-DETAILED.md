# Clinical Add-On Implementation - Detailed Technical Documentation
**Date:** October 8, 2025
**Status:** ✅ COMPLETE - Ready for Testing
**Developer:** Claude (Sonnet 4.5)

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Technical Implementation](#technical-implementation)
5. [Database Changes](#database-changes)
6. [API Changes](#api-changes)
7. [Service Layer Changes](#service-layer-changes)
8. [Testing Guide](#testing-guide)
9. [User Flow](#user-flow)
10. [Deployment Checklist](#deployment-checklist)

---

## EXECUTIVE SUMMARY

Successfully implemented a three-tier assessment system with optional clinical add-on to solve the "suicide question problem" identified in competitive analysis.

### What Was Delivered:

✅ **Database Layer:**
- 617 questions tagged with tier assignments
- New schema fields for tier tracking and consent
- Migration-ready data structures

✅ **Service Layer:**
- Intelligent question selector updated with tier filtering
- Tier boundary enforcement in question selection
- Clinical addon access control logic

✅ **API Layer:**
- Assessment tier support in /start endpoint
- Tier parameters passed to intelligent selector in /next endpoint
- New /clinical-consent endpoint for opt-in flow
- Validation and error handling

✅ **Documentation:**
- Comprehensive implementation summary
- Tier assignment report with 617 question breakdown
- API documentation and usage examples

---

## PROBLEM STATEMENT

### The "Suicide Question Problem"

**Before Restructuring:**
- 7 suicide screening questions (10%) appeared in personality assessments
- 126 clinical questions (20.4%) mixed throughout assessment
- No user control over clinical content
- Users expecting "personality test" encountered psychiatric evaluation
- **Risk:** User drop-off, negative UX, misaligned expectations

**Market Context:**
- Competitors (16Personalities, Truity, Crystal) have 0% clinical content in free tiers
- Personality assessments should NOT include suicide screening without consent
- Clinical screening requires opt-in, crisis resources, and ethical safeguards

---

## SOLUTION OVERVIEW

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NEURLYN TIERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1: CORE (Free, 30Q)                                  │
│  ├─ Personality baseline (Big Five)                         │
│  ├─ Light neurodiversity screening (strength-based)         │
│  ├─ Basic attachment                                        │
│  └─ Validity checks                                         │
│                                                              │
│  Content: 0% clinical, 0% suicide screening                 │
│  Sensitivity: NONE or LOW only                              │
│  Questions: 63 available                                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 2: COMPREHENSIVE (Paid, 70Q)                         │
│  ├─ All CORE questions                                      │
│  ├─ NEO-PI-R facets (deep personality)                      │
│  ├─ HEXACO full battery                                     │
│  ├─ Comprehensive neurodiversity assessment                 │
│  ├─ Attachment scales                                       │
│  ├─ Interpersonal problems                                  │
│  ├─ Resilience & coping strategies                          │
│  └─ Brief screeners (PHQ-2, GAD-2, AUDIT-C)                │
│                                                              │
│  Content: 1% brief clinical screeners, 0% suicide           │
│  Sensitivity: Up to MEDIUM                                  │
│  Questions: 446 available                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 3: CLINICAL_ADDON (Optional, Requires Consent)       │
│  ├─ Full C-SSRS suicide screening (7Q)                      │
│  ├─ Full PHQ-9 depression (9Q total)                        │
│  ├─ Full GAD-7 anxiety (7Q total)                           │
│  ├─ Mania screening - MDQ (12Q)                             │
│  ├─ Psychosis screening - PQ-B (18Q)                        │
│  ├─ Borderline screening - MSI-BPD (13Q)                    │
│  ├─ PTSD screening (3Q)                                     │
│  ├─ Trauma screening - ITQ, ACEs (30Q)                      │
│  ├─ Full substance use - AUDIT, DAST (12Q)                  │
│  └─ Panic, social anxiety, OCD (14Q)                        │
│                                                              │
│  Content: Full clinical batteries                           │
│  Sensitivity: HIGH and EXTREME allowed                      │
│  Questions: 148 available                                   │
│  Requirements: Explicit consent + crisis resources          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## TECHNICAL IMPLEMENTATION

### Implementation Flow

```
┌───────────────────────────────────────────────────────────────┐
│                    ASSESSMENT START                            │
│                                                                │
│  User selects tier: CORE or COMPREHENSIVE                     │
│         ↓                                                      │
│  POST /api/adaptive/start                                     │
│  {                                                             │
│    assessmentTier: "CORE" | "COMPREHENSIVE",                 │
│    ...other params                                            │
│  }                                                             │
│         ↓                                                      │
│  Create AssessmentSession with:                               │
│  - assessmentTier: "CORE" | "COMPREHENSIVE"                   │
│  - clinicalAddonConsent: false (default)                      │
│  - clinicalAddonPromptShown: false                            │
│         ↓                                                      │
│  Select first question (tier-filtered)                        │
└───────────────────────────────────────────────────────────────┘
         ↓
┌───────────────────────────────────────────────────────────────┐
│                    ASSESSMENT FLOW                             │
│                                                                │
│  For each response:                                            │
│  1. User answers question                                      │
│  2. POST /api/adaptive/next { response: {...} }               │
│  3. Process intelligence systems                               │
│  4. Get tier parameters:                                       │
│     - assessmentTier (CORE | COMPREHENSIVE)                   │
│     - clinicalAddonConsent (true | false)                     │
│  5. Determine accessible tiers:                                │
│     - CORE: [CORE]                                            │
│     - COMPREHENSIVE: [CORE, COMPREHENSIVE]                    │
│     - COMPREHENSIVE + consent: [CORE, COMPREHENSIVE,          │
│                                 CLINICAL_ADDON]               │
│  6. Query questions filtered by accessible tiers:              │
│     QuestionBank.find({                                        │
│       assessmentTiers: { $in: accessibleTiers }               │
│     })                                                         │
│  7. Select next question using intelligent selector            │
│  8. Return question to frontend                                │
└───────────────────────────────────────────────────────────────┘
         ↓
┌───────────────────────────────────────────────────────────────┐
│              CLINICAL ADD-ON PROMPT (Optional)                 │
│                                                                │
│  Trigger: Assessment progress reaches threshold (e.g., Q20)    │
│  OR: Pattern detection suggests clinical screening useful      │
│                                                                │
│  Frontend displays:                                            │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Mental Wellness Screening (Optional)                 │     │
│  │                                                       │     │
│  │ Would you like to include comprehensive mental       │     │
│  │ health screening? This includes:                     │     │
│  │ - Depression and anxiety assessment                  │     │
│  │ - Trauma and PTSD screening                          │     │
│  │ - Substance use evaluation                           │     │
│  │                                                       │     │
│  │ ⚠️  Crisis Resources:                                │     │
│  │ National Suicide Prevention Lifeline: 988            │     │
│  │ Crisis Text Line: Text HOME to 741741               │     │
│  │                                                       │     │
│  │ [Yes, Continue with Screening]  [No, Skip]          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                                │
│  User responds → POST /api/adaptive/clinical-consent          │
│  {                                                             │
│    sessionId: "...",                                          │
│    consent: true | false                                      │
│  }                                                             │
│         ↓                                                      │
│  Update AssessmentSession:                                     │
│  - clinicalAddonConsent: true | false                         │
│  - clinicalAddonPromptShown: true                             │
│  - clinicalAddonConsentTimestamp: Date (if consent = true)    │
│         ↓                                                      │
│  Continue assessment with updated tier access                  │
└───────────────────────────────────────────────────────────────┘
         ↓
┌───────────────────────────────────────────────────────────────┐
│                    ASSESSMENT COMPLETE                         │
│                                                                │
│  All questions answered → Generate report                      │
│  Report includes tier-specific content                         │
└───────────────────────────────────────────────────────────────┘
```

---

## DATABASE CHANGES

### 1. AssessmentSession Model

**File:** `/models/AssessmentSession.js`
**Lines:** 19-39

```javascript
// NEW TIER SYSTEM
assessmentTier: {
  type: String,
  enum: ['CORE', 'COMPREHENSIVE'],
  default: 'COMPREHENSIVE',
  description: 'CORE = free 30Q, COMPREHENSIVE = paid 70Q'
},
clinicalAddonConsent: {
  type: Boolean,
  default: false,
  description: 'Whether user consented to optional clinical screening'
},
clinicalAddonConsentTimestamp: {
  type: Date,
  description: 'When user gave consent for clinical addon'
},
clinicalAddonPromptShown: {
  type: Boolean,
  default: false,
  description: 'Whether consent prompt has been shown'
},
```

**Purpose:**
- `assessmentTier`: Tracks which tier user is in (CORE or COMPREHENSIVE)
- `clinicalAddonConsent`: Boolean flag for clinical addon opt-in
- `clinicalAddonConsentTimestamp`: Audit trail for consent
- `clinicalAddonPromptShown`: Ensures prompt only shown once

### 2. QuestionBank Model

**File:** `/models/QuestionBank.js`
**Lines:** 106-112

```javascript
// NEW: Assessment tier system (replaces singular tier for multi-tier support)
assessmentTiers: {
  type: [String],
  enum: ['CORE', 'COMPREHENSIVE', 'CLINICAL_ADDON'],
  default: [],
  description: 'Which assessment tiers this question belongs to. CORE = free 30Q, COMPREHENSIVE = paid 70Q, CLINICAL_ADDON = optional clinical screening'
},
```

**Purpose:**
- Questions can belong to multiple tiers (e.g., CORE + COMPREHENSIVE)
- Enables flexible tier-based filtering
- No breaking changes to existing tier field

### 3. Tier Assignment Statistics

**From:** `/tier-assignments-report.json`

```json
{
  "CORE": 63 questions,
  "COMPREHENSIVE": 446 questions,
  "CLINICAL_ADDON": 148 questions,
  "MULTI_TIER": 40 questions (in both CORE and COMPREHENSIVE)
}
```

**Key Assignments:**
- All 7 suicide questions → CLINICAL_ADDON only
- PHQ-2, GAD-2 → COMPREHENSIVE only
- Big Five baseline → Both CORE and COMPREHENSIVE
- NEO-PI-R facets → COMPREHENSIVE only
- Full clinical batteries → CLINICAL_ADDON only

---

## API CHANGES

### 1. POST /api/adaptive/start

**Purpose:** Start new assessment with tier selection

**NEW Parameters:**
```javascript
{
  tier: "comprehensive",          // Legacy (keep for compatibility)
  assessmentTier: "COMPREHENSIVE", // NEW: CORE or COMPREHENSIVE
  demographics: {...},
  concerns: [...],
  userId: "optional",
  useIntelligentSelector: true    // Default true
}
```

**Validation:**
```javascript
// Validate assessmentTier
if (!['CORE', 'COMPREHENSIVE'].includes(assessmentTier)) {
  return res.status(400).json({
    error: 'Invalid assessmentTier. Must be CORE or COMPREHENSIVE'
  });
}
```

**Response:**
```javascript
{
  success: true,
  sessionId: "ADAPTIVE_1728000000000_xyz123",
  tier: "comprehensive",
  assessmentTier: "COMPREHENSIVE",  // NEW
  mode: "intelligent",
  totalQuestions: 70,                // 30 for CORE, 70 for COMPREHENSIVE
  currentBatch: [{ question }],
  progress: { current: 0, total: 70, percentage: 0 },
  phase: "warmup",
  phaseMessage: "..."
}
```

**Changes:**
- Lines 44: Added `assessmentTier` parameter
- Lines 60-64: Added validation for assessmentTier
- Lines 72-74: Store tier fields in assessment
- Lines 84: Set `totalQuestionLimit` based on tier (30 or 70)
- Lines 119-120: Pass tier to intelligent selector

### 2. POST /api/adaptive/clinical-consent (NEW)

**Purpose:** Update clinical add-on consent during assessment

**Request:**
```javascript
{
  sessionId: "ADAPTIVE_1728000000000_xyz123",
  consent: true | false
}
```

**Validation:**
- Session must exist
- Consent must be boolean
- Assessment must be COMPREHENSIVE tier (CORE tier doesn't have clinical addon option)

**Response - Consent Granted:**
```javascript
{
  success: true,
  sessionId: "ADAPTIVE_1728000000000_xyz123",
  clinicalAddonConsent: true,
  message: "Clinical Add-On enabled. Full mental health screening questions will now be included."
}
```

**Response - Consent Declined:**
```javascript
{
  success: true,
  sessionId: "ADAPTIVE_1728000000000_xyz123",
  clinicalAddonConsent: false,
  message: "Clinical Add-On declined. Assessment will continue with personality and brief screeners only."
}
```

**Error Cases:**
```javascript
// Missing sessionId
{ error: "sessionId is required" }

// Invalid consent type
{ error: "consent must be a boolean value" }

// Session not found
{ error: "Assessment not found" }

// Wrong tier
{ error: "Clinical Add-On is only available for COMPREHENSIVE tier assessments" }
```

**Implementation:**
- Lines 222-279 in `/routes/adaptive-assessment.js`
- Updates `clinicalAddonConsent`, `clinicalAddonPromptShown`, `clinicalAddonConsentTimestamp`
- Logs consent decision for audit trail
- Frontend can now call this endpoint when user responds to clinical addon prompt

### 3. POST /api/adaptive/next

**Purpose:** Submit response and get next question

**Changes:**
- Lines 490-492: Extract tier parameters from assessment
- Lines 500-501: Pass tier parameters to intelligent selector

**Tier Logic:**
```javascript
// Extract tier parameters
const assessmentTier = assessment.assessmentTier || 'COMPREHENSIVE';
const clinicalAddonConsent = assessment.clinicalAddonConsent || false;

// Pass to intelligent selector
const nextQuestion = await intelligentSelector.selectNextQuestion(
  QuestionBank,
  allResponses,
  askedQuestionIds,
  tracker,
  assessmentTier,        // NEW: Tier filtering
  clinicalAddonConsent   // NEW: Clinical addon access
);
```

**Behavior:**
- CORE tier: Only sees CORE questions (63 available)
- COMPREHENSIVE tier: Sees CORE + COMPREHENSIVE questions (446 available)
- COMPREHENSIVE + consent: Sees all tiers (617 available)

---

## SERVICE LAYER CHANGES

### 1. IntelligentQuestionSelector

**File:** `/services/intelligent-question-selector.js`

**Method Signature Update:**
```javascript
// BEFORE:
async selectNextQuestion(
  QuestionBank,
  allResponses,
  askedQuestionIds,
  confidenceTracker
)

// AFTER:
async selectNextQuestion(
  QuestionBank,
  allResponses,
  askedQuestionIds,
  confidenceTracker,
  assessmentTier = 'COMPREHENSIVE',  // NEW
  clinicalAddonEnabled = false       // NEW
)
```

**Tier Filtering Logic:**
```javascript
// Determine which tiers are accessible
const accessibleTiers = this.getAccessibleTiers(assessmentTier, clinicalAddonEnabled);
console.log(`[Intelligent Selector] Accessible tiers: [${accessibleTiers.join(', ')}]`);

// Get candidates filtered by tier
const candidates = await QuestionBank.find({
  questionId: { $nin: askedQuestionIds },
  active: true,
  assessmentTiers: { $in: accessibleTiers }  // TIER BOUNDARY ENFORCEMENT
});
```

**New Method: getAccessibleTiers()**
```javascript
getAccessibleTiers(assessmentTier, clinicalAddonEnabled) {
  const tiers = [];

  if (assessmentTier === 'CORE') {
    // Free tier: Only CORE questions
    tiers.push('CORE');
  } else if (assessmentTier === 'COMPREHENSIVE') {
    // Paid tier: CORE + COMPREHENSIVE questions
    tiers.push('CORE', 'COMPREHENSIVE');

    // If clinical addon enabled, also include CLINICAL_ADDON questions
    if (clinicalAddonEnabled) {
      tiers.push('CLINICAL_ADDON');
    }
  }

  return tiers;
}
```

**Access Control Matrix:**

| Assessment Tier | Clinical Consent | Accessible Tiers | Questions Available |
|----------------|------------------|------------------|---------------------|
| CORE | N/A | [CORE] | 63 |
| COMPREHENSIVE | false | [CORE, COMPREHENSIVE] | 446 |
| COMPREHENSIVE | true | [CORE, COMPREHENSIVE, CLINICAL_ADDON] | 617 |

**Example Query:**
```javascript
// COMPREHENSIVE tier with clinical consent
QuestionBank.find({
  questionId: { $nin: ['Q1', 'Q2', ...] },
  active: true,
  assessmentTiers: { $in: ['CORE', 'COMPREHENSIVE', 'CLINICAL_ADDON'] }
})

// CORE tier (no consent option)
QuestionBank.find({
  questionId: { $nin: ['Q1', 'Q2', ...] },
  active: true,
  assessmentTiers: { $in: ['CORE'] }
})
```

---

## TESTING GUIDE

### Manual Testing Scenarios

#### Test 1: CORE Tier Assessment (30Q)
**Setup:**
```bash
curl -X POST http://localhost:3000/api/adaptive/start \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "comprehensive",
    "assessmentTier": "CORE",
    "useIntelligentSelector": true
  }'
```

**Expected Behavior:**
- First question comes from CORE tier only
- No clinical questions appear
- No suicide questions appear
- Assessment completes after 30 questions

**Validation:**
```javascript
// Check all questions are CORE tier
const responses = await AssessmentSession.findOne({ sessionId }).select('responses');
const questionIds = responses.responses.map(r => r.questionId);
const questions = await QuestionBank.find({ questionId: { $in: questionIds } });

// Verify all questions have 'CORE' in assessmentTiers
const allCore = questions.every(q => q.assessmentTiers.includes('CORE'));
console.log('All questions from CORE tier:', allCore); // Should be true

// Verify NO suicide questions
const hasSuicide = questions.some(q => q.questionId.includes('SUICIDE'));
console.log('Has suicide questions:', hasSuicide); // Should be false
```

#### Test 2: COMPREHENSIVE Tier Without Consent (70Q)
**Setup:**
```bash
curl -X POST http://localhost:3000/api/adaptive/start \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "comprehensive",
    "assessmentTier": "COMPREHENSIVE",
    "useIntelligentSelector": true
  }'
```

**Expected Behavior:**
- Questions from CORE + COMPREHENSIVE tiers
- Brief screeners (PHQ-2, GAD-2) may appear
- NO suicide questions
- NO full clinical batteries (PHQ-9, GAD-7, MDQ, etc.)
- Assessment completes after 70 questions

**Validation:**
```javascript
// Check accessible tiers
const responses = await AssessmentSession.findOne({ sessionId }).select('responses');
const questionIds = responses.responses.map(r => r.questionId);
const questions = await QuestionBank.find({ questionId: { $in: questionIds } });

// Verify questions are from CORE or COMPREHENSIVE tiers only
const validTiers = questions.every(q =>
  q.assessmentTiers.includes('CORE') ||
  q.assessmentTiers.includes('COMPREHENSIVE')
);
console.log('Valid tier assignments:', validTiers); // Should be true

// Verify NO CLINICAL_ADDON questions
const hasClinicalAddon = questions.some(q =>
  q.assessmentTiers.includes('CLINICAL_ADDON') &&
  !q.assessmentTiers.includes('COMPREHENSIVE')
);
console.log('Has CLINICAL_ADDON only questions:', hasClinicalAddon); // Should be false

// Check for suicide questions
const suicideQuestions = questions.filter(q => q.questionId.includes('SUICIDE'));
console.log('Suicide questions count:', suicideQuestions.length); // Should be 0
```

#### Test 3: COMPREHENSIVE Tier With Clinical Consent (70Q)
**Setup:**
```bash
# Start assessment
SESSION_ID=$(curl -X POST http://localhost:3000/api/adaptive/start \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "comprehensive",
    "assessmentTier": "COMPREHENSIVE",
    "useIntelligentSelector": true
  }' | jq -r '.sessionId')

# Answer some questions (simulate reaching Q20-30)
# ... answer 20-30 questions ...

# Opt-in to clinical addon
curl -X POST http://localhost:3000/api/adaptive/clinical-consent \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"consent\": true
  }"

# Continue assessment
# ... answer remaining questions ...
```

**Expected Behavior:**
- Before consent: CORE + COMPREHENSIVE questions only
- After consent: All tiers accessible (CORE + COMPREHENSIVE + CLINICAL_ADDON)
- Suicide questions may appear after consent
- Full clinical batteries accessible after consent

**Validation:**
```javascript
// Check consent was recorded
const assessment = await AssessmentSession.findOne({ sessionId });
console.log('Clinical consent:', assessment.clinicalAddonConsent); // Should be true
console.log('Consent timestamp:', assessment.clinicalAddonConsentTimestamp); // Should have timestamp
console.log('Prompt shown:', assessment.clinicalAddonPromptShown); // Should be true

// Check questions after consent point
const consentQuestionNumber = 25; // Example: consent given at Q25
const questionsBeforeConsent = assessment.responses.slice(0, consentQuestionNumber);
const questionsAfterConsent = assessment.responses.slice(consentQuestionNumber);

const questionIdsAfter = questionsAfterConsent.map(r => r.questionId);
const questionsAfter = await QuestionBank.find({ questionId: { $in: questionIdsAfter } });

// Check if CLINICAL_ADDON questions appear after consent
const clinicalAddonQuestions = questionsAfter.filter(q =>
  q.assessmentTiers.includes('CLINICAL_ADDON')
);
console.log('CLINICAL_ADDON questions after consent:', clinicalAddonQuestions.length);
// Should be > 0 if clinical questions were needed
```

### Automated Test Scripts

**File:** `/tests/test-tier-filtering.js` (Create this)

```javascript
const mongoose = require('mongoose');
const Assessment = require('../models/AssessmentSession');
const QuestionBank = require('../models/QuestionBank');
const IntelligentQuestionSelector = require('../services/intelligent-question-selector');
const ConfidenceTracker = require('../services/confidence-tracker');

async function testTierFiltering() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const selector = new IntelligentQuestionSelector();
    const tracker = new ConfidenceTracker();

    // Test 1: CORE tier
    console.log('=== TEST 1: CORE Tier ===');
    const coreQuestion = await selector.selectNextQuestion(
      QuestionBank,
      [],
      [],
      tracker,
      'CORE',  // assessmentTier
      false    // clinicalAddonEnabled
    );
    console.log(`Selected: ${coreQuestion.questionId}`);
    console.log(`Tiers: [${coreQuestion.assessmentTiers.join(', ')}]`);
    console.assert(
      coreQuestion.assessmentTiers.includes('CORE'),
      'Question should be in CORE tier'
    );
    console.assert(
      !coreQuestion.questionId.includes('SUICIDE'),
      'CORE tier should not have suicide questions'
    );
    console.log('✓ CORE tier test passed\n');

    // Test 2: COMPREHENSIVE tier without consent
    console.log('=== TEST 2: COMPREHENSIVE Tier (No Consent) ===');
    const compQuestion = await selector.selectNextQuestion(
      QuestionBank,
      [],
      [coreQuestion.questionId],
      tracker,
      'COMPREHENSIVE',  // assessmentTier
      false             // clinicalAddonEnabled
    );
    console.log(`Selected: ${compQuestion.questionId}`);
    console.log(`Tiers: [${compQuestion.assessmentTiers.join(', ')}]`);
    console.assert(
      compQuestion.assessmentTiers.includes('CORE') ||
      compQuestion.assessmentTiers.includes('COMPREHENSIVE'),
      'Question should be in CORE or COMPREHENSIVE tier'
    );
    console.assert(
      !compQuestion.questionId.includes('SUICIDE'),
      'COMPREHENSIVE without consent should not have suicide questions'
    );
    console.log('✓ COMPREHENSIVE tier test passed\n');

    // Test 3: COMPREHENSIVE tier WITH consent
    console.log('=== TEST 3: COMPREHENSIVE Tier (With Consent) ===');
    // Check that CLINICAL_ADDON questions are now accessible
    const clinicalQuestions = await QuestionBank.find({
      assessmentTiers: 'CLINICAL_ADDON',
      active: true
    }).limit(10);

    console.log(`CLINICAL_ADDON questions available: ${clinicalQuestions.length}`);
    console.assert(
      clinicalQuestions.length > 0,
      'Should have CLINICAL_ADDON questions in database'
    );

    // Check suicide questions are in CLINICAL_ADDON
    const suicideQuestions = await QuestionBank.find({
      questionId: /SUICIDE_SCREEN/,
      active: true
    });

    console.log(`Suicide questions: ${suicideQuestions.length}`);
    suicideQuestions.forEach(q => {
      console.log(`  ${q.questionId}: [${q.assessmentTiers.join(', ')}]`);
      console.assert(
        q.assessmentTiers.includes('CLINICAL_ADDON') &&
        !q.assessmentTiers.includes('CORE') &&
        !q.assessmentTiers.includes('COMPREHENSIVE'),
        `${q.questionId} should be CLINICAL_ADDON only`
      );
    });
    console.log('✓ CLINICAL_ADDON tier test passed\n');

    console.log('═══════════════════════════════════════');
    console.log('  ✅ ALL TIER FILTERING TESTS PASSED');
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testTierFiltering();
```

**Run tests:**
```bash
node tests/test-tier-filtering.js
```

---

## USER FLOW

### Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
└────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌────────────────────────────────────────┐
│  User arrives at assessment page        │
│                                         │
│  Options:                               │
│  ○ Free Assessment (CORE, 30Q)         │
│  ○ Comprehensive Assessment (PAID, 70Q)│
└────────────────────────────────────────┘
  │
  ├──── CORE selected
  │     │
  │     ▼
  │   ┌──────────────────────────────────┐
  │   │  CORE Assessment (30Q)            │
  │   │  • Personality baseline           │
  │   │  • Light ND screening             │
  │   │  • NO clinical questions          │
  │   │  • NO suicide screening           │
  │   └──────────────────────────────────┘
  │     │
  │     ▼
  │   [Complete] → Generate Report
  │
  └──── COMPREHENSIVE selected
        │
        ▼
      ┌──────────────────────────────────┐
      │  COMPREHENSIVE Assessment (70Q)   │
      │  Questions 1-20:                  │
      │  • Personality facets             │
      │  • Neurodiversity deep-dive       │
      │  • Brief screeners (PHQ-2, GAD-2) │
      └──────────────────────────────────┘
        │
        ▼ (Around Q20-30)
      ┌──────────────────────────────────────────────────┐
      │  🎯 Clinical Add-On Prompt (Optional)            │
      │                                                   │
      │  "Would you like to include comprehensive        │
      │  mental health screening?"                       │
      │                                                   │
      │  ⚠️  Warning: Includes sensitive questions       │
      │  📞 Crisis Resources: 988, etc.                  │
      │                                                   │
      │  [ Yes, Include ]    [ No, Skip ]               │
      └──────────────────────────────────────────────────┘
        │
        ├───── "Yes, Include"
        │     │
        │     ▼
        │   ┌──────────────────────────────────┐
        │   │  POST /api/adaptive/clinical     │
        │   │      -consent                    │
        │   │  { consent: true }               │
        │   └──────────────────────────────────┘
        │     │
        │     ▼
        │   ┌──────────────────────────────────┐
        │   │  Questions 21-70:                 │
        │   │  • Personality questions          │
        │   │  • Full depression (PHQ-9)        │
        │   │  • Full anxiety (GAD-7)           │
        │   │  • Suicide screening (C-SSRS)     │
        │   │  • Mania, psychosis, PTSD, trauma │
        │   └──────────────────────────────────┘
        │     │
        │     ▼
        │   [Complete] → Generate Full Report
        │                 with Clinical Section
        │
        └───── "No, Skip"
              │
              ▼
            ┌──────────────────────────────────┐
            │  POST /api/adaptive/clinical     │
            │      -consent                    │
            │  { consent: false }              │
            └──────────────────────────────────┘
              │
              ▼
            ┌──────────────────────────────────┐
            │  Questions 21-70:                 │
            │  • Personality questions          │
            │  • Brief screeners only           │
            │  • NO suicide screening           │
            │  • NO full clinical batteries     │
            └──────────────────────────────────┘
              │
              ▼
            [Complete] → Generate Report
                          (No Clinical Section)
```

### Frontend Implementation Example

**Consent Prompt Component (Pseudo-code):**

```javascript
// When to show prompt:
// - User is on COMPREHENSIVE tier
// - Clinical prompt not yet shown
// - Current question number >= 20 && <= 30

if (assessmentTier === 'COMPREHENSIVE' &&
    !clinicalAddonPromptShown &&
    currentQuestion >= 20 &&
    currentQuestion <= 30) {

  showClinicalConsentModal({
    title: "Mental Wellness Screening (Optional)",
    content: `
      Would you like to include comprehensive mental health screening?

      This adds:
      • Depression and anxiety assessment
      • Trauma and PTSD screening
      • Substance use evaluation

      ⚠️ Note: This section includes sensitive questions about mental health.

      📞 Crisis Resources:
      • National Suicide Prevention Lifeline: 988
      • Crisis Text Line: Text HOME to 741741
      • International: findahelpline.com
    `,
    buttons: [
      {
        label: "Yes, Include Screening",
        action: () => submitConsent(true)
      },
      {
        label: "No, Skip Clinical Screening",
        action: () => submitConsent(false)
      }
    ]
  });
}

async function submitConsent(consent) {
  try {
    const response = await fetch('/api/adaptive/clinical-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        consent: consent
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update UI
      updateConsentStatus(consent);

      // Continue assessment
      continueAssessment();
    }
  } catch (error) {
    console.error('Failed to submit consent:', error);
  }
}
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment

- [x] Database schema updated (`AssessmentSession`, `QuestionBank`)
- [x] All 617 questions tagged with tiers
- [x] Tier assignments verified (0 untagged questions)
- [x] Service layer updated (`IntelligentQuestionSelector`)
- [x] API routes updated (`/start`, `/next`, `/clinical-consent`)
- [x] Backend restarted with new schema
- [ ] Frontend consent modal UI created
- [ ] Crisis resources links added to frontend
- [ ] Analytics tracking added for consent decisions

### Testing Checklist

- [ ] CORE tier test (30Q, no clinical content)
- [ ] COMPREHENSIVE tier test without consent (70Q, brief screeners only)
- [ ] COMPREHENSIVE tier test with consent (70Q, full clinical batteries)
- [ ] Verify NO suicide questions in CORE
- [ ] Verify NO suicide questions in COMPREHENSIVE without consent
- [ ] Verify suicide questions appear in COMPREHENSIVE with consent
- [ ] Test consent API endpoint
- [ ] Test consent decline flow
- [ ] Load test with 100+ concurrent assessments

### Monitoring

**Metrics to Track:**
1. **Consent Rate:** % of users who opt-in to clinical addon
2. **Completion Rate by Tier:**
   - CORE: completion %
   - COMPREHENSIVE (no consent): completion %
   - COMPREHENSIVE (with consent): completion %
3. **Drop-off Points:**
   - Before consent prompt
   - After consent prompt (accept)
   - After consent prompt (decline)
4. **Question Distribution:**
   - Avg questions per tier in assessments
   - Most common clinical questions selected
5. **Assessment Quality:**
   - Validity scores by tier
   - Intelligence flags by tier

**Sample Analytics Queries:**
```javascript
// Consent rate
db.assessmentSessions.aggregate([
  { $match: { assessmentTier: 'COMPREHENSIVE', clinicalAddonPromptShown: true } },
  { $group: {
      _id: null,
      total: { $sum: 1 },
      consented: { $sum: { $cond: ['$clinicalAddonConsent', 1, 0] } }
    }
  },
  { $project: {
      consentRate: { $multiply: [{ $divide: ['$consented', '$total'] }, 100] }
    }
  }
]);

// Questions by tier
db.questionBanks.aggregate([
  { $unwind: '$assessmentTiers' },
  { $group: {
      _id: '$assessmentTiers',
      count: { $sum: 1 }
    }
  }
]);
```

### Post-Deployment

- [ ] Monitor error logs for tier-related issues
- [ ] Review first 100 assessments for tier correctness
- [ ] Validate consent tracking working
- [ ] Check database for orphaned assessments
- [ ] Review user feedback on consent prompt
- [ ] Analyze consent rates
- [ ] Review completion rates by tier

---

## SUMMARY

### What Was Achieved

✅ **Complete Tier-Based Assessment System**
- Database: 617 questions tagged, schema updated
- Services: Tier filtering implemented in intelligent selector
- API: Tier support in all endpoints, new consent endpoint
- Documentation: Comprehensive technical docs

✅ **Solved "Suicide Question Problem"**
- 0 suicide questions in CORE tier
- 0 suicide questions in COMPREHENSIVE tier (without consent)
- All 7 suicide questions isolated to CLINICAL_ADDON tier
- Explicit consent required for clinical screening

✅ **Competitive Market Positioning**
- CORE tier matches competitors (0% clinical content)
- COMPREHENSIVE tier offers premium value (deep personality + brief screeners)
- CLINICAL_ADDON provides optional full mental health assessment
- Neurodiversity-informed approach across all tiers

### Ready for Testing

The system is now ready for comprehensive testing. All code changes are complete, backend has been restarted, and the tier-based question selection is operational.

**Next Step:** Task 8 - Test tier-based question selection with sample assessments

---

**Implementation Complete:** October 8, 2025
**System Status:** ✅ READY FOR TESTING
**Remaining Task:** User acceptance testing and frontend consent UI
