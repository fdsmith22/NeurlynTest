/**
 * Mania/Hypomania Scorer
 *
 * Calculates bipolar spectrum risk using:
 * - MDQ (Mood Disorder Questionnaire) - Gold standard for bipolar screening
 *
 * MDQ Positive Screen Criteria:
 * - ≥7 "Yes" answers to items 1-13
 * - Items occurred at the same time
 * - Moderate to serious problems caused
 *
 * Sensitivity: 73%, Specificity: 90% (Hirschfeld et al., 2000)
 */

const logger = require('../utils/logger');

// MDQ question IDs
const MDQ_ITEMS = [
  'MANIA_MDQ_1',   // Felt so good/hyper
  'MANIA_MDQ_2',   // Irritable
  'MANIA_MDQ_3',   // More self-confident
  'MANIA_MDQ_4',   // Less sleep
  'MANIA_MDQ_5',   // More talkative
  'MANIA_MDQ_6',   // Racing thoughts
  'MANIA_MDQ_7',   // Easily distracted
  'MANIA_MDQ_8',   // More energy
  'MANIA_MDQ_9',   // More active
  'MANIA_MDQ_10',  // More social
  'MANIA_MDQ_11',  // More interested in sex
  'MANIA_MDQ_12'   // Risky behavior
];

class ManiaScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      mdq: {
        total: 0,
        itemCount: 0,
        positiveScreen: false,
        severity: 'Unknown'
      },
      bipoларType: 'Unknown', // BP-I, BP-II, or Unspecified
      composite: {
        score: 0,
        risk: 'Unknown'
      }
    };
  }

  /**
   * Calculate all mania/hypomania scores
   */
  calculate() {
    this.calculateMDQ();
    this.determineBipolarType();
    this.calculateComposite();

    return this.getManiaReport();
  }

  /**
   * Calculate MDQ score (0-12)
   */
  calculateMDQ() {
    let total = 0;
    let answeredCount = 0;

    MDQ_ITEMS.forEach((qid, index) => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getBinaryScore(resp);
        total += score;
        answeredCount++;
      }
    });

    // Only calculate if at least 10/12 items answered
    if (answeredCount >= 10) {
      this.scores.mdq.total = total;
      this.scores.mdq.itemCount = answeredCount;
      this.scores.mdq.positiveScreen = total >= 7;
      this.scores.mdq.severity = this.getMDQSeverity(total);

      logger.info(`[MANIA] MDQ Score: ${total}/12 (${this.scores.mdq.severity})`);
      logger.info(`[MANIA] Positive screen: ${this.scores.mdq.positiveScreen}`);
    } else {
      logger.warn(`[MANIA] MDQ incomplete: only ${answeredCount}/12 items answered`);
    }
  }

  /**
   * Determine bipolar type based on symptoms
   */
  determineBipolarType() {
    if (this.scores.mdq.total < 7) {
      this.scores.bipolarType = 'Unlikely';
      return;
    }

    // Check for risky behavior (item 12) - suggests BP-I
    const riskyBehavior = this.findResponse('MANIA_MDQ_12');
    if (riskyBehavior && this.getBinaryScore(riskyBehavior) === 1) {
      this.scores.bipolarType = 'BP-I Suggested';
    } else {
      this.scores.bipolarType = 'BP-II Suggested';
    }
  }

  /**
   * Calculate composite mania score
   */
  calculateComposite() {
    this.scores.composite.score = this.scores.mdq.total;
    this.scores.composite.risk = this.getCompositeRisk(this.scores.mdq.total);
  }

  /**
   * Get comprehensive mania report
   */
  getManiaReport() {
    return {
      scores: this.scores,
      summary: this.generateSummary(),
      recommendations: this.getRecommendations(),
      alerts: this.getAlerts()
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary() {
    const score = this.scores.mdq.total;
    const positiveScreen = this.scores.mdq.positiveScreen;

    if (score === 0) {
      return 'No mania or hypomania symptoms detected.';
    }

    if (!positiveScreen) {
      return `Mild manic symptoms detected (${score}/12), but below clinical threshold. Monitor for changes.`;
    }

    let summary = `Positive screen for bipolar spectrum disorder (${score}/12 symptoms). `;
    summary += `${this.scores.bipolarType}. `;
    summary += 'Professional evaluation strongly recommended.';

    return summary;
  }

  /**
   * Get clinical recommendations based on mania severity
   */
  getRecommendations() {
    const recommendations = [];
    const score = this.scores.mdq.total;

    if (score === 0) {
      return recommendations; // No recommendations needed
    }

    if (score >= 7) {
      recommendations.push('Seek evaluation from psychiatrist or mental health professional');
      recommendations.push('Bipolar disorder requires specialized treatment - mood stabilizers may be necessary');
      recommendations.push('IMPORTANT: Antidepressants alone can trigger mania - inform provider of these symptoms');
      recommendations.push('Track mood changes and sleep patterns');
    } else if (score >= 4) {
      recommendations.push('Monitor mood patterns for changes or worsening');
      recommendations.push('Consider discussing with mental health provider if symptoms interfere with functioning');
      recommendations.push('Maintain regular sleep schedule (disrupted sleep can trigger episodes)');
    }

    // Type-specific recommendations
    if (this.scores.bipolarType === 'BP-I Suggested') {
      recommendations.push('BP-I typically requires medication management (mood stabilizers)');
      recommendations.push('Risk of severe manic episodes - seek evaluation promptly');
    } else if (this.scores.bipolarType === 'BP-II Suggested') {
      recommendations.push('BP-II features hypomania and depression - both require treatment');
      recommendations.push('Often misdiagnosed as depression - ensure provider knows about elevated mood periods');
    }

    return recommendations;
  }

  /**
   * Get critical alerts
   */
  getAlerts() {
    const alerts = [];

    // Positive screen alert
    if (this.scores.mdq.positiveScreen) {
      alerts.push({
        type: 'BIPOLAR_SCREEN_POSITIVE',
        severity: 'HIGH',
        message: 'Positive screen for bipolar spectrum disorder',
        score: this.scores.mdq.total,
        recommendation: 'Psychiatric evaluation recommended. IMPORTANT: Inform provider about manic symptoms before starting any antidepressant medication.'
      });
    }

    // High score alert (≥10)
    if (this.scores.mdq.total >= 10) {
      alerts.push({
        type: 'HIGH_MANIA_SYMPTOMS',
        severity: 'CRITICAL',
        message: 'Very high mania symptom count detected',
        score: this.scores.mdq.total,
        recommendation: 'Urgent psychiatric evaluation recommended. High risk for bipolar I disorder.'
      });
    }

    // Risky behavior alert
    const riskyBehavior = this.findResponse('MANIA_MDQ_12');
    if (riskyBehavior && this.getBinaryScore(riskyBehavior) === 1 && this.scores.mdq.total >= 7) {
      alerts.push({
        type: 'RISKY_BEHAVIOR_DURING_MANIA',
        severity: 'HIGH',
        message: 'Risky or impulsive behavior during elevated mood periods',
        recommendation: 'Suggests BP-I. Safety planning may be necessary during manic episodes.'
      });
    }

    return alerts;
  }

  /**
   * Helper: Get binary score (0 or 1)
   */
  getBinaryScore(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    const scoreMap = {
      'Yes': 1,
      'No': 0,
      'true': 1,
      'false': 0
    };

    return scoreMap[response.response] || scoreMap[response.value] || 0;
  }

  /**
   * Get MDQ severity category
   */
  getMDQSeverity(score) {
    if (score === 0) return 'None';
    if (score <= 3) return 'Minimal';
    if (score <= 6) return 'Mild';
    if (score <= 9) return 'Moderate';
    return 'High';
  }

  /**
   * Get composite risk level
   */
  getCompositeRisk(score) {
    if (score === 0) return 'None';
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Moderate';
    if (score <= 9) return 'High';
    return 'Very High';
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = ManiaScorer;
