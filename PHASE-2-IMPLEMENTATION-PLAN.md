# Phase 2 Implementation Plan

**Date:** 2025-10-06
**Status:** READY TO BEGIN
**Timeline:** 3-4 weeks (compressed to ~6 hours for rapid implementation)
**Questions to Add:** 90-110

---

## Overview

Phase 2 builds upon Phase 1's clinical foundation by adding:
1. **Deeper personality assessment** (NEO facet expansion + HEXACO)
2. **Expanded trauma coverage** (ACEs, complex PTSD)
3. **Bipolar spectrum detection** (mania/hypomania screening)
4. **Psychosis screening** (thought disorder assessment)

This transforms Neurlyn into a comprehensive clinical assessment rivaling MMPI-3 and PAI.

---

## Implementation Components

### 1. Expand NEO Facets (60-90 questions)

**Current State:** 3 questions per facet × 30 facets = 90 questions
**Target State:** 5-6 questions per facet × 30 facets = 150-180 questions
**To Add:** 60-90 new questions

**Rationale:**
- Increases reliability (Cronbach's alpha improvement)
- Provides deeper assessment of each facet
- Allows for more nuanced scoring

**Facets to Expand (30 total):**

#### Neuroticism (6 facets)
- N1: Anxiety (3 → 6 questions)
- N2: Angry Hostility (3 → 6 questions)
- N3: Depression (3 → 6 questions)
- N4: Self-Consciousness (3 → 6 questions)
- N5: Impulsiveness (3 → 6 questions)
- N6: Vulnerability (3 → 6 questions)

#### Extraversion (6 facets)
- E1: Warmth (3 → 6 questions)
- E2: Gregariousness (3 → 6 questions)
- E3: Assertiveness (3 → 6 questions)
- E4: Activity (3 → 6 questions)
- E5: Excitement-Seeking (3 → 6 questions)
- E6: Positive Emotions (3 → 6 questions)

#### Openness (6 facets)
- O1: Fantasy (3 → 6 questions)
- O2: Aesthetics (3 → 6 questions)
- O3: Feelings (3 → 6 questions)
- O4: Actions (3 → 6 questions)
- O5: Ideas (3 → 6 questions)
- O6: Values (3 → 6 questions)

#### Agreeableness (6 facets)
- A1: Trust (3 → 6 questions)
- A2: Straightforwardness (3 → 6 questions)
- A3: Altruism (3 → 6 questions)
- A4: Compliance (3 → 6 questions)
- A5: Modesty (3 → 6 questions)
- A6: Tender-Mindedness (3 → 6 questions)

#### Conscientiousness (6 facets)
- C1: Competence (3 → 6 questions)
- C2: Order (3 → 6 questions)
- C3: Dutifulness (3 → 6 questions)
- C4: Achievement Striving (3 → 6 questions)
- C5: Self-Discipline (3 → 6 questions)
- C6: Deliberation (3 → 6 questions)

**Implementation Strategy:**
- Add 3 new questions per facet (complementing existing 3)
- Ensure balance of positive/negative keying
- Maintain cross-trait correlation metadata
- Assign diagnostic weight: 2-3 (moderate)

---

### 2. HEXACO Honesty-Humility (12-18 questions)

**Current State:** Not assessed (missing 6th personality dimension)
**Target State:** 12-18 questions across 4 facets
**To Add:** 12-18 new questions

**HEXACO-H Facets (4 total):**

#### H1: Sincerity (3-5 questions)
- Genuine vs. manipulative
- Authenticity in self-presentation
- Avoidance of flattery/deception

#### H2: Fairness (3-5 questions)
- Avoiding cheating/rule-breaking
- Entitlement vs. fairness
- Willingness to follow societal rules

#### H3: Greed Avoidance (3-4 questions)
- Material vs. non-material values
- Disinterest in wealth/status
- Generosity with resources

#### H4: Modesty (3-4 questions)
- Humility vs. grandiosity
- Realistic self-appraisal
- Lack of entitlement

**Rationale:**
- HEXACO-H predicts unique variance beyond Big Five
- Strong predictor of counterproductive work behavior
- Inversely related to psychopathy, Machiavellianism
- Important for integrity/honesty assessment

**Implementation Strategy:**
- Create 3-5 questions per facet
- Use standard 1-5 Likert scale
- Category: `personality`
- Subcategory: `hexaco_honesty_humility`
- Tags: `hexaco`, `honesty_humility`, `h1`/`h2`/`h3`/`h4`
- Diagnostic weight: 3 (moderate-high)

---

### 3. Expand Trauma Assessment (13-18 questions)

**Current State:** 12 trauma screening questions
**Target State:** 25-30 total trauma questions
**To Add:** 13-18 new questions

**Components:**

#### A. ACEs (Adverse Childhood Experiences) - 10 questions
Standard ACEs categories:
1. Abuse (3 questions)
   - Physical abuse
   - Emotional abuse
   - Sexual abuse

2. Neglect (2 questions)
   - Physical neglect
   - Emotional neglect

3. Household Dysfunction (5 questions)
   - Substance abuse in household
   - Mental illness in household
   - Incarcerated household member
   - Mother treated violently
   - Parental separation/divorce

**Scoring:** Binary (Yes/No), total score 0-10

#### B. Complex PTSD Indicators (8-10 questions)
Beyond standard PTSD (already in Phase 1):
1. Emotion Dysregulation (3 questions)
   - Difficulty controlling emotions
   - Emotional numbing
   - Dissociation

2. Negative Self-Concept (3 questions)
   - Persistent shame/guilt
   - Feelings of worthlessness
   - Feeling permanently damaged

3. Interpersonal Difficulties (2-4 questions)
   - Difficulty trusting others
   - Avoidance of relationships
   - Feeling different from others

**Rationale:**
- ACEs strongly predict adult mental health outcomes
- Complex PTSD requires different treatment than PTSD
- ICD-11 now recognizes Complex PTSD as distinct diagnosis

**Implementation Strategy:**
- ACEs: Binary response format (Yes/No)
- Complex PTSD: 1-5 Likert scale
- Category: `trauma_screening`
- Subcategory: `aces` or `complex_ptsd`
- Tags: `trauma`, `childhood_adversity`, `complex_ptsd`
- Diagnostic weight: 4 (high)

---

### 4. Mania/Hypomania Screening (10-12 questions)

**Current State:** Not assessed
**Target State:** 10-12 questions screening bipolar spectrum
**To Add:** 10-12 new questions

**Based on:** Mood Disorder Questionnaire (MDQ) + clinical extensions

**Components:**

#### A. MDQ Core Items (7 questions)
1. Elevated/irritable mood
2. More self-confident than usual
3. Less need for sleep
4. More talkative than usual
5. Thoughts racing
6. Easily distracted
7. Increased activity/energy

#### B. Additional Bipolar Indicators (3-5 questions)
8. Increased goal-directed activity
9. Excessive involvement in pleasurable activities (high risk)
10. Mood shifts (rapid cycling)
11. Post-episode depression (crash)
12. Consequences/impairment from elevated mood

**Response Format:**
- Items 1-11: Binary (Yes/No) or frequency scale
- Item 12: Severity scale (None to Severe)

**Scoring:**
- MDQ positive screen: ≥7 "Yes" answers + co-occurrence + moderate-severe impairment
- Additional clinical scoring for severity levels

**Rationale:**
- Bipolar disorder often misdiagnosed as unipolar depression
- Critical for treatment planning (antidepressants can trigger mania)
- MDQ has 73% sensitivity, 90% specificity in clinical samples

**Implementation Strategy:**
- Use MDQ validated wording
- Category: `clinical_psychopathology`
- Subcategory: `mania` or `mood_elevation`
- Tags: `mania`, `hypomania`, `bipolar`, `mdq`
- Diagnostic weight: 4-5 (high)
- Pathway: `mania_screening` (activate if triggers present)

---

### 5. Thought Disorder Screening (15-18 questions)

**Current State:** Not assessed
**Target State:** 15-18 questions screening psychotic spectrum
**To Add:** 15-18 new questions

**Based on:** Prodromal Questionnaire-Brief (PQ-B) + clinical extensions

**Components:**

#### A. Positive Symptoms (6-7 questions)
1. Perceptual abnormalities
   - Unusual perceptual experiences
   - Hearing voices/sounds
   - Visual distortions

2. Delusional ideation
   - Paranoid beliefs
   - Ideas of reference
   - Grandiose beliefs

3. Unusual thought content
   - Magical thinking
   - Thought broadcasting
   - Thought insertion

#### B. Negative Symptoms (4-5 questions)
4. Avolition (lack of motivation)
5. Anhedonia (diminished pleasure)
6. Alogia (poverty of speech)
7. Affective flattening
8. Social withdrawal

#### C. Disorganization (4-5 questions)
9. Disorganized speech/thought
10. Tangential thinking
11. Difficulty organizing thoughts
12. Confused/bizarre behavior

#### D. Distress/Impairment (1 question)
13. How much distress do these experiences cause?

**Response Format:**
- Part 1: Binary (Yes/No) - Have you experienced this?
- Part 2: Distress scale (1-5) - If yes, how much distress?

**Scoring:**
- PQ-B positive screen: ≥6 "Yes" answers + moderate-severe distress
- Separate scoring for positive, negative, disorganization domains

**Rationale:**
- Early detection of psychosis critical for intervention
- Prodromal symptoms can precede psychosis by months/years
- PQ-B has 87% sensitivity, 87% specificity for psychosis risk

**Implementation Strategy:**
- Use PQ-B validated items
- Category: `clinical_psychopathology`
- Subcategory: `psychotic_spectrum` or `thought_disorder`
- Tags: `psychosis`, `thought_disorder`, `pq_b`, `positive_symptoms`, `negative_symptoms`
- Diagnostic weight: 5 (highest - critical)
- Pathway: `psychosis_screening` (activate if triggers present)

---

## Implementation Tasks

### Task 1: Schema Updates
**File:** `models/QuestionBank.js`

Add subcategories if needed:
- `hexaco_honesty_humility` (for HEXACO-H)
- `complex_ptsd` (for trauma expansion)
- `aces` (for childhood adversity)
- `mania` / `mood_elevation` (for bipolar screening)
- `psychotic_spectrum` / `thought_disorder` (for psychosis)

### Task 2: Question Creation
**File:** `scripts/seed-phase2-questions.js`

Create comprehensive seeding script with:
1. 60-90 NEO facet expansion questions
2. 12-18 HEXACO Honesty-Humility questions
3. 13-18 trauma expansion questions (ACEs + Complex PTSD)
4. 10-12 mania/hypomania questions
5. 15-18 thought disorder questions

**Total:** 110-156 new questions

### Task 3: Scoring Services
Create new scoring modules:

#### A. `services/mania-scorer.js`
- MDQ calculation
- Severity assessment
- Bipolar subtype indication (BP-I vs BP-II)
- Treatment recommendations

#### B. `services/psychosis-scorer.js`
- PQ-B calculation
- Positive/negative/disorganization subscales
- Risk level assessment
- Referral recommendations

#### C. `services/aces-calculator.js`
- ACEs total score (0-10)
- Risk stratification (0-3: Low, 4-6: Moderate, 7-10: High)
- Impact on mental health outcomes
- Trauma-informed care recommendations

#### D. `services/hexaco-scorer.js`
- Honesty-Humility total score
- Facet scoring (Sincerity, Fairness, Greed Avoidance, Modesty)
- Integration with Big Five profile
- Integrity/honesty indicators

### Task 4: Adaptive Selector Enhancement
**File:** `services/comprehensive-adaptive-selector.js`

Add new pathways:
1. `personality_facets_deep` - Expanded NEO facets (increase allocation)
2. `hexaco_honesty` - HEXACO-H assessment
3. `trauma_deep` - ACEs + Complex PTSD
4. `mania_screening` - Bipolar spectrum
5. `psychosis_screening` - Thought disorder

Update trigger logic:
- Mania triggers: High extraversion + high neuroticism + low conscientiousness
- Psychosis triggers: High openness (unusual experiences) + low reality testing
- Trauma deep triggers: Initial trauma screening positive
- HEXACO triggers: Based on agreeableness/conscientiousness patterns

### Task 5: Update Diagnostic Weights
**File:** `scripts/update-diagnostic-weights-phase2.js`

Assign weights to new questions:
- NEO expansion: 2-3 (moderate)
- HEXACO: 3 (moderate-high)
- ACEs: 4 (high)
- Complex PTSD: 4 (high)
- Mania: 4-5 (high to critical)
- Psychosis: 5 (critical)

### Task 6: Documentation
Create comprehensive documentation:
- `PHASE-2-IMPLEMENTATION-COMPLETE.md`
- Update system architecture diagrams
- Clinical validation documentation
- Usage examples for new pathways

---

## Expected Outcomes

### Database Growth
- **Before Phase 2:** 362 questions
- **After Phase 2:** 472-518 questions
- **Growth:** +110-156 questions (+30-43%)

### New Capabilities
1. ✅ **Comprehensive personality assessment** (Big Five + HEXACO)
2. ✅ **Bipolar spectrum detection** (MDQ-based)
3. ✅ **Psychosis risk screening** (PQ-B-based)
4. ✅ **Trauma-informed assessment** (ACEs + Complex PTSD)
5. ✅ **Enhanced NEO facet reliability** (5-6 items per facet)

### Clinical Utility Expansion
After Phase 2, Neurlyn can screen for:
- All Phase 1 conditions (depression, anxiety, substance use, etc.)
- **Bipolar I/II Disorder** (mania screening)
- **Psychotic Spectrum Disorders** (thought disorder screening)
- **Complex PTSD** (beyond standard PTSD)
- **Childhood Trauma Impact** (ACEs)
- **Integrity/Honesty** (HEXACO-H)

---

## Quality Assurance

### Clinical Validation
- MDQ: 73% sensitivity, 90% specificity (Hirschfeld et al., 2000)
- PQ-B: 87% sensitivity, 87% specificity (Loewy et al., 2011)
- ACEs: Validated extensively (Felitti et al., 1998)
- HEXACO-H: Strong psychometric properties (Lee & Ashton, 2018)
- NEO expansion: Increases Cronbach's alpha from ~0.70 to ~0.85

### Safety Considerations
1. **Psychosis screening flags** - Immediate referral recommendations
2. **Mania screening alerts** - Treatment contraindications (e.g., antidepressants)
3. **ACEs trauma-informed** - Sensitive presentation of childhood trauma questions
4. **Crisis resources** - Appropriate referrals for high-risk presentations

---

## Timeline (Compressed Implementation)

**Total Estimated Time:** ~6-8 hours

1. **Schema Updates** - 15 minutes
2. **NEO Facet Questions** - 2 hours (60-90 questions)
3. **HEXACO Questions** - 45 minutes (12-18 questions)
4. **Trauma Expansion** - 1 hour (13-18 questions)
5. **Mania Screening** - 45 minutes (10-12 questions)
6. **Psychosis Screening** - 1 hour (15-18 questions)
7. **Scoring Services** - 2 hours (4 new services)
8. **Adaptive Selector** - 1 hour (pathway integration)
9. **Documentation** - 30 minutes

---

## Success Criteria

- [ ] All 110-156 new questions created and seeded
- [ ] 4 new scoring services implemented
- [ ] 5 new adaptive pathways integrated
- [ ] 100% diagnostic weight coverage maintained
- [ ] Clinical validation sources documented
- [ ] Safety protocols implemented for high-risk screens
- [ ] Comprehensive documentation completed

---

## Next Steps

1. Update QuestionBank schema for new subcategories
2. Create seed-phase2-questions.js script
3. Implement scoring services (mania, psychosis, ACEs, HEXACO)
4. Enhance adaptive selector with new pathways
5. Update diagnostic weights
6. Create comprehensive documentation
7. (Optional) Create Phase 2 test suite

---

**Phase 2 Status:** ⏳ READY TO BEGIN

**Estimated Completion:** ~6-8 hours from start

**Impact:** Transforms Neurlyn into comprehensive clinical assessment system rivaling industry-leading tools (MMPI-3, PAI)
