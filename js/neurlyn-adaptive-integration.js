/**
 * Neurlyn Adaptive Assessment Integration
 * Connects frontend to backend adaptive assessment and report generation
 */

/* global ReportDisplayComponent, ComprehensiveReportGenerator */

class NeurlynAdaptiveAssessment {
  constructor() {
    this.apiBase =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002/api'
        : '/api';
    this.currentSession = null;
    this.currentQuestions = [];
    this.responses = [];
    this.progress = { current: 0, total: 0 };
    this.pathways = [];
  }

  /**
   * Initialize assessment with user preferences
   */
  async startAssessment(options = {}) {
    const { tier = 'standard', concerns = [], demographics = {} } = options;

    // Store tier for later use
    this.tier = tier;

    try {
      // Show loading state
      this.showLoading('Initializing your personalized assessment...');

      // console.log('Starting assessment with API:', `${this.apiBase}/assessments/adaptive`);
      // console.log('Request body:', { tier, concerns, demographics });

      const response = await fetch(`${this.apiBase}/assessments/adaptive-optimized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          assessmentType: 'personality',
          targetTraits: [
            'openness',
            'conscientiousness',
            'extraversion',
            'agreeableness',
            'neuroticism'
          ],
          previousResponses: this.responses || [],
          userProfile: demographics || {}
        })
      });

      const data = await response.json();
      // console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start assessment');
      }

      // Store session data from the correct response format
      this.currentSession = `adaptive_${Date.now()}`;
      this.progress = { current: 0, total: data.totalQuestions || data.questions?.length || 45 };
      this.currentQuestions = data.questions || [];

      // console.log('Questions received:', this.currentQuestions.length);

      // Initialize UI
      this.initializeAssessmentUI();

      // Check if questions exist before displaying
      if (this.currentQuestions.length > 0) {
        this.displayQuestions(this.currentQuestions);
        // console.log('Questions displayed successfully');
      } else {
        console.error('No questions received from API');
        this.showError('No questions available. Please try again.');
      }

      // Store in localStorage for recovery
      localStorage.setItem(
        'activeAssessment',
        JSON.stringify({
          sessionId: this.currentSession,
          tier,
          startTime: new Date().toISOString()
        })
      );

      return data;
    } catch (error) {
      console.error('Failed to start assessment:', error);
      console.error('API URL:', `${this.apiBase}/assessments/adaptive`);
      console.error('Request payload:', { tier, concerns, demographics });
      console.error('Error details:', error);

      // Show actual error to help debug
      const errorMessage = error.message || 'Connection failed';
      console.error('Showing error to user:', errorMessage);
      this.showError(`Unable to start assessment: ${errorMessage}`);

      // Don't throw the error, just return null
      return null;
    }
  }

  /**
   * Initialize the assessment UI
   */
  initializeAssessmentUI() {
    const container = document.getElementById('assessment-container') || document.body;

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
                    <button id="next-btn" class="btn-primary" onclick="assessment.submitAnswer()">
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
   * Display current questions
   */
  displayQuestions(questions) {
    const container = document.getElementById('question-container');
    if (!container) return;

    container.innerHTML = questions
      .map(
        (q, index) => `
            <div class="question-card ${index > 0 ? 'hidden' : 'active'}" data-question-id="${q._id}">
                <div class="question-header">
                    <span class="question-category">${this.formatCategory(q.category)}</span>
                    ${q.subcategory ? `<span class="question-subcategory">${this.formatCategory(q.subcategory)}</span>` : ''}
                </div>

                <h3 class="question-text">${q.text}</h3>

                <div class="response-options">
                    ${this.renderResponseOptions(q)}
                </div>

                ${q.context ? `<p class="question-context">${q.context}</p>` : ''}
            </div>
        `
      )
      .join('');

    // Add event listeners
    this.attachResponseListeners();
  }

  /**
   * Render response options based on question type
   */
  renderResponseOptions(question) {
    const { responseType = 'likert', options = [] } = question;

    if (responseType === 'likert') {
      return `
                <div class="likert-scale" data-question-id="${question._id}">
                    ${options
                      .map(
                        (opt, i) => `
                        <label class="likert-option">
                            <input type="radio" name="q-${question._id}" value="${opt.value}" data-index="${i}" data-score="${opt.score}">
                            <span class="likert-value">${opt.value}</span>
                            <span class="likert-label">${opt.label}</span>
                        </label>
                    `
                      )
                      .join('')}
                </div>
            `;
    } else if (responseType === 'multiple_choice') {
      return `
                <div class="multiple-choice" data-question-id="${question._id}">
                    ${options
                      .map(
                        (opt, i) => `
                        <label class="mc-option">
                            <input type="radio" name="q-${question._id}" value="${opt}" data-index="${i}">
                            <span class="mc-label">${opt}</span>
                        </label>
                    `
                      )
                      .join('')}
                </div>
            `;
    } else if (responseType === 'slider') {
      return `
                <div class="slider-container" data-question-id="${question._id}">
                    <input type="range" min="0" max="100" value="50" class="slider" id="slider-${question._id}">
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
    if (!currentQuestion) return;

    const response = this.collectResponse(currentQuestion);
    if (!response) {
      this.showMessage('Please select an answer');
      return;
    }

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
      this.showLoading('Generating your personalized report...');

      const response = await fetch(`${this.apiBase}/adaptive/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSession
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete assessment');
      }

      // Clear localStorage
      localStorage.removeItem('activeAssessment');

      // Show summary
      this.showAssessmentSummary(data.summary);

      // Generate report
      setTimeout(() => {
        this.generateReport(this.currentSession);
      }, 2000);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      this.showError('Unable to complete assessment. Your progress has been saved.');
    }
  }

  /**
   * Generate and display report
   */
  async generateReport(sessionId) {
    try {
      this.showLoading('Creating your comprehensive report...');

      const response = await fetch(`${this.apiBase}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      // Initialize report display component if not already loaded
      if (!window.reportDisplay) {
        window.reportDisplay = new ReportDisplayComponent();
      }

      // Initialize comprehensive report generator if not already loaded
      if (!window.reportGenerator) {
        window.reportGenerator = new ComprehensiveReportGenerator();
      }

      // Generate comprehensive report
      const comprehensiveReport = await window.reportGenerator.generateComprehensiveReport({
        responses: this.responses,
        results: data.report,
        sessionId: sessionId,
        pathways: this.pathways,
        tier: this.tier || 'standard'
      });

      // Display report using ReportDisplayComponent
      const reportContainer = await window.reportDisplay.renderReport(comprehensiveReport);

      // Clear assessment container and display report
      const assessmentContainer = document.getElementById('assessment-container');
      if (assessmentContainer) {
        assessmentContainer.innerHTML = '';
        assessmentContainer.appendChild(reportContainer);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      this.showError('Unable to generate report. Please contact support.');
    }
  }

  /**
   * Simple report display fallback
   */
  displaySimpleReport(report) {
    const container = document.getElementById('assessment-container');
    if (!container) return;

    container.innerHTML = `
            <div class="simple-report">
                <h2>Assessment Report</h2>
                <div class="report-section">
                    <h3>Results</h3>
                    <pre>${JSON.stringify(report, null, 2)}</pre>
                </div>
                <button onclick="location.reload()" class="btn btn-primary">
                    Start New Assessment
                </button>
            </div>
        `;
  }

  /**
   * Show assessment summary
   */
  showAssessmentSummary(summary) {
    const container = document.getElementById('assessment-container');

    container.innerHTML = `
            <div class="assessment-complete">
                <div class="complete-icon">✓</div>
                <h2>Assessment Complete!</h2>

                <div class="summary-card">
                    <h3>Your Profile: ${summary.primaryProfile}</h3>
                    <div class="confidence-meter">
                        <div class="confidence-label">Confidence Level</div>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${summary.confidence}"></div>
                        </div>
                        <div class="confidence-value">${summary.confidence}</div>
                    </div>
                </div>

                <div class="pathways-activated">
                    <h4>Assessment Pathways Explored:</h4>
                    <div class="pathway-badges">
                        ${summary.pathwaysActivated
                          .map(
                            p => `
                            <span class="pathway-badge">${this.formatPathway(p)}</span>
                        `
                          )
                          .join('')}
                    </div>
                </div>

                <div class="quick-recommendations">
                    <h4>Immediate Recommendations:</h4>
                    <ul>
                        ${summary.recommendations.immediate.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>

                <p class="generating-report">Generating your detailed report...</p>
            </div>
        `;
  }

  /**
   * Helper methods
   */
  getCurrentQuestion() {
    const activeCard = document.querySelector('.question-card.active');
    if (!activeCard) return null;

    const questionId = activeCard.dataset.questionId;
    return this.currentQuestions.find(q => q._id === questionId);
  }

  collectResponse(question) {
    const questionId = question._id;
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
      input.addEventListener('change', () => {
        // Enable next button when answer selected
        document.getElementById('next-btn').disabled = false;
      });
    });

    // Slider listeners
    document.querySelectorAll('.slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const value = e.target.value;
        const label = e.target.parentElement.querySelector('.slider-value');
        if (label) label.textContent = value;
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
      quick: 'Quick Screening (5-7 min)',
      standard: 'Standard Assessment (15-20 min)',
      deep: 'Deep Dive (25-35 min)'
    };
    return labels[this.tier] || 'Assessment';
  }

  /**
   * UI Helper methods
   */
  showLoading(message) {
    const container = document.getElementById('assessment-container');
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
    console.error('ShowError called:', message, error);

    let container = document.getElementById('assessment-container');

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
                    <div class="error-icon" style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
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
   * Resume assessment from localStorage
   */
  async resumeAssessment() {
    const saved = localStorage.getItem('activeAssessment');
    if (!saved) return false;

    try {
      const { sessionId } = JSON.parse(saved);

      const response = await fetch(`${this.apiBase}/adaptive/progress/${sessionId}`);
      const data = await response.json();

      if (response.ok && !data.isComplete) {
        this.currentSession = sessionId;
        this.progress = data.progress;
        this.pathways = data.pathwaysActivated || [];

        // Resume assessment UI
        this.initializeAssessmentUI();

        // Get next questions
        await this.submitAnswer();

        return true;
      }
    } catch (error) {
      console.error('Failed to resume assessment:', error);
    }

    localStorage.removeItem('activeAssessment');
    return false;
  }
}

// Initialize global instance
const assessment = new NeurlynAdaptiveAssessment();
window.assessment = assessment;
window.NeurlynAdaptiveAssessment = NeurlynAdaptiveAssessment;

// Log that the module is loaded
// console.log('NeurlynAdaptiveAssessment loaded and initialized');
// console.log('window.assessment:', window.assessment);

// Auto-resume on page load
document.addEventListener('DOMContentLoaded', async () => {
  // console.log('DOMContentLoaded - checking for assessment resume');
  const resumed = await assessment.resumeAssessment();
  if (!resumed) {
    // Check if we should start a new assessment
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier');
    if (tier) {
      // console.log('Starting assessment from URL parameter:', tier);
      assessment.startAssessment({ tier });
    }
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeurlynAdaptiveAssessment;
}
