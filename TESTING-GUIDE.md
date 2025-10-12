# Testing Guide - Neurlyn Adaptive Assessment

**Last Updated:** 2025-10-06
**Status:** Unit Tests Complete, Integration Tests Ready

---

## Overview

The Neurlyn adaptive assessment system includes comprehensive unit and integration tests covering:
- Confidence tracking calculations
- Multi-stage question selection
- Stage advancement logic
- Full 70-question assessment flows
- Synthetic personality profiles

---

## Test Structure

```
tests/
├── fixtures/
│   └── synthetic-profiles.js     # 7 personality archetypes for testing
├── unit/
│   ├── confidence-tracker.test.js    # ConfidenceTracker unit tests
│   └── stage-selectors.test.js       # All 4 stage selectors + coordinator
└── integration/
    └── full-assessment-flow.test.js  # End-to-end assessment simulation
```

---

## Running Tests

### Prerequisites

```bash
# Ensure Jest is installed
npm install

# Ensure MongoDB is running (for integration tests)
# Local: mongod
# Or use MongoDB Atlas connection string in .env
```

### Run All Tests

```bash
npm test
```

### Run Unit Tests Only

```bash
npm test tests/unit
```

### Run Integration Tests Only

```bash
npm test tests/integration
```

### Run Specific Test File

```bash
# Confidence tracker tests
npm test tests/unit/confidence-tracker.test.js

# Stage selector tests
npm test tests/unit/stage-selectors.test.js

# Full assessment flow
npm test tests/integration/full-assessment-flow.test.js
```

### Watch Mode (Auto-Rerun on Changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

---

## Unit Tests

### ConfidenceTracker Tests

**File:** `tests/unit/confidence-tracker.test.js`

**Tests:**
- ✅ Initialization with empty dimensions map
- ✅ Creating new dimension on first response
- ✅ Updating existing dimension with additional responses
- ✅ Calculating average score correctly
- ✅ Base confidence calculation from question count (15% per question, max 60%)
- ✅ Consistency bonus for low variance (max 30%)
- ✅ Discrimination bonus (fixed 10%)
- ✅ Maximum confidence cap at 100%
- ✅ Variance calculation (0 for identical, correct formula for varied scores)
- ✅ needsMoreQuestions logic (minimum questions + target confidence)
- ✅ getPriorityDimensions (sorted by confidence gap)
- ✅ getSkippableDimensions (confidence >= 85%, questions >= 2)
- ✅ getSummary (rounded scores, confidence, questionCount)
- ✅ toJSON / fromJSON serialization
- ✅ Edge cases (undefined dimensions, high variance, negative scores)

**Run:**
```bash
npm test tests/unit/confidence-tracker.test.js
```

---

### Stage Selector Tests

**File:** `tests/unit/stage-selectors.test.js`

**Tests:**

#### Stage 1: Broad Screening
- ✅ Returns 12-15 questions
- ✅ Includes all Big Five anchors
- ✅ Includes clinical screeners (PHQ-2, GAD-2)
- ✅ Does not duplicate already asked questions

#### Stage 2: Targeted Building
- ✅ Expands PHQ-9 if PHQ-2 positive (score >= 3)
- ✅ Does NOT expand PHQ-9 if PHQ-2 negative
- ✅ Selects facet questions for Big Five traits
- ✅ Expands GAD-7 if GAD-2 positive

#### Stage 3: Precision Refinement
- ✅ Detects divergent facets (>20 points from trait average)
- ✅ Returns empty array if all confidence high (>85%)
- ✅ Selects precision questions for low-confidence dimensions

#### Stage 4: Gap Filling
- ✅ Fills to exactly 70 questions
- ✅ Returns empty array if already at 70
- ✅ Predicts archetypes correctly:
  - Resilient: high E + high A + low N
  - Undercontrolled: high N + low C
  - Overcontrolled: high C + high A + low O
  - Creative-Extrovert: high O + high E
  - Intellectual-Achiever: high O + high C
  - Balanced: average all traits
- ✅ Finds coverage gaps (missing categories/instruments)

#### MultiStageCoordinator
- ✅ Initializes with all 4 stage selectors
- ✅ Defines correct stage advancement thresholds
- ✅ Stage advancement logic:
  - Stage 1 → 2: After 12-15 questions OR 30% confidence
  - Stage 2 → 3: After 37-42 questions OR 60% confidence
  - Stage 3 → 4: After 55-60 questions OR 75% confidence
- ✅ Stays in Stage 4 (final stage)
- ✅ Calculates average confidence across Big Five
- ✅ Handles missing traits in average calculation
- ✅ Returns appropriate stage messages
- ✅ Identifies skippable dimensions
- ✅ isComplete() at 70 questions
- ✅ getProgress() calculation (current, total, percentage, remaining)

**Run:**
```bash
npm test tests/unit/stage-selectors.test.js
```

---

## Integration Tests

### Full Assessment Flow

**File:** `tests/integration/full-assessment-flow.test.js`

**Tests:**

#### Resilient Profile
- ✅ Reaches exactly 70 questions
- ✅ Progresses through all 4 stages
- ✅ Achieves high confidence across Big Five (>60%)
- ✅ Completes within 30 seconds
- ✅ No duplicate questions

