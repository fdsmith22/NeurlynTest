/**
 * Age-Normative Personality Analysis
 *
 * Compares individual personality scores to age-appropriate norms
 * Research basis:
 * - Roberts et al. (2006) - Patterns of Mean-Level Change in Personality Traits Across the Life Course
 * - Soto et al. (2011) - Age Differences in Personality Traits From 10 to 65
 * - Terracciano et al. (2005) - National Character Does Not Reflect Mean Personality Trait Levels
 */

class AgeNormativeAnalyzer {
  constructor() {
    // Age norms based on meta-analysis (Roberts et al., 2006; Soto et al., 2011)
    this.ageNorms = {
      '18-25': {
        openness: { mean: 52, sd: 10 },
        conscientiousness: { mean: 48, sd: 10 },
        extraversion: { mean: 53, sd: 10 },
        agreeableness: { mean: 49, sd: 10 },
        neuroticism: { mean: 51, sd: 10 }
      },
      '26-35': {
        openness: { mean: 51, sd: 10 },
        conscientiousness: { mean: 50, sd: 10 },
        extraversion: { mean: 51, sd: 10 },
        agreeableness: { mean: 50, sd: 10 },
        neuroticism: { mean: 50, sd: 10 }
      },
      '36-50': {
        openness: { mean: 50, sd: 10 },
        conscientiousness: { mean: 52, sd: 10 },
        extraversion: { mean: 49, sd: 10 },
        agreeableness: { mean: 52, sd: 10 },
        neuroticism: { mean: 48, sd: 10 }
      },
      '51+': {
        openness: { mean: 48, sd: 10 },
        conscientiousness: { mean: 54, sd: 10 },
        extraversion: { mean: 48, sd: 10 },
        agreeableness: { mean: 54, sd: 10 },
        neuroticism: { mean: 46, sd: 10 }
      }
    };

    // Developmental trajectories (effect sizes per decade from Roberts meta-analysis)
    this.developmentalTrajectories = {
      openness: { changePerDecade: -0.4, peak: '18-25', pattern: 'gradual decline' },
      conscientiousness: { changePerDecade: 0.6, peak: '51+', pattern: 'steady increase' },
      extraversion: { changePerDecade: -0.5, peak: '18-25', pattern: 'social vitality declines, dominance stable' },
      agreeableness: { changePerDecade: 0.5, peak: '51+', pattern: 'steady increase' },
      neuroticism: { changePerDecade: -0.5, peak: '18-25', pattern: 'steady decrease' }
    };

    // Maturation milestones
    this.maturationMilestones = {
      conscientiousness: {
        typical: { '18-25': 48, '26-35': 50, '36-50': 52, '51+': 54 },
        accelerated: 'Higher conscientiousness than age-matched peers suggests early career maturation',
        delayed: 'Lower conscientiousness may indicate extended exploration phase'
      },
      agreeableness: {
        typical: { '18-25': 49, '26-35': 50, '36-50': 52, '51+': 54 },
        accelerated: 'Above-average agreeableness suggests early interpersonal maturation',
        delayed: 'Lower agreeableness may reflect competitive/independent developmental phase'
      },
      neuroticism: {
        typical: { '18-25': 51, '26-35': 50, '36-50': 48, '51+': 46 },
        accelerated: 'Lower neuroticism than peers suggests early emotional stability',
        delayed: 'Higher neuroticism is common in early adulthood; typically decreases with age'
      }
    };

    // Clinical thresholds
    this.thresholds = {
      highlyAccelerated: 1.5,  // >1.5 SD ahead of age peers
      accelerated: 0.8,        // 0.8-1.5 SD ahead
      typical: 0.8,            // Within 0.8 SD
      delayed: 0.8,            // 0.8-1.5 SD behind
      highlyDelayed: 1.5       // >1.5 SD behind
    };
  }

