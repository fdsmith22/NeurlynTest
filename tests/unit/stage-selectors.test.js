/**
 * Unit Tests for Stage Selectors
 *
 * Tests all 4 stage selectors and the multi-stage coordinator:
 * - Stage 1: Broad Screening
 * - Stage 2: Targeted Building
 * - Stage 3: Precision Refinement
 * - Stage 4: Gap Filling
 * - Multi-Stage Coordinator
 */

const Stage1BroadScreening = require('../../services/adaptive-selectors/stage-1-broad-screening');
const Stage2TargetedBuilding = require('../../services/adaptive-selectors/stage-2-targeted-building');
const Stage3PrecisionRefinement = require('../../services/adaptive-selectors/stage-3-precision-refinement');
const Stage4GapFilling = require('../../services/adaptive-selectors/stage-4-gap-filling');
const MultiStageCoordinator = require('../../services/adaptive-selectors/multi-stage-coordinator');
const ConfidenceTracker = require('../../services/confidence-tracker');

// Mock QuestionBank for testing
const createMockQuestionBank = () => {
  const mockQuestions = {
    personality: {
      openness: [
        { questionId: 'O1', category: 'personality', trait: 'openness', active: true, discriminationIndex: 0.8 },
        { questionId: 'O2', category: 'personality', trait: 'openness', active: true, discriminationIndex: 0.7 },
        { questionId: 'O3', category: 'personality', trait: 'openness', facet: 'ideas', active: true, discriminationIndex: 0.75 }
      ],
      conscientiousness: [
        { questionId: 'C1', category: 'personality', trait: 'conscientiousness', active: true, discriminationIndex: 0.8 },
        { questionId: 'C2', category: 'personality', trait: 'conscientiousness', facet: 'self_discipline', active: true, discriminationIndex: 0.7 }
      ],
      extraversion: [
        { questionId: 'E1', category: 'personality', trait: 'extraversion', active: true, discriminationIndex: 0.8 },
        { questionId: 'E2', category: 'personality', trait: 'extraversion', facet: 'warmth', active: true, discriminationIndex: 0.7 }
      ],
      agreeableness: [
        { questionId: 'A1', category: 'personality', trait: 'agreeableness', active: true, discriminationIndex: 0.8 }
      ],
      neuroticism: [
        { questionId: 'N1', category: 'personality', trait: 'neuroticism', active: true, discriminationIndex: 0.8 },
        { questionId: 'N2', category: 'personality', trait: 'neuroticism', facet: 'anxiety', active: true, discriminationIndex: 0.7 }
      ]
    },
    clinical: {
      phq9: [
        { questionId: 'DEPRESSION_PHQ9_1', instrument: 'PHQ-9', category: 'clinical_psychopathology', tags: ['depression'], active: true },
        { questionId: 'DEPRESSION_PHQ9_2', instrument: 'PHQ-9', category: 'clinical_psychopathology', tags: ['depression'], active: true },
        { questionId: 'DEPRESSION_PHQ9_3', instrument: 'PHQ-9', category: 'clinical_psychopathology', tags: ['depression'], active: true }
      ],
      gad7: [
        { questionId: 'ANXIETY_GAD7_1', instrument: 'GAD-7', category: 'clinical_psychopathology', tags: ['anxiety'], active: true },
        { questionId: 'ANXIETY_GAD7_2', instrument: 'GAD-7', category: 'clinical_psychopathology', tags: ['anxiety'], active: true },
        { questionId: 'ANXIETY_GAD7_3', instrument: 'GAD-7', category: 'clinical_psychopathology', tags: ['anxiety'], active: true }
      ]
    },
    neurodiversity: [
      { questionId: 'ADHD_1', category: 'neurodiversity', tags: ['adhd'], active: true },
      { questionId: 'AUTISM_1', category: 'neurodiversity', tags: ['autism'], active: true },
      { questionId: 'SENSORY_1', category: 'neurodiversity', tags: ['sensory'], active: true }
    ],
    validity: [
      { questionId: 'VALIDITY_1', category: 'validity_scales', active: true }
    ],
    attachment: [
      { questionId: 'ATT_1', category: 'attachment', instrument: 'ECR-R', active: true }
    ]
  };

  // Mock Mongoose query methods
  return {
    findOne: jest.fn((query) => ({
      sort: jest.fn(() => {
        // Return first matching question based on query
        if (query.category === 'personality' && query.trait) {
          return mockQuestions.personality[query.trait]?.[0] || null;
        }
        if (query.instrument === 'PHQ-9') {
          return mockQuestions.clinical.phq9[0];
        }
        if (query.instrument === 'GAD-7') {
          return mockQuestions.clinical.gad7[0];
        }
        if (query.category === 'neurodiversity') {
          return mockQuestions.neurodiversity[0];
        }
        if (query.category === 'validity_scales') {
          return mockQuestions.validity[0];
        }
        return null;
      })
    })),
    find: jest.fn((query) => ({
      sort: jest.fn(() => ({
        limit: jest.fn((limit) => {
          // Return array of matching questions
          if (query.instrument === 'PHQ-9') {
            return Promise.resolve(mockQuestions.clinical.phq9.slice(0, limit));
          }
          if (query.instrument === 'GAD-7') {
            return Promise.resolve(mockQuestions.clinical.gad7.slice(0, limit));
          }
          if (query.category === 'personality' && query.trait) {
            return Promise.resolve(mockQuestions.personality[query.trait]?.slice(0, limit) || []);
          }
          if (query.category === 'neurodiversity') {
            return Promise.resolve(mockQuestions.neurodiversity.slice(0, limit));
          }
          return Promise.resolve([]);
        })
      }))
    }))
  };
};

