# Tactful Baseline Assessment Redesign
**Date**: 2025-10-07
**Issue**: Assessment asks deeply personal clinical questions too abruptly without proper context or indirect probing

---

## 🚨 Current Problems

### From Latest Test Run
Looking at server logs, the assessment asked these questions **in the first 30 questions**:
1. **Q9**: DEPRESSION_PHQ9_1 - "How often have you had little interest or pleasure in doing things?"
2. **Q10**: CPTSD_DYSREG_1 - "I have difficulty controlling my emotions..."
3. **Q20**: ANXIETY_GAD7_1 - "How often have you been feeling nervous, anxious or on edge?"
4. **Q22**: MANIA_MDQ_1 - "Has there ever been a period when you felt so good or hyper..."
5. **Q28**: PSYCHOSIS_PQB_1 - "I have heard sounds or voices that other people cannot hear"
6. **Q35**: ANXIETY_PTSD_1 - "I have experienced or witnessed a traumatic event"
7. **Q36**: ACES_ABUSE_PHYSICAL - **"Did a parent or adult hit, beat, or physically harm you?"**

### Why This Is Bad
1. **Poor UX**: User hasn't warmed up to the assessment yet
2. **Low validity**: People won't answer honestly when surprised
3. **High dropout risk**: Invasive questions cause abandonment
4. **Clinically inappropriate**: Real clinicians build rapport first
5. **Potentially harmful**: Can be triggering without context
6. **Wasteful**: Asking everyone about psychosis/mania when only ~2% need it

---

## ✅ Best Practices from Clinical Psychology

### The "Funnel Approach" (APA Guidelines)
1. **Broad → Specific**: Start with general life questions, narrow to symptoms
2. **Mild → Severe**: Ask about common experiences before rare/severe ones
3. **Indirect → Direct**: Probe gently before asking explicit questions
4. **Context → Question**: Always provide framing for sensitive topics

### Research-Based Question Ordering (Tourangeau & Yan, 2007)
- **Sensitive questions should come LATE** in surveys (after rapport established)
- **Gradual escalation** reduces refusal rates by 40%
- **Contextual framing** increases honest disclosure by 35%

### Example: PHQ-9 Depression Screener
**❌ BAD** (Current approach):
> Q9: "Over the past two weeks, how often have you had little interest or pleasure in doing things?"

**✅ GOOD** (Tactful approach):
> Q8: "How satisfied are you with your energy levels lately?" (screening question)
> - If answer suggests low energy →
> Q25: "Everyone has ups and downs. The next few questions explore mood patterns - they help us understand your emotional baseline."
> Q26: "Over the past two weeks, how often have you felt low in mood or less interested in activities you normally enjoy?"

---

## 🎯 Proposed Solution: 3-Tier Question System

### **TIER 1: Gentle Baseline Probing (Questions 1-15)**
Indirect questions that *hint* at clinical issues without being invasive.

#### Emotional Wellbeing (Depression/Anxiety Signals)
- "How satisfied are you with your energy levels lately?" (1-5 scale)
  - *Detects*: Low energy (depression signal)
- "How would you rate your overall life satisfaction right now?" (1-5 scale)
  - *Detects*: General distress
- "How well have you been sleeping recently?" (1-5 scale)
  - *Detects*: Sleep disturbance (depression/anxiety signal)
- "When something stressful happens, how quickly do you usually bounce back?" (1-5 scale)
  - *Detects*: Resilience vs. vulnerability

#### Focus & Organization (ADHD/EF Signals)
- "I start tasks right away rather than procrastinating" (Already have: BASELINE_EF_1)
- "How often do you lose track of important items like keys or phone?" (1-5 scale)
  - *Detects*: Inattention
- "I find it easy to stay focused during long meetings or lectures" (1-5 scale)
  - *Detects*: Sustained attention issues

#### Social Comfort (Autism/Social Anxiety Signals)
- "I find it difficult to understand unwritten social rules" (Already have: BASELINE_SOCIAL_1)
- "After social events, I usually feel energized / drained" (choice)
  - *Detects*: Social energy patterns
- "How comfortable are you making small talk with strangers?" (1-5 scale)
  - *Detects*: Social anxiety vs. introversion

