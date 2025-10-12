/**
 * Validity Scale Calculator
 *
 * Detects invalid response patterns including:
 * - Inconsistency (opposite questions answered similarly)
 * - Infrequency (rarely-endorsed items highly endorsed)
 * - Positive Impression ("faking good")
 * - Random responding
 *
 * Based on MMPI-3 and PAI validity scale methodology
 */

const logger = require('../utils/logger');

/**
 * Inconsistency pair definitions
 * Each pair consists of questions that should be answered oppositely
 */
const INCONSISTENCY_PAIRS = [
  ['VALIDITY_INCONS_1A', 'VALIDITY_INCONS_1B'],   // Calmness
  ['VALIDITY_INCONS_2A', 'VALIDITY_INCONS_2B'],   // Social preference
  ['VALIDITY_INCONS_3A', 'VALIDITY_INCONS_3B'],   // Energy level
  ['VALIDITY_INCONS_4A', 'VALIDITY_INCONS_4B'],   // Worry tendency
  ['VALIDITY_INCONS_5A', 'VALIDITY_INCONS_5B'],   // Mood stability
  ['VALIDITY_INCONS_6A', 'VALIDITY_INCONS_6B'],   // Organization
  ['VALIDITY_INCONS_7A', 'VALIDITY_INCONS_7B'],   // Confidence
  ['VALIDITY_INCONS_8A', 'VALIDITY_INCONS_8B'],   // Sleep quality
  ['VALIDITY_INCONS_9A', 'VALIDITY_INCONS_9B'],   // Anger
  ['VALIDITY_INCONS_10A', 'VALIDITY_INCONS_10B']  // Concentration
];

/**
 * Infrequency items (rarely endorsed in normal population)
 */
const INFREQUENCY_ITEMS = [
  'VALIDITY_INFREQ_1',  // Never felt sad
  'VALIDITY_INFREQ_2',  // Can read minds
  'VALIDITY_INFREQ_3',  // Hallucinations every day
  'VALIDITY_INFREQ_4',  // Everything perfect
  'VALIDITY_INFREQ_5',  // Constant voices
  'VALIDITY_INFREQ_6'   // Never made mistake
];

/**
 * Positive impression items ("faking good")
 */
const POSITIVE_IMPRESSION_ITEMS = [
  'VALIDITY_POS_IMP_1',  // Never angry
  'VALIDITY_POS_IMP_2',  // Never regretted saying something
  'VALIDITY_POS_IMP_3',  // Always tell truth
  'VALIDITY_POS_IMP_4',  // Never jealous
  'VALIDITY_POS_IMP_5',  // Always patient
  'VALIDITY_POS_IMP_6',  // Never disliked anyone
  'VALIDITY_POS_IMP_7',  // Never procrastinated
  'VALIDITY_POS_IMP_8'   // Never negative thoughts
];

