/**
 * Confidence Band Calculator
 * Calculates statistical confidence intervals for personality traits and neurodiversity scores
 * Based on psychometric principles: Standard Error of Measurement (SEM) and sample reliability
 */

class ConfidenceBandCalculator {
  constructor() {
    // Reliability coefficients (Cronbach's alpha) for Big Five traits
    // Based on NEO-PI-R published reliabilities (typically 0.86-0.92)
    this.traitReliability = {
      openness: 0.87,
      conscientiousness: 0.90,
      extraversion: 0.89,
      agreeableness: 0.86,
      neuroticism: 0.92
    };

    // Standard deviation for trait scores (population SD ~15 on 0-100 scale)
    this.populationSD = 15;

    // Minimum questions needed for different confidence levels
    this.minQuestions = {
      high: 12,      // 12+ questions for high confidence
      moderate: 8,   // 8-11 questions for moderate
      low: 5,        // 5-7 questions for low
      insufficient: 0 // < 5 questions insufficient
    };
  }

  /**
   * Calculate confidence interval for a personality trait
   * Uses Standard Error of Measurement (SEM) formula: SEM = SD × √(1 - reliability)
   *
   * @param {string} trait - Trait name (openness, conscientiousness, etc.)
   * @param {number} score - Observed trait score (0-100)
   * @param {number} questionCount - Number of questions measuring this trait
   * @param {Array<number>} individualScores - Array of individual question scores for variance
   * @returns {Object} Confidence interval and metadata
   */
  calculateTraitConfidence(trait, score, questionCount, individualScores = []) {
    const reliability = this.traitReliability[trait] || 0.85;

    // Calculate Standard Error of Measurement
    const sem = this.populationSD * Math.sqrt(1 - reliability);

    // Adjust for sample size (fewer questions = wider interval)
    const sampleAdjustment = this.getSampleSizeAdjustment(questionCount);
    const adjustedSEM = sem * sampleAdjustment;

    // Calculate variance if individual scores provided
    let varianceConfidence = 1.0;
    if (individualScores.length >= 3) {
      const variance = this.calculateVariance(individualScores);
      const cv = Math.sqrt(variance) / (score || 1); // Coefficient of variation

      // High variance reduces confidence
      if (cv > 0.3) {
        varianceConfidence = 0.7;
      } else if (cv > 0.2) {
        varianceConfidence = 0.85;
      }
    }

    // 95% confidence interval (1.96 * SEM)
    const margin = 1.96 * adjustedSEM * varianceConfidence;
    const lower = Math.max(0, Math.round(score - margin));
    const upper = Math.min(100, Math.round(score + margin));

    // Determine confidence level
    const confidenceLevel = this.getConfidenceLevel(questionCount, margin);

    return {
      interval: {
        lower,
        upper,
        margin: Math.round(margin)
      },
      confidence: confidenceLevel.percentage,
      level: confidenceLevel.level,
      questionCount,
      metadata: {
        sem: Math.round(sem * 10) / 10,
        adjustedSEM: Math.round(adjustedSEM * 10) / 10,
        reliability,
        sampleAdjustment: Math.round(sampleAdjustment * 100) / 100,
        varianceConfidence: Math.round(varianceConfidence * 100) / 100
      }
    };
  }

