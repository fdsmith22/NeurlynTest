# Intelligent Question Selector - Implementation Plan
**Date**: 2025-10-07
**Goal**: Replace batch-based stage system with intelligent one-question-at-a-time selection
**Status**: 🔵 Ready to Implement

---

## 📊 CURRENT SYSTEM ANALYSIS

### **Complete Data Flow (As-Is)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION (Frontend)                             │
│    File: js/neurlyn-adaptive-integration.js (12,747 lines) │
├─────────────────────────────────────────────────────────────┤
│ User clicks "Start Assessment"                              │
│   ↓                                                          │
│ startAdaptiveAssessment() called                            │
│   ↓                                                          │
│ POST /api/adaptive/start                                    │
│   body: { tier: 'comprehensive', useMultiStage: true }      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND ROUTING (Backend)                                │
│    File: routes/adaptive-assessment.js (908 lines)          │
├─────────────────────────────────────────────────────────────┤
│ router.post('/start') receives request                      │
│   ↓                                                          │
│ Creates AssessmentSession with mode: 'adaptive-multistage'  │
│   ↓                                                          │
│ Calls multiStageCoordinator.getNextQuestions()              │
│   ↓                                                          │
│ Returns: { questions: [Q1, Q2, ...Q13], stage: 1, ... }     │
│   ↓                                                          │
│ Sends back BATCH of 13 questions to frontend                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MULTI-STAGE COORDINATOR (Stage Decision)                 │
│    File: services/adaptive-selectors/multi-stage-           │
│          coordinator.js (331 lines)                          │
├─────────────────────────────────────────────────────────────┤
│ getNextQuestions(session, QuestionBank)                     │
│   ↓                                                          │
│ Checks current stage (1-4)                                  │
│   ↓                                                          │
│ Delegates to appropriate stage selector:                    │
│   - Stage 1: stage1.selectQuestions()                       │
│   - Stage 2: stage2.selectQuestions()                       │
│   - Stage 3: stage3.selectQuestions()                       │
│   - Stage 4: stage4.selectQuestions()                       │
│   ↓                                                          │
│ Returns BATCH of questions (12-30 questions)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. STAGE SELECTORS (Question Selection)                     │
│    Files: services/adaptive-selectors/                      │
│      - stage-1-broad-screening.js                           │
│      - stage-2-targeted-building.js                         │
│      - stage-3-precision-refinement.js                      │
│      - stage-4-gap-filling.js                               │
├─────────────────────────────────────────────────────────────┤
│ Each stage:                                                 │
│   1. Queries QuestionBank with filters                      │
│   2. Selects batch of questions (e.g., 27 for Stage 2)      │
│   3. Returns questions array                                │
│                                                             │
│ ❌ PROBLEM: Batch is decided BEFORE user answers            │
│ ❌ PROBLEM: No context awareness between questions          │
│ ❌ PROBLEM: Rigid progression (Stage 1 → 2 → 3 → 4)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND DISPLAY (User Answers)                          │
│    File: js/neurlyn-adaptive-integration.js                 │
├─────────────────────────────────────────────────────────────┤
│ Receives batch: [Q1, Q2, ...Q13]                            │
│   ↓                                                          │
│ Displays Q1, user answers                                   │
│   ↓                                                          │
│ Displays Q2, user answers                                   │
│   ↓                                                          │
│ ... (all 13 questions)                                      │
│   ↓                                                          │
│ Batch complete → POST /api/adaptive/next                    │
│   body: { sessionId, responses: [R1...R13] }                │
│   ↓                                                          │
│ Receives next batch: [Q14...Q36]                            │
│   ↓                                                          │
│ Repeat until 70 questions (or stops at 52)                  │
└─────────────────────────────────────────────────────────────┘
```

### **Key Files Inventory**

| File | Lines | Purpose | Modification Needed |
|------|-------|---------|---------------------|
| `routes/adaptive-assessment.js` | 908 | API endpoints | ✅ MODIFY - Add intelligent mode |
| `js/neurlyn-adaptive-integration.js` | 12,747 | Frontend logic | ✅ MODIFY - Add one-at-a-time mode |
| `services/adaptive-selectors/multi-stage-coordinator.js` | 331 | Stage orchestration | ⚪ KEEP - Backward compatibility |
| `services/adaptive-selectors/stage-1-broad-screening.js` | ~400 | Stage 1 logic | ⚪ KEEP - Backward compatibility |
| `services/adaptive-selectors/stage-2-targeted-building.js` | ~410 | Stage 2 logic | ⚪ KEEP - Backward compatibility |
| `services/adaptive-selectors/stage-3-precision-refinement.js` | ~348 | Stage 3 logic | ⚪ KEEP - Backward compatibility |
| `services/adaptive-selectors/stage-4-gap-filling.js` | ~323 | Stage 4 logic | ⚪ KEEP - Backward compatibility |
| `services/intelligent-question-selector.js` | ~600 | NEW - Intelligent selector | ✅ ALREADY CREATED |
| `services/confidence-tracker.js` | ~300 | Track confidence | ✅ USE AS-IS |
| `services/dimension-mapper.js` | ~200 | Map questions to dimensions | ✅ USE AS-IS |
| `models/AssessmentSession.js` | ~500 | Session model | ⚠️ MINOR CHANGES |

### **Current Problems Identified**

1. **Batch-Based Selection**
   - Backend returns 13-30 questions at once
   - Questions pre-determined before user answers
   - No adaptation within batch

2. **Stage Rigidity**
   - Stage 2 batches ALL depression questions together
   - Stage 3 returns too few questions (12 instead of 15-20)
   - Stage 4 never executes (threshold not reached)

3. **Context Blindness**
   - No tracking of recent questions
   - Clustering of similar questions
   - Feels mechanical

---

## 🎯 NEW SYSTEM DESIGN

### **Intelligent Data Flow (To-Be)**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION (Frontend)                             │
│    File: js/neurlyn-adaptive-integration.js                │
├─────────────────────────────────────────────────────────────┤
│ User clicks "Start Assessment"                              │
│   ↓                                                          │
│ startAdaptiveAssessment({ useIntelligentSelector: true })   │
│   ↓                                                          │
│ POST /api/adaptive/start                                    │
│   body: {                                                   │
│     tier: 'comprehensive',                                  │
│     useIntelligentSelector: true  // NEW FLAG              │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND ROUTING (Backend)                                │
│    File: routes/adaptive-assessment.js                      │
├─────────────────────────────────────────────────────────────┤
│ router.post('/start') receives request                      │
│   ↓                                                          │
│ Creates AssessmentSession with:                             │
│   mode: 'adaptive-intelligent'  // NEW MODE                │
│   ↓                                                          │
│ IF useIntelligentSelector:                                  │
│   Call intelligentSelector.selectNextQuestion()             │
│   Returns: { question: Q1 }  // SINGLE QUESTION            │
│ ELSE:                                                       │
│   Call multiStageCoordinator.getNextQuestions()            │
│   Returns: { questions: [Q1...Q13] }  // BATCH             │
│   ↓                                                          │
│ Sends back SINGLE question to frontend                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. INTELLIGENT SELECTOR (Context-Aware Selection)           │
│    File: services/intelligent-question-selector.js          │
├─────────────────────────────────────────────────────────────┤
│ selectNextQuestion(QuestionBank, allResponses,              │
│                    askedIds, confidenceTracker)             │
│   ↓                                                          │
│ 1. Determine current phase (warmup/exploration/etc)         │
│   ↓                                                          │
│ 2. Get all candidate questions (not yet asked)              │
│   ↓                                                          │
│ 3. Score each candidate:                                    │
│    - Information Gain (35%): Low confidence = high priority │
│    - Context Diversity (25%): Avoid clustering              │
│    - Phase Alignment (20%): Right timing                    │
│    - Quality (15%): discriminationIndex                     │
│    - Completion Priority (5%): Finish instruments           │
│   ↓                                                          │
│ 4. Select highest-scoring question                          │
│   ↓                                                          │
│ Returns: SINGLE next question                               │
│                                                             │
│ ✅ SOLUTION: Real-time adaptation after each answer         │
│ ✅ SOLUTION: Context-aware (tracks last 5 questions)        │
│ ✅ SOLUTION: Natural flow (max 3 consecutive on topic)      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND DISPLAY (User Answers)                          │
│    File: js/neurlyn-adaptive-integration.js                 │
├─────────────────────────────────────────────────────────────┤
│ Receives single question: Q1                                │
│   ↓                                                          │
│ Displays Q1, user answers                                   │
│   ↓                                                          │
│ Immediately POST /api/adaptive/next                         │
│   body: { sessionId, response: R1 }  // SINGLE RESPONSE    │
│   ↓                                                          │
│ Receives next question: Q2                                  │
│   ↓                                                          │
│ Displays Q2, user answers                                   │
│   ↓                                                          │
│ POST /api/adaptive/next (R2)                                │
│   ↓                                                          │
│ Repeat until 70 questions                                   │
│                                                             │
│ ✅ BENEFIT: Truly adaptive to each answer                   │
│ ✅ BENEFIT: Always reaches 70 questions                     │
│ ✅ BENEFIT: Natural conversation flow                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION PLAN (Low-Level Detail)

### **PHASE 1: Backend Integration**

#### **Task 1.1: Modify `routes/adaptive-assessment.js`**

**File**: `routes/adaptive-assessment.js` (908 lines)
**Estimated Changes**: ~200 lines added
**Location**: Lines 36-129 (POST /start) and 135-444 (POST /next)

**Changes Needed**:

```javascript
// LINE 8: Add import
const IntelligentQuestionSelector = require('../services/intelligent-question-selector');

