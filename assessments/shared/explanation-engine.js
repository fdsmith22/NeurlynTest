/**
 * ExplanationEngine - Generates reasoning chains showing how answers lead to conclusions
 * Provides clear, understandable explanations for personality assessment results
 */

class ExplanationEngine {
  constructor() {
    this.reasoningTemplates = this.initializeReasoningTemplates();
    this.insightPatterns = this.initializeInsightPatterns();
    this.explanationChains = [];
    this.keyInfluencers = [];
  }

  /**
   * Initialize reasoning templates for different trait patterns
   */
  initializeReasoningTemplates() {
    return {
      high_trait: {
        openness:
          'Your responses indicate strong intellectual curiosity and creative thinking. Questions about {specific_questions} showed you value novel experiences and abstract thinking.',
        conscientiousness:
          'Your answers demonstrate exceptional organization and reliability. Your responses to {specific_questions} reveal a methodical approach to achieving goals.',
        extraversion:
          'Your responses show you gain energy from social interactions. Questions about {specific_questions} indicate you thrive in collaborative environments.',
        agreeableness:
          'Your answers reflect strong empathy and cooperation. Your responses to {specific_questions} show you prioritize harmony and helping others.',
        neuroticism:
          "Your responses suggest sensitivity to emotional experiences. Questions about {specific_questions} indicate you're deeply aware of your emotional states."
      },
      low_trait: {
        openness:
          'Your responses indicate preference for familiar and practical approaches. Questions about {specific_questions} showed you value proven methods and concrete thinking.',
        conscientiousness:
          'Your answers suggest flexibility over rigid structure. Your responses to {specific_questions} reveal adaptability in your approach to goals.',
        extraversion:
          'Your responses show you recharge through solitude. Questions about {specific_questions} indicate you prefer deep focus and individual work.',
        agreeableness:
          'Your answers reflect independence and objectivity. Your responses to {specific_questions} show you prioritize logic and personal goals.',
        neuroticism:
          'Your responses suggest emotional stability and resilience. Questions about {specific_questions} indicate you maintain composure under pressure.'
      },
      trait_interaction: {
        high_openness_high_conscientiousness:
          'The combination of creativity and discipline creates a unique strength - you can both innovate and execute effectively.',
        high_extraversion_high_agreeableness:
          'Your social energy combined with empathy makes you naturally influential in positive ways.',
        low_extraversion_high_conscientiousness:
          'Your focus and discipline, combined with preference for deep work, enables exceptional individual achievement.',
        high_openness_low_conscientiousness:
          'Your creativity flows freely without rigid constraints, leading to spontaneous innovation.',
        low_neuroticism_high_conscientiousness:
          'Your emotional stability combined with strong discipline creates exceptional reliability under pressure.'
      }
    };
  }

  /**
   * Initialize insight patterns that connect answers to conclusions
   */
  initializeInsightPatterns() {
    return {
      leadership: {
        indicators: ['high_extraversion', 'high_conscientiousness', 'low_neuroticism'],
        explanation:
          'Your combination of social confidence, organizational skills, and emotional stability naturally positions you for leadership roles.'
      },
      innovation: {
        indicators: ['high_openness', 'moderate_to_high_extraversion'],
        explanation:
          'Your intellectual curiosity and willingness to share ideas creates an innovative mindset.'
      },
      analytical: {
        indicators: ['high_conscientiousness', 'low_extraversion', 'high_openness'],
        explanation:
          'Your methodical approach, focus capability, and intellectual depth enables deep analytical thinking.'
      },
      supportive: {
        indicators: ['high_agreeableness', 'moderate_conscientiousness'],
        explanation: 'Your empathy and reliability make you a natural support system for others.'
      },
      creative: {
        indicators: ['high_openness', 'low_conscientiousness'],
        explanation:
          'Your imagination flows freely without conventional constraints, fostering unique creative expression.'
      }
    };
  }

  /**
   * Generate explanation for how specific answers influenced the results
   */
  generateAnswerInfluenceExplanation(contributions, traits) {
    const explanations = [];
    const groupedByTrait = this.groupContributionsByTrait(contributions);

    Object.entries(groupedByTrait).forEach(([trait, traitContributions]) => {
      const traitScore = traits[trait] || 50;
      const highImpactAnswers = this.identifyHighImpactAnswers(traitContributions);
      const consistencyPattern = this.analyzeConsistencyPattern(traitContributions);

      explanations.push({
        trait,
        score: traitScore,
        reasoning: this.generateTraitReasoning(
          trait,
          traitScore,
          highImpactAnswers,
          consistencyPattern
        ),
        keyAnswers: highImpactAnswers.map(answer => ({
          question: answer.questionText,
          answer: answer.answerText,
          impact: this.describeImpact(answer.impact),
          confidence: answer.confidence
        })),
        pattern: consistencyPattern
      });
    });

    return explanations;
  }

