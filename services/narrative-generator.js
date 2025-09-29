const natural = require('natural');
const sentiment = require('sentiment');
const compromise = require('compromise');
const InsightPattern = require('../models/InsightPattern');
const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

/**
 * Narrative Generator Service
 * Natural Language Generation for personalized psychological reports
 */
class NarrativeGenerator {
  constructor() {
    this.sentimentAnalyzer = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.templates = this.initializeTemplates();
    this.metaphors = this.initializeMetaphors();
    this.examples = this.initializeExamples();
  }

  /**
   * Generate comprehensive narrative report
   */
  async generateNarrative(profile, analysis, tier = 'standard') {
    try {
      const { traits, responses, demographics } = profile;

      // Load relevant insight patterns from database
      const insightPatterns = await InsightPattern.findMatchingPatterns(profile, tier);

      // Generate different sections based on tier
      const narrative = {
        executiveSummary: this.generateExecutiveSummary(traits, analysis, tier),
        traitAnalysis: this.generateTraitAnalysis(traits, analysis, insightPatterns),
        insights: this.generatePersonalizedInsights(traits, analysis, insightPatterns, tier),
        recommendations: this.generateRecommendations(traits, insightPatterns, tier),
        growthNarrative: this.generateGrowthNarrative(traits, analysis)
      };

      // Add comprehensive tier sections
      if (tier === 'comprehensive') {
        narrative.deepDive = this.generateDeepDive(traits, analysis, insightPatterns);
        narrative.metaphoricalJourney = this.generateMetaphoricalJourney(traits);
        narrative.personalizedExamples = this.generatePersonalizedExamples(traits, demographics);
        narrative.microHabits = this.generateMicroHabits(traits, analysis);
        narrative.validationStatements = this.generateValidationStatements(traits);
      }

      return narrative;
    } catch (error) {
      logger.error('Narrative generation error:', error);
      return this.getDefaultNarrative(tier);
    }
  }

  /**
   * Generate executive summary with dynamic content
   */
  generateExecutiveSummary(traits, analysis, tier) {
    const archetype = analysis?.clustering?.archetype || analysis?.archetype || 'Unique Individual';
    const dominantTrait = this.findDominantTrait(traits);
    const uniquePattern = this.identifyUniquePattern(traits);

    const template = this.selectTemplate('executive_summary', tier);

    const variables = {
      archetype,
      dominant_trait: dominantTrait.name,
      dominant_score: dominantTrait.score,
      unique_pattern: uniquePattern,
      similarity: analysis?.clustering?.similarity || 75,
      key_strength: this.identifyKeyStrength(traits),
      growth_area: this.identifyGrowthArea(traits),
      overall_balance: this.assessBalance(traits)
    };

    return this.substituteVariables(template, variables);
  }

  /**
   * Generate trait-by-trait analysis with contextual insights
   */
  generateTraitAnalysis(traits, analysis, insightPatterns) {
    const narratives = {};

    Object.entries(traits).forEach(([trait, score]) => {
      const level = this.getTraitLevel(score);
      const template = this.templates.traits[trait][level];

      // Find relevant insights for this trait
      const relevantInsights = insightPatterns
        .filter(p => p.pattern.traits.some(t => t.trait === trait))
        .slice(0, 3);

      const variables = {
        score,
        percentile: this.calculatePercentile(score),
        comparison: this.getComparison(score),
        impact: this.getTraitImpact(trait, score),
        examples: this.getTraitExamples(trait, level),
        interactions: this.getTraitInteractions(trait, traits)
      };

      let narrative = this.substituteVariables(template, variables);

      // Add insights if available
      if (relevantInsights.length > 0) {
        narrative += '\n\n' + this.weaveInsights(relevantInsights, { trait, score });
      }

      narratives[trait] = {
        narrative,
        score,
        level,
        insights: relevantInsights.map(i => i.pattern.insights.primaryInsight)
      };
    });

    return narratives;
  }