  /**
   * Calculate confidence for neurodiversity domain scores
   * Stricter than personality traits due to diagnostic implications
   *
   * @param {string} domain - Domain name (executive, sensory, social, etc.)
   * @param {number} score - Domain score (0-100)
   * @param {number} questionCount - Number of questions for this domain
   * @param {Array<number>} individualScores - Individual question scores
   * @returns {Object} Confidence interval and diagnostic reliability
   */
  calculateNeurodiversityConfidence(domain, score, questionCount, individualScores = []) {
    // Neurodiversity assessments require more questions for confidence
    let questionConfidence = 0;
    if (questionCount >= 10) {
      questionConfidence = 1.0;
    } else if (questionCount >= 7) {
      questionConfidence = 0.75;
    } else if (questionCount >= 5) {
      questionConfidence = 0.6;
    } else if (questionCount >= 3) {
      questionConfidence = 0.4;
    } else {
      questionConfidence = 0.2;
    }

    // Score extremity confidence (extreme scores more reliable)
    let scoreConfidence = 1.0;
    if (score >= 40 && score <= 60) {
      scoreConfidence = 0.7; // Borderline scores less confident
    } else if (score >= 30 && score <= 70) {
      scoreConfidence = 0.85;
    }

    // Variance confidence
    let varianceConfidence = 1.0;
    if (individualScores.length >= 3) {
      const variance = this.calculateVariance(individualScores);
      const mean = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
      const stdDev = Math.sqrt(variance);

      // High standard deviation = inconsistent responses
      if (stdDev > 1.5) {
        varianceConfidence = 0.6;
      } else if (stdDev > 1.0) {
        varianceConfidence = 0.8;
      }
    }

    // Overall confidence (weighted)
    const overallConfidence = (
      questionConfidence * 0.5 +
      scoreConfidence * 0.3 +
      varianceConfidence * 0.2
    );

    // Calculate margin (stricter than personality traits)
    const baseMargin = 12; // Wider margin for neurodiversity
    const margin = baseMargin / overallConfidence;

    const lower = Math.max(0, Math.round(score - margin));
    const upper = Math.min(100, Math.round(score + margin));

    // Determine level and status
    let level, status;
    if (overallConfidence >= 0.8) {
      level = 'high';
      status = 'report';
    } else if (overallConfidence >= 0.6) {
      level = 'moderate';
      status = 'report_with_caveat';
    } else if (overallConfidence >= 0.4) {
      level = 'low';
      status = 'mention_insufficient';
    } else {
      level = 'insufficient';
      status = 'hide';
    }

    return {
      interval: {
        lower,
        upper,
        margin: Math.round(margin)
      },
      confidence: Math.round(overallConfidence * 100),
      level,
      status,
      questionCount,
      metadata: {
        questionConfidence,
        scoreConfidence,
        varianceConfidence,
        overallConfidence
      }
    };
  }

  /**
   * Generate confidence bands for radar chart visualization
   * Creates polygon points for confidence bands around data
   *
   * @param {Array<Object>} dataPoints - Array of {trait, score, x, y, angle, questionCount}
   * @param {Object} options - {centerX, centerY, radius}
   * @returns {string} SVG path/polygon elements for confidence bands
   */
  generateRadarConfidenceBands(dataPoints, options = {}) {
    const { centerX = 200, centerY = 200, radius = 150 } = options;

    const bands = [];

    dataPoints.forEach((point, i) => {
      const confidence = this.calculateTraitConfidence(
        point.trait,
        point.score,
        point.questionCount || 10
      );

      // Calculate inner and outer confidence boundary points
      const lowerR = (confidence.interval.lower / 100) * radius;
      const upperR = (confidence.interval.upper / 100) * radius;

      const lowerX = centerX + lowerR * Math.cos(point.angle);
      const lowerY = centerY + lowerR * Math.sin(point.angle);
      const upperX = centerX + upperR * Math.cos(point.angle);
      const upperY = centerY + upperR * Math.sin(point.angle);

      // Create confidence band segment
      const nextPoint = dataPoints[(i + 1) % dataPoints.length];
      const nextConfidence = this.calculateTraitConfidence(
        nextPoint.trait,
        nextPoint.score,
        nextPoint.questionCount || 10
      );

      const nextLowerR = (nextConfidence.interval.lower / 100) * radius;
      const nextUpperR = (nextConfidence.interval.upper / 100) * radius;

      const nextLowerX = centerX + nextLowerR * Math.cos(nextPoint.angle);
      const nextLowerY = centerY + nextLowerR * Math.sin(nextPoint.angle);
      const nextUpperX = centerX + nextUpperR * Math.cos(nextPoint.angle);
      const nextUpperY = centerY + nextUpperR * Math.sin(nextPoint.angle);

      // Create path for this segment's confidence band
      bands.push(`
        <path d="M ${lowerX},${lowerY}
                 L ${upperX},${upperY}
                 L ${nextUpperX},${nextUpperY}
                 L ${nextLowerX},${nextLowerY}
                 Z"
              fill="rgba(76, 175, 80, 0.1)"
              stroke="rgba(76, 175, 80, 0.3)"
              stroke-width="1"
              opacity="${confidence.level === 'high' ? '0.5' : '0.3'}" />
      `);
    });

    return bands.join('\n');
  }

