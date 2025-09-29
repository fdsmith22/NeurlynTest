/**
 * InsightTracker - Tracks how each answer contributes to personality insights
 * Provides transparency in the assessment algorithm
 */

class InsightTracker {
  constructor() {
    this.answerContributions = [];
    this.traitImpacts = {};
    this.archetypeInfluences = [];
    this.confidenceBreakdown = {};
    this.reasoningChains = [];
    this.criticalAnswers = [];
  }

  /**
   * Record how an answer impacts trait calculations
   */
  recordAnswerImpact(questionId, answer, trait, impact, reasoning) {
    const contribution = {
      questionId,
      questionText: this.getQuestionText(questionId),
      answer: answer.value || answer,
      answerText: this.getAnswerText(answer),
      trait,
      impact: impact, // -100 to +100 scale
      weight: answer.weight || 1,
      timestamp: answer.timestamp || Date.now(),
      responseTime: answer.responseTime || 0,
      reasoning,
      confidence: this.calculateAnswerConfidence(answer)
    };

    this.answerContributions.push(contribution);

    // Update trait impacts
    if (!this.traitImpacts[trait]) {
      this.traitImpacts[trait] = {
        totalImpact: 0,
        contributions: [],
        averageConfidence: 0
      };
    }

    this.traitImpacts[trait].contributions.push(contribution);
    this.traitImpacts[trait].totalImpact += impact * contribution.weight;
    this.updateAverageConfidence(trait);

    // Check if this is a critical answer (high impact)
    if (Math.abs(impact) > 15) {
      this.criticalAnswers.push({
        ...contribution,
        criticalityScore: Math.abs(impact)
      });
    }

    return contribution;
  }

  /**
   * Add reasoning chain showing how answers lead to conclusions
   */
  addReasoningChain(chain) {
    this.reasoningChains.push({
      id: `chain_${this.reasoningChains.length + 1}`,
      timestamp: Date.now(),
      ...chain
    });
  }