// LINE 23: Initialize alongside multi-stage coordinator
const intelligentSelector = new IntelligentQuestionSelector();

// LINE 38: Accept new parameter
router.post('/start', async (req, res) => {
  const {
    tier = 'comprehensive',
    demographics,
    concerns,
    userId,
    useMultiStage = true,
    useIntelligentSelector = false  // NEW PARAMETER
  } = req.body;

  // LINE 53: Set mode based on selector type
  mode: useIntelligentSelector ? 'adaptive-intelligent' :
        useMultiStage ? 'adaptive-multistage' : 'adaptive',

  // LINE 59: Add intelligent selector metadata
  adaptiveMetadata: {
    tier,
    totalQuestionLimit: 70,
    questionsAsked: 0,
    pathwaysActivated: [],
    branchingDecisions: [],
    currentPhase: useIntelligentSelector ? 'warmup' : 'stage1',  // NEW
    concerns,
    useMultiStage,
    useIntelligentSelector,  // NEW
    skipCount: 0,
    clinicalDepthTriggered: [],
    divergentFacets: []
  },

  // LINE 81-82: Branch based on selector type
  let result;
  if (useIntelligentSelector) {
    // NEW: Use intelligent selector
    const confidenceTracker = ConfidenceTracker.fromJSON({
      dimensions: {}
    });

    const firstQuestion = await intelligentSelector.selectNextQuestion(
      QuestionBank,
      [],  // No responses yet
      [],  // No asked questions yet
      confidenceTracker
    );

    result = {
      question: firstQuestion,
      questions: [firstQuestion],  // Wrap for compatibility
      phase: 'warmup',
      phaseMessage: 'Getting to know you...',
      progressMessage: intelligentSelector.getProgressMessage(0,
        intelligentSelector.determinePhase(0), confidenceTracker)
    };
  } else {
    // EXISTING: Use multi-stage coordinator
    result = await multiStageCoordinator.getNextQuestions(assessment, QuestionBank);
  }

  // LINE 85-94: Transform questions (keep existing logic)
  const initialQuestions = Array.isArray(result.questions)
    ? result.questions.map(q => ({ ...q.toObject(), id: q.questionId, ... }))
    : [result.question].map(q => ({ ...q.toObject(), id: q.questionId, ... }));

  // LINE 104-121: Response structure (modify for single vs batch)
  res.json({
    success: true,
    sessionId,
    tier,
    mode: useIntelligentSelector ? 'intelligent' : 'multi-stage',
    totalQuestions: 70,
    currentStage: useIntelligentSelector ? undefined : 1,
    currentPhase: useIntelligentSelector ? 'warmup' : undefined,  // NEW
    stageMessage: result.stageMessage || result.phaseMessage,
    progressMessage: result.progressMessage,
    currentBatch: initialQuestions,
    singleQuestion: useIntelligentSelector,  // NEW: Tell frontend mode
    progress: {
      current: 0,
      total: 70,
      percentage: 0,
      stage: useIntelligentSelector ? undefined : 1,
      phase: useIntelligentSelector ? 'warmup' : undefined  // NEW
    },
    confidence: result.confidenceSummary || {}
  });
});
```

**Changes to POST /next**:

```javascript
// LINE 135: router.post('/next')
router.post('/next', async (req, res) => {
  const { sessionId, response, responses } = req.body;

  // LINE 140: Find assessment
  const assessment = await Assessment.findOne({ sessionId });
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // LINE 146: Check mode
  const useIntelligentSelector = assessment.adaptiveMetadata?.useIntelligentSelector;

  // LINE 150-268: Process responses (KEEP EXISTING LOGIC)
  // ... existing confidence tracking code ...

  // LINE 270-271: Check completion
  if (assessment.responses.length >= 70) {
    // ... existing completion logic ...
  }

  // LINE 300-344: Branch based on mode
  if (useIntelligentSelector) {
    // NEW: Use intelligent selector
    const confidenceTracker = ConfidenceTracker.fromJSON({
      dimensions: assessment.confidenceState
        ? Object.fromEntries(assessment.confidenceState)
        : {}
    });

    const nextQuestion = await intelligentSelector.selectNextQuestion(
      QuestionBank,
      assessment.responses,
      assessment.presentedQuestions || assessment.responses.map(r => r.questionId),
      confidenceTracker
    );

    // Update phase
    const currentPhase = intelligentSelector.determinePhase(assessment.responses.length);
    assessment.adaptiveMetadata.currentPhase = currentPhase.name;

    await assessment.save();

    const nextQuestionFormatted = {
      ...nextQuestion.toObject(),
      id: nextQuestion.questionId,
      category: nextQuestion.category,
      trait: nextQuestion.trait,
      facet: nextQuestion.facet,
      tags: nextQuestion.tags,
      instrument: nextQuestion.instrument,
      reverseScored: nextQuestion.reverseScored
    };

    return res.json({
      success: true,
      complete: false,
      currentBatch: [nextQuestionFormatted],  // Single question wrapped in array
      singleQuestion: true,
      currentPhase: currentPhase.name,
      phaseMessage: intelligentSelector.getProgressMessage(
        assessment.responses.length, currentPhase, confidenceTracker
      ),
      progress: {
        current: assessment.responses.length,
        total: 70,
        percentage: Math.round((assessment.responses.length / 70) * 100),
        phase: currentPhase.name
      },
      confidence: confidenceTracker.getSummary(),
      mode: 'intelligent'
    });
  } else if (useMultiStage) {
    // EXISTING: Use multi-stage coordinator
    // ... existing code (lines 301-344) ...
  }
});
```

**Summary**:
- ✅ Add intelligent selector import
- ✅ Add feature flag `useIntelligentSelector`
- ✅ Branch logic: intelligent vs multi-stage
- ✅ Return single question when intelligent mode
- ✅ Keep existing multi-stage code for backward compatibility
- ✅ Add phase tracking for intelligent mode

**Lines Modified**: ~200 lines added, ~50 lines modified
**Testing Required**: Unit tests for both modes, A/B testing capability

---

#### **Task 1.2: Update `models/AssessmentSession.js` (Minor)**

**File**: `models/AssessmentSession.js`
**Estimated Changes**: ~10 lines added

**Changes Needed**:

```javascript
// Add to adaptiveMetadata schema
adaptiveMetadata: {
  // ... existing fields ...
  useIntelligentSelector: { type: Boolean, default: false },  // NEW
  currentPhase: { type: String, default: 'stage1' },  // NEW (for intelligent mode)
  // ... rest of existing fields ...
}
```

**Summary**:
- ✅ Add `useIntelligentSelector` flag to schema
- ✅ Add `currentPhase` for phase tracking

---

### **PHASE 2: Frontend Integration**

#### **Task 2.1: Modify `js/neurlyn-adaptive-integration.js`**

**File**: `js/neurlyn-adaptive-integration.js` (12,747 lines)
**Estimated Changes**: ~150 lines added
**Location**: Lines 29-100 (initialization), 388-600 (batch handling)

**Changes Needed**:

```javascript
// LINE 29: Add to constructor
constructor(tier = 'standard', options = {}) {
  this.tier = tier;
  this.useIntelligentSelector = options.useIntelligentSelector || false;  // NEW
  this.singleQuestionMode = false;  // NEW: Set by backend response
  // ... existing code ...
}

