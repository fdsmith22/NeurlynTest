const QuestionBank = require('../../models/QuestionBank');

/**
 * Optimized Adaptive Assessment Engine
 * Intelligently selects questions from MongoDB based on user responses and goals
 */

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      tier = 'free',
      assessmentType = 'personality',
      previousResponses = [],
      userProfile = {},
      targetTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    } = req.body || {};

    // Define question limits by tier
    const limits = {
      quick: 15,
      free: 20,
      core: 45,
      comprehensive: 75,
      deep: 100
    };

    const totalQuestions = limits[tier] || 20;

    // Get adaptive question selection
    const selectedQuestions = await selectAdaptiveQuestions({
      tier,
      assessmentType,
      previousResponses,
      userProfile,
      targetTraits,
      totalQuestions
    });

    res.status(200).json({
      success: true,
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      tier,
      assessmentType,
      adaptiveMetadata: {
        version: '3.0',
        algorithm: 'mongodb-adaptive',
        personalizedSelection: true,
        traitCoverage: calculateTraitCoverage(selectedQuestions),
        estimatedTime: selectedQuestions.length * 0.5 // 30 seconds per question
      }
    });

  } catch (error) {
    console.error('Adaptive assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate adaptive assessment',
      message: error.message
    });
  }
};

/**
 * Intelligent question selection algorithm
 */
async function selectAdaptiveQuestions({
  tier,
  assessmentType,
  previousResponses,
  userProfile,
  targetTraits,
  totalQuestions
}) {
  const selectedQuestions = [];
  const usedQuestionIds = new Set();

  // Phase 1: Ensure balanced trait coverage (60% of questions)
  const coreQuestions = Math.floor(totalQuestions * 0.6);
  const questionsPerTrait = Math.floor(coreQuestions / targetTraits.length);

  for (const trait of targetTraits) {
    const traitQuestions = await QuestionBank.find({
      trait: trait,
      tier: { $in: getTierHierarchy(tier) },
      active: true,
      category: assessmentType
    }).limit(questionsPerTrait + 2); // Get extra for selection

    // Select best questions for this trait
    const selected = selectBestQuestions(traitQuestions, questionsPerTrait, previousResponses);
    selected.forEach(q => {
      if (!usedQuestionIds.has(q.questionId)) {
        selectedQuestions.push(formatQuestion(q));
        usedQuestionIds.add(q.questionId);
      }
    });
  }

  // Phase 2: Fill remaining slots with adaptive selections (40% of questions)
  const remainingSlots = totalQuestions - selectedQuestions.length;

  if (remainingSlots > 0) {
    // Get additional questions based on user responses and gaps
    const adaptiveQuery = buildAdaptiveQuery(previousResponses, userProfile, tier, assessmentType);
    const additionalQuestions = await QuestionBank.find({
      ...adaptiveQuery,
      questionId: { $nin: Array.from(usedQuestionIds) }
    }).limit(remainingSlots * 2); // Get extra for selection

    const selected = selectBestQuestions(additionalQuestions, remainingSlots, previousResponses);
    selected.forEach(q => {
      selectedQuestions.push(formatQuestion(q));
    });
  }

  // Phase 3: Shuffle for better user experience (but maintain some structure)
  return shuffleQuestions(selectedQuestions);
}

/**
 * Get tier hierarchy for cascading question selection
 */
function getTierHierarchy(tier) {
  const hierarchies = {
    free: ['free'],
    core: ['free', 'core'],
    comprehensive: ['free', 'core', 'comprehensive'],
    deep: ['free', 'core', 'comprehensive', 'deep']
  };
  return hierarchies[tier] || ['free', 'core'];
}

/**
 * Select best questions from a pool based on various criteria
 */
function selectBestQuestions(questionPool, targetCount, previousResponses = []) {
  if (questionPool.length <= targetCount) {
    return questionPool;
  }

  // Score questions based on multiple criteria
  const scored = questionPool.map(q => ({
    question: q,
    score: calculateQuestionScore(q, previousResponses)
  }));

  // Sort by score and select top questions
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, targetCount).map(item => item.question);
}

/**
 * Calculate question quality score for adaptive selection
 */
