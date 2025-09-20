const logger = require('../utils/logger');

/**
 * Calculate percentile based on normal distribution
 */
function calculatePercentile(score, mean, stdDev) {
  const z = (score - mean) / stdDev;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const probability =
    d * t * (0.3193815 + t * (t * (1.781478 + t * (1.330274 * t - 1.821256)) - 0.3565638));
  const percentile = z > 0 ? 100 * (1 - probability) : 100 * probability;
  return Math.round(percentile);
}

/**
 * Calculate variability in a set of values
 */
function calculateVariability(values) {
  if (!values || values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate quality metrics for responses
 */
function calculateQualityMetrics(responses) {
  const responseTimes = responses.map(r => r.responseTime).filter(Boolean);
  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

  const values = responses.map(r => r.value);
  const uniqueValues = [...new Set(values)].length;
  const responseVariability = uniqueValues / Math.min(values.length, 7);

  // Check for straight-lining
  let maxConsecutive = 0;
  let currentConsecutive = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  const straightLining = maxConsecutive > 10;
  const carelessResponding = avgResponseTime < 1000 || responseVariability < 0.3;

  return {
    completionRate: responses.length / 100,
    avgResponseTime,
    responseVariability,
    straightLining,
    carelessResponding,
    dataQuality: responseVariability > 0.5 && !straightLining ? 'Good' : 'Review needed'
  };
}

/**
 * Interpret Big Five personality traits
 */
function interpretBigFive(trait, score) {
  const interpretations = {
    openness:
      score > 4 ? 'Creative and curious' : score > 3 ? 'Balanced' : 'Practical and conventional',
    conscientiousness:
      score > 4
        ? 'Organized and dependable'
        : score > 3
          ? 'Moderately organized'
          : 'Flexible and spontaneous',
    extraversion:
      score > 4
        ? 'Outgoing and energetic'
        : score > 3
          ? 'Ambiverted'
          : 'Reserved and introspective',
    agreeableness:
      score > 4
        ? 'Compassionate and cooperative'
        : score > 3
          ? 'Balanced'
          : 'Competitive and skeptical',
    neuroticism:
      score > 4
        ? 'Emotionally reactive'
        : score > 3
          ? 'Moderate emotional stability'
          : 'Emotionally stable'
  };

  return interpretations[trait] || 'Average';
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return 'neurlyn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Determine question count based on mode and tier
 */
function getQuestionCount(mode, tier) {
  if (mode === 'experimental') return 60;
  if (tier === 'core') return 80;
  if (tier === 'comprehensive') return 150;
  if (tier === 'specialized') return 200;
  return 100;
}

/**
 * Calculate match confidence for assessment results
 */
function calculateMatchConfidence(responses, scores, qualityMetrics) {
  let confidence = 75;

  if (responses.length > 80) confidence += 10;
  if (responses.length > 150) confidence += 5;
  if (qualityMetrics.dataQuality === 'Good') confidence += 10;
  if (qualityMetrics.carelessResponding) confidence -= 15;
  if (qualityMetrics.straightLining) confidence -= 10;

  // Check for consistency between related traits
  if (scores.neuroticism && scores.extraversion) {
    const combined = scores.neuroticism.percentile + scores.extraversion.percentile;
    if (Math.abs(combined - 100) < 40) confidence += 5;
  }

  return Math.min(95, Math.max(50, confidence));
}

module.exports = {
  calculatePercentile,
  calculateVariability,
  calculateQualityMetrics,
  interpretBigFive,
  generateSessionId,
  getQuestionCount,
  calculateMatchConfidence
};
