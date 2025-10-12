/**
 * Semantic Contradiction Detector
 *
 * Detects logical contradictions in user responses in real-time
 * and suggests clarifications.
 *
 * Types of contradictions detected:
 * 1. Direct opposites (organized vs. messy)
 * 2. Trait-level inconsistencies
 * 3. Clinical symptom contradictions
 * 4. Temporal inconsistencies (past vs. present)
 */

class SemanticContradictionDetector {
  constructor() {
    // Define known contradiction pairs
    this.contradictionRules = this.buildContradictionRules();
  }

  /**
   * Build rules for detecting contradictions
   */
  buildContradictionRules() {
    return [
      // CONSCIENTIOUSNESS contradictions
      {
        trait: 'conscientiousness',
        pairs: [
          {
            positive: ['BASELINE_CONSCIENTIOUSNESS_1', 'CONSCIENTIOUSNESS_ORGANIZED'],
            negative: ['BASELINE_CONSCIENTIOUSNESS_5_R', 'CONSCIENTIOUSNESS_MESSY'],
            description: 'Organization vs. Disorganization'
          },
          {
            positive: ['CONSCIENTIOUSNESS_PUNCTUAL', 'CONSCIENTIOUSNESS_DEADLINES'],
            negative: ['CONSCIENTIOUSNESS_LATE', 'CONSCIENTIOUSNESS_PROCRASTINATE'],
            description: 'Punctuality vs. Lateness'
          }
        ]
      },

      // NEUROTICISM contradictions
      {
        trait: 'neuroticism',
        pairs: [
          {
            positive: ['BASELINE_NEUROTICISM_1', 'NEUROTICISM_ANXIOUS'],
            negative: ['NEUROTICISM_CALM', 'NEUROTICISM_RELAXED'],
            description: 'Anxious vs. Calm'
          },
          {
            positive: ['NEUROTICISM_WORRIED', 'WORRY_FREQUENCY'],
            negative: ['PROBE_STRESS_1', 'RESILIENCE_BOUNCE_BACK'],
            description: 'Worry vs. Stress Resilience'
          }
        ]
      },

      // DEPRESSION contradictions
      {
        trait: 'depression',
        pairs: [
          {
            positive: ['DEPRESSION_PHQ9_1', 'DEPRESSION_ANHEDONIA'],
            negative: ['PROBE_INTEREST_1', 'LIFE_SATISFACTION'],
            description: 'Anhedonia vs. Life Engagement'
          },
          {
            positive: ['DEPRESSION_PHQ9_4', 'DEPRESSION_ENERGY_LOW'],
            negative: ['PROBE_ENERGY_1', 'ENERGY_HIGH'],
            description: 'Low Energy vs. High Energy'
          },
          {
            positive: ['DEPRESSION_PHQ9_2', 'DEPRESSION_MOOD_LOW'],
            negative: ['PROBE_MOOD_1', 'MOOD_POSITIVE'],
            description: 'Low Mood vs. Positive Mood'
          }
        ]
      },

      // EXTRAVERSION contradictions
      {
        trait: 'extraversion',
        pairs: [
          {
            positive: ['BASELINE_EXTRAVERSION_1', 'EXTRAVERSION_SOCIAL'],
            negative: ['EXTRAVERSION_SOLITARY', 'EXTRAVERSION_WITHDRAWN'],
            description: 'Social vs. Solitary'
          },
          {
            positive: ['EXTRAVERSION_TALKATIVE', 'EXTRAVERSION_OUTGOING'],
            negative: ['EXTRAVERSION_QUIET', 'EXTRAVERSION_RESERVED'],
            description: 'Talkative vs. Reserved'
          }
        ]
      },

      // ADHD contradictions
      {
        trait: 'adhd',
        pairs: [
          {
            positive: ['ADHD_INATTENTION_1', 'ADHD_DISTRACTED'],
            negative: ['PROBE_CONCENTRATION_1', 'CONCENTRATION_EXCELLENT'],
            description: 'Inattention vs. Good Concentration'
          },
          {
            positive: ['ADHD_HYPERACTIVITY_1', 'ADHD_RESTLESS'],
            negative: ['CALM_SITTING', 'PATIENCE_HIGH'],
            description: 'Restlessness vs. Calm'
          }
        ]
      },

      // ANXIETY contradictions
      {
        trait: 'anxiety',
        pairs: [
          {
            positive: ['ANXIETY_GAD7_1', 'ANXIETY_WORRIED'],
            negative: ['ANXIETY_CALM', 'PROBE_WORRY_1'],
            description: 'Worry vs. Calmness'
          }
        ]
      }
    ];
  }

