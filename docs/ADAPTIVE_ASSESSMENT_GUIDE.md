# Neurlyn Adaptive Assessment System Guide

## Overview

The Adaptive Assessment System intelligently selects questions based on user responses, creating a personalized assessment experience within strict question limits.

## Assessment Tiers

| Tier         | Questions    | Duration      | Use Case                                               |
| ------------ | ------------ | ------------- | ------------------------------------------------------ |
| **Quick**    | 20 questions | 5-7 minutes   | Basic screening, initial exploration                   |
| **Standard** | 45 questions | 15-20 minutes | Comprehensive evaluation for most users                |
| **Deep**     | 75 questions | 25-35 minutes | Clinical-grade assessment with psychoanalytic elements |

## How It Works

### 1. Initial Phase (40% of questions)

- Core personality traits (Big Five)
- Basic neurodiversity screening (ADHD/Autism indicators)
- Essential mental health screening
- These questions are asked to everyone

### 2. Branching Phase (40% of questions)

Based on initial responses, the system activates specific pathways:

#### ADHD Pathway

**Triggered when:** High scores on attention difficulty, time blindness, or impulsivity
**Adds questions about:**

- Executive function challenges
- Rejection Sensitive Dysphoria
- Time management and organization
- Hyperactivity vs inattentive presentation

#### Autism Pathway

**Triggered when:** High scores on social difficulty, sensory sensitivity, or routine needs
**Adds questions about:**

- Sensory processing profile
- Masking and camouflaging behaviors
- Special interests (monotropism)
- Social communication patterns

#### AuDHD Pathway

**Triggered when:** Both ADHD and Autism pathways activate
**Adds questions about:**

- Competing needs between conditions
- Dual presentation challenges
- Complex masking patterns
- Executive function + sensory needs

#### Trauma Pathway

**Triggered when:** Hypervigilance, dissociation, or somatic symptoms detected
**Adds questions about:**

- Attachment style
- Defense mechanisms
- Grounding and safety needs
  **Note:** Questions become gentler in tone

#### High Masking Pathway

**Triggered when:** Social exhaustion + identity suppression patterns
**Adds questions about:**

- Burnout risk assessment
- Authenticity struggles
- Energy management
- Recovery needs

### 3. Refinement Phase (20% of questions)

- Clarifies ambiguous areas
- Uses forced-choice questions for extreme responders
- Adds nuanced questions for central tendency responders
- Validates consistency of key indicators

## Adaptive Logic Examples

### Example 1: Quick Assessment (20 questions)

```
Questions 1-8: Core screening
- 3 personality traits
- 2 ADHD screening
- 2 autism screening
- 1 anxiety screening

[User shows high ADHD indicators]

Questions 9-15: ADHD branching
- 3 executive function
- 2 time blindness
- 2 rejection sensitivity

Questions 16-20: Refinement
- 2 validation questions
- 3 clarifying ADHD subtype
```

### Example 2: Standard Assessment with Multiple Pathways (45 questions)

```
Questions 1-18: Core + profile-based
- User indicated "attention" and "sensory" concerns
- Gets targeted ADHD + sensory questions early

[Responses indicate both ADHD and autism traits]

Questions 19-35: AuDHD branching
- Executive function deep dive
- Sensory processing profile
- Masking assessment
- Competing needs evaluation

Questions 36-45: Refinement + enhancement
- Attachment style (trauma indicators detected)
- Learning style assessment
- Validation questions
```

## Priority Scoring System

Each question receives a priority score based on:

| Factor                    | Priority Boost | Example                                       |
| ------------------------- | -------------- | --------------------------------------------- |
| Activated pathway match   | +30 points     | ADHD pathway → executive function questions   |
| High trait indicator      | +20 points     | High anxiety → emotional regulation questions |
| Profile concern match     | +15 points     | User selected "attention" → ADHD questions    |
| Response style correction | +15 points     | Extreme responder → forced choice questions   |
| Redundancy                | -20 points     | Already strong signal for trait               |

## API Endpoints

### Start Adaptive Assessment

```javascript
POST /api/adaptive/start
{
  "tier": "standard",
  "demographics": {
    "age": 28,
    "gender": "female"
  },
  "concerns": ["attention", "social", "sensory"]
}

Response:
{
  "sessionId": "ADAPTIVE_1234567890_abc123",
  "tier": "standard",
  "totalQuestions": 45,
  "currentBatch": [...first 5 questions],
  "progress": { "current": 0, "total": 45 }
}
```

