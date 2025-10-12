/**
 * Cloninger Temperament & Character Analyzer
 *
 * Converts Big Five personality to Cloninger's Psychobiological Model
 * Research basis:
 * - Cloninger et al. (1993) - A Psychobiological Model of Temperament and Character
 * - Cloninger (1999) - The Temperament and Character Inventory (TCI)
 * - De Fruyt et al. (2000) - Cloninger's Psychobiological Model of Temperament and Character and the FFM
 *
 * Temperament dimensions (biologically-based):
 * - Novelty Seeking (NS): Exploratory activity, impulsiveness, extravagance
 * - Harm Avoidance (HA): Worry, fear, shyness, fatigue
 * - Reward Dependence (RD): Sentimentality, attachment, dependence
 * - Persistence (P): Perseverance despite frustration and fatigue
 *
 * Character dimensions (self-concept):
 * - Self-Directedness (SD): Responsibility, purposefulness, resourcefulness
 * - Cooperativeness (C): Acceptance, empathy, helpfulness
 * - Self-Transcendence (ST): Spirituality, idealism
 */

class TemperamentAnalyzer {
  constructor() {
    // Mapping from Big Five to Cloninger Temperament
    // Based on meta-analytic correlations (De Fruyt et al., 2000; Herbst et al., 2000)
    this.temperamentMappings = {
      noveltySeeking: {
        // NS correlates: high Extraversion.excitementSeeking, high Openness.adventurousness, low Conscientiousness
        'extraversion.excitementSeeking': 0.60,   // r = .60
        'openness.adventurousness': 0.55,         // r = .55
        'conscientiousness.selfDiscipline': -0.40, // r = -.40 (impulsive)
        'conscientiousness.cautiousness': -0.45,   // r = -.45
        'openness': 0.35,                          // r = .35 overall
        'extraversion': 0.30                       // r = .30 overall
      },
      harmAvoidance: {
        // HA correlates: high Neuroticism (especially anxiety), low Extraversion (social inhibition)
        'neuroticism.anxiety': 0.70,               // r = .70
        'neuroticism.vulnerability': 0.60,         // r = .60
        'extraversion.assertiveness': -0.50,       // r = -.50 (shyness)
        'neuroticism.selfConsciousness': 0.55,     // r = .55
        'neuroticism': 0.75,                       // r = .75 overall (strongest correlation)
        'extraversion': -0.40                      // r = -.40 overall
      },
      rewardDependence: {
        // RD correlates: high Extraversion.warmth, high Agreeableness
        'extraversion.warmth': 0.65,               // r = .65
        'agreeableness.altruism': 0.55,            // r = .55
        'extraversion.gregariousness': 0.50,       // r = .50
        'agreeableness': 0.60,                     // r = .60 overall
        'extraversion': 0.45                       // r = .45 overall
      },
      persistence: {
        // P correlates: high Conscientiousness (especially achievement, discipline)
        'conscientiousness.achievementStriving': 0.70, // r = .70
        'conscientiousness.selfDiscipline': 0.65,  // r = .65
        'conscientiousness.dutifulness': 0.50,     // r = .50
        'conscientiousness': 0.75                  // r = .75 overall (strongest correlation)
      }
    };

    // Character dimensions (self-concept)
    this.characterMappings = {
      selfDirectedness: {
        // SD = low Neuroticism + high Conscientiousness
        'neuroticism': -0.60,                      // r = -.60
        'conscientiousness': 0.55                  // r = .55
      },
      cooperativeness: {
        // C = high Agreeableness
        'agreeableness': 0.70                      // r = .70
      },
      selfTranscendence: {
        // ST = high Openness (especially values, ideas)
        'openness': 0.45                           // r = .45
      }
    };

    // Temperament profiles (clinical/research-based)
    this.temperamentProfiles = {
      adventurous: {
        pattern: { NS: 'high', HA: 'low', RD: 'average', P: 'average' },
        prevalence: 0.12,
        description: 'Exploratory, fearless, sensation-seeking',
        strengths: ['Innovation', 'Risk-taking', 'Adaptability', 'Energy'],
        vulnerabilities: ['Impulsivity', 'Substance abuse risk', 'Rule-breaking'],
        careerFit: ['Entrepreneurship', 'Sales', 'Emergency services', 'Creative fields']
      },
      cautious: {
        pattern: { NS: 'low', HA: 'high', RD: 'average', P: 'average' },
        prevalence: 0.15,
        description: 'Careful, anxious, risk-averse, pessimistic',
        strengths: ['Careful planning', 'Risk management', 'Attention to detail'],
        vulnerabilities: ['Anxiety disorders', 'Depression', 'Social inhibition'],
        careerFit: ['Quality assurance', 'Compliance', 'Research', 'Analysis']
      },
      reliable: {
        pattern: { NS: 'low', HA: 'low', RD: 'average', P: 'high' },
        prevalence: 0.18,
        description: 'Dependable, stable, determined, methodical',
        strengths: ['Reliability', 'Perseverance', 'Emotional stability', 'Long-term focus'],
        vulnerabilities: ['Rigidity', 'Difficulty with change'],
        careerFit: ['Project management', 'Administration', 'Operations', 'Finance']
      },
      sociable: {
        pattern: { NS: 'average', HA: 'low', RD: 'high', P: 'average' },
        prevalence: 0.20,
        description: 'Warm, sentimental, approval-seeking, socially dependent',
        strengths: ['Relationship building', 'Empathy', 'Team harmony', 'Customer service'],
        vulnerabilities: ['Separation anxiety', 'Approval dependency', 'Rejection sensitivity'],
        careerFit: ['Counseling', 'Teaching', 'Healthcare', 'Hospitality']
      },
      independent: {
        pattern: { NS: 'average', HA: 'average', RD: 'low', P: 'average' },
        prevalence: 0.10,
        description: 'Self-reliant, aloof, socially detached',
        strengths: ['Independence', 'Self-sufficiency', 'Objective decision-making'],
        vulnerabilities: ['Social isolation', 'Difficulty with teamwork'],
        careerFit: ['Individual contributor roles', 'Remote work', 'Technical roles']
      },
      explosive: {
        pattern: { NS: 'high', HA: 'high', RD: 'low', P: 'low' },
        prevalence: 0.08,
        description: 'Impulsive yet anxious, unstable, volatile',
        strengths: ['Passion', 'Intensity', 'Emotional range'],
        vulnerabilities: ['Borderline traits', 'Mood instability', 'Impulsive decisions'],
        careerFit: ['Creative arts', 'Crisis intervention (with support)'],
        clinical: true
      },
      methodical: {
        pattern: { NS: 'low', HA: 'average', RD: 'average', P: 'high' },
        prevalence: 0.17,
        description: 'Systematic, persistent, detail-oriented',
        strengths: ['Thoroughness', 'Follow-through', 'Quality work', 'Expertise development'],
        vulnerabilities: ['Perfectionism', 'Workaholism'],
        careerFit: ['Engineering', 'Medicine', 'Law', 'Academia']
      }
    };

    // Thresholds
    this.thresholds = {
      high: 60,
      low: 40
    };

    // Outcome correlations
    this.outcomeCorrelations = {
      substanceAbuse: {
        temperament: 'noveltySeeking',
        correlation: 0.35,
        description: 'High NS predicts substance use disorders (r = .35)'
      },
      anxietyDisorders: {
        temperament: 'harmAvoidance',
        correlation: 0.50,
        description: 'High HA strongly predicts anxiety disorders (r = .50)'
      },
      depression: {
        temperament: 'harmAvoidance',
        correlation: 0.45,
        description: 'High HA predicts depression (r = .45)'
      },
      antisocialBehavior: {
        temperament: 'noveltySeeking',
        correlation: 0.30,
        description: 'High NS (especially with low HA) predicts antisocial behavior'
      },
      careerSuccess: {
        temperament: 'persistence',
        correlation: 0.40,
        description: 'High persistence predicts career achievement (r = .40)'
      }
    };
  }

