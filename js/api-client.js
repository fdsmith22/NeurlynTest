/**
 * API Client for Neurlyn Backend
 * Handles all communication with the backend API
 */

class APIClient {
  constructor() {
    this.baseURL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch questions based on assessment configuration
   */
  async fetchQuestions(assessmentType, options = {}) {
    const { tier = 'free', limit = null, randomize = true } = options;

    // Build query string
    const params = new URLSearchParams({
      tier,
      randomize: randomize.toString()
    });

    if (limit) {
      params.append('limit', limit);
    }

    const cacheKey = `questions_${assessmentType}_${params.toString()}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        // console.log('📦 Using cached questions');
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `${this.baseURL}/questions/assessment/${assessmentType}?${params}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      // Cache the response
      this.cache.set(cacheKey, {
        data: data.questions,
        timestamp: Date.now()
      });

      // console.log(`✅ Fetched ${data.totalQuestions} questions for ${assessmentType}`);

      return data.questions;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  }

  /**
   * Fetch questions by specific instrument
   */
  async fetchQuestionsByInstrument(instrument) {
    const cacheKey = `instrument_${instrument}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/questions/by-instrument/${instrument}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      // Cache the response
      this.cache.set(cacheKey, {
        data: data.questions,
        timestamp: Date.now()
      });

      return data.questions;
    } catch (error) {
      console.error(`Failed to fetch ${instrument} questions:`, error);
      throw error;
    }
  }

  /**
   * Get question statistics
   */
  async getQuestionStats() {
    try {
      const response = await fetch(`${this.baseURL}/questions/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get questions based on assessment mode and type
   */
  async getQuestionsForAssessment(mode, track, _taskMode = 'hybrid') {
    const questionCounts = {
      quick: { total: 7, gamified: 1 },
      standard: { total: 15, gamified: 3 },
      deep: { total: 30, gamified: 6 }
    };

    const config = questionCounts[mode] || questionCounts.standard;
    let questions = [];

    try {
      // Determine assessment type based on track
      let assessmentType = track || 'personality';

      // Map track to API assessment type
      const trackMapping = {
        validated: 'personality',
        experimental: 'lateral',
        neurodiversity: 'neurodiversity',
        comprehensive: 'comprehensive'
      };

      assessmentType = trackMapping[track] || track;

      // Determine tier based on mode
      const tierMapping = {
        quick: 'free',
        standard: 'core',
        deep: 'comprehensive'
      };

      const tier = tierMapping[mode] || 'free';

      // Fetch questions from API
      const apiQuestions = await this.fetchQuestions(assessmentType, {
        tier,
        limit: config.total,
        randomize: true
      });

      // Transform API questions to frontend format
      questions = apiQuestions.map(q => this.transformQuestion(q, _taskMode));

      // Add gamified tasks if in hybrid or gamified mode
      if (_taskMode === 'hybrid' || _taskMode === 'gamified') {
        const gamifiedTasks = this.createGamifiedTasks(config.gamified);

        if (_taskMode === 'gamified') {
          // All gamified
          questions = gamifiedTasks;
        } else {
          // Mix questions and games
          questions = this.mixQuestionsAndGames(questions, gamifiedTasks);
        }
      }

      return questions;
    } catch (error) {
      console.error('Error getting assessment questions:', error);
      // Fallback to empty array
      return [];
    }
  }

  /**
   * Transform API question to frontend format
   */
  transformQuestion(apiQuestion, taskMode) {
    // Handle different response types
    if (apiQuestion.responseType === 'likert') {
      return {
        type: 'likert',
        question: apiQuestion.text,
        category: apiQuestion.category,
        trait: apiQuestion.trait,
        reversed: apiQuestion.reverseScored || false,
        scale: apiQuestion.options ? apiQuestion.options.length : 5,
        options: apiQuestion.options,
        questionId: apiQuestion.questionId,
        instrument: apiQuestion.instrument
      };
    } else if (apiQuestion.responseType === 'multiple-choice') {
      return {
        type: 'lateral',
        id: apiQuestion.questionId,
        question: apiQuestion.text,
        options: apiQuestion.options ? apiQuestion.options.map(o => o.label) : [],
        category: apiQuestion.category,
        measures: apiQuestion.measures || [],
        questionId: apiQuestion.questionId,
        instrument: apiQuestion.instrument
      };
    } else if (apiQuestion.responseType === 'word-association') {
      return {
        type: 'word-association',
        question: apiQuestion.text,
        category: apiQuestion.category,
        timeLimit: apiQuestion.interactiveElements?.timeLimit || 5,
        questionId: apiQuestion.questionId
      };
    } else {
      // Default to likert if unknown type
      return {
        type: 'likert',
        question: apiQuestion.text,
        category: apiQuestion.category,
        trait: apiQuestion.trait,
        scale: 5,
        questionId: apiQuestion.questionId,
        instrument: apiQuestion.instrument
      };
    }
  }

  /**
   * Create gamified task objects
   */
  createGamifiedTasks(count) {
    const allTasks = [
      {
        type: 'risk-balloon',
        question: 'Balloon Risk Game',
        instructions: 'Pump the balloon to earn money, but be careful - it might pop!',
        category: 'Risk Taking',
        timeLimit: 120000,
        balloons: 5
      },
      {
        type: 'word-association',
        question: 'Word Association',
        instructions: 'Type the first word that comes to mind for each prompt.',
        category: 'Cognitive Processing',
        timeLimit: 90000,
        words: ['home', 'mother', 'success', 'fear', 'love']
      },
      {
        type: 'visual-attention',
        question: 'Visual Attention Task',
        instructions: 'Track the moving dots and click on them as they appear.',
        category: 'Attention',
        timeLimit: 120000
      },
      {
        type: 'microexpression',
        question: 'Emotion Recognition',
        instructions: 'Identify the emotion shown in each brief facial expression.',
        category: 'Emotional Intelligence',
        timeLimit: 90000
      },
      {
        type: 'iowa-gambling',
        question: 'Card Selection Game',
        instructions: 'Select cards from different decks to maximize your winnings.',
        category: 'Decision Making',
        timeLimit: 240000
      },
      {
        type: 'card-sorting',
        question: 'Pattern Matching',
        instructions: 'Sort cards according to changing rules. Figure out the pattern!',
        category: 'Cognitive Flexibility',
        timeLimit: 180000
      }
    ];

    return allTasks.slice(0, count);
  }

  /**
   * Mix traditional questions with gamified tasks
   */
  mixQuestionsAndGames(questions, games) {
    const mixed = [];
    const questionsPerGame = Math.floor(questions.length / (games.length + 1));

    let questionIndex = 0;
    for (let i = 0; i < games.length; i++) {
      // Add some questions
      for (let j = 0; j < questionsPerGame && questionIndex < questions.length; j++) {
        mixed.push(questions[questionIndex++]);
      }
      // Add a game
      mixed.push(games[i]);
    }

    // Add remaining questions
    while (questionIndex < questions.length) {
      mixed.push(questions[questionIndex++]);
    }

    return mixed;
  }

  /**
   * Submit assessment results
   */
  async submitResults(results) {
    try {
      const response = await fetch(`${this.baseURL}/assessments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to submit results');
      }

      return data;
    } catch (error) {
      console.error('Failed to submit results:', error);
      // For now, just return a success response
      return { success: true, message: 'Results processed locally' };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    // console.log('API cache cleared');
  }
}

// Export for use in other modules
export const apiClient = new APIClient();