  /**
   * Main analysis function
   */
  analyze(traitScores, age) {
    if (!age) {
      return null; // Cannot perform age-normative analysis without age
    }

    const ageGroup = this.getAgeGroup(age);
    const norms = this.ageNorms[ageGroup];

    if (!norms) {
      return null;
    }

    // Calculate z-scores relative to age cohort
    const ageRelativeScores = {};
    const deviations = {};
    const maturationStatus = {};

    Object.keys(traitScores).forEach(trait => {
      const norm = norms[trait];
      if (norm) {
        const zScore = (traitScores[trait] - norm.mean) / norm.sd;
        ageRelativeScores[trait] = {
          score: traitScores[trait],
          ageNorm: norm.mean,
          zScore: zScore,
          percentileInAgeCohort: this.zScoreToPercentile(zScore),
          deviation: traitScores[trait] - norm.mean,
          interpretation: this.interpretAgeDeviation(trait, zScore, age)
        };
        deviations[trait] = zScore;
        maturationStatus[trait] = this.assessMaturation(trait, traitScores[trait], ageGroup, age);
      }
    });

    // Overall maturation assessment
    const overallMaturation = this.assessOverallMaturation(maturationStatus, age);

    // Developmental context
    const developmentalContext = this.generateDevelopmentalContext(traitScores, age, ageGroup);

    // Future trajectory predictions
    const trajectoryPredictions = this.predictTrajectories(traitScores, age);

    return {
      age,
      ageGroup,
      ageRelativeScores,
      maturationStatus,
      overallMaturation,
      developmentalContext,
      trajectoryPredictions,
      insights: this.generateAgeInsights(ageRelativeScores, maturationStatus, age),
      recommendations: this.generateAgeRecommendations(maturationStatus, age)
    };
  }

  /**
   * Determine age group
   */
  getAgeGroup(age) {
    if (age >= 18 && age <= 25) return '18-25';
    if (age >= 26 && age <= 35) return '26-35';
    if (age >= 36 && age <= 50) return '36-50';
    if (age >= 51) return '51+';
    return null;
  }

  /**
   * Convert z-score to percentile
   */
  zScoreToPercentile(z) {
    // Approximation using error function
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    const percentile = z >= 0 ? (1 - p) * 100 : p * 100;
    return Math.round(percentile);
  }

  /**
   * Interpret deviation from age norms
   */
  interpretAgeDeviation(trait, zScore, age) {
    const absZ = Math.abs(zScore);

    if (absZ < this.thresholds.typical) {
      return {
        status: 'typical',
        description: `Typical for age ${age}`,
        level: 'average'
      };
    }

    if (zScore > 0) {
      // Above age norms
      if (absZ >= this.thresholds.highlyAccelerated) {
        return {
          status: 'highly_accelerated',
          description: `Significantly higher than age ${age} peers (top 7%)`,
          level: 'very high',
          implication: this.getAcceleratedImplication(trait)
        };
      } else if (absZ >= this.thresholds.accelerated) {
        return {
          status: 'accelerated',
          description: `Higher than typical for age ${age} (top 21%)`,
          level: 'high',
          implication: this.getAcceleratedImplication(trait)
        };
      }
    } else {
      // Below age norms
      if (absZ >= this.thresholds.highlyDelayed) {
        return {
          status: 'highly_delayed',
          description: `Significantly lower than age ${age} peers (bottom 7%)`,
          level: 'very low',
          implication: this.getDelayedImplication(trait)
        };
      } else if (absZ >= this.thresholds.delayed) {
        return {
          status: 'delayed',
          description: `Lower than typical for age ${age} (bottom 21%)`,
          level: 'low',
          implication: this.getDelayedImplication(trait)
        };
      }
    }

    return {
      status: 'typical',
      description: `Typical for age ${age}`,
      level: 'average'
    };
  }

  /**
   * Get implication for accelerated trait
   */
  getAcceleratedImplication(trait) {
    const implications = {
      conscientiousness: 'Early career maturation; may advance quickly in structured environments',
      agreeableness: 'Early interpersonal maturation; strong collaborative skills for age',
      neuroticism: 'Unusual emotional stability for age; protective factor for mental health',
      openness: 'Maintaining youthful curiosity; lifelong learning orientation',
      extraversion: 'High social engagement for age; leadership potential'
    };
    return implications[trait] || 'Above average for age cohort';
  }

  /**
   * Get implication for delayed trait
   */
  getDelayedImplication(trait) {
    const implications = {
      conscientiousness: 'Extended exploration phase; benefits from external structure',
      agreeableness: 'Independent/competitive phase; may shift toward cooperation with age',
      neuroticism: 'Common in early adulthood; typically decreases with life experience',
      openness: 'Typical age-related decline; may benefit from novel experiences',
      extraversion: 'Typical age-related decline in social vitality; consider energy management'
    };
    return implications[trait] || 'Below average for age cohort';
  }

