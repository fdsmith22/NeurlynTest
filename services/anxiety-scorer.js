/**
 * Anxiety Scorer
 *
 * Calculates anxiety severity using:
 * - GAD-7 (Generalized Anxiety Disorder-7) - Gold standard for GAD
 * - Panic Disorder screening
 * - Social Anxiety screening
 * - OCD screening
 * - PTSD screening
 *
 * GAD-7 Severity Levels:
 * - Minimal: 0-4
 * - Mild: 5-9
 * - Moderate: 10-14
 * - Severe: 15-21
 */

const logger = require('../utils/logger');

// GAD-7 question IDs
const GAD7_ITEMS = [
  'ANXIETY_GAD7_1',  // Nervous, anxious, on edge
  'ANXIETY_GAD7_2',  // Can't stop worrying
  'ANXIETY_GAD7_3',  // Worrying too much
  'ANXIETY_GAD7_4',  // Trouble relaxing
  'ANXIETY_GAD7_5',  // Restlessness
  'ANXIETY_GAD7_6',  // Easily annoyed/irritable
  'ANXIETY_GAD7_7'   // Feeling afraid
];

// Panic disorder items
const PANIC_ITEMS = [
  'ANXIETY_PANIC_1',  // Sudden episodes
  'ANXIETY_PANIC_2',  // Physical symptoms
  'ANXIETY_PANIC_3',  // Worry about attacks
  'ANXIETY_PANIC_4',  // Avoidance
  'ANXIETY_PANIC_5'   // Fear of dying
];

// Social anxiety items
const SOCIAL_ANXIETY_ITEMS = [
  'ANXIETY_SOCIAL_1',  // Fear of judgment
  'ANXIETY_SOCIAL_2',  // Worry before events
  'ANXIETY_SOCIAL_3',  // Avoidance speaking up
  'ANXIETY_SOCIAL_4',  // Rumination
  'ANXIETY_SOCIAL_5'   // Fear of visible symptoms
];

// OCD items
const OCD_ITEMS = [
  'ANXIETY_OCD_1',  // Intrusive thoughts
  'ANXIETY_OCD_2',  // Compulsions
  'ANXIETY_OCD_3',  // Time consuming
  'ANXIETY_OCD_4'   // Impairment
];

// PTSD items
const PTSD_ITEMS = [
  'ANXIETY_PTSD_1',  // Traumatic event
  'ANXIETY_PTSD_2',  // Flashbacks/nightmares
  'ANXIETY_PTSD_3'   // Hypervigilance
];