function calculateQuestionScore(question, previousResponses) {
  let score = 0;

  // Base quality score from weight
  score += question.weight || 1;

  // Prefer questions with good psychometric properties
  if (question.metadata?.scientificSource) score += 0.5;
  if (question.metadata?.validationStudy) score += 0.3;

  // Diversity bonus - prefer questions that cover different aspects
  if (question.subcategory) score += 0.2;

  // Avoid reverse-scored questions in early questions for better UX
  if (previousResponses.length < 5 && question.reverseScored) score -= 0.3;

  // Random factor for natural variation (10% influence)
  score += Math.random() * 0.1;

  return score;
}

/**
 * Build adaptive query based on user responses and profile
 */
function buildAdaptiveQuery(previousResponses, userProfile, tier, assessmentType) {
  const query = {
    tier: { $in: getTierHierarchy(tier) },
    active: true,
    category: assessmentType
  };

  // If user has shown signs of neurodiversity, include specialized questions
  if (hasNeurodiversityIndicators(previousResponses, userProfile)) {
    query.$or = [
      { category: assessmentType },
      { category: 'neurodiversity', tier: { $in: getTierHierarchy(tier) } }
    ];
  }

  // Add other adaptive criteria based on response patterns
  const responsePatterns = analyzeResponsePatterns(previousResponses);
  if (responsePatterns.needsMoreDetail) {
    query.subcategory = { $exists: true };
  }

  return query;
}

/**
 * Check if user responses indicate neurodiversity
 */
function hasNeurodiversityIndicators(responses, profile) {
  // Simple heuristic - in real implementation, use validated indicators
  const extremeResponses = responses.filter(r => r.value === 1 || r.value === 5).length;
  return extremeResponses / Math.max(responses.length, 1) > 0.4;
}

/**
 * Analyze response patterns for adaptive selection
 */
function analyzeResponsePatterns(responses) {
  if (responses.length < 5) {
    return { needsMoreDetail: false };
  }

  const variance = calculateResponseVariance(responses);
  return {
    needsMoreDetail: variance < 0.5, // Low variance suggests need for more nuanced questions
    hasPatterns: true
  };
}

/**
 * Calculate response variance for pattern analysis
 */
function calculateResponseVariance(responses) {
  if (responses.length === 0) return 0;

  const values = responses.map(r => r.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return variance;
}

/**
 * Format question for frontend consumption
 */
function formatQuestion(dbQuestion) {
  return {
    id: dbQuestion.questionId,
    text: dbQuestion.text,
    responseType: dbQuestion.responseType,
    category: dbQuestion.category,
    trait: dbQuestion.trait,
    subcategory: dbQuestion.subcategory,
    options: dbQuestion.options || [
      { value: 1, label: 'Strongly Disagree', score: 1 },
      { value: 2, label: 'Disagree', score: 2 },
      { value: 3, label: 'Neutral', score: 3 },
      { value: 4, label: 'Agree', score: 4 },
      { value: 5, label: 'Strongly Agree', score: 5 }
    ],
    reverseScored: dbQuestion.reverseScored,
    weight: dbQuestion.weight,
    metadata: {
      instrument: dbQuestion.instrument,
      tier: dbQuestion.tier
    }
  };
}

/**
 * Calculate trait coverage for quality assurance
 */
function calculateTraitCoverage(questions) {
  const traitCounts = {};
  questions.forEach(q => {
    if (q.trait) {
      traitCounts[q.trait] = (traitCounts[q.trait] || 0) + 1;
    }
  });
  return traitCounts;
}

/**
 * Intelligent question shuffling that maintains some structure
 */
function shuffleQuestions(questions) {
  // Don't completely randomize - keep some structure for better flow
  const chunks = [];
  const chunkSize = 5;

  for (let i = 0; i < questions.length; i += chunkSize) {
    chunks.push(questions.slice(i, i + chunkSize));
  }

  // Shuffle within chunks, then shuffle chunk order
  chunks.forEach(chunk => {
    for (let i = chunk.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chunk[i], chunk[j]] = [chunk[j], chunk[i]];
    }
  });

  // Light shuffle of chunk order
  for (let i = chunks.length - 1; i > 0; i--) {
    if (Math.random() > 0.5) { // Only shuffle 50% of the time
      const j = Math.floor(Math.random() * (i + 1));
      [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
    }
  }

  return chunks.flat();
}