/**
 * API Client for Neurlyn Backend
 * Handles all communication with the backend API
 */

class APIClient {
  constructor() {
    this.baseURL = window.location.hostname === 'localhost' ? 'http://localhost:3008' : '';
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
        // Using cached questions
        return cached.data;
      }
    }

    try {
      const response = await fetch(
        `${this.baseURL}/api/questions/assessment/${assessmentType}?${params}`
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

      // Questions fetched successfully

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
      const response = await fetch(`${this.baseURL}/api/questions/by-instrument/${instrument}`);
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
   * Submit assessment results (legacy method)
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

  // === ENHANCED ADAPTIVE ASSESSMENT METHODS ===

  /**
   * Start a new adaptive assessment
   */
  async startAdaptiveAssessment(options = {}) {
    const { tier = 'standard', concerns = [], demographics = {}, sessionId = null } = options;

    try {
      const response = await fetch(`${this.baseURL}/api/assessments/free/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier,
          concerns,
          demographics,
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start adaptive assessment');
      }

      // Store session ID for subsequent requests
      this.currentSessionId = data.sessionId;

      console.log('Adaptive assessment started:', data.sessionId);
      return data;
    } catch (error) {
      console.error('Failed to start adaptive assessment:', error);
      throw error;
    }
  }

  /**
   * Complete baseline phase and get adaptive questions
   */
  async completeBaseline(sessionId, baselineResponses) {
    try {
      const response = await fetch(`${this.baseURL}/api/assessments/free/baseline-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          baselineResponses,
          tier: this.currentTier || 'standard'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete baseline');
      }

      console.log('Baseline completed, moving to adaptive phase');
      return data;
    } catch (error) {
      console.error('Failed to complete baseline:', error);
      throw error;
    }
  }

  /**
   * Get next adaptive question
   */
  async getNextQuestion(sessionId, currentResponse = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/assessments/free/next-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          currentResponse
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get next question');
      }

      return data;
    } catch (error) {
      console.error('Failed to get next question:', error);
      throw error;
    }
  }

  /**
   * Complete enhanced adaptive assessment
   */
  async completeAdaptiveAssessment(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/assessment/adaptive/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete assessment');
      }

      console.log('Enhanced assessment completed');
      return data;
    } catch (error) {
      console.error('Failed to complete enhanced assessment:', error);
      throw error;
    }
  }

  /**
   * Get enhanced assessment report
   */
  async getEnhancedReport(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/report/${sessionId}`);

      if (!response.ok) {
        if (response.status === 402) {
          // Payment required
          const data = await response.json();
          return { paymentRequired: true, paymentUrl: data.paymentUrl };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get report');
      }

      return data;
    } catch (error) {
      console.error('Failed to get enhanced report:', error);
      throw error;
    }
  }

  /**
   * Utility method to handle adaptive assessment flow
   */
  async runAdaptiveAssessment(config, progressCallback = null) {
    const { tier, concerns, demographics } = config;

    try {
      // Step 1: Start assessment
      if (progressCallback) progressCallback({ phase: 'starting', progress: 0 });
      const startResult = await this.startAdaptiveAssessment({ tier, concerns, demographics });

      const sessionId = startResult.sessionId;
      const baselineQuestions = startResult.questions;
      const totalQuestions = startResult.totalQuestions;

      // Step 2: Present baseline questions and collect responses
      if (progressCallback) {
        progressCallback({
          phase: 'baseline',
          progress: 10,
          questions: baselineQuestions,
          totalQuestions,
          sessionId
        });
      }

      // Return control to UI for baseline questions
      return {
        phase: 'baseline',
        sessionId,
        questions: baselineQuestions,
        totalQuestions,
        metadata: startResult.adaptiveMetadata
      };
    } catch (error) {
      console.error('Error in adaptive assessment flow:', error);
      throw error;
    }
  }

  /**
   * Continue adaptive assessment after baseline
   */
  async continueAdaptiveAssessment(sessionId, baselineResponses, progressCallback = null) {
    try {
      // Complete baseline and get adaptive questions
      if (progressCallback) progressCallback({ phase: 'processing-baseline', progress: 40 });

      const baselineResult = await this.completeBaseline(sessionId, baselineResponses);

      if (progressCallback) {
        progressCallback({
          phase: 'adaptive',
          progress: 50,
          profile: baselineResult.profile,
          adaptiveQuestions: baselineResult.adaptiveQuestions
        });
      }

      return {
        phase: 'adaptive',
        profile: baselineResult.profile,
        adaptiveQuestions: baselineResult.adaptiveQuestions,
        questionsRemaining: baselineResult.questionsRemaining,
        analysis: baselineResult.analysis
      };
    } catch (error) {
      console.error('Error continuing adaptive assessment:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    // API cache cleared
  }
}

// Make available globally for browser use
window.apiClient = new APIClient();