  /**
   * Group contributions by trait
   */
  groupContributionsByTrait(contributions) {
    const grouped = {};
    contributions.forEach(contribution => {
      if (!grouped[contribution.trait]) {
        grouped[contribution.trait] = [];
      }
      grouped[contribution.trait].push(contribution);
    });
    return grouped;
  }

  /**
   * Identify answers with highest impact
   */
  identifyHighImpactAnswers(contributions) {
    return contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 3);
  }

  /**
   * Analyze consistency pattern in answers
   */
  analyzeConsistencyPattern(contributions) {
    const impacts = contributions.map(c => c.impact);
    const allPositive = impacts.every(i => i > 0);
    const allNegative = impacts.every(i => i < 0);
    const mixed = !allPositive && !allNegative;

    if (allPositive)
      return { type: 'consistent_high', description: 'Consistently indicated high levels' };
    if (allNegative)
      return { type: 'consistent_low', description: 'Consistently indicated low levels' };
    if (mixed) {
      const variance = this.calculateVariance(impacts);
      if (variance < 20)
        return { type: 'moderate', description: 'Balanced responses indicating moderate levels' };
      return { type: 'nuanced', description: 'Nuanced responses showing situational variation' };
    }
  }

  /**
   * Calculate variance for pattern analysis
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  }

  /**
   * Generate reasoning for a specific trait
   */
  generateTraitReasoning(trait, score, highImpactAnswers, pattern) {
    const level = score > 65 ? 'high' : score < 35 ? 'low' : 'moderate';
    let reasoning = '';

    if (level === 'high') {
      reasoning = this.reasoningTemplates.high_trait[trait];
    } else if (level === 'low') {
      reasoning = this.reasoningTemplates.low_trait[trait];
    } else {
      reasoning = `Your responses show balanced ${trait} levels. `;
    }

    // Replace placeholder with actual questions
    const questionTexts = highImpactAnswers.map(a => `"${a.questionText}"`).join(', ');
    reasoning = reasoning.replace('{specific_questions}', questionTexts);

    // Add pattern description
    reasoning += ` ${pattern.description}.`;

    return reasoning;
  }

  /**
   * Describe impact level in human-readable form
   */
  describeImpact(impact) {
    const absImpact = Math.abs(impact);
    const direction = impact > 0 ? 'increased' : 'decreased';

    if (absImpact > 20) return `Strongly ${direction}`;
    if (absImpact > 10) return `Moderately ${direction}`;
    return `Slightly ${direction}`;
  }

  /**
   * Generate archetype reasoning
   */
  generateArchetypeReasoning(archetype, traits) {
    const reasoning = {
      archetype: archetype.name,
      confidence: archetype.confidence,
      primaryFactors: [],
      explanation: '',
      alternatives: []
    };

    // Identify primary factors
    const traitLevels = this.categorizeTraitLevels(traits);
    reasoning.primaryFactors = this.identifyPrimaryArchetypeFactors(traitLevels, archetype);

    // Generate explanation
    reasoning.explanation = this.constructArchetypeExplanation(
      archetype,
      traitLevels,
      reasoning.primaryFactors
    );

    // Identify alternative archetypes
    reasoning.alternatives = this.identifyAlternativeArchetypes(traits, archetype);

    return reasoning;
  }

  /**
   * Categorize trait levels
   */
  categorizeTraitLevels(traits) {
    const levels = {};
    Object.entries(traits).forEach(([trait, score]) => {
      if (score > 65) levels[trait] = 'high';
      else if (score < 35) levels[trait] = 'low';
      else levels[trait] = 'moderate';
    });
    return levels;
  }

  /**
   * Identify primary factors for archetype selection
   */
  identifyPrimaryArchetypeFactors(traitLevels, archetype) {
    const factors = [];

    // Map archetypes to their key traits
    const archetypeTraits = {
      'Creative Visionary': ['high_openness', 'moderate_to_high_extraversion'],
      'Strategic Innovator': ['high_openness', 'high_conscientiousness'],
      'Analytical Thinker': ['high_conscientiousness', 'low_extraversion'],
      'Empathetic Connector': ['high_agreeableness', 'high_extraversion'],
      'Adaptive Explorer': ['high_openness', 'low_conscientiousness'],
      'Steady Achiever': ['high_conscientiousness', 'low_neuroticism']
    };

    const requiredTraits = archetypeTraits[archetype.name] || [];

    requiredTraits.forEach(requirement => {
      const [level, trait] = requirement.split('_').filter(part => part !== 'to');
      if (
        traitLevels[trait] === level ||
        (requirement.includes('moderate_to_high') &&
          ['moderate', 'high'].includes(traitLevels[trait]))
      ) {
        factors.push({
          trait,
          level: traitLevels[trait],
          importance: 'Primary'
        });
      }
    });

    return factors;
  }

  /**
   * Construct detailed archetype explanation
   */
  constructArchetypeExplanation(archetype, traitLevels, primaryFactors) {
    let explanation = `You've been identified as ${archetype.name} based on your unique personality pattern. `;

    // Describe primary factors
    if (primaryFactors.length > 0) {
      const factorDescriptions = primaryFactors.map(f => `${f.level} ${f.trait}`).join(', ');
      explanation += `Your ${factorDescriptions} are the key factors. `;
    }

    // Add trait interaction insights
    const traitCombo = this.identifyTraitCombination(traitLevels);
    if (this.reasoningTemplates.trait_interaction[traitCombo]) {
      explanation += this.reasoningTemplates.trait_interaction[traitCombo];
    }

    return explanation;
  }

  /**
   * Identify trait combination pattern
   */
  identifyTraitCombination(traitLevels) {
    const highTraits = Object.entries(traitLevels)
      .filter(([_, level]) => level === 'high')
      .map(([trait, _]) => trait);

    const lowTraits = Object.entries(traitLevels)
      .filter(([_, level]) => level === 'low')
      .map(([trait, _]) => trait);

    // Check for known combinations
    if (highTraits.includes('openness') && highTraits.includes('conscientiousness')) {
      return 'high_openness_high_conscientiousness';
    }
    if (highTraits.includes('extraversion') && highTraits.includes('agreeableness')) {
      return 'high_extraversion_high_agreeableness';
    }
    if (lowTraits.includes('extraversion') && highTraits.includes('conscientiousness')) {
      return 'low_extraversion_high_conscientiousness';
    }
    if (highTraits.includes('openness') && lowTraits.includes('conscientiousness')) {
      return 'high_openness_low_conscientiousness';
    }
    if (lowTraits.includes('neuroticism') && highTraits.includes('conscientiousness')) {
      return 'low_neuroticism_high_conscientiousness';
    }

    return null;
  }

  /**
   * Identify alternative archetypes
   */
  identifyAlternativeArchetypes(traits, selectedArchetype) {
    const alternatives = [];
    const archetypes = [
      { name: 'Creative Visionary', requirements: { openness: 65, extraversion: 50 } },
      { name: 'Strategic Innovator', requirements: { openness: 60, conscientiousness: 60 } },
      { name: 'Analytical Thinker', requirements: { conscientiousness: 60, extraversion: 40 } },
      { name: 'Empathetic Connector', requirements: { agreeableness: 65, extraversion: 55 } },
      { name: 'Adaptive Explorer', requirements: { openness: 65, conscientiousness: 40 } },
      { name: 'Steady Achiever', requirements: { conscientiousness: 65, neuroticism: 40 } }
    ];

    archetypes.forEach(archetype => {
      if (archetype.name === selectedArchetype.name) return;

      const matchScore = this.calculateArchetypeMatch(traits, archetype.requirements);
      if (matchScore > 0.7) {
        alternatives.push({
          name: archetype.name,
          matchScore,
          missingFactors: this.identifyMissingFactors(traits, archetype.requirements)
        });
      }
    });

    return alternatives.sort((a, b) => b.matchScore - a.matchScore).slice(0, 2);
  }

  /**
   * Calculate archetype match score
   */
  calculateArchetypeMatch(traits, requirements) {
    let matches = 0;
    let total = 0;

    Object.entries(requirements).forEach(([trait, threshold]) => {
      total++;
      const score = traits[trait] || 50;

      if (trait === 'extraversion' && threshold < 50) {
        if (score <= threshold + 10) matches++;
      } else if (trait === 'neuroticism' && threshold < 50) {
        if (score <= threshold + 10) matches++;
      } else {
        if (score >= threshold - 10) matches++;
      }
    });

    return matches / total;
  }

  /**
   * Identify missing factors for archetype
   */
  identifyMissingFactors(traits, requirements) {
    const missing = [];

    Object.entries(requirements).forEach(([trait, threshold]) => {
      const score = traits[trait] || 50;

      if (trait === 'extraversion' && threshold < 50) {
        if (score > threshold + 10) {
          missing.push(
            `Lower ${trait} needed (current: ${Math.round(score)}%, target: <${threshold}%)`
          );
        }
      } else if (trait === 'neuroticism' && threshold < 50) {
        if (score > threshold + 10) {
          missing.push(
            `Lower ${trait} needed (current: ${Math.round(score)}%, target: <${threshold}%)`
          );
        }
      } else {
        if (score < threshold - 10) {
          missing.push(
            `Higher ${trait} needed (current: ${Math.round(score)}%, target: >${threshold}%)`
          );
        }
      }
    });

    return missing;
  }

  /**
   * Generate insight patterns explanation
   */
  generateInsightPatternsExplanation(traits) {
    const insights = [];
    const traitLevels = this.categorizeTraitLevels(traits);

    Object.entries(this.insightPatterns).forEach(([pattern, config]) => {
      const matches = config.indicators.filter(indicator => {
        const [level, trait] = indicator.split('_');
        if (indicator.includes('moderate_to_high')) {
          const traitName = indicator.split('moderate_to_high_')[1];
          return ['moderate', 'high'].includes(traitLevels[traitName]);
        }
        return traitLevels[trait] === level;
      });

      if (matches.length >= config.indicators.length * 0.7) {
        insights.push({
          pattern,
          strength: matches.length / config.indicators.length,
          explanation: config.explanation
        });
      }
    });

    return insights.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Generate complete explanation chain
   */
  generateCompleteExplanation(contributions, traits, archetype) {
    const explanation = {
      summary: "Here's how we arrived at your personality assessment:",
      answerInfluence: this.generateAnswerInfluenceExplanation(contributions, traits),
      archetypeReasoning: this.generateArchetypeReasoning(archetype, traits),
      insightPatterns: this.generateInsightPatternsExplanation(traits),
      keyTakeaways: this.generateKeyTakeaways(traits, archetype)
    };

    this.explanationChains.push(explanation);
    return explanation;
  }

  /**
   * Generate key takeaways
   */
  generateKeyTakeaways(traits, archetype) {
    const takeaways = [];

    // Strongest trait
    const sortedTraits = Object.entries(traits).sort(([, a], [, b]) => b - a);
    const strongest = sortedTraits[0];
    takeaways.push({
      type: 'strength',
      message: `Your strongest trait is ${strongest[0]} (${Math.round(strongest[1])}%), which drives many of your behavioral patterns.`
    });

    // Most distinctive feature
    const mostDistinctive = sortedTraits.find(([_, score]) => score > 70 || score < 30);
    if (mostDistinctive) {
      const level = mostDistinctive[1] > 50 ? 'exceptionally high' : 'notably low';
      takeaways.push({
        type: 'distinctive',
        message: `Your ${level} ${mostDistinctive[0]} makes you stand out in specific situations.`
      });
    }

    // Archetype fit
    takeaways.push({
      type: 'archetype',
      message: `As a ${archetype.name}, you have unique strengths that can be leveraged for personal and professional growth.`
    });

    // Balance observation
    const variance = this.calculateVariance(Object.values(traits));
    if (variance < 15) {
      takeaways.push({
        type: 'balance',
        message: 'Your traits are well-balanced, giving you flexibility in different situations.'
      });
    } else if (variance > 25) {
      takeaways.push({
        type: 'contrast',
        message:
          'Your contrasting trait levels create a unique and distinctive personality profile.'
      });
    }

    return takeaways;
  }

  /**
   * Generate explanation (main interface method)
   */
  generateExplanation(contributions, traits, archetype) {
    return this.generateCompleteExplanation(contributions, traits, archetype);
  }

  /**
   * Export explanation data
   */
  exportExplanation() {
    return {
      chains: this.explanationChains,
      templates: this.reasoningTemplates,
      patterns: this.insightPatterns
    };
  }
}

// Export for use in assessment system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExplanationEngine;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ExplanationEngine = ExplanationEngine;
}