  /**
   * Calculate confidence for a specific answer
   */
  calculateAnswerConfidence(answer) {
    let confidence = 1.0;

    // Response time factor
    if (answer.responseTime) {
      if (answer.responseTime < 1000)
        confidence *= 0.7; // Too fast
      else if (answer.responseTime > 30000) confidence *= 0.8; // Too slow
    }

    // Consistency with previous answers
    if (answer.consistencyScore) {
      confidence *= answer.consistencyScore;
    }

    // Pattern detection (e.g., all same answers)
    if (answer.patternDetected) {
      confidence *= 0.6;
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Update average confidence for a trait
   */
  updateAverageConfidence(trait) {
    const contributions = this.traitImpacts[trait].contributions;
    const avgConfidence =
      contributions.reduce((sum, c) => sum + c.confidence, 0) / contributions.length;
    this.traitImpacts[trait].averageConfidence = avgConfidence;
  }

  /**
   * Record how traits influence archetype determination
   */
  recordArchetypeInfluence(archetype, traits, confidence, reasoning) {
    this.archetypeInfluences.push({
      archetype,
      traits: { ...traits },
      confidence,
      reasoning,
      primaryFactors: this.identifyPrimaryFactors(traits),
      alternativeArchetypes: this.findAlternatives(traits)
    });
  }

  /**
   * Identify which traits most influenced the archetype
   */
  identifyPrimaryFactors(traits) {
    const sorted = Object.entries(traits).sort(
      ([, a], [, b]) => Math.abs(b - 50) - Math.abs(a - 50)
    );

    return sorted.slice(0, 3).map(([trait, value]) => ({
      trait,
      value,
      deviation: Math.abs(value - 50),
      influence: this.calculateInfluence(trait, value)
    }));
  }

  /**
   * Find alternative archetypes that were close matches
   */
  findAlternatives(traits) {
    // This would check against all archetype patterns
    // Simplified for demonstration
    const alternatives = [];

    if (traits.openness > 60 && traits.conscientiousness > 55) {
      alternatives.push({
        archetype: 'Strategic Innovator',
        matchScore: 0.85,
        missingFactors: ['Higher conscientiousness needed']
      });
    }

    return alternatives;
  }

  /**
   * Calculate how much a trait influences archetype selection
   */
  calculateInfluence(trait, value) {
    const deviation = Math.abs(value - 50);
    if (deviation > 30) return 'Very High';
    if (deviation > 20) return 'High';
    if (deviation > 10) return 'Moderate';
    return 'Low';
  }

  /**
   * Generate confidence breakdown for the entire assessment
   */
  generateConfidenceBreakdown() {
    const breakdown = {
      overall: 0,
      byTrait: {},
      byCategory: {},
      factors: []
    };

    // Calculate trait-specific confidence
    Object.keys(this.traitImpacts).forEach(trait => {
      breakdown.byTrait[trait] = {
        confidence: this.traitImpacts[trait].averageConfidence,
        sampleSize: this.traitImpacts[trait].contributions.length,
        reliability: this.calculateReliability(trait)
      };
    });

    // Response quality factors
    const responseQuality = this.assessResponseQuality();
    breakdown.factors.push({
      name: 'Response Quality',
      score: responseQuality,
      impact: 'High'
    });

    // Consistency factors
    const consistency = this.assessConsistency();
    breakdown.factors.push({
      name: 'Answer Consistency',
      score: consistency,
      impact: 'High'
    });

    // Calculate overall confidence
    breakdown.overall = this.calculateOverallConfidence(breakdown);

    this.confidenceBreakdown = breakdown;
    return breakdown;
  }

  /**
   * Assess quality of responses
   */
  assessResponseQuality() {
    const contributions = this.answerContributions;

    // Check response time distribution
    const avgResponseTime =
      contributions.reduce((sum, c) => sum + (c.responseTime || 5000), 0) / contributions.length;
    const timeQuality = avgResponseTime > 2000 && avgResponseTime < 20000 ? 1.0 : 0.7;

    // Check for patterns (e.g., all same answers)
    const uniqueAnswers = new Set(contributions.map(c => c.answer)).size;
    const patternQuality = uniqueAnswers / contributions.length;

    return (timeQuality + patternQuality) / 2;
  }

  /**
   * Assess consistency of answers
   */
  assessConsistency() {
    // Check for contradictory answers to similar questions
    // Simplified implementation
    let consistencyScore = 1.0;

    // Group by trait and check variance
    Object.values(this.traitImpacts).forEach(traitData => {
      const impacts = traitData.contributions.map(c => c.impact);
      const variance = this.calculateVariance(impacts);
      if (variance > 30) consistencyScore *= 0.9;
    });

    return consistencyScore;
  }

  /**
   * Calculate variance of an array
   */
  calculateVariance(arr) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length);
  }

