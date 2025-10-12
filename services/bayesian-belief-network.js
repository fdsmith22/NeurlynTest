/**
 * Bayesian Belief Network for Cross-Trait Prediction
 *
 * Core intelligence engine that updates ALL trait estimates after EVERY answer
 * using conditional probability relationships between traits.
 *
 * Based on research:
 * - Kotov et al. (2010): Personality-psychopathology links
 * - Klein et al. (2011): Extraversion-depression relationship
 * - Malouff et al. (2005): Big Five and clinical symptoms
 * - Samuel & Widiger (2008): Five-factor model and personality disorders
 *
 * Key Innovation: One answer updates multiple traits simultaneously through
 * probabilistic inference.
 */

class BayesianBeliefNetwork {
  constructor() {
    // Track beliefs (probability distributions) for all traits
    this.beliefs = this.initializeBeliefs();

    // Conditional probability tables (CPT)
    // These encode known relationships between traits
    this.cpt = this.buildConditionalProbabilityTables();

    // Evidence weights (how much to trust direct vs. inferred evidence)
    this.evidenceWeights = {
      direct: 1.0,       // Direct question about trait
      strong: 0.75,      // Strong correlation (r > 0.60)
      moderate: 0.50,    // Moderate correlation (r = 0.40-0.60)
      weak: 0.25         // Weak correlation (r = 0.20-0.40)
    };
  }

  /**
   * Initialize belief states for all traits
   */
  initializeBeliefs() {
    return {
      // Big Five Personality
      openness: { mean: 50, confidence: 0, sampleSize: 0 },
      conscientiousness: { mean: 50, confidence: 0, sampleSize: 0 },
      extraversion: { mean: 50, confidence: 0, sampleSize: 0 },
      agreeableness: { mean: 50, confidence: 0, sampleSize: 0 },
      neuroticism: { mean: 50, confidence: 0, sampleSize: 0 },

      // Clinical Dimensions
      depression: { mean: 50, confidence: 0, sampleSize: 0 },
      anxiety: { mean: 50, confidence: 0, sampleSize: 0 },
      mania: { mean: 50, confidence: 0, sampleSize: 0 },
      psychosis: { mean: 50, confidence: 0, sampleSize: 0 },
      borderline: { mean: 50, confidence: 0, sampleSize: 0 },
      somatic: { mean: 50, confidence: 0, sampleSize: 0 },

      // Neurodiversity
      adhd_inattention: { mean: 50, confidence: 0, sampleSize: 0 },
      adhd_hyperactivity: { mean: 50, confidence: 0, sampleSize: 0 },
      autism: { mean: 50, confidence: 0, sampleSize: 0 },

      // Interpersonal
      attachment_anxiety: { mean: 50, confidence: 0, sampleSize: 0 },
      attachment_avoidance: { mean: 50, confidence: 0, sampleSize: 0 },

      // Wellbeing
      resilience: { mean: 50, confidence: 0, sampleSize: 0 },
      life_satisfaction: { mean: 50, confidence: 0, sampleSize: 0 }
    };
  }

