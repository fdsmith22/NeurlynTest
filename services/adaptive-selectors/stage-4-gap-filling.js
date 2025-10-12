/**
 * Stage 4: Gap Filling (5-10 questions)
 * Goal: Reach exactly 70 questions, fill coverage gaps, add archetype-specific questions
 * Target: 90% confidence, comprehensive coverage
 *
 * This stage ensures:
 * - Exactly 70 total questions (fills remaining slots)
 * - All major categories assessed
 * - Archetype-specific questions for personalization
 */

class Stage4GapFilling {
  constructor() {
    this.targetTotal = 70; // Total questions for full assessment
  }

  /**
   * Select final questions to reach exactly 70 total
   *
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Object} tracker - ConfidenceTracker instance
   * @param {Array} allResponses - All responses so far
   * @param {Array} alreadyAsked - Questions already presented
   * @param {Number} targetTotal - Target total questions (default 70)
   * @returns {Array} Selected questions
   */
  async selectQuestions(QuestionBank, tracker, allResponses, alreadyAsked = [], targetTotal = 70) {
    const selected = [];
    const askedIds = new Set(alreadyAsked.map(q => q.questionId || q));
    const currentTotal = alreadyAsked.length;
    const budget = targetTotal - currentTotal;

    if (budget <= 0) {
      return []; // Already at target
    }

    // 1. Find coverage gaps (categories/instruments not yet assessed)
    const gaps = this.findCoverageGaps(allResponses);

    // 2. Predict archetype for archetype-specific questions
    const archetype = this.predictArchetype(tracker);

    // Allocate budget
    const gapBudget = Math.floor(budget * 0.6);        // 60% for filling gaps
    const archetypeBudget = budget - gapBudget;         // 40% for archetype-specific

    // Fill coverage gaps
    let gapCount = 0;
    for (const gap of gaps.slice(0, gapBudget)) {
      if (gapCount >= gapBudget) break;

      const query = { active: true, questionId: { $nin: Array.from(askedIds) } };

      if (gap.type === 'category') {
        query.category = gap.value;
      } else if (gap.type === 'instrument') {
        query.instrument = gap.value;
      }

      const question = await QuestionBank.findOne(query)
        .sort({ discriminationIndex: -1 });

      if (question) {
        selected.push(question);
        askedIds.add(question.questionId);
        gapCount++;
      }
    }

    // Add archetype-specific questions
    const archetypeQuestions = await this.selectArchetypeQuestions(
      QuestionBank,
      archetype,
      allResponses,
      askedIds,
      archetypeBudget
    );

    selected.push(...archetypeQuestions);

    // Add validity question (1 question: infrequency or positive_impression)
    const validityQuestion = await this.selectValidityQuestion(QuestionBank, askedIds);
    if (validityQuestion) {
      selected.push(validityQuestion);
      askedIds.add(validityQuestion.questionId);
    }

    // CRITICAL FIX: Ensure we ALWAYS fill to target (70 questions)
    // If we still haven't reached the budget, add high-quality filler questions
    if (selected.length < budget) {
      const stillNeeded = budget - selected.length;

      const fillerQuestions = await QuestionBank.find({
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      })
        .sort({ discriminationIndex: -1, difficulty: -1 })
        .limit(stillNeeded);

      selected.push(...fillerQuestions);

      console.log(`[Stage 4] Filled ${fillerQuestions.length} additional questions to reach target. Total: ${selected.length}/${budget}`);
    }

    return selected.slice(0, budget);
  }