// LINE 67: Modify startAdaptiveAssessment
async startAdaptiveAssessment() {
  console.log('Starting adaptive assessment');

  try {
    const response = await apiClient.startAdaptiveAssessment(
      this.tier,
      null,
      this.useIntelligentSelector  // NEW: Pass flag to backend
    );

    // ... existing code ...

    // LINE 83-90: Check mode
    this.singleQuestionMode = response.singleQuestion || false;  // NEW

    if (this.singleQuestionMode) {
      console.log('Using intelligent selector (one question at a time)');
    } else {
      console.log('Using multi-stage selector (batch mode)');
    }

    // ... rest of existing code ...
  }
}

// LINE 297: Modify handleNext (when user clicks Next)
async handleNext() {
  // ... existing validation code ...

  if (this.singleQuestionMode) {
    // NEW: Intelligent mode - request next question immediately
    await this.requestNextSingleQuestion();
  } else {
    // EXISTING: Batch mode - advance to next in batch
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.currentBatch.length) {
      // Batch exhausted - request next batch
      await this.submitBatchAndLoadNext();
    } else {
      // Display next question in batch
      this.displayCurrentQuestion();
    }
  }
}

// NEW METHOD: Request next single question
async requestNextSingleQuestion() {
  console.log('[Intelligent Mode] Requesting next question...');

  // Send current response to backend
  const currentResponse = {
    questionId: this.currentBatch[0].questionId,
    answer: this.currentAnswer,
    score: this.currentScore,
    responseTime: Date.now() - this.questionStartTime,
    question: this.currentBatch[0]
  };

  this.allResponses.push(currentResponse);

  try {
    // Call backend with single response
    const response = await apiClient.submitSingleResponse(
      this.sessionId,
      currentResponse
    );

    if (response.complete) {
      // Assessment finished
      await this.completeAssessment();
      return;
    }

    // Update progress
    if (response.progress) {
      this.updateProgressBar(response.progress);
    }

    // Update confidence panel
    if (response.confidence) {
      this.updateConfidencePanel(response.confidence);
    }

    // Load next single question
    this.currentBatch = response.currentBatch;  // Single question in array
    this.currentQuestionIndex = 0;
    this.displayCurrentQuestion();

  } catch (error) {
    console.error('[Intelligent Mode] Error requesting next question:', error);
    this.showError('Failed to load next question');
  }
}