  /**
   * Build conditional probability tables
   * These define how traits influence each other
   */
  buildConditionalProbabilityTables() {
    return {
      // DEPRESSION influenced by personality
      depression: {
        predictors: [
          {
            trait: 'neuroticism',
            weight: 0.70,  // r ≈ 0.60-0.70 from research
            direction: 'positive', // High neuroticism → high depression
            description: 'High neuroticism strongly predicts depression'
          },
          {
            trait: 'extraversion',
            weight: 0.50,  // r ≈ -0.40 to -0.50
            direction: 'negative', // Low extraversion → high depression
            description: 'Low extraversion (social withdrawal) predicts depression'
          },
          {
            trait: 'conscientiousness',
            weight: 0.30,  // r ≈ -0.25 to -0.35
            direction: 'negative',
            description: 'Low conscientiousness associated with depression'
          },
          {
            trait: 'anxiety',
            weight: 0.60,  // r ≈ 0.50-0.60 (comorbidity)
            direction: 'positive',
            description: 'High anxiety often co-occurs with depression'
          },
          {
            trait: 'resilience',
            weight: 0.55,
            direction: 'negative',
            description: 'Low resilience increases depression risk'
          }
        ]
      },

      // ANXIETY influenced by personality
      anxiety: {
        predictors: [
          {
            trait: 'neuroticism',
            weight: 0.75,  // r ≈ 0.65-0.75
            direction: 'positive',
            description: 'Neuroticism is strongest predictor of anxiety'
          },
          {
            trait: 'conscientiousness',
            weight: 0.35,
            direction: 'both', // Can go either way (worry can drive organization OR disorganization)
            description: 'Complex relationship with anxiety'
          },
          {
            trait: 'depression',
            weight: 0.60,
            direction: 'positive',
            description: 'Depression-anxiety comorbidity'
          }
        ]
      },

      // MANIA influenced by personality
      mania: {
        predictors: [
          {
            trait: 'extraversion',
            weight: 0.50,
            direction: 'positive',
            description: 'High extraversion shares features with hypomania'
          },
          {
            trait: 'openness',
            weight: 0.40,
            direction: 'positive',
            description: 'High openness associated with mood lability'
          },
          {
            trait: 'neuroticism',
            weight: 0.45,
            direction: 'positive',
            description: 'Emotional instability aspect of neuroticism'
          },
          {
            trait: 'conscientiousness',
            weight: 0.35,
            direction: 'negative',
            description: 'Low conscientiousness in manic episodes'
          }
        ]
      },

      // ADHD (Inattention) influenced by personality
      adhd_inattention: {
        predictors: [
          {
            trait: 'conscientiousness',
            weight: 0.60,
            direction: 'negative',
            description: 'Low conscientiousness overlaps with ADHD symptoms'
          },
          {
            trait: 'neuroticism',
            weight: 0.40,
            direction: 'positive',
            description: 'Anxiety can mimic or worsen inattention'
          },
          {
            trait: 'openness',
            weight: 0.30,
            direction: 'positive',
            description: 'High openness can lead to distractibility'
          }
        ]
      },

      // ADHD (Hyperactivity) influenced by personality
      adhd_hyperactivity: {
        predictors: [
          {
            trait: 'extraversion',
            weight: 0.55,
            direction: 'positive',
            description: 'High energy and activity overlap'
          },
          {
            trait: 'conscientiousness',
            weight: 0.45,
            direction: 'negative',
            description: 'Impulsivity aspect'
          }
        ]
      },

      // AUTISM influenced by personality
      autism: {
        predictors: [
          {
            trait: 'extraversion',
            weight: 0.60,
            direction: 'negative',
            description: 'Social introversion common in autism'
          },
          {
            trait: 'agreeableness',
            weight: 0.45,
            direction: 'negative',
            description: 'Difficulties in social reciprocity'
          },
          {
            trait: 'openness',
            weight: 0.30,
            direction: 'both',
            description: 'Can be high (narrow interests) or low (routine preference)'
          }
        ]
      },

      // BORDERLINE PERSONALITY
      borderline: {
        predictors: [
          {
            trait: 'neuroticism',
            weight: 0.70,
            direction: 'positive',
            description: 'Emotional instability is core feature'
          },
          {
            trait: 'agreeableness',
            weight: 0.50,
            direction: 'negative',
            description: 'Interpersonal difficulties'
          },
          {
            trait: 'conscientiousness',
            weight: 0.40,
            direction: 'negative',
            description: 'Impulsivity and self-regulation issues'
          },
          {
            trait: 'attachment_anxiety',
            weight: 0.65,
            direction: 'positive',
            description: 'Fear of abandonment'
          }
        ]
      },

      // RESILIENCE influenced by personality
      resilience: {
        predictors: [
          {
            trait: 'neuroticism',
            weight: 0.60,
            direction: 'negative',
            description: 'Low neuroticism increases resilience'
          },
          {
            trait: 'conscientiousness',
            weight: 0.50,
            direction: 'positive',
            description: 'Self-discipline aids resilience'
          },
          {
            trait: 'extraversion',
            weight: 0.45,
            direction: 'positive',
            description: 'Social support seeking'
          },
          {
            trait: 'depression',
            weight: 0.55,
            direction: 'negative',
            description: 'Depression depletes resilience'
          }
        ]
      }
    };
  }

  /**
   * Update beliefs after receiving new evidence (a response)
   *
   * @param {Object} response - Response with questionId, value, trait, etc.
   * @param {Array} allResponses - All responses so far
   * @returns {Object} Updated beliefs for all traits
   */
  updateBeliefs(response, allResponses = []) {
    const updatedBeliefs = { ...this.beliefs };

    // 1. DIRECT UPDATE: Update the trait directly measured by this question
    const directTrait = this.mapQuestionToTrait(response);
    if (directTrait && updatedBeliefs[directTrait]) {
      updatedBeliefs[directTrait] = this.updateBelief(
        updatedBeliefs[directTrait],
        response.value || response.response,
        this.evidenceWeights.direct,
        response.reverseScored
      );
    }

    // 2. CROSS-PREDICTION: Update related traits through Bayesian inference
    const crossUpdates = this.propagateEvidence(response, updatedBeliefs, allResponses);
    for (const [trait, update] of Object.entries(crossUpdates)) {
      updatedBeliefs[trait] = update;
    }

    // Store updated beliefs
    this.beliefs = updatedBeliefs;

    // 3. CALCULATE CONFIDENCE for each belief
    for (const trait of Object.keys(this.beliefs)) {
      this.beliefs[trait].confidence = this.calculateConfidence(this.beliefs[trait]);
    }

    return this.beliefs;
  }