  /**
   * Main analysis function
   */
  analyze(bigFiveScores, facetScores = null) {
    // Calculate temperament dimensions
    const temperament = {
      noveltySeeking: this.calculateDimension('noveltySeeking', bigFiveScores, facetScores),
      harmAvoidance: this.calculateDimension('harmAvoidance', bigFiveScores, facetScores),
      rewardDependence: this.calculateDimension('rewardDependence', bigFiveScores, facetScores),
      persistence: this.calculateDimension('persistence', bigFiveScores, facetScores)
    };

    // Calculate character dimensions
    const character = {
      selfDirectedness: this.calculateCharacter('selfDirectedness', bigFiveScores),
      cooperativeness: this.calculateCharacter('cooperativeness', bigFiveScores),
      selfTranscendence: this.calculateCharacter('selfTranscendence', bigFiveScores)
    };

    // Identify temperament profile
    const profile = this.identifyProfile(temperament);

    // Generate interpretations
    const interpretations = {
      noveltySeeking: this.interpretDimension('noveltySeeking', temperament.noveltySeeking),
      harmAvoidance: this.interpretDimension('harmAvoidance', temperament.harmAvoidance),
      rewardDependence: this.interpretDimension('rewardDependence', temperament.rewardDependence),
      persistence: this.interpretDimension('persistence', temperament.persistence)
    };

    // Clinical predictions
    const clinicalPredictions = this.predictClinicalOutcomes(temperament);

    // Career implications
    const careerImplications = this.generateCareerImplications(temperament, character);

    // Neurotransmitter associations (theoretical)
    const neurobiology = this.describeNeurobiology(temperament);

    return {
      temperament,
      character,
      profile,
      interpretations,
      clinicalPredictions,
      careerImplications,
      neurobiology,
      insights: this.generateInsights(temperament, character, profile),
      recommendations: this.generateRecommendations(temperament, character, profile)
    };
  }