// LINE 388-600: Keep existing submitBatchAndLoadNext for backward compatibility
// This handles multi-stage mode
```

**Summary**:
- ✅ Add `useIntelligentSelector` flag to constructor
- ✅ Detect mode from backend response
- ✅ Add `requestNextSingleQuestion()` method
- ✅ Modify `handleNext()` to branch based on mode
- ✅ Keep existing batch handling for backward compatibility

**Lines Modified**: ~150 lines added, ~30 lines modified

---

#### **Task 2.2: Modify `js/api-client.js`**

**File**: `js/api-client.js`
**Estimated Changes**: ~40 lines added

**Changes Needed**:

```javascript
// Modify startAdaptiveAssessment method
async startAdaptiveAssessment(tier, demographics, useIntelligentSelector = false) {
  const response = await fetch('/api/adaptive/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier,
      demographics,
      useIntelligentSelector  // NEW: Pass flag to backend
    })
  });
  return response.json();
}

// NEW METHOD: Submit single response
async submitSingleResponse(sessionId, response) {
  const apiResponse = await fetch('/api/adaptive/next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      response  // Single response instead of array
    })
  });
  return apiResponse.json();
}
```

**Summary**:
- ✅ Add parameter to `startAdaptiveAssessment()`
- ✅ Add new method `submitSingleResponse()`

---

### **PHASE 3: Testing & Validation**

#### **Task 3.1: Create Integration Test**

**File**: `tests/integration/intelligent-selector-flow.test.js` (NEW)
**Estimated Size**: ~300 lines

```javascript
const request = require('supertest');
const app = require('../../backend');
const mongoose = require('mongoose');