  /**
   * Update single belief with new evidence
   */
  updateBelief(currentBelief, newEvidence, weight, reverseScored = false) {
    // Convert response (1-5 scale) to 0-100 scale
    let evidenceValue = ((newEvidence - 1) / 4) * 100;
    if (reverseScored) {
      evidenceValue = 100 - evidenceValue;
    }

    // Bayesian update: weighted average with current belief
    const n = currentBelief.sampleSize;
    const oldWeight = n / (n + weight);
    const newWeight = weight / (n + weight);

    const updatedMean = currentBelief.mean * oldWeight + evidenceValue * newWeight;
    const updatedSampleSize = n + weight;

    return {
      mean: updatedMean,
      confidence: this.calculateConfidence({ sampleSize: updatedSampleSize }),
      sampleSize: updatedSampleSize
    };
  }

  /**
   * Propagate evidence to related traits
   */
  propagateEvidence(response, currentBeliefs, allResponses) {
    const updates = {};
    const directTrait = this.mapQuestionToTrait(response);

    if (!directTrait || !this.cpt[directTrait]) {
      // No propagation rules for this trait
      return updates;
    }

    // For each trait that can be influenced by the directly measured trait
    for (const [targetTrait, rules] of Object.entries(this.cpt)) {
      const relevantPredictors = rules.predictors.filter(p => p.trait === directTrait);

      if (relevantPredictors.length > 0) {
        // Calculate influence on target trait
        const directBeliefValue = currentBeliefs[directTrait]?.mean || 50;

        for (const predictor of relevantPredictors) {
          let influence = 0;

          if (predictor.direction === 'positive') {
            // High source → high target
            influence = (directBeliefValue - 50) * predictor.weight;
          } else if (predictor.direction === 'negative') {
            // High source → low target
            influence = -(directBeliefValue - 50) * predictor.weight;
          } else if (predictor.direction === 'both') {
            // Complex relationship, moderate influence
            influence = (directBeliefValue - 50) * predictor.weight * 0.5;
          }

          // Apply influence to target trait
          const currentTarget = currentBeliefs[targetTrait];
          if (currentTarget) {
            const influencedValue = 50 + influence; // Predicted value for target

            updates[targetTrait] = this.updateBelief(
              updates[targetTrait] || currentTarget,
              ((influencedValue / 100) * 4) + 1, // Convert back to 1-5 scale
              this.evidenceWeights.moderate * predictor.weight,
              false
            );
          }
        }
      }
    }

    return updates;
  }

  /**
   * Map question to primary trait
   */
  mapQuestionToTrait(response) {
    // Map from question metadata to belief network trait
    const traitMap = {
      // Personality
      'openness': 'openness',
      'conscientiousness': 'conscientiousness',
      'extraversion': 'extraversion',
      'agreeableness': 'agreeableness',
      'neuroticism': 'neuroticism',

      // Clinical
      'depression': 'depression',
      'anxiety': 'anxiety',
      'mania': 'mania',
      'psychosis': 'psychosis',
      'borderline': 'borderline',
      'somatic': 'somatic',

      // Neurodiversity
      'adhd': 'adhd_inattention', // Default to inattention
      'autism': 'autism',

      // Other mappings
      'resilience': 'resilience',
      'attachment': response.subcategory === 'anxious' ? 'attachment_anxiety' : 'attachment_avoidance'
    };

    // Try multiple fields to find trait
    const trait = response.trait || response.subcategory || response.category;
    return traitMap[trait?.toLowerCase()] || null;
  }

  /**
   * Calculate confidence in belief
   * Based on sample size (more evidence = higher confidence)
   */
  calculateConfidence(belief) {
    const n = belief.sampleSize;

    // Confidence approaches 1.0 as sample size increases
    // Using logarithmic scale: 10 samples = ~0.70, 20 samples = ~0.85, 30+ = ~0.95
    return Math.min(0.95, 1 - Math.exp(-n / 10));
  }

