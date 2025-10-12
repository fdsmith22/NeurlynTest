/**
 * Adaptive Question Difficulty System
 *
 * Adjusts question difficulty and type based on user's response pattern:
 * - Fence-sitters (always 3) → get more polarizing questions
 * - Extreme responders (always 1 or 5) → get more nuanced questions
 * - Consistent responders → get varied questions for validation
 *
 * Based on Computerized Adaptive Testing (CAT) principles
 */

class AdaptiveQuestionDifficulty {
  constructor() {
    this.responsePatterns = {
      extremeResponding: 0,
      fenceSitting: 0,
      variance: 0,
      consistency: 0
    };
  }

  /**
   * Analyze user's response pattern
   */
  analyzeResponsePattern(allResponses) {
    if (allResponses.length < 5) {
      return {
        pattern: 'INSUFFICIENT_DATA',
        preferredQuestionType: 'STANDARD',
        confidence: 0
      };
    }

    const values = allResponses.map(r => r.value || r.response);

    // Calculate pattern metrics
    const extremityScore = this.calculateExtremityScore(values);
    const fenceSittingScore = this.calculateFenceSittingScore(values);
    const variance = this.calculateVariance(values);
    const consistency = this.calculateConsistency(allResponses);

    // Store for later use
    this.responsePatterns = {
      extremeResponding: extremityScore,
      fenceSitting: fenceSittingScore,
      variance,
      consistency
    };

    // Determine preferred question type
    const analysis = this.determinePreferredQuestionType(
      extremityScore,
      fenceSittingScore,
      variance,
      consistency
    );

    return analysis;
  }

  /**
   * Calculate extremity score (how often user picks 1 or 5)
   */
  calculateExtremityScore(values) {
    const extremeCount = values.filter(v => v === 1 || v === 5).length;
    return extremeCount / values.length;
  }

  /**
   * Calculate fence-sitting score (how often user picks 3)
   */
  calculateFenceSittingScore(values) {
    const neutralCount = values.filter(v => v === 3).length;
    return neutralCount / values.length;
  }

  /**
   * Calculate variance in responses
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  /**
   * Calculate consistency (similar responses for similar questions)
   */
  calculateConsistency(allResponses) {
    const traitResponses = {};

    // Group by trait
    for (const response of allResponses) {
      const trait = response.trait;
      if (!trait) continue;

      if (!traitResponses[trait]) traitResponses[trait] = [];
      traitResponses[trait].push(response.value || response.response);
    }

    // Calculate average consistency within traits
    let totalConsistency = 0;
    let traitCount = 0;

    for (const values of Object.values(traitResponses)) {
      if (values.length < 2) continue;

      const variance = this.calculateVariance(values);
      const consistency = 1 - (Math.sqrt(variance) / 2); // Normalize to 0-1

      totalConsistency += consistency;
      traitCount++;
    }

    return traitCount > 0 ? totalConsistency / traitCount : 0.5;
  }

  /**
   * Determine preferred question type based on pattern
   */
  determinePreferredQuestionType(extremityScore, fenceSittingScore, variance, consistency) {
    const analysis = {
      pattern: '',
      preferredQuestionType: 'STANDARD',
      reasoning: '',
      adjustments: [],
      confidence: 0.70
    };

    // FENCE-SITTING PATTERN
    if (fenceSittingScore > 0.50) {
      analysis.pattern = 'FENCE_SITTING';
      analysis.preferredQuestionType = 'POLARIZING';
      analysis.reasoning = 'User tends to avoid commitments. Use more polarizing questions to force clearer distinctions.';
      analysis.adjustments = [
        'Prefer forced-choice questions',
        'Use "always/never" language',
        'Avoid middle-ground options',
        'Use concrete behavioral examples'
      ];
      analysis.confidence = 0.80;
    }

    // EXTREME RESPONDING PATTERN
    else if (extremityScore > 0.70) {
      analysis.pattern = 'EXTREME_RESPONDING';
      analysis.preferredQuestionType = 'NUANCED';
      analysis.reasoning = 'User responds in extremes. Use more nuanced questions to capture subtlety.';
      analysis.adjustments = [
        'Use frequency-based questions ("how often")',
        'Include context-specific scenarios',
        'Use graduated intensity questions',
        'Avoid absolute language'
      ];
      analysis.confidence = 0.75;
    }

    // INCONSISTENT PATTERN
    else if (consistency < 0.50 && variance > 1.5) {
      analysis.pattern = 'INCONSISTENT';
      analysis.preferredQuestionType = 'CONCRETE';
      analysis.reasoning = 'Inconsistent responses suggest confusion. Use more concrete, behavioral questions.';
      analysis.adjustments = [
        'Use specific behavioral examples',
        'Avoid abstract concepts',
        'Include time frames ("in the past week")',
        'Use simple, clear language'
      ];
      analysis.confidence = 0.65;
    }

    // HIGHLY CONSISTENT PATTERN
    else if (consistency > 0.85) {
      analysis.pattern = 'HIGHLY_CONSISTENT';
      analysis.preferredQuestionType = 'VARIED';
      analysis.reasoning = 'Very consistent responses. Introduce variety for validation.';
      analysis.adjustments = [
        'Mix question formats',
        'Include reverse-scored items',
        'Vary response scales',
        'Add situational context'
      ];
      analysis.confidence = 0.70;
    }

    // BALANCED PATTERN
    else {
      analysis.pattern = 'BALANCED';
      analysis.preferredQuestionType = 'STANDARD';
      analysis.reasoning = 'Balanced response pattern. Continue with standard questions.';
      analysis.adjustments = [];
      analysis.confidence = 0.60;
    }

    return analysis;
  }

