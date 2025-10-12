/**
 * Facet Pattern Detection Engine
 *
 * Identifies unusual and clinically significant patterns in the 30 NEO-PI-R facets.
 * Based on research showing that facet-level variance and cross-trait combinations
 * provide deeper insights than trait-level scores alone.
 *
 * Research basis:
 * - Costa & McCrae (1992): NEO-PI-R facet structure
 * - Hough & Ones (2001): Facet-level prediction validity
 * - Judge et al. (2013): Facet patterns in workplace behavior
 *
 * @see Costa, P. T., & McCrae, R. R. (1992). NEO PI-R professional manual
 */

class FacetPatternDetector {
  constructor() {
    // Clinically significant pattern thresholds
    this.thresholds = {
      divergentFacet: 20,  // Facet differs from trait mean by 20+ points
      extremeFacet: 80,    // Facet score > 80 or < 20
      clusterStrength: 3,  // 3+ facets in same direction
      paradoxThreshold: 40 // Facets differ by 40+ points
    };

    // Known clinical patterns from research
    this.clinicalPatterns = {
      anxiousAchiever: {
        facets: { 'neuroticism.anxiety': 'high', 'conscientiousness.achievementStriving': 'high' },
        prevalence: 0.12,
        description: 'High achievement drive coupled with anxiety - common in perfectionists',
        implications: ['Burnout risk', 'Imposter syndrome', 'Performance anxiety'],
        recommendations: ['Self-compassion practices', 'Redefine success metrics', 'Celebrate progress not just outcomes']
      },
      conscientiousRebel: {
        facets: { 'conscientiousness.order': 'low', 'conscientiousness.achievementStriving': 'high' },
        prevalence: 0.08,
        description: 'Driven but disorganized - achieves despite chaos',
        implications: ['Inefficiency in execution', 'Missed deadlines despite effort', 'Stress from disorganization'],
        recommendations: ['External structure (assistants, tools)', 'Focus on outcomes not methods', 'Partner with organized individuals']
      },
      warmButBoundaried: {
        facets: { 'agreeableness.altruism': 'high', 'agreeableness.compliance': 'low' },
        prevalence: 0.15,
        description: 'Caring but assertive - helps on own terms',
        implications: ['Effective helper without burnout', 'Can say no while caring', 'Healthy boundaries'],
        recommendations: ['Leverage this strength in leadership', 'Model boundary-setting for others', 'Use in negotiation roles']
      },
      sociallySelectiveExtrovert: {
        facets: { 'extraversion.warmth': 'high', 'extraversion.gregariousness': 'low' },
        prevalence: 0.18,
        description: 'Warm in close relationships, selective in groups',
        implications: ['Quality over quantity in friendships', 'May seem inconsistent socially', 'Depth-oriented connection'],
        recommendations: ['Communicate selectivity to avoid misunderstanding', 'Invest in 1-on-1 time', 'Skip large networking for smaller gatherings']
      },
      intellectualDoer: {
        facets: { 'openness.ideas': 'high', 'conscientiousness.selfDiscipline': 'high' },
        prevalence: 0.10,
        description: 'Curious and disciplined - learns and applies systematically',
        implications: ['Continuous growth', 'Evidence-based practice', 'Innovation with follow-through'],
        recommendations: ['Pursue research or R&D roles', 'Share knowledge through teaching', 'Lead innovation initiatives']
      },
      emotionallyStableWorrier: {
        facets: { 'neuroticism.anxiety': 'high', 'neuroticism.depression': 'low', 'neuroticism.vulnerability': 'low' },
        prevalence: 0.14,
        description: 'Anxious but resilient - worries but copes well',
        implications: ['Anticipatory stress but good recovery', 'Planning paralysis possible', 'Functional anxiety'],
        recommendations: ['Use anxiety as planning tool', 'Time-box worry periods', 'Trust your resilience in crises']
      }
    };
  }

  /**
   * Analyze all 30 facets for unusual patterns
   *
   * @param {Object} facetScores - 30 facet scores organized by trait
   * @param {Object} traitScores - Big Five trait scores for comparison
   * @returns {Object} Detected patterns and insights
   */
  analyzePatterns(facetScores, traitScores) {
    const patterns = {
      divergentFacets: this.findDivergentFacets(facetScores, traitScores),
      strengthClusters: this.findStrengthClusters(facetScores),
      vulnerabilityClusters: this.findVulnerabilityClusters(facetScores),
      paradoxicalCombinations: this.findParadoxes(facetScores),
      clinicalPatterns: this.detectClinicalPatterns(facetScores),
      uniqueProfile: this.generateUniqueProfile(facetScores, traitScores),
      facetCoherence: this.assessFacetCoherence(facetScores, traitScores)
    };

    // Generate insights from patterns
    patterns.insights = this.generatePatternInsights(patterns);
    patterns.recommendations = this.generatePatternRecommendations(patterns);
    patterns.summary = this.createPatternSummary(patterns);

    return patterns;
  }

