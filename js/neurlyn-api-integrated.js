/**
 * Neurlyn Integrated App with API Backend Integration
 * This version fetches questions from the backend API instead of local files
 */

import { ReportGenerator } from './report-generator.js';
import { apiClient } from './api-client.js';
import { behavioralTracker } from './modules/behavioral-tracker.js';
import { emergencyProtocols } from './modules/emergency-protocols.js';

let taskController;

const initTaskController = async () => {
  if (!taskController) {
    try {
      // Try to load task-controller module
      const module = await import('./modules/task-controller.js');
      taskController = module.taskController;
    } catch (error) {
      // console.warn('Task controller module not found, using fallback');
      // Create a simple fallback task controller
      taskController = {
        loadTask: async taskType => {
          // console.log(`Loading task: ${taskType}`);
          return null;
        }
      };
    }
  }
  return taskController;
};

class NeurlynAPIIntegratedApp {
  constructor() {
    this.state = {
      currentMode: null,
      currentScreen: 'disclaimer',
      assessmentTrack: null,
      currentQuestionIndex: 0,
      responses: [],
      startTime: null,
      sessionId: this.generateSessionId(),
      isPaused: false,
      theme: 'system',
      taskMode: 'hybrid',
      consentGiven: false,
      assessmentPlan: 'free',
      apiConnected: false,
      neurodiversityData: {
        adhd_indicators: [],
        autism_indicators: [],
        dyslexia_indicators: [],
        sensory_profile: {},
        executive_function: {}
      }
    };

    this.questions = [];
    this.currentTask = null;
    this.autoSaveInterval = null;
    this.reportGenerator = new ReportGenerator();
    this.taskController = null;
    this.behavioralTracker = behavioralTracker;
    this.emergencyProtocols = emergencyProtocols;

    this.init();
  }

  async init() {
    // Check API health first
    this.state.apiConnected = await apiClient.checkHealth();

    if (!this.state.apiConnected) {
      console.warn('⚠️ API not connected, running in offline mode');
      this.showToast('Running in offline mode', 'warning');
    } else {
      // API connected successfully
      // Preload stats
      const stats = await apiClient.getQuestionStats();
    }

    this.initTheme();
    this.loadSavedState();
    this.setupDisclaimerListeners();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.checkForSavedProgress();
  }