class ValidityScaleCalculator {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      inconsistency: 0,
      inconsistencyRaw: 0,
      inconsistencyCount: 0,
      infrequency: 0,
      infrequencyRaw: 0,
      positiveImpression: 0,
      positiveImpressionRaw: 0,
      randomResponding: 0
    };
    this.flags = [];
    this.details = {
      inconsistentPairs: [],
      infrequentEndorsed: [],
      positiveImpressionEndorsed: []
    };
  }

  /**
   * Calculate all validity scales
   */
  calculate() {
    this.calculateInconsistency();
    this.calculateInfrequency();
    this.calculatePositiveImpression();
    this.detectRandomResponding();

    return this.getValidityReport();
  }

  /**
   * Calculate inconsistency score
   * Checks for opposite questions answered inconsistently
   */
  calculateInconsistency() {
    let inconsistentPairs = 0;
    let pairsAnswered = 0;

    INCONSISTENCY_PAIRS.forEach(([qid1, qid2]) => {
      const resp1 = this.findResponse(qid1);
      const resp2 = this.findResponse(qid2);

      if (resp1 && resp2) {
        pairsAnswered++;

        // Convert responses to scores (1-5)
        const score1 = this.getNumericScore(resp1);
        const score2 = this.getNumericScore(resp2);

        // Calculate difference
        // For opposite pairs, scores should be inversely related
        // If resp2 is reverse-scored, we need to flip it: score2_flipped = 6 - score2
        // Then check if |score1 - score2_flipped| is large
        // Actually, the pairs are designed so one is reverse-scored
        // So we just check the raw difference

        // Simple approach: if both questions have similar scores (diff < 2), it's inconsistent
        // Because one should be high and one should be low
        const diff = Math.abs(score1 - score2);

        if (diff < 2) {
          inconsistentPairs++;
          this.details.inconsistentPairs.push({
            pair: [qid1, qid2],
            scores: [score1, score2],
            difference: diff
          });
        }
      }
    });

    this.scores.inconsistencyCount = pairsAnswered;
    this.scores.inconsistencyRaw = inconsistentPairs;
    this.scores.inconsistency = pairsAnswered > 0
      ? inconsistentPairs / pairsAnswered
      : 0;

    // Flag if >30% of pairs are inconsistent
    if (this.scores.inconsistency > 0.30) {
      this.flags.push({
        type: 'HIGH_INCONSISTENCY',
        severity: 'HIGH',
        message: `${Math.round(this.scores.inconsistency * 100)}% of question pairs answered inconsistently`,
        details: this.details.inconsistentPairs.slice(0, 3) // Show first 3 examples
      });
    } else if (this.scores.inconsistency > 0.20) {
      this.flags.push({
        type: 'MODERATE_INCONSISTENCY',
        severity: 'MODERATE',
        message: `${Math.round(this.scores.inconsistency * 100)}% of question pairs answered inconsistently`,
        details: this.details.inconsistentPairs.slice(0, 2)
      });
    }

    logger.info(`[VALIDITY] Inconsistency: ${this.scores.inconsistencyRaw}/${this.scores.inconsistencyCount} pairs (${Math.round(this.scores.inconsistency * 100)}%)`);
  }

  /**
   * Calculate infrequency score
   * Checks for endorsement of rarely-endorsed items
   */
  calculateInfrequency() {
    let endorsedCount = 0;
    let itemsPresented = 0;

    INFREQUENCY_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        itemsPresented++;
        const score = this.getNumericScore(resp);

        // Consider "Agree" (4) or "Strongly Agree" (5) as endorsement
        if (score >= 4) {
          endorsedCount++;
          this.details.infrequentEndorsed.push({
            questionId: qid,
            score: score,
            text: resp.questionText || qid
          });
        }
      }
    });

    this.scores.infrequencyRaw = endorsedCount;
    this.scores.infrequency = itemsPresented > 0
      ? endorsedCount / itemsPresented
      : 0;

    // Flag if >40% of infrequent items endorsed
    if (this.scores.infrequency > 0.40) {
      this.flags.push({
        type: 'POSSIBLE_EXAGGERATION',
        severity: 'HIGH',
        message: `Endorsed ${Math.round(this.scores.infrequency * 100)}% of rarely-endorsed items`,
        details: this.details.infrequentEndorsed
      });
    } else if (this.scores.infrequency > 0.25) {
      this.flags.push({
        type: 'QUESTIONABLE_EXAGGERATION',
        severity: 'MODERATE',
        message: `Endorsed ${Math.round(this.scores.infrequency * 100)}% of rarely-endorsed items`
      });
    }

    logger.info(`[VALIDITY] Infrequency: ${this.scores.infrequencyRaw}/${itemsPresented} items (${Math.round(this.scores.infrequency * 100)}%)`);
  }

  /**
   * Calculate positive impression score
   * Checks for "faking good" pattern
   */
  calculatePositiveImpression() {
    let endorsedCount = 0;
    let itemsPresented = 0;

    POSITIVE_IMPRESSION_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        itemsPresented++;
        const score = this.getNumericScore(resp);

        // Consider "Agree" (4) or "Strongly Agree" (5) as endorsement
        if (score >= 4) {
          endorsedCount++;
          this.details.positiveImpressionEndorsed.push({
            questionId: qid,
            score: score,
            text: resp.questionText || qid
          });
        }
      }
    });

    this.scores.positiveImpressionRaw = endorsedCount;
    this.scores.positiveImpression = itemsPresented > 0
      ? endorsedCount / itemsPresented
      : 0;

    // Flag if >50% of positive impression items endorsed
    if (this.scores.positiveImpression > 0.50) {
      this.flags.push({
        type: 'FAKING_GOOD',
        severity: 'HIGH',
        message: `Endorsed ${Math.round(this.scores.positiveImpression * 100)}% of "too good to be true" items`,
        details: this.details.positiveImpressionEndorsed.slice(0, 3)
      });
    } else if (this.scores.positiveImpression > 0.375) {
      this.flags.push({
        type: 'POSSIBLE_FAKING_GOOD',
        severity: 'MODERATE',
        message: `Endorsed ${Math.round(this.scores.positiveImpression * 100)}% of "too good to be true" items`
      });
    }

    logger.info(`[VALIDITY] Positive Impression: ${this.scores.positiveImpressionRaw}/${itemsPresented} items (${Math.round(this.scores.positiveImpression * 100)}%)`);
  }

  /**
   * Detect random responding
   * Combined heuristic based on multiple indicators
   */
  detectRandomResponding() {
    // Calculate response pattern variance
    const allScores = this.responses
      .map(r => this.getNumericScore(r))
      .filter(s => s > 0);

    if (allScores.length < 10) {
      return; // Not enough data
    }

    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
    const stdDev = Math.sqrt(variance);

    // Low variance might indicate random responding (all 3's) or extreme acquiescence (all 5's)
    const isLowVariance = stdDev < 0.5;

    // High inconsistency + low variance = likely random
    const randomResponding = this.scores.inconsistency > 0.30 && isLowVariance;

    this.scores.randomResponding = randomResponding ? 1.0 : 0.0;

    if (randomResponding) {
      this.flags.push({
        type: 'RANDOM_RESPONDING',
        severity: 'CRITICAL',
        message: 'Response pattern suggests random or careless responding',
        details: {
          inconsistency: this.scores.inconsistency,
          standardDeviation: stdDev,
          mean: mean
        }
      });
    }

    logger.info(`[VALIDITY] Random Responding: ${randomResponding ? 'DETECTED' : 'Not detected'} (SD: ${stdDev.toFixed(2)})`);
  }

  /**
   * Get comprehensive validity report
   */
  getValidityReport() {
    const isValid = this.flags.length === 0 ||
                    this.flags.every(f => f.severity !== 'CRITICAL' && f.severity !== 'HIGH');

    const reliability = this.getReliabilityLevel();

    return {
      valid: isValid,
      reliability,
      scores: this.scores,
      flags: this.flags,
      summary: this.generateSummary(),
      recommendation: this.getRecommendation()
    };
  }

  /**
   * Get reliability level based on validity scores
   */
  getReliabilityLevel() {
    const criticalFlags = this.flags.filter(f => f.severity === 'CRITICAL');
    const highFlags = this.flags.filter(f => f.severity === 'HIGH');
    const moderateFlags = this.flags.filter(f => f.severity === 'MODERATE');

    if (criticalFlags.length > 0) return 'INVALID';
    if (highFlags.length >= 2) return 'QUESTIONABLE';
    if (highFlags.length === 1 || moderateFlags.length >= 2) return 'CAUTION';
    if (moderateFlags.length === 1) return 'ACCEPTABLE';
    return 'GOOD';
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    if (this.flags.length === 0) {
      return 'No validity concerns detected. Response pattern appears consistent and genuine.';
    }

    const flagTypes = this.flags.map(f => f.type).join(', ');
    return `Validity concerns detected: ${flagTypes}. Results should be interpreted with caution.`;
  }

  /**
   * Get recommendation based on validity results
   */
  getRecommendation() {
    const reliability = this.getReliabilityLevel();

    switch (reliability) {
      case 'INVALID':
        return 'Results are likely invalid and should not be used for clinical decision-making. Consider re-administration with clear instructions.';

      case 'QUESTIONABLE':
        return 'Results are questionable. Use extreme caution in interpretation and consider re-administration.';

      case 'CAUTION':
        return 'Results may have some validity issues. Interpret with caution and corroborate with other information.';

      case 'ACCEPTABLE':
        return 'Results are generally acceptable with minor validity concerns noted.';

      case 'GOOD':
        return 'Results appear valid and reliable for interpretation.';

      default:
        return 'Unable to determine reliability.';
    }
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }

  /**
   * Helper: Convert response to numeric score (1-5)
   */
  getNumericScore(response) {
    // If already a number
    if (typeof response.score === 'number') {
      return response.score;
    }

    // If response value is a string (likert option)
    const scoreMap = {
      'Strongly Disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly Agree': 5,
      'Not at all': 1,
      'Several days': 2,
      'More than half the days': 3,
      'Nearly every day': 4,
      'Never': 1,
      'Rarely': 2,
      'Sometimes': 3,
      'Often': 4,
      'Very Often': 5
    };

    return scoreMap[response.response] || scoreMap[response.value] || 3;
  }
}

module.exports = ValidityScaleCalculator;
