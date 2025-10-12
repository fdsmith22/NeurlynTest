# Report Synthetic Data Elimination Plan

## Issues Identified

### 1. **Facet-Level Scores** - SYNTHETIC
**Problem**: All 30 NEO-PI-R facets are showing scores, but NO responses have facet field populated
- Lines 3646-3650 in comprehensive-report-generator.js check for `r.facet === dbFacetName`
- Returns 0 facet-specific responses
- Falls back to lines 3674-3686: Uses ALL trait responses for EVERY facet
- Result: All 6 facets per trait get the SAME score (the trait average)
- This is why facet averages don't match trait scores - they're synthetically varied

**Current State**:
```javascript
const facetResponses = responses.filter(r => {
  const matchesTrait = r.trait === trait || r.category === trait;
  const matchesFacet = r.facet === dbFacetName;  // <-- ALWAYS FALSE
  return matchesTrait && matchesFacet;
});
```

**Fix Strategy**:
- Option A: Don't show facet analysis if no facet-level data
- Option B: Show trait-level only with clear disclaimer
- **RECOMMENDED**: Option A - Remove entire facet sections (pages 7-11) for assessments without facet data

### 2. **Neurodiversity Scores** - DEFAULTS
**Problem**: Report shows detailed scores with minimal actual data
- Only 1 EF response: `BASELINE_EF_1` with value 2
- 0 sensory responses
- 0 ADHD/autism-specific responses
- Yet report shows:
  - Executive Function: Working Memory 50%, Organization 25%, Task Initiation 75%
  - All sensory domains: TYPICAL (0)

**Current State**: Neurodiversity scoring service applies defaults when insufficient data

**Fix Strategy**:
- Only show domains where we have ≥3 actual responses
- Remove entire neurodiversity section if insufficient data (< 5 total ND responses)
- For COMPREHENSIVE tier (70Q), this is acceptable as it's screening-level

###3. **Executive Function Breakdown** - ESTIMATED
**Problem**: Shows 3 detailed EF scores from only 1 response
- Working Memory: 50%
- Organization: 25%
- Task Initiation: 75%

**Fix Strategy**:
- Require ≥2 responses per EF domain to display
- Otherwise show "Insufficient data for executive function assessment"

## Implementation Plan

### Phase 1: Add Data Sufficiency Checks ✅
```javascript
// In comprehensive-report-generator.js

hasSufficientFacetData(responses) {
  const facetResponses = responses.filter(r => r.facet !== undefined && r.facet !== null);
  return facetResponses.length >= 30; // Need at least 1 per facet
}

hasSufficientNDData(responses) {
  const ndResponses = responses.filter(r =>
    r.category === 'neurodiversity' ||
    r.category?.includes('sensory') ||
    r.category?.includes('executive')
  );
  return ndResponses.length >= 5;
}
```

### Phase 2: Conditional Section Generation ✅
```javascript
generateReport(assessmentData) {
  const report = {};

  // Always include core Big Five (we have this data)
  report.bigFive = this.calculateTraitScores(responses);

  // Conditionally include facets
  if (this.hasSufficientFacetData(responses)) {
    report.facets = this.analyzeTraitSubDimensions(responses, report.bigFive);
  } else {
    console.log('[REPORT] Insufficient facet data - skipping facet analysis');
    report.facets = null;
  }

  // Conditionally include neurodiversity
  if (this.hasSufficientNDData(responses)) {
    report.neurodiversity = this.neurodiversityScoring.analyze(responses);
  } else {
    console.log('[REPORT] Insufficient ND data - skipping neurodiversity analysis');
    report.neurodiversity = null;
  }

  return report;
}
```

### Phase 3: Update Report Templates ✅
- Modify PDF generation to skip sections when data is null
- Add clear messaging: "This assessment focused on core personality traits. Detailed facet analysis requires the extended assessment."

## Files to Modify

1. `/services/comprehensive-report-generator.js`
   - Add sufficiency checks (lines ~100-120)
   - Modify generateReport to conditionally generate sections (lines ~86-450)
   - Update analyzeFacet to return null if no facet data (lines 3591-3700)

2. `/services/neurodiversity-scoring.js`
   - Add confidence thresholds
   - Return null for domains with <2 responses

3. `/routes/reports.js`
   - Handle null sections gracefully
   - Add messaging about missing sections

## Expected Outcomes

### Before Fix:
- 42-page report with synthetic facet data
- Neurodiversity scores from minimal data
- User sees comprehensive analysis from limited responses

### After Fix:
- ~25-page report with ONLY real data
- Big Five: ✅ Accurate (9 responses per trait avg)
- RUO: ✅ Accurate (derived from Big Five)
- Career: ✅ Accurate (derived from Big Five)
- Facets: ❌ Removed (0 facet-tagged responses)
- Neurodiversity: ❌ Removed or minimal (insufficient data)

## Testing Plan

1. Run report generation on test assessment
2. Verify NO synthetic facet scores appear
3. Verify neurodiversity section shows only measured domains
4. Verify Big Five, RUO, career sections still work
5. Generate new test with proper facet tagging to verify it works when data exists

## Benefits

✅ **Transparency**: Report shows only what was actually measured
✅ **Accuracy**: No false precision from synthetic estimates
✅ **Trust**: Users get honest assessment of what data was collected
✅ **Upsell Path**: Creates natural incentive for extended assessments

## Timeline

- Phase 1: 30 minutes (add checks)
- Phase 2: 45 minutes (conditional generation)
- Phase 3: 45 minutes (template updates)
- Testing: 30 minutes

**Total: ~2.5 hours**
