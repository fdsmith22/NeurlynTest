/**
 * Stage 1: Broad Screening (12-15 questions)
 * Goal: Get initial read on all Big Five + clinical + neurodiversity
 * Target: 30% confidence per dimension
 *
 * Question breakdown:
 * - 5 Big Five anchors (highest-loading items)
 * - 4 Clinical screeners (PHQ-2, GAD-2)
 * - 3 Neurodiversity flags (ADHD, Autism, Sensory)
 * - 1 Validity check
 */

class Stage1BroadScreening {
  constructor() {
    this.targetQuestions = 13; // 12-15 range
    this.minQuestions = 12;
    this.maxQuestions = 15;
  }

  /**
   * Select Stage 1 questions
   *
   * @param {Model} QuestionBank - Mongoose QuestionBank model
   * @param {Array} alreadyAsked - Questions already presented (to avoid duplicates)
   * @returns {Array} Selected questions
   */
  async selectQuestions(QuestionBank, alreadyAsked = []) {
    const selected = [];
    const askedIds = new Set(alreadyAsked.map(q => q.questionId || q));

    // 1. Big Five anchors (5 questions) - highest-loading items
    const bigFiveAnchors = await this.selectBigFiveAnchors(QuestionBank, askedIds);
    selected.push(...bigFiveAnchors);

    // 2. Clinical screeners (4 questions)
    const clinicalScreeners = await this.selectClinicalScreeners(QuestionBank, askedIds);
    selected.push(...clinicalScreeners);

    // 3. Neurodiversity flags (3 questions)
    const neurodiversityFlags = await this.selectNeurodiversityFlags(QuestionBank, askedIds);
    selected.push(...neurodiversityFlags);

    // 4. Validity check (1 question)
    const validityCheck = await this.selectValidityCheck(QuestionBank, askedIds);
    selected.push(...validityCheck);

    // Shuffle to avoid pattern fatigue
    const shuffled = this.shuffleArray(selected);

    return shuffled.slice(0, this.maxQuestions);
  }

  /**
   * Select one anchor question per Big Five trait
   * Prioritizes questions with high factor loadings
   */
  async selectBigFiveAnchors(QuestionBank, askedIds) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const anchors = [];

    for (const trait of traits) {
      // Try to find anchor/high-loading question
      let anchor = await QuestionBank.findOne({
        category: 'personality',
        trait: trait,
        active: true,
        questionId: { $nin: Array.from(askedIds) },
        $or: [
          { tags: { $in: ['anchor', 'high_loading'] } },
          { discriminationIndex: { $gte: 0.7 } }
        ]
      }).sort({ discriminationIndex: -1 });

      // Fallback: any question for this trait
      if (!anchor) {
        anchor = await QuestionBank.findOne({
          category: 'personality',
          trait: trait,
          active: true,
          questionId: { $nin: Array.from(askedIds) }
        });
      }

      if (anchor) {
        anchors.push(anchor);
        askedIds.add(anchor.questionId);
      }
    }

    return anchors;
  }

  /**
   * Select clinical screeners (PHQ-2, GAD-2)
   * These are the first 2 questions of PHQ-9 and GAD-7
   */
  async selectClinicalScreeners(QuestionBank, askedIds) {
    const screeners = [];

    // PHQ-2 (depression screening) - First 2 questions of PHQ-9
    const phq2 = await QuestionBank.find({
      instrument: 'PHQ-9',
      questionId: {
        $in: ['DEPRESSION_PHQ9_1', 'DEPRESSION_PHQ9_2'],
        $nin: Array.from(askedIds)
      },
      active: true
    }).limit(2);

    screeners.push(...phq2);
    phq2.forEach(q => askedIds.add(q.questionId));

    // GAD-2 (anxiety screening) - First 2 questions of GAD-7
    const gad2 = await QuestionBank.find({
      instrument: 'GAD-7',
      questionId: {
        $in: ['ANXIETY_GAD7_1', 'ANXIETY_GAD7_2'],
        $nin: Array.from(askedIds)
      },
      active: true
    }).limit(2);

    screeners.push(...gad2);
    gad2.forEach(q => askedIds.add(q.questionId));

    return screeners;
  }

  /**
   * Select neurodiversity flag questions
   * One each for ADHD, Autism, and Sensory Processing
   */
  async selectNeurodiversityFlags(QuestionBank, askedIds) {
    const flags = [];

    // ADHD flag - highest discrimination question
    const adhd = await QuestionBank.findOne({
      category: 'neurodiversity',
      tags: 'adhd',
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    }).sort({ discriminationIndex: -1 });

    if (adhd) {
      flags.push(adhd);
      askedIds.add(adhd.questionId);
    }

    // Autism flag - highest discrimination question
    const autism = await QuestionBank.findOne({
      category: 'neurodiversity',
      tags: 'autism',
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    }).sort({ discriminationIndex: -1 });

    if (autism) {
      flags.push(autism);
      askedIds.add(autism.questionId);
    }

    // Sensory processing flag
    const sensory = await QuestionBank.findOne({
      category: 'neurodiversity',
      $or: [
        { tags: 'sensory' },
        { tags: 'sensory_processing' }
      ],
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    }).sort({ discriminationIndex: -1 });

    if (sensory) {
      flags.push(sensory);
      askedIds.add(sensory.questionId);
    }

    return flags;
  }

  /**
   * Select validity check questions
   * Stage 1: 3 validity questions (1 inconsistency pair + 1 infrequency)
   * Used to detect inattentive or dishonest responding
   */
  async selectValidityCheck(QuestionBank, askedIds) {
    const validityQuestions = [];

    // 1. Select one inconsistency pair (questions with pattern VALIDITY_INCONS_XA and VALIDITY_INCONS_XB)
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

    // 2. Select one infrequency question
    const infrequency = await QuestionBank.findOne({
      category: 'validity_scales',
      subcategory: 'infrequency',
      active: true,
      questionId: { $nin: Array.from(askedIds) }
    });

    if (infrequency) {
      validityQuestions.push(infrequency);
      askedIds.add(infrequency.questionId);
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
      stage: 1,
      name: 'Broad Screening',
      description: 'Initial assessment across all major dimensions',
      targetQuestions: this.targetQuestions,
      targetConfidence: 30,
      minQuestionsPerDimension: 1
    };
  }
}

module.exports = Stage1BroadScreening;
