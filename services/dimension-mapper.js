/**
 * Dimension Mapper - Maps questions to the dimensions they measure
 * Used by ConfidenceTracker to update correct dimensions
 *
 * This utility determines which psychological dimensions (traits, facets, clinical scales)
 * a given question assesses based on its metadata.
 */

class DimensionMapper {
  /**
   * Get all dimensions measured by a question
   *
   * @param {Object} question - Question object from QuestionBank
   * @returns {Array<string>} Array of dimension names
   */
  static getDimensions(question) {
    const dimensions = [];

    // Personality traits and facets
    if (question.category === 'personality') {
      // Add trait dimension
      if (question.trait) {
        dimensions.push(question.trait.toLowerCase());
      }

      // Add facet dimension (trait.facet format)
      if (question.trait && question.facet) {
        dimensions.push(`${question.trait.toLowerCase()}_${question.facet.toLowerCase()}`);
      }
    }

    // Clinical psychopathology scales
    if (question.category === 'clinical_psychopathology') {
      // Map based on tags
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();

          // Map clinical tags to dimensions
          if (['depression', 'anxiety', 'mania', 'psychosis', 'borderline', 'somatic'].includes(tagLower)) {
            dimensions.push(tagLower);
          }

          // Substance use
          if (tagLower.includes('substance') || tagLower === 'alcohol' || tagLower === 'drug') {
            dimensions.push('substance_use');
          }

          // PTSD/Trauma
          if (tagLower === 'ptsd' || tagLower === 'trauma') {
            dimensions.push('ptsd');
          }

          // OCD
          if (tagLower === 'ocd') {
            dimensions.push('ocd');
          }
        });
      }

      // Map based on instrument
      if (question.instrument) {
        const instrumentMap = {
          'PHQ-9': 'depression',
          'GAD-7': 'anxiety',
          'MDQ': 'mania',
          'PQ-B': 'psychosis',
          'MSI-BPD': 'borderline',
          'PHQ-15': 'somatic',
          'AUDIT': 'substance_use',
          'DAST': 'substance_use'
        };

        const dimension = instrumentMap[question.instrument];
        if (dimension && !dimensions.includes(dimension)) {
          dimensions.push(dimension);
        }
      }
    }

    // Neurodiversity
    if (question.category === 'neurodiversity') {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();

          if (tagLower === 'adhd') {
            dimensions.push('adhd');
          }
          if (tagLower === 'autism') {
            dimensions.push('autism');
          }
          if (tagLower === 'executive_function') {
            dimensions.push('executive_function');
          }
          if (tagLower === 'sensory' || tagLower === 'sensory_processing') {
            dimensions.push('sensory_processing');
          }
          if (tagLower === 'masking') {
            dimensions.push('masking');
          }
        });
      }

      // Fallback based on subcategory
      if (dimensions.length === 0 && question.subcategory) {
        const subcategory = question.subcategory.toLowerCase();
        if (['adhd', 'autism', 'executive_function', 'sensory_processing'].includes(subcategory)) {
          dimensions.push(subcategory);
        }
      }
    }

    // Attachment
    if (question.category === 'attachment') {
      dimensions.push('attachment');

      // Specific attachment dimensions
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes('anxious')) {
            dimensions.push('attachment_anxiety');
          }
          if (tagLower.includes('avoidant')) {
            dimensions.push('attachment_avoidance');
          }
        });
      }
    }

    // Trauma screening
    if (question.category === 'trauma_screening') {
      dimensions.push('trauma');

      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (tagLower === 'aces') {
            dimensions.push('aces');
          }
          if (tagLower === 'complex_ptsd') {
            dimensions.push('complex_ptsd');
          }
        });
      }
    }

    // Cognitive functions
    if (question.category === 'cognitive_functions' || question.category === 'cognitive') {
      dimensions.push('cognitive');
    }

    // Remove duplicates and return
    return [...new Set(dimensions)];
  }

  /**
   * Check if question measures a specific dimension
   *
   * @param {Object} question - Question object
   * @param {string} dimension - Dimension name to check
   * @returns {boolean} True if question measures this dimension
   */
  static measuresDimension(question, dimension) {
    const dimensions = this.getDimensions(question);
    return dimensions.includes(dimension.toLowerCase());
  }

  /**
   * Get primary dimension for a question (first/most important)
   *
   * @param {Object} question - Question object
   * @returns {string|null} Primary dimension name or null
   */
  static getPrimaryDimension(question) {
    const dimensions = this.getDimensions(question);
    return dimensions.length > 0 ? dimensions[0] : null;
  }

  /**
   * Group questions by dimension
   *
   * @param {Array<Object>} questions - Array of question objects
   * @returns {Object} Questions grouped by dimension
   */
  static groupByDimension(questions) {
    const grouped = {};

    questions.forEach(question => {
      const dimensions = this.getDimensions(question);

      dimensions.forEach(dim => {
        if (!grouped[dim]) {
          grouped[dim] = [];
        }
        grouped[dim].push(question);
      });
    });

    return grouped;
  }

  /**
   * Get all possible dimensions (for initialization)
   *
   * @returns {Array<string>} Array of all dimension names
   */
  static getAllDimensions() {
    return [
      // Big Five personality traits
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',

      // Clinical psychopathology
      'depression',
      'anxiety',
      'mania',
      'psychosis',
      'borderline',
      'somatic',
      'substance_use',
      'ptsd',
      'ocd',

      // Neurodiversity
      'adhd',
      'autism',
      'executive_function',
      'sensory_processing',
      'masking',

      // Attachment
      'attachment',
      'attachment_anxiety',
      'attachment_avoidance',

      // Trauma
      'trauma',
      'aces',
      'complex_ptsd',

      // Cognitive
      'cognitive'
    ];
  }

  /**
   * Check if dimension is a Big Five trait
   *
   * @param {string} dimension - Dimension name
   * @returns {boolean} True if Big Five trait
   */
  static isBigFiveTrait(dimension) {
    const bigFive = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    return bigFive.includes(dimension.toLowerCase());
  }

  /**
   * Check if dimension is a clinical scale
   *
   * @param {string} dimension - Dimension name
   * @returns {boolean} True if clinical scale
   */
  static isClinicalScale(dimension) {
    const clinical = ['depression', 'anxiety', 'mania', 'psychosis', 'borderline', 'somatic', 'substance_use', 'ptsd', 'ocd'];
    return clinical.includes(dimension.toLowerCase());
  }

  /**
   * Check if dimension is neurodiversity-related
   *
   * @param {string} dimension - Dimension name
   * @returns {boolean} True if neurodiversity dimension
   */
  static isNeurodiversityDimension(dimension) {
    const neurodiversity = ['adhd', 'autism', 'executive_function', 'sensory_processing', 'masking'];
    return neurodiversity.includes(dimension.toLowerCase());
  }

  /**
   * Get human-readable name for dimension
   *
   * @param {string} dimension - Dimension name
   * @returns {string} Display name
   */
  static getDisplayName(dimension) {
    const displayNames = {
      // Big Five
      'openness': 'Openness to Experience',
      'conscientiousness': 'Conscientiousness',
      'extraversion': 'Extraversion',
      'agreeableness': 'Agreeableness',
      'neuroticism': 'Emotional Stability',

      // Clinical
      'depression': 'Depression',
      'anxiety': 'Anxiety',
      'mania': 'Mania/Hypomania',
      'psychosis': 'Psychosis Risk',
      'borderline': 'Borderline Features',
      'somatic': 'Somatic Symptoms',
      'substance_use': 'Substance Use',
      'ptsd': 'PTSD',
      'ocd': 'OCD',

      // Neurodiversity
      'adhd': 'ADHD',
      'autism': 'Autism',
      'executive_function': 'Executive Function',
      'sensory_processing': 'Sensory Processing',
      'masking': 'Neurodivergent Masking',

      // Attachment
      'attachment': 'Attachment Style',
      'attachment_anxiety': 'Attachment Anxiety',
      'attachment_avoidance': 'Attachment Avoidance',

      // Trauma
      'trauma': 'Trauma',
      'aces': 'Adverse Childhood Experiences',
      'complex_ptsd': 'Complex PTSD',

      // Cognitive
      'cognitive': 'Cognitive Function'
    };

    return displayNames[dimension.toLowerCase()] || dimension;
  }
}

module.exports = DimensionMapper;
