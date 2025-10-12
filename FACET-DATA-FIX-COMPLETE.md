# Facet Data Flow - Critical Fix Complete

## Problem Identified

### Question Bank Analysis
- **Total Questions**: 617
- **Questions WITH facet field**: ~495 (80%)
  - Examples: NEO_FACET questions have facets like "fantasy", "aesthetics", "feelings", "actions"
  - HEXACO questions have facets like "sincerity", "fairness", "greed_avoidance", "modesty"
- **Questions WITHOUT facet field**: ~122 (20%)
  - Examples: BASELINE questions (BASELINE_OPENNESS_1, etc.)

### The Critical Bug

**Facet data existed in the question bank but was NOT being copied to responses:**

#### Test Assessment Analysis (`ADAPTIVE_1759950799594_to5uj5v30`):
- Total responses: 70
- Responses with facet field: **0/70** ❌
- Questions in DB with facet: **34/70** ✓
- **Data loss**: 34 facets worth of data completely lost!

#### Example of Lost Data:
```
Question: HEXACO_H1_1
  DB has facet: "sincerity"
  Response has facet: undefined  ← BUG!

Question: NEO_FACET_1004
  DB has facet: "aesthetics"
  Response has facet: undefined  ← BUG!
```

## Root Cause

### Location 1: Batch Response Saving (`routes/adaptive-assessment.js:310-340`)

**BEFORE (Buggy Code)**:
```javascript
// Line 312-313: Fetch questions from DB
const fullQuestions = await QuestionBank.find({ questionId: { $in: questionIds } });
const questionMap = new Map(fullQuestions.map(q => [q.questionId, q]));

for (const resp of responses) {
  // BUG: questionMap created but NEVER USED!
  // resp.question is undefined, so facet is always undefined

  assessment.responses.push({
    questionId: resp.questionId,
    value: resp.answer || resp.value,
    facet: resp.question?.facet || resp.facet,  // ← Always undefined!
    // ...
  });
}
```

**AFTER (Fixed Code)**:
```javascript
// Line 312-313: Fetch questions from DB
const fullQuestions = await QuestionBank.find({ questionId: { $in: questionIds } });
const questionMap = new Map(fullQuestions.map(q => [q.questionId, q]));

for (const resp of responses) {
  // FIX: Attach full question data from DB
  resp.question = questionMap.get(resp.questionId);  // ← NOW HAS DATA!

  assessment.responses.push({
    questionId: resp.questionId,
    value: resp.answer || resp.value,
    facet: resp.question?.facet || resp.facet,  // ← Now correctly populated!
    // ...
  });
}
```

### Location 2: Final Response Saving (`routes/adaptive-assessment.js:793-818`)

**BEFORE (Buggy Code)**:
```javascript
newResponses.forEach(response => {
  assessment.responses.push({
    questionId: response.questionId,
    value: response.value,
    category: response.category,  // ← No facet field at all!
    traits: response.traits,
    score: convertResponseToScore(response.value)
  });
});
```

**AFTER (Fixed Code)**:
```javascript
// FIX: Fetch question data to include facet fields
if (newResponses.length > 0) {
  const finalQuestionIds = newResponses.map(r => r.questionId);
  const finalQuestions = await QuestionBank.find({ questionId: { $in: finalQuestionIds } });
  const finalQuestionMap = new Map(finalQuestions.map(q => [q.questionId, q]));

  newResponses.forEach(response => {
    const question = finalQuestionMap.get(response.questionId);
    assessment.responses.push({
      questionId: response.questionId,
      value: response.value,
      category: question?.category || response.category,
      facet: question?.facet || response.facet,  // ← Now included!
      trait: question?.trait || response.trait,
      instrument: question?.instrument || response.instrument,
      // ...
    });
  });
}
```

## Impact on Report Generation

### Before Fix:
```javascript
// In comprehensive-report-generator.js
const facetResponses = responses.filter(r => {
  const matchesTrait = r.trait === trait || r.category === trait;
  const matchesFacet = r.facet === dbFacetName;  // ← ALWAYS FALSE (facet undefined)
  return matchesTrait && matchesFacet;
});
// Result: facetResponses.length = 0 for ALL facets
// Fallback: Use trait average for ALL facets (synthetic data!)
```

### After Fix:
```javascript
// With properly populated facet fields:
const facetResponses = responses.filter(r => {
  const matchesTrait = r.trait === trait || r.category === trait;
  const matchesFacet = r.facet === dbFacetName;  // ← NOW MATCHES when facet exists!
  return matchesTrait && matchesFacet;
});
// Result: facetResponses.length > 0 for facets with data
// Real calculation: Use actual facet-specific responses!
```

## Files Modified

1. **`routes/adaptive-assessment.js`** (Lines 316-317, 797-818)
   - Added `resp.question = questionMap.get(resp.questionId)` to attach question metadata
   - Added question fetching and facet field to final responses

## Testing Requirements

### New Assessment Test:
1. Start new COMPREHENSIVE assessment (70Q)
2. Complete assessment
3. Check responses in database:
   ```javascript
   const session = await AssessmentSession.findOne({ sessionId: 'NEW_SESSION_ID' });
   const withFacet = session.responses.filter(r => r.facet).length;
   console.log(`Responses with facet: ${withFacet}/70`);
   // Expected: ~34/70 (matching questions that have facets in DB)
   ```

4. Generate report:
   ```bash
   curl -X POST http://localhost:3000/api/reports/generate \
     -H "Content-Type: application/json" \
     -d '{"sessionId": "NEW_SESSION_ID"}'
   ```

5. Verify facet analysis in report:
   - Check `report.personality.subDimensions`
   - Should show real facet scores (not synthetic trait averages)
   - Data sufficiency check should show: `Facet Analysis: ENABLED` if ≥15 facet responses

## Expected Outcomes

### Immediate Impact:
- ✅ Facet data now preserved from question bank to responses
- ✅ ~34 facet-level datapoints per 70Q assessment (vs 0 before)
- ✅ Report generator can now access real facet data

### Report Quality Improvement:
- **BEFORE**: All facet scores were synthetic (trait averages)
- **AFTER**: Facet scores calculated from actual facet-tagged questions

### Data Integrity:
- **BEFORE**: 48% data loss (34/70 questions losing facet metadata)
- **AFTER**: 0% data loss - all metadata preserved

## Next Steps

1. ✅ Backend restarted with fixes (PID 2765215)
2. ⏳ Test with new assessment to verify facet flow
3. ⏳ Update report generator logic if needed for new facet data structure
4. ⏳ Update data sufficiency thresholds based on actual facet availability

## Technical Debt Resolved

This fix resolves a critical data integrity issue where:
- Question metadata (facets) existed in the database
- But was lost during response storage
- Causing report generation to use synthetic fallback data
- Now all metadata flows correctly from questions → responses → reports
