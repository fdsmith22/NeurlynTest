const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Import the comprehensive report generator
const ComprehensiveReportGenerator = require('../services/comprehensive-report-generator');

// Get Assessment model
const Assessment = mongoose.model('Assessment');

// Initialize report generator
const reportGenerator = new ComprehensiveReportGenerator();

/**
 * Generate comprehensive report for completed assessment
 * POST /api/reports/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { sessionId, assessmentId } = req.body;

    // Find assessment by sessionId or assessmentId
    const assessment = await Assessment.findOne({
      $or: [{ sessionId: sessionId }, { _id: assessmentId }]
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found'
      });
    }

    if (!assessment.completionTime) {
      return res.status(400).json({
        error: 'Assessment not yet completed'
      });
    }

    // Prepare assessment data for report generation
    const assessmentData = {
      mode: assessment.mode,
      tier: assessment.tier,
      track: determineTrack(assessment),
      duration: calculateDuration(assessment),
      responses: assessment.responses,
      results: assessment.results,
      demographics: assessment.demographics,
      metadata: assessment.metadata
    };

    // Generate comprehensive report
    const report = await reportGenerator.generateComprehensiveReport(assessmentData);

    // Store report reference in assessment
    assessment.reportGenerated = true;
    assessment.reportGeneratedAt = new Date();
    assessment.reportId = report.id;
    await assessment.save();

    // Log report generation
    logger.info('Report generated', {
      sessionId: assessment.sessionId,
      reportId: report.id,
      duration: report.meta.duration
    });

    res.json({
      success: true,
      report: report,
      assessmentId: assessment._id,
      sessionId: assessment.sessionId
    });
  } catch (error) {
    logger.error('Report generation failed:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

/**
 * Get existing report
 * GET /api/reports/:sessionId
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const assessment = await Assessment.findOne({ sessionId });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found'
      });
    }

    if (!assessment.reportGenerated) {
      return res.status(404).json({
        error: 'Report not yet generated for this assessment'
      });
    }

    // Regenerate report from assessment data
    const assessmentData = {
      mode: assessment.mode,
      tier: assessment.tier,
      track: determineTrack(assessment),
      duration: calculateDuration(assessment),
      responses: assessment.responses,
      results: assessment.results,
      demographics: assessment.demographics,
      metadata: assessment.metadata
    };

    const report = await reportGenerator.generateComprehensiveReport(assessmentData);

    res.json({
      success: true,
      report: report,
      assessmentId: assessment._id,
      sessionId: assessment.sessionId
    });
  } catch (error) {
    logger.error('Failed to retrieve report:', error);
    res.status(500).json({
      error: 'Failed to retrieve report',
      message: error.message
    });
  }
});

/**
 * Export report as PDF
 * POST /api/reports/export/pdf
 */
router.post('/export/pdf', async (req, res) => {
  try {
    const { sessionId, reportData } = req.body;

    // TODO: Implement PDF generation using a library like puppeteer or jsPDF
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'PDF export functionality will be implemented soon',
      sessionId: sessionId
    });
  } catch (error) {
    logger.error('PDF export failed:', error);
    res.status(500).json({
      error: 'Failed to export PDF',
      message: error.message
    });
  }
});

/**
 * Compare multiple assessments
 * POST /api/reports/compare
 */
router.post('/compare', async (req, res) => {
  try {
    const { sessionIds, userId } = req.body;

    // Find all assessments for comparison
    const assessments = await Assessment.find({
      $or: [{ sessionId: { $in: sessionIds } }, { userId: userId }]
    }).sort({ completionTime: -1 });

    if (assessments.length < 2) {
      return res.status(400).json({
        error: 'Need at least 2 assessments to compare'
      });
    }

    // Generate comparison report
    const comparisonData = assessments.map(a => ({
      sessionId: a.sessionId,
      completionTime: a.completionTime,
      results: a.results,
      mode: a.mode
    }));

    const comparison = generateComparison(comparisonData);

    res.json({
      success: true,
      comparison: comparison,
      assessments: comparisonData.length
    });
  } catch (error) {
    logger.error('Comparison failed:', error);
    res.status(500).json({
      error: 'Failed to generate comparison',
      message: error.message
    });
  }
});

// Helper functions
function determineTrack(assessment) {
  // Determine assessment track based on responses
  const categories = assessment.responses.map(r => r.category);

  if (categories.includes('neurodiversity')) {
    return 'neurodiversity';
  } else if (categories.includes('cognitive')) {
    return 'cognitive';
  } else if (categories.includes('personality')) {
    return 'personality';
  }

  return 'comprehensive';
}

function calculateDuration(assessment) {
  if (!assessment.completionTime || !assessment.startTime) {
    return 0;
  }

  const duration = new Date(assessment.completionTime) - new Date(assessment.startTime);
  return Math.round(duration / 60000); // Convert to minutes
}

function generateComparison(assessments) {
  // Generate comparison analysis
  const comparison = {
    overview: {
      totalAssessments: assessments.length,
      dateRange: {
        earliest: assessments[assessments.length - 1].completionTime,
        latest: assessments[0].completionTime
      }
    },
    trends: {},
    changes: {},
    consistency: {}
  };

  // Analyze trends across assessments
  if (assessments[0].results && assessments[0].results.profile) {
    const traits = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];

    traits.forEach(trait => {
      const scores = assessments
        .filter(a => a.results && a.results.profile && a.results.profile[trait])
        .map(a => a.results.profile[trait]);

      if (scores.length > 0) {
        comparison.trends[trait] = {
          current: scores[0],
          previous: scores[1] || scores[0],
          change: scores[0] - (scores[1] || scores[0]),
          average: scores.reduce((a, b) => a + b, 0) / scores.length,
          variance: calculateVariance(scores)
        };
      }
    });
  }

  return comparison;
}

function calculateVariance(scores) {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / scores.length);
}

module.exports = router;