  /**
   * Find categories/instruments not yet assessed
   * Returns gaps sorted by priority (high → medium → low)
   */
  findCoverageGaps(responses) {
    const gaps = [];

    // Track what's been covered
    const askedCategories = new Set(responses.map(r => r.category));
    const askedInstruments = new Set(responses.map(r => r.instrument).filter(Boolean));

    // All possible categories
    const allCategories = [
      'personality',
      'clinical_psychopathology',
      'neurodiversity',
      'attachment',
      'trauma_screening',
      'cognitive_functions',
      'cognitive'
    ];

    // Important instruments
    const importantInstruments = [
      { name: 'ECR-R', priority: 'high' },          // Attachment
      { name: 'CD-RISC', priority: 'medium' },      // Resilience
      { name: 'IIP-32', priority: 'medium' },       // Interpersonal
      { name: 'HEXACO-60', priority: 'medium' },    // Honesty-Humility
      { name: 'MSI-BPD', priority: 'high' },        // Borderline (if clinical flags)
      { name: 'AUDIT', priority: 'low' },           // Alcohol
      { name: 'DAST', priority: 'low' }             // Drugs
    ];

    // Missing categories
    for (const cat of allCategories) {
      if (!askedCategories.has(cat)) {
        const priority = this.getCategoryPriority(cat, responses);
        gaps.push({ type: 'category', value: cat, priority });
      }
    }

    // Missing instruments
    for (const inst of importantInstruments) {
      if (!askedInstruments.has(inst.name)) {
        gaps.push({ type: 'instrument', value: inst.name, priority: inst.priority });
      }
    }

    // Sort by priority (high → medium → low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Determine priority for a category based on previous responses
   */
  getCategoryPriority(category, responses) {
    // High priority if other indicators suggest it's relevant
    if (category === 'attachment') {
      // High priority if relationship questions answered
      const hasRelationshipQuestions = responses.some(r =>
        r.tags?.includes('relationship') || r.subcategory?.includes('interpersonal')
      );
      return hasRelationshipQuestions ? 'high' : 'medium';
    }

    if (category === 'trauma_screening') {
      // High priority if clinical psychopathology scores elevated
      const clinicalResponses = responses.filter(r => r.category === 'clinical_psychopathology');
      const avgClinical = clinicalResponses.length > 0
        ? clinicalResponses.reduce((sum, r) => sum + (r.score || 0), 0) / clinicalResponses.length
        : 0;
      return avgClinical > 60 ? 'high' : 'medium';
    }

    return 'medium';
  }

  /**
   * Predict personality archetype from current data
   * Used to select personalized final questions
   */
  predictArchetype(tracker) {
    // Get Big Five scores
    const o = tracker.dimensions.get('openness')?.score || 50;
    const c = tracker.dimensions.get('conscientiousness')?.score || 50;
    const e = tracker.dimensions.get('extraversion')?.score || 50;
    const a = tracker.dimensions.get('agreeableness')?.score || 50;
    const n = tracker.dimensions.get('neuroticism')?.score || 50;

    // Simple archetype detection (can be enhanced later)
    if (e > 60 && a > 60 && n < 40) return 'resilient';
    if (n > 60 && (c < 40 || e < 40)) return 'undercontrolled';
    if (c > 60 && a > 60 && o < 40) return 'overcontrolled';
    if (o > 60 && e > 60) return 'creative-extrovert';
    if (o > 60 && c > 60) return 'intellectual-achiever';

    return 'balanced';
  }

  /**
   * Select questions tailored to archetype
   * Adds depth to areas relevant for this personality type
   */
  async selectArchetypeQuestions(QuestionBank, archetype, alreadyAsked, askedIds, count) {
    // Archetype-specific question preferences
    const archetypeQuestionMap = {
      'resilient': {
        traits: ['extraversion', 'agreeableness'],
        facets: ['positive_emotions', 'warmth', 'trust'],
        instruments: ['CD-RISC', 'MSPSS'],
        description: 'Resilient individuals - focus on strengths and social resources'
      },
      'undercontrolled': {
        traits: ['neuroticism', 'conscientiousness'],
        facets: ['impulsiveness', 'self_discipline', 'vulnerability'],
        instruments: ['MSI-BPD', 'AUDIT'],
        description: 'Undercontrolled - focus on emotional regulation and impulsivity'
      },
      'overcontrolled': {
        traits: ['conscientiousness', 'neuroticism'],
        facets: ['deliberation', 'anxiety', 'self_consciousness'],
        instruments: ['GAD-7', 'IIP-32'],
        description: 'Overcontrolled - focus on anxiety and interpersonal patterns'
      },
      'creative-extrovert': {
        traits: ['openness', 'extraversion'],
        facets: ['ideas', 'excitement_seeking', 'assertiveness'],
        instruments: ['HEXACO-60'],
        description: 'Creative extroverts - focus on openness and social engagement'
      },
      'intellectual-achiever': {
        traits: ['openness', 'conscientiousness'],
        facets: ['ideas', 'achievement_striving', 'competence'],
        instruments: ['BFI-2', 'CD-RISC'],
        description: 'Intellectual achievers - focus on cognitive complexity and drive'
      },
      'balanced': {
        traits: ['openness', 'conscientiousness', 'agreeableness'],
        facets: ['values', 'competence', 'trust'],
        instruments: ['BFI-2'],
        description: 'Balanced profile - broad coverage across traits'
      }
    };

    const config = archetypeQuestionMap[archetype] || archetypeQuestionMap['balanced'];
    const questions = [];

    // Select from archetype-relevant questions
    const candidates = await QuestionBank.find({
      $or: [
        { trait: { $in: config.traits } },
        { facet: { $in: config.facets } },
        { instrument: { $in: config.instruments } }
      ],
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    })
    .sort({ discriminationIndex: -1 })
    .limit(count);

    return candidates;
  }

  /**
   * Select validity question for Stage 4
   * Stage 4: 1 validity question (infrequency or positive_impression)
   */
  async selectValidityQuestion(QuestionBank, askedIds) {
    // Try infrequency first
    let validity = await QuestionBank.findOne({
      category: 'validity_scales',
      subcategory: 'infrequency',
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    });

    // If no infrequency available, try positive_impression
    if (!validity) {
      validity = await QuestionBank.findOne({
        category: 'validity_scales',
        subcategory: 'positive_impression',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      });
    }

    // If no specific type available, try any validity question
    if (!validity) {
      validity = await QuestionBank.findOne({
        category: 'validity_scales',
        active: true,
        questionId: { $nin: Array.from(askedIds) }
      });
    }

    return validity;
  }

  /**
   * Get stage metadata
   */
  getStageInfo() {
    return {
      stage: 4,
      name: 'Gap Filling',
      description: 'Ensure comprehensive coverage and reach target question count',
      targetTotal: this.targetTotal,
      targetConfidence: 90,
      purpose: 'Fill coverage gaps and add archetype-specific personalization'
    };
  }
}

module.exports = Stage4GapFilling;