describe('Intelligent Selector Integration', () => {
  let sessionId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/neurlyn-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Should start assessment in intelligent mode', async () => {
    const response = await request(app)
      .post('/api/adaptive/start')
      .send({
        tier: 'comprehensive',
        useIntelligentSelector: true
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.mode).toBe('intelligent');
    expect(response.body.singleQuestion).toBe(true);
    expect(response.body.currentBatch).toHaveLength(1);

    sessionId = response.body.sessionId;
  });

  test('Should return single question at a time', async () => {
    // Answer first question
    const response = await request(app)
      .post('/api/adaptive/next')
      .send({
        sessionId,
        response: {
          questionId: 'BASELINE_OPENNESS_1',
          answer: 'Agree',
          score: 4
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.currentBatch).toHaveLength(1);
    expect(response.body.singleQuestion).toBe(true);
  });

  test('Should avoid clustering similar questions', async () => {
    const questionTopics = [];

    // Answer 20 questions and track topics
    for (let i = 0; i < 20; i++) {
      const response = await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId,
          response: {
            questionId: `TEST_Q${i}`,
            answer: 'Neutral',
            score: 3
          }
        });

      const question = response.body.currentBatch[0];
      questionTopics.push(question.category);
    }

    // Check no more than 5 consecutive on same topic
    let maxRun = 1;
    let currentRun = 1;
    for (let i = 1; i < questionTopics.length; i++) {
      if (questionTopics[i] === questionTopics[i-1]) {
        currentRun++;
        maxRun = Math.max(maxRun, currentRun);
      } else {
        currentRun = 1;
      }
    }

    expect(maxRun).toBeLessThanOrEqual(5);
  });

  test('Should complete all 70 questions', async () => {
    // Continue answering until complete
    let complete = false;
    let questionCount = 0;

    while (!complete && questionCount < 70) {
      const response = await request(app)
        .post('/api/adaptive/next')
        .send({
          sessionId,
          response: {
            questionId: `TEST_Q${questionCount}`,
            answer: 'Agree',
            score: 4
          }
        });

      complete = response.body.complete;
      questionCount++;
    }

    expect(questionCount).toBe(70);
    expect(complete).toBe(true);
  });
});
```

---

#### **Task 3.2: Create Unit Tests for Priority Scoring**

**File**: `tests/unit/intelligent-selector.test.js` (NEW)
**Estimated Size**: ~200 lines

```javascript
const IntelligentQuestionSelector = require('../../services/intelligent-question-selector');
const ConfidenceTracker = require('../../services/confidence-tracker');