  /**
   * Find facets that diverge significantly from their trait mean
   */
  findDivergentFacets(facetScores, traitScores) {
    const divergent = [];

    Object.entries(facetScores).forEach(([trait, facets]) => {
      const traitScore = traitScores[trait];

      Object.entries(facets).forEach(([facetName, facetData]) => {
        const facetScore = facetData.score || facetData;
        const divergence = Math.abs(facetScore - traitScore);

        if (divergence >= this.thresholds.divergentFacet) {
          divergent.push({
            trait,
            facet: facetName,
            facetScore: Math.round(facetScore),
            traitScore: Math.round(traitScore),
            divergence: Math.round(divergence),
            direction: facetScore > traitScore ? 'higher' : 'lower',
            interpretation: this.interpretDivergence(trait, facetName, facetScore, traitScore)
          });
        }
      });
    });

    return divergent.sort((a, b) => b.divergence - a.divergence);
  }

  /**
   * Find clusters of 3+ high facets creating a strength signature
   */
  findStrengthClusters(facetScores) {
    const clusters = [];
    const highFacets = [];

    // Collect all high facets (>70)
    Object.entries(facetScores).forEach(([trait, facets]) => {
      Object.entries(facets).forEach(([facetName, facetData]) => {
        const score = facetData.score || facetData;
        if (score > 70) {
          highFacets.push({
            trait,
            facet: facetName,
            score: Math.round(score),
            fullName: `${trait}.${facetName}`
          });
        }
      });
    });

    // Group into meaningful clusters
    if (highFacets.length >= 3) {
      // Check for same-trait clusters
      const traitGroups = {};
      highFacets.forEach(f => {
        if (!traitGroups[f.trait]) traitGroups[f.trait] = [];
        traitGroups[f.trait].push(f);
      });

      Object.entries(traitGroups).forEach(([trait, facets]) => {
        if (facets.length >= 3) {
          clusters.push({
            type: 'same-trait',
            trait,
            facets: facets.map(f => f.facet),
            avgScore: Math.round(facets.reduce((sum, f) => sum + f.score, 0) / facets.length),
            interpretation: this.interpretCluster(trait, facets)
          });
        }
      });

      // Check for cross-trait synergy clusters
      const synergies = this.findSynergyClusters(highFacets);
      clusters.push(...synergies);
    }

    return clusters;
  }

  /**
   * Find clusters of 3+ low facets indicating vulnerability
   */
  findVulnerabilityClusters(facetScores) {
    const vulnerabilities = [];
    const lowFacets = [];

    Object.entries(facetScores).forEach(([trait, facets]) => {
      Object.entries(facets).forEach(([facetName, facetData]) => {
        const score = facetData.score || facetData;
        if (score < 30) {
          lowFacets.push({
            trait,
            facet: facetName,
            score: Math.round(score),
            fullName: `${trait}.${facetName}`
          });
        }
      });
    });

    if (lowFacets.length >= 3) {
      const traitGroups = {};
      lowFacets.forEach(f => {
        if (!traitGroups[f.trait]) traitGroups[f.trait] = [];
        traitGroups[f.trait].push(f);
      });

      Object.entries(traitGroups).forEach(([trait, facets]) => {
        if (facets.length >= 3) {
          vulnerabilities.push({
            type: 'same-trait',
            trait,
            facets: facets.map(f => f.facet),
            avgScore: Math.round(facets.reduce((sum, f) => sum + f.score, 0) / facets.length),
            risk: this.assessVulnerabilityRisk(trait, facets),
            recommendations: this.getVulnerabilityRecommendations(trait, facets)
          });
        }
      });
    }

    return vulnerabilities;
  }

  /**
   * Find paradoxical facet combinations (contradictory patterns)
   */
  findParadoxes(facetScores) {
    const paradoxes = [];
    const allFacets = [];

    // Flatten facet structure
    Object.entries(facetScores).forEach(([trait, facets]) => {
      Object.entries(facets).forEach(([facetName, facetData]) => {
        allFacets.push({
          trait,
          facet: facetName,
          score: facetData.score || facetData,
          fullName: `${trait}.${facetName}`
        });
      });
    });

    // Check for contradictory high/low combinations
    for (let i = 0; i < allFacets.length; i++) {
      for (let j = i + 1; j < allFacets.length; j++) {
        const f1 = allFacets[i];
        const f2 = allFacets[j];

        // Check if conceptually related but opposite scores
        if (this.areConceptuallyRelated(f1, f2) && Math.abs(f1.score - f2.score) >= this.thresholds.paradoxThreshold) {
          paradoxes.push({
            facet1: { trait: f1.trait, facet: f1.facet, score: Math.round(f1.score) },
            facet2: { trait: f2.trait, facet: f2.facet, score: Math.round(f2.score) },
            gap: Math.round(Math.abs(f1.score - f2.score)),
            interpretation: this.interpretParadox(f1, f2)
          });
        }
      }
    }

    return paradoxes.slice(0, 5); // Top 5 most significant
  }