  /**
   * Assess maturation for specific trait
   */
  assessMaturation(trait, score, ageGroup, age) {
    const trajectory = this.developmentalTrajectories[trait];
    if (!trajectory) return null;

    const norm = this.ageNorms[ageGroup][trait].mean;
    const deviation = score - norm;

    let status = 'on-track';
    let description = '';

    if (Math.abs(deviation) < 5) {
      status = 'on-track';
      description = `${trait.charAt(0).toUpperCase() + trait.slice(1)} development is typical for age ${age}`;
    } else if (deviation > 0) {
      status = 'accelerated';
      description = `${trait.charAt(0).toUpperCase() + trait.slice(1)} shows accelerated development relative to age ${age} peers`;
    } else {
      status = 'delayed';
      description = `${trait.charAt(0).toUpperCase() + trait.slice(1)} development is behind age ${age} norms`;
    }

    return {
      trait,
      status,
      description,
      deviation,
      trajectory: trajectory.pattern,
      expectedChange: trajectory.changePerDecade
    };
  }

  /**
   * Assess overall maturation pattern
   */
  assessOverallMaturation(maturationStatus, age) {
    const statuses = Object.values(maturationStatus).map(m => m.status);
    const acceleratedCount = statuses.filter(s => s === 'accelerated').length;
    const delayedCount = statuses.filter(s => s === 'delayed').length;

    let overallStatus = 'balanced';
    let description = '';

    if (acceleratedCount >= 3) {
      overallStatus = 'early-maturation';
      description = `Multiple traits show accelerated development for age ${age}. This suggests early psychological maturation, often associated with early life responsibilities or reflective temperament.`;
    } else if (delayedCount >= 3) {
      overallStatus = 'extended-exploration';
      description = `Multiple traits show delayed development for age ${age}. This pattern is common in extended exploration phases and may indicate a less conventional developmental path.`;
    } else if (acceleratedCount > 0 && delayedCount > 0) {
      overallStatus = 'mixed-maturation';
      description = `Mixed maturation pattern for age ${age}. Some traits show accelerated development while others lag behind peers, creating a unique developmental profile.`;
    } else {
      overallStatus = 'typical-development';
      description = `Personality development is typical for age ${age}, tracking expected developmental trajectories.`;
    }

    return {
      status: overallStatus,
      description,
      acceleratedTraits: Object.keys(maturationStatus).filter(t => maturationStatus[t].status === 'accelerated'),
      delayedTraits: Object.keys(maturationStatus).filter(t => maturationStatus[t].status === 'delayed'),
      onTrackTraits: Object.keys(maturationStatus).filter(t => maturationStatus[t].status === 'on-track')
    };
  }

  /**
   * Generate developmental context
   */
  generateDevelopmentalContext(traitScores, age, ageGroup) {
    const context = [];

    // Conscientiousness context
    if (age >= 18 && age <= 35) {
      const cScore = traitScores.conscientiousness;
      if (cScore < 45) {
        context.push({
          trait: 'conscientiousness',
          message: 'Conscientiousness typically increases through your 20s and 30s as career and family responsibilities grow. Current scores suggest you\'re in an exploration phase.',
          developmental: true
        });
      } else if (cScore > 55) {
        context.push({
          trait: 'conscientiousness',
          message: 'Your conscientiousness is higher than typical for your age, suggesting early career maturation. This can be advantageous in professional settings.',
          developmental: true
        });
      }
    }

    // Neuroticism context
    if (age >= 18 && age <= 35 && traitScores.neuroticism > 55) {
      context.push({
        trait: 'neuroticism',
        message: 'Elevated neuroticism is common in early adulthood. Research shows emotional stability typically increases through the 30s and 40s as life circumstances stabilize.',
        developmental: true,
        reassuring: true
      });
    }

    // Openness context
    if (age >= 51 && traitScores.openness > 55) {
      context.push({
        trait: 'openness',
        message: 'Your openness remains high despite typical age-related declines. This suggests maintained cognitive flexibility and curiosity - protective factors for cognitive aging.',
        developmental: true,
        protective: true
      });
    }

    // Agreeableness context
    if (age >= 36 && traitScores.agreeableness < 45) {
      context.push({
        trait: 'agreeableness',
        message: 'Agreeableness typically increases with age as priorities shift toward relationships and cooperation. Your lower scores may reflect competitive career demands or independent values.',
        developmental: true
      });
    }

    return context;
  }