  /**
   * Check for contradictions after each response
   *
   * @param {Object} currentResponse - Most recent response
   * @param {Array} allResponses - All previous responses
   * @returns {Array} List of contradictions found
   */
  detectContradictions(currentResponse, allResponses) {
    const contradictions = [];

    const currentQuestionId = currentResponse.questionId;
    const currentValue = currentResponse.value || currentResponse.response;
    const currentReversed = currentResponse.reverseScored;

    // Safety check: skip if questionId is missing
    if (!currentQuestionId) {
      return contradictions;
    }

    // Check each contradiction rule
    for (const rule of this.contradictionRules) {
      for (const pair of rule.pairs) {
        // Check if current question is in positive list
        if (pair.positive.some(qid => currentQuestionId.includes(qid) || qid.includes(currentQuestionId))) {
          // Look for responses in negative list
          const negativeResponses = allResponses.filter(r =>
            r.questionId && pair.negative.some(qid => r.questionId.includes(qid) || qid.includes(r.questionId))
          );

          for (const negResp of negativeResponses) {
            const negValue = negResp.value || negResp.response;
            const contradiction = this.checkContradiction(
              currentValue,
              negValue,
              currentReversed,
              negResp.reverseScored
            );

            if (contradiction) {
              contradictions.push({
                trait: rule.trait,
                type: pair.description,
                question1: {
                  id: currentQuestionId,
                  text: currentResponse.text,
                  response: currentValue
                },
                question2: {
                  id: negResp.questionId,
                  text: negResp.text,
                  response: negValue
                },
                severity: contradiction.severity,
                confidence: 0.75
              });
            }
          }
        }

        // Check if current question is in negative list
        if (pair.negative.some(qid => currentQuestionId.includes(qid) || qid.includes(currentQuestionId))) {
          // Look for responses in positive list
          const positiveResponses = allResponses.filter(r =>
            r.questionId && pair.positive.some(qid => r.questionId.includes(qid) || qid.includes(r.questionId))
          );

          for (const posResp of positiveResponses) {
            const posValue = posResp.value || posResp.response;
            const contradiction = this.checkContradiction(
              posValue,
              currentValue,
              posResp.reverseScored,
              currentReversed
            );

            if (contradiction) {
              contradictions.push({
                trait: rule.trait,
                type: pair.description,
                question1: {
                  id: posResp.questionId,
                  text: posResp.text,
                  response: posValue
                },
                question2: {
                  id: currentQuestionId,
                  text: currentResponse.text,
                  response: currentValue
                },
                severity: contradiction.severity,
                confidence: 0.75
              });
            }
          }
        }
      }
    }

    // Also check for general trait-level contradictions
    const traitContradictions = this.detectTraitLevelContradictions(currentResponse, allResponses);
    contradictions.push(...traitContradictions);

    return contradictions;
  }