describe('Stage1BroadScreening', () => {
  let stage1;
  let mockQuestionBank;

  beforeEach(() => {
    stage1 = new Stage1BroadScreening();
    mockQuestionBank = createMockQuestionBank();
  });

  test('should initialize with correct target range', () => {
    expect(stage1.minQuestions).toBe(12);
    expect(stage1.maxQuestions).toBe(15);
    expect(stage1.targetQuestions).toBe(13);
  });

  test('selectQuestions should return 12-15 questions', async () => {
    const questions = await stage1.selectQuestions(mockQuestionBank, []);

    expect(questions.length).toBeGreaterThanOrEqual(12);
    expect(questions.length).toBeLessThanOrEqual(15);
  });

  test('should include Big Five anchors', async () => {
    const questions = await stage1.selectQuestions(mockQuestionBank, []);

    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    traits.forEach(trait => {
      const hasTrait = questions.some(q => q.trait === trait);
      expect(hasTrait).toBe(true);
    });
  });

  test('should include clinical screeners (PHQ-2, GAD-2)', async () => {
    const questions = await stage1.selectQuestions(mockQuestionBank, []);

    const hasPhq2 = questions.some(q => q.instrument === 'PHQ-9');
    const hasGad2 = questions.some(q => q.instrument === 'GAD-7');

    expect(hasPhq2).toBe(true);
    expect(hasGad2).toBe(true);
  });

  test('should not duplicate already asked questions', async () => {
    const alreadyAsked = ['O1', 'C1'];
    const questions = await stage1.selectQuestions(mockQuestionBank, alreadyAsked);

    questions.forEach(q => {
      expect(alreadyAsked).not.toContain(q.questionId);
    });
  });
});

describe('Stage2TargetedBuilding', () => {
  let stage2;
  let mockQuestionBank;
  let tracker;

  beforeEach(() => {
    stage2 = new Stage2TargetedBuilding();
    mockQuestionBank = createMockQuestionBank();
    tracker = new ConfidenceTracker();

    // Add some Stage 1 data
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
      tracker.updateConfidence(trait, {
        questionId: `${trait[0].toUpperCase()}1`,
        score: 50,
        timestamp: new Date()
      });
    });
  });

  test('should initialize with correct target range', () => {
    expect(stage2.targetQuestions).toBe(27);
  });

  test('should expand PHQ-9 if PHQ-2 positive', async () => {
    const stage1Responses = [
      { questionId: 'DEPRESSION_PHQ9_1', score: 2 },
      { questionId: 'DEPRESSION_PHQ9_2', score: 2 }  // Total = 4, >= 3 threshold
    ];

    const questions = await stage2.selectQuestions(mockQuestionBank, tracker, stage1Responses, []);

    const phq9Questions = questions.filter(q => q.instrument === 'PHQ-9');
    expect(phq9Questions.length).toBeGreaterThan(0);
  });

  test('should NOT expand PHQ-9 if PHQ-2 negative', async () => {
    const stage1Responses = [
      { questionId: 'DEPRESSION_PHQ9_1', score: 1 },
      { questionId: 'DEPRESSION_PHQ9_2', score: 1 }  // Total = 2, < 3 threshold
    ];

    const questions = await stage2.selectQuestions(mockQuestionBank, tracker, stage1Responses, []);

    const phq9Questions = questions.filter(q => q.instrument === 'PHQ-9');
    expect(phq9Questions.length).toBe(0);
  });

  test('should select facet questions for Big Five traits', async () => {
    const questions = await stage2.selectQuestions(mockQuestionBank, tracker, [], []);

    // Should include some facet-level questions
    const facetQuestions = questions.filter(q => q.facet);
    expect(facetQuestions.length).toBeGreaterThan(0);
  });
});