  /**
   * Predict future trajectories
   */
  predictTrajectories(traitScores, age) {
    const predictions = {};

    Object.keys(traitScores).forEach(trait => {
      const trajectory = this.developmentalTrajectories[trait];
      if (!trajectory) return;

      const currentScore = traitScores[trait];
      const changePerDecade = trajectory.changePerDecade;

      // Predict 10 years ahead
      const predictedIn10Years = Math.round(currentScore + changePerDecade);

      // Predict 20 years ahead
      const predictedIn20Years = Math.round(currentScore + (changePerDecade * 2));

      predictions[trait] = {
        current: currentScore,
        in10Years: Math.max(0, Math.min(100, predictedIn10Years)),
        in20Years: Math.max(0, Math.min(100, predictedIn20Years)),
        trajectory: trajectory.pattern,
        confidence: age < 30 ? 'moderate' : 'high' // More stable after 30
      };
    });

    return predictions;
  }

  /**
   * Generate age-specific insights
   */
  generateAgeInsights(ageRelativeScores, maturationStatus, age) {
    const insights = [];

    // Find most divergent traits
    const sortedByDeviation = Object.entries(ageRelativeScores)
      .sort((a, b) => Math.abs(b[1].zScore) - Math.abs(a[1].zScore));

    const mostDivergent = sortedByDeviation[0];
    if (mostDivergent && Math.abs(mostDivergent[1].zScore) >= 0.8) {
      const trait = mostDivergent[0];
      const data = mostDivergent[1];

      insights.push({
        type: 'age_standout',
        trait,
        title: `${trait.charAt(0).toUpperCase() + trait.slice(1)}: Most Distinctive for Age ${age}`,
        description: `Your ${trait} (${data.score}) is at the ${data.percentileInAgeCohort}${this.getOrdinalSuffix(data.percentileInAgeCohort)} percentile for your age cohort. ${data.interpretation.description}.`,
        implication: data.interpretation.implication,
        percentile: data.percentileInAgeCohort
      });
    }

    // Early maturation pattern
    const acceleratedCount = Object.values(maturationStatus).filter(m => m.status === 'accelerated').length;
    if (acceleratedCount >= 2) {
      insights.push({
        type: 'early_maturation',
        title: 'Early Maturation Pattern',
        description: `${acceleratedCount} traits show accelerated development for age ${age}. This pattern often emerges from early life responsibilities, reflective temperament, or intensive life experiences.`,
        traits: Object.keys(maturationStatus).filter(t => maturationStatus[t].status === 'accelerated')
      });
    }

    // Age-protective factors
    if (age >= 18 && age <= 30 && ageRelativeScores.neuroticism?.zScore < -0.8) {
      insights.push({
        type: 'protective_factor',
        title: 'Emotional Stability Advantage',
        description: `Your emotional stability is unusually high for age ${age}. This is a protective factor for mental health and predicts better stress resilience during life transitions.`,
        protective: true
      });
    }

    return insights;
  }

  /**
   * Generate age-specific recommendations
   */
  generateAgeRecommendations(maturationStatus, age) {
    const recommendations = [];

    // Age-specific recommendations
    if (age >= 18 && age <= 25) {
      recommendations.push({
        category: 'developmental',
        title: 'Identity Formation Phase',
        recommendation: 'Your personality is still actively developing. Use this period for exploration - trying different roles, relationships, and environments helps crystallize your authentic self.',
        priority: 'high'
      });
    }

    if (age >= 26 && age <= 35) {
      recommendations.push({
        category: 'developmental',
        title: 'Consolidation Phase',
        recommendation: 'This decade typically brings increased conscientiousness and decreased neuroticism. Leverage this natural trajectory by committing to long-term goals and building stable routines.',
        priority: 'high'
      });
    }

    if (age >= 36 && age <= 50) {
      recommendations.push({
        category: 'developmental',
        title: 'Peak Performance Phase',
        recommendation: 'Research shows this age range combines peak conscientiousness, agreeableness, and emotional stability. Capitalize on this "sweet spot" for leadership, mentorship, and complex projects.',
        priority: 'high'
      });
    }

    if (age >= 51) {
      recommendations.push({
        category: 'developmental',
        title: 'Wisdom Maximization',
        recommendation: 'Your personality profile likely includes high agreeableness, conscientiousness, and emotional stability - ideal for mentorship, advisory roles, and knowledge transfer.',
        priority: 'high'
      });

      // Check openness
      const opennessStatus = maturationStatus.openness;
      if (opennessStatus && opennessStatus.status === 'delayed') {
        recommendations.push({
          category: 'cognitive',
          title: 'Maintain Cognitive Flexibility',
          recommendation: 'Openness tends to decline with age. Actively seek novel experiences, learn new skills, and engage with diverse perspectives to maintain cognitive flexibility.',
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }
}

module.exports = AgeNormativeAnalyzer;
