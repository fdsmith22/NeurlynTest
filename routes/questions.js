const express = require('express');
const router = express.Router();
const QuestionBank = require('../models/QuestionBank');
const logger = require('../utils/logger');

/**
 * GET /api/questions/assessment/:type
 * Retrieve questions based on assessment type
 */
router.get('/assessment/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { tier = 'free', limit, randomize = 'true' } = req.query;

    logger.info(`Fetching questions for assessment type: ${type}, tier: ${tier}`);

    // Map assessment types to database categories
    const typeMapping = {
      personality: { category: 'personality' },
      neurodiversity: { category: 'neurodiversity' },
      lateral: { category: 'lateral' },
      cognitive: { category: 'cognitive' },
      comprehensive: {
        category: { $in: ['personality', 'neurodiversity', 'lateral', 'cognitive'] }
      }
    };

    if (!typeMapping[type]) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid assessment type. Valid types: personality, neurodiversity, lateral, cognitive, comprehensive'
      });
    }

    // Build query based on type and tier
    let query = {
      ...typeMapping[type],
      active: true
    };

    // Add tier filtering
    const tierHierarchy = {
      free: ['free'],
      core: ['free', 'core'],
      comprehensive: ['free', 'core', 'comprehensive'],
      specialized: ['free', 'core', 'comprehensive', 'specialized']
    };

    if (tierHierarchy[tier]) {
      query.tier = { $in: tierHierarchy[tier] };
    }

    let questions = await QuestionBank.find(query).select('-__v -createdAt -updatedAt').lean();

    // Randomize if requested
    if (randomize === 'true' && questions.length > 0) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Apply limit if specified
    if (limit && !isNaN(limit)) {
      questions = questions.slice(0, parseInt(limit));
    }

    // Group questions by trait/category for comprehensive assessments
    let response = {
      success: true,
      assessmentType: type,
      tier: tier,
      totalQuestions: questions.length,
      questions: questions
    };

    // Add grouping for comprehensive assessment
    if (type === 'comprehensive') {
      const grouped = {
        personality: questions.filter(q => q.category === 'personality'),
        neurodiversity: questions.filter(q => q.category === 'neurodiversity'),
        lateral: questions.filter(q => q.category === 'lateral'),
        cognitive: questions.filter(q => q.category === 'cognitive')
      };

      response.groupedQuestions = grouped;
      response.breakdown = {
        personality: grouped.personality.length,
        neurodiversity: grouped.neurodiversity.length,
        lateral: grouped.lateral.length,
        cognitive: grouped.cognitive.length
      };
    }

    // Add trait breakdown for personality assessments
    if (type === 'personality') {
      const traits = [
        'openness',
        'conscientiousness',
        'extraversion',
        'agreeableness',
        'neuroticism'
      ];
      const traitBreakdown = {};

      traits.forEach(trait => {
        traitBreakdown[trait] = questions.filter(q => q.trait === trait).length;
      });

      response.traitBreakdown = traitBreakdown;
    }

    res.json(response);
  } catch (error) {
    logger.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * GET /api/questions/by-instrument/:instrument
 * Retrieve questions by specific instrument
 */
router.get('/by-instrument/:instrument', async (req, res) => {
  try {
    const { instrument } = req.params;

    const questions = await QuestionBank.find({
      instrument: instrument.toUpperCase(),
      active: true
    })
      .select('-__v -createdAt -updatedAt')
      .lean();

    res.json({
      success: true,
      instrument: instrument,
      totalQuestions: questions.length,
      questions: questions
    });
  } catch (error) {
    logger.error('Error fetching questions by instrument:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
});

/**
 * GET /api/questions/stats
 * Get statistics about available questions
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await QuestionBank.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              instrument: '$instrument',
              tier: '$tier'
            }
          }
        }
      }
    ]);

    const categoryBreakdown = await QuestionBank.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: {
            category: '$category',
            tier: '$tier'
          },
          count: { $sum: 1 },
          instruments: { $addToSet: '$instrument' }
        }
      }
    ]);

    const instrumentBreakdown = await QuestionBank.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$instrument',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    res.json({
      success: true,
      totalQuestions: stats[0]?.total || 0,
      categoryBreakdown: categoryBreakdown,
      instrumentBreakdown: instrumentBreakdown
    });
  } catch (error) {
    logger.error('Error fetching question stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