class AnxietyScorer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      gad7: {
        total: 0,
        severity: 'Unknown',
        severityLevel: 0,
        itemScores: {}
      },
      panic: {
        total: 0,
        average: 0,
        count: 0,
        severity: 'Unknown'
      },
      socialAnxiety: {
        total: 0,
        average: 0,
        count: 0,
        severity: 'Unknown'
      },
      ocd: {
        total: 0,
        average: 0,
        count: 0,
        severity: 'Unknown'
      },
      ptsd: {
        total: 0,
        average: 0,
        count: 0,
        severity: 'Unknown'
      },
      composite: {
        score: 0,
        severity: 'Unknown',
        primaryType: 'Unknown'
      }
    };
  }

  /**
   * Calculate all anxiety scores
   */
  calculate() {
    this.calculateGAD7();
    this.calculatePanic();
    this.calculateSocialAnxiety();
    this.calculateOCD();
    this.calculatePTSD();
    this.calculateComposite();

    return this.getAnxietyReport();
  }

  /**
   * Calculate GAD-7 score (0-21)
   */
  calculateGAD7() {
    let total = 0;
    let answeredCount = 0;

    GAD7_ITEMS.forEach((qid, index) => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getGad7Score(resp);
        this.scores.gad7.itemScores[`item${index + 1}`] = score;
        total += score;
        answeredCount++;
      }
    });

    // Only calculate if at least 5/7 items answered
    if (answeredCount >= 5) {
      this.scores.gad7.total = total;
      this.scores.gad7.severity = this.getGad7Severity(total);
      this.scores.gad7.severityLevel = this.getGad7SeverityLevel(total);

      logger.info(`[ANXIETY] GAD-7 Score: ${total}/21 (${this.scores.gad7.severity})`);
    } else {
      logger.warn(`[ANXIETY] GAD-7 incomplete: only ${answeredCount}/7 items answered`);
    }
  }

  /**
   * Calculate panic disorder indicators
   */
  calculatePanic() {
    let total = 0;
    let count = 0;

    PANIC_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.panic.total = total;
      this.scores.panic.count = count;
      this.scores.panic.average = total / count;
      this.scores.panic.severity = this.getSubscaleSeverity(this.scores.panic.average);

      logger.info(`[ANXIETY] Panic indicators: ${total}/${count * 5} (avg: ${this.scores.panic.average.toFixed(2)})`);
    }
  }

  /**
   * Calculate social anxiety indicators
   */
  calculateSocialAnxiety() {
    let total = 0;
    let count = 0;

    SOCIAL_ANXIETY_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.socialAnxiety.total = total;
      this.scores.socialAnxiety.count = count;
      this.scores.socialAnxiety.average = total / count;
      this.scores.socialAnxiety.severity = this.getSubscaleSeverity(this.scores.socialAnxiety.average);

      logger.info(`[ANXIETY] Social anxiety indicators: ${total}/${count * 5} (avg: ${this.scores.socialAnxiety.average.toFixed(2)})`);
    }
  }

  /**
   * Calculate OCD indicators
   */
  calculateOCD() {
    let total = 0;
    let count = 0;

    OCD_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.ocd.total = total;
      this.scores.ocd.count = count;
      this.scores.ocd.average = total / count;
      this.scores.ocd.severity = this.getSubscaleSeverity(this.scores.ocd.average);

      logger.info(`[ANXIETY] OCD indicators: ${total}/${count * 5} (avg: ${this.scores.ocd.average.toFixed(2)})`);
    }
  }

  /**
   * Calculate PTSD indicators
   */
  calculatePTSD() {
    let total = 0;
    let count = 0;

    PTSD_ITEMS.forEach(qid => {
      const resp = this.findResponse(qid);

      if (resp) {
        const score = this.getLikertScore(resp);
        total += score;
        count++;
      }
    });

    if (count > 0) {
      this.scores.ptsd.total = total;
      this.scores.ptsd.count = count;
      this.scores.ptsd.average = total / count;
      this.scores.ptsd.severity = this.getSubscaleSeverity(this.scores.ptsd.average);

      logger.info(`[ANXIETY] PTSD indicators: ${total}/${count * 5} (avg: ${this.scores.ptsd.average.toFixed(2)})`);
    }
  }

  /**
   * Calculate composite anxiety score
   * Determines primary anxiety type and overall severity
   */
  calculateComposite() {
    // If we have GAD-7, use it as primary generalized anxiety
    if (this.scores.gad7.total > 0) {
      this.scores.composite.score = this.scores.gad7.total;
      this.scores.composite.severity = this.scores.gad7.severity;
    }

    // Determine primary anxiety type
    const subscales = [
      { type: 'Generalized Anxiety', avg: this.scores.gad7.total / 7 },
      { type: 'Panic Disorder', avg: this.scores.panic.average },
      { type: 'Social Anxiety', avg: this.scores.socialAnxiety.average },
      { type: 'OCD', avg: this.scores.ocd.average },
      { type: 'PTSD', avg: this.scores.ptsd.average }
    ];

    // Find highest subscale
    const primary = subscales.reduce((max, current) =>
      current.avg > max.avg ? current : max
    );

    if (primary.avg > 0) {
      this.scores.composite.primaryType = primary.type;
    }
  }

  /**
   * Get comprehensive anxiety report
   */
  getAnxietyReport() {
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
    const severity = this.scores.composite.severity;
    const type = this.scores.composite.primaryType;

    if (severity === 'Unknown') {
      return 'Anxiety severity could not be determined (insufficient data).';
    }

    if (severity === 'Minimal') {
      return 'No clinically significant anxiety symptoms detected.';
    }

    let summary = `${severity} anxiety symptoms detected`;

    if (type !== 'Unknown' && type !== 'Generalized Anxiety') {
      summary += `, primarily ${type}`;
    }

    summary += '. Professional evaluation recommended.';

    return summary;
  }

  /**
   * Get clinical recommendations based on anxiety type and severity
   */
  getRecommendations() {
    const recommendations = [];
    const severity = this.scores.composite.severity;

    if (severity === 'Mild') {
      recommendations.push('Consider stress management techniques (deep breathing, mindfulness, exercise)');
      recommendations.push('Monitor symptoms; seek help if they interfere with daily functioning');
    }

    if (severity === 'Moderate' || severity === 'Severe') {
      recommendations.push('Seek evaluation from a mental health professional');
      recommendations.push('Evidence-based treatments include CBT, exposure therapy, and/or medication');
    }

    // Type-specific recommendations
    if (this.scores.panic.severity !== 'Minimal' && this.scores.panic.severity !== 'Unknown') {
      recommendations.push('For panic: CBT with interoceptive exposure is highly effective');
    }

    if (this.scores.socialAnxiety.severity !== 'Minimal' && this.scores.socialAnxiety.severity !== 'Unknown') {
      recommendations.push('For social anxiety: Cognitive restructuring and gradual exposure to social situations');
    }

    if (this.scores.ocd.severity !== 'Minimal' && this.scores.ocd.severity !== 'Unknown') {
      recommendations.push('For OCD: Exposure and Response Prevention (ERP) is the gold standard treatment');
    }

    if (this.scores.ptsd.severity !== 'Minimal' && this.scores.ptsd.severity !== 'Unknown') {
      recommendations.push('For PTSD: Trauma-focused CBT or EMDR with a trauma specialist');
    }

    return recommendations;
  }

  /**
   * Get critical alerts
   */
  getAlerts() {
    const alerts = [];

    // Severe anxiety alert
    if (this.scores.gad7.severityLevel >= 3) {
      alerts.push({
        type: 'SEVERE_ANXIETY',
        severity: 'HIGH',
        message: 'Severe anxiety detected',
        score: this.scores.gad7.total,
        recommendation: 'Professional evaluation and treatment strongly recommended'
      });
    }

    // Panic with avoidance alert
    const panicAvoidance = this.findResponse('ANXIETY_PANIC_4');
    if (panicAvoidance && this.getLikertScore(panicAvoidance) >= 4) {
      alerts.push({
        type: 'PANIC_WITH_AVOIDANCE',
        severity: 'MODERATE',
        message: 'Panic disorder with agoraphobic avoidance detected',
        recommendation: 'CBT with gradual exposure recommended to prevent further restriction of activities'
      });
    }

    return alerts;
  }

  /**
   * Helper: Get GAD-7 specific score (0-3)
   */
  getGad7Score(response) {
    const scoreMap = {
      'Not at all': 0,
      'Several days': 1,
      'More than half the days': 2,
      'Nearly every day': 3,
      // Fallback to likert if needed
      'Strongly Disagree': 0,
      'Disagree': 1,
      'Neutral': 1,
      'Agree': 2,
      'Strongly Agree': 3
    };

    if (typeof response.score === 'number') {
      // Convert 1-5 likert to 0-3 GAD-7
      return Math.min(3, Math.max(0, response.score - 1));
    }

    return scoreMap[response.response] || scoreMap[response.value] || 0;
  }

  /**
   * Helper: Get standard likert score (1-5)
   */
  getLikertScore(response) {
    if (typeof response.score === 'number') {
      return response.score;
    }

    const scoreMap = {
      'Strongly Disagree': 1,
      'Disagree': 2,
      'Neutral': 3,
      'Agree': 4,
      'Strongly Agree': 5
    };

    return scoreMap[response.response] || scoreMap[response.value] || 3;
  }

  /**
   * Get GAD-7 severity category
   */
  getGad7Severity(score) {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    return 'Severe';
  }

  /**
   * Get GAD-7 severity level (0-3)
   */
  getGad7SeverityLevel(score) {
    if (score <= 4) return 0;
    if (score <= 9) return 1;
    if (score <= 14) return 2;
    return 3;
  }

  /**
   * Get severity for subscales based on average (1-5 scale)
   */
  getSubscaleSeverity(average) {
    if (average < 2.0) return 'Minimal';
    if (average < 3.0) return 'Mild';
    if (average < 4.0) return 'Moderate';
    return 'Severe';
  }

  /**
   * Helper: Find response by question ID
   */
  findResponse(questionId) {
    return this.responses.find(r => r.questionId === questionId);
  }
}

module.exports = AnxietyScorer;