#### Sensory Comfort (Sensory Processing/Autism Signals)
- "I find crowded or noisy environments overwhelming" (Already have: BASELINE_SENSORY_1)
- "I'm sensitive to textures in clothing or food" (1-5 scale)
  - *Detects*: Tactile/oral sensitivity

#### Stress & Coping (Trauma/Emotion Regulation Signals)
- "I adapt well when changes occur in my life" (resilience)
  - *Detects*: Rigidity/trauma response
- "My emotions change very quickly throughout the day" (1-5 scale)
  - *Detects*: Emotional dysregulation (BPD/trauma signal)

---

### **TIER 2: Conditional Clinical Screening (Questions 16-50)**
Only ask if Tier 1 signals suggest relevance. Always provide context.

#### Example: Depression Screener (PHQ-9)
**Trigger Logic**:
```javascript
if (lowEnergy >= 4 || lowMood >= 4 || lowLifeSatisfaction <= 2) {
  // Provide context
  showContext("Everyone experiences emotional ups and downs. The next few questions help us understand your mood patterns over the past couple weeks.");

  // Ask PHQ-9 (but reworded to be gentler)
  askQuestions(PHQ9_GENTLE);
}
```

**Gentle PHQ-9 Rewording**:
- ❌ "Little interest or pleasure in doing things"
- ✅ "How often have you felt less interested in activities you normally enjoy?"

- ❌ "Feeling down, depressed, or hopeless"
- ✅ "How often have you felt low in mood or less hopeful about the future?"

#### Example: Anxiety Screener (GAD-7)
**Trigger Logic**:
```javascript
if (worryScore >= 4 || stressResponse <= 2 || sleepIssues >= 4) {
  showContext("Many people experience worry or tension at times. Let's explore how you typically respond to stressful situations.");
  askQuestions(GAD7_GENTLE);
}
```

#### Example: ADHD Screener (ASRS)
**Trigger Logic**:
```javascript
if (organizationScore <= 2 || focusScore <= 2 || loseItemsFrequency >= 4) {
  showContext("Everyone has different ways of staying organized and focused. These questions help us understand your natural attention and planning style.");
  askQuestions(ASRS_V1);
}
```

---

### **TIER 3: Deep Clinical Assessment (Questions 51-70)**
Only for users with **strong signals** from Tier 2. Provide extensive context and normalize.

#### Example: Trauma Screening (ACEs)
**Trigger Logic**:
```javascript
if (
  (PTSDsymptoms >= 3) ||
  (emotionalDysregulation >= 4) ||
  (dissociationSignals >= 3) ||
  (userAge < 25 && multipleRiskFactors)
) {
  showContext(
    "Some people have experienced difficult or challenging situations earlier in life. " +
    "Research shows that understanding these experiences can be helpful for personal growth. " +
    "The next questions are about early life experiences. You can skip any that feel too personal."
  );

  // Start with GENTLE questions
  askQuestion("Did you grow up in a supportive household environment?"); // Indirect

  // Only if answer suggests issues, ask specific ACEs
  if (householdNotSupportive) {
    askQuestion("Were there adults in your childhood who made you feel safe and valued?"); // Still gentle

    // ONLY if multiple red flags, ask the direct ACEs questions
    if (multipleTraumaSignals >= 3) {
      showContext("Thank you for sharing. A few more specific questions help us understand your background.");
      askQuestions(ACES_DIRECT); // The hard questions come LAST
    }
  }
}
```

**Key Principle**: **Nested conditional questions**
- Don't jump straight to "were you beaten as a child"
- Ask "did you feel safe growing up?" first
- Only drill deeper if answer suggests trauma

#### Example: Psychosis Screening (PQ-B)
**Trigger Logic**:
```javascript
if (
  (maniaSymptoms >= 2 && severityHigh) ||
  (dissociationScore >= 4) ||
  (userReportedHallucinations) // from free text
) {
  showContext(
    "Everyone perceives the world differently. Some people have unique sensory or perceptual experiences. " +
    "These questions explore the full range of human perception - there are no 'wrong' answers."
  );
  askQuestions(PQB_SCREENER);
}
else {
  // Skip entirely - only ~2% of population needs psychosis screening
  skipPsychosisQuestions();
}
```

---