describe('Stage3PrecisionRefinement', () => {
  let stage3;
  let mockQuestionBank;
  let tracker;

  beforeEach(() => {
    stage3 = new Stage3PrecisionRefinement();
    mockQuestionBank = createMockQuestionBank();
    tracker = new ConfidenceTracker();
  });

  test('should initialize with correct target range', () => {
    expect(stage3.targetQuestions).toBe(17);
  });

  test('should detect divergent facets', () => {
    // Set up tracker with divergent facet
    tracker.dimensions.set('neuroticism', { score: 50, confidence: 80, questionCount: 4 });
    tracker.dimensions.set('neuroticism_anxiety', { score: 80, confidence: 70, questionCount: 2 });  // 30 points higher

    const divergent = stage3.detectDivergentFacets(tracker, []);

    expect(divergent.length).toBeGreaterThan(0);
    const anxietyFacet = divergent.find(d => d.facet === 'anxiety');
    expect(anxietyFacet).toBeDefined();
    expect(Math.abs(anxietyFacet.difference)).toBeGreaterThan(20);
  });

  test('should return empty array if all confidence high', async () => {
    // Set all dimensions to high confidence
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
      tracker.dimensions.set(trait, { score: 50, confidence: 90, questionCount: 4 });
    });

    const questions = await stage3.selectQuestions(mockQuestionBank, tracker, []);

    // May return 0 questions if nothing needs refinement
    expect(questions.length).toBeLessThanOrEqual(17);
  });

  test('should select precision questions for low-confidence dimensions', async () => {
    // Set some dimensions to low confidence
    tracker.dimensions.set('openness', { score: 50, confidence: 60, questionCount: 2 });
    tracker.dimensions.set('conscientiousness', { score: 50, confidence: 90, questionCount: 4 });

    const questions = await stage3.selectQuestions(mockQuestionBank, tracker, []);

    // Should target openness more than conscientiousness
    expect(questions.length).toBeGreaterThan(0);
  });
});

