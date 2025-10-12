/**
 * Stage 3: Precision Refinement (15-20 questions)
 * Goal: Only for dimensions with <85% confidence, divergent patterns, clinical validation
 * Target: 85% confidence
 *
 * This stage is CONDITIONAL - only asks questions if needed:
 * - Low confidence dimensions (<85%)
 * - Divergent facets (facet score >20 points different from trait average)
 * - Clinical validation patterns
 */

const DimensionMapper = require('../dimension-mapper');

class Stage3PrecisionRefinement {
  constructor() {
    this.targetQuestions = 17; // 15-20 range
    this.minQuestions = 15;
    this.maxQuestions = 20;
  }

  /**
   * Select Stage 3 questions - only if needed
   *
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Object} confidenceTracker - ConfidenceTracker instance
   * @param {Array} allResponses - All responses so far
   * @param {Array} alreadyAsked - Questions already presented
   * @returns {Array} Selected questions (may be empty if all confident)
   */
  async selectQuestions(QuestionBank, confidenceTracker, allResponses, alreadyAsked = []) {
    const selected = [];
    const askedIds = new Set(alreadyAsked.map(q => q.questionId || q));
    let budget = this.targetQuestions;

    // 1. Identify dimensions with <85% confidence
    const lowConfidence = confidenceTracker.getPriorityDimensions(3);

    // 2. Detect divergent facets (facet score >20 points different from trait average)
    const divergentFacets = this.detectDivergentFacets(confidenceTracker, allResponses);

    // 3. Clinical validation needs
    const clinicalValidation = this.getClinicalValidationNeeds(allResponses);

    // CRITICAL FIX: Don't return empty - this causes assessment to stop prematurely
    // Instead, if nothing needs refinement, return minimal filler questions
    // to ensure we advance to Stage 4 (which fills to exactly 70)
    const currentTotal = alreadyAsked.length;
    const stage4Threshold = 60; // Stage 4 starts at 60 questions (from multi-stage-coordinator)

    if (lowConfidence.length === 0 && divergentFacets.length === 0 && clinicalValidation.length === 0) {
      // No refinement needed, but we need to reach Stage 4 threshold
      if (currentTotal < stage4Threshold) {
        const needed = stage4Threshold - currentTotal;
        console.log(`[Stage 3] No refinement needed, adding ${needed} filler questions to reach Stage 4 threshold (${stage4Threshold})`);

        // Add high-quality filler questions to bridge to Stage 4
        const fillerQuestions = await QuestionBank.find({
          active: true,
          questionId: { $nin: Array.from(askedIds) }
        })
          .sort({ discriminationIndex: -1 })
          .limit(needed);

        return fillerQuestions;
      }

      // Already past Stage 4 threshold, Stage 3 can be skipped
      return [];
    }

    // Allocate budget
    const facetBudget = Math.floor(budget * 0.4);      // 40% for low-confidence dimensions
    const divergentBudget = Math.floor(budget * 0.3);  // 30% for divergent facets
    const clinicalBudget = budget - facetBudget - divergentBudget; // 30% for clinical validation

    // Add precision questions for low-confidence dimensions
    let facetCount = 0;
    for (const dim of lowConfidence.slice(0, 5)) {
      if (facetCount >= facetBudget) break;

      const questionsNeeded = Math.min(2, facetBudget - facetCount);
      const precisionQuestions = await this.selectPrecisionQuestions(
        QuestionBank,
        dim.dimension,
        questionsNeeded,
        askedIds
      );

      selected.push(...precisionQuestions);
      facetCount += precisionQuestions.length;
      precisionQuestions.forEach(q => askedIds.add(q.questionId));
    }

    // Add questions for divergent facets
    let divergentCount = 0;
    for (const facet of divergentFacets.slice(0, 3)) {
      if (divergentCount >= divergentBudget) break;

      const facetQuestions = await QuestionBank.find({
        category: 'personality',
        trait: facet.trait,
        facet: facet.facet,
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      })
      .sort({ discriminationIndex: -1 })
      .limit(2);

      selected.push(...facetQuestions);
      divergentCount += facetQuestions.length;
      facetQuestions.forEach(q => askedIds.add(q.questionId));
    }

    // Add clinical validation questions
    let clinicalCount = 0;
    for (const validation of clinicalValidation) {
      if (clinicalCount >= clinicalBudget) break;

      const validationQuestions = await QuestionBank.find({
        instrument: validation.instrument,
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(3);

      selected.push(...validationQuestions);
      clinicalCount += validationQuestions.length;
      validationQuestions.forEach(q => askedIds.add(q.questionId));
    }

    // CRITICAL FIX: Ensure we never return empty if not at Stage 4 threshold
    // Even if specific refinement queries found nothing, we need to continue
    if (selected.length === 0 && currentTotal < stage4Threshold) {
      const needed = Math.min(stage4Threshold - currentTotal, this.maxQuestions);
      console.log(`[Stage 3] No specific refinement questions found, adding ${needed} filler questions to reach Stage 4`);

      const fillerQuestions = await QuestionBank.find({
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      })
        .sort({ discriminationIndex: -1 })
        .limit(needed);

      selected.push(...fillerQuestions);
    }

    // Add validity questions (2 questions: 1 inconsistency pair)
    const validityQuestions = await this.selectValidityQuestions(QuestionBank, askedIds);
    selected.push(...validityQuestions);

    // Shuffle to avoid pattern fatigue
    const shuffled = this.shuffleArray(selected);

    return shuffled.slice(0, this.maxQuestions);
  }

  /**
   * Detect facets that diverge significantly from their trait average
   * Divergent = facet score >20 points different from trait score
   */
  detectDivergentFacets(tracker, responses) {
    const divergent = [];

    // For each Big Five trait
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    for (const trait of traits) {
      const traitData = tracker.dimensions.get(trait);
      if (!traitData) continue;

      const traitScore = traitData.score;

      // Check each facet for this trait
      const facetMap = {
        openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
        conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
        extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
        agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
        neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability']
      };

      for (const facet of facetMap[trait]) {
        const facetKey = `${trait}_${facet}`;
        const facetData = tracker.dimensions.get(facetKey);

        if (facetData && Math.abs(facetData.score - traitScore) > 20) {
          divergent.push({
            trait,
            facet,
            traitScore: Math.round(traitScore),
            facetScore: Math.round(facetData.score),
            difference: Math.round(facetData.score - traitScore),
            direction: facetData.score > traitScore ? 'higher' : 'lower'
          });
        }
      }
    }

    // Sort by absolute difference (most divergent first)
    return divergent.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  }

  /**
   * Identify clinical scales needing validation
   * Example: Elevated depression but low anxiety (validate both)
   */
  getClinicalValidationNeeds(responses) {
    const validation = [];

    // Calculate average scores for clinical dimensions
    const depressionScore = this.getAverageScore(responses, 'depression');
    const anxietyScore = this.getAverageScore(responses, 'anxiety');
    const maniaScore = this.getAverageScore(responses, 'mania');

    // Pattern: Elevated depression without anxiety (uncommon - validate both)
    if (depressionScore > 60 && anxietyScore < 40) {
      validation.push({
        instrument: 'PHQ-9',
        reason: 'Elevated depression without anxiety - validate depression',
        priority: 'high'
      });
      validation.push({
        instrument: 'GAD-7',
        reason: 'Elevated depression without anxiety - validate anxiety',
        priority: 'medium'
      });
    }

    // Pattern: Elevated mania (always validate further)
    if (maniaScore > 50) {
      validation.push({
        instrument: 'MDQ',
        reason: 'Elevated mania screening - validate thoroughly',
        priority: 'high'
      });
    }

    return validation;
  }

  /**
   * Select precision questions for a dimension
   * Prioritizes highest discrimination index
   */
  async selectPrecisionQuestions(QuestionBank, dimension, count, askedIds) {
    // Determine query based on dimension type
    let query = { active: true, questionId: { $nin: Array.from(askedIds) } };

    if (DimensionMapper.isBigFiveTrait(dimension)) {
      query.trait = dimension;
      query.category = 'personality';
    } else if (DimensionMapper.isClinicalScale(dimension)) {
      query.category = 'clinical_psychopathology';
      query.tags = dimension;
    } else if (DimensionMapper.isNeurodiversityDimension(dimension)) {
      query.category = 'neurodiversity';
      query.tags = dimension;
    }

    // Select questions with highest discrimination index
    const questions = await QuestionBank.find(query)
      .sort({ discriminationIndex: -1 })
      .limit(count);

    return questions;
  }

  /**
   * Get average score for a specific dimension tag
   */
  getAverageScore(responses, tag) {
    const relevant = responses.filter(r =>
      r.tags?.includes(tag) || r.instrument?.toLowerCase().includes(tag)
    );

    if (relevant.length === 0) return 0;

    const sum = relevant.reduce((total, r) => total + (r.score || 0), 0);
    return sum / relevant.length;
  }

  /**
   * Select validity questions for Stage 3
   * Stage 3: 2 validity questions (1 inconsistency pair)
   */
  async selectValidityQuestions(QuestionBank, askedIds) {
    const validityQuestions = [];

    // Select one inconsistency pair (questions with pattern VALIDITY_INCONS_XA and VALIDITY_INCONS_XB)
    const allInconsistency = await QuestionBank.find({
      category: 'validity_scales',
      subcategory: 'inconsistency',
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    });

    // Group by pair number (extract number from VALIDITY_INCONS_1A -> "1")
    const pairMap = {};
    allInconsistency.forEach(q => {
      const match = q.questionId.match(/VALIDITY_INCONS_(\d+)[AB]/);
      if (match) {
        const pairNum = match[1];
        if (!pairMap[pairNum]) pairMap[pairNum] = [];
        pairMap[pairNum].push(q);
      }
    });

    // Find first complete pair (has both A and B)
    for (const [pairNum, questions] of Object.entries(pairMap)) {
      if (questions.length === 2) {
        validityQuestions.push(...questions);
        questions.forEach(q => askedIds.add(q.questionId));
        break;
      }
    }

    return validityQuestions;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get stage metadata
   */
  getStageInfo() {
    return {
      stage: 3,
      name: 'Precision Refinement',
      description: 'Refine low-confidence dimensions and validate divergent patterns',
      targetQuestions: this.targetQuestions,
      targetConfidence: 85,
      minQuestionsPerDimension: 3,
      conditional: true // This stage may be skipped if all dimensions confident
    };
  }
}

module.exports = Stage3PrecisionRefinement;
