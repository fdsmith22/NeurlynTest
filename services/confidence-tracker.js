/**
 * Confidence Tracker - Core confidence calculation system
 * Tracks response consistency and confidence per dimension
 *
 * Confidence Formula: baseConfidence + consistencyBonus + discriminationBonus
 * - Base: min(questionCount * 15, 60) - more questions = higher base
 * - Consistency: (1 - variance/4) * 30 - low variance = higher consistency
 * - Discrimination: 10 (fixed) - assumes high-quality questions
 */

class ConfidenceTracker {
  constructor() {
    this.dimensions = new Map(); // dimension -> { score, confidence, questionCount, responses[] }
  }

  /**
   * Update confidence for a dimension based on new response
   * @param {string} dimension - Big Five trait, clinical scale, etc.
   * @param {object} newResponse - { questionId, score, timestamp, discriminationIndex?, responseTime? }
   */
  updateConfidence(dimension, newResponse) {
    if (!this.dimensions.has(dimension)) {
      this.dimensions.set(dimension, {
        score: 0,
        confidence: 0,
        questionCount: 0,
        responses: []
      });
    }

    const dim = this.dimensions.get(dimension);
    dim.responses.push(newResponse);
    dim.questionCount = dim.responses.length;

    // Calculate average score
    dim.score = dim.responses.reduce((sum, r) => sum + r.score, 0) / dim.questionCount;

    // Calculate confidence (now includes question quality and response time)
    dim.confidence = this.calculateConfidence(dim.responses);

    return dim;
  }

  /**
   * Calculate confidence based on response pattern
   * Formula: baseConfidence + consistencyBonus + discriminationBonus + qualityBonus
   *
   * @param {Array} responses - Array of { questionId, score, timestamp, discriminationIndex?, responseTime? }
   * @returns {number} Confidence percentage (0-100)
   */
  calculateConfidence(responses) {
    const questionCount = responses.length;

    // Base confidence from question count (max 50%)
    // 1 question = 12%, 2 = 24%, 3 = 36%, 4+ = 48%, 5+ = 50%
    const baseConfidence = Math.min(questionCount * 10, 50);

    // Consistency bonus from low variance (max 25%)
    // Low variance = consistent responding = higher confidence
    // Adjusted: Less harsh penalty for natural trait variability
    const variance = this.calculateVariance(responses.map(r => r.score));
    const consistencyBonus = (1 - Math.min(variance / 6, 1)) * 25; // Changed denominator from 4 to 6

    // ENHANCED: Discrimination bonus based on actual question quality (max 15%)
    const avgDiscrimination = this.calculateAverageDiscrimination(responses);
    const discriminationBonus = avgDiscrimination * 15; // 0-1 scale × 15%

    // NEW: Response quality bonus based on response time (max 10%)
    const qualityBonus = this.calculateResponseQuality(responses) * 10;

    const totalConfidence = baseConfidence + consistencyBonus + discriminationBonus + qualityBonus;

    return Math.min(Math.max(totalConfidence, 0), 100);
  }

  /**
   * Calculate average discrimination index from responses
   * @param {Array} responses - Array with discriminationIndex field
   * @returns {number} Average discrimination (0-1 scale)
   */
  calculateAverageDiscrimination(responses) {
    const withDiscrimination = responses.filter(r => r.discriminationIndex !== undefined);

    if (withDiscrimination.length === 0) {
      return 0.7; // Default assumption: reasonably high quality
    }

    const avg = withDiscrimination.reduce((sum, r) => sum + r.discriminationIndex, 0) / withDiscrimination.length;
    return Math.max(0, Math.min(1, avg)); // Clamp to 0-1
  }

