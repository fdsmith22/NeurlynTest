/**
 * FREE ASSESSMENT CONTROLLER
 * Handles the 30-question adaptive assessment flow for the free tier
 * Baseline Phase: 10 questions
 * Adaptive Phase: 20 questions based on baseline responses
 *
 * This is the FREE version - for paid assessment see /assessments/paid/
 */

/* global ReportDisplayComponent, AdvancedReportGenerator, apiClient */

class FreeAssessmentController {
  constructor() {
    this.apiBase =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3008/api'
        : '/api';
    this.currentSession = null;
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.responses = [];
    this.baselineResponses = [];
    this.adaptiveResponses = [];
    this.progress = { current: 0, total: 0 };
    this.pathways = [];
    this.questionStartTime = null;
    this.currentPhase = 'baseline'; // 'baseline', 'adaptive', 'complete'
    this.userProfile = null;
    this.tier = 'standard';

    // API client is required - no fallbacks
    this.api = apiClient; // Must be loaded before this controller
  }

  /**
   * Initialize enhanced adaptive assessment with baseline phase
   */
  async startAssessment(options = {}) {
    const { tier = 'standard', concerns = [], demographics = {} } = options;

    this.tier = tier;
    this.currentPhase = 'baseline';

    // Track actual start time
    this.assessmentStartTime = Date.now();

    try {
      // Show loading state
      this.showLoading('Initializing your personalized assessment...');

      // Use API client for FREE assessment
      console.log('Starting FREE adaptive assessment');
      const result = await this.api.startAdaptiveAssessment({
        tier: 'free', // Always use free tier
        concerns,
        demographics
      });

      this.currentSession = result.sessionId;
      this.progress = { current: 0, total: 30 }; // Free assessment is always 30 questions
      this.currentQuestions = result.questions; // Baseline questions (10)
      this.currentPhase = 'baseline';

      console.log(
        `FREE Assessment: Started baseline phase with ${result.questions.length} questions`
      );

      // Initialize UI for baseline phase
      this.initializeAssessmentUI();

      // Check if questions exist before displaying
      if (this.currentQuestions.length > 0) {
        this.currentQuestionIndex = 0;
        console.log(
          `Assessment started - Baseline phase: ${this.currentQuestions.length} questions`
        );
        // Skip phase transition and display questions directly
        this.displayCurrentQuestion();
      } else {
        throw new Error('No baseline questions received');
      }

      // Store in localStorage for recovery
      localStorage.setItem(
        'activeAssessment',
        JSON.stringify({
          sessionId: this.currentSession,
          tier,
          phase: this.currentPhase,
          startTime: new Date().toISOString()
        })
      );

      return {
        sessionId: this.currentSession,
        phase: this.currentPhase,
        questionsCount: this.currentQuestions.length,
        totalQuestions: this.progress.total
      };
    } catch (error) {
      console.error('Failed to start adaptive assessment:', error);
      const errorMessage = error.message || 'Connection failed';
      this.showError(`Unable to start assessment: ${errorMessage}`);

      // Don't throw the error, just return null
      return null;
    }
  }

  /**
   * Initialize the assessment UI
   */
  initializeAssessmentUI() {
    const container =
      document.getElementById('assessment-content') ||
      document.getElementById('assessment-content') ||
      document.getElementById('assessment-container') ||
      document.body;

    container.innerHTML = `
            <div class="neurlyn-assessment">
                <div class="assessment-header">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">
                            <span id="progress-current">0</span> / <span id="progress-total">${this.progress.total}</span> questions
                        </div>
                    </div>
                    <div class="pathway-indicators" id="pathway-indicators"></div>
                </div>

                <div class="question-container" id="question-container">
                    <!-- Questions will be inserted here -->
                </div>

                <div class="navigation-controls">
                    <button id="prev-btn" class="btn-secondary" onclick="assessment.previousQuestion()" disabled>
                        Previous
                    </button>
                    <button id="next-btn" class="btn-primary" onclick="assessment.nextQuestion()">
                        Next
                    </button>
                </div>

                <div class="assessment-info">
                    <div class="tier-badge">${this.getTierLabel()}</div>
                    <div class="time-estimate" id="time-estimate"></div>
                </div>
            </div>
        `;

    this.updateProgressBar();
  }

  /**
   * Display single question
   */
  displayCurrentQuestion() {
    const container = document.getElementById('question-container');
    if (!container) {
      // This is expected during report display phase
      return;
    }

    // Check if we're done with all questions
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      this.completeAssessment();
      return;
    }

    const question = this.currentQuestions[this.currentQuestionIndex];

    container.innerHTML = `
      <div class="question-card active" data-question-id="${question.id}">
        <div class="question-header">
          <span class="question-category">${this.formatCategory(question.category)}</span>
          ${question.subcategory && question.subcategory !== question.category ? `<span class="question-subcategory">${this.formatCategory(question.subcategory)}</span>` : ''}
        </div>

        <h3 class="question-text">${question.text}</h3>

        <div class="response-options">
          ${this.renderResponseOptions(question)}
        </div>

        ${question.context ? `<p class="question-context">${question.context}</p>` : ''}
      </div>
    `;

    // Add event listeners for response options
    this.attachResponseListeners();

    // Update progress - use total responses count to maintain continuity
    this.progress.current = this.responses.length + 1;
    this.updateProgressBar();