describe('IntelligentQuestionSelector', () => {
  let selector;

  beforeEach(() => {
    selector = new IntelligentQuestionSelector();
  });

  test('Should prioritize low-confidence dimensions', () => {
    const question = {
      category: 'personality',
      trait: 'openness',
      facet: 'fantasy',
      adaptive: { discriminationIndex: 0.75 }
    };

    const confidenceTracker = new ConfidenceTracker();
    confidenceTracker.updateConfidence('openness', {
      questionId: 'TEST',
      score: 3,
      timestamp: new Date()
    });

    const infoGain = selector.calculateInformationGain(
      question,
      confidenceTracker,
      []
    );

    expect(infoGain).toBeGreaterThan(50);
  });

  test('Should penalize similar questions', () => {
    const question = {
      category: 'clinical_psychopathology',
      instrument: 'PHQ-9',
      subcategory: 'depression'
    };

    const recentResponses = [
      { instrument: 'PHQ-9', subcategory: 'depression' },
      { instrument: 'PHQ-9', subcategory: 'depression' }
    ];

    const diversity = selector.calculateContextDiversity(
      question,
      recentResponses,
      []
    );

    expect(diversity).toBeLessThan(70);
  });

  test('Should enforce max topic run', () => {
    const question = {
      category: 'clinical_psychopathology',
      subcategory: 'depression'
    };

    const recentResponses = [
      { subcategory: 'depression' },
      { subcategory: 'depression' },
      { subcategory: 'depression' },
      { subcategory: 'depression' },
      { subcategory: 'depression' }  // 5 in a row
    ];

    const diversity = selector.calculateContextDiversity(
      question,
      recentResponses,
      []
    );

    expect(diversity).toBeLessThan(50);  // Heavy penalty
  });
});
```

---

### **PHASE 4: A/B Testing Framework**

#### **Task 4.1: Add A/B Testing Logic**

**File**: `routes/adaptive-assessment.js` (modification)

```javascript
// LINE 38: Add A/B test assignment
router.post('/start', async (req, res) => {
  let { useIntelligentSelector } = req.body;

  // A/B Test: Assign 20% of users to intelligent selector
  if (useIntelligentSelector === undefined && process.env.AB_TEST_ENABLED === 'true') {
    useIntelligentSelector = Math.random() < 0.2;  // 20% get new system
    console.log(`[A/B Test] User assigned to: ${useIntelligentSelector ? 'INTELLIGENT' : 'MULTI-STAGE'}`);
  }

  // ... rest of code ...
});
```

#### **Task 4.2: Add Analytics Logging**

**File**: `services/analytics-logger.js` (NEW)

```javascript
class AnalyticsLogger {
  logAssessmentStart(sessionId, mode, tier) {
    // Log to database or analytics service
    console.log(`[Analytics] Assessment started: ${sessionId}, mode: ${mode}, tier: ${tier}`);
  }