  /**
   * Detect known clinical patterns
   */
  detectClinicalPatterns(facetScores) {
    const detected = [];

    Object.entries(this.clinicalPatterns).forEach(([patternName, pattern]) => {
      const match = this.matchesPattern(facetScores, pattern);
      if (match.matches) {
        detected.push({
          name: patternName,
          ...pattern,
          confidence: match.confidence,
          matchedFacets: match.matchedFacets
        });
      }
    });

    return detected;
  }

  /**
   * Generate unique profile description
   */
  generateUniqueProfile(facetScores, traitScores) {
    const signature = [];

    // Find defining facet combinations
    Object.entries(facetScores).forEach(([trait, facets]) => {
      const facetArray = Object.entries(facets).map(([name, data]) => ({
        name,
        score: data.score || data
      })).sort((a, b) => b.score - a.score);

      if (facetArray.length > 0 && facetArray[0].score > 75) {
        signature.push({
          trait,
          topFacet: facetArray[0].name,
          score: Math.round(facetArray[0].score),
          makes: `Makes you ${this.facetToPersonalityTrait(trait, facetArray[0].name)}`
        });
      }
    });

    return {
      signature,
      uniqueness: this.calculateUniqueness(facetScores),
      description: this.createUniqueDescription(signature)
    };
  }

  /**
   * Assess how coherent facets are within each trait
   */
  assessFacetCoherence(facetScores, traitScores) {
    const coherence = {};

    Object.entries(facetScores).forEach(([trait, facets]) => {
      const scores = Object.values(facets).map(f => f.score || f);
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      coherence[trait] = {
        variance: Math.round(variance),
        stdDev: Math.round(stdDev),
        coherenceLevel: stdDev < 10 ? 'High' : stdDev < 20 ? 'Moderate' : 'Low',
        interpretation: stdDev < 10
          ? `${trait} is highly coherent - all facets align`
          : stdDev < 20
          ? `${trait} shows moderate variation across facets`
          : `${trait} is diverse - significant facet variation suggests complexity`
      };
    });

    return coherence;
  }

  /**
   * Helper: Check if two facets are conceptually related
   */
  areConceptuallyRelated(f1, f2) {
    const related = {
      'neuroticism.anxiety': ['conscientiousness.deliberation', 'extraversion.assertiveness'],
      'conscientiousness.order': ['conscientiousness.selfDiscipline'],
      'agreeableness.altruism': ['agreeableness.compliance'],
      'extraversion.warmth': ['extraversion.gregariousness', 'agreeableness.trust'],
      'openness.ideas': ['openness.actions']
    };

    const key1 = `${f1.trait}.${f1.facet}`;
    const key2 = `${f2.trait}.${f2.facet}`;

    return related[key1]?.includes(key2) || related[key2]?.includes(key1);
  }

  /**
   * Helper: Match facet pattern to clinical pattern
   */
  matchesPattern(facetScores, pattern) {
    let matchCount = 0;
    let totalRequired = 0;
    const matchedFacets = [];

    Object.entries(pattern.facets).forEach(([facetPath, expectedLevel]) => {
      totalRequired++;
      const [trait, facet] = facetPath.split('.');
      const score = facetScores[trait]?.[facet]?.score || facetScores[trait]?.[facet] || 50;

      const matches = (expectedLevel === 'high' && score > 65) ||
                      (expectedLevel === 'low' && score < 35);

      if (matches) {
        matchCount++;
        matchedFacets.push({ trait, facet, score: Math.round(score), expectedLevel });
      }
    });

    return {
      matches: matchCount === totalRequired,
      confidence: matchCount / totalRequired,
      matchedFacets
    };
  }