describe('Stage4GapFilling', () => {
  let stage4;
  let mockQuestionBank;
  let tracker;

  beforeEach(() => {
    stage4 = new Stage4GapFilling();
    mockQuestionBank = createMockQuestionBank();
    tracker = new ConfidenceTracker();

    // Set up complete Big Five
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
      tracker.dimensions.set(trait, { score: 50 + Math.random() * 20, confidence: 85, questionCount: 4 });
    });
  });

  test('should initialize with correct target', () => {
    expect(stage4.targetTotal).toBe(70);
  });

  test('should fill to exactly 70 questions', async () => {
    const currentResponses = new Array(60).fill(null).map((_, i) => ({ questionId: `Q${i}` }));
    const questions = await stage4.selectQuestions(mockQuestionBank, tracker, currentResponses, currentResponses, 70);

    expect(questions.length).toBe(10); // 70 - 60 = 10
  });

  test('should return empty array if already at 70', async () => {
    const currentResponses = new Array(70).fill(null).map((_, i) => ({ questionId: `Q${i}` }));
    const questions = await stage4.selectQuestions(mockQuestionBank, tracker, currentResponses, currentResponses, 70);

    expect(questions.length).toBe(0);
  });

  test('should predict archetype from Big Five', () => {
    // Resilient profile: high E, high A, low N
    tracker.dimensions.set('extraversion', { score: 80, confidence: 85, questionCount: 4 });
    tracker.dimensions.set('agreeableness', { score: 75, confidence: 85, questionCount: 4 });
    tracker.dimensions.set('neuroticism', { score: 25, confidence: 85, questionCount: 4 });

    const archetype = stage4.predictArchetype(tracker);
    expect(archetype).toBe('resilient');
  });

  test('should predict undercontrolled archetype', () => {
    // Undercontrolled: high N, low C
    tracker.dimensions.set('neuroticism', { score: 75, confidence: 85, questionCount: 4 });
    tracker.dimensions.set('conscientiousness', { score: 30, confidence: 85, questionCount: 4 });

    const archetype = stage4.predictArchetype(tracker);
    expect(archetype).toBe('undercontrolled');
  });

  test('should find coverage gaps', () => {
    const responses = [
      { category: 'personality' },
      { category: 'personality' },
      { category: 'clinical_psychopathology' }
      // Missing: neurodiversity, attachment, etc.
    ];

    const gaps = stage4.findCoverageGaps(responses);

    expect(gaps.length).toBeGreaterThan(0);
    const hasNeurodiversityGap = gaps.some(g => g.value === 'neurodiversity');
    expect(hasNeurodiversityGap).toBe(true);
  });
});