  /**
   * Calculate reliability score for a trait
   */
  calculateReliability(trait) {
    const contributions = this.traitImpacts[trait].contributions;
    if (contributions.length < 3) return 0.5;

    // Check consistency of impacts
    const impacts = contributions.map(c => c.impact);
    const variance = this.calculateVariance(impacts);

    if (variance < 10) return 0.9;
    if (variance < 20) return 0.7;
    return 0.5;
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(breakdown) {
    const traitConfidences = Object.values(breakdown.byTrait).map(
      t => t.confidence * t.reliability
    );

    const avgTraitConfidence =
      traitConfidences.reduce((sum, c) => sum + c, 0) / traitConfidences.length;
    const factorScore =
      breakdown.factors.reduce((sum, f) => sum + f.score, 0) / breakdown.factors.length;

    return avgTraitConfidence * 0.7 + factorScore * 0.3;
  }

  /**
   * Generate "Why This Result?" explanation
   */
  generateExplanation() {
    const explanation = {
      summary: this.generateSummaryExplanation(),
      criticalAnswers: this.getCriticalAnswersExplanation(),
      traitBreakdown: this.getTraitBreakdownExplanation(),
      archetypeReasoning: this.getArchetypeReasoningExplanation(),
      confidence: this.getConfidenceExplanation()
    };

    return explanation;
  }

  /**
   * Generate summary explanation
   */
  generateSummaryExplanation() {
    const topFactors = this.criticalAnswers
      .sort((a, b) => b.criticalityScore - a.criticalityScore)
      .slice(0, 3);

    return {
      text: 'Your personality assessment is based on careful analysis of all your responses.',
      keyFactors: topFactors.map(f => ({
        question: f.questionText,
        answer: f.answerText,
        impact: `Strongly influenced your ${f.trait} score`,
        confidence: `${Math.round(f.confidence * 100)}% confidence`
      }))
    };
  }

  /**
   * Explain critical answers
   */
  getCriticalAnswersExplanation() {
    return this.criticalAnswers.map(answer => ({
      question: answer.questionText,
      yourAnswer: answer.answerText,
      impact: {
        trait: answer.trait,
        direction: answer.impact > 0 ? 'increased' : 'decreased',
        magnitude: Math.abs(answer.impact),
        explanation: answer.reasoning
      }
    }));
  }

  /**
   * Explain trait calculations
   */
  getTraitBreakdownExplanation() {
    const breakdown = {};

    Object.entries(this.traitImpacts).forEach(([trait, data]) => {
      breakdown[trait] = {
        score: Math.round(data.totalImpact),
        confidence: `${Math.round(data.averageConfidence * 100)}%`,
        basedOn: `${data.contributions.length} responses`,
        topContributors: data.contributions
          .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
          .slice(0, 3)
          .map(c => ({
            question: c.questionText,
            impact: c.impact > 0 ? 'positive' : 'negative',
            weight: c.weight
          }))
      };
    });

    return breakdown;
  }

  /**
   * Explain archetype selection
   */
  getArchetypeReasoningExplanation() {
    if (this.archetypeInfluences.length === 0) return null;

    const influence = this.archetypeInfluences[0];
    return {
      selectedArchetype: influence.archetype,
      confidence: `${Math.round(influence.confidence * 100)}%`,
      primaryReasons: influence.primaryFactors.map(
        f => `${f.trait}: ${f.value}% (${f.influence} influence)`
      ),
      reasoning: influence.reasoning,
      alternatives: influence.alternativeArchetypes
    };
  }

  /**
   * Explain confidence levels
   */
  getConfidenceExplanation() {
    const breakdown = this.confidenceBreakdown;
    return {
      overall: `${Math.round(breakdown.overall * 100)}%`,
      factors: breakdown.factors.map(f => ({
        name: f.name,
        score: `${Math.round(f.score * 100)}%`,
        impact: f.impact
      })),
      interpretation: this.interpretConfidence(breakdown.overall)
    };
  }

  /**
   * Interpret confidence level
   */
  interpretConfidence(confidence) {
    if (confidence > 0.85)
      return 'Very high confidence - your responses were consistent and thoughtful';
    if (confidence > 0.7) return 'Good confidence - your responses provide reliable insights';
    if (confidence > 0.55)
      return 'Moderate confidence - consider retaking for more accurate results';
    return 'Low confidence - responses may not fully reflect your personality';
  }

  /**
   * Helper methods for question/answer text
   * These would connect to your question bank in production
   */
  getQuestionText(questionId) {
    // Placeholder - would fetch from question bank
    return `Question ${questionId}`;
  }

  getAnswerText(answer) {
    // Placeholder - would map answer values to text
    const answerMap = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree'
    };
    return answerMap[answer.value || answer] || `Answer ${answer}`;
  }

  /**
   * Get all contributions for transparency
   */
  getContributions() {
    return this.answerContributions;
  }

  /**
   * Export insights for display
   */
  exportInsights() {
    return {
      contributions: this.answerContributions,
      traitImpacts: this.traitImpacts,
      archetypeInfluences: this.archetypeInfluences,
      confidenceBreakdown: this.generateConfidenceBreakdown(),
      explanation: this.generateExplanation(),
      reasoningChains: this.reasoningChains,
      criticalAnswers: this.criticalAnswers
    };
  }
}

// Export for use in assessment system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InsightTracker;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.InsightTracker = InsightTracker;
}
