/**
 * Test Utility: Apply Reverse Scoring to Test Responses
 *
 * For testing purposes, this maps which baseline questions are reverse scored
 * and applies the transformation to test response data
 */

const REVERSE_SCORED_BASELINE = new Set([
  'BASELINE_AGREEABLENESS_1',
  'BASELINE_CONSCIENTIOUSNESS_2',
  'BASELINE_EXTRAVERSION_2',
  'BASELINE_NEUROTICISM_2'
]);

/**
 * Apply reverse scoring to a response if the question is reverse scored
 * @param {Object} response - Response object with questionId and score
 * @returns {Object} - Response with corrected score
 */
function applyReverseScoring(response) {
  if (REVERSE_SCORED_BASELINE.has(response.questionId)) {
    return {
      ...response,
      score: 6 - response.score,
      _originalScore: response.score,
      _reversed: true
    };
  }
  return response;
}

/**
 * Apply reverse scoring to an array of responses
 * @param {Array} responses - Array of response objects
 * @returns {Array} - Responses with reverse scoring applied
 */
function applyReverseScoringToAll(responses) {
  return responses.map(applyReverseScoring);
}

module.exports = {
  REVERSE_SCORED_BASELINE,
  applyReverseScoring,
  applyReverseScoringToAll
};