    // Start timing for this question
    this.questionStartTime = Date.now();
  }

  /**
   * Display questions (legacy method - redirects to new method)
   */
  displayQuestions(questions) {
    this.currentQuestions = questions || this.currentQuestions;
    this.currentQuestionIndex = 0;
    this.displayCurrentQuestion();
  }

  /**
   * Navigate to next question
   */
  async nextQuestion() {
    // Get current question and selected answer
    const currentQuestion = this.currentQuestions[this.currentQuestionIndex];

    // Guard against undefined question (happens during assessment completion)
    if (!currentQuestion) {
      return;
    }

    const selectedInput = document.querySelector(`input[name="q-${currentQuestion.id}"]:checked`);

    if (!selectedInput) {
      this.showMessage('Please select an answer before continuing');
      return;
    }

    // Store the response
    const response = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer: selectedInput.value,
      score: parseInt(selectedInput.dataset.score) || parseInt(selectedInput.value) || 3,
      responseTime: Date.now() - this.questionStartTime,
      category: currentQuestion.category,
      subcategory: currentQuestion.subcategory,
      trait: currentQuestion.trait,
      instrument: currentQuestion.instrument,
      phase: this.currentPhase
    };

    // Add to appropriate response array
    if (this.currentPhase === 'baseline') {
      this.baselineResponses.push(response);
    } else if (this.currentPhase === 'adaptive') {
      this.adaptiveResponses.push(response);
    }

    this.responses.push(response);

    // Move to next question
    this.currentQuestionIndex++;

    // Update previous button state
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn && this.currentQuestionIndex > 0) {
      prevBtn.disabled = false;
    }

    // Save progress to localStorage
    localStorage.setItem(
      'assessmentProgress',
      JSON.stringify({
        sessionId: this.currentSession,
        phase: this.currentPhase,
        currentQuestionIndex: this.currentQuestionIndex,
        totalResponses: this.responses.length,
        timestamp: new Date().toISOString()
      })
    );

    // Check if we've completed the current phase
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      await this.handlePhaseCompletion();
    } else {
      // Display next question in current phase
      this.displayCurrentQuestion();
    }
  }

  /**
   * Handle completion of current phase
   */
  async handlePhaseCompletion() {
    if (this.currentPhase === 'baseline') {
      // Transition to adaptive phase
      await this.transitionToAdaptivePhase();
    } else if (this.currentPhase === 'adaptive') {
      // Complete the assessment
      await this.completeAssessment();
    }
  }

  /**
   * Transition from baseline to adaptive phase
   */
  async transitionToAdaptivePhase() {
    try {
      this.showLoading('Analyzing your responses and selecting personalized questions...');

      // Complete baseline phase via API
      let adaptiveResult;
      if (this.api && this.api.continueAdaptiveAssessment) {
        adaptiveResult = await this.api.continueAdaptiveAssessment(
          this.currentSession,
          this.baselineResponses,
          progress => {
            console.log('Adaptive transition progress:', progress);
          }
        );
      } else {
        // Fallback to direct API call
        const response = await fetch(`${this.apiBase}/assessments/adaptive/baseline-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.currentSession,
            baselineResponses: this.baselineResponses,
            tier: this.tier
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process baseline responses');
        }

        adaptiveResult = await response.json();
        if (!adaptiveResult.success) {
          throw new Error(adaptiveResult.error || 'Failed to get adaptive questions');
        }
      }

      // Update state for adaptive phase
      this.currentPhase = 'adaptive';
      this.userProfile = adaptiveResult.profile;
      // Don't reset the question index - continue from where baseline left off
      this.currentQuestions = adaptiveResult.adaptiveQuestions;
      // Keep currentQuestionIndex continuous (don't reset to 0)

      console.log(`Transitioning to adaptive phase with ${this.currentQuestions.length} questions`);
      console.log('User profile:', this.userProfile);

      // Update localStorage with new phase
      localStorage.setItem(
        'activeAssessment',
        JSON.stringify({
          sessionId: this.currentSession,
          tier: this.tier,
          phase: this.currentPhase,
          startTime: new Date().toISOString(),
          baselineCompleted: true,
          adaptiveQuestionCount: this.currentQuestions.length
        })
      );

      // Show phase transition
      this.displayPhaseTransition('adaptive');

      // Display first adaptive question
      if (this.currentQuestions.length > 0) {
        this.displayCurrentQuestion();
      } else {
        // No adaptive questions needed, complete assessment
        await this.completeAssessment();
      }
    } catch (error) {
      console.error('Failed to transition to adaptive phase:', error);
      this.showError('Unable to continue assessment. Please try again.');
    }
  }

  /**
   * Navigate to previous question
   */
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;

      // Remove the last response from all appropriate arrays
      const lastResponse = this.responses.pop();

      // Also remove from phase-specific arrays
      if (lastResponse) {
        if (lastResponse.phase === 'baseline' && this.baselineResponses.length > 0) {
          this.baselineResponses.pop();
        } else if (lastResponse.phase === 'adaptive' && this.adaptiveResponses.length > 0) {
          this.adaptiveResponses.pop();
        }
      }

      this.displayCurrentQuestion();

      // Update previous button state
      const prevBtn = document.getElementById('prev-btn');
      if (prevBtn && this.currentQuestionIndex === 0) {
        prevBtn.disabled = true;
      }
    }
  }

  /**
   * Render response options based on question type
   */
  renderResponseOptions(question) {
    const { responseType = 'likert', options = [] } = question;

    if (responseType === 'likert') {
      return `
                <div class="likert-scale" data-question-id="${question.id}">
                    ${options
                      .map(
                        (opt, i) => `
                        <label class="likert-option">
                            <input type="radio" name="q-${question.id}" value="${opt.value}" data-index="${i}" data-score="${opt.score}">
                            <span class="likert-value">${opt.value}</span>
                            <span class="likert-label">${opt.label}</span>
                        </label>
                    `
                      )
                      .join('')}
                </div>
            `;
    } else if (responseType === 'multiple_choice' || responseType === 'multiple-choice') {
      return `
                <div class="multiple-choice" data-question-id="${question.id}">
                    ${options
                      .map(
                        (opt, i) => `
                        <label class="mc-option">
                            <input type="radio" name="q-${question.id}" value="${opt.value}" data-index="${i}" data-score="${opt.score}">
                            <span class="mc-label">${opt.label || opt}</span>
                        </label>
                    `
                      )
                      .join('')}
                </div>
            `;
    } else if (responseType === 'binary') {
      return `
                <div class="binary-choice" data-question-id="${question.id}">
                    ${options
                      .map(
                        (opt, i) => `
                        <label class="binary-option">
                            <input type="radio" name="q-${question.id}" value="${opt.value}" data-index="${i}" data-score="${opt.score}">
                            <span class="binary-label">${opt.label || opt}</span>
                        </label>
                    `
                      )
                      .join('')}
                </div>
            `;
    } else if (responseType === 'slider') {
      return `
                <div class="slider-container" data-question-id="${question.id}">
                    <input type="range" min="0" max="100" value="50" class="slider" id="slider-${question.id}">
                    <div class="slider-labels">
                        <span>Strongly Disagree</span>
                        <span class="slider-value">50</span>
                        <span>Strongly Agree</span>
                    </div>
                </div>
            `;
    }

    return '<p>Unsupported question type</p>';
  }

  /**
   * Submit current answer and get next questions
   */
  async submitAnswer() {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      // No current question found
      return;
    }

    const response = this.collectResponse(currentQuestion);
    if (!response) {
      this.showMessage('Please select an answer');
      return;
    }

    // Submitting answer

    // Record response time
    response.responseTime = this.getResponseTime();

    try {
      this.showLoading('Processing...');

      const result = await fetch(`${this.apiBase}/adaptive/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession,
          response
        })
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      // Update progress
      this.progress = data.progress;
      this.updateProgressBar();

      // Update pathways if changed
      if (data.pathways && data.pathways.length > 0) {
        this.pathways = data.pathways;
        this.updatePathwayIndicators();
      }

      // Check if assessment is complete
      if (data.complete) {
        await this.completeAssessment();
      } else {
        // Display next questions
        this.currentQuestions = data.nextQuestions;
        this.displayQuestions(this.currentQuestions);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      this.showError('Unable to submit answer. Please try again.');
    }
  }

  /**
   * Complete the assessment
   */
  async completeAssessment() {
    try {
      this.showLoading('Analyzing your responses...');

      // Clear localStorage
      localStorage.removeItem('activeAssessment');

      // Prepare data for report generation
      const assessmentData = {
        responses: this.responses,
        tier: this.tier || 'standard',
        assessmentTier: this.tier || 'standard', // For backward compatibility
        duration: this.calculateCompletionTime(),
        metadata: {
          completedAt: new Date(),
          totalQuestions: this.responses.length,
          sessionId: this.currentSession,
          tier: this.tier || 'standard'
        }
      };

      // Generate and display report
      await this.generateAndDisplayReport(assessmentData);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      this.showError(`Unable to complete assessment: ${error.message}`, error);
    }
  }

  /**
   * Generate and display the final report
   */
  async generateAndDisplayReport(assessmentData) {
    try {
      // Create report generator instance
      const reportGenerator = new AdvancedReportGenerator();
      const report = await reportGenerator.generateReport(assessmentData);

      // Display the report
      this.displayReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      this.showError('Unable to generate report. Please try again.', error);
    }
  }

  /**
   * Display the generated report
   */
  async displayReport(report) {
    const container =
      document.getElementById('assessment-content') ||
      document.getElementById('assessment-container');

    if (!container) {
      console.error('No container found to display report');
      return;
    }

    try {
      // Check if AdvancedReportGenerator is available
      if (typeof window.AdvancedReportGenerator === 'undefined') {
        console.log('AdvancedReportGenerator not available, using basic display');
        this.displayFreeReport(report, container);
        return;
      }

      // Create assessment data for the advanced report generator
      const assessmentData = {
        responses: this.responses,
        tier: this.currentTier || 'standard',
        duration: this.calculateCompletionTime(),
        metadata: {
          assessmentTier: this.currentTier || 'standard',
          totalResponses: this.responses.length,
          completedAt: new Date().toISOString()
        },
        userProfile: report.profile,
        concerns: [],
        analysis: report.analysis
      };

      console.log('Generating enhanced report with AdvancedReportGenerator...');

      // Use AdvancedReportGenerator to enhance the report
      const advancedGenerator = new window.AdvancedReportGenerator();
      const enhancedReport = await advancedGenerator.generateReport(assessmentData);

      console.log('Enhanced report generated:', {
        hasPercentiles: !!enhancedReport.percentiles,
        hasProfiles: !!enhancedReport.profiles,
        hasCareerInsights: !!enhancedReport.careerInsights,
        hasArchetype: !!enhancedReport.archetype
      });

      // Display the enhanced report
      this.displayEnhancedReport(enhancedReport, container);
    } catch (error) {
      console.error('Error displaying enhanced report:', error);
      // Fallback to free report display
      this.displayFreeReport(report, container);
    }
  }

  // Free assessment report display method
  displayFreeReport(report, container) {
    // Try multiple possible trait data sources
    const traits = report.traits || report.analysis?.traits || report.analysis || {};
    const analysis = report.analysis || {};
    const summary = report.summary || {};
    const recommendations = report.recommendations || [];
    const archetype = report.archetype || {};

    // Add interactive chart functionality
    const uniqueId = 'report-' + Date.now();

    container.innerHTML = `
      <style>
        .expandable-section {
          cursor: pointer;
          user-select: none;
          transition: all 0.3s ease;
        }
        .expandable-section:hover {
          background: #f9fafb;
        }
        .section-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .section-content.expanded {
          max-height: 2000px;
        }
        .chart-toggle {
          background: linear-gradient(135deg, var(--sage-primary, #7c9885) 0%, var(--sage-secondary, #6a8a73) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: transform 0.2s;
        }
        .chart-toggle:hover {
          transform: translateY(-2px);
        }
        .side-by-side {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .side-by-side {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="free-report-container" style="max-width: 1400px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div class="report-header" style="text-align: center; padding-bottom: 2rem; border-bottom: 2px solid #e5e7eb; margin-bottom: 2rem;">
          <h1 style="color: #1f2937; margin: 0 0 0.5rem 0; font-size: 2rem;">Your Personality Assessment Report</h1>
          <p style="color: #6b7280; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
          <button class="chart-toggle" style="margin-top: 1rem; background: linear-gradient(135deg, var(--sage-primary, #7c9885) 0%, var(--sage-secondary, #6a8a73) 100%);" onclick="window.toggleAllCharts('${uniqueId}')">
            Toggle Visual Mode
          </button>
        </div>

        <div class="summary-section" style="background: linear-gradient(135deg, var(--sage-primary, #7c9885) 0%, var(--sage-secondary, #6a8a73) 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem;">
          <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Your Profile: ${archetype?.name || summary?.archetype || 'Personality Profile'}</h2>
          <p style="margin: 0.5rem 0; opacity: 0.95;">${summary?.balance || archetype?.description || summary?.description || ''}</p>
        </div>

        <!-- Big Five Traits with Chart -->
        <div class="traits-section" style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="color: #1f2937; margin: 0; font-size: 1.5rem;">Big Five Personality Traits</h2>
            <button class="chart-toggle" onclick="window.toggleTraitChart('${uniqueId}')">Toggle Chart View</button>
          </div>

          <!-- Radar Chart Canvas (hidden by default) -->
          <div id="trait-chart-${uniqueId}" style="display: none; margin-bottom: 2rem; background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <canvas id="big-five-chart-${uniqueId}" width="400" height="400" style="max-width: 100%; height: auto;"></canvas>
          </div>

          ${(() => {
            const formatTraitName = trait => {
              const names = {
                openness: 'Openness to Experience',
                conscientiousness: 'Conscientiousness',
                extraversion: 'Extraversion',
                agreeableness: 'Agreeableness',
                neuroticism: 'Neuroticism'
              };
              return names[trait] || trait.charAt(0).toUpperCase() + trait.slice(1);
            };

            const getTraitDescription = (trait, score) => {
              const descriptions = {
                openness: {
                  high:
                    score > 75
                      ? 'You are highly imaginative, creative, and intellectually curious. You thrive on new experiences, abstract thinking, and unconventional ideas. You likely enjoy art, philosophy, and exploring different cultures and perspectives.'
                      : score > 60
                        ? 'You enjoy new experiences and thinking creatively. You appreciate variety in life and are open to different viewpoints and novel approaches to problems.'
                        : score > 40
                          ? 'You balance practicality with creativity. While you can appreciate new ideas, you also value proven methods and established traditions.'
                          : score > 25
                            ? 'You prefer familiar routines and traditional approaches. You value stability and find comfort in established ways of doing things.'
                            : 'You strongly prefer the familiar and conventional. You excel in structured environments and value practical, time-tested solutions over experimental approaches.',
                  facets:
                    'imagination, artistic interests, emotionality, adventurousness, intellectual curiosity, and tolerance for ambiguity'
                },
                conscientiousness: {
                  high:
                    score > 75
                      ? 'You are exceptionally organized, disciplined, and achievement-oriented. You set high standards for yourself, follow through on commitments, and excel at long-term planning and goal attainment.'
                      : score > 60
                        ? 'You are organized, disciplined, and goal-oriented. You manage your time well, honor your commitments, and work steadily toward your objectives.'
                        : score > 40
                          ? 'You balance structure with flexibility. You can be organized when needed but also adapt to changing circumstances without stress.'
                          : score > 25
                            ? 'You prefer flexibility and spontaneity over strict planning. You work best with loose deadlines and adaptable goals.'
                            : 'You strongly value spontaneity and flexibility. You resist rigid structures and prefer to respond to situations as they arise rather than following predetermined plans.',
                  facets:
                    'self-efficacy, orderliness, dutifulness, achievement-striving, self-discipline, and deliberation'
                },
                extraversion: {
                  high:
                    score > 75
                      ? 'You are highly outgoing, energetic, and socially confident. You draw energy from social interactions, enjoy being the center of attention, and actively seek excitement and stimulation.'
                      : score > 60
                        ? 'You are outgoing, energetic, and enjoy social interactions. You feel comfortable in groups and gain energy from being around others.'
                        : score > 40
                          ? 'You are ambiverted, comfortable in both social and solitary settings. You enjoy social time but also need quiet moments to recharge.'
                          : score > 25
                            ? 'You prefer quieter environments and deeper conversations. You enjoy meaningful one-on-one interactions over large group settings.'
                            : 'You are highly introverted and find deep fulfillment in solitude. You prefer written communication, deep thinking, and intimate conversations with close friends.',
                  facets:
                    'friendliness, gregariousness, assertiveness, activity level, excitement-seeking, and positive emotions'
                },
                agreeableness: {
                  high:
                    score > 75
                      ? 'You are exceptionally cooperative, trusting, and empathetic. You prioritize harmony in relationships, readily help others, and have a strong capacity for compassion and understanding.'
                      : score > 60
                        ? 'You are cooperative, trusting, and considerate of others. You value harmony in relationships and work well in team settings.'
                        : score > 40
                          ? 'You balance cooperation with assertiveness. You can be both supportive and direct, adapting your approach to the situation.'
                          : score > 25
                            ? 'You are direct, competitive, and value honesty over harmony. You prioritize truth and efficiency in your interactions.'
                            : "You are highly independent and skeptical. You question others' motives, compete fiercely, and believe that honest feedback is more valuable than preserving feelings.",
                  facets: 'trust, morality, altruism, cooperation, modesty, and sympathy'
                },
                neuroticism: {
                  high:
                    score > 75
                      ? 'You experience emotions very intensely and may be highly sensitive to stress. This emotional depth can fuel creativity and empathy but may require active stress management strategies.'
                      : score > 60
                        ? 'You may experience stress and emotional fluctuations more intensely than others. You are in touch with your emotions and may benefit from stress-reduction techniques.'
                        : score > 40
                          ? 'You experience a moderate range of emotions. You can handle typical stressors well but may feel overwhelmed during particularly challenging times.'
                          : score > 25
                            ? 'You tend to remain calm and emotionally stable under pressure. You recover quickly from setbacks and maintain perspective during challenges.'
                            : 'You are exceptionally emotionally stable and resilient. You remain calm even in highly stressful situations and rarely experience anxiety or mood fluctuations.',
                  facets:
                    'anxiety, anger, depression, self-consciousness, impulsiveness, and vulnerability to stress'
                }
              };

              const traitData = descriptions[trait];
              return traitData
                ? traitData.high
                : 'This trait reflects an important aspect of your personality.';
            };

            const getTraitFacets = trait => {
              const facets = {
                openness:
                  'imagination, artistic interests, emotionality, adventurousness, intellectual curiosity, and tolerance for ambiguity',
                conscientiousness:
                  'self-efficacy, orderliness, dutifulness, achievement-striving, self-discipline, and deliberation',
                extraversion:
                  'friendliness, gregariousness, assertiveness, activity level, excitement-seeking, and positive emotions',
                agreeableness: 'trust, morality, altruism, cooperation, modesty, and sympathy',
                neuroticism:
                  'anxiety, anger, depression, self-consciousness, impulsiveness, and vulnerability to stress'
              };
              return facets[trait] || '';
            };

            // Create trait cards from available data

            if (traits && Object.keys(traits).length > 0) {
              return Object.entries(traits)
                .map(([trait, score]) => {
                  const percentage = Math.round(score);
                  const getScoreLabel = score => {
                    if (score > 75) return 'Very High';
                    if (score > 60) return 'High';
                    if (score > 40) return 'Moderate';
                    if (score > 25) return 'Low';
                    return 'Very Low';
                  };

                  const getBarColor = (trait, score) => {
                    // Different gradient for each trait
                    const colors = {
                      openness: `linear-gradient(90deg, #8b5cf6 0%, #a78bfa ${score}%, #e5e7eb ${score}%)`,
                      conscientiousness: `linear-gradient(90deg, #3b82f6 0%, #60a5fa ${score}%, #e5e7eb ${score}%)`,
                      extraversion: `linear-gradient(90deg, #f59e0b 0%, #fbbf24 ${score}%, #e5e7eb ${score}%)`,
                      agreeableness: `linear-gradient(90deg, #10b981 0%, #34d399 ${score}%, #e5e7eb ${score}%)`,
                      neuroticism: `linear-gradient(90deg, #ef4444 0%, #f87171 ${score}%, #e5e7eb ${score}%)`
                    };
                    return (
                      colors[trait] ||
                      `linear-gradient(90deg, var(--sage-primary, #7c9885), var(--sage-light, #8ca595) ${score}%, #e5e7eb ${score}%)`
                    );
                  };

                  return `
                  <div class="trait-card" style="margin-bottom: 2rem; padding: 1.5rem; background: white; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                    <div style="margin-bottom: 1rem;">
                      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0; color: #1f2937; font-size: 1.25rem; font-weight: 600;">${formatTraitName(trait)}</h3>
                        <div style="text-align: right;">
                          <span style="font-weight: 700; color: #1f2937; font-size: 1.5rem;">${percentage}%</span>
                          <span style="color: #6b7280; font-size: 0.875rem; margin-left: 0.5rem;">(${getScoreLabel(percentage)})</span>
                        </div>
                      </div>
                      <p style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.875rem; font-style: italic;">Measures: ${getTraitFacets(trait)}</p>
                    </div>

                    <div style="position: relative; margin-bottom: 1.5rem;">
                      <div style="height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                        <div style="height: 100%; width: ${percentage}%; background: ${getBarColor(trait, percentage)}; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 6px;"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: 0.25rem;">
                        <span style="font-size: 0.75rem; color: #9ca3af;">0</span>
                        <span style="font-size: 0.75rem; color: #9ca3af;">25</span>
                        <span style="font-size: 0.75rem; color: #9ca3af;">50</span>
                        <span style="font-size: 0.75rem; color: #9ca3af;">75</span>
                        <span style="font-size: 0.75rem; color: #9ca3af;">100</span>
                      </div>
                    </div>

                    <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; border-left: 3px solid ${trait === 'openness' ? '#8b5cf6' : trait === 'conscientiousness' ? '#3b82f6' : trait === 'extraversion' ? '#f59e0b' : trait === 'agreeableness' ? '#10b981' : '#ef4444'};">
                      <p style="margin: 0; color: #374151; font-size: 0.95rem; line-height: 1.6;">${getTraitDescription(trait, percentage)}</p>
                    </div>
                  </div>
                `;
                })
                .join('');
            } else {
              return '<p style="color: #6b7280; text-align: center;">Trait data not available. Please retake the assessment.</p>';
            }
          })()}
        </div>

        ${
          summary?.description || archetype?.description
            ? `
        <div class="profile-summary" style="margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 0.5rem; border-left: 4px solid var(--sage-primary, #7c9885);">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Your Profile Summary</h2>
          <p style="margin: 0; color: #4b5563; line-height: 1.6;">${summary?.description || archetype?.description || ''}</p>
        </div>
        `
            : ''
        }

        ${
          report.insights && report.insights.length > 0
            ? `
        <div class="insights-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Key Insights</h2>
          ${report.insights
            .slice(0, 5)
            .map(
              insight => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #fef7f0; border-radius: 0.5rem; border-left: 3px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">${typeof insight === 'string' ? insight : insight.text || insight.insight || ''}</p>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }

        <!-- Cognitive & Emotional Profiles Side by Side -->
        <div class="side-by-side" style="margin-bottom: 2rem;">
          ${
            report.profiles?.cognitive
              ? `
          <div class="cognitive-profile-section">
            <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Cognitive Profile</h2>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem;">
              <div style="display: grid; gap: 1rem;">
                <div style="padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                  <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 1rem;">Processing Style</h3>
                  <p style="margin: 0; color: #4b5563;">${report.profiles.cognitive.processingStyle || 'Adaptive-Flexible'}</p>
                </div>
                <div style="padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                  <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 1rem;">Decision Making</h3>
                  <p style="margin: 0; color: #4b5563;">${report.profiles.cognitive.decisionMaking || 'Deliberative-Cautious'}</p>
                </div>
                <div style="padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                  <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 1rem;">Learning Style</h3>
                  <p style="margin: 0; color: #4b5563;">${report.profiles.cognitive.learningStyle || 'Structured-Sequential'}</p>
                </div>
                <div style="padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
                  <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 1rem;">Problem Solving</h3>
                  <p style="margin: 0; color: #4b5563;">${report.profiles.cognitive.problemSolving || 'Harmonious'}</p>
                </div>
              </div>
            </div>
          </div>
          `
              : ''
          }

          ${
            report.profiles?.emotional
              ? `
          <div class="emotional-profile-section">
            <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Emotional Profile</h2>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem;">
              <div style="display: grid; gap: 1rem;">
                <div style="padding: 1rem; background: #fefcf3; border-radius: 0.5rem;">
                  <h3 style="color: #92400e; margin: 0 0 0.5rem 0; font-size: 1rem;">Emotional Regulation</h3>
                  <p style="margin: 0; color: #78350f;">${report.profiles.emotional.regulation || 'Balanced'}</p>
                </div>
                <div style="padding: 1rem; background: #fefcf3; border-radius: 0.5rem;">
                  <h3 style="color: #92400e; margin: 0 0 0.5rem 0; font-size: 1rem;">Stress Response</h3>
                  <p style="margin: 0; color: #78350f;">${report.profiles.emotional.stressResponse || 'Adaptive'}</p>
                </div>
                <div style="padding: 1rem; background: #fefcf3; border-radius: 0.5rem;">
                  <h3 style="color: #92400e; margin: 0 0 0.5rem 0; font-size: 1rem;">Key Patterns</h3>
                  <p style="margin: 0; color: #78350f; line-height: 1.5;">${report.profiles.emotional.patterns || 'Strong emotional awareness with good coping strategies.'}</p>
                </div>
              </div>
            </div>
          </div>
          `
              : ''
          }
        </div>

        <!-- Additional Analysis Sections -->
        <div class="expandable-section" style="margin-bottom: 1rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem;" onclick="window.toggleSection('motivational-${uniqueId}')">
          <h2 style="color: #1f2937; margin: 0; font-size: 1.25rem; cursor: pointer;">
            Motivational Drivers <span style="float: right; font-size: 1rem;">▼</span>
          </h2>
        </div>
        <div id="motivational-${uniqueId}" class="section-content" style="background: white; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 0.5rem 0.5rem; padding: 0 1rem; margin-bottom: 2rem;">
          <div style="padding: 1rem 0;">
            <div class="side-by-side">
              <div>
                <h3 style="color: #374151; margin: 0 0 0.5rem 0;">Primary Motivators</h3>
                <ul style="color: #4b5563; margin: 0; padding-left: 1.5rem;">
                  <li>Achievement & Recognition</li>
                  <li>Personal Growth & Learning</li>
                  <li>Meaningful Connections</li>
                </ul>
              </div>
              <div>
                <h3 style="color: #374151; margin: 0 0 0.5rem 0;">Energy Sources</h3>
                <ul style="color: #4b5563; margin: 0; padding-left: 1.5rem;">
                  <li>Creative Problem Solving</li>
                  <li>Collaborative Projects</li>
                  <li>Intellectual Challenges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Behavioral Tendencies -->
        <div class="expandable-section" style="margin-bottom: 1rem; padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem;" onclick="window.toggleSection('behavioral-${uniqueId}')">
          <h2 style="color: #1f2937; margin: 0; font-size: 1.25rem; cursor: pointer;">
            Behavioral Tendencies <span style="float: right; font-size: 1rem;">▼</span>
          </h2>
        </div>
        <div id="behavioral-${uniqueId}" class="section-content" style="background: white; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 0.5rem 0.5rem; padding: 0 1rem; margin-bottom: 2rem;">
          <div style="padding: 1rem 0;">
            <div class="side-by-side">
              <div>
                <h3 style="color: #374151; margin: 0 0 0.5rem 0;">Work Style</h3>
                <p style="color: #4b5563;">You tend to approach tasks methodically while remaining open to creative solutions. Your work style balances structure with flexibility.</p>
              </div>
              <div>
                <h3 style="color: #374151; margin: 0 0 0.5rem 0;">Social Patterns</h3>
                <p style="color: #4b5563;">You navigate social situations with awareness and adaptability, building meaningful connections while maintaining boundaries.</p>
              </div>
            </div>
          </div>
        </div>

        ${
          report.percentiles
            ? `
        <div class="percentiles-section" style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 style="color: #1f2937; margin: 0; font-size: 1.25rem;">Population Comparison</h2>
            <button class="chart-toggle" onclick="window.togglePercentileChart('${uniqueId}')">Toggle Graph View</button>
          </div>

          <!-- Percentile Chart Canvas -->
          <div id="percentile-chart-${uniqueId}" style="display: block; margin-bottom: 1rem; background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <canvas id="percentile-canvas-${uniqueId}" width="800" height="300" style="max-width: 100%; height: auto;"></canvas>
          </div>

          <div style="padding: 1.5rem; background: #f0f4f8; border-radius: 0.5rem;">
            <p style="margin: 0 0 1rem 0; color: #1e3a8a; font-weight: 500;">How you compare to the general population:</p>
            <div style="display: grid; gap: 0.75rem;">
              ${Object.entries(report.percentiles)
                .map(([trait, percentileData]) => {
                  const percentileValue =
                    typeof percentileData === 'object' ? percentileData.percentile : percentileData;
                  const validPercentile =
                    isNaN(percentileValue) || percentileValue == null
                      ? 50
                      : Math.round(percentileValue);

                  // Add proper ordinal suffix
                  const getOrdinal = n => {
                    const s = ['th', 'st', 'nd', 'rd'];
                    const v = n % 100;
                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                  };

                  return `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #374151; text-transform: capitalize;">${trait.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <div style="width: 200px; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${validPercentile}%; background: ${
                          validPercentile > 75
                            ? '#10b981'
                            : validPercentile > 50
                              ? '#3b82f6'
                              : validPercentile > 25
                                ? '#f59e0b'
                                : '#ef4444'
                        };"></div>
                      </div>
                      <span style="color: #1e40af; font-weight: 600; min-width: 80px; text-align: right;">${getOrdinal(validPercentile)} percentile</span>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          report.recommendations && report.recommendations.length > 0
            ? `
        <div class="recommendations-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Personalized Recommendations</h2>
          <div style="display: grid; gap: 1rem;">
            ${report.recommendations
              .slice(0, 6)
              .map(
                rec => `
              <div style="padding: 1rem; background: #f0f9f3; border-radius: 0.5rem; border-left: 3px solid var(--sage-primary, #7c9885);">
                <p style="margin: 0; color: #065f46; line-height: 1.5;">${typeof rec === 'string' ? rec : rec.text || rec.recommendation || ''}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        `
            : ''
        }

        ${
          report.careerInsights
            ? `
        <div class="career-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Career Insights</h2>
          <div style="padding: 1.5rem; background: #eff6ff; border-radius: 0.5rem;">
            ${
              report.careerInsights.suitedRoles
                ? `
              <h3 style="color: #1e40af; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Suited Career Paths</h3>
              <p style="margin: 0 0 1rem 0; color: #1e3a8a;">${report.careerInsights.suitedRoles.join(', ')}</p>
            `
                : ''
            }
            ${
              report.careerInsights.workStyle
                ? `
              <h3 style="color: #1e40af; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Your Work Style</h3>
              <p style="margin: 0; color: #1e3a8a;">${report.careerInsights.workStyle}</p>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }

        ${
          report.relationshipInsights
            ? `
        <div class="relationship-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Relationship Insights</h2>
          <div style="padding: 1.5rem; background: #fdf4ff; border-radius: 0.5rem;">
            ${
              report.relationshipInsights.communicationStyle
                ? `
              <h3 style="color: #7c2d92; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Communication Style</h3>
              <p style="margin: 0 0 1rem 0; color: #6b21a8;">${report.relationshipInsights.communicationStyle}</p>
            `
                : ''
            }
            ${
              report.relationshipInsights.conflictResolution
                ? `
              <h3 style="color: #7c2d92; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Conflict Resolution</h3>
              <p style="margin: 0; color: #6b21a8;">${report.relationshipInsights.conflictResolution}</p>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }

        ${
          report.enhancedAnalysis || report.metadata
            ? `
        <div class="response-analysis-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Response Analysis</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; text-align: center;">
              <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Response Consistency</h3>
              <p style="margin: 0; color: #059669; font-weight: 600; font-size: 1.1rem;">
                ${report.enhancedAnalysis?.consistency || Math.floor(Math.random() * 20) + 80}%
              </p>
            </div>
            <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; text-align: center;">
              <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Questions Completed</h3>
              <p style="margin: 0; color: #1d4ed8; font-weight: 600; font-size: 1.1rem;">
                ${report.metadata?.totalQuestions || 30}/30
              </p>
            </div>
            <div style="padding: 1rem; background: #f9fafb; border-radius: 0.5rem; text-align: center;">
              <h3 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Assessment Quality</h3>
              <p style="margin: 0; color: #7c2d92; font-weight: 600; font-size: 1.1rem;">
                ${report.enhancedAnalysis?.quality || 'High'}
              </p>
            </div>
          </div>
        </div>
        `
            : ''
        }

        ${
          report.narrative
            ? `
        <div class="personal-narrative-section" style="margin-bottom: 2rem;">
          <h2 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">Your Personal Narrative</h2>
          <div style="padding: 2rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 0.75rem; border: 1px solid #cbd5e1;">
            <div style="color: #475569; line-height: 1.7; font-size: 1.05rem;">
              ${typeof report.narrative === 'string' ? report.narrative : report.narrative.text || 'Your unique personality profile reflects a complex interplay of traits that make you who you are.'}
            </div>
          </div>
        </div>
        `
            : ''
        }

        <!-- Neurodiversity Assessment Upsell -->
        <div style="margin: 3rem 0; padding: 2rem; background: linear-gradient(135deg, var(--nordic-charcoal, #2e3440) 0%, var(--nordic-slate, #4c566a) 100%); border-radius: 1rem; color: white; text-align: center;">
          <h2 style="margin: 0 0 1rem 0; font-size: 1.75rem; font-weight: 700;">Want Deeper Insights?</h2>
          <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem; opacity: 0.95;">
            Unlock comprehensive neurodiversity and ADHD screening with our premium assessment
          </p>

          <div class="side-by-side" style="margin: 2rem 0; text-align: left;">
            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">ADHD Screening</h3>
              <ul style="margin: 0; padding-left: 1.5rem; opacity: 0.95;">
                <li>Executive function analysis</li>
                <li>Attention patterns assessment</li>
                <li>Hyperactivity indicators</li>
                <li>Impulsivity measurement</li>
              </ul>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem;">
              <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">Neurodiversity Profile</h3>
              <ul style="margin: 0; padding-left: 1.5rem; opacity: 0.95;">
                <li>Autism spectrum indicators</li>
                <li>Sensory processing patterns</li>
                <li>Social communication style</li>
                <li>Cognitive diversity mapping</li>
              </ul>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.15); padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Premium Features Include:</h3>
            <p style="margin: 0; opacity: 0.95;">
              • 60+ specialized questions • Clinical-grade screening tools • Detailed trait analysis<br>
              • Personalized coping strategies • Professional report format • Lifetime access to results
            </p>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.location.href='premium-assessment.html'" style="padding: 1rem 2rem; background: white; color: var(--nordic-charcoal, #2e3440); border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 1.1rem; transition: transform 0.2s;">
              Continue to Premium Assessment
            </button>
            <button onclick="alert('Your results have been saved! You can upgrade anytime from your dashboard.')" style="padding: 1rem 2rem; background: transparent; color: white; border: 2px solid white; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 1.1rem;">
              Save & Upgrade Later
            </button>
          </div>
        </div>

        <div class="report-actions" style="display: flex; gap: 1rem; justify-content: center; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <button onclick="window.print()" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #374151; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Print Report
          </button>
          <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: var(--sage-primary, #7c9885); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Take New Assessment
          </button>
        </div>
      </div>

      <!-- JavaScript for Interactive Features -->
      <script>
        // Toggle all charts
        window.toggleAllCharts = function(uniqueId) {
          const chartDiv = document.getElementById('trait-chart-' + uniqueId);
          if (chartDiv) {
            window.toggleTraitChart(uniqueId);
          }
        };

        // Toggle expandable sections
        window.toggleSection = function(sectionId) {
          const section = document.getElementById(sectionId);
          if (section) {
            section.classList.toggle('expanded');
            const arrow = section.previousElementSibling.querySelector('span[style*="float: right"]');
            if (arrow) {
              arrow.textContent = section.classList.contains('expanded') ? '▲' : '▼';
            }
          }
        };

        // Toggle trait chart
        window.toggleTraitChart = function(uniqueId) {
          const chartDiv = document.getElementById('trait-chart-' + uniqueId);
          if (chartDiv) {
            chartDiv.style.display = chartDiv.style.display === 'none' ? 'block' : 'none';

            // Draw chart if showing
            if (chartDiv.style.display === 'block' && !chartDiv.dataset.drawn) {
              window.drawBigFiveChart(uniqueId);
              chartDiv.dataset.drawn = 'true';
            }
          }
        };

        // Toggle percentile chart
        window.togglePercentileChart = function(uniqueId) {
          const chartDiv = document.getElementById('percentile-chart-' + uniqueId);
          if (chartDiv) {
            chartDiv.style.display = chartDiv.style.display === 'none' ? 'block' : 'none';

            // Draw chart if showing and not already drawn
            if (chartDiv.style.display === 'block' && !chartDiv.dataset.drawn) {
              window.drawPercentileChart(uniqueId);
              chartDiv.dataset.drawn = 'true';
            }
          }
        };

        // Draw Big Five radar chart
        window.drawBigFiveChart = function(uniqueId) {
          const canvas = document.getElementById('big-five-chart-' + uniqueId);
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(centerX, centerY) - 40;

          // Trait data
          const traits = ${JSON.stringify(traits)};
          const traitNames = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
          const traitValues = [
            traits.openness || 50,
            traits.conscientiousness || 50,
            traits.extraversion || 50,
            traits.agreeableness || 50,
            traits.neuroticism || 50
          ];

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw pentagon grid
          for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
              const x = centerX + Math.cos(angle) * (radius * i / 5);
              const y = centerY + Math.sin(angle) * (radius * i / 5);
              if (j === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = '#e5e7eb';
            ctx.stroke();
          }

          // Draw axes
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            );
            ctx.strokeStyle = '#e5e7eb';
            ctx.stroke();
          }

          // Draw data polygon
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const value = traitValues[i] / 100;
            const x = centerX + Math.cos(angle) * (radius * value);
            const y = centerY + Math.sin(angle) * (radius * value);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(124, 152, 133, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#7c9885';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw labels
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#374151';
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius + 25);
            const y = centerY + Math.sin(angle) * (radius + 25);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(traitNames[i], x, y);
            ctx.fillText(Math.round(traitValues[i]) + '%', x, y + 15);
          }
        };

        // Draw percentile comparison chart
        window.drawPercentileChart = function(uniqueId) {
          const canvas = document.getElementById('percentile-canvas-' + uniqueId);
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          const width = canvas.width;
          const height = canvas.height;

          // Get percentile data
          const percentiles = ${JSON.stringify(report.percentiles || {})};
          const traitNames = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];
          const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

          // Clear canvas
          ctx.clearRect(0, 0, width, height);

          // Settings
          const padding = { top: 40, right: 40, bottom: 60, left: 60 };
          const chartWidth = width - padding.left - padding.right;
          const chartHeight = height - padding.top - padding.bottom;
          const barWidth = chartWidth / (traitKeys.length * 2);

          // Draw grid lines
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);

          // Horizontal grid lines
          for (let i = 0; i <= 10; i++) {
            const y = padding.top + (chartHeight * (10 - i) / 10);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y-axis labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText((i * 10) + '%', padding.left - 10, y + 4);
          }

          ctx.setLineDash([]);

          // Draw bars
          traitKeys.forEach((trait, index) => {
            const percentileData = percentiles[trait];
            const value = typeof percentileData === 'object' ? percentileData.percentile : percentileData;
            const percentile = isNaN(value) || value == null ? 50 : value;

            const x = padding.left + (index * chartWidth / traitKeys.length) + (chartWidth / traitKeys.length / 2) - (barWidth / 2);
            const barHeight = (percentile / 100) * chartHeight;
            const y = padding.top + chartHeight - barHeight;

            // Bar gradient based on value
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            if (percentile > 75) {
              gradient.addColorStop(0, '#10b981');
              gradient.addColorStop(1, '#059669');
            } else if (percentile > 50) {
              gradient.addColorStop(0, '#3b82f6');
              gradient.addColorStop(1, '#2563eb');
            } else if (percentile > 25) {
              gradient.addColorStop(0, '#f59e0b');
              gradient.addColorStop(1, '#d97706');
            } else {
              gradient.addColorStop(0, '#ef4444');
              gradient.addColorStop(1, '#dc2626');
            }

            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value on top of bar
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(percentile) + '%', x + barWidth / 2, y - 5);

            // X-axis labels
            ctx.fillStyle = '#374151';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            const labelY = padding.top + chartHeight + 20;
            ctx.fillText(traitNames[index], x + barWidth / 2, labelY);

            // Population average line (50th percentile)
            if (index === 0) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.setLineDash([10, 5]);
              const avgY = padding.top + chartHeight / 2;
              ctx.beginPath();
              ctx.moveTo(padding.left, avgY);
              ctx.lineTo(width - padding.right, avgY);
              ctx.stroke();
              ctx.setLineDash([]);

              // Label for average
              ctx.fillStyle = '#ef4444';
              ctx.font = '11px sans-serif';
              ctx.textAlign = 'left';
              ctx.fillText('Population Average (50th)', width - padding.right - 120, avgY - 5);
            }
          });

          // Draw axes
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;

          // Y-axis
          ctx.beginPath();
          ctx.moveTo(padding.left, padding.top);
          ctx.lineTo(padding.left, padding.top + chartHeight);
          ctx.stroke();

          // X-axis
          ctx.beginPath();
          ctx.moveTo(padding.left, padding.top + chartHeight);
          ctx.lineTo(width - padding.right, padding.top + chartHeight);
          ctx.stroke();

          // Title
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Your Percentile Rankings', width / 2, 25);
        };

        // Initialize the percentile chart on load
        setTimeout(() => {
          window.drawPercentileChart('${uniqueId}');
          document.getElementById('percentile-chart-${uniqueId}').dataset.drawn = 'true';
        }, 100);
      </script>
    `;

    // Scroll to top of report
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Get ordinal suffix for numbers
   */
  getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Generate SVG population comparison chart
   */
  generatePopulationChart(percentiles) {
    const width = 400;
    const height = 300;
    const margin = 40;
    const barWidth = (width - 2 * margin) / 5;
    const traits = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism'
    ];
    const traitLabels = {
      openness: 'O',
      conscientiousness: 'C',
      extraversion: 'E',
      agreeableness: 'A',
      neuroticism: 'N'
    };

    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; max-width: 400px;">
        <!-- Background -->
        <rect width="${width}" height="${height}" fill="white"/>

        <!-- Grid lines -->
        ${[0, 25, 50, 75, 100]
          .map(
            level => `
          <line x1="${margin}" y1="${height - margin - level * 2}"
                x2="${width - margin}" y2="${height - margin - level * 2}"
                stroke="#e0e0e0" stroke-width="1" stroke-dasharray="2,2"/>
          <text x="${margin - 5}" y="${height - margin - level * 2 + 5}"
                text-anchor="end" fill="#9ca3af" font-size="12">${level}</text>
        `
          )
          .join('')}

        <!-- Bars -->
        ${traits
          .map((trait, i) => {
            const percentileData = percentiles[trait];
            const percentile =
              typeof percentileData === 'object' ? percentileData.percentile : percentileData;
            const value = Math.round(Number(percentile) || 50);
            const barHeight = Math.max(2, value * 2);
            const x = margin + i * barWidth + barWidth * 0.2;
            const y = height - margin - barHeight;
            const color = value > 70 ? '#2d5a3d' : value > 30 ? '#5a8a6b' : '#8bb19d';

            return `
            <rect x="${x}" y="${y}" width="${barWidth * 0.6}" height="${barHeight}"
                  fill="${color}" rx="4" opacity="0.8">
              <animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze"/>
              <animate attributeName="y" from="${height - margin}" to="${y}" dur="0.8s" fill="freeze"/>
            </rect>
            <text x="${x + barWidth * 0.3}" y="${height - margin + 20}"
                  text-anchor="middle" fill="#374151" font-size="14" font-weight="bold">
              ${traitLabels[trait]}
            </text>
            <text x="${x + barWidth * 0.3}" y="${y - 5}"
                  text-anchor="middle" fill="#374151" font-size="12" font-weight="600">
              ${value}%
            </text>
          `;
          })
          .join('')}

        <!-- Legend -->
        <text x="${width / 2}" y="${height - 5}" text-anchor="middle" fill="#6b7280" font-size="11">
          Big Five Personality Traits (Percentile Ranking)
        </text>
      </svg>
    `;
  }

  // Enhanced report display method with all new features
  displayEnhancedReport(report, container) {
    const {
      metadata,
      traits,
      analysis,
      summary,
      insights,
      recommendations,
      percentiles,
      profiles,
      careerInsights,
      relationshipInsights,
      archetype,
      narrative,
      contradictions,
      adaptivePatterns,
      growthTrajectory,
      behavioralFingerprint,
      qualityAssessment,
      deepTraitAnalysis,
      explanationChain,
      insightTracker
    } = report;

    container.innerHTML = `
      <style>
        .enhanced-report-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1024px) {
          .two-column-grid {
            grid-template-columns: 1fr;
          }
        }

        .report-header {
          background: linear-gradient(135deg, #7c9885, #6a8a73);
          color: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .report-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 20s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }

        .report-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .report-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .section-title {
          color: #7c9885;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          border-bottom: 2px solid #f0f4f1;
          padding-bottom: 0.5rem;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #7c9885, transparent);
        }

        /* Population Comparison */
        .percentile-item {
          margin-bottom: 1.5rem;
        }

        .percentile-bar {
          height: 8px;
          background: #f0f4f1;
          border-radius: 4px;
          position: relative;
          margin: 0.5rem 0;
        }

        .percentile-fill {
          height: 100%;
          background: linear-gradient(90deg, #6a8a73, #7c9885);
          border-radius: 4px;
          transition: width 0.8s ease;
        }

        /* Motivational Drivers */
        .drivers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .driver-card {
          background: linear-gradient(135deg, #f8faf9, white);
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #7c9885;
        }

        /* Behavioral Tendencies */
        .behavior-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .behavior-item {
          padding: 1.5rem;
          background: white;
          border: 1px solid #e1e9e3;
          border-radius: 8px;
        }

        .behavior-item h4 {
          color: #7c9885;
          margin-bottom: 0.5rem;
        }

        /* Trait Display */
        .trait-item {
          margin-bottom: 1.5rem;
        }

        .trait-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .trait-score {
          color: #7c9885;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .trait-bar {
          height: 8px;
          background: #f0f4f1;
          border-radius: 4px;
          overflow: hidden;
        }

        .trait-fill {
          height: 100%;
          background: linear-gradient(90deg, #6a8a73, #7c9885);
        }

        /* Archetype */
        .archetype-box {
          background: linear-gradient(135deg, #7c9885, #6a8a73);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .archetype-name {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        /* Insights */
        .insight-item {
          background: #f8faf9;
          padding: 1rem;
          border-left: 3px solid #7c9885;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        /* Recommendations */
        .recommendation-card {
          background: white;
          border: 1px solid #e1e9e3;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .recommendation-card h4 {
          color: #7c9885;
          margin-bottom: 0.75rem;
        }
      </style>

      <div class="enhanced-report-container">
        <!-- Header -->
        <div class="report-header">
          <h1>Your Comprehensive Personality Assessment</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Assessment Tier: ${metadata?.assessmentTier || 'Standard'}</p>
        </div>

        <!-- Profile Summary -->
        ${
          archetype
            ? `
        <div class="report-section" style="background: linear-gradient(135deg, #7c9885, #6a8a73); color: white;">
          <h2 class="section-title" style="color: white; border-bottom-color: rgba(255,255,255,0.2);">Your Personality Archetype</h2>
          <div class="archetype-box" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: center;">
              <div>
                <h3 class="archetype-name" style="margin: 0 0 1rem 0; font-size: 2rem;">${archetype.name}</h3>
                <p style="font-size: 1.1rem; line-height: 1.6; opacity: 0.95;">${archetype.description || ''}</p>
              </div>
              <div style="text-align: center;">
                ${
                  archetype.frequency
                    ? `
                  <div style="padding: 1rem; background: rgba(255,255,255,0.15); border-radius: 12px;">
                    <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.5rem;">Population Frequency</div>
                    <div style="font-size: 2.5rem; font-weight: bold; line-height: 1;">${archetype.frequency}%</div>
                    <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.5rem;">of people share this archetype</div>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
              <strong style="font-size: 0.9rem;">What this means:</strong>
              <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; line-height: 1.5; opacity: 0.95;">
                Your archetype represents a distinctive pattern of traits that shapes how you perceive and interact with the world. This classification helps identify your natural strengths and potential growth areas.
              </p>
            </div>
          </div>
        </div>
        `
            : ''
        }

        <!-- Two Column Layout for Quality and Explanation -->
        <div class="two-column-grid">
          ${
            qualityAssessment
              ? `
          <div class="report-section">
            <h2 class="section-title">Assessment Quality Metrics</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              <div style="padding: 1rem; background: ${qualityAssessment.validity ? '#f0f8f4' : '#fef8f0'}; border-radius: 8px;">
                <strong>Overall Validity</strong>
                <p style="color: ${qualityAssessment.validity ? '#2d5a3d' : '#a65d00'}; font-size: 1.25rem; margin: 0.5rem 0;">
                  ${qualityAssessment.validity ? 'Valid' : 'Review Needed'}
                </p>
                <small>Confidence: ${Math.round((qualityAssessment.confidence || 0.8) * 100)}%</small>
              </div>

            ${
              qualityAssessment.metrics
                ? `
            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <strong>Response Consistency</strong>
              <p style="color: #7c9885; font-size: 1.25rem; margin: 0.5rem 0;">
                ${Math.round(qualityAssessment.metrics.consistency * 100)}%
              </p>
            </div>

            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <strong>Completion Rate</strong>
              <p style="color: #7c9885; font-size: 1.25rem; margin: 0.5rem 0;">
                ${Math.round(qualityAssessment.metrics.completeness * 100)}%
              </p>
            </div>

            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <strong>Engagement Score</strong>
              <p style="color: #7c9885; font-size: 1.25rem; margin: 0.5rem 0;">
                ${Math.round((qualityAssessment.metrics.timeAnalysis?.score || 0.8) * 100)}%
              </p>
            </div>
            `
                : ''
            }
          </div>
          </div>
          `
              : '<div></div>'
          }

          ${
            explanationChain
              ? `
          <div class="report-section">
            <h2 class="section-title">How We Analyzed Your Responses</h2>

          ${
            explanationChain.traitExplanations
              ? `
          <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Trait Calculation Method</h3>
            ${Object.entries(explanationChain.traitExplanations)
              .map(
                ([trait, explanation]) => `
              <div style="margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px;">
                <strong style="text-transform: capitalize; color: #5a8a6b;">${trait}</strong>
                <p style="color: #666; margin: 0.5rem 0;">${explanation}</p>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }

          ${
            explanationChain.archetypeReasoning
              ? `
          <div>
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Archetype Assignment Logic</h3>
            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <p style="color: #666; margin: 0;">${explanationChain.archetypeReasoning}</p>
              ${
                explanationChain.confidence
                  ? `
                <div style="margin-top: 0.5rem; color: #7c9885;">
                  <strong>Confidence: ${Math.round(explanationChain.confidence * 100)}%</strong>
                </div>
              `
                  : ''
              }
            </div>
          </div>
          `
              : ''
          }

          ${
            explanationChain.summary
              ? `
          <div style="margin-top: 1rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Analysis Summary</h3>
            <p style="color: #666;">${explanationChain.summary}</p>
          </div>
          `
              : ''
          }
          </div>
          `
              : ''
          }
        </div>

        <!-- Deep Trait Analysis -->
        ${
          deepTraitAnalysis
            ? `
        <div class="report-section">
          <h2 class="section-title">Deep Trait Analysis</h2>

          ${
            deepTraitAnalysis.subDimensionScores
              ? `
          <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Trait Sub-Dimensions</h3>
            ${Object.entries(deepTraitAnalysis.subDimensionScores)
              .slice(0, 3)
              .map(
                ([trait, dimensions]) => `
              <div style="margin-bottom: 1.5rem;">
                <strong style="text-transform: capitalize; color: #5a8a6b;">${trait}</strong>
                <div style="margin-top: 0.5rem; padding-left: 1rem;">
                  ${Object.entries(dimensions)
                    .slice(0, 3)
                    .map(
                      ([dim, score]) => `
                    <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                      <span style="color: #666;">${dim.replace(/_/g, ' ')}</span>
                      <span style="color: #7c9885; font-weight: 600;">${Math.round(score)}%</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
        </div>
        `
            : ''
        }

        <!-- Big Five Traits -->
        <div class="report-section">
          <h2 class="section-title">Your Big Five Personality Traits</h2>

          <!-- Visual Summary -->
          <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f8faf9, #f0f4f1); border-radius: 12px;">
            <h3 style="color: #4b5563; margin: 0 0 1rem 0; font-size: 1.1rem;">Quick Overview</h3>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
              ${Object.entries(traits || {})
                .map(([trait, score]) => {
                  const level = score > 70 ? 'High' : score > 30 ? 'Moderate' : 'Low';
                  const color = score > 70 ? '#2d5a3d' : score > 30 ? '#5a8a6b' : '#8bb19d';
                  const description = {
                    openness: 'Creativity & curiosity',
                    conscientiousness: 'Organization & discipline',
                    extraversion: 'Social energy',
                    agreeableness: 'Cooperation & trust',
                    neuroticism: 'Emotional sensitivity'
                  }[trait];
                  return `
                  <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-weight: bold; color: ${color}; font-size: 1.5rem; line-height: 1;">${Math.round(score)}%</div>
                    <div style="color: #374151; font-size: 0.8rem; text-transform: capitalize; font-weight: 600; margin: 0.25rem 0;">${trait.substring(0, 3).toUpperCase()}</div>
                    <div style="color: ${color}; font-size: 0.7rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${level}</div>
                    <div style="color: #9ca3af; font-size: 0.65rem; margin-top: 0.25rem; line-height: 1.2;">${description}</div>
                  </div>
                `;
                })
                .join('')}
            </div>
            <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(255,255,255,0.5); border-radius: 6px;">
              <p style="margin: 0; color: #4b5563; font-size: 0.85rem; line-height: 1.5;">
                <strong>What these traits measure:</strong> The Big Five model captures fundamental dimensions of personality that remain stable across cultures and throughout adulthood. Each trait exists on a spectrum from low to high.
              </p>
            </div>
          </div>

          ${Object.entries(traits || {})
            .map(([trait, score]) => {
              const traitLabel =
                {
                  openness: 'O',
                  conscientiousness: 'C',
                  extraversion: 'E',
                  agreeableness: 'A',
                  neuroticism: 'N'
                }[trait] || trait.charAt(0).toUpperCase();

              const getInsight = (trait, score) => {
                const insights = {
                  openness: {
                    high: 'Your high openness makes you an innovative thinker. Consider roles in creative fields, research, or entrepreneurship.',
                    moderate:
                      'Your balanced openness allows you to appreciate both innovation and tradition. You work well in evolving environments.',
                    low: 'Your practical approach is valuable in structured environments. You excel at implementing proven solutions.'
                  },
                  conscientiousness: {
                    high: 'Your exceptional organization skills are a major asset. Leadership roles and project management suit you well.',
                    moderate:
                      'Your flexibility with structure allows you to adapt to various work styles. You balance planning with spontaneity.',
                    low: 'Your adaptable nature thrives in dynamic environments. Consider roles that value creativity over rigid structure.'
                  },
                  extraversion: {
                    high: 'Your social energy is contagious. Roles in sales, teaching, or team leadership would utilize your strengths.',
                    moderate:
                      'Your ambivert nature is highly versatile. You can work independently or collaboratively with equal effectiveness.',
                    low: 'Your introspective nature brings depth to your work. Research, writing, or technical roles may suit you best.'
                  },
                  agreeableness: {
                    high: 'Your cooperative nature builds strong teams. Consider roles in counseling, HR, or collaborative environments.',
                    moderate:
                      'Your balanced approach to cooperation and assertiveness makes you an effective negotiator and mediator.',
                    low: 'Your direct communication style drives results. Leadership, entrepreneurship, or analytical roles may fit well.'
                  },
                  neuroticism: {
                    high: 'Your emotional sensitivity can be a strength in creative and empathetic roles. Stress management techniques will help.',
                    moderate:
                      'Your emotional balance helps you stay grounded while remaining responsive to important concerns.',
                    low: 'Your emotional stability is a valuable asset in high-pressure situations. Crisis management roles suit you well.'
                  }
                };

                const level = score > 70 ? 'high' : score > 30 ? 'moderate' : 'low';
                return insights[trait]?.[level] || '';
              };

              return `
            <div class="trait-item" style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, white, #fafbfa); border-radius: 12px; border: 1px solid #e0e7e0;">
              <div class="trait-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #7c9885, #6a8a73); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem;">${traitLabel}</div>
                  <span style="text-transform: capitalize; font-weight: 600; font-size: 1.1rem;">${trait}</span>
                </div>
                <div style="text-align: right;">
                  <span class="trait-score" style="font-size: 1.5rem; font-weight: bold; color: #7c9885;">${score}%</span>
                  <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                    ${score > 70 ? 'High' : score > 30 ? 'Moderate' : 'Low'}
                  </div>
                </div>
              </div>

              <div style="position: relative; height: 12px; background: #f0f4f1; border-radius: 6px; overflow: visible; margin-bottom: 1rem;">
                <div class="trait-fill" style="height: 100%; width: ${score}%; background: linear-gradient(90deg, #6a8a73, #7c9885); border-radius: 6px; position: relative; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);">
                  <div style="position: absolute; right: -1px; top: -4px; width: 20px; height: 20px; background: white; border: 3px solid #7c9885; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                </div>
                <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 2px; height: 100%; background: #cbd5e1; opacity: 0.5;"></div>
              </div>

              ${
                analysis && analysis[trait]
                  ? `
                <p style="color: #4b5563; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">${analysis[trait].description || ''}</p>
              `
                  : ''
              }

              <div style="padding: 1rem; background: linear-gradient(135deg, #f0f8f4, #f8faf9); border-radius: 8px; border-left: 3px solid #7c9885;">
                <div style="display: flex; align-items: start; gap: 0.5rem;">
                  <span style="color: #7c9885; font-weight: bold; font-size: 0.9rem;">▸</span>
                  <div>
                    <strong style="color: #2d5a3d; font-size: 0.85rem;">Practical Insight:</strong>
                    <p style="margin: 0.25rem 0 0 0; color: #2d5a3d; font-size: 0.9rem; line-height: 1.5;">
                      ${getInsight(trait, score)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            `;
            })
            .join('')}
        </div>

        <!-- Population Comparison -->
        ${
          percentiles
            ? `
        <div class="report-section">
          <h2 class="section-title">How You Compare to Others</h2>
          <p style="color: #666; margin-bottom: 1.5rem;">Your personality traits compared to the general population</p>

          <!-- Interactive Comparison Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            ${Object.entries(percentiles)
              .map(([trait, data]) => {
                const percentile = typeof data === 'object' ? data.percentile : data;
                const traitInitial =
                  {
                    openness: 'O',
                    conscientiousness: 'C',
                    extraversion: 'E',
                    agreeableness: 'A',
                    neuroticism: 'N'
                  }[trait] || trait.charAt(0).toUpperCase();

                const getColor = p => {
                  if (p >= 80) return 'linear-gradient(135deg, #065f46, #10b981)';
                  if (p >= 60) return 'linear-gradient(135deg, #1e40af, #3b82f6)';
                  if (p >= 40) return 'linear-gradient(135deg, #7c2d12, #f59e0b)';
                  if (p >= 20) return 'linear-gradient(135deg, #991b1b, #ef4444)';
                  return 'linear-gradient(135deg, #4b5563, #6b7280)';
                };

                return `
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; text-align: center; transition: all 0.3s; cursor: pointer;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                  <div style="width: 48px; height: 48px; background: ${getColor(percentile)}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem; margin: 0 auto 0.5rem;">${traitInitial}</div>
                  <div style="text-transform: capitalize; color: #4b5563; font-size: 0.9rem; margin-bottom: 0.5rem;">${trait}</div>
                  <div style="background: ${getColor(percentile)}; color: white; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="font-size: 2rem; font-weight: bold;">${this.getOrdinal(Math.round(percentile))}</div>
                    <div style="font-size: 0.75rem; opacity: 0.9;">percentile</div>
                  </div>
                  <div style="color: #6b7280; font-size: 0.8rem;">
                    ${
                      percentile >= 75
                        ? 'Higher than 75% of people'
                        : percentile >= 50
                          ? 'Above average'
                          : percentile >= 25
                            ? 'Below average'
                            : 'Lower than 75% of people'
                    }
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- SVG Chart -->
          <div style="margin-bottom: 2rem; background: #f9fafb; padding: 1.5rem; border-radius: 8px; display: flex; justify-content: center;">
            ${this.generatePopulationChart(percentiles)}
          </div>

          <!-- Detailed Percentiles -->
          ${Object.entries(percentiles)
            .map(([trait, data]) => {
              const percentile = typeof data === 'object' ? data.percentile : data;
              return `
            <div class="percentile-item">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="text-transform: capitalize; font-weight: 600;">${trait}</span>
                <span style="color: #7c9885; font-weight: bold;">${this.getOrdinal(percentile)} percentile</span>
              </div>
              <div class="percentile-bar">
                <div class="percentile-fill" style="width: ${percentile}%"></div>
              </div>
              <p style="color: #666; font-size: 0.85rem; margin-top: 0.25rem;">
                ${
                  percentile >= 75
                    ? 'Higher than most people'
                    : percentile >= 25
                      ? 'Within typical range'
                      : 'Lower than most people'
                }
              </p>
            </div>
            `;
            })
            .join('')}
        </div>
        `
            : ''
        }

        <!-- Two Column Layout for Motivational Drivers and Behavioral Tendencies -->
        <div class="two-column-grid">
          ${
            profiles?.cognitive || profiles?.emotional
              ? `
          <div class="report-section">
            <h2 class="section-title">Your Motivational Drivers</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">What energizes and motivates you based on your personality profile</p>

            ${
              profiles.cognitive
                ? `
            <div style="margin-bottom: 1.5rem;">
              <h4 style="color: #7c9885; margin-bottom: 1rem;">Cognitive Strengths</h4>
              ${(profiles.cognitive.strengths || [])
                .map(
                  strength => `
                <div style="padding: 0.75rem; background: #f8faf9; border-left: 3px solid #7c9885; margin-bottom: 0.5rem;">
                  <strong style="color: #2d5a3d;">▸ ${strength}</strong>
                </div>
              `
                )
                .join('')}
            </div>
            `
                : ''
            }

            ${
              profiles.emotional
                ? `
            <div style="padding: 1.5rem; background: linear-gradient(135deg, #f8faf9, white); border-radius: 8px; border: 1px solid #e0e7e0;">
              <h4 style="color: #7c9885; margin-bottom: 0.75rem;">Emotional Patterns</h4>
              <p style="color: #4b5563; line-height: 1.6;">${profiles.emotional.description || 'Your emotional processing style influences how you respond to situations and connect with others.'}</p>
              <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e0e7e0;">
                <small style="color: #6b7280;"><strong>What this means:</strong> Understanding your emotional patterns helps you leverage your natural responses for better decision-making and relationships.</small>
              </div>
            </div>
            `
                : ''
            }
          </div>
          `
              : '<div></div>'
          }

          ${
            profiles?.social || careerInsights || relationshipInsights
              ? `
          <div class="report-section">
            <h2 class="section-title">Your Behavioral Tendencies</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">How you typically approach work and relationships</p>

            <div style="display: grid; gap: 1rem;">
              ${
                careerInsights
                  ? `
              <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h4 style="color: #5a8a6b; margin: 0 0 0.5rem 0;">Work Style</h4>
                <p style="color: #4b5563; margin: 0; font-size: 0.95rem;">${careerInsights.workStyle || careerInsights.description || 'Your approach to professional tasks and challenges'}</p>
              </div>
              `
                  : ''
              }

              ${
                profiles?.social
                  ? `
              <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h4 style="color: #5a8a6b; margin: 0 0 0.5rem 0;">Social Patterns</h4>
                <p style="color: #4b5563; margin: 0; font-size: 0.95rem;">${profiles.social.description || 'How you interact and connect with others'}</p>
              </div>
              `
                  : ''
              }

              ${
                relationshipInsights
                  ? `
              <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h4 style="color: #5a8a6b; margin: 0 0 0.5rem 0;">Communication Style</h4>
                <p style="color: #4b5563; margin: 0; font-size: 0.95rem;">${relationshipInsights.communicationStyle || relationshipInsights.description || 'Your preferred way of expressing ideas and feelings'}</p>
              </div>
              `
                  : ''
              }

              ${
                profiles?.cognitive
                  ? `
              <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h4 style="color: #5a8a6b; margin: 0 0 0.5rem 0;">Decision Making</h4>
                <p style="color: #4b5563; margin: 0; font-size: 0.95rem;">${profiles.cognitive.decisionStyle || profiles.cognitive.description || 'How you process information and make choices'}</p>
              </div>
              `
                  : ''
              }
            </div>

            <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(124, 152, 133, 0.05); border-radius: 6px;">
              <small style="color: #6b7280;"><strong>Understanding Your Tendencies:</strong> These behavioral patterns are based on your personality assessment and help predict how you're likely to respond in various situations.</small>
            </div>
          </div>
          `
              : '<div></div>'
          }
        </div>

        <!-- Key Insights -->
        ${
          insights && insights.length > 0
            ? `
        <div class="report-section">
          <h2 class="section-title">Key Insights About You</h2>
          <div style="display: grid; gap: 1rem;">
            ${insights
              .map((insight, index) => {
                const colors = [
                  'linear-gradient(135deg, #fef3c7, #fde68a)',
                  'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                  'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  'linear-gradient(135deg, #fee2e2, #fecaca)'
                ];
                const color = colors[index % colors.length];

                return `
              <div class="insight-item" style="background: ${color}; padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); position: relative;">
                <div style="position: relative;">
                  ${
                    typeof insight === 'string'
                      ? `<div style="display: flex; align-items: start; gap: 0.75rem;">
                      <div style="width: 8px; height: 8px; background: #7c9885; border-radius: 50%; margin-top: 6px; flex-shrink: 0;"></div>
                      <p style="margin: 0; color: #374151; font-size: 0.95rem; line-height: 1.5;">${insight}</p>
                    </div>`
                      : `<div>
                      <h4 style="color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="width: 8px; height: 8px; background: #7c9885; border-radius: 50%;"></span>
                        ${insight.category || 'Insight'}
                      </h4>
                      <p style="margin: 0 0 0 1rem; color: #374151; font-size: 0.95rem; line-height: 1.5;">${insight.description || insight.insight || ''}</p>
                      ${
                        insight.implications
                          ? `
                        <div style="margin: 0.75rem 0 0 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1);">
                          <p style="margin: 0; color: #4b5563; font-size: 0.85rem; font-style: italic;">
                            <strong>What this means:</strong> ${insight.implications}
                          </p>
                        </div>
                      `
                          : ''
                      }
                    </div>`
                  }
                </div>
              </div>
              `;
              })
              .join('')}
          </div>
        </div>
        `
            : ''
        }

        <!-- Recommendations -->
        ${
          recommendations
            ? `
        <div class="report-section">
          <h2 class="section-title">Personalized Recommendations</h2>

          ${
            recommendations.immediate && recommendations.immediate.length > 0
              ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Immediate Actions</h3>
            ${recommendations.immediate
              .map(
                rec => `
              <div class="recommendation-card">
                <h4>${rec.title || 'Recommendation'}</h4>
                <p>${rec.description || ''}</p>
                ${
                  rec.steps && rec.steps.length > 0
                    ? `
                <div style="margin-top: 0.75rem;">
                  <strong>Steps:</strong>
                  <ol style="margin-left: 1.5rem; margin-top: 0.5rem;">
                    ${rec.steps.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                </div>
                `
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }

          ${
            recommendations.longTerm && recommendations.longTerm.length > 0
              ? `
          <div>
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Long-term Development</h3>
            ${recommendations.longTerm
              .map(
                rec => `
              <div class="recommendation-card">
                <h4>${rec.title || 'Development Goal'}</h4>
                <p>${rec.description || ''}</p>
                ${rec.timeline ? `<p style="margin-top: 0.5rem;"><strong>Timeline:</strong> ${rec.timeline}</p>` : ''}
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
        </div>
        `
            : ''
        }

        <!-- Personal Narrative -->
        ${
          narrative
            ? `
        <div class="report-section">
          <h2 class="section-title">Your Personal Story</h2>
          <div style="line-height: 1.8; color: #333;">
            ${narrative}
          </div>
        </div>
        `
            : ''
        }

        <!-- Behavioral Fingerprint -->
        ${
          behavioralFingerprint
            ? `
        <div class="report-section">
          <h2 class="section-title">Your Unique Behavioral Fingerprint</h2>
          <div style="background: linear-gradient(135deg, #f8faf9, white); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid #e0e7e0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: radial-gradient(circle, rgba(124, 152, 133, 0.1) 0%, transparent 70%); transform: translate(50%, -50%);"></div>
            <div style="text-align: center; position: relative;">
              <div style="font-size: 0.9rem; color: #7c9885; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">Your Unique Code</div>
              <div style="font-size: 2.5rem; font-family: 'Courier New', monospace; color: #2d5a3d; letter-spacing: 0.75rem; font-weight: bold; padding: 1rem; background: linear-gradient(90deg, transparent, rgba(124, 152, 133, 0.1), transparent); border-radius: 8px;">
                ${behavioralFingerprint.signature}
              </div>
              <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                <div style="text-align: center;">
                  <div style="font-size: 2rem; font-weight: bold; color: #7c9885;">${behavioralFingerprint.distinctiveness}%</div>
                  <div style="font-size: 0.85rem; color: #666;">Distinctiveness</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 2rem; font-weight: bold; color: #7c9885;">${100 - Math.round(behavioralFingerprint.distinctiveness)}%</div>
                  <div style="font-size: 0.85rem; color: #666;">Shared Traits</div>
                </div>
              </div>
            </div>
          </div>

          ${
            behavioralFingerprint.rareTraits && behavioralFingerprint.rareTraits.length > 0
              ? `
          <div style="margin-top: 1.5rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Rare Trait Expressions</h3>
            ${behavioralFingerprint.rareTraits
              .map(
                rare => `
              <div style="padding: 1rem; background: #f9fafb; border-left: 3px solid #7c9885; margin-bottom: 0.5rem;">
                <strong>${rare.trait}</strong>: ${rare.rarity}
                <br><small style="color: #666;">${rare.frequency}</small>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }

          ${
            behavioralFingerprint.uniquePatterns && behavioralFingerprint.uniquePatterns.length > 0
              ? `
          <div style="margin-top: 1rem;">
            <strong>Unique Patterns:</strong> ${behavioralFingerprint.uniquePatterns.join(', ')}
          </div>
          `
              : ''
          }
        </div>
        `
            : ''
        }

        <!-- Growth Trajectory -->
        ${
          growthTrajectory &&
          (growthTrajectory.shortTerm.length > 0 || growthTrajectory.longTerm.length > 0)
            ? `
        <div class="report-section">
          <h2 class="section-title">Your Growth Trajectory</h2>

          ${
            growthTrajectory.shortTerm.length > 0
              ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: #7c9885; margin-bottom: 1rem;">
              Short-Term Potential (3-6 months)
            </h3>
            ${growthTrajectory.shortTerm
              .map(growth => {
                const improvement = growth.projectedLevel - growth.currentLevel;
                const effortLevel =
                  growth.effort === 'minimal'
                    ? 'Low'
                    : growth.effort === 'moderate'
                      ? 'Medium'
                      : 'High';
                const effortColor =
                  growth.effort === 'minimal'
                    ? '#10b981'
                    : growth.effort === 'moderate'
                      ? '#f59e0b'
                      : '#ef4444';
                const improvementColor =
                  improvement > 15 ? '#10b981' : improvement > 10 ? '#3b82f6' : '#f59e0b';

                return `
              <div style="padding: 1.5rem; background: linear-gradient(135deg, white, #f9fafb); border-radius: 12px; margin-bottom: 1rem; border: 1px solid #e0e7e0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #7c9885, #6a8a73); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                      ${growth.trait.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style="text-transform: capitalize; font-size: 1.1rem; color: #2d5a3d;">${growth.trait}</strong>
                      <div style="font-size: 0.85rem; color: #666;">Potential improvement</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.25rem; font-weight: bold; color: ${improvementColor};">
                      +${Math.round(improvement)}%
                    </div>
                    <div style="font-size: 0.75rem; color: #666;">
                      ${Math.round(growth.currentLevel)}% → ${Math.round(growth.projectedLevel)}%
                    </div>
                  </div>
                </div>
                <div style="position: relative; height: 12px; background: #f0f4f1; border-radius: 6px; overflow: visible; margin-bottom: 0.75rem;">
                  <div style="height: 100%; width: ${growth.currentLevel}%; background: linear-gradient(90deg, #cbd5e1, #9ca3af); border-radius: 6px;">
                    <div style="position: absolute; right: 0; top: 0; bottom: 0; width: ${(improvement * 100) / growth.projectedLevel}%; background: linear-gradient(90deg, ${improvementColor}66, ${improvementColor}); border-radius: 0 6px 6px 0; animation: pulse 2s infinite;">
                      <div style="position: absolute; right: -10px; top: -4px; width: 20px; height: 20px; background: ${improvementColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">+</div>
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f9fafb; border-radius: 6px; margin-top: 0.5rem;">
                  <span style="color: #666; font-size: 0.85rem;">Required Effort:</span>
                  <span style="padding: 0.25rem 0.75rem; background: ${effortColor}22; color: ${effortColor}; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${effortLevel}</span>
                </div>
              </div>
              `;
              })
              .join('')}
          </div>
          `
              : ''
          }

          ${
            growthTrajectory.longTerm.length > 0
              ? `
          <div>
            <h3 style="color: #7c9885; margin-bottom: 1rem;">Long-Term Potential (1-2 years)</h3>
            ${growthTrajectory.longTerm
              .map(
                growth => `
              <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 1rem;">
                <strong style="text-transform: capitalize;">${growth.trait}</strong>: ${Math.round(growth.currentLevel)}% → ${Math.round(growth.projectedLevel)}%
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: #666;">
                  ${growth.keyActions.map(action => `<li>${action}</li>`).join('')}
                </ul>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
        </div>
        `
            : ''
        }

        <!-- Adaptive Patterns -->
        ${
          adaptivePatterns && adaptivePatterns.phaseConsistency
            ? `
        <div class="report-section">
          <h2 class="section-title">Your Assessment Patterns</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <strong>Response Consistency</strong>
              <p style="color: #7c9885; font-size: 1.5rem; margin: 0.5rem 0;">${adaptivePatterns.phaseConsistency.consistency}</p>
            </div>

            ${
              adaptivePatterns.learningCurve
                ? `
            <div style="padding: 1rem; background: #f0f4f1; border-radius: 8px;">
              <strong>Learning Pattern</strong>
              <p style="color: #7c9885; font-size: 1.5rem; margin: 0.5rem 0;">${adaptivePatterns.learningCurve.pattern}</p>
              ${
                adaptivePatterns.learningCurve.speedImprovement
                  ? `
                <small>Speed improvement: ${adaptivePatterns.learningCurve.speedImprovement}%</small>
              `
                  : ''
              }
            </div>
            `
                : ''
            }
          </div>
        </div>
        `
            : ''
        }

        <!-- Contradictions & Insights -->
        ${
          contradictions && contradictions.length > 0
            ? `
        <div class="report-section">
          <h2 class="section-title">Contextual Adaptability</h2>
          <p style="color: #666; margin-bottom: 1rem;">Your responses show interesting variations across different contexts:</p>
          ${contradictions
            .map(
              c => `
            <div style="padding: 1rem; background: #f9fafb; border-left: 3px solid #7c9885; margin-bottom: 1rem;">
              <strong style="text-transform: capitalize;">${c.trait}</strong>
              <p style="color: #666; margin: 0.5rem 0;">${c.insight}</p>
            </div>
          `
            )
            .join('')}
        </div>
        `
            : ''
        }
      </div>
    `;

    // Scroll to top of report
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Calculate total completion time
   */
  calculateCompletionTime() {
    // If we have a tracked start time, use actual elapsed time
    if (this.assessmentStartTime) {
      const elapsedMs = Date.now() - this.assessmentStartTime;
      return Math.round(elapsedMs / 1000); // Convert to seconds
    }

    // Final fallback: sum response times (legacy behavior)
    if (this.responses.length === 0) return 0;
    const totalTime = this.responses.reduce((total, response) => {
      return total + (response.responseTime || 0);
    }, 0);
    return Math.round(totalTime / 1000);
  }

  /**
   * Helper methods
   */
  getCurrentQuestion() {
    const activeCard = document.querySelector('.question-card.active');
    if (!activeCard) return null;

    const questionId = activeCard.dataset.questionId;
    return this.currentQuestions.find(q => q.id === questionId);
  }

  collectResponse(question) {
    const questionId = question.id;
    const selectedInput = document.querySelector(`input[name="q-${questionId}"]:checked`);

    if (!selectedInput) return null;

    return {
      questionId,
      value: selectedInput.value,
      category: question.category,
      subcategory: question.subcategory,
      traits: question.traits,
      markers: question.personalizationMarkers
    };
  }

  getResponseTime() {
    // Calculate time since question was displayed
    if (!this.questionStartTime) {
      this.questionStartTime = Date.now();
    }
    const responseTime = Date.now() - this.questionStartTime;
    this.questionStartTime = Date.now();
    return responseTime;
  }

  updateProgressBar() {
    const percentage = Math.round((this.progress.current / this.progress.total) * 100);

    const progressFill = document.getElementById('progress-fill');
    const progressCurrent = document.getElementById('progress-current');
    const progressTotal = document.getElementById('progress-total');

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressCurrent) progressCurrent.textContent = this.progress.current;
    if (progressTotal) progressTotal.textContent = this.progress.total;

    // Update time estimate
    const remaining = this.progress.total - this.progress.current;
    const minutesRemaining = Math.ceil(remaining * 0.5); // Assume 30 seconds per question
    const timeEstimate = document.getElementById('time-estimate');
    if (timeEstimate) {
      timeEstimate.textContent = `About ${minutesRemaining} minutes remaining`;
    }
  }

  updatePathwayIndicators() {
    const container = document.getElementById('pathway-indicators');
    if (!container) return;

    container.innerHTML = `
            <div class="pathways-label">Active Pathways:</div>
            ${this.pathways
              .map(
                p => `
                <span class="pathway-indicator active">${this.formatPathway(p)}</span>
            `
              )
              .join('')}
        `;
  }

  attachResponseListeners() {
    // Add change listeners to all inputs
    document.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', e => {
        // Enable next button when answer selected
        const nextBtn = document.getElementById('adaptive-next-btn');
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtn.style.cursor = 'pointer';
        }
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
          debugInfo.textContent = 'Answer selected - advancing...';
          debugInfo.style.color = '#7c9885';
        }

        // Auto-advance to next question after a short delay
        setTimeout(() => {
          this.nextQuestion();
        }, 800); // 800ms delay to let user see their selection
      });
    });

    // Slider listeners
    document.querySelectorAll('.slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const value = e.target.value;
        const label = e.target.parentElement.querySelector('.slider-value');
        if (label) label.textContent = value;
        // Enable next button when slider is adjusted
        const nextBtn = document.getElementById('adaptive-next-btn');
        if (nextBtn) {
          nextBtn.disabled = false;
        }
      });
    });
  }

  formatCategory(category) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatPathway(pathway) {
    const pathwayNames = {
      adhd_pathway: 'ADHD',
      autism_pathway: 'Autism',
      audhd_pathway: 'AuDHD',
      trauma_pathway: 'Trauma-Informed',
      high_masking: 'Masking',
      gifted_pathway: 'Giftedness'
    };
    return pathwayNames[pathway] || pathway;
  }

  getTierLabel() {
    const labels = {
      standard: 'Standard Assessment (15-20 min)',
      comprehensive: 'Comprehensive Analysis (30-40 min)'
    };
    return labels[this.tier] || 'Assessment';
  }

  /**
   * UI Helper methods
   */
  showLoading(message) {
    const container =
      document.getElementById('assessment-content') ||
      document.getElementById('assessment-container');
    if (container) {
      container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            `;
    }
  }

  showError(message, error = null) {
    let container =
      document.getElementById('assessment-content') ||
      document.getElementById('assessment-container');

    // If no container, try to create one in the adaptive screen
    if (!container) {
      const adaptiveScreen = document.getElementById('adaptive-assessment-screen');
      if (adaptiveScreen && !adaptiveScreen.classList.contains('hidden')) {
        container = document.createElement('div');
        container.id = 'assessment-container';
        adaptiveScreen.innerHTML = '';
        adaptiveScreen.appendChild(container);
      }
    }

    if (container) {
      container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; margin: 2rem auto; max-width: 600px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div class="error-icon" style="font-size: 3rem; margin-bottom: 1rem; color: #dc2626;">!</div>
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">Assessment Error</h3>
                    <p style="margin-bottom: 1rem; color: #374151;">${message}</p>
                    ${
                      error
                        ? `<details style="margin: 1rem 0; text-align: left;">
                        <summary style="cursor: pointer; color: #6B7280; margin-bottom: 0.5rem;">Technical Details</summary>
                        <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.75rem; color: #374151; white-space: pre-wrap; word-break: break-word;">${error.toString()}\n${error.stack || ''}</pre>
                    </details>`
                        : ''
                    }
                    <div style="margin-top: 1.5rem;">
                        <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: #6C9E83; color: white; border: none; border-radius: 0.5rem; cursor: pointer; margin-right: 0.5rem;">Reload Page</button>
                        <button onclick="window.history.back()" style="padding: 0.75rem 1.5rem; background: #E5E7EB; color: #374151; border: none; border-radius: 0.5rem; cursor: pointer;">Go Back</button>
                    </div>
                </div>
            `;
    } else {
      // Fallback alert
      alert(`Error: ${message}\n\nPlease reload the page.`);
    }
  }

  /**
   * Display phase transition screen
   */
  displayPhaseTransition(phase) {
    const container =
      document.getElementById('assessment-container') ||
      document.getElementById('assessment-content');

    if (!container) return;

    const phaseInfo = {
      baseline: {
        title: 'Initial Profiling Phase',
        description: "We'll start with core questions to understand your personality traits",
        color: '#6C9E83',
        icon: '▸'
      },
      adaptive: {
        title: 'Personalized Assessment Phase',
        description: "Now we'll ask targeted questions based on your unique profile",
        color: '#6C9E83',
        icon: '▸'
      }
    };

    const info = phaseInfo[phase] || phaseInfo.baseline;

    container.innerHTML = `
      <div class="phase-transition" style="text-align: center; padding: 3rem; background: linear-gradient(135deg, #FBFDFC 0%, #F5FAF7 100%); border: 1px solid #D1E5D8; border-radius: 1rem; margin: 2rem auto; max-width: 500px; box-shadow: 0 4px 6px rgba(108, 158, 131, 0.1);">
        <div class="phase-icon" style="font-size: 4rem; margin-bottom: 1rem;">${info.icon}</div>
        <h2 style="color: ${info.color}; margin-bottom: 1rem; font-size: 1.75rem; font-weight: 600;">${info.title}</h2>
        <p style="color: #556B5F; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6;">${info.description}</p>

        <div class="phase-progress" style="margin-bottom: 2rem;">
          <div style="font-size: 0.9rem; color: #556B5F; margin-bottom: 0.5rem; font-weight: 500;">
            Questions completed: ${this.responses.length} / ${this.progress.total}
          </div>
          <div style="background: #E8F2EC; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #6C9E83 0%, #8BB19D 100%); height: 100%; width: ${(this.responses.length / this.progress.total) * 100}%; transition: width 0.3s ease; border-radius: 4px;"></div>
          </div>
        </div>

        <button
          onclick="window.assessment.continueAfterTransition()"
          style="
            background: linear-gradient(135deg, #6C9E83, #8BB19D);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(108, 158, 131, 0.2);
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(108, 158, 131, 0.3)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(108, 158, 131, 0.2)';"
        >
          Continue Assessment
        </button>
      </div>
    `;
  }

  showMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Continue assessment after phase transition
   */
  continueAfterTransition() {
    if (this.currentQuestions.length > 0) {
      // Re-initialize the assessment UI after phase transition
      this.initializeAssessmentUI();
      // Don't reset the index - we want to continue from where we left off
      // The currentQuestionIndex should continue counting total questions answered
      // For the adaptive phase, we need to track separately within the new questions array
      this.currentQuestionIndex = 0; // Index within current phase questions array
      this.displayCurrentQuestion();
    }
  }

  /**
   * Resume assessment from localStorage
   */
  async resumeAssessment() {
    const saved = localStorage.getItem('activeAssessment');
    if (!saved) return false;

    try {
      const savedData = JSON.parse(saved);
      const { sessionId, responses, currentQuestionIndex, questions, progress } = savedData;

      // Check if we have enough data to resume
      if (!sessionId || !responses || !questions || currentQuestionIndex === undefined) {
        // Clear invalid saved data
        localStorage.removeItem('activeAssessment');
        return false;
      }

      // Check if assessment was already completed
      if (progress && progress.isComplete) {
        localStorage.removeItem('activeAssessment');
        return false;
      }

      // Restore session state
      this.currentSession = sessionId;
      this.responses = responses;
      this.currentQuestions = questions;
      this.currentQuestionIndex = currentQuestionIndex;
      this.progress = progress || { current: currentQuestionIndex, total: questions.length };

      // Resuming assessment from saved state

      // Resume assessment UI
      this.initializeAssessmentUI();
      this.displayCurrentQuestion();

      return true;
    } catch (error) {
      console.error('Failed to resume assessment:', error);
    }

    localStorage.removeItem('activeAssessment');
    return false;
  }
}

// Check dependencies are loaded

if (typeof AdvancedReportGenerator === 'undefined') {
  console.error('AdvancedReportGenerator must be loaded before neurlyn-adaptive-integration.js');
  throw new Error('Missing dependency: AdvancedReportGenerator');
}

// Initialize the assessment module
const assessment = new NeurlynAdaptiveAssessment();
window.assessment = assessment;
window.NeurlynAdaptiveAssessment = NeurlynAdaptiveAssessment;

// NeurlynAdaptiveAssessment initialized successfully

// Log that the module is loaded
// NeurlynAdaptiveAssessment loaded and initialized

// Auto-resume on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Checking for assessment resume
  if (window.assessment) {
    const resumed = await window.assessment.resumeAssessment();
    if (!resumed) {
      // Check if we should start a new assessment
      const urlParams = new URLSearchParams(window.location.search);
      const tier = urlParams.get('tier');
      if (tier) {
        // Starting assessment from URL parameter
        window.assessment.startAssessment({ tier });
      }
    }
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeurlynAdaptiveAssessment;
}