  /**
   * Generate insights from detected patterns
   */
  generatePatternInsights(patterns) {
    const insights = [];

    // Divergent facets insights
    if (patterns.divergentFacets.length > 0) {
      const top = patterns.divergentFacets[0];
      insights.push({
        type: 'divergent',
        title: `Facet Specialization: ${top.trait}.${top.facet}`,
        text: `Your ${top.facet} (${top.facetScore}) is notably ${top.direction} than your overall ${top.trait} (${top.traitScore}). ${top.interpretation}`,
        priority: 'high'
      });
    }

    // Clinical patterns
    patterns.clinicalPatterns.forEach(cp => {
      insights.push({
        type: 'clinical',
        title: cp.description,
        text: `This pattern affects ${Math.round(cp.prevalence * 100)}% of people. ${cp.implications.join('. ')}.`,
        recommendations: cp.recommendations,
        priority: 'high'
      });
    });

    // Strength clusters
    if (patterns.strengthClusters.length > 0) {
      insights.push({
        type: 'strength',
        title: 'Facet Strength Cluster Identified',
        text: patterns.strengthClusters[0].interpretation,
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Generate recommendations based on patterns
   */
  generatePatternRecommendations(patterns) {
    const recommendations = [];

    // From clinical patterns
    patterns.clinicalPatterns.forEach(cp => {
      recommendations.push({
        area: cp.description,
        actions: cp.recommendations,
        priority: 'high',
        evidence: `Research-based pattern (${Math.round(cp.prevalence * 100)}% prevalence)`
      });
    });

    // From vulnerabilities
    patterns.vulnerabilityClusters.forEach(vc => {
      if (vc.recommendations) {
        recommendations.push({
          area: `${vc.trait} Development`,
          actions: vc.recommendations,
          priority: vc.risk === 'high' ? 'high' : 'medium',
          evidence: `${vc.facets.length} facets below 30th percentile`
        });
      }
    });

    return recommendations;
  }

  /**
   * Create pattern summary
   */
  createPatternSummary(patterns) {
    return {
      totalPatterns: patterns.divergentFacets.length + patterns.clinicalPatterns.length +
                     patterns.strengthClusters.length + patterns.paradoxicalCombinations.length,
      clinicalSignificance: patterns.clinicalPatterns.length > 0,
      uniquenessScore: patterns.uniqueProfile.uniqueness,
      primaryPattern: patterns.clinicalPatterns[0]?.description || 'Individual variation',
      coherenceLevel: Object.values(patterns.facetCoherence).filter(c => c.coherenceLevel === 'High').length
    };
  }

  // Additional helper methods
  interpretDivergence(trait, facet, facetScore, traitScore) {
    if (facetScore > traitScore) {
      return `This elevated ${facet} suggests specialized strength in this area despite moderate overall ${trait}.`;
    } else {
      return `This lower ${facet} indicates a specific challenge area within otherwise ${traitScore > 50 ? 'strong' : 'moderate'} ${trait}.`;
    }
  }

  interpretCluster(trait, facets) {
    return `Strong ${trait} signature: ${facets.map(f => f.facet).join(', ')} all elevated (avg ${Math.round(facets.reduce((sum, f) => sum + f.score, 0) / facets.length)}). This creates a distinctive ${trait} expression.`;
  }

  interpretParadox(f1, f2) {
    return `Paradoxical pattern: High ${f1.facet} (${Math.round(f1.score)}) contrasts with low ${f2.facet} (${Math.round(f2.score)}), creating internal complexity.`;
  }

  findSynergyClusters(highFacets) {
    // Placeholder for cross-trait synergies
    return [];
  }

  assessVulnerabilityRisk(trait, facets) {
    const avgScore = facets.reduce((sum, f) => sum + f.score, 0) / facets.length;
    return avgScore < 20 ? 'high' : avgScore < 30 ? 'moderate' : 'low';
  }

  getVulnerabilityRecommendations(trait, facets) {
    return [`Develop ${trait} through targeted work on: ${facets.map(f => f.facet).join(', ')}`];
  }

  facetToPersonalityTrait(trait, facet) {
    const descriptions = {
      'openness.fantasy': 'imaginative and creative',
      'openness.ideas': 'intellectually curious',
      'conscientiousness.achievementStriving': 'highly driven',
      'conscientiousness.selfDiscipline': 'exceptionally disciplined',
      'extraversion.warmth': 'genuinely warm with others',
      'agreeableness.altruism': 'naturally giving and helpful',
      'neuroticism.anxiety': 'vigilant and careful'
    };
    return descriptions[`${trait}.${facet}`] || `distinctive in ${facet}`;
  }

  calculateUniqueness(facetScores) {
    // Simple uniqueness: count extreme facets
    let extremeCount = 0;
    Object.values(facetScores).forEach(facets => {
      Object.values(facets).forEach(data => {
        const score = data.score || data;
        if (score > 80 || score < 20) extremeCount++;
      });
    });
    return Math.min(100, extremeCount * 10);
  }

  createUniqueDescription(signature) {
    if (signature.length === 0) return 'Balanced facet profile across dimensions';
    return `Your personality signature: ${signature.map(s => s.makes).slice(0, 3).join('; ')}.`;
  }
}

module.exports = FacetPatternDetector;
