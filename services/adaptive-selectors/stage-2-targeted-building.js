/**
 * Stage 2: Targeted Building (25-30 questions)
 * Goal: Build out facets for traits, expand positive clinical screens
 * Target: 75% confidence per dimension
 *
 * Question breakdown:
 * - 60% for personality facets (3-4 questions per trait based on Stage 1)
 * - 30% for clinical expansion (complete PHQ-9/GAD-7 if screeners positive)
 * - 10% for neurodiversity expansion (if flags positive in Stage 1)
 */

const ConfidenceTracker = require('../confidence-tracker');
const FacetIntelligence = require('../facet-intelligence');
const { getLogger } = require('../adaptive-logger');

class Stage2TargetedBuilding {
  constructor(options = {}) {
    this.targetQuestions = 27; // 25-30 range
    this.minQuestions = 25;
    this.maxQuestions = 30;
    this.logger = getLogger(options.logger);
  }

  /**
   * Select Stage 2 questions based on Stage 1 results
   *
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Object} confidenceTracker - ConfidenceTracker instance
   * @param {Array} allResponses - All responses so far
   * @param {Array} alreadyAsked - Questions already presented
   * @returns {Array} Selected questions
   */
  async selectQuestions(QuestionBank, confidenceTracker, allResponses, alreadyAsked = []) {
    const selected = [];
    const askedIds = new Set(alreadyAsked.map(q => q.questionId || q));
    let budget = this.targetQuestions;

    this.logger.setStage(2, 'Targeted Building');

    // Analyze Stage 1 results
    const clinicalFlags = this.analyzeClinicalScreeners(allResponses);
    const neurodiversityFlags = this.analyzeNeurodiversityFlags(allResponses);

    this.logger.clinicalScreen(clinicalFlags);
    this.logger.neurodiversityFlags(neurodiversityFlags);

    // Get priority dimensions (traits with <75% confidence)
    const priorities = confidenceTracker.getPriorityDimensions(2);
    this.logger.priorityDimensions(priorities);

    // 1. Add facet questions for personality traits (aim for 3-4 per trait)
    const facetBudget = Math.floor(budget * 0.6); // 60% for personality facets
    let facetCount = 0;

    for (const priority of priorities) {
      if (facetCount >= facetBudget) break;

      // Only select facets for Big Five traits
      const bigFive = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      if (bigFive.includes(priority.dimension)) {
        const questionsNeeded = Math.min(
          4 - priority.questionCount, // Need enough for 75% confidence
          facetBudget - facetCount
        );

        if (questionsNeeded > 0) {
          const facetQuestions = await this.selectFacetQuestions(
            QuestionBank,
            priority.dimension,
            questionsNeeded,
            askedIds,
            allResponses // Pass responses for intelligent selection
          );

          selected.push(...facetQuestions);
          facetCount += facetQuestions.length;
          facetQuestions.forEach(q => askedIds.add(q.questionId));
        }
      }
    }

    // 2. Expand positive clinical screens
    const clinicalBudget = Math.floor(budget * 0.3); // 30% for clinical
    let clinicalCount = 0;

    if (clinicalFlags.depression && clinicalCount < clinicalBudget) {
      // Complete PHQ-9 (9 total - 2 already asked in Stage 1)
      const phq9Remaining = await QuestionBank.find({
        instrument: 'PHQ-9',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(7); // 9 - 2 = 7 remaining

      const toAdd = phq9Remaining.slice(0, Math.min(7, clinicalBudget - clinicalCount));
      selected.push(...toAdd);
      clinicalCount += toAdd.length;
      toAdd.forEach(q => askedIds.add(q.questionId));
    }

    if (clinicalFlags.anxiety && clinicalCount < clinicalBudget) {
      // Complete GAD-7 (7 total - 2 already asked in Stage 1)
      const gad7Remaining = await QuestionBank.find({
        instrument: 'GAD-7',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(5); // 7 - 2 = 5 remaining

      const toAdd = gad7Remaining.slice(0, Math.min(5, clinicalBudget - clinicalCount));
      selected.push(...toAdd);
      clinicalCount += toAdd.length;
      toAdd.forEach(q => askedIds.add(q.questionId));
    }

    // 3. Expand neurodiversity if flagged
    const neuroBudget = budget - facetCount - clinicalCount;

    if (neurodiversityFlags.adhd && selected.length < budget) {
      const adhdQuestions = await QuestionBank.find({
        category: 'neurodiversity',
        tags: 'adhd',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(4);

      const toAdd = adhdQuestions.slice(0, Math.min(4, budget - selected.length));
      selected.push(...toAdd);
      toAdd.forEach(q => askedIds.add(q.questionId));
    }

    if (neurodiversityFlags.autism && selected.length < budget) {
      const autismQuestions = await QuestionBank.find({
        category: 'neurodiversity',
        tags: 'autism',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(4);

      const toAdd = autismQuestions.slice(0, Math.min(4, budget - selected.length));
      selected.push(...toAdd);
      toAdd.forEach(q => askedIds.add(q.questionId));
    }

    if (neurodiversityFlags.sensory && selected.length < budget) {
      const sensoryQuestions = await QuestionBank.find({
        category: 'neurodiversity',
        $or: [
          { tags: 'sensory' },
          { tags: 'sensory_processing' }
        ],
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).limit(3);

      const toAdd = sensoryQuestions.slice(0, Math.min(3, budget - selected.length));
      selected.push(...toAdd);
      toAdd.forEach(q => askedIds.add(q.questionId));
    }

    // 4. Add validity questions (2 questions: 1 inconsistency pair)
    const validityQuestions = await this.selectValidityQuestions(QuestionBank, askedIds);
    selected.push(...validityQuestions);

    // Shuffle to avoid pattern fatigue
    const shuffled = this.shuffleArray(selected);

    return shuffled.slice(0, this.maxQuestions);
  }

  /**
   * Select facet questions for a specific trait
   * Uses intelligent prioritization based on cross-trait correlations and Stage 1 responses
   */
  async selectFacetQuestions(QuestionBank, trait, count, askedIds, allResponses = []) {
    // Build personality profile from responses so far
    const profile = this.buildPersonalityProfile(allResponses);

    // Get intelligently prioritized facets for this trait
    // FIXED: Swapped parameter order to match function signature (profile, trait)
    const prioritizedFacets = FacetIntelligence.calculateFacetPriorities(profile, trait);

    if (prioritizedFacets.length === 0) {
      // Fallback to all facets if intelligence module returns nothing
      const facetMap = {
        openness: ['fantasy', 'aesthetics', 'feelings', 'actions', 'ideas', 'values'],
        conscientiousness: ['competence', 'order', 'dutifulness', 'achievement_striving', 'self_discipline', 'deliberation'],
        extraversion: ['warmth', 'gregariousness', 'assertiveness', 'activity', 'excitement_seeking', 'positive_emotions'],
        agreeableness: ['trust', 'straightforwardness', 'altruism', 'compliance', 'modesty', 'tender_mindedness'],
        neuroticism: ['anxiety', 'angry_hostility', 'depression', 'self_consciousness', 'impulsiveness', 'vulnerability']
      };
      return this.selectFacetsNaive(QuestionBank, trait, count, askedIds, facetMap[trait] || []);
    }

    const questions = [];

    // Select questions from prioritized facets (highest priority first)
    for (const facetInfo of prioritizedFacets) {
      if (questions.length >= count) break;

      const q = await QuestionBank.findOne({
        category: 'personality',
        trait: trait,
        facet: facetInfo.facet,
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).sort({ discriminationIndex: -1 }); // Use highest quality questions

      if (q) {
        questions.push(q);
        askedIds.add(q.questionId);
        this.logger.intelligentFacet(trait, facetInfo.facet, facetInfo.priority);
      }
    }

    return questions;
  }

  /**
   * Fallback: Naive facet selection (old method)
   */
  async selectFacetsNaive(QuestionBank, trait, count, askedIds, facets) {
    const questions = [];

    for (let i = 0; i < count && questions.length < count; i++) {
      const facet = facets[i % facets.length];

      const q = await QuestionBank.findOne({
        category: 'personality',
        trait: trait,
        facet: facet,
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      }).sort({ discriminationIndex: -1 });

      if (q) {
        questions.push(q);
        askedIds.add(q.questionId);
      }
    }

    return questions;
  }

  /**
   * Build personality profile from responses for FacetIntelligence
   */
  buildPersonalityProfile(responses) {
    const bigFive = {
      openness: 3,
      conscientiousness: 3,
      extraversion: 3,
      agreeableness: 3,
      neuroticism: 3
    };

    // Group by trait and calculate averages
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    traits.forEach(trait => {
      const traitResponses = responses.filter(r =>
        r.trait?.toLowerCase() === trait || r.category === 'personality'
      );

      if (traitResponses.length > 0) {
        const avg = traitResponses.reduce((sum, r) => sum + (r.score || 3), 0) / traitResponses.length;
        bigFive[trait] = avg;
      }
    });

    return { bigFive, neurodiversity: {} };
  }

  /**
   * Analyze clinical screener responses from Stage 1
   * PHQ-2 ≥3 indicates positive depression screen
   * GAD-2 ≥3 indicates positive anxiety screen
   */
  analyzeClinicalScreeners(responses) {
    const phq2Ids = ['DEPRESSION_PHQ9_1', 'DEPRESSION_PHQ9_2'];
    const gad2Ids = ['ANXIETY_GAD7_1', 'ANXIETY_GAD7_2'];

    const phq2Responses = responses.filter(r => phq2Ids.includes(r.questionId));
    const gad2Responses = responses.filter(r => gad2Ids.includes(r.questionId));

    const phq2Score = phq2Responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const gad2Score = gad2Responses.reduce((sum, r) => sum + (r.score || 0), 0);

    // CRITICAL FIX: Use clinical standard thresholds per Kroenke et al. (2003)
    // PHQ-2: Score ≥3 AND at least one item ≥2 ("More than half the days")
    // This prevents false positives from borderline scores like (1+2)
    const phq2HasHighItem = phq2Responses.some(r => (r.score || 0) >= 2);
    const gad2HasHighItem = gad2Responses.some(r => (r.score || 0) >= 2);

    return {
      depression: phq2Score >= 3 && phq2HasHighItem, // Stricter clinical standard
      anxiety: gad2Score >= 3 && gad2HasHighItem,    // Stricter clinical standard
      phq2Score,
      gad2Score,
      phq2HasHighItem, // For debugging/logging
      gad2HasHighItem
    };
  }

  /**
   * Analyze neurodiversity flag responses from Stage 1
   * If response score ≥ 3 (on Likert 1-5), consider flagged for expansion
   */
  analyzeNeurodiversityFlags(responses) {
    // Find neurodiversity responses
    const adhdResponses = responses.filter(r =>
      r.category === 'neurodiversity' && r.tags?.includes('adhd')
    );

    const autismResponses = responses.filter(r =>
      r.category === 'neurodiversity' && r.tags?.includes('autism')
    );

    const sensoryResponses = responses.filter(r =>
      r.category === 'neurodiversity' &&
      (r.tags?.includes('sensory') || r.tags?.includes('sensory_processing'))
    );

    // Calculate average scores
    const adhdAvg = adhdResponses.length > 0
      ? adhdResponses.reduce((sum, r) => sum + (r.score || 0), 0) / adhdResponses.length
      : 0;

    const autismAvg = autismResponses.length > 0
      ? autismResponses.reduce((sum, r) => sum + (r.score || 0), 0) / autismResponses.length
      : 0;

    const sensoryAvg = sensoryResponses.length > 0
      ? sensoryResponses.reduce((sum, r) => sum + (r.score || 0), 0) / sensoryResponses.length
      : 0;

    return {
      adhd: adhdAvg >= 60, // 60% threshold (normalized score)
      autism: autismAvg >= 60,
      sensory: sensoryAvg >= 60,
      adhdScore: Math.round(adhdAvg),
      autismScore: Math.round(autismAvg),
      sensoryScore: Math.round(sensoryAvg)
    };
  }

  /**
   * Select validity questions for Stage 2
   * Stage 2: 2 validity questions (1 inconsistency pair)
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
      stage: 2,
      name: 'Targeted Building',
      description: 'Build out personality facets and expand clinical areas of concern',
      targetQuestions: this.targetQuestions,
      targetConfidence: 75,
      minQuestionsPerDimension: 2
    };
  }
}

module.exports = Stage2TargetedBuilding;