  /**
   * Generate HTML for confidence disclaimer
   *
   * @param {string} level - Confidence level (high, moderate, low, insufficient)
   * @param {string} domain - Domain or trait name
   * @param {number} questionCount - Number of questions
   * @returns {string} HTML disclaimer
   */
  generateConfidenceDisclaimer(level, domain, questionCount) {
    const disclaimers = {
      high: `
        <div style="padding: 0.75rem; background: #ecfdf5; border-left: 3px solid #10b981; border-radius: 0.25rem; margin-top: 1rem;">
          <strong style="color: #065f46;">High Confidence:</strong>
          <span style="color: #047857;">Based on ${questionCount} questions, this assessment has strong statistical reliability.</span>
        </div>
      `,
      moderate: `
        <div style="padding: 0.75rem; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 0.25rem; margin-top: 1rem;">
          <strong style="color: #92400e;">Moderate Confidence:</strong>
          <span style="color: #b45309;">Based on ${questionCount} questions. Results should be interpreted as indicators rather than definitive assessments.</span>
        </div>
      `,
      low: `
        <div style="padding: 0.75rem; background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 0.25rem; margin-top: 1rem;">
          <strong style="color: #991b1b;">Low Confidence:</strong>
          <span style="color: #dc2626;">Based on only ${questionCount} questions. These results are preliminary and should be interpreted with caution. Consider this domain as requiring further exploration.</span>
        </div>
      `,
      insufficient: `
        <div style="padding: 0.75rem; background: #f3f4f6; border-left: 3px solid #6b7280; border-radius: 0.25rem; margin-top: 1rem;">
          <strong style="color: #374151;">Insufficient Data:</strong>
          <span style="color: #4b5563;">Insufficient questions (${questionCount}) for reliable ${domain} assessment. Results not displayed.</span>
        </div>
      `
    };

    return disclaimers[level] || '';
  }

  /**
   * Get sample size adjustment factor
   * Fewer questions = wider confidence interval
   */
  getSampleSizeAdjustment(questionCount) {
    if (questionCount >= 15) return 1.0;
    if (questionCount >= 12) return 1.1;
    if (questionCount >= 10) return 1.2;
    if (questionCount >= 8) return 1.3;
    if (questionCount >= 6) return 1.5;
    return 1.8; // Very few questions
  }

  /**
   * Determine confidence level based on question count and margin
   */
  getConfidenceLevel(questionCount, margin) {
    if (questionCount >= this.minQuestions.high && margin <= 8) {
      return { level: 'high', percentage: 95 };
    } else if (questionCount >= this.minQuestions.moderate && margin <= 12) {
      return { level: 'moderate', percentage: 85 };
    } else if (questionCount >= this.minQuestions.low) {
      return { level: 'low', percentage: 70 };
    } else {
      return { level: 'insufficient', percentage: 50 };
    }
  }

  /**
   * Calculate variance of an array of scores
   */
  calculateVariance(scores) {
    if (scores.length < 2) return 0;

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;

    return variance;
  }

  /**
   * Calculate confidence for all Big Five traits
   *
   * @param {Object} traitScores - {openness: score, conscientiousness: score, ...}
   * @param {Array<Object>} responses - Response data with trait metadata
   * @returns {Object} Confidence data for each trait
   */
  calculateAllTraitConfidences(traitScores, responses) {
    const confidences = {};

    Object.keys(traitScores).forEach(trait => {
      // Filter responses for this trait
      const traitResponses = responses.filter(r => r.trait === trait);
      const questionCount = traitResponses.length;
      const individualScores = traitResponses.map(r => r.score || r.value || 3);

      confidences[trait] = this.calculateTraitConfidence(
        trait,
        traitScores[trait],
        questionCount,
        individualScores
      );
    });

    return confidences;
  }
}

module.exports = ConfidenceBandCalculator;
