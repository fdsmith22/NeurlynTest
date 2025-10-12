/**
 * Unit Tests for ConfidenceTracker
 *
 * Tests confidence calculation, priority dimension detection,
 * skip logic, and serialization/deserialization.
 */

const ConfidenceTracker = require('../../services/confidence-tracker');

describe('ConfidenceTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new ConfidenceTracker();
  });

  describe('Initialization', () => {
    test('should initialize with empty dimensions map', () => {
      expect(tracker.dimensions).toBeInstanceOf(Map);
      expect(tracker.dimensions.size).toBe(0);
    });
  });

  describe('updateConfidencee', () => {
    test('should create new dimension when first response added', () => {
      tracker.updateConfidence('openness', {
        questionId: 'Q1',
        score: 75,
        timestamp: new Date()
      });

      expect(tracker.dimensions.has('openness')).toBe(true);
      const dim = tracker.dimensions.get('openness');
      expect(dim.questionCount).toBe(1);
      expect(dim.score).toBe(75);
      expect(dim.responses).toHaveLength(1);
    });

    test('should update existing dimension with additional response', () => {
      tracker.updateConfidence('openness', {
        questionId: 'Q1',
        score: 75,
        timestamp: new Date()
      });

      tracker.updateConfidence('openness', {
        questionId: 'Q2',
        score: 80,
        timestamp: new Date()
      });

      const dim = tracker.dimensions.get('openness');
      expect(dim.questionCount).toBe(2);
      expect(dim.score).toBe(77.5); // Average of 75 and 80
      expect(dim.responses).toHaveLength(2);
    });

    test('should calculate average score correctly', () => {
      const scores = [60, 70, 80, 90];
      scores.forEach((score, idx) => {
        tracker.updateConfidence('extraversion', {
          questionId: `Q${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });

      const dim = tracker.dimensions.get('extraversion');
      expect(dim.score).toBe(75); // Average of 60, 70, 80, 90
    });
  });

  describe('calculateConfidence', () => {
    test('should calculate base confidence from question count', () => {
      // 1 question = 15% base
      const responses1 = [{ score: 50 }];
      const conf1 = tracker.calculateConfidence(responses1);
      expect(conf1).toBeGreaterThanOrEqual(15);
      expect(conf1).toBeLessThanOrEqual(30); // 15 base + some consistency

      // 2 questions = 30% base
      const responses2 = [{ score: 50 }, { score: 50 }];
      const conf2 = tracker.calculateConfidence(responses2);
      expect(conf2).toBeGreaterThanOrEqual(30);

      // 4 questions = 60% base (max)
      const responses4 = [{ score: 50 }, { score: 50 }, { score: 50 }, { score: 50 }];
      const conf4 = tracker.calculateConfidence(responses4);
      expect(conf4).toBeGreaterThanOrEqual(60);
    });

    test('should add consistency bonus for low variance', () => {
      // Very consistent responses (variance ~0)
      const consistentResponses = [
        { score: 50 },
        { score: 51 },
        { score: 49 },
        { score: 50 }
      ];
      const confConsistent = tracker.calculateConfidence(consistentResponses);

      // Inconsistent responses (high variance)
      const inconsistentResponses = [
        { score: 10 },
        { score: 50 },
        { score: 90 },
        { score: 30 }
      ];
      const confInconsistent = tracker.calculateConfidence(inconsistentResponses);

      expect(confConsistent).toBeGreaterThan(confInconsistent);
    });

    test('should include discrimination bonus', () => {
      // Discrimination bonus is fixed at 10%
      const responses = [{ score: 50 }, { score: 50 }];
      const confidence = tracker.calculateConfidence(responses);

      // Should be: 30 (base) + ~30 (consistency for no variance) + 10 (discrimination) = ~70
      expect(confidence).toBeGreaterThanOrEqual(60);
      expect(confidence).toBeLessThanOrEqual(80);
    });

    test('should not exceed 100% confidence', () => {
      const responses = [
        { score: 50 },
        { score: 50 },
        { score: 50 },
        { score: 50 },
        { score: 50 }
      ];
      const confidence = tracker.calculateConfidence(responses);
      expect(confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateVariance', () => {
    test('should return 0 for identical scores', () => {
      const variance = tracker.calculateVariance([50, 50, 50, 50]);
      expect(variance).toBe(0);
    });

    test('should calculate variance correctly', () => {
      // Known variance: mean = 50, variance = 250
      const scores = [30, 50, 70];
      const variance = tracker.calculateVariance(scores);
      expect(variance).toBeCloseTo(266.67, 1);
    });

    test('should handle single value', () => {
      const variance = tracker.calculateVariance([50]);
      expect(variance).toBe(0);
    });
  });

  describe('needsMoreQuestions', () => {
    test('should return true if dimension has no data', () => {
      expect(tracker.needsMoreQuestions('openness', 2, 85)).toBe(true);
    });

    test('should return true if below minimum questions', () => {
      tracker.updateConfidence('openness', {
        questionId: 'Q1',
        score: 75,
        timestamp: new Date()
      });

      expect(tracker.needsMoreQuestions('openness', 2, 85)).toBe(true);
    });

    test('should return true if below target confidence', () => {
      // Add 2 questions with high variance (low confidence)
      tracker.updateConfidence('openness', {
        questionId: 'Q1',
        score: 20,
        timestamp: new Date()
      });

      tracker.updateConfidence('openness', {
        questionId: 'Q2',
        score: 80,
        timestamp: new Date()
      });

      const dim = tracker.dimensions.get('openness');
      expect(dim.questionCount).toBe(2);
      expect(tracker.needsMoreQuestions('openness', 2, 85)).toBe(true);
    });

    test('should return false if meets both criteria', () => {
      // Add 3 consistent questions (high confidence)
      [50, 51, 49].forEach((score, idx) => {
        tracker.updateConfidence('openness', {
          questionId: `Q${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });

      const dim = tracker.dimensions.get('openness');
      expect(dim.questionCount).toBeGreaterThanOrEqual(2);
      expect(dim.confidence).toBeGreaterThanOrEqual(60); // Should be ~70-80

      // With lower threshold, should not need more
      expect(tracker.needsMoreQuestions('openness', 2, 60)).toBe(false);
    });
  });

  describe('getPriorityDimensions', () => {
    beforeEach(() => {
      // Set up tracker with various dimensions
      // High confidence dimension
      [75, 76, 74, 75].forEach((score, idx) => {
        tracker.updateConfidence('extraversion', {
          questionId: `E${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });

      // Low confidence dimension (high variance)
      [30, 70, 40, 60].forEach((score, idx) => {
        tracker.updateConfidence('neuroticism', {
          questionId: `N${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });

      // New dimension (only 1 question)
      tracker.updateConfidence('openness', {
        questionId: 'O1',
        score: 50,
        timestamp: new Date()
      });
    });

    test('should identify dimensions needing attention for Stage 2', () => {
      const priorities = tracker.getPriorityDimensions(2);

      // Should return dimensions below 75% confidence
      expect(priorities.length).toBeGreaterThan(0);

      // Should be sorted by confidence gap (largest first)
      for (let i = 0; i < priorities.length - 1; i++) {
        expect(priorities[i].gap).toBeGreaterThanOrEqual(priorities[i + 1].gap);
      }
    });

    test('should include confidence and question count in results', () => {
      const priorities = tracker.getPriorityDimensions(2);

      priorities.forEach(priority => {
        expect(priority).toHaveProperty('dimension');
        expect(priority).toHaveProperty('confidence');
        expect(priority).toHaveProperty('questionCount');
        expect(priority).toHaveProperty('gap');
      });
    });

    test('should use stage-appropriate thresholds', () => {
      // Stage 1: Low threshold (30%)
      const stage1Priorities = tracker.getPriorityDimensions(1);

      // Stage 3: High threshold (85%)
      const stage3Priorities = tracker.getPriorityDimensions(3);

      // Stage 3 should have more priorities (higher bar)
      expect(stage3Priorities.length).toBeGreaterThanOrEqual(stage1Priorities.length);
    });
  });

  describe('getSkippableDimensions', () => {
    beforeEach(() => {
      // High confidence, multiple questions - skippable
      [75, 76, 74, 75].forEach((score, idx) => {
        tracker.updateConfidence('extraversion', {
          questionId: `E${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });

      // High confidence, but only 1 question - not skippable
      tracker.updateConfidence('openness', {
        questionId: 'O1',
        score: 80,
        timestamp: new Date()
      });

      // Low confidence - not skippable
      [30, 70].forEach((score, idx) => {
        tracker.updateConfidence('neuroticism', {
          questionId: `N${idx + 1}`,
          score,
          timestamp: new Date()
        });
      });
    });

    test('should identify skippable dimensions (confidence >= threshold, questions >= min)', () => {
      const skippable = tracker.getSkippableDimensions(75, 2);

      // Extraversion should be skippable (4 questions, ~85% confidence)
      const hasExtraversion = skippable.some(d => d.dimension === 'extraversion');
      expect(hasExtraversion).toBe(true);

      // Openness should NOT be skippable (only 1 question)
      const hasOpenness = skippable.some(d => d.dimension === 'openness');
      expect(hasOpenness).toBe(false);

      // Neuroticism should NOT be skippable (low confidence)
      const hasNeuroticism = skippable.some(d => d.dimension === 'neuroticism');
      expect(hasNeuroticism).toBe(false);
    });

    test('should return dimensions with confidence and questionCount', () => {
      const skippable = tracker.getSkippableDimensions(75, 2);

      skippable.forEach(dim => {
        expect(dim).toHaveProperty('dimension');
        expect(dim).toHaveProperty('confidence');
        expect(dim).toHaveProperty('questionCount');
        expect(dim.confidence).toBeGreaterThanOrEqual(75);
        expect(dim.questionCount).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      tracker.updateConfidence('openness', {
        questionId: 'Q1',
        score: 75,
        timestamp: new Date()
      });

      tracker.updateConfidence('extraversion', {
        questionId: 'Q2',
        score: 60,
        timestamp: new Date()
      });
    });

    test('should return summary of all dimensions', () => {
      const summary = tracker.getSummary();

      expect(summary).toHaveProperty('openness');
      expect(summary).toHaveProperty('extraversion');
    });

    test('should include score, confidence, and questionCount', () => {
      const summary = tracker.getSummary();

      expect(summary.openness).toHaveProperty('score');
      expect(summary.openness).toHaveProperty('confidence');
      expect(summary.openness).toHaveProperty('questionCount');

      // Should be rounded
      expect(Number.isInteger(summary.openness.score)).toBe(true);
      expect(Number.isInteger(summary.openness.confidence)).toBe(true);
    });
  });

  describe('Serialization', () => {
    beforeEach(() => {
      // Add some data to tracker
      ['openness', 'extraversion', 'neuroticism'].forEach((trait, idx) => {
        tracker.updateConfidence(trait, {
          questionId: `Q${idx + 1}`,
          score: 50 + idx * 10,
          timestamp: new Date()
        });
      });
    });

    test('toJSON should export tracker state', () => {
      const json = tracker.toJSON();

      expect(json).toHaveProperty('dimensions');
      expect(json).toHaveProperty('timestamp');
      expect(json.timestamp).toBeInstanceOf(Date);
    });

    test('fromJSON should restore tracker state', () => {
      const json = tracker.toJSON();
      const restored = ConfidenceTracker.fromJSON(json);

      expect(restored.dimensions.size).toBe(tracker.dimensions.size);
      expect(restored.dimensions.get('openness').score).toBe(tracker.dimensions.get('openness').score);
      expect(restored.dimensions.get('extraversion').questionCount).toBe(tracker.dimensions.get('extraversion').questionCount);
    });

    test('should handle empty state', () => {
      const emptyTracker = new ConfidenceTracker();
      const json = emptyTracker.toJSON();
      const restored = ConfidenceTracker.fromJSON(json);

      expect(restored.dimensions.size).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined dimension gracefully', () => {
      expect(tracker.needsMoreQuestions('nonexistent', 2, 85)).toBe(true);
    });

    test('should handle very high variance', () => {
      const responses = [
        { score: 0 },
        { score: 100 },
        { score: 0 },
        { score: 100 }
      ];

      const confidence = tracker.calculateConfidence(responses);
      // High variance should reduce consistency bonus significantly
      expect(confidence).toBeLessThan(80);
    });

    test('should handle negative scores gracefully', () => {
      // In case of data corruption
      tracker.updateConfidence('test', {
        questionId: 'Q1',
        score: -10,
        timestamp: new Date()
      });

      const dim = tracker.dimensions.get('test');
      expect(dim.score).toBe(-10);
      // Confidence calculation should still work
      expect(dim.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});