  /**
   * Calculate temperament dimension from Big Five
   */
  calculateDimension(dimension, bigFiveScores, facetScores = null) {
    const mappings = this.temperamentMappings[dimension];
    if (!mappings) return 50;

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(mappings).forEach(([key, weight]) => {
      let value;

      if (key.includes('.')) {
        // Facet-level mapping
        if (facetScores && facetScores[key] !== undefined) {
          value = facetScores[key];
        } else {
          return; // Skip if facet not available
        }
      } else {
        // Trait-level mapping
        value = bigFiveScores[key];
      }

      if (value !== undefined) {
        const contribution = weight > 0
          ? value * Math.abs(weight)
          : (100 - value) * Math.abs(weight);
        weightedSum += contribution;
        totalWeight += Math.abs(weight);
      }
    });

    if (totalWeight === 0) return 50;

    const score = weightedSum / totalWeight;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate character dimension
   */
  calculateCharacter(dimension, bigFiveScores) {
    const mappings = this.characterMappings[dimension];
    if (!mappings) return 50;

    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(mappings).forEach(([trait, weight]) => {
      const value = bigFiveScores[trait];
      if (value !== undefined) {
        const contribution = weight > 0
          ? value * Math.abs(weight)
          : (100 - value) * Math.abs(weight);
        weightedSum += contribution;
        totalWeight += Math.abs(weight);
      }
    });

    if (totalWeight === 0) return 50;

    const score = weightedSum / totalWeight;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Identify temperament profile
   */
  identifyProfile(temperament) {
    const { noveltySeeking, harmAvoidance, rewardDependence, persistence } = temperament;

    // Convert to categorical levels
    const levels = {
      NS: noveltySeeking >= this.thresholds.high ? 'high' : noveltySeeking <= this.thresholds.low ? 'low' : 'average',
      HA: harmAvoidance >= this.thresholds.high ? 'high' : harmAvoidance <= this.thresholds.low ? 'low' : 'average',
      RD: rewardDependence >= this.thresholds.high ? 'high' : rewardDependence <= this.thresholds.low ? 'low' : 'average',
      P: persistence >= this.thresholds.high ? 'high' : persistence <= this.thresholds.low ? 'low' : 'average'
    };

    // Find best matching profile
    let bestMatch = null;
    let bestScore = -1;

    Object.entries(this.temperamentProfiles).forEach(([name, profile]) => {
      let matchScore = 0;

      if (profile.pattern.NS === levels.NS) matchScore++;
      if (profile.pattern.HA === levels.HA) matchScore++;
      if (profile.pattern.RD === levels.RD) matchScore++;
      if (profile.pattern.P === levels.P) matchScore++;

      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = { name, ...profile, matchQuality: matchScore / 4 };
      }
    });

    return bestMatch;
  }

  /**
   * Interpret individual dimension
   */
  interpretDimension(dimension, score) {
    const interpretations = {
      noveltySeeking: {
        high: {
          description: 'High Novelty Seeking: Exploratory, impulsive, quick-tempered, extravagant, enthusiastic',
          characteristics: ['Seeks new experiences', 'Takes risks readily', 'Acts on impulse', 'Spends freely', 'Gets bored easily'],
          neurobiology: 'Associated with dopaminergic activity (reward system)',
          implications: 'Thrives on variety and excitement; may struggle with routine'
        },
        low: {
          description: 'Low Novelty Seeking: Cautious, reflective, frugal, reserved, tolerant of monotony',
          characteristics: ['Prefers familiar experiences', 'Avoids risks', 'Thinks before acting', 'Saves money', 'Tolerates routine'],
          neurobiology: 'Lower dopaminergic activity',
          implications: 'Prefers stability and predictability; may miss opportunities'
        },
        average: {
          description: 'Average Novelty Seeking: Balanced approach to new experiences',
          characteristics: ['Selective exploration', 'Calculated risk-taking', 'Moderate impulsivity'],
          implications: 'Adaptable to both routine and novelty'
        }
      },
      harmAvoidance: {
        high: {
          description: 'High Harm Avoidance: Worrying, fearful, shy, fatigable, pessimistic',
          characteristics: ['Anticipates problems', 'Avoids strangers', 'Tires easily', 'Expects worst', 'Socially inhibited'],
          neurobiology: 'Associated with serotonergic activity (anxiety regulation)',
          implications: 'Careful planning but may be inhibited by anxiety',
          clinicalRisk: 'Elevated risk for anxiety disorders (r = .50) and depression (r = .45)'
        },
        low: {
          description: 'Low Harm Avoidance: Optimistic, bold, outgoing, energetic, relaxed',
          characteristics: ['Expects good outcomes', 'Comfortable with strangers', 'High energy', 'Confident', 'Socially uninhibited'],
          neurobiology: 'Lower serotonergic sensitivity',
          implications: 'Resilient and confident; may underestimate risks'
        },
        average: {
          description: 'Average Harm Avoidance: Balanced caution and confidence',
          characteristics: ['Realistic risk assessment', 'Moderate social ease', 'Balanced energy'],
          implications: 'Adaptable to both safe and risky situations'
        }
      },
      rewardDependence: {
        high: {
          description: 'High Reward Dependence: Warm, sentimental, approval-seeking, socially dependent',
          characteristics: ['Forms strong attachments', 'Seeks social approval', 'Emotionally open', 'Helps others readily', 'Dislikes being alone'],
          neurobiology: 'Associated with noradrenergic activity (social attachment)',
          implications: 'Excellent relationship skills; may be overly dependent on approval'
        },
        low: {
          description: 'Low Reward Dependence: Aloof, detached, independent, socially insensitive',
          characteristics: ['Emotionally independent', 'Indifferent to approval', 'Reserved emotionally', 'Self-reliant', 'Comfortable alone'],
          neurobiology: 'Lower noradrenergic sensitivity',
          implications: 'Independent and objective; may struggle with empathy'
        },
        average: {
          description: 'Average Reward Dependence: Balanced social orientation',
          characteristics: ['Moderate warmth', 'Selective attachment', 'Balanced independence'],
          implications: 'Can work alone or with others effectively'
        }
      },
      persistence: {
        high: {
          description: 'High Persistence: Industrious, determined, ambitious, perfectionistic',
          characteristics: ['Perseveres despite obstacles', 'Works long hours', 'Pursues high standards', 'Completes tasks', 'Ambitious goals'],
          neurobiology: 'May involve dopaminergic and serotonergic systems',
          implications: 'Achieves long-term goals; risk of workaholism and burnout'
        },
        low: {
          description: 'Low Persistence: Easily discouraged, inactive, indolent, gives up easily',
          characteristics: ['Quits when frustrated', 'Prefers easy tasks', 'Low ambition', 'Procrastinates', 'Underachieves'],
          implications: 'May underachieve without external structure and support'
        },
        average: {
          description: 'Average Persistence: Moderate perseverance',
          characteristics: ['Balances effort and rest', 'Pursues achievable goals', 'Flexible standards'],
          implications: 'Balanced achievement orientation'
        }
      }
    };

    const dimInterp = interpretations[dimension];
    if (!dimInterp) return null;

    if (score >= this.thresholds.high) {
      return { level: 'high', score, ...dimInterp.high };
    } else if (score <= this.thresholds.low) {
      return { level: 'low', score, ...dimInterp.low };
    } else {
      return { level: 'average', score, ...dimInterp.average };
    }
  }

  /**
   * Predict clinical outcomes
   */
  predictClinicalOutcomes(temperament) {
    const predictions = [];

    // High NS + Low HA = Antisocial risk
    if (temperament.noveltySeeking >= 60 && temperament.harmAvoidance <= 40) {
      predictions.push({
        condition: 'Antisocial/Conduct Issues',
        risk: 'elevated',
        description: 'High novelty seeking with low harm avoidance predicts impulsive rule-breaking and aggression',
        protective: 'High reward dependence or persistence can buffer this risk'
      });
    }

    // High HA = Anxiety/Depression risk
    if (temperament.harmAvoidance >= 65) {
      predictions.push({
        condition: 'Anxiety Disorders',
        risk: 'elevated',
        correlation: 0.50,
        description: 'High harm avoidance strongly predicts anxiety disorders (r = .50)',
        protective: 'High self-directedness can buffer this risk'
      });

      if (temperament.harmAvoidance >= 70) {
        predictions.push({
          condition: 'Depression',
          risk: 'elevated',
          correlation: 0.45,
          description: 'Very high harm avoidance predicts depression (r = .45)',
          protective: 'High reward dependence (social support) can be protective'
        });
      }
    }

    // High NS = Substance abuse risk
    if (temperament.noveltySeeking >= 65) {
      predictions.push({
        condition: 'Substance Use Disorders',
        risk: 'elevated',
        correlation: 0.35,
        description: 'High novelty seeking predicts substance abuse (r = .35)',
        protective: 'High harm avoidance or high persistence can reduce risk'
      });
    }

    // Low RD = Social isolation risk
    if (temperament.rewardDependence <= 35) {
      predictions.push({
        condition: 'Social Isolation',
        risk: 'moderate',
        description: 'Very low reward dependence may lead to social isolation and loneliness',
        protective: 'High self-directedness can support healthy independence'
      });
    }

    // Low P + High NS = ADHD-like pattern
    if (temperament.persistence <= 40 && temperament.noveltySeeking >= 55) {
      predictions.push({
        condition: 'ADHD-Like Pattern',
        risk: 'pattern present',
        description: 'Low persistence with high novelty seeking resembles ADHD temperament profile',
        note: 'This is a temperamental pattern, not a diagnosis'
      });
    }

    if (predictions.length === 0) {
      predictions.push({
        condition: 'Balanced Temperament',
        risk: 'low',
        description: 'No significant clinical risk patterns detected. Temperament profile suggests good psychological resilience.'
      });
    }

    return predictions;
  }

  /**
   * Generate career implications
   */
  generateCareerImplications(temperament, character) {
    const implications = [];

    const { noveltySeeking, harmAvoidance, rewardDependence, persistence } = temperament;
    const { selfDirectedness, cooperativeness } = character;

    // High P = Career success potential
    if (persistence >= 60) {
      implications.push({
        factor: 'High Persistence',
        implication: 'Strong predictor of career success (r = .40). Excel in roles requiring sustained effort and expertise development.',
        careers: ['Medicine', 'Law', 'Academia', 'Engineering', 'Finance']
      });
    }

    // High NS + Low HA = Entrepreneurial
    if (noveltySeeking >= 55 && harmAvoidance <= 45) {
      implications.push({
        factor: 'Adventurous Temperament',
        implication: 'Entrepreneurial profile. Thrive in high-risk, high-reward environments with novelty and autonomy.',
        careers: ['Entrepreneurship', 'Sales', 'Emergency services', 'Creative fields', 'Trading']
      });
    }

    // Low NS + High HA = Analytical/Cautious
    if (noveltySeeking <= 45 && harmAvoidance >= 55) {
      implications.push({
        factor: 'Cautious Temperament',
        implication: 'Excel in roles requiring careful analysis, risk management, and attention to detail.',
        careers: ['Quality assurance', 'Compliance', 'Auditing', 'Research', 'Technical writing']
      });
    }

    // High RD = People-oriented
    if (rewardDependence >= 60) {
      implications.push({
        factor: 'High Reward Dependence',
        implication: 'Strong interpersonal skills. Excel in relationship-centered roles.',
        careers: ['Counseling', 'Teaching', 'Healthcare', 'HR', 'Customer service', 'Hospitality']
      });
    }

    // Low RD + High SD = Independent professional
    if (rewardDependence <= 40 && selfDirectedness >= 55) {
      implications.push({
        factor: 'Independent Temperament',
        implication: 'Thrive in autonomous roles with minimal social interaction. Objective decision-making.',
        careers: ['Software development', 'Data analysis', 'Writing', 'Research', 'Remote work']
      });
    }

    return implications;
  }

  /**
   * Describe neurobiological associations
   */
  describeNeurobiology(temperament) {
    return {
      noveltySeeking: {
        neurotransmitter: 'Dopamine',
        system: 'Behavioral Activation System (BAS)',
        description: `Your novelty seeking (${temperament.noveltySeeking}) reflects dopaminergic activity in reward circuits. Higher NS = more dopamine release in response to novel stimuli.`
      },
      harmAvoidance: {
        neurotransmitter: 'Serotonin',
        system: 'Behavioral Inhibition System (BIS)',
        description: `Your harm avoidance (${temperament.harmAvoidance}) reflects serotonergic modulation of anxiety. Higher HA = lower serotonergic activity, greater anxiety sensitivity.`
      },
      rewardDependence: {
        neurotransmitter: 'Norepinephrine',
        system: 'Social Attachment System',
        description: `Your reward dependence (${temperament.rewardDependence}) reflects noradrenergic activity in attachment circuits. Higher RD = stronger social reward sensitivity.`
      },
      persistence: {
        neurotransmitter: 'Multiple (DA/5-HT)',
        system: 'Goal Maintenance System',
        description: `Your persistence (${temperament.persistence}) likely involves both dopaminergic (reward pursuit) and serotonergic (impulse control) systems.`
      },
      note: 'These are theoretical associations from Cloninger\'s model. Actual neurobiology is more complex and interactive.'
    };
  }

  /**
   * Generate insights
   */
  generateInsights(temperament, character, profile) {
    const insights = [];

    // Profile-specific insight
    if (profile) {
      insights.push({
        type: 'profile',
        title: `${profile.name.charAt(0).toUpperCase() + profile.name.slice(1)} Temperament Profile`,
        description: `${profile.description}. Prevalence: ${Math.round(profile.prevalence * 100)}% of population.`,
        matchQuality: profile.matchQuality >= 0.75 ? 'excellent' : 'good'
      });
    }

    // Character maturity
    if (character.selfDirectedness >= 60 && character.cooperativeness >= 60) {
      insights.push({
        type: 'character',
        title: 'Mature Character Development',
        description: 'High self-directedness and cooperativeness indicate mature character development. Associated with life satisfaction and mental health.'
      });
    }

    // Explosive combination
    if (temperament.noveltySeeking >= 60 && temperament.harmAvoidance >= 60) {
      insights.push({
        type: 'clinical',
        title: 'Explosive Temperament Pattern',
        description: 'High novelty seeking combined with high harm avoidance creates internal conflict - impulsive yet anxious. Associated with borderline traits and mood instability.',
        note: 'High self-directedness can help manage this pattern'
      });
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(temperament, character, profile) {
    const recommendations = [];

    // Based on profile
    if (profile) {
      profile.vulnerabilities.forEach(vuln => {
        recommendations.push({
          category: 'risk_management',
          vulnerability: vuln,
          recommendation: this.getVulnerabilityRecommendation(vuln, temperament, character)
        });
      });
    }

    // Dimension-specific
    if (temperament.harmAvoidance >= 65) {
      recommendations.push({
        category: 'anxiety_management',
        recommendation: 'High harm avoidance: Consider cognitive-behavioral approaches, gradual exposure, and stress management techniques. Regular exercise can boost serotonin.'
      });
    }

    if (temperament.noveltySeeking >= 65) {
      recommendations.push({
        category: 'impulse_control',
        recommendation: 'High novelty seeking: Channel exploratory drive productively through structured variety (e.g., varied projects with clear deadlines). Monitor substance use and risk-taking.'
      });
    }

    if (temperament.persistence <= 35) {
      recommendations.push({
        category: 'goal_achievement',
        recommendation: 'Low persistence: Break goals into smaller milestones. Use external accountability. Celebrate small wins to maintain motivation.'
      });
    }

    if (character.selfDirectedness <= 40) {
      recommendations.push({
        category: 'character_development',
        recommendation: 'Low self-directedness: Focus on clarifying personal values, setting meaningful goals, and taking responsibility for outcomes. Therapy can help.'
      });
    }

    return recommendations;
  }

  /**
   * Get vulnerability-specific recommendation
   */
  getVulnerabilityRecommendation(vulnerability, temperament, character) {
    const recommendations = {
      'Impulsivity': 'Practice "urge surfing" - delay acting on impulses by 10 minutes. Use implementation intentions.',
      'Substance abuse risk': 'Limit access to substances. Find healthy novelty (travel, hobbies, variety in work). Monitor use patterns.',
      'Anxiety disorders': 'CBT, exposure therapy, mindfulness. Regular exercise boosts serotonin. Avoid excessive caffeine.',
      'Depression': 'Increase behavioral activation, social connection (reward dependence), and goal pursuit (persistence). Therapy recommended.',
      'Social isolation': 'Schedule regular social contact even if not desired. Join activity groups matching interests.',
      'Rigidity': 'Practice flexibility exercises. Try new routines monthly. Seek diverse perspectives.',
      'Approval dependency': 'Work on self-validation. Track intrinsic vs extrinsic motivation. Therapy for codependency patterns.',
      'Perfectionism': 'Set "good enough" standards for routine tasks. Practice self-compassion. Time-box projects.',
      'Workaholism': 'Set hard boundaries on work hours. Schedule rest as priority. Address underlying anxiety.'
    };

    return recommendations[vulnerability] || 'Work with therapist or coach to address this vulnerability.';
  }
}

module.exports = TemperamentAnalyzer;