  logQuestionSelected(sessionId, questionId, priority, mode) {
    // Log each question selection
  }

  logAssessmentComplete(sessionId, mode, totalQuestions, duration) {
    // Log completion metrics
  }
}

module.exports = new AnalyticsLogger();
```

---

## 📋 DETAILED TASK CHECKLIST

### **Backend Tasks**

- [ ] **TASK 1.1**: Modify `routes/adaptive-assessment.js` POST /start
  - [ ] Add `IntelligentQuestionSelector` import
  - [ ] Add `useIntelligentSelector` parameter handling
  - [ ] Branch logic: intelligent vs multi-stage
  - [ ] Return single question when intelligent mode
  - [ ] Update response structure with phase info

- [ ] **TASK 1.2**: Modify `routes/adaptive-assessment.js` POST /next
  - [ ] Detect intelligent mode from session
  - [ ] Call `intelligentSelector.selectNextQuestion()`
  - [ ] Update phase tracking
  - [ ] Return single question response
  - [ ] Keep multi-stage logic for backward compatibility

- [ ] **TASK 1.3**: Update `models/AssessmentSession.js`
  - [ ] Add `useIntelligentSelector` to schema
  - [ ] Add `currentPhase` to schema
  - [ ] Test schema changes with existing sessions

### **Frontend Tasks**

- [ ] **TASK 2.1**: Modify `js/neurlyn-adaptive-integration.js`
  - [ ] Add `useIntelligentSelector` constructor option
  - [ ] Add `singleQuestionMode` property
  - [ ] Modify `startAdaptiveAssessment()` to pass flag
  - [ ] Add `requestNextSingleQuestion()` method
  - [ ] Modify `handleNext()` to branch by mode
  - [ ] Keep existing batch logic for backward compatibility

- [ ] **TASK 2.2**: Modify `js/api-client.js`
  - [ ] Add `useIntelligentSelector` parameter to `startAdaptiveAssessment()`
  - [ ] Add `submitSingleResponse()` method

### **Testing Tasks**

- [ ] **TASK 3.1**: Create integration test
  - [ ] Test intelligent mode start
  - [ ] Test single question flow
  - [ ] Test no clustering (max 5 consecutive)
  - [ ] Test reaches 70 questions

- [ ] **TASK 3.2**: Create unit tests
  - [ ] Test information gain calculation
  - [ ] Test context diversity scoring
  - [ ] Test phase alignment scoring
  - [ ] Test topic run enforcement

- [ ] **TASK 3.3**: Manual testing
  - [ ] Test full 70-question assessment
  - [ ] Verify question variety
  - [ ] Check completion time
  - [ ] Verify clinical validity maintained

### **A/B Testing Tasks**

- [ ] **TASK 4.1**: Add A/B test assignment logic
  - [ ] 20% users get intelligent selector
  - [ ] 80% users get multi-stage (control)
  - [ ] Log assignment decision

- [ ] **TASK 4.2**: Add analytics logging
  - [ ] Log assessment start (mode, tier)
  - [ ] Log each question selected
  - [ ] Log assessment complete (metrics)

### **Documentation Tasks**

- [ ] **TASK 5.1**: Update API documentation
- [ ] **TASK 5.2**: Update frontend integration guide
- [ ] **TASK 5.3**: Create A/B test analysis guide

---

## 🎯 IMPLEMENTATION STRATEGY

### **Option A: Feature Flag (Recommended)**

```javascript
// Enable intelligent selector with flag
const assessment = new NeurlynAdaptiveAssessment('comprehensive', {
  useIntelligentSelector: true  // NEW
});
```

**Benefits**:
- ✅ Easy to enable/disable
- ✅ A/B testing ready
- ✅ Rollback capability
- ✅ Keeps old code working

### **Option B: Gradual Rollout**

```javascript
// Auto-assign based on percentage
POST /api/adaptive/start
{
  tier: "comprehensive"
  // Server decides: 20% get intelligent, 80% get multi-stage
}
```

**Benefits**:
- ✅ Automatic A/B testing
- ✅ No frontend changes needed
- ✅ Easy percentage adjustment

---

## 📊 SUCCESS METRICS

### **Quantitative Metrics**

| Metric | Current (Multi-Stage) | Target (Intelligent) |
|--------|----------------------|----------------------|
| Completion rate | 74% (stops at 52Q) | 100% (reaches 70Q) |
| Max consecutive similar Qs | 9 (depression) | 3 (enforced) |
| Topic diversity (first 30Q) | Low (3 topics) | High (5+ topics) |
| Average completion time | 20-25 min | 18-22 min |
| User satisfaction | Baseline | +20% |

### **Qualitative Metrics**

- **User Feedback**: Survey after completion
- **Flow Score**: Rate natural question flow (1-10)
- **Clinical Validity**: Maintain existing validity scores

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Backend** | Tasks 1.1-1.3 | 3-4 hours |
| **Phase 2: Frontend** | Tasks 2.1-2.2 | 2-3 hours |
| **Phase 3: Testing** | Tasks 3.1-3.3 | 2-3 hours |
| **Phase 4: A/B Setup** | Tasks 4.1-4.2 | 1-2 hours |
| **Total** | | **8-12 hours** |

---

## 🚀 READY TO IMPLEMENT

**Files Summary**:
- ✅ `intelligent-question-selector.js` - Already created
- 🔄 `routes/adaptive-assessment.js` - Modify (200 lines added)
- 🔄 `js/neurlyn-adaptive-integration.js` - Modify (150 lines added)
- 🔄 `js/api-client.js` - Modify (40 lines added)
- 🔄 `models/AssessmentSession.js` - Minor changes (10 lines)
- ✨ 2 new test files (~500 lines total)

**Total Changes**: ~900 lines added, ~100 lines modified

**Backward Compatibility**: ✅ 100% maintained

**Rollback Plan**: Change flag from `true` to `false`

---

**Shall we proceed with implementation?**

Next: Create detailed todo file and begin with Task 1.1 (Backend integration).