  /**
   * Score questions based on difficulty match
   *
   * @param {Object} question - Question to score
   * @param {String} preferredType - Preferred question type from analysis
   * @returns {Number} Score (0-100)
   */
  scoreQuestionMatch(question, preferredType) {
    let score = 50; // Base score

    const questionText = question.text?.toLowerCase() || '';

    switch (preferredType) {
      case 'POLARIZING':
        // Prefer questions with strong language
        if (questionText.includes('always') || questionText.includes('never')) score += 30;
        if (questionText.includes('typically') || questionText.includes('usually')) score += 15;
        if (questionText.includes('sometimes') || questionText.includes('occasionally')) score -= 20;

        // Prefer forced-choice formats
        if (question.responseType === 'binary') score += 25;
        break;

      case 'NUANCED':
        // Prefer frequency-based questions
        if (question.responseType === 'frequency') score += 30;
        if (questionText.includes('how often')) score += 25;
        if (questionText.includes('sometimes')) score += 15;

        // Avoid absolute language
        if (questionText.includes('always') || questionText.includes('never')) score -= 25;
        break;

      case 'CONCRETE':
        // Prefer behavioral, specific questions
        if (questionText.includes('i do') || questionText.includes('i have')) score += 20;
        if (questionText.includes('in the past')) score += 20;
        if (question.tags?.includes('behavioral')) score += 25;

        // Avoid abstract questions
        if (question.tags?.includes('abstract')) score -= 20;
        break;

      case 'VARIED':
        // Prefer questions that add variety
        if (question.reverseScored) score += 15;
        if (question.responseType !== 'likert') score += 10;
        break;

      case 'STANDARD':
        // No special preferences
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get recommendations for question design
   */
  getRecommendations(pattern) {
    const recommendations = {
      FENCE_SITTING: {
        doMore: [
          'Use forced-choice formats',
          'Ask about specific behaviors rather than tendencies',
          'Use "always/never" language to force commitment',
          'Frame questions in terms of concrete actions'
        ],
        doLess: [
          'Avoid Likert scales with neutral midpoint',
          'Reduce abstract or philosophical questions',
          'Minimize "sometimes" or "maybe" language'
        ]
      },
      EXTREME_RESPONDING: {
        doMore: [
          'Use frequency scales (never/rarely/sometimes/often/always)',
          'Ask context-specific questions',
          'Use graded intensity (mild/moderate/severe)',
          'Include situational qualifiers'
        ],
        doLess: [
          'Avoid simple agree/disagree formats',
          'Reduce absolute statements',
          'Minimize binary choices'
        ]
      },
      INCONSISTENT: {
        doMore: [
          'Use concrete behavioral examples',
          'Include specific time frames',
          'Ask about observable actions',
          'Use simple, clear language'
        ],
        doLess: [
          'Avoid abstract concepts',
          'Reduce complex sentences',
          'Minimize philosophical questions'
        ]
      },
      HIGHLY_CONSISTENT: {
        doMore: [
          'Add reverse-scored items for validation',
          'Mix question formats',
          'Include validity check questions',
          'Vary response scales'
        ],
        doLess: [
          'Do not cluster similar questions together'
        ]
      }
    };

    return recommendations[pattern] || { doMore: [], doLess: [] };
  }

  /**
   * Get current response pattern summary
   */
  getPatternSummary() {
    return {
      patterns: this.responsePatterns,
      interpretation: {
        extremeResponding: this.interpretScore(this.responsePatterns.extremeResponding, 'extreme'),
        fenceSitting: this.interpretScore(this.responsePatterns.fenceSitting, 'fence'),
        consistency: this.interpretScore(this.responsePatterns.consistency, 'consistency')
      }
    };
  }

  /**
   * Interpret pattern scores
   */
  interpretScore(score, type) {
    switch (type) {
      case 'extreme':
        if (score > 0.80) return 'Very high - almost all responses are extreme (1 or 5)';
        if (score > 0.60) return 'High - frequent use of extreme responses';
        if (score > 0.40) return 'Moderate - balanced use of scale';
        if (score > 0.20) return 'Low - infrequent use of extremes';
        return 'Very low - rarely uses extremes';

      case 'fence':
        if (score > 0.60) return 'Very high - strong tendency to choose neutral (3)';
        if (score > 0.45) return 'High - frequent neutral responses';
        if (score > 0.30) return 'Moderate - balanced scale use';
        if (score > 0.15) return 'Low - infrequent neutral responses';
        return 'Very low - rarely neutral';

      case 'consistency':
        if (score > 0.85) return 'Very high - extremely consistent within traits';
        if (score > 0.70) return 'High - good consistency';
        if (score > 0.55) return 'Moderate - acceptable consistency';
        if (score > 0.40) return 'Low - some inconsistency';
        return 'Very low - high inconsistency';

      default:
        return 'Unknown';
    }
  }

  /**
   * Reset for new assessment
   */
  reset() {
    this.responsePatterns = {
      extremeResponding: 0,
      fenceSitting: 0,
      variance: 0,
      consistency: 0
    };
  }
}

module.exports = AdaptiveQuestionDifficulty;