  setupDisclaimerListeners() {
    const consentCheck = document.getElementById('consent-check');
    const ageCheck = document.getElementById('age-check');
    const acceptButton = document.getElementById('accept-disclaimer');
    const planTabs = document.querySelectorAll('.selector-tab');
    const selectedDescription = document.getElementById('selected-description');

    if (planTabs.length > 0) {
      planTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          planTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const plan = tab.dataset.plan;
          if (plan === 'free') {
            selectedDescription.textContent =
              'Get your basic personality profile with key traits - completely free';
            acceptButton.textContent = 'Start Free Assessment';
            this.state.assessmentPlan = 'free';
          } else if (plan === 'premium') {
            selectedDescription.textContent =
              'Complete neurodiversity screening with detailed analysis and downloadable report';
            acceptButton.textContent = 'Start In-Depth Analysis - £1.99';
            this.state.assessmentPlan = 'premium';
          }
        });
      });
      this.state.assessmentPlan = 'free';
    }

    if (consentCheck && ageCheck && acceptButton) {
      const checkValidity = () => {
        acceptButton.disabled = !(consentCheck.checked && ageCheck.checked);
      };

      consentCheck.addEventListener('change', checkValidity);
      ageCheck.addEventListener('change', checkValidity);

      acceptButton.addEventListener('click', () => {
        this.state.consentGiven = true;
        if (this.state.assessmentPlan === 'premium') {
          // console.log('Premium assessment selected - would trigger payment flow');
        }
        this.showScreen('welcome');
      });
    }
  }

  setupEventListeners() {
    // Track selection
    document.querySelectorAll('.track-option').forEach(option => {
      option.addEventListener('click', () => {
        this.selectTrack(option.dataset.track);
      });
    });

    // Mode selection
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        this.selectMode(option.dataset.mode);
      });
    });

    // Start assessment
    const startButton = document.getElementById('start-assessment');
    if (startButton) {
      startButton.addEventListener('click', () => this.startAssessment());
    }

    // Navigation buttons
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');

    if (prevButton) prevButton.addEventListener('click', () => this.navigateQuestion(-1));
    if (nextButton) nextButton.addEventListener('click', () => this.navigateQuestion(1));
    if (skipButton) skipButton.addEventListener('click', () => this.skipQuestion());

    // Results actions
    const downloadButton = document.getElementById('download-results');
    const shareButton = document.getElementById('share-results');
    const retakeButton = document.getElementById('retake-assessment');

    if (downloadButton) downloadButton.addEventListener('click', () => this.downloadResults());
    if (shareButton) shareButton.addEventListener('click', () => this.shareResults());
    if (retakeButton) retakeButton.addEventListener('click', () => this.retakeAssessment());
  }

  selectTrack(track) {
    this.state.assessmentTrack = track;

    document.querySelectorAll('.track-option').forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.track === track) {
        option.classList.add('selected');
      }
    });

    const modeSelection = document.querySelector('.mode-selection');
    if (modeSelection) {
      const heading = modeSelection.querySelector('h3');
      if (track === 'neurodiversity') {
        heading.textContent = 'Select Assessment Depth';
        this.updateModeDescriptionsForNeurodiversity();
      } else {
        heading.textContent =
          track === 'comprehensive' ? 'Select Comprehensive Assessment' : 'Select Assessment Type';
      }
    }

    this.showToast(
      `Selected: ${track.charAt(0).toUpperCase() + track.slice(1)} Assessment`,
      'info'
    );

    // Navigate to mode selection screen
    setTimeout(() => {
      this.showScreen('mode-selection');
    }, 500);
  }

  selectMode(mode) {
    this.state.currentMode = mode;

    document.querySelectorAll('.mode-option').forEach(option => {
      option.classList.remove('selected', 'selecting');
      if (option.dataset.mode === mode) {
        option.classList.add('selecting');
        setTimeout(() => {
          option.classList.remove('selecting');
          option.classList.add('selected');
        }, 150);
      }
    });

    this.showTaskTypeSelector();

    const startButton = document.getElementById('start-assessment');
    if (startButton) {
      startButton.disabled = false;
      startButton.classList.add('pulse');
      const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
      startButton.textContent = `Begin ${modeText} Assessment`;
      setTimeout(() => startButton.classList.remove('pulse'), 600);
    }

    this.updateExpectedDuration(mode);
  }

  showTaskTypeSelector() {
    const existingSelector = document.getElementById('task-type-selector');
    if (existingSelector) existingSelector.remove();

    const selector = document.createElement('div');
    selector.id = 'task-type-selector';
    selector.className = 'task-type-selector';
    selector.innerHTML = `
      <h4>Assessment Style</h4>
      <div class="task-type-options">
        <label class="task-type-option">
          <input type="radio" name="taskType" value="traditional" />
          <span class="option-content">
            <span class="option-title">Traditional</span>
            <span class="option-desc">Standard questionnaire</span>
          </span>
        </label>
        <label class="task-type-option">
          <input type="radio" name="taskType" value="gamified" />
          <span class="option-content">
            <span class="option-title">Interactive</span>
            <span class="option-desc">Games & activities</span>
          </span>
        </label>
        <label class="task-type-option">
          <input type="radio" name="taskType" value="lateral" />
          <span class="option-content">
            <span class="option-title">Lateral</span>
            <span class="option-desc">Creative scenarios</span>
          </span>
        </label>
        <label class="task-type-option">
          <input type="radio" name="taskType" value="hybrid" checked />
          <span class="option-content">
            <span class="option-title">Hybrid</span>
            <span class="option-desc">Mixed approach</span>
          </span>
        </label>
      </div>
    `;

    const modeSelection = document.querySelector('.mode-selection');
    if (modeSelection) {
      modeSelection.appendChild(selector);
    }

    selector.querySelectorAll('input[name="taskType"]').forEach(radio => {
      radio.addEventListener('change', e => {
        this.state.taskMode = e.target.value;
        this.showToast(`Assessment style: ${e.target.value}`, 'info');
      });
    });
  }

  async startAssessment() {
    if (!this.state.currentMode) {
      this.showToast('Please select an assessment mode', 'error');
      return;
    }

    this.state.startTime = Date.now();
    this.state.currentQuestionIndex = 0;
    this.state.responses = [];

    // Show loading while fetching questions
    this.showToast('Loading questions...', 'info');

    try {
      // Fetch questions from API
      this.questions = await apiClient.getQuestionsForAssessment(
        this.state.currentMode,
        this.state.assessmentTrack,
        this.state.taskMode
      );

      if (this.questions.length === 0) {
        throw new Error('No questions available for this assessment');
      }

      // console.log(`✅ Loaded ${this.questions.length} questions from API`);

      this.behavioralTracker.start();
      this.transitionToScreen('question');
      await this.displayQuestion();
      this.startAutoSave();
      this.showToast('Assessment started', 'success');
    } catch (error) {
      console.error('Failed to start assessment:', error);
      this.showToast('Failed to load questions. Please try again.', 'error');
    }
  }

  async displayQuestion() {
    const question = this.questions[this.state.currentQuestionIndex];
    const contentElement = document.getElementById('question-content');

    if (!contentElement) return;

    if (!this.taskController) {
      this.taskController = await initTaskController();
    }

    // console.log('📋 Displaying question:', {
    //   index: this.state.currentQuestionIndex,
    //   type: question.type,
    //   category: question.category,
    //   questionId: question.questionId
    // });

    if (this.currentTask) {
      this.taskController.destroy();
      this.currentTask = null;
    }

    this.updateProgress();

    const categoryElement = document.getElementById('question-category');
    if (categoryElement) {
      categoryElement.textContent = question.category;
    }

    try {
      if (question.type === 'lateral') {
        // console.log('✅ Loading lateral task');
        this.currentTask = await this.taskController.loadTask('lateral', question);
      } else {
        // console.log(`Loading ${question.type} task`);
        this.currentTask = await this.taskController.loadTask(question.type, question);
      }

      await this.taskController.renderTask(contentElement);

      if (question.type !== 'likert' && question.type !== 'lateral') {
        this.setupGamifiedTaskCompletion();
      }
    } catch (error) {
      console.error('Failed to load task:', error);
      // Fallback to likert
      this.currentTask = await this.taskController.loadTask('likert', question);
      await this.taskController.renderTask(contentElement);
    }

    this.updateNavigationButtons();
  }

  async navigateQuestion(direction) {
    if (!this.taskController) {
      this.taskController = await initTaskController();
    }

    if (direction > 0 && this.currentTask) {
      if (this.currentTask.type === 'likert' && !this.currentTask.response) {
        this.showToast('Please select an answer', 'error');
        return;
      }

      const results = await this.taskController.getTaskResults();
      this.state.responses.push({
        questionIndex: this.state.currentQuestionIndex,
        questionId: this.questions[this.state.currentQuestionIndex].questionId,
        question: this.questions[this.state.currentQuestionIndex].question,
        category: this.questions[this.state.currentQuestionIndex].category,
        response: results,
        timestamp: Date.now(),
        taskType: this.questions[this.state.currentQuestionIndex].type
      });
    }

    this.state.currentQuestionIndex += direction;

    if (this.state.currentQuestionIndex < 0) {
      this.state.currentQuestionIndex = 0;
    } else if (this.state.currentQuestionIndex >= this.questions.length) {
      this.completeAssessment();
      return;
    }

    await this.displayQuestion();
    this.saveState();
  }

  async completeAssessment() {
    if (!this.taskController) {
      this.taskController = await initTaskController();
    }

    this.behavioralTracker.stop();
    const behavioralData = this.behavioralTracker.getData();

    if (this.currentTask) {
      this.taskController.destroy();
    }

    this.stopAutoSave();
    this.state.currentScreen = 'results';

    const results = await this.calculateEnhancedResults(behavioralData);

    // Submit results to API if connected
    if (this.state.apiConnected) {
      await apiClient.submitResults({
        sessionId: this.state.sessionId,
        mode: this.state.currentMode,
        track: this.state.assessmentTrack,
        responses: this.state.responses,
        results: results,
        duration: Date.now() - this.state.startTime
      });
    }

    this.transitionToScreen('results');
    this.displayResults(results);
    this.clearSavedState();
    this.saveResultsToHistory(results);
  }

  // ... [Rest of the methods remain the same as original]

  initTheme() {
    const theme = localStorage.getItem('neurlyn-theme') || 'system';
    this.state.theme = theme;

    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('neurlyn-theme', newTheme);
    this.state.theme = newTheme;

    document.body.style.transition = 'background-color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  updateModeDescriptionsForNeurodiversity() {
    const modeOptions = document.querySelectorAll('.mode-option');
    const descriptions = {
      quick: 'Rapid screening<br>5-7 minutes',
      standard: 'Comprehensive evaluation<br>15-20 minutes',
      deep: 'Complete analysis<br>25-30 minutes'
    };

    modeOptions.forEach(option => {
      const mode = option.dataset.mode;
      const descElement = option.querySelector('p');
      if (descElement && descriptions[mode]) {
        descElement.innerHTML = descriptions[mode];
      }
    });
  }

  updateExpectedDuration(mode) {
    const durations = {
      quick: '5-7 minutes',
      standard: '15-20 minutes',
      deep: '25-30 minutes'
    };

    const descElement = document.querySelector('.description');
    if (descElement && durations[mode]) {
      const trackInfo = this.state.assessmentTrack ? ` (${this.state.assessmentTrack} track)` : '';
      descElement.innerHTML = `
        This assessment will take approximately <strong>${durations[mode]}</strong>${trackInfo}.
      `;
    }
  }

  setupGamifiedTaskCompletion() {
    const checkInterval = setInterval(async () => {
      if (this.currentTask && this.currentTask.response !== null) {
        clearInterval(checkInterval);

        if (!this.taskController) {
          this.taskController = await initTaskController();
        }

        const results = await this.taskController.getTaskResults();

        this.state.responses.push({
          questionIndex: this.state.currentQuestionIndex,
          questionId: this.questions[this.state.currentQuestionIndex].questionId,
          question: this.questions[this.state.currentQuestionIndex].question,
          category: this.questions[this.state.currentQuestionIndex].category,
          response: results,
          timestamp: Date.now(),
          taskType: this.questions[this.state.currentQuestionIndex].type
        });

        setTimeout(() => {
          if (this.state.currentQuestionIndex < this.questions.length - 1) {
            this.navigateQuestion(1);
          } else {
            this.completeAssessment();
          }
        }, 1500);
      }
    }, 100);
  }

  async calculateEnhancedResults(behavioralData) {
    const likertResponses = this.state.responses.filter(r => r.taskType === 'likert');
    const gamifiedResponses = this.state.responses.filter(r => r.taskType !== 'likert');

    const traits = this.calculateTraits(likertResponses);
    const gamifiedMetrics = this.analyzeGamifiedTasks(gamifiedResponses);
    const behavioralPatterns = behavioralData.patterns;

    const integratedData = this.integrateAssessmentData(
      traits,
      gamifiedMetrics,
      behavioralPatterns
    );

    const reportData = await this.reportGenerator.generateComprehensiveReport(
      integratedData.traits,
      this.state.responses,
      this.state.currentMode,
      Date.now() - this.state.startTime
    );

    return {
      ...reportData,
      behavioralInsights: this.generateBehavioralInsights(behavioralData),
      gamifiedInsights: this.generateGamifiedInsights(gamifiedResponses)
    };
  }

  calculateTraits(responses) {
    const traits = {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    };

    if (responses.length === 0) return traits;

    responses.forEach(response => {
      const value = response.response?.response?.value || 3;
      const score = ((value - 1) / 4) * 100;
      const trait = response.category.toLowerCase();

      if (traits[trait] !== undefined) {
        traits[trait] = (traits[trait] + score) / 2;
      }
    });

    return traits;
  }

  analyzeGamifiedTasks(responses) {
    const metrics = {};

    responses.forEach(response => {
      if (response.response.taskType === 'risk-balloon') {
        metrics.riskTolerance = response.response.riskMetrics?.riskTolerance || 0;
        metrics.learningAbility = response.response.riskMetrics?.learningCurve || 0;
        metrics.consistency = response.response.riskMetrics?.consistency || 0;
      }
    });

    return metrics;
  }

  integrateAssessmentData(traits, gamifiedMetrics, behavioralPatterns) {
    const weights = {
      traditional: 0.4,
      gamified: 0.35,
      behavioral: 0.25
    };

    const integrated = { ...traits };

    if (behavioralPatterns.engagement) {
      integrated.openness =
        traits.openness * weights.traditional +
        behavioralPatterns.engagement.score * 100 * weights.behavioral +
        (gamifiedMetrics.learningAbility || 0) * 100 * weights.gamified;
    }

    if (behavioralPatterns.precision) {
      integrated.conscientiousness =
        traits.conscientiousness * weights.traditional +
        behavioralPatterns.precision.score * 100 * weights.behavioral +
        (gamifiedMetrics.consistency || 0) * 100 * weights.gamified;
    }

    if (behavioralPatterns.anxiety) {
      integrated.neuroticism =
        traits.neuroticism * weights.traditional +
        behavioralPatterns.anxiety.score * 100 * weights.behavioral;
    }

    return {
      traits: integrated,
      confidence: this.calculateConfidence(weights)
    };
  }

  calculateConfidence(weights) {
    let confidence = (this.state.responses.length / this.questions.length) * 0.5;

    if (this.state.responses.some(r => r.taskType !== 'likert')) {
      confidence += 0.25;
    }

    if (this.behavioralTracker.getData().metrics.totalDuration > 0) {
      confidence += 0.25;
    }

    return Math.min(confidence, 1);
  }

  generateBehavioralInsights(behavioralData) {
    const insights = [];
    const patterns = behavioralData.patterns;

    if (patterns.impulsivity?.score > 0.6) {
      insights.push({
        type: 'impulsivity',
        title: 'Quick Decision Maker',
        description:
          'Your interaction patterns suggest you make decisions quickly and spontaneously.',
        score: patterns.impulsivity.score
      });
    }

    if (patterns.precision?.score > 0.7) {
      insights.push({
        type: 'precision',
        title: 'Detail Oriented',
        description:
          'Your careful movements and low error rate indicate strong attention to detail.',
        score: patterns.precision.score
      });
    }

    if (patterns.anxiety?.score > 0.5) {
      insights.push({
        type: 'anxiety',
        title: 'Thoughtful Consideration',
        description: 'You take time to consider your responses carefully before committing.',
        score: patterns.anxiety.score
      });
    }

    return insights;
  }

  generateGamifiedInsights(responses) {
    const insights = [];

    responses.forEach(response => {
      if (response.response.taskType === 'risk-balloon' && response.response.riskMetrics) {
        const metrics = response.response.riskMetrics;

        if (metrics.riskTolerance > 0.6) {
          insights.push({
            type: 'risk-taking',
            title: 'Calculated Risk Taker',
            description: `You demonstrated a ${(metrics.riskTolerance * 100).toFixed(0)}% risk tolerance level.`,
            metrics: metrics
          });
        }

        if (metrics.learningCurve > 0) {
          insights.push({
            type: 'adaptive-learning',
            title: 'Quick Learner',
            description: 'You showed improvement throughout the task, adapting your strategy.',
            metrics: metrics
          });
        }
      }
    });

    return insights;
  }

  displayResults(results) {
    const resultsContent = document.getElementById('results-content');
    if (!resultsContent) return;

    resultsContent.innerHTML = `
      <div class="results-summary">
        <h3>Your Personality Profile</h3>
        <div class="confidence-indicator">
          <span>Assessment Confidence: ${(results.confidence * 100).toFixed(0)}%</span>
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${results.confidence * 100}%"></div>
          </div>
        </div>
      </div>

      <div class="trait-results">
        ${this.renderTraitResults(results.traits)}
      </div>

      ${
        results.behavioralInsights?.length > 0
          ? `
        <div class="behavioral-insights">
          <h4>Behavioral Insights</h4>
          ${results.behavioralInsights
            .map(
              insight => `
            <div class="insight-card">
              <h5>${insight.title}</h5>
              <p>${insight.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        results.gamifiedInsights?.length > 0
          ? `
        <div class="gamified-insights">
          <h4>Task Performance Insights</h4>
          ${results.gamifiedInsights
            .map(
              insight => `
            <div class="insight-card">
              <h5>${insight.title}</h5>
              <p>${insight.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <div class="archetype-section">
        <h4>Your Personality Archetype</h4>
        <div class="archetype-card">
          <h5>${results.archetype.name}</h5>
          <p>${results.archetype.description}</p>
        </div>
      </div>

      <div class="recommendations-section">
        <h4>Personalized Recommendations</h4>
        ${results.recommendations
          .map(
            rec => `
          <div class="recommendation-card">
            <strong>${rec.area}:</strong> ${rec.suggestion}
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.addResultsInteractivity(results);
  }

  renderTraitResults(traits) {
    return Object.entries(traits)
      .map(
        ([trait, score]) => `
        <div class="trait-item">
          <div class="trait-header">
            <span class="trait-name">${trait.charAt(0).toUpperCase() + trait.slice(1)}</span>
            <span class="trait-score">${score.toFixed(0)}%</span>
          </div>
          <div class="trait-bar">
            <div class="trait-fill" style="width: ${score}%; background: ${this.getTraitColor(trait)};"></div>
          </div>
        </div>
      `
      )
      .join('');
  }

  getTraitColor(trait) {
    const colors = {
      openness: '#4ECDC4',
      conscientiousness: '#96E6B3',
      extraversion: '#F7DC6F',
      agreeableness: '#45B7D1',
      neuroticism: '#FF6B6B'
    };
    return colors[trait] || '#6C9E83';
  }

  addResultsInteractivity(results) {
    document.querySelectorAll('.insight-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = 'var(--shadow-lg)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'var(--shadow-md)';
      });
    });

    document.querySelectorAll('.recommendation-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });
    });
  }

  updateProgress() {
    const progress = ((this.state.currentQuestionIndex + 1) / this.questions.length) * 100;

    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const questionNum = document.getElementById('question-num');
    const totalQuestions = document.getElementById('total-questions');
    const breadcrumbQuestion = document.getElementById('breadcrumb-question');

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    if (questionNum) questionNum.textContent = this.state.currentQuestionIndex + 1;
    if (totalQuestions) totalQuestions.textContent = this.questions.length;
    if (breadcrumbQuestion) breadcrumbQuestion.textContent = this.state.currentQuestionIndex + 1;
  }

  updateNavigationButtons() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    if (prevButton) {
      prevButton.disabled = this.state.currentQuestionIndex === 0;
    }

    if (nextButton) {
      const isLastQuestion = this.state.currentQuestionIndex === this.questions.length - 1;
      nextButton.textContent = isLastQuestion ? 'Complete' : 'Next';

      if (this.currentTask && this.currentTask.type !== 'likert') {
        nextButton.disabled = true;
      } else {
        nextButton.disabled = false;
      }
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });

    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      targetScreen.classList.add('active');
      this.state.currentScreen = screenName;
    }
  }

  transitionToScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });

    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
    }

    this.state.currentScreen = screenName;
  }

  saveState() {
    const stateToSave = {
      ...this.state,
      questions: this.questions,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('neurlyn-assessment', JSON.stringify(stateToSave));
      this.showToast('Progress saved', 'success');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem('neurlyn-assessment');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 86400000) {
          // 24 hours
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
    return null;
  }

  clearSavedState() {
    localStorage.removeItem('neurlyn-assessment');
  }

  checkForSavedProgress() {
    const saved = this.loadSavedState();
    if (saved && saved.currentScreen === 'question') {
      this.showResumeDialog(saved);
    }
  }

  showResumeDialog(saved) {
    const dialog = document.createElement('div');
    dialog.className = 'resume-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Resume Assessment?</h3>
        <p>You have an assessment in progress.</p>
        <p>Progress: Question ${saved.currentQuestionIndex + 1}</p>
        <div class="dialog-actions">
          <button class="btn btn-primary" id="resume-yes">Resume</button>
          <button class="btn btn-secondary" id="resume-no">Start New</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    document.getElementById('resume-yes').addEventListener('click', () => {
      this.resumeAssessment(saved);
      dialog.remove();
    });

    document.getElementById('resume-no').addEventListener('click', () => {
      this.clearSavedState();
      dialog.remove();
    });
  }

  resumeAssessment(saved) {
    this.state = saved;
    this.questions = saved.questions;
    this.transitionToScreen('question');
    this.displayQuestion();
    this.startAutoSave();
    this.showToast('Assessment resumed', 'info');
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      if (this.state.currentScreen === 'question') {
        this.saveState();
      }
    }, 30000); // Every 30 seconds
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      if (this.state.currentScreen === 'question') {
        switch (e.key) {
          case 'ArrowLeft':
            this.navigateQuestion(-1);
            break;
          case 'ArrowRight':
          case 'Enter':
            if (!document.getElementById('next-button').disabled) {
              this.navigateQuestion(1);
            }
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            const options = document.querySelectorAll('.likert-option');
            const index = parseInt(e.key) - 1;
            if (options[index]) {
              options[index].click();
            }
            break;
        }
      }
    });
  }

  skipQuestion() {
    this.state.responses.push({
      questionIndex: this.state.currentQuestionIndex,
      questionId: this.questions[this.state.currentQuestionIndex].questionId,
      question: this.questions[this.state.currentQuestionIndex].question,
      category: this.questions[this.state.currentQuestionIndex].category,
      response: { skipped: true },
      timestamp: Date.now(),
      taskType: this.questions[this.state.currentQuestionIndex].type
    });

    this.navigateQuestion(1);
  }

  saveResultsToHistory(results) {
    try {
      const history = JSON.parse(localStorage.getItem('neurlyn-history') || '[]');
      history.push({
        date: Date.now(),
        mode: this.state.currentMode,
        results: results
      });

      if (history.length > 10) {
        history.shift();
      }

      localStorage.setItem('neurlyn-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  }

  downloadResults() {
    this.showToast('Preparing download...', 'info');
    // Implementation would go here
  }

  shareResults() {
    if (navigator.share) {
      navigator.share({
        title: 'My Neurlyn Assessment Results',
        text: 'Check out my personality profile!',
        url: window.location.href
      });
    } else {
      this.showToast('Sharing not available on this device', 'error');
    }
  }

  retakeAssessment() {
    location.reload();
  }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurlynApp = new NeurlynAPIIntegratedApp();
  });
} else {
  window.neurlynApp = new NeurlynAPIIntegratedApp();
}

export default NeurlynAPIIntegratedApp;