## 📊 Proposed New Baseline Question Set

### Replace Current 10 "Baseline" Questions With:

| # | Question | Category | Signal Detection |
|---|----------|----------|------------------|
| 1 | "When I discover a hidden path while walking, I usually..." | O (Fantasy) | Baseline |
| 2 | "My workspace naturally stays organized without much effort" | C (Order) | EF/ADHD signal |
| 3 | "After a long week, a crowded party sounds perfect / draining" | E (Gregariousness) | Social energy |
| 4 | "I find it difficult to understand unwritten social rules" | A (Social) | Autism signal |
| 5 | "I find it satisfying when someone who wronged me faces consequences" | A (Forgiveness) | Baseline |
| 6 | **"How satisfied are you with your energy levels lately?"** | **Depression signal** | Low energy → PHQ-9 |
| 7 | **"How well have you been sleeping recently?"** | **Anxiety/Depression signal** | Sleep issues → GAD-7/PHQ-9 |
| 8 | "I start tasks right away rather than procrastinating" | C (Self-discipline) | EF/ADHD signal |
| 9 | **"How often do you lose track of important items?"** | **ADHD signal** | High loss → ASRS |
| 10 | **"How satisfied are you with your life overall right now?"** | **General distress** | Low satisfaction → clinical |
| 11 | "I wouldn't use flattery to get a raise or promotion" | H (HEXACO) | Baseline |
| 12 | "I find crowded or noisy environments overwhelming" | Sensory | Auditory/autism signal |
| 13 | **"When something stressful happens, I usually bounce back quickly"** | **Resilience** | Low resilience → trauma screen |
| 14 | **"My emotions tend to change quickly throughout the day"** | **Emotion regulation** | High variability → BPD/trauma |
| 15 | "I adapt well when changes occur in my life" | Resilience | Trauma/rigidity signal |

### Key Improvements:
✅ **No direct clinical questions in first 15**
✅ **Indirect probing** for depression (energy, sleep, life satisfaction)
✅ **Natural flow** - feels like personality test, not medical exam
✅ **Signal detection** - each question serves dual purpose
✅ **Better UX** - user builds trust before heavy questions

---

## 🧠 Intelligent Selector Logic Enhancement

### Current Problem:
The intelligent selector is treating all questions as equally "askable" in early phases.

### Solution: Question Metadata Tagging

Add to each question in database:
```javascript
{
  questionId: "ACES_ABUSE_PHYSICAL",
  text: "Before age 18, did a parent...",

  // NEW FIELDS:
  sensitivity: "EXTREME", // NONE, LOW, MODERATE, HIGH, EXTREME
  clinicalDomain: "trauma",
  requiredSignals: {
    minQuestionCount: 40, // Don't ask until 40+ questions answered
    requiredPhase: "deepening", // Only in deepening/precision/completion phases
    triggerConditions: [
      { dimension: "emotionalDysregulation", minScore: 4 },
      { dimension: "ptsdSymptoms", minScore: 3 },
      { dimension: "depressionSeverity", minLevel: "moderate" }
    ],
    anyOf: false // ALL conditions must be met (not just one)
  },

  contextMessage: "Some people have experienced difficult situations in childhood. Research shows understanding these experiences can be helpful. You can skip any questions that feel too personal.",

  gentleIntroQuestions: [
    "CHILDHOOD_SAFETY_1", // "Did you feel safe and supported growing up?"
    "CHILDHOOD_SUPPORT_2"  // "Were there adults who made you feel valued?"
  ]
}
```

### Updated Selector Logic:

```javascript
// In services/intelligent-question-selector.js

async selectNextQuestion(session, responses) {
  const questionPool = await this.getAvailableQuestions(session);

  // FILTER OUT sensitive questions that don't meet criteria
  const appropriateQuestions = questionPool.filter(q => {
    // Skip extremely sensitive questions early on
    if (session.questionCount < 20 && q.sensitivity === "EXTREME") {
      console.log(`[Selector] Skipping ${q.questionId} - too early for EXTREME sensitivity`);
      return false;
    }

    if (session.questionCount < 30 && q.sensitivity === "HIGH") {
      console.log(`[Selector] Skipping ${q.questionId} - too early for HIGH sensitivity`);
      return false;
    }

    // Check if trigger conditions are met
    if (q.requiredSignals && !this.checkTriggerConditions(session, q.requiredSignals)) {
      console.log(`[Selector] Skipping ${q.questionId} - trigger conditions not met`);
      return false;
    }

    return true;
  });

  // Now score and select from appropriate questions
  const scoredQuestions = appropriateQuestions.map(q => ({
    question: q,
    score: this.calculateQuestionScore(q, session)
  }));

  return this.selectBestQuestion(scoredQuestions);
}

checkTriggerConditions(session, requiredSignals) {
  const { minQuestionCount, requiredPhase, triggerConditions, anyOf } = requiredSignals;

  // Check minimum questions
  if (session.questionCount < minQuestionCount) return false;

  // Check phase
  if (requiredPhase && session.phase !== requiredPhase) return false;

  // Check trigger conditions
  if (!triggerConditions || triggerConditions.length === 0) return true;

  const meetsCondition = (condition) => {
    const score = this.getSessionScore(session, condition.dimension);
    if (condition.minScore) return score >= condition.minScore;
    if (condition.maxScore) return score <= condition.maxScore;
    if (condition.minLevel) return this.getSeverityLevel(score) >= condition.minLevel;
    return false;
  };

  if (anyOf) {
    // At least one condition must be met
    return triggerConditions.some(meetsCondition);
  } else {
    // ALL conditions must be met
    return triggerConditions.every(meetsCondition);
  }
}
```

---

## 🎯 Implementation Plan

### Phase 1: Database Schema Update (2-3 hours)
1. Add sensitivity metadata to all questions
2. Tag clinical questions with trigger conditions
3. Create "gentle intro" question chains

### Phase 2: Selector Logic Update (3-4 hours)
1. Implement `checkTriggerConditions()` function
2. Add sensitivity filtering to question pool
3. Create context message system

### Phase 3: Baseline Question Redesign (2-3 hours)
1. Replace direct clinical baseline questions with indirect probes
2. Create scoring functions for signal detection
3. Test signal detection accuracy

### Phase 4: Context Messaging System (2-3 hours)
1. Add UI component for contextual messages
2. Display framing before sensitive question blocks
3. Add "skip" option for EXTREME sensitivity questions

### Total Estimated Time: 12-15 hours

---

## 📈 Expected Improvements

### User Experience
- ✅ **Lower dropout rate**: Less shock from invasive questions
- ✅ **Higher completion rate**: Gradual escalation builds trust
- ✅ **Better rapport**: Feels like conversation, not interrogation

### Data Quality
- ✅ **More honest responses**: People answer truthfully when comfortable
- ✅ **Higher validity**: Conditional screening improves clinical accuracy
- ✅ **Fewer false positives**: Only ask clinical questions when signals suggest relevance

### Efficiency
- ✅ **Fewer wasted questions**: Don't ask everyone about psychosis (only ~2% need it)
- ✅ **Better targeting**: Use signals to route to relevant domains
- ✅ **Shorter assessments**: Skip irrelevant clinical domains entirely

---

## 🔬 Research Citations

1. **Tourangeau, R., & Yan, T. (2007)**. "Sensitive questions in surveys." *Psychological Bulletin, 133*(5), 859-883.
   - Sensitive questions late in surveys reduce refusal by 40%

2. **Bradburn, N. M., Sudman, S., & Wansink, B. (2004)**. *Asking Questions: The Definitive Guide to Questionnaire Design*
   - Funnel approach: broad → specific → sensitive

3. **Groves, R. M., et al. (2009)**. *Survey Methodology* (2nd ed.)
   - Contextual framing increases disclosure by 35%

4. **Kessler, R. C., et al. (2005)**. "Screening for serious mental illness in the general population." *Archives of General Psychiatry, 62*(2), 184-189.
   - Two-stage screening (brief → full) reduces burden and improves accuracy

---

## ✅ Next Steps

1. **Review this proposal** - Does this approach align with your vision?
2. **Prioritize implementation** - Which phase should we tackle first?
3. **Define sensitivity levels** - Review question bank and tag each question
4. **Test signal detection** - Ensure indirect probes accurately trigger clinical screeners

Let me know if you'd like me to start implementing any of these phases!