  /**
   * Calculate response quality from response times
   * Detects rapid clicking (too fast) and suspicious patterns
   * @param {Array} responses - Array with responseTime field
   * @returns {number} Quality score (0-1 scale)
   */
  calculateResponseQuality(responses) {
    const withTime = responses.filter(r => r.responseTime !== undefined && r.responseTime > 0);

    if (withTime.length === 0) {
      return 1.0; // No time data, assume good quality
    }

    let qualityScore = 1.0;

    // Check for rapid clicking (responses < 2 seconds are suspicious)
    const rapidResponses = withTime.filter(r => r.responseTime < 2000).length;
    const rapidPenalty = (rapidResponses / withTime.length) * 0.3; // Up to 30% penalty
    qualityScore -= rapidPenalty;

    // Check for straight-lining (all responses same time ± 500ms)
    const times = withTime.map(r => r.responseTime);
    const timeVariance = this.calculateVariance(times);
    if (timeVariance < 250000 && withTime.length >= 3) { // Variance < 500ms^2
      qualityScore -= 0.2; // 20% penalty for suspiciously consistent timing
    }

    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Calculate variance of scores
   * Higher variance = less consistent responding
   *
   * @param {Array<number>} scores - Array of numeric scores
   * @returns {number} Variance
   */
  calculateVariance(scores) {
    if (scores.length === 0) return 0;
    if (scores.length === 1) return 0; // Single response has no variance

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Check if dimension needs more questions
   *
   * @param {string} dimension - Dimension to check
   * @param {number} minQuestions - Minimum questions required
   * @param {number} targetConfidence - Target confidence percentage
   * @returns {boolean} True if needs more questions
   */
  needsMoreQuestions(dimension, minQuestions = 2, targetConfidence = 85) {
    const dim = this.dimensions.get(dimension);
    if (!dim) return true;

    if (dim.questionCount < minQuestions) return true;
    if (dim.confidence < targetConfidence) return true;

    return false;
  }

  /**
   * Get dimensions that need attention in current stage
   *
   * @param {number} stage - Current stage (1-4)
   * @returns {Array} Priority dimensions sorted by confidence gap
   */
  getPriorityDimensions(stage) {
    const thresholds = {
      1: { minQuestions: 1, targetConfidence: 30 },
      2: { minQuestions: 2, targetConfidence: 75 },
      3: { minQuestions: 3, targetConfidence: 85 },
      4: { minQuestions: 2, targetConfidence: 90 }
    };

    const threshold = thresholds[stage] || thresholds[1];
    const priorities = [];

    // Get all possible dimensions (Big Five + clinical + neurodiversity)
    const allDimensions = [
      'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
      'depression', 'anxiety', 'mania', 'psychosis', 'adhd', 'autism',
      'executive_function', 'sensory_processing'
    ];

    for (const dim of allDimensions) {
      if (this.needsMoreQuestions(dim, threshold.minQuestions, threshold.targetConfidence)) {
        const current = this.dimensions.get(dim) || { confidence: 0, questionCount: 0, score: 0 };
        priorities.push({
          dimension: dim,
          confidence: current.confidence,
          questionCount: current.questionCount,
          score: current.score,
          gap: threshold.targetConfidence - current.confidence
        });
      }
    }

    // Sort by largest confidence gap (most need = highest priority)
    return priorities.sort((a, b) => b.gap - a.gap);
  }

  /**
   * Get summary of all dimensions
   *
   * @returns {Object} Summary object with dimension data
   */
  getSummary() {
    const summary = {};
    for (const [dim, data] of this.dimensions.entries()) {
      summary[dim] = {
        score: Math.round(data.score),
        confidence: Math.round(data.confidence),
        questionCount: data.questionCount
      };
    }
    return summary;
  }

  /**
   * Check if ready for final report
   * All Big Five traits must have confidence >= 75%
   *
   * @returns {boolean} True if ready for report generation
   */
  isReadyForReport() {
    // All Big Five traits must have confidence >= 75%
    const requiredTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    for (const trait of requiredTraits) {
      const dim = this.dimensions.get(trait);
      if (!dim || dim.confidence < 75) return false;
    }

    return true;
  }

  /**
   * Get average confidence across Big Five traits
   *
   * @returns {number} Average confidence (0-100)
   */
  getAverageConfidence() {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    let total = 0;
    let count = 0;

    for (const trait of traits) {
      const dim = this.dimensions.get(trait);
      if (dim) {
        total += dim.confidence;
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  /**
   * Get dimensions that have reached confidence threshold (can skip)
   *
   * @param {number} threshold - Confidence threshold (default 85%)
   * @param {number} minQuestions - Minimum questions before skipping (default 2)
   * @returns {Array} Dimensions that can be skipped
   */
  getSkippableDimensions(threshold = 85, minQuestions = 2) {
    const skippable = [];

    for (const [dim, data] of this.dimensions.entries()) {
      if (data.confidence >= threshold && data.questionCount >= minQuestions) {
        skippable.push({
          dimension: dim,
          confidence: data.confidence,
          questionCount: data.questionCount
        });
      }
    }

    return skippable;
  }

  /**
   * Export state for database storage
   *
   * @returns {Object} Serializable state object
   */
  toJSON() {
    return {
      dimensions: Object.fromEntries(this.dimensions),
      timestamp: new Date()
    };
  }

  /**
   * Restore from database
   *
   * @param {Object} data - Stored state object
   * @returns {ConfidenceTracker} New tracker instance
   */
  static fromJSON(data) {
    const tracker = new ConfidenceTracker();
    if (data.dimensions) {
      tracker.dimensions = new Map(Object.entries(data.dimensions));
    }
    return tracker;
  }

  /**
   * Get detailed statistics for a dimension
   *
   * @param {string} dimension - Dimension to analyze
   * @returns {Object} Detailed statistics
   */
  getDimensionStats(dimension) {
    const dim = this.dimensions.get(dimension);
    if (!dim) {
      return {
        exists: false,
        message: `No data for dimension: ${dimension}`
      };
    }

    const scores = dim.responses.map(r => r.score);
    const variance = this.calculateVariance(scores);
    const stdDev = Math.sqrt(variance);

    return {
      exists: true,
      dimension,
      score: Math.round(dim.score),
      confidence: Math.round(dim.confidence),
      questionCount: dim.questionCount,
      variance: variance.toFixed(2),
      standardDeviation: stdDev.toFixed(2),
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores)
      },
      responseTimeline: dim.responses.map(r => ({
        questionId: r.questionId,
        score: r.score,
        timestamp: r.timestamp
      }))
    };
  }
}

module.exports = ConfidenceTracker;
