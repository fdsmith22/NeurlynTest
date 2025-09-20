const mongoose = require('mongoose');
const logger = require('../utils/logger');

class ComprehensiveReportGenerator {
  constructor() {
    this.reportId = null;
  }

  async generateComprehensiveReport(assessmentData) {
    try {
      const { mode, tier, track, duration, responses, results, demographics, metadata } =
        assessmentData;

      // Generate unique report ID
      this.reportId = this.generateReportId();

      // Extract scores and metrics
      const traits = this.extractPersonalityTraits(results, responses);
      const neurodiversityScores = this.extractNeurodiversityScores(responses);
      const cognitiveMetrics = this.extractCognitiveMetrics(responses);
      const behavioralMetrics = this.analyzeBehavioralPatterns(responses);
      const gamifiedMetrics = this.extractGamifiedMetrics(responses);

      // Generate comprehensive report sections
      const report = {
        id: this.reportId,
        generatedAt: new Date(),
        meta: this.generateMetaData(mode, tier, track, duration, responses),
        executive: this.generateExecutiveSummary(traits, neurodiversityScores, cognitiveMetrics),
        personality: this.generatePersonalityAnalysis(traits),
        neurodiversity:
          track === 'neurodiversity' || this.hasNeurodiversityResponses(responses)
            ? this.generateNeurodiversityAnalysis(neurodiversityScores, responses)
            : null,
        cognitive: this.analyzeCognitivePatterns(responses, cognitiveMetrics, gamifiedMetrics),
        archetype: this.determineComprehensiveArchetype(traits, neurodiversityScores),
        insights: this.generateComprehensiveInsights(
          traits,
          behavioralMetrics,
          gamifiedMetrics,
          neurodiversityScores
        ),
        recommendations: this.generateDetailedRecommendations(
          traits,
          neurodiversityScores,
          cognitiveMetrics
        ),
        career: this.generateCareerGuidance(traits, neurodiversityScores, cognitiveMetrics),
        relationships: this.generateRelationshipInsights(traits),
        growth: this.generateGrowthPlan(traits, neurodiversityScores, cognitiveMetrics),
        visualizations: this.prepareVisualizationData(
          traits,
          neurodiversityScores,
          cognitiveMetrics
        ),
        comparisons: this.generateComparativeAnalysis(traits),
        validity: this.calculateValidityMetrics(responses, behavioralMetrics)
      };

      logger.info('Comprehensive report generated', {
        reportId: this.reportId,
        sections: Object.keys(report).filter(k => report[k] !== null)
      });

      return report;
    } catch (error) {
      logger.error('Report generation error:', error);
      throw error;
    }
  }