#### Anxious-Undercontrolled Profile
- ✅ Reaches exactly 70 questions
- ✅ Progresses through all 4 stages
- ✅ Expands clinical assessments (PHQ-9, GAD-7 beyond screeners)
- ✅ Identifies high neuroticism
- ✅ Completes assessment

#### Creative-Extrovert Profile
- ✅ Reaches exactly 70 questions
- ✅ Explores openness facets (>=3 questions)
- ✅ Explores extraversion facets (>=3 questions)
- ✅ Achieves high confidence on primary traits

#### Average/Balanced Profile
- ✅ Reaches exactly 70 questions
- ✅ Progresses through all stages
- ✅ Balanced coverage across traits (within 3x distribution)

#### Stage Advancement Logic
- ✅ Stage 1 → 2: After 12-15 questions
- ✅ Stage 2 → 3: After 37-42 questions
- ✅ Reaches Stage 4 before 70 questions

#### Confidence Tracking
- ✅ Confidence increases throughout assessment
- ✅ Tracks all Big Five traits

#### Performance
- ✅ Completes in under 30 seconds
- ✅ Averages less than 400ms per question selection

**Run:**
```bash
npm test tests/integration/full-assessment-flow.test.js
```

**Note:** Integration tests require MongoDB connection.

---

## Synthetic Profiles

**File:** `tests/fixtures/synthetic-profiles.js`

### Available Profiles

1. **Anxious-Undercontrolled**
   - High neuroticism (75), low conscientiousness (30)
   - Elevated depression and anxiety
   - Expected archetype: "undercontrolled"

2. **Resilient**
   - High across all Big Five, low neuroticism (25)
   - No clinical concerns
   - Expected archetype: "resilient"

3. **Creative-Extrovert**
   - Very high openness (85) and extraversion (80)
   - Average other traits
   - Expected archetype: "creative-extrovert"

4. **Overcontrolled**
   - High conscientiousness (80), low openness (35)
   - Elevated anxiety
   - Expected archetype: "overcontrolled"

5. **Intellectual-Achiever**
   - High openness (85) and conscientiousness (85)
   - Average extraversion
   - Expected archetype: "intellectual-achiever"

6. **Average/Balanced**
   - All traits at 50
   - No extreme patterns
   - Expected archetype: "balanced"

7. **Depressed-Withdrawn**
   - High neuroticism (80), low extraversion (25)
   - Severe depression
   - Expected archetype: "undercontrolled"

### Using Profiles in Tests

```javascript
const syntheticProfiles = require('../fixtures/synthetic-profiles');

// Get specific profile
const profile = syntheticProfiles.resilient;

// Generate responses for questions
const responses = syntheticProfiles.generateResponses(profile, questions);

// Get profile by ID
const profile = syntheticProfiles.getProfile('anxious_undercontrolled');

// Get all profiles
const allProfiles = syntheticProfiles.allProfiles;
```

---

## Test Configuration

### Jest Configuration (package.json)

```json
{
  "scripts": {
    "test": "jest tests/unit tests/integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Environment Variables

For integration tests, ensure MongoDB connection:

```bash
# .env or environment variable
MONGODB_URI=mongodb://localhost:27017/neurlyn_test
```

---

## Writing New Tests

### Unit Test Template

```javascript
const MyService = require('../../services/my-service');

describe('MyService', () => {
  let service;

  beforeEach(() => {
    service = new MyService();
  });

  test('should do something', () => {
    const result = service.doSomething();
    expect(result).toBe(expectedValue);
  });

  test('should handle edge case', () => {
    expect(() => service.invalidInput()).toThrow();
  });
});
```

### Integration Test Template

```javascript
const mongoose = require('mongoose');

describe('My Integration Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should perform end-to-end flow', async () => {
    // Test implementation
  });
});
```

---

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Upload coverage
        run: npm run test:coverage
```

---

## Test Coverage Goals

### Current Coverage

- **ConfidenceTracker:** ~90% coverage
- **Stage Selectors:** ~85% coverage
- **MultiStageCoordinator:** ~80% coverage
- **Integration:** 7 synthetic profiles, 4+ scenarios

### Target Coverage

- **Unit Tests:** >=90% for core logic
- **Integration Tests:** All critical paths
- **E2E Tests:** At least one full flow per archetype

---

## Troubleshooting

### Tests Failing with "Cannot find module"

```bash
# Ensure all dependencies installed
npm install
```

### Integration Tests Timing Out

```bash
# Check MongoDB is running
mongod

# Or verify connection string
echo $MONGODB_URI
```

### Jest Watch Mode Not Working

```bash
# Install watchman (macOS/Linux)
brew install watchman  # macOS
# or
sudo apt install watchman  # Linux
```

---

## Next Steps

### Remaining Test Tasks (Phase 5)

1. **Performance Testing**
   - [ ] Benchmark confidence calculation (<10ms)
   - [ ] Benchmark stage selection (<200ms)
   - [ ] Load testing (100+ concurrent assessments)

2. **Additional Test Cases**
   - [ ] Error handling tests
   - [ ] Edge case tests (corrupt data, network failures)
   - [ ] Regression tests for bug fixes

3. **Frontend Testing**
   - [ ] UX component rendering tests
   - [ ] Stage transition animation tests
   - [ ] Progress message tests

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Mongoose Testing](https://mongoosejs.com/docs/jest.html)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Test Suite Status:** ✅ Ready for continuous testing and development