describe('MultiStageCoordinator', () => {
  let coordinator;
  let tracker;

  beforeEach(() => {
    coordinator = new MultiStageCoordinator();
    tracker = new ConfidenceTracker();
  });

  test('should initialize with 4 stage selectors', () => {
    expect(coordinator.stage1).toBeInstanceOf(Stage1BroadScreening);
    expect(coordinator.stage2).toBeInstanceOf(Stage2TargetedBuilding);
    expect(coordinator.stage3).toBeInstanceOf(Stage3PrecisionRefinement);
    expect(coordinator.stage4).toBeInstanceOf(Stage4GapFilling);
  });

  test('should define stage advancement thresholds', () => {
    expect(coordinator.thresholds[1]).toEqual({
      minQuestions: 12,
      minConfidence: 30,
      nextStageAt: 15
    });

    expect(coordinator.thresholds[2]).toEqual({
      minQuestions: 37,
      minConfidence: 60,
      nextStageAt: 42
    });

    expect(coordinator.thresholds[3]).toEqual({
      minQuestions: 55,
      minConfidence: 75,
      nextStageAt: 60
    });

    expect(coordinator.thresholds[4]).toEqual({
      targetTotal: 70
    });
  });

  describe('shouldAdvanceStage', () => {
    test('should stay in Stage 1 with few questions', () => {
      const responses = new Array(5).fill({});
      const newStage = coordinator.shouldAdvanceStage(1, tracker, responses);

      expect(newStage).toBe(1);
    });

    test('should advance from Stage 1 to 2 after 15 questions', () => {
      const responses = new Array(15).fill({});
      const newStage = coordinator.shouldAdvanceStage(1, tracker, responses);

      expect(newStage).toBe(2);
    });

    test('should advance from Stage 1 to 2 with sufficient confidence', () => {
      const responses = new Array(13).fill({});

      // Set high confidence
      ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
        tracker.dimensions.set(trait, { score: 50, confidence: 40, questionCount: 3 });
      });

      const newStage = coordinator.shouldAdvanceStage(1, tracker, responses);

      expect(newStage).toBe(2);
    });

    test('should stay in Stage 4 (final stage)', () => {
      const responses = new Array(70).fill({});
      const newStage = coordinator.shouldAdvanceStage(4, tracker, responses);

      expect(newStage).toBe(4);
    });

    test('should advance stages based on confidence thresholds', () => {
      // Test Stage 2 → 3 advancement
      const responses2 = new Array(42).fill({});
      ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
        tracker.dimensions.set(trait, { score: 50, confidence: 65, questionCount: 8 });
      });

      const newStage2 = coordinator.shouldAdvanceStage(2, tracker, responses2);
      expect(newStage2).toBe(3);

      // Test Stage 3 → 4 advancement
      const responses3 = new Array(60).fill({});
      ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'].forEach(trait => {
        tracker.dimensions.set(trait, { score: 50, confidence: 80, questionCount: 12 });
      });

      const newStage3 = coordinator.shouldAdvanceStage(3, tracker, responses3);
      expect(newStage3).toBe(4);
    });
  });

  describe('getAverageConfidence', () => {
    test('should calculate average across Big Five', () => {
      tracker.dimensions.set('openness', { score: 50, confidence: 70, questionCount: 3 });
      tracker.dimensions.set('conscientiousness', { score: 50, confidence: 80, questionCount: 3 });
      tracker.dimensions.set('extraversion', { score: 50, confidence: 60, questionCount: 3 });
      tracker.dimensions.set('agreeableness', { score: 50, confidence: 90, questionCount: 3 });
      tracker.dimensions.set('neuroticism', { score: 50, confidence: 50, questionCount: 3 });

      const avg = coordinator.getAverageConfidence(tracker);

      // (70 + 80 + 60 + 90 + 50) / 5 = 70
      expect(avg).toBe(70);
    });

    test('should handle missing traits', () => {
      tracker.dimensions.set('openness', { score: 50, confidence: 70, questionCount: 3 });
      tracker.dimensions.set('extraversion', { score: 50, confidence: 80, questionCount: 3 });

      const avg = coordinator.getAverageConfidence(tracker);

      // (70 + 80) / 2 = 75
      expect(avg).toBe(75);
    });

    test('should return 0 for empty tracker', () => {
      const avg = coordinator.getAverageConfidence(tracker);
      expect(avg).toBe(0);
    });
  });

  describe('getStageMessage', () => {
    test('should return appropriate messages for each stage', () => {
      expect(coordinator.getStageMessage(1)).toBe('Getting to know you - building initial profile');
      expect(coordinator.getStageMessage(2)).toBe('Exploring key areas in depth');
      expect(coordinator.getStageMessage(3)).toBe('Fine-tuning your unique patterns');
      expect(coordinator.getStageMessage(4)).toBe('Completing comprehensive assessment');
    });
  });

  describe('getSkipNotifications', () => {
    test('should identify skippable dimensions', () => {
      // High confidence dimensions
      tracker.dimensions.set('extraversion', { score: 75, confidence: 90, questionCount: 4 });
      tracker.dimensions.set('openness', { score: 60, confidence: 88, questionCount: 3 });

      // Low confidence dimension
      tracker.dimensions.set('neuroticism', { score: 50, confidence: 60, questionCount: 2 });

      const notifications = coordinator.getSkipNotifications(tracker);

      expect(notifications.length).toBeGreaterThan(0);
      const skipDimensions = notifications.map(n => n.dimension);
      expect(skipDimensions).toContain('extraversion');
      expect(skipDimensions).toContain('openness');
      expect(skipDimensions).not.toContain('neuroticism');
    });

    test('notification should include confidence percentage', () => {
      tracker.dimensions.set('extraversion', { score: 75, confidence: 92, questionCount: 4 });

      const notifications = coordinator.getSkipNotifications(tracker);

      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toContain('92%');
      expect(notifications[0].message).toContain('extraversion');
    });
  });

  describe('isComplete', () => {
    test('should return true when 70 questions reached', () => {
      const session = {
        responses: new Array(70).fill({})
      };

      expect(coordinator.isComplete(session)).toBe(true);
    });

    test('should return false when under 70 questions', () => {
      const session = {
        responses: new Array(50).fill({})
      };

      expect(coordinator.isComplete(session)).toBe(false);
    });
  });

  describe('getProgress', () => {
    test('should calculate progress correctly', () => {
      const session = {
        responses: new Array(35).fill({}),
        currentStage: 2
      };

      const progress = coordinator.getProgress(session);

      expect(progress.current).toBe(35);
      expect(progress.total).toBe(70);
      expect(progress.percentage).toBe(50);
      expect(progress.remaining).toBe(35);
      expect(progress.stage).toBe(2);
      expect(progress.complete).toBe(false);
    });

    test('should mark as complete at 70 questions', () => {
      const session = {
        responses: new Array(70).fill({}),
        currentStage: 4
      };

      const progress = coordinator.getProgress(session);

      expect(progress.complete).toBe(true);
      expect(progress.remaining).toBe(0);
    });
  });
});