  /**
   * Check if two responses contradict each other
   */
  checkContradiction(value1, value2, reversed1, reversed2) {
    // Normalize for reverse scoring
    const norm1 = reversed1 ? (6 - value1) : value1;
    const norm2 = reversed2 ? (6 - value2) : value2;

    // Both high (4-5) or both low (1-2) on opposite-scored items = contradiction
    const bothHigh = norm1 >= 4 && norm2 >= 4;
    const bothLow = norm1 <= 2 && norm2 <= 2;

    if (bothHigh || bothLow) {
      return {
        severity: bothHigh && norm1 === 5 && norm2 === 5 ? 'HIGH' :
                  bothLow && norm1 === 1 && norm2 === 1 ? 'HIGH' : 'MEDIUM'
      };
    }

    return null;
  }

  /**
   * Detect general trait-level contradictions
   */
  detectTraitLevelContradictions(currentResponse, allResponses) {
    const contradictions = [];
    const currentTrait = currentResponse.trait;
    const currentValue = currentResponse.value || currentResponse.response;
    const currentReversed = currentResponse.reverseScored;

    if (!currentTrait) return contradictions;

    // Find other responses for same trait with opposite scoring
    const sameTrait = allResponses.filter(r =>
      r.trait === currentTrait &&
      r.reverseScored !== currentReversed
    );

    for (const other of sameTrait) {
      const otherValue = other.value || other.response;
      const contradiction = this.checkContradiction(
        currentValue,
        otherValue,
        currentReversed,
        other.reverseScored
      );

      if (contradiction) {
        contradictions.push({
          trait: currentTrait,
          type: `${currentTrait} trait inconsistency`,
          question1: {
            id: currentResponse.questionId,
            text: currentResponse.text,
            response: currentValue
          },
          question2: {
            id: other.questionId,
            text: other.text,
            response: otherValue
          },
          severity: contradiction.severity,
          confidence: 0.65
        });
      }
    }

    return contradictions;
  }

  /**
   * Generate clarification question for contradiction
   */
  generateClarification(contradiction) {
    return {
      type: 'CLARIFICATION',
      trait: contradiction.trait,
      message: `We noticed different responses about ${contradiction.type.toLowerCase()}. This helps us understand you better.`,
      details: `Earlier: "${contradiction.question1.text}" - You answered "${this.formatResponse(contradiction.question1.response)}"\n` +
               `Now: "${contradiction.question2.text}" - You answered "${this.formatResponse(contradiction.question2.response)}"`,
      question: 'Which better describes you overall?',
      options: [
        {
          value: 'first',
          label: 'The first answer is more accurate'
        },
        {
          value: 'second',
          label: 'The second answer is more accurate'
        },
        {
          value: 'both',
          label: 'Both are true in different contexts'
        },
        {
          value: 'neither',
          label: 'I may have misunderstood one of the questions'
        }
      ],
      priority: contradiction.severity === 'HIGH' ? 'high' : 'medium'
    };
  }

  /**
   * Format response value for display
   */
  formatResponse(value) {
    const labels = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree'
    };
    return labels[value] || value;
  }

  /**
   * Get summary of all contradictions
   */
  getSummary(allContradictions) {
    if (allContradictions.length === 0) {
      return {
        count: 0,
        severity: 'NONE',
        message: 'No contradictions detected - responses are internally consistent'
      };
    }

    const highSeverity = allContradictions.filter(c => c.severity === 'HIGH').length;
    const mediumSeverity = allContradictions.filter(c => c.severity === 'MEDIUM').length;

    let severity = 'LOW';
    let message = 'Minor inconsistencies detected';

    if (highSeverity > 2) {
      severity = 'HIGH';
      message = 'Multiple significant contradictions suggest confusion or careless responding';
    } else if (highSeverity > 0 || mediumSeverity > 3) {
      severity = 'MEDIUM';
      message = 'Some contradictions detected - may indicate context-dependent responses or response variability';
    }

    return {
      count: allContradictions.length,
      highSeverity,
      mediumSeverity,
      severity,
      message,
      traitsAffected: [...new Set(allContradictions.map(c => c.trait))]
    };
  }
}

module.exports = SemanticContradictionDetector;