  /**
   * Get cross-prediction for a target trait based on current beliefs
   *
   * @param {String} targetTrait - Trait to predict
   * @returns {Object} Prediction with confidence
   */
  getCrossPrediction(targetTrait) {
    if (!this.cpt[targetTrait]) {
      return {
        predicted: this.beliefs[targetTrait]?.mean || 50,
        confidence: 0,
        method: 'baseline'
      };
    }

    const rules = this.cpt[targetTrait];
    let predictedValue = 50; // Start at baseline
    let totalWeight = 0;

    // Aggregate predictions from all predictors
    for (const predictor of rules.predictors) {
      const sourceBelief = this.beliefs[predictor.trait];
      if (!sourceBelief || sourceBelief.confidence < 0.20) {
        // Not enough confidence in predictor, skip
        continue;
      }

      const sourceValue = sourceBelief.mean;
      let contribution = 0;

      if (predictor.direction === 'positive') {
        contribution = (sourceValue - 50) * predictor.weight;
      } else if (predictor.direction === 'negative') {
        contribution = -(sourceValue - 50) * predictor.weight;
      }

      predictedValue += contribution * sourceBelief.confidence;
      totalWeight += predictor.weight * sourceBelief.confidence;
    }

    // Normalize if we have weights
    if (totalWeight > 0) {
      // Blend prediction with baseline (50)
      const blendFactor = Math.min(1.0, totalWeight);
      predictedValue = 50 + (predictedValue - 50) * blendFactor;
    }

    // Confidence in prediction based on total weight and source confidences
    const predictionConfidence = Math.min(0.85, totalWeight / rules.predictors.length);

    return {
      predicted: Math.max(0, Math.min(100, predictedValue)),
      confidence: predictionConfidence,
      method: 'cross-prediction',
      contributors: rules.predictors.map(p => ({
        trait: p.trait,
        weight: p.weight,
        confidence: this.beliefs[p.trait]?.confidence || 0
      }))
    };
  }

  /**
   * Get comprehensive state of all beliefs
   */
  getAllBeliefs() {
    const beliefs = {};

    for (const [trait, belief] of Object.entries(this.beliefs)) {
      beliefs[trait] = {
        current: Math.round(belief.mean),
        confidence: belief.confidence,
        sampleSize: belief.sampleSize,
        crossPrediction: this.getCrossPrediction(trait)
      };
    }

    return beliefs;
  }

  /**
   * Detect significant discrepancies between direct and cross-predicted values
   * This can indicate validity issues or complex personality patterns
   */
  detectDiscrepancies() {
    const discrepancies = [];

    for (const [trait, belief] of Object.entries(this.beliefs)) {
      if (belief.sampleSize < 3) continue; // Need some direct evidence

      const crossPrediction = this.getCrossPrediction(trait);
      if (crossPrediction.confidence < 0.30) continue; // Need confident prediction

      const difference = Math.abs(belief.mean - crossPrediction.predicted);

      if (difference > 25 && belief.confidence > 0.50 && crossPrediction.confidence > 0.50) {
        // Significant discrepancy
        discrepancies.push({
          trait,
          directValue: Math.round(belief.mean),
          predictedValue: Math.round(crossPrediction.predicted),
          difference: Math.round(difference),
          interpretation: this.interpretDiscrepancy(trait, belief.mean, crossPrediction.predicted)
        });
      }
    }

    return discrepancies;
  }

  /**
   * Interpret what a discrepancy might mean
   */
  interpretDiscrepancy(trait, directValue, predictedValue) {
    const higher = directValue > predictedValue;

    const interpretations = {
      depression: higher ?
        'Reports more depression than personality suggests - may indicate acute episode or help-seeking bias' :
        'Reports less depression than personality suggests - possible denial or effective coping',

      anxiety: higher ?
        'Anxiety symptoms exceed personality prediction - possible situational stressors' :
        'Lower anxiety than expected - strong coping mechanisms',

      adhd_inattention: higher ?
        'ADHD symptoms higher than personality alone suggests - may indicate genuine ADHD' :
        'Lower ADHD symptoms than personality suggests - compensatory strategies working',

      resilience: higher ?
        'Resilience exceeds personality prediction - strong protective factors' :
        'Lower resilience than expected - recent stressors or burnout'
    };

    return interpretations[trait] || 'Discrepancy between direct and predicted values warrants attention';
  }

  /**
   * Reset network for new assessment
   */
  reset() {
    this.beliefs = this.initializeBeliefs();
  }
}

module.exports = BayesianBeliefNetwork;