### Get Next Questions

```javascript
POST /api/adaptive/next
{
  "sessionId": "ADAPTIVE_1234567890_abc123",
  "response": {
    "questionId": "q123",
    "value": "Often",
    "responseTime": 2500,
    "category": "neurodiversity",
    "traits": { "adhd_indicators": 0.8 }
  }
}

Response:
{
  "nextQuestions": [...next 1-3 questions],
  "progress": { "current": 6, "total": 45, "percentage": 13 },
  "pathways": ["adhd_pathway"],
  "phase": "core",
  "complete": false
}
```

### Complete Assessment

```javascript
POST /api/adaptive/complete
{
  "sessionId": "ADAPTIVE_1234567890_abc123"
}

Response:
{
  "summary": {
    "primaryProfile": "ADHD-Inattentive with High Masking",
    "confidence": "78%",
    "pathwaysActivated": ["adhd_pathway", "high_masking"],
    "recommendations": {
      "immediate": ["Consider ADHD-specific support strategies"],
      "assessment": ["Professional ADHD evaluation recommended"],
      "resources": ["ADHD support apps: Inflow, Forest, Due"]
    }
  }
}
```

## Response Pattern Detection

The system detects and corrects for:

| Pattern                | Detection               | Correction                   |
| ---------------------- | ----------------------- | ---------------------------- |
| **Inconsistency**      | Contradictory responses | Add validity check questions |
| **Extreme Responding** | >70% choosing extremes  | Add forced-choice questions  |
| **Central Tendency**   | >60% choosing middle    | Add slider-scale questions   |
| **Acquiescence**       | >80% agreeing           | Add reverse-scored questions |

## Confidence Calculation

Assessment confidence is calculated based on:

- Number of questions answered (more = higher confidence)
- Response consistency (consistent = higher confidence)
- Activated pathways (clear pathways = higher confidence)
- Response patterns (balanced = higher confidence)

### Confidence Levels

- **<60%**: Low confidence - suggest retaking with more questions
- **60-75%**: Moderate confidence - results indicative but not definitive
- **75-85%**: Good confidence - reliable for self-understanding
- **>85%**: High confidence - suitable for clinical discussion

## Benefits of Adaptive System

1. **Efficiency**: Get meaningful results in 20 questions instead of 200+
2. **Relevance**: Only asked questions relevant to your profile
3. **Engagement**: Shorter assessments reduce fatigue
4. **Accuracy**: Focused questioning on relevant areas
5. **Personalization**: Each assessment is unique to the user

## Frontend Integration

```javascript
// Example frontend implementation
async function startAdaptiveAssessment(tier, concerns) {
  const response = await fetch('/api/adaptive/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, concerns })
  });

  const data = await response.json();
  displayQuestions(data.currentBatch);
  updateProgress(data.progress);
}

async function submitAnswer(questionId, value) {
  const response = await fetch('/api/adaptive/next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: currentSession,
      response: { questionId, value, responseTime: getResponseTime() }
    })
  });

  const data = await response.json();

  if (data.complete) {
    completeAssessment();
  } else {
    displayQuestions(data.nextQuestions);
    updateProgress(data.progress);
    showActivatedPathways(data.pathways);
  }
}
```

## Testing the System

### Test Scenario 1: ADHD Detection

1. Start standard assessment
2. Answer high on: difficulty focusing, time blindness, impulsivity
3. System should activate ADHD pathway by question 10
4. Subsequent questions focus on executive function
5. Final report emphasizes ADHD support strategies

### Test Scenario 2: AuDHD Profile

1. Start deep assessment
2. Answer high on both ADHD and autism indicators
3. System should activate AuDHD pathway
4. Questions explore competing needs
5. Report addresses dual presentation

### Test Scenario 3: High Masking

1. Start with "social" concern
2. Answer high on social exhaustion, performance feeling
3. System activates masking pathway
4. Questions explore burnout risk
5. Report emphasizes authentic expression needs

---

This adaptive system ensures each user gets a personalized, relevant assessment within reasonable time limits while maintaining diagnostic accuracy.