  generateReportId() {
    return `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractPersonalityTraits(results, responses) {
    // Extract Big Five traits from results or calculate from responses
    const traits = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    if (results && results.profile) {
      Object.keys(traits).forEach(trait => {
        traits[trait] = results.profile[trait] || this.calculateTraitScore(responses, trait);
      });
    } else {
      // Calculate from responses
      Object.keys(traits).forEach(trait => {
        traits[trait] = this.calculateTraitScore(responses, trait);
      });
    }

    return traits;
  }

  calculateTraitScore(responses, trait) {
    const traitResponses = responses.filter(
      r => r.category === 'personality' && this.isTraitRelated(r, trait)
    );

    if (traitResponses.length === 0) return 50; // Default neutral score

    const scores = traitResponses.map(r => this.scoreResponse(r));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  isTraitRelated(response, trait) {
    // Check if response is related to specific trait
    // This would be enhanced with actual trait mapping
    return true;
  }

  scoreResponse(response) {
    // Convert response to numerical score
    const scoreMap = {
      'Strongly Disagree': 20,
      Disagree: 40,
      Neutral: 60,
      Agree: 80,
      'Strongly Agree': 100,
      Never: 20,
      Rarely: 40,
      Sometimes: 60,
      Often: 80,
      Always: 100
    };

    return scoreMap[response.value] || 50;
  }

  extractNeurodiversityScores(responses) {
    const neurodiversityResponses = responses.filter(
      r => r.category === 'neurodiversity' || r.instrument === 'ASRS-5' || r.instrument === 'AQ-10'
    );

    const scores = {
      adhd: {
        likelihood: 0,
        indicators: [],
        subcategories: {
          inattentive: 0,
          hyperactive: 0,
          combined: 0,
          executiveFunction: 0,
          timeBlindness: 0,
          rejectionSensitivity: 0
        }
      },
      autism: {
        likelihood: 0,
        indicators: [],
        subcategories: {
          socialCommunication: 0,
          sensoryProcessing: 0,
          routineAdherence: 0,
          specialInterests: 0,
          masking: 0,
          patternRecognition: 0
        }
      },
      anxiety: {
        likelihood: 0,
        indicators: [],
        subcategories: {
          generalized: 0,
          social: 0,
          performance: 0
        }
      },
      depression: {
        likelihood: 0,
        indicators: [],
        subcategories: {
          mood: 0,
          cognitive: 0,
          physical: 0
        }
      },
      sensoryProfile: {
        seekingBehaviors: 0,
        avoidingBehaviors: 0,
        sensitivity: 0,
        registration: 0
      }
    };

    // Analyze executive function responses
    const execFunctionResponses = responses.filter(r => r.subcategory === 'executive_function');
    if (execFunctionResponses.length > 0) {
      scores.adhd.subcategories.executiveFunction =
        this.calculateSubcategoryScore(execFunctionResponses);
      if (scores.adhd.subcategories.executiveFunction > 60) {
        scores.adhd.indicators.push('Executive function challenges');
      }
    }

    // Analyze sensory processing responses
    const sensoryResponses = responses.filter(r => r.subcategory === 'sensory_processing');
    if (sensoryResponses.length > 0) {
      scores.autism.subcategories.sensoryProcessing =
        this.calculateSubcategoryScore(sensoryResponses);
      scores.sensoryProfile = this.analyzeSensoryProfile(sensoryResponses);
      if (scores.autism.subcategories.sensoryProcessing > 60) {
        scores.autism.indicators.push('Sensory processing differences');
      }
    }

    // Analyze masking responses
    const maskingResponses = responses.filter(r => r.subcategory === 'masking');
    if (maskingResponses.length > 0) {
      scores.autism.subcategories.masking = this.calculateSubcategoryScore(maskingResponses);
      if (scores.autism.subcategories.masking > 70) {
        scores.autism.indicators.push('High masking behaviors');
      }
    }

    // Calculate overall likelihood scores
    scores.adhd.likelihood = this.calculateLikelihood(scores.adhd.subcategories);
    scores.autism.likelihood = this.calculateLikelihood(scores.autism.subcategories);

    return scores;
  }

  calculateSubcategoryScore(responses) {
    const scores = responses.map(r => this.scoreResponse(r));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  calculateLikelihood(subcategories) {
    const scores = Object.values(subcategories);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (average >= 70) return 'High';
    if (average >= 50) return 'Moderate';
    return 'Low';
  }

  analyzeSensoryProfile(responses) {
    const profile = {
      seekingBehaviors: 0,
      avoidingBehaviors: 0,
      sensitivity: 0,
      registration: 0
    };

    responses.forEach(r => {
      if (r.domain === 'sensory_seeking') profile.seekingBehaviors += this.scoreResponse(r);
      if (r.domain === 'tactile_defensiveness' || r.domain === 'sensory_overload') {
        profile.avoidingBehaviors += this.scoreResponse(r);
      }
      if (r.domain && r.domain.includes('sensitivity')) {
        profile.sensitivity += this.scoreResponse(r);
      }
    });

    // Normalize scores
    Object.keys(profile).forEach(key => {
      const count = responses.filter(r => this.isSensoryDomain(r.domain, key)).length;
      if (count > 0) profile[key] = Math.round(profile[key] / count);
    });

    return profile;
  }

  isSensoryDomain(domain, profileKey) {
    const domainMap = {
      seekingBehaviors: ['sensory_seeking', 'proprioceptive_seeking'],
      avoidingBehaviors: ['tactile_defensiveness', 'sensory_overload'],
      sensitivity: ['sensitivity', 'acuity'],
      registration: ['registration', 'awareness']
    };

    return domainMap[profileKey]?.some(d => domain?.includes(d)) || false;
  }

  extractCognitiveMetrics(responses) {
    const cognitiveResponses = responses.filter(r => r.category === 'cognitive');

    const metrics = {
      processingSpeed: 50,
      workingMemory: 50,
      patternRecognition: 50,
      cognitiveFlexibility: 50,
      attentionControl: 50,
      problemSolving: 50,
      thinkingStyle: {
        visual: 0,
        verbal: 0,
        kinesthetic: 0,
        analytical: 0,
        creative: 0
      }
    };

    cognitiveResponses.forEach(r => {
      if (r.subcategory === 'pattern_recognition') {
        metrics.patternRecognition = this.scoreResponse(r);
      }
      if (r.subcategory === 'cognitive_flexibility') {
        metrics.cognitiveFlexibility = this.scoreResponse(r);
      }
      if (r.subcategory === 'thinking_style') {
        if (r.domain === 'visual_thinking') metrics.thinkingStyle.visual = this.scoreResponse(r);
        if (r.domain === 'systems_thinking')
          metrics.thinkingStyle.analytical = this.scoreResponse(r);
      }
      if (r.subcategory === 'creative_thinking') {
        metrics.thinkingStyle.creative = this.scoreResponse(r);
      }
    });

    return metrics;
  }

  analyzeBehavioralPatterns(responses) {
    // Analyze response patterns for behavioral insights
    const patterns = {
      responseSpeed: [],
      consistency: 0,
      extremityBias: 0,
      centralTendency: 0,
      acquiescence: 0
    };

    responses.forEach(r => {
      if (r.responseTime) patterns.responseSpeed.push(r.responseTime);
    });

    // Calculate average response speed
    if (patterns.responseSpeed.length > 0) {
      patterns.averageSpeed =
        patterns.responseSpeed.reduce((a, b) => a + b, 0) / patterns.responseSpeed.length;
    }

    // Check for extreme responses
    const extremeResponses = responses.filter(r =>
      ['Strongly Agree', 'Strongly Disagree', 'Always', 'Never'].includes(r.value)
    );
    patterns.extremityBias = (extremeResponses.length / responses.length) * 100;

    // Check for central tendency
    const neutralResponses = responses.filter(r => ['Neutral', 'Sometimes'].includes(r.value));
    patterns.centralTendency = (neutralResponses.length / responses.length) * 100;

    return patterns;
  }

  extractGamifiedMetrics(responses) {
    return {
      engagementLevel: 85,
      completionRate: 100,
      streaks: 0,
      bonusPointsEarned: 0
    };
  }

  hasNeurodiversityResponses(responses) {
    return responses.some(
      r =>
        r.category === 'neurodiversity' ||
        r.subcategory?.includes('executive_function') ||
        r.subcategory?.includes('sensory') ||
        r.subcategory?.includes('masking')
    );
  }

  generateMetaData(mode, tier, track, duration, responses) {
    return {
      timestamp: new Date().toISOString(),
      mode: mode || 'validated',
      tier: tier || 'comprehensive',
      track: track || 'general',
      duration: duration,
      totalQuestions: responses.length,
      completionRate: 100
    };
  }

  generateExecutiveSummary(traits, neurodiversityScores, cognitiveMetrics) {
    const strengths = [];
    const areasForGrowth = [];
    const keyInsights = [];

    // Analyze personality strengths
    Object.entries(traits).forEach(([trait, score]) => {
      if (score >= 70) {
        strengths.push(this.getStrengthDescription(trait, score));
      } else if (score <= 30) {
        areasForGrowth.push(this.getGrowthAreaDescription(trait, score));
      }
    });

    // Analyze neurodiversity indicators
    if (neurodiversityScores.adhd.likelihood === 'High') {
      keyInsights.push(
        'Your responses suggest ADHD traits that could benefit from support strategies'
      );
    }
    if (neurodiversityScores.autism.likelihood === 'High') {
      keyInsights.push('You show autism spectrum traits that represent a unique cognitive style');
    }
    if (neurodiversityScores.autism.subcategories.masking > 70) {
      keyInsights.push(
        'High masking behaviors detected - consider strategies for authentic self-expression'
      );
    }

    // Analyze cognitive strengths
    if (cognitiveMetrics.patternRecognition >= 70) {
      strengths.push('Exceptional pattern recognition abilities');
    }
    if (cognitiveMetrics.thinkingStyle.creative >= 70) {
      strengths.push('Strong creative and innovative thinking');
    }

    return {
      overview: this.generateOverviewNarrative(traits, neurodiversityScores),
      strengths: strengths.slice(0, 5),
      areasForGrowth: areasForGrowth.slice(0, 5),
      keyInsights: keyInsights.slice(0, 4)
    };
  }

  getStrengthDescription(trait, score) {
    const descriptions = {
      openness: 'Creative and intellectually curious',
      conscientiousness: 'Organized and goal-oriented',
      extraversion: 'Energetic and socially confident',
      agreeableness: 'Compassionate and cooperative',
      neuroticism: 'Emotionally aware and sensitive'
    };
    return descriptions[trait] || `High ${trait}`;
  }

  getGrowthAreaDescription(trait, score) {
    const descriptions = {
      openness: 'Expanding comfort with new experiences',
      conscientiousness: 'Developing organizational systems',
      extraversion: 'Building social energy management',
      agreeableness: 'Strengthening interpersonal boundaries',
      neuroticism: 'Enhancing emotional regulation'
    };
    return descriptions[trait] || `Developing ${trait}`;
  }

  generateOverviewNarrative(traits, neurodiversityScores) {
    const dominantTrait = Object.entries(traits).sort((a, b) => b[1] - a[1])[0][0];

    let narrative = `Your personality profile reveals a ${dominantTrait}-dominant pattern `;

    if (
      neurodiversityScores.adhd.likelihood === 'High' ||
      neurodiversityScores.autism.likelihood === 'High'
    ) {
      narrative +=
        'combined with neurodivergent processing styles that offer unique cognitive advantages. ';
    } else {
      narrative += 'with balanced cognitive processing across multiple domains. ';
    }

    narrative += 'This combination suggests strong potential for ';

    if (dominantTrait === 'openness')
      narrative += 'creative innovation and intellectual exploration.';
    else if (dominantTrait === 'conscientiousness')
      narrative += 'systematic achievement and reliable execution.';
    else if (dominantTrait === 'extraversion') narrative += 'leadership and social influence.';
    else if (dominantTrait === 'agreeableness')
      narrative += 'collaborative success and team harmony.';
    else narrative += 'deep emotional intelligence and intuitive understanding.';

    return narrative;
  }

  generatePersonalityAnalysis(traits) {
    const analysis = {
      traits: {}
    };

    Object.entries(traits).forEach(([trait, score]) => {
      analysis.traits[trait] = {
        score: score,
        level: this.getScoreLevel(score),
        description: this.getTraitDescription(trait, score),
        facets: this.getTraitFacets(trait, score)
      };
    });

    return analysis;
  }

  getScoreLevel(score) {
    if (score >= 80) return 'Very High';
    if (score >= 65) return 'High';
    if (score >= 35) return 'Average';
    if (score >= 20) return 'Low';
    return 'Very Low';
  }

  getTraitDescription(trait, score) {
    const descriptions = {
      openness: {
        high: 'You have a rich imagination, appreciate art and beauty, and enjoy exploring new ideas and experiences.',
        average:
          'You balance practical thinking with creative exploration, open to new experiences when they align with your interests.',
        low: 'You prefer familiar routines and practical solutions, valuing stability and proven methods.'
      },
      conscientiousness: {
        high: 'You are organized, reliable, and goal-oriented, with strong self-discipline and attention to detail.',
        average:
          'You balance structure with flexibility, maintaining organization in priority areas while allowing spontaneity elsewhere.',
        low: 'You prefer flexibility and spontaneity, working best with minimal structure and freedom to adapt.'
      },
      extraversion: {
        high: 'You are energized by social interaction, comfortable in groups, and naturally assertive in social situations.',
        average:
          'You enjoy social interaction in moderation, balancing social time with solitary activities.',
        low: 'You prefer quiet environments and deep one-on-one connections, finding large groups draining.'
      },
      agreeableness: {
        high: "You are compassionate, trusting, and cooperative, prioritizing harmony and others' wellbeing.",
        average:
          'You balance concern for others with self-advocacy, cooperative when appropriate but able to disagree.',
        low: 'You are direct, skeptical, and competitive, prioritizing truth and efficiency over social harmony.'
      },
      neuroticism: {
        high: "You experience emotions intensely and are highly sensitive to your environment and others' moods.",
        average:
          'You experience typical emotional fluctuations, generally managing stress and anxiety effectively.',
        low: 'You remain calm under pressure, rarely experiencing anxiety or emotional distress.'
      }
    };

    const level = score >= 65 ? 'high' : score >= 35 ? 'average' : 'low';
    return descriptions[trait][level];
  }

  getTraitFacets(trait, score) {
    const facets = {
      openness: [
        'Imagination',
        'Artistic Interests',
        'Emotionality',
        'Adventurousness',
        'Intellect',
        'Liberalism'
      ],
      conscientiousness: [
        'Self-Efficacy',
        'Orderliness',
        'Dutifulness',
        'Achievement-Striving',
        'Self-Discipline',
        'Cautiousness'
      ],
      extraversion: [
        'Friendliness',
        'Gregariousness',
        'Assertiveness',
        'Activity Level',
        'Excitement-Seeking',
        'Cheerfulness'
      ],
      agreeableness: ['Trust', 'Morality', 'Altruism', 'Cooperation', 'Modesty', 'Sympathy'],
      neuroticism: [
        'Anxiety',
        'Anger',
        'Depression',
        'Self-Consciousness',
        'Immoderation',
        'Vulnerability'
      ]
    };

    // Return relevant facets based on score
    const relevantFacets = facets[trait] || [];
    return score >= 65 ? relevantFacets.slice(0, 3) : relevantFacets.slice(3, 6);
  }

  generateNeurodiversityAnalysis(scores, responses) {
    const analysis = {
      screening: {},
      strengths: [],
      supportNeeds: [],
      resources: []
    };

    // ADHD Analysis
    if (scores.adhd.likelihood !== 'Low') {
      analysis.screening.adhd = {
        likelihood: scores.adhd.likelihood,
        indicators: scores.adhd.indicators,
        strategies: this.getADHDStrategies(scores.adhd),
        resources: ['ADHD coaching', 'Executive function support apps', 'Time management tools']
      };

      if (scores.adhd.subcategories.executiveFunction > 60) {
        analysis.strengths.push('Creative problem-solving under pressure');
        analysis.supportNeeds.push('External structure and reminders');
      }
    }

    // Autism Analysis
    if (scores.autism.likelihood !== 'Low') {
      analysis.screening.autism = {
        likelihood: scores.autism.likelihood,
        indicators: scores.autism.indicators,
        strategies: this.getAutismStrategies(scores.autism),
        resources: ['Sensory accommodation tools', 'Social scripts', 'Routine planning apps']
      };

      if (scores.autism.subcategories.patternRecognition > 70) {
        analysis.strengths.push('Exceptional pattern recognition and detail orientation');
      }
      if (scores.autism.subcategories.masking > 70) {
        analysis.supportNeeds.push('Safe spaces for authentic self-expression');
      }
    }

    // Sensory Profile
    if (scores.sensoryProfile) {
      analysis.sensoryProfile = this.analyzeSensoryNeeds(scores.sensoryProfile);
    }

    return analysis;
  }

  getADHDStrategies(adhdScores) {
    const strategies = [];

    if (adhdScores.subcategories.executiveFunction > 60) {
      strategies.push('Use visual reminders and external cues');
      strategies.push('Break tasks into smaller, manageable chunks');
    }
    if (adhdScores.subcategories.timeBlindness > 60) {
      strategies.push('Set multiple alarms and time markers');
      strategies.push('Use time-tracking apps and visual timers');
    }
    if (adhdScores.subcategories.rejectionSensitivity > 60) {
      strategies.push('Practice self-compassion and emotional regulation');
      strategies.push('Seek regular positive feedback and validation');
    }

    return strategies;
  }

  getAutismStrategies(autismScores) {
    const strategies = [];

    if (autismScores.subcategories.sensoryProcessing > 60) {
      strategies.push('Create sensory-friendly environments');
      strategies.push('Use noise-canceling headphones or fidget tools');
    }
    if (autismScores.subcategories.socialCommunication > 60) {
      strategies.push('Request clear, direct communication');
      strategies.push('Schedule social recovery time');
    }
    if (autismScores.subcategories.routineAdherence > 60) {
      strategies.push('Maintain predictable routines and schedules');
      strategies.push('Prepare for transitions in advance');
    }

    return strategies;
  }

  analyzeSensoryNeeds(sensoryProfile) {
    const needs = {
      environment: [],
      tools: [],
      strategies: []
    };

    if (sensoryProfile.sensitivity > 70) {
      needs.environment.push('Quiet, low-stimulation spaces');
      needs.tools.push('Noise-canceling headphones');
      needs.strategies.push('Regular sensory breaks');
    }

    if (sensoryProfile.seekingBehaviors > 70) {
      needs.environment.push('Opportunities for movement');
      needs.tools.push('Fidget tools, weighted items');
      needs.strategies.push('Incorporate sensory input into daily routine');
    }

    return needs;
  }

  analyzeCognitivePatterns(responses, cognitiveMetrics, gamifiedMetrics) {
    return {
      thinkingStyle: {
        description: this.describeCognitiveStyle(cognitiveMetrics),
        traits: this.identifyCognitiveTraits(cognitiveMetrics),
        distribution: cognitiveMetrics.thinkingStyle
      },
      problemSolving: {
        analytical: cognitiveMetrics.thinkingStyle.analytical,
        creative: cognitiveMetrics.thinkingStyle.creative,
        systematic: cognitiveMetrics.cognitiveFlexibility
      },
      lateralThinking: {
        score: this.calculateLateralThinkingScore(responses),
        analysis: 'Your approach to problems shows creative divergent thinking patterns',
        examples: ['Pattern recognition in complex systems', 'Novel solution generation']
      }
    };
  }

  describeCognitiveStyle(metrics) {
    const dominantStyle = Object.entries(metrics.thinkingStyle).sort((a, b) => b[1] - a[1])[0];

    if (dominantStyle[0] === 'visual') {
      return 'You process information primarily through visual-spatial reasoning';
    } else if (dominantStyle[0] === 'analytical') {
      return 'You excel at systematic, logical problem-solving';
    } else if (dominantStyle[0] === 'creative') {
      return 'You approach challenges with innovative, divergent thinking';
    }

    return 'You employ a balanced mix of cognitive strategies';
  }

  identifyCognitiveTraits(metrics) {
    const traits = [];

    if (metrics.patternRecognition > 70) traits.push('Pattern mastery');
    if (metrics.thinkingStyle.creative > 70) traits.push('Creative innovation');
    if (metrics.thinkingStyle.analytical > 70) traits.push('Analytical precision');
    if (metrics.cognitiveFlexibility > 70) traits.push('Mental agility');

    return traits;
  }

  calculateLateralThinkingScore(responses) {
    const lateralResponses = responses.filter(r => r.category === 'lateral_thinking');
    if (lateralResponses.length === 0) return 50;

    const scores = lateralResponses.map(r => this.scoreResponse(r));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  determineComprehensiveArchetype(traits, neurodiversityScores) {
    // Determine primary archetype based on trait combinations
    const archetypes = [
      {
        name: 'The Visionary Leader',
        match: traits.openness > 70 && traits.extraversion > 60,
        icon: 'lighthouse',
        tagline: 'Inspiring innovation and guiding transformation',
        description: 'You combine creative vision with natural leadership abilities.',
        characteristics: ['Innovative thinking', 'Inspirational communication', 'Strategic vision'],
        strengths: ['Motivating others', 'Seeing the big picture', 'Driving change'],
        challenges: ['Patience with details', 'Following through on routine tasks']
      },
      {
        name: 'The Creative Innovator',
        match: traits.openness > 80 && neurodiversityScores.adhd.likelihood === 'High',
        icon: 'palette',
        tagline: 'Transforming imagination into reality',
        description: 'Your unique cognitive style fuels exceptional creativity.',
        characteristics: ['Divergent thinking', 'Artistic expression', 'Novel connections'],
        strengths: ['Original ideas', 'Problem-solving', 'Thinking outside the box'],
        challenges: ['Completing projects', 'Working within constraints']
      },
      {
        name: 'The Analytical Mastermind',
        match: traits.conscientiousness > 70 && traits.openness > 60,
        icon: 'microscope',
        tagline: 'Solving complex puzzles with precision',
        description: 'You excel at systematic analysis and strategic thinking.',
        characteristics: ['Logical reasoning', 'Detail orientation', 'Strategic planning'],
        strengths: ['Problem decomposition', 'Quality assurance', 'Process optimization'],
        challenges: ['Flexibility with change', 'Tolerating ambiguity']
      },
      {
        name: 'The Empathic Connector',
        match: traits.agreeableness > 70 && traits.extraversion > 60,
        icon: 'heart',
        tagline: 'Building bridges between hearts and minds',
        description: 'Your emotional intelligence creates meaningful connections.',
        characteristics: ['Deep empathy', 'Social intuition', 'Relationship building'],
        strengths: ['Understanding others', 'Mediating conflicts', 'Creating harmony'],
        challenges: ['Setting boundaries', 'Prioritizing self-care']
      },
      {
        name: 'The Deep Thinker',
        match: traits.openness > 70 && traits.extraversion < 40,
        icon: 'brain',
        tagline: 'Exploring the depths of knowledge and understanding',
        description: 'You process information deeply and generate profound insights.',
        characteristics: ['Philosophical thinking', 'Introspection', 'Knowledge synthesis'],
        strengths: ['Complex analysis', 'Independent research', 'Original theories'],
        challenges: ['Sharing ideas', 'Group collaboration']
      },
      {
        name: 'The Steady Architect',
        match: traits.conscientiousness > 80,
        icon: 'blueprint',
        tagline: 'Building lasting systems with careful precision',
        description: 'You create structure and order that enables success.',
        characteristics: ['Methodical approach', 'Reliability', 'Long-term planning'],
        strengths: ['Project management', 'Quality control', 'Process design'],
        challenges: ['Adapting to sudden changes', 'Taking risks']
      }
    ];

    // Find best matching archetype
    const matchedArchetype = archetypes.find(a => a.match) || archetypes[5];
    delete matchedArchetype.match;

    return matchedArchetype;
  }

  generateComprehensiveInsights(traits, behavioralMetrics, gamifiedMetrics, neurodiversityScores) {
    const insights = [];

    // Personality insights
    if (traits.openness > 70 && traits.conscientiousness < 40) {
      insights.push({
        title: 'Creative Tension',
        description:
          'Your high creativity paired with flexible structure suggests you thrive in dynamic, innovative environments.',
        impactArea: 'Career',
        suggestedAction: 'Seek roles that balance creative freedom with minimal routine'
      });
    }

    // Neurodiversity insights
    if (
      neurodiversityScores.adhd.likelihood === 'High' &&
      neurodiversityScores.autism.likelihood === 'High'
    ) {
      insights.push({
        title: 'AuDHD Profile',
        description:
          'You show traits of both ADHD and autism, creating unique strengths and challenges.',
        impactArea: 'Self-Understanding',
        suggestedAction: 'Explore resources specifically for AuDHD individuals'
      });
    }

    // Masking insights
    if (neurodiversityScores.autism.subcategories.masking > 70) {
      insights.push({
        title: 'Masking Awareness',
        description: 'High masking behaviors may be causing exhaustion and identity confusion.',
        impactArea: 'Wellbeing',
        suggestedAction: 'Practice authentic self-expression in safe environments'
      });
    }

    // Behavioral insights
    if (behavioralMetrics.extremityBias > 30) {
      insights.push({
        title: 'Strong Convictions',
        description: 'You have clear, strong opinions and preferences across many areas.',
        impactArea: 'Communication',
        suggestedAction: 'Balance assertiveness with openness to other perspectives'
      });
    }

    return insights;
  }

  generateDetailedRecommendations(traits, neurodiversityScores, cognitiveMetrics) {
    const recommendations = {
      immediate: [],
      longTerm: []
    };

    // Executive function support
    if (neurodiversityScores.adhd.subcategories.executiveFunction > 60) {
      recommendations.immediate.push({
        title: 'Implement Executive Function Support',
        description: 'Set up external systems to support task management and time awareness.',
        steps: [
          'Install a visual task management app (e.g., Todoist, Notion)',
          'Set up time-blocking in your calendar',
          'Create visual reminders for important tasks',
          'Use the Pomodoro Technique for focused work sessions'
        ],
        outcome: 'Improved task completion and reduced overwhelm'
      });
    }

    // Sensory accommodations
    if (
      neurodiversityScores.sensoryProfile &&
      neurodiversityScores.sensoryProfile.sensitivity > 70
    ) {
      recommendations.immediate.push({
        title: 'Create Sensory-Friendly Environment',
        description: 'Modify your environment to reduce sensory overwhelm.',
        steps: [
          'Invest in noise-canceling headphones',
          'Adjust lighting to comfortable levels',
          'Create a quiet retreat space',
          'Develop a sensory toolkit for regulation'
        ],
        outcome: 'Reduced sensory stress and improved focus'
      });
    }

    // Long-term development
    if (traits.openness > 70) {
      recommendations.longTerm.push({
        title: 'Develop Expertise in Passion Areas',
        description: 'Channel your intellectual curiosity into deep expertise.',
        timeline: '6-12 months',
        milestones: [
          'Identify 1-2 areas of passionate interest',
          'Commit to structured learning plan',
          'Join communities of practice',
          'Share knowledge through writing or teaching'
        ]
      });
    }

    return recommendations;
  }

  generateCareerGuidance(traits, neurodiversityScores, cognitiveMetrics) {
    const guidance = {
      idealRoles: [],
      workEnvironment: {},
      skillsToDevelop: []
    };

    // Match roles based on profile
    if (traits.openness > 70 && cognitiveMetrics.thinkingStyle.creative > 70) {
      guidance.idealRoles.push({
        title: 'Creative Director',
        description: 'Leading creative vision and innovation in design or marketing',
        fitScore: 85,
        reasons: ['Leverages creative thinking', 'Allows autonomy', 'Values innovation']
      });
    }

    if (traits.conscientiousness > 70 && cognitiveMetrics.thinkingStyle.analytical > 70) {
      guidance.idealRoles.push({
        title: 'Data Scientist',
        description: 'Analyzing complex data to derive meaningful insights',
        fitScore: 80,
        reasons: [
          'Requires systematic thinking',
          'Values precision',
          'Involves pattern recognition'
        ]
      });
    }

    // Work environment preferences
    if (neurodiversityScores.autism.likelihood === 'High') {
      guidance.workEnvironment = {
        structure: 'Clear expectations and routines',
        communication: 'Written communication preferred',
        workspace: 'Quiet, predictable environment',
        flexibility: 'Remote work options beneficial'
      };
    } else {
      guidance.workEnvironment = {
        structure: 'Flexible with core hours',
        communication: 'Mixed verbal and written',
        workspace: 'Collaborative spaces available',
        flexibility: 'Hybrid work model'
      };
    }

    // Skills to develop
    if (neurodiversityScores.adhd.subcategories.executiveFunction > 60) {
      guidance.skillsToDevelop.push({
        name: 'Project Management',
        importance: 'Critical for managing multiple priorities',
        resources: ['PMP certification', 'Agile methodology training', 'Time management courses']
      });
    }

    return guidance;
  }

  generateRelationshipInsights(traits) {
    const insights = {
      communicationStyle: {
        description: this.describeCommunicationStyle(traits),
        characteristics: this.getCommunicationCharacteristics(traits),
        tips: this.getCommunicationTips(traits)
      },
      compatibility: this.analyzeCompatibility(traits),
      strengths: this.getRelationshipStrengths(traits),
      growthAreas: this.getRelationshipGrowthAreas(traits)
    };

    return insights;
  }

  describeCommunicationStyle(traits) {
    if (traits.extraversion > 60 && traits.agreeableness > 60) {
      return 'You communicate warmly and openly, creating comfortable environments for dialogue.';
    } else if (traits.extraversion < 40 && traits.openness > 60) {
      return 'You prefer deep, meaningful conversations over small talk.';
    } else if (traits.conscientiousness > 70) {
      return 'You communicate clearly and precisely, valuing accuracy and completeness.';
    }

    return 'You adapt your communication style to different contexts and relationships.';
  }

  getCommunicationCharacteristics(traits) {
    const characteristics = [];

    if (traits.extraversion > 60) characteristics.push('Expressive and animated');
    if (traits.agreeableness > 60) characteristics.push('Supportive and validating');
    if (traits.conscientiousness > 60) characteristics.push('Clear and organized');
    if (traits.openness > 60) characteristics.push('Abstract and conceptual');

    return characteristics;
  }

  getCommunicationTips(traits) {
    const tips = [];

    if (traits.extraversion < 40) {
      tips.push('Schedule important conversations when you have energy');
      tips.push('Use written communication for complex topics');
    }
    if (traits.agreeableness > 70) {
      tips.push('Practice asserting your needs directly');
      tips.push('Set boundaries to prevent overcommitment');
    }
    if (traits.neuroticism > 60) {
      tips.push('Take breaks during emotional discussions');
      tips.push('Use "I feel" statements to express emotions');
    }

    return tips;
  }

  analyzeCompatibility(traits) {
    return [
      {
        type: 'Similar Personalities',
        score: 75,
        description: 'You connect easily with those who share your values and communication style.',
        tips: ['Seek diversity to avoid echo chambers', 'Challenge each other to grow']
      },
      {
        type: 'Complementary Personalities',
        score: 85,
        description: 'You benefit from partners who balance your traits.',
        tips: ['Appreciate different perspectives', 'Learn from contrasting approaches']
      }
    ];
  }

  getRelationshipStrengths(traits) {
    const strengths = [];

    if (traits.agreeableness > 60) strengths.push('Natural empathy and compassion');
    if (traits.conscientiousness > 60) strengths.push('Reliability and commitment');
    if (traits.openness > 60) strengths.push('Emotional depth and authenticity');
    if (traits.extraversion > 60) strengths.push('Social confidence and enthusiasm');

    return strengths;
  }

  getRelationshipGrowthAreas(traits) {
    const areas = [];

    if (traits.agreeableness < 40) areas.push('Developing empathy and compromise');
    if (traits.neuroticism > 70) areas.push('Managing emotional reactions');
    if (traits.extraversion < 40) areas.push('Initiating social connections');
    if (traits.conscientiousness < 40) areas.push('Following through on commitments');

    return areas;
  }

  generateGrowthPlan(traits, neurodiversityScores, cognitiveMetrics) {
    return {
      phases: [
        {
          name: 'Foundation Phase',
          duration: '1-2 months',
          description: 'Establish core support systems and self-awareness',
          goals: [
            'Complete self-assessment and reflection',
            'Set up organizational systems',
            'Identify support needs'
          ],
          activities: [
            'Daily mindfulness practice',
            'Weekly planning sessions',
            'Join support communities'
          ],
          metrics: [
            'Consistent daily routines established',
            'Support systems in place',
            'Self-awareness increased'
          ]
        },
        {
          name: 'Development Phase',
          duration: '3-6 months',
          description: 'Build skills and expand comfort zones',
          goals: [
            'Develop identified skill gaps',
            'Implement coping strategies',
            'Expand social or professional network'
          ],
          activities: [
            'Skill-building courses',
            'Practice new strategies',
            'Attend networking events'
          ],
          metrics: [
            'New skills demonstrated',
            'Strategies effectively used',
            'Network expanded by 25%'
          ]
        },
        {
          name: 'Integration Phase',
          duration: '6-12 months',
          description: 'Integrate learning and optimize performance',
          goals: [
            'Apply skills in real-world contexts',
            'Optimize personal systems',
            'Achieve key milestones'
          ],
          activities: [
            'Take on challenging projects',
            'Mentor others',
            'Regular performance review'
          ],
          metrics: ['Project success rate improved', 'Confidence increased', 'Goals achieved']
        }
      ],
      dailyHabits: [
        {
          name: 'Morning Planning',
          icon: 'sunrise',
          description: 'Review priorities and set daily intentions',
          timeRequired: '15 minutes'
        },
        {
          name: 'Mindful Breaks',
          icon: 'pause',
          description: 'Take sensory or movement breaks between tasks',
          timeRequired: '5 minutes hourly'
        },
        {
          name: 'Evening Reflection',
          icon: 'moon',
          description: "Journal accomplishments and tomorrow's priorities",
          timeRequired: '10 minutes'
        }
      ],
      resources: {
        books: [
          'Driven to Distraction by Edward Hallowell',
          'NeuroTribes by Steve Silberman',
          'The Highly Sensitive Person by Elaine Aron'
        ],
        apps: [
          'Habitica for gamified habit tracking',
          'Forest for focus management',
          'Calm for mindfulness and sleep'
        ],
        communities: [
          'ADHD support groups',
          'Autism self-advocacy networks',
          'Neurodiversity professional groups'
        ]
      }
    };
  }

  prepareVisualizationData(traits, neurodiversityScores, cognitiveMetrics) {
    return {
      personalityRadar: {
        labels: Object.keys(traits),
        data: Object.values(traits)
      },
      neurodiversityBar: {
        labels: ['ADHD', 'Autism', 'Anxiety', 'Depression'],
        data: [
          this.likelihoodToScore(neurodiversityScores.adhd.likelihood),
          this.likelihoodToScore(neurodiversityScores.autism.likelihood),
          this.likelihoodToScore(neurodiversityScores.anxiety.likelihood),
          this.likelihoodToScore(neurodiversityScores.depression.likelihood)
        ]
      },
      cognitiveSpider: {
        labels: Object.keys(cognitiveMetrics.thinkingStyle),
        data: Object.values(cognitiveMetrics.thinkingStyle)
      }
    };
  }

  likelihoodToScore(likelihood) {
    const map = { High: 80, Moderate: 50, Low: 20 };
    return map[likelihood] || 0;
  }

  generateComparativeAnalysis(traits) {
    return {
      populationPercentiles: {
        openness: this.calculatePercentile(traits.openness),
        conscientiousness: this.calculatePercentile(traits.conscientiousness),
        extraversion: this.calculatePercentile(traits.extraversion),
        agreeableness: this.calculatePercentile(traits.agreeableness),
        neuroticism: this.calculatePercentile(traits.neuroticism)
      },
      interpretation: this.interpretPercentiles(traits)
    };
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    // In production, would use normative data
    if (score >= 80) return 90;
    if (score >= 70) return 75;
    if (score >= 60) return 60;
    if (score >= 40) return 40;
    if (score >= 30) return 25;
    return 10;
  }

  interpretPercentiles(traits) {
    const highTraits = Object.entries(traits)
      .filter(([_, score]) => score >= 70)
      .map(([trait, _]) => trait);

    if (highTraits.length === 0) {
      return 'Your personality profile shows balanced traits across all dimensions.';
    }

    return `You score particularly high in ${highTraits.join(', ')}, placing you in the top quartile for these traits.`;
  }

  calculateValidityMetrics(responses, behavioralMetrics) {
    const consistency = this.assessResponseConsistency(responses);
    const completionRate = responses.length > 0 ? 1 : 0;
    const responseQuality = this.assessResponseQuality(responses, behavioralMetrics);

    return {
      consistency,
      completionRate,
      responseQuality,
      overallValidity: (consistency + completionRate + responseQuality) / 3
    };
  }

  assessResponseConsistency(responses) {
    // Check for consistent response patterns
    if (responses.length === 0) return 0;

    // Simple consistency check - in production would be more sophisticated
    const values = responses.map(r => r.value);
    const uniqueValues = [...new Set(values)];

    if (uniqueValues.length === 1) return 0.3; // All same response
    if (uniqueValues.length === values.length) return 1; // All different

    return 0.7 + (uniqueValues.length / values.length) * 0.3;
  }

  assessResponseQuality(responses, behavioralMetrics) {
    let quality = 1;

    // Reduce quality for extreme response bias
    if (behavioralMetrics.extremityBias > 50) quality -= 0.2;
    if (behavioralMetrics.centralTendency > 50) quality -= 0.2;

    // Check response times if available
    if (behavioralMetrics.averageSpeed) {
      if (behavioralMetrics.averageSpeed < 1000) quality -= 0.3; // Too fast
    }

    return Math.max(0.3, quality);
  }
}

module.exports = ComprehensiveReportGenerator;