  /**
   * Generate personalized insights based on patterns
   */
  generatePersonalizedInsights(traits, analysis, insightPatterns, tier) {
    const insights = [];
    const maxInsights = tier === 'comprehensive' ? 15 : 7;

    // Process matched patterns
    insightPatterns.slice(0, maxInsights).forEach(match => {
      const { pattern, confidence } = match;

      const insight = {
        category: pattern.category,
        confidence: Math.round(confidence * 100),
        primary: this.personalizeInsight(pattern.insights.primaryInsight, traits),
        supporting: pattern.insights.supportingInsights.map(s => this.personalizeInsight(s, traits))
      };

      // Add metaphor if high confidence
      if (confidence > 0.7 && pattern.insights.metaphors.length > 0) {
        insight.metaphor = this.selectAndPersonalizeMetaphor(pattern.insights.metaphors, traits);
      }

      // Add example if comprehensive tier
      if (tier === 'comprehensive' && pattern.insights.examples.length > 0) {
        insight.example = this.selectAndPersonalizeExample(pattern.insights.examples, traits);
      }

      insights.push(insight);
    });

    // Add unique algorithmic insights
    insights.push(
      ...this.generateAlgorithmicInsights(traits, analysis, maxInsights - insights.length)
    );

    return insights;
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(traits, insightPatterns, tier) {
    const recommendations = {
      immediate: [],
      longTerm: [],
      resources: []
    };

    // Compile recommendations from matched patterns
    insightPatterns.forEach(match => {
      const pattern = match.pattern;

      if (pattern.recommendations.immediate) {
        recommendations.immediate.push(...pattern.recommendations.immediate);
      }
      if (pattern.recommendations.longTerm) {
        recommendations.longTerm.push(...pattern.recommendations.longTerm);
      }
      if (pattern.recommendations.resources) {
        recommendations.resources.push(...pattern.recommendations.resources);
      }
    });

    // Add trait-specific recommendations
    Object.entries(traits).forEach(([trait, score]) => {
      if (score < 35) {
        recommendations.immediate.push(this.generateDevelopmentRecommendation(trait, 'low'));
      } else if (score > 75) {
        recommendations.longTerm.push(this.generateLeverageRecommendation(trait, 'high'));
      }
    });

    // Limit and prioritize based on tier
    const immediateLimit = tier === 'comprehensive' ? 5 : 3;
    const longTermLimit = tier === 'comprehensive' ? 5 : 3;

    return {
      immediate: this.prioritizeRecommendations(recommendations.immediate, immediateLimit),
      longTerm: this.prioritizeRecommendations(recommendations.longTerm, longTermLimit),
      resources: this.categorizeResources(recommendations.resources)
    };
  }

  /**
   * Generate growth narrative
   */
  generateGrowthNarrative(traits, analysis) {
    const growthAreas = this.identifyGrowthAreas(traits);
    const strengths = this.identifyStrengths(traits);
    const trajectory = this.predictGrowthTrajectory(traits, analysis);

    const narrative = [];

    // Opening
    narrative.push(this.templates.growth.opening);

    // Current state
    const currentState = this.substituteVariables(this.templates.growth.currentState, {
      primary_strength: strengths[0],
      secondary_strength: strengths[1] || strengths[0],
      balance: this.assessBalance(traits)
    });
    narrative.push(currentState);

    // Growth opportunities
    growthAreas.forEach(area => {
      const opportunity = this.substituteVariables(this.templates.growth.opportunity, {
        trait: area.trait,
        current: area.current,
        potential: area.potential,
        strategy: area.strategy
      });
      narrative.push(opportunity);
    });

    // Future vision
    const vision = this.substituteVariables(this.templates.growth.vision, trajectory);
    narrative.push(vision);

    return narrative.join('\n\n');
  }

  /**
   * Generate deep dive analysis (comprehensive tier)
   */
  generateDeepDive(traits, analysis, insightPatterns) {
    const deepDive = {
      traitInteractions: this.analyzeTraitInteractions(traits),
      hiddenPatterns: this.uncoverHiddenPatterns(traits, analysis),
      paradoxes: this.identifyParadoxes(traits),
      evolutionaryPerspective: this.generateEvolutionaryPerspective(traits),
      culturalContext: this.generateCulturalContext(traits)
    };

    // Add neurodivergent insights if patterns detected
    const neurodivergentPatterns = insightPatterns.filter(
      p => p.pattern.category === 'neurodivergent_indicator'
    );

    if (neurodivergentPatterns.length > 0) {
      deepDive.neurodivergentInsights = this.generateNeurodivergentInsights(
        neurodivergentPatterns,
        traits
      );
    }

    return deepDive;
  }

  /**
   * Generate metaphorical journey narrative
   */
  generateMetaphoricalJourney(traits) {
    const dominantTrait = this.findDominantTrait(traits);
    const metaphorSet = this.metaphors[dominantTrait.name] || this.metaphors.default;

    const journey = {
      landscape: this.selectMetaphor(metaphorSet.landscapes, traits),
      character: this.selectMetaphor(metaphorSet.characters, traits),
      challenge: this.selectMetaphor(metaphorSet.challenges, traits),
      tool: this.selectMetaphor(metaphorSet.tools, traits),
      destination: this.selectMetaphor(metaphorSet.destinations, traits)
    };

    const template = this.templates.metaphorical_journey;
    return this.substituteVariables(template, journey);
  }

  /**
   * Generate personalized examples based on demographics
   */
  generatePersonalizedExamples(traits, demographics = {}) {
    const examples = [];
    const age = demographics.age || 30;
    const context = this.determineLifeContext(age, demographics);

    Object.entries(traits).forEach(([trait, score]) => {
      if (Math.abs(score - 50) > 20) {
        // Significant deviation
        const example = this.generateTraitExample(trait, score, context);
        examples.push(example);
      }
    });

    // Add interaction examples
    const interactions = this.identifySignificantInteractions(traits);
    interactions.forEach(interaction => {
      const example = this.generateInteractionExample(interaction, context);
      examples.push(example);
    });

    return examples;
  }

  /**
   * Generate micro-habits recommendations
   */
  generateMicroHabits(traits, analysis) {
    const habits = [];
    const targetCount = 10;

    // Generate habits for each trait needing development
    Object.entries(traits).forEach(([trait, score]) => {
      if (score < 40 || score > 80) {
        const traitHabits = this.generateTraitMicroHabits(trait, score);
        habits.push(...traitHabits);
      }
    });

    // Add habits based on detected patterns
    if (analysis.patterns && analysis.patterns.length > 0) {
      analysis.patterns.forEach(pattern => {
        const patternHabit = this.generatePatternMicroHabit(pattern);
        if (patternHabit) habits.push(patternHabit);
      });
    }

    // Sort by difficulty and impact
    habits.sort((a, b) => {
      const scoreA = a.impact * 10 - a.difficulty * 5;
      const scoreB = b.impact * 10 - b.difficulty * 5;
      return scoreB - scoreA;
    });

    return habits.slice(0, targetCount);
  }

  /**
   * Generate validation statements
   */
  generateValidationStatements(traits) {
    const statements = [];

    // Validate strengths
    Object.entries(traits).forEach(([trait, score]) => {
      if (score > 65) {
        const validation =
          this.templates.validations[trait]?.high ||
          `Your ${trait} is a genuine strength that others recognize and value.`;
        statements.push(this.personalizeValidation(validation, score));
      }
    });

    // Validate challenges
    Object.entries(traits).forEach(([trait, score]) => {
      if (score < 35) {
        const validation =
          this.templates.validations[trait]?.low ||
          `Your approach to ${trait} is valid and has its own advantages.`;
        statements.push(this.personalizeValidation(validation, score));
      }
    });

    // Add general validations
    statements.push(...this.generateGeneralValidations(traits));

    return statements;
  }

  // Helper methods

  substituteVariables(template, variables) {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  personalizeInsight(insight, traits) {
    let personalized = insight;

    // Replace trait scores
    Object.entries(traits).forEach(([trait, score]) => {
      personalized = personalized.replace(`{${trait}_score}`, score);
      personalized = personalized.replace(`{${trait}_level}`, this.getTraitLevel(score));
    });

    // Replace comparisons
    personalized = personalized.replace(/{comparison}/g, this.generateComparison(traits));

    return personalized;
  }

  findDominantTrait(traits) {
    let dominant = { name: 'balanced', score: 50 };
    let maxDeviation = 0;

    Object.entries(traits).forEach(([trait, score]) => {
      const deviation = Math.abs(score - 50);
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        dominant = { name: trait, score };
      }
    });

    return dominant;
  }

  identifyUniquePattern(traits) {
    const patterns = [];

    // High openness + High conscientiousness
    if (traits.openness > 70 && traits.conscientiousness > 70) {
      patterns.push('Strategic Innovator');
    }

    // Low neuroticism + High extraversion
    if (traits.neuroticism < 30 && traits.extraversion > 70) {
      patterns.push('Resilient Energizer');
    }

    // High agreeableness + Low extraversion
    if (traits.agreeableness > 70 && traits.extraversion < 30) {
      patterns.push('Quiet Supporter');
    }

    return patterns.length > 0 ? patterns[0] : 'Unique Blend';
  }

  identifyKeyStrength(traits) {
    const strengths = Object.entries(traits)
      .filter(([_, score]) => score > 70)
      .sort((a, b) => b[1] - a[1]);

    return strengths.length > 0 ? `Exceptional ${strengths[0][0]}` : 'Balanced personality profile';
  }

  identifyGrowthArea(traits) {
    const areas = Object.entries(traits)
      .filter(([_, score]) => score < 35)
      .sort((a, b) => a[1] - b[1]);

    return areas.length > 0 ? `Developing ${areas[0][0]}` : 'Continuous refinement';
  }

  assessBalance(traits) {
    const scores = Object.values(traits);
    const std = this.calculateStandardDeviation(scores);

    if (std < 15) return 'remarkably balanced';
    if (std < 25) return 'well-balanced';
    if (std < 35) return 'moderately varied';
    return 'distinctly contrasted';
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  getTraitLevel(score) {
    if (score < 30) return 'low';
    if (score < 70) return 'moderate';
    return 'high';
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    return Math.round(score * 0.9 + 5);
  }

  getComparison(score) {
    const percentile = this.calculatePercentile(score);
    if (percentile >= 90) return 'in the top 10%';
    if (percentile >= 75) return 'above 75% of people';
    if (percentile >= 25) return 'in the middle range';
    if (percentile >= 10) return 'below 75% of people';
    return 'in the lower 10%';
  }

  getTraitImpact(trait, score) {
    const impacts = {
      openness: {
        high: 'drives innovation and creative problem-solving',
        moderate: 'balances creativity with practicality',
        low: 'provides focused and practical approaches'
      },
      conscientiousness: {
        high: 'ensures exceptional reliability and achievement',
        moderate: 'balances structure with flexibility',
        low: 'allows for adaptability and spontaneity'
      },
      extraversion: {
        high: 'energizes social connections and leadership',
        moderate: 'adapts to various social contexts',
        low: 'enables deep focus and thoughtful reflection'
      },
      agreeableness: {
        high: 'fosters harmony and collaboration',
        moderate: 'balances cooperation with assertiveness',
        low: 'maintains objectivity and independence'
      },
      neuroticism: {
        high: 'provides heightened awareness and sensitivity',
        moderate: 'maintains emotional responsiveness',
        low: 'ensures emotional stability and resilience'
      }
    };

    const level = this.getTraitLevel(score);
    return impacts[trait]?.[level] || 'shapes your unique approach';
  }

  selectTemplate(type, tier) {
    const templates = this.templates[type];
    return templates[tier] || templates.standard;
  }

  initializeTemplates() {
    return {
      executive_summary: {
        standard: `Your personality profile reveals you as a {archetype}, characterized by your distinctive {dominant_trait} ({dominant_score}%). This {unique_pattern} pattern appears in approximately {similarity}% of individuals with similar profiles. Your {key_strength} combines with {growth_area} to create a {overall_balance} personality structure.`,
        comprehensive: `As a {archetype}, you represent a fascinating psychological profile that emerges from the intricate interplay of your personality dimensions. Your remarkably {dominant_trait} nature ({dominant_score}%) serves as the cornerstone of your psychological architecture, influencing how you perceive, process, and interact with the world around you. The {unique_pattern} pattern you exhibit is not merely a collection of traits, but a sophisticated system of cognitive and emotional processes that work in concert to create your unique way of being. With {similarity}% similarity to this archetype, you share core characteristics while maintaining your individual nuances. Your {key_strength} doesn't exist in isolation – it dynamically interacts with your {growth_area} to create a {overall_balance} personality structure that is both stable and adaptive.`
      },
      traits: {
        openness: {
          low: `With an openness score of {score}% ({comparison}), you demonstrate a preference for familiar, proven approaches. {impact}. This pragmatic orientation {examples}. {interactions}`,
          moderate: `Your openness score of {score}% ({comparison}) reflects a balanced approach to new experiences. {impact}. You selectively explore novel ideas while maintaining practical grounding. {interactions}`,
          high: `Your exceptional openness score of {score}% ({comparison}) reveals a profound curiosity and creative drive. {impact}. This intellectual adventurousness {examples}. {interactions}`
        },
        conscientiousness: {
          low: `At {score}% ({comparison}), your conscientiousness indicates a flexible, adaptable approach to life. {impact}. This spontaneous style {examples}. {interactions}`,
          moderate: `Your conscientiousness score of {score}% ({comparison}) shows balanced organization and flexibility. {impact}. You adapt your approach based on context and priorities. {interactions}`,
          high: `With a conscientiousness score of {score}% ({comparison}), you exemplify discipline and reliability. {impact}. This structured approach {examples}. {interactions}`
        },
        extraversion: {
          low: `Your extraversion score of {score}% ({comparison}) indicates an introverted temperament. {impact}. This reflective nature {examples}. {interactions}`,
          moderate: `At {score}% ({comparison}), your extraversion reflects ambivert qualities. {impact}. You fluidly adapt your social energy to different situations. {interactions}`,
          high: `Your extraversion score of {score}% ({comparison}) reveals a vibrant, socially energized nature. {impact}. This outgoing disposition {examples}. {interactions}`
        },
        agreeableness: {
          low: `With agreeableness at {score}% ({comparison}), you maintain strong independence and objectivity. {impact}. This analytical approach {examples}. {interactions}`,
          moderate: `Your agreeableness score of {score}% ({comparison}) balances empathy with assertiveness. {impact}. You navigate between cooperation and self-advocacy effectively. {interactions}`,
          high: `At {score}% ({comparison}), your agreeableness reflects deep empathy and cooperation. {impact}. This compassionate nature {examples}. {interactions}`
        },
        neuroticism: {
          low: `Your neuroticism score of {score}% ({comparison}) indicates exceptional emotional stability. {impact}. This resilience {examples}. {interactions}`,
          moderate: `At {score}% ({comparison}), your neuroticism reflects typical emotional responsiveness. {impact}. You experience a normal range of emotional responses. {interactions}`,
          high: `With neuroticism at {score}% ({comparison}), you experience heightened emotional sensitivity. {impact}. This deep sensitivity {examples}. {interactions}`
        }
      },
      growth: {
        opening: `Your psychological growth journey is unique to your personality configuration, offering specific pathways for development that honor both your strengths and growth edges.`,
        currentState: `Currently, your {primary_strength} serves as your psychological anchor, providing stability and confidence. This combines with your {secondary_strength} to create a {balance} foundation for growth.`,
        opportunity: `In developing your {trait} (currently at {current}%), you have the potential to reach {potential}% through {strategy}. This growth wouldn't diminish your existing strengths but would add new dimensions to your personality.`,
        vision: `Looking ahead, your growth trajectory suggests the emergence of an even more integrated personality – one that maintains your core strengths while developing new capacities for {potential_growth}.`
      },
      validations: {
        openness: {
          high: `Your creative and curious nature is a gift that brings innovation and fresh perspectives to everything you touch.`,
          low: `Your practical, grounded approach provides stability and reliability that others deeply appreciate.`
        },
        conscientiousness: {
          high: `Your exceptional discipline and reliability make you someone others can always count on.`,
          low: `Your flexibility and spontaneity bring a refreshing adaptability to life's unexpected moments.`
        },
        extraversion: {
          high: `Your energy and enthusiasm naturally uplift and inspire those around you.`,
          low: `Your thoughtful, introspective nature allows for deep insights and meaningful connections.`
        },
        agreeableness: {
          high: `Your compassion and empathy create safe spaces for others to be themselves.`,
          low: `Your independence and objectivity help you make fair, unbiased decisions.`
        },
        neuroticism: {
          high: `Your emotional depth and sensitivity allow you to perceive nuances others might miss.`,
          low: `Your emotional stability provides a calming, grounding presence in any situation.`
        }
      },
      metaphorical_journey: `Imagine your personality as a {landscape}, where you are the {character} navigating through {challenge} with your {tool}, heading toward {destination}.`
    };
  }

  initializeMetaphors() {
    return {
      openness: {
        landscapes: [
          'vast library of infinite books',
          'boundless ocean of possibilities',
          'garden of exotic plants'
        ],
        characters: ['curious explorer', 'innovative architect', 'creative artist'],
        challenges: ['uncharted territories', 'complex puzzles', 'creative blocks'],
        tools: ['imagination', 'curiosity', 'creative vision'],
        destinations: ['new understanding', 'innovative solutions', 'creative mastery']
      },
      conscientiousness: {
        landscapes: [
          'well-organized workshop',
          'meticulously planned city',
          'structured mountain path'
        ],
        characters: ['master craftsman', 'strategic planner', 'dedicated builder'],
        challenges: ['complex projects', 'long-term goals', 'detailed plans'],
        tools: ['discipline', 'organization', 'persistence'],
        destinations: ['completed masterpiece', 'achieved goals', 'lasting success']
      },
      extraversion: {
        landscapes: ['bustling marketplace', 'vibrant festival', 'connected network'],
        characters: ['social conductor', 'energetic catalyst', 'natural connector'],
        challenges: ['bringing people together', 'energizing teams', 'building communities'],
        tools: ['charisma', 'enthusiasm', 'social energy'],
        destinations: ['thriving community', 'inspired team', 'meaningful connections']
      },
      agreeableness: {
        landscapes: ['harmonious garden', 'peaceful sanctuary', 'healing oasis'],
        characters: ['gentle healer', 'compassionate guide', 'peacemaker'],
        challenges: ['conflicts to resolve', 'hearts to heal', 'bridges to build'],
        tools: ['empathy', 'compassion', 'understanding'],
        destinations: ['harmony', 'healed relationships', 'united community']
      },
      neuroticism: {
        landscapes: [
          'deep ocean with hidden currents',
          'sensitive ecosystem',
          'emotionally rich terrain'
        ],
        characters: ['sensitive navigator', 'emotional alchemist', 'depth explorer'],
        challenges: ['emotional storms', 'inner turbulence', 'sensitivity management'],
        tools: ['emotional awareness', 'resilience', 'self-compassion'],
        destinations: ['emotional mastery', 'inner peace', 'integrated sensitivity']
      },
      default: {
        landscapes: ['unique landscape', 'personal terrain', 'individual path'],
        characters: ['authentic self', 'unique individual', 'personal hero'],
        challenges: ['life challenges', 'growth opportunities', 'personal obstacles'],
        tools: ['inner resources', 'personal strengths', 'unique abilities'],
        destinations: ['self-actualization', 'personal fulfillment', 'authentic expression']
      }
    };
  }

  initializeExamples() {
    return {
      work: {
        openness: {
          high: "approaching problems from unexpected angles that others wouldn't consider",
          low: 'focusing on proven solutions that deliver consistent results'
        },
        conscientiousness: {
          high: 'completing projects ahead of schedule with meticulous attention to detail',
          low: 'adapting quickly when priorities shift unexpectedly'
        }
      },
      relationships: {
        extraversion: {
          high: 'energizing social gatherings with your natural enthusiasm',
          low: 'creating deep, meaningful connections through one-on-one conversations'
        },
        agreeableness: {
          high: 'naturally mediating conflicts and finding win-win solutions',
          low: 'providing honest, direct feedback that helps others grow'
        }
      },
      personal: {
        neuroticism: {
          high: 'using your emotional sensitivity to create art or help others',
          low: 'remaining calm and centered during stressful situations'
        }
      }
    };
  }

  generateAlgorithmicInsights(traits, analysis, count) {
    const insights = [];

    // Insight based on trait variance
    const variance = this.calculateTraitVariance(traits);
    if (variance > 30) {
      insights.push({
        category: 'personality_structure',
        confidence: 85,
        primary:
          'Your personality shows fascinating contrasts that create a unique psychological fingerprint.',
        supporting: ['These contrasts provide you with diverse tools for different situations.']
      });
    }

    // Insight based on clustering
    if (analysis && analysis.clustering && analysis.clustering.alternativeArchetypes) {
      const alternatives = analysis.clustering.alternativeArchetypes;
      insights.push({
        category: 'archetype_blend',
        confidence: 75,
        primary: `You share characteristics with ${alternatives[0].name} (${alternatives[0].similarity}% match), suggesting a unique blend of archetypes.`,
        supporting: ['This blend gives you access to multiple personality strategies.']
      });
    }

    // Insight based on reliability
    if (analysis && analysis.reliability && analysis.reliability.acceptable) {
      insights.push({
        category: 'response_consistency',
        confidence: 90,
        primary:
          'Your responses show strong internal consistency, indicating authentic self-awareness.',
        supporting: ['This self-knowledge is a valuable foundation for personal growth.']
      });
    }

    return insights.slice(0, count);
  }

  calculateTraitVariance(traits) {
    const scores = Object.values(traits);
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    return Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length);
  }

  weaveInsights(insightPatterns, context) {
    const woven = insightPatterns
      .map(match => this.personalizeInsight(match.pattern.insights.primaryInsight, context))
      .join(' Additionally, ');

    return `These patterns suggest: ${woven}`;
  }

  selectAndPersonalizeMetaphor(metaphors, traits) {
    const selected = metaphors[Math.floor(Math.random() * metaphors.length)];
    return this.personalizeInsight(selected, traits);
  }

  selectAndPersonalizeExample(examples, traits) {
    const selected = examples[Math.floor(Math.random() * examples.length)];
    return {
      context: selected.context,
      example: this.personalizeInsight(selected.example, traits)
    };
  }

  generateDevelopmentRecommendation(trait, level) {
    return {
      action: `Develop your ${trait}`,
      rationale: `Strengthening ${trait} will provide more balance to your personality`,
      difficulty: 'moderate'
    };
  }

  generateLeverageRecommendation(trait, level) {
    return {
      goal: `Leverage your exceptional ${trait}`,
      steps: [`Identify opportunities to use ${trait}`, `Share this strength with others`],
      timeframe: 'Ongoing'
    };
  }

  prioritizeRecommendations(recommendations, limit) {
    return recommendations
      .sort((a, b) => {
        const priorityA = a.difficulty === 'easy' ? 3 : a.difficulty === 'moderate' ? 2 : 1;
        const priorityB = b.difficulty === 'easy' ? 3 : b.difficulty === 'moderate' ? 2 : 1;
        return priorityB - priorityA;
      })
      .slice(0, limit);
  }

  categorizeResources(resources) {
    const categorized = {
      books: [],
      apps: [],
      courses: [],
      practices: [],
      professional: []
    };

    resources.forEach(resource => {
      const category = resource.type || 'practices';
      if (categorized[category]) {
        categorized[category].push(resource);
      }
    });

    return categorized;
  }

  identifyGrowthAreas(traits) {
    return Object.entries(traits)
      .filter(([_, score]) => score < 40)
      .map(([trait, score]) => ({
        trait,
        current: score,
        potential: score + 20,
        strategy: this.getGrowthStrategy(trait, score)
      }));
  }

  identifyStrengths(traits) {
    return Object.entries(traits)
      .filter(([_, score]) => score > 65)
      .sort((a, b) => b[1] - a[1])
      .map(([trait, _]) => trait);
  }

  predictGrowthTrajectory(traits, analysis) {
    return {
      potential_growth: 'enhanced self-awareness and capability',
      timeline: '6-12 months',
      key_milestones: 'improved trait balance and enhanced strengths'
    };
  }

  getGrowthStrategy(trait, currentScore) {
    const strategies = {
      openness: 'gradual exposure to new experiences',
      conscientiousness: 'implementing small, consistent habits',
      extraversion: 'progressive social engagement',
      agreeableness: 'practicing empathy and perspective-taking',
      neuroticism: 'developing emotional regulation skills'
    };
    return strategies[trait] || 'focused practice and awareness';
  }

  analyzeTraitInteractions(traits) {
    const interactions = [];
    const traitPairs = [
      ['openness', 'conscientiousness'],
      ['extraversion', 'agreeableness'],
      ['conscientiousness', 'neuroticism']
    ];

    traitPairs.forEach(([trait1, trait2]) => {
      const interaction = this.calculateInteraction(traits[trait1], traits[trait2]);
      interactions.push({
        traits: [trait1, trait2],
        type: interaction.type,
        description: interaction.description,
        impact: interaction.impact
      });
    });

    return interactions;
  }

  calculateInteraction(score1, score2) {
    const both_high = score1 > 65 && score2 > 65;
    const both_low = score1 < 35 && score2 < 35;
    const opposite = Math.abs(score1 - score2) > 40;

    if (both_high) {
      return {
        type: 'synergistic',
        description: 'These traits reinforce each other positively',
        impact: 'Creates a powerful combination'
      };
    } else if (both_low) {
      return {
        type: 'compound_challenge',
        description: 'Both traits present growth opportunities',
        impact: 'Focused development could yield significant benefits'
      };
    } else if (opposite) {
      return {
        type: 'creative_tension',
        description: 'These traits create dynamic balance',
        impact: 'Provides flexibility in different situations'
      };
    } else {
      return {
        type: 'balanced',
        description: 'These traits work in harmony',
        impact: 'Provides stable foundation'
      };
    }
  }

  uncoverHiddenPatterns(traits, analysis) {
    const patterns = [];

    // Check for impostor syndrome pattern
    if (traits.conscientiousness > 70 && traits.neuroticism > 60) {
      patterns.push({
        name: 'Perfectionist Pattern',
        description: 'High standards combined with self-criticism',
        insight: 'Your drive for excellence may sometimes overshadow your achievements'
      });
    }

    // Check for creative tension
    if (traits.openness > 70 && traits.conscientiousness < 40) {
      patterns.push({
        name: 'Creative Chaos',
        description: 'Innovation without structure',
        insight: 'Your creativity flows best without rigid constraints'
      });
    }

    return patterns;
  }

  identifyParadoxes(traits) {
    const paradoxes = [];

    if (traits.extraversion < 30 && traits.agreeableness > 70) {
      paradoxes.push({
        paradox: 'The Caring Introvert',
        description: 'Deeply caring about others while needing solitude',
        resolution: 'Quality over quantity in relationships'
      });
    }

    if (traits.openness > 70 && traits.neuroticism > 70) {
      paradoxes.push({
        paradox: 'The Sensitive Explorer',
        description: 'Seeking new experiences while feeling things deeply',
        resolution: 'Growth through emotional depth'
      });
    }

    return paradoxes;
  }

  generateEvolutionaryPerspective(traits) {
    const perspective = [];

    if (traits.neuroticism > 60) {
      perspective.push(
        'Your heightened sensitivity would have served as an early warning system in ancestral environments.'
      );
    }

    if (traits.conscientiousness > 70) {
      perspective.push(
        'Your planning and organization abilities would have ensured group survival through resource management.'
      );
    }

    return perspective.join(' ');
  }

  generateCulturalContext(traits) {
    return {
      western: this.getWesternContext(traits),
      eastern: this.getEasternContext(traits),
      universal: 'Your personality traits manifest uniquely across different cultural contexts'
    };
  }

  getWesternContext(traits) {
    if (traits.extraversion > 70 && traits.conscientiousness > 70) {
      return 'Your traits align well with Western ideals of leadership and achievement';
    }
    return 'Your unique trait combination offers valuable perspectives in Western contexts';
  }

  getEasternContext(traits) {
    if (traits.agreeableness > 70 && traits.extraversion < 40) {
      return 'Your traits resonate with Eastern values of harmony and introspection';
    }
    return 'Your personality brings balance to Eastern collective contexts';
  }

  generateNeurodivergentInsights(patterns, traits) {
    const insights = [];

    patterns.forEach(match => {
      const pattern = match.pattern;
      if (pattern.neurodivergent && pattern.neurodivergent.indicators.length > 0) {
        pattern.neurodivergent.indicators.forEach(indicator => {
          insights.push({
            condition: indicator.condition,
            confidence: Math.round(indicator.confidence * 100),
            markers: indicator.markers,
            explanation: this.personalizeInsight(indicator.explanation, traits),
            note: 'This is a screening indication only, not a diagnosis'
          });
        });
      }
    });

    return insights;
  }

  generateTraitExample(trait, score, context) {
    const level = this.getTraitLevel(score);
    const examples = this.examples[context] || this.examples.work;

    return {
      trait,
      score,
      example:
        examples[trait]?.[level] || `Your ${trait} manifests uniquely in ${context} situations`
    };
  }

  generateInteractionExample(interaction, context) {
    return {
      traits: interaction.traits,
      type: interaction.type,
      example: `In ${context}, your ${interaction.traits.join(' and ')} create ${interaction.impact.toLowerCase()}`
    };
  }

  determineLifeContext(age, demographics) {
    if (age < 25) return 'school';
    if (age < 65) return 'work';
    return 'personal';
  }

  identifySignificantInteractions(traits) {
    const interactions = [];
    const threshold = 30;

    Object.entries(traits).forEach(([trait1, score1]) => {
      Object.entries(traits).forEach(([trait2, score2]) => {
        if (trait1 < trait2) {
          // Avoid duplicates
          const diff = Math.abs(score1 - score2);
          if (diff > threshold || (score1 > 70 && score2 > 70)) {
            interactions.push({
              traits: [trait1, trait2],
              type: diff > threshold ? 'contrasting' : 'reinforcing',
              scores: [score1, score2]
            });
          }
        }
      });
    });

    return interactions;
  }

  generateTraitMicroHabits(trait, score) {
    const habits = [];

    const habitMap = {
      openness: {
        low: [
          { habit: 'Try one new food each week', difficulty: 1, impact: 3 },
          { habit: 'Take a different route once a week', difficulty: 1, impact: 2 }
        ],
        high: [
          { habit: 'Document one creative idea daily', difficulty: 2, impact: 4 },
          { habit: 'Dedicate 15 minutes to learning something new', difficulty: 2, impact: 4 }
        ]
      },
      conscientiousness: {
        low: [
          { habit: "Make tomorrow's to-do list before bed", difficulty: 1, impact: 4 },
          { habit: 'Set one daily priority each morning', difficulty: 1, impact: 3 }
        ],
        high: [
          { habit: 'Schedule one hour of unstructured time weekly', difficulty: 3, impact: 3 },
          { habit: 'Practice saying "good enough" once daily', difficulty: 3, impact: 4 }
        ]
      }
    };

    const level = score < 40 ? 'low' : 'high';
    return habitMap[trait]?.[level] || [];
  }

  generatePatternMicroHabit(pattern) {
    const habitMap = {
      'straight-lining': {
        habit: 'Pause and reflect before answering',
        difficulty: 2,
        impact: 3
      },
      rushed: {
        habit: 'Take three deep breaths before decisions',
        difficulty: 1,
        impact: 4
      },
      extreme_responding: {
        habit: 'Consider the middle ground daily',
        difficulty: 2,
        impact: 3
      }
    };

    return habitMap[pattern.type];
  }

  personalizeValidation(template, score) {
    return template.replace(/{score}/g, score);
  }

  generateGeneralValidations(traits) {
    const validations = [];

    // Validate overall profile
    validations.push(
      'Your unique combination of traits is exactly what makes you valuable and irreplaceable.'
    );

    // Validate journey
    validations.push(
      "Your personality is not fixed – it's a dynamic system capable of growth and adaptation."
    );

    // Validate authenticity
    const variance = this.calculateTraitVariance(traits);
    if (variance > 20) {
      validations.push(
        "Your personality contrasts are not contradictions – they're the source of your versatility."
      );
    }

    return validations;
  }

  selectMetaphor(metaphors, traits) {
    // Select based on dominant trait influence
    const dominantTrait = this.findDominantTrait(traits);
    const index = Math.floor((dominantTrait.score / 100) * metaphors.length);
    return metaphors[Math.min(index, metaphors.length - 1)];
  }

  generateComparison(traits) {
    const highest = Math.max(...Object.values(traits));
    const lowest = Math.min(...Object.values(traits));
    const range = highest - lowest;

    if (range > 50) return 'dramatic contrasts';
    if (range > 30) return 'notable differences';
    return 'subtle variations';
  }

  getTraitExamples(trait, level) {
    const context = ['work', 'relationships', 'personal'][Math.floor(Math.random() * 3)];
    return this.examples[context]?.[trait]?.[level] || 'manifests in unique ways';
  }

  getTraitInteractions(trait, allTraits) {
    const interactions = [];

    // Find significant correlations
    Object.entries(allTraits).forEach(([otherTrait, score]) => {
      if (otherTrait !== trait) {
        const correlation = this.calculateCorrelation(allTraits[trait], score);
        if (Math.abs(correlation) > 0.3) {
          interactions.push(`${correlation > 0 ? 'reinforces' : 'balances'} your ${otherTrait}`);
        }
      }
    });

    return interactions.length > 0
      ? `This ${interactions.join(' and ')}`
      : 'This trait operates independently';
  }

  calculateCorrelation(score1, score2) {
    // Simplified correlation calculation
    const diff = Math.abs(score1 - score2);
    if (diff < 20) return 0.5; // Positive correlation
    if (diff > 50) return -0.5; // Negative correlation
    return 0; // No correlation
  }

  getDefaultNarrative(tier) {
    return {
      executiveSummary:
        'Your personality profile reveals a unique individual with distinctive traits and patterns.',
      traitAnalysis: {},
      insights: [],
      recommendations: { immediate: [], longTerm: [], resources: {} },
      growthNarrative: 'Your growth journey is unique to your personality configuration.'
    };
  }
}

module.exports = NarrativeGenerator;
