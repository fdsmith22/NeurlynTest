/**
 * Neurlyn - Clean Minimal App
 * Simplified assessment platform without heavy animations
 */

class NeurlynApp {
  constructor() {
    this.state = {
      currentMode: null,
      currentScreen: 'welcome',
      currentQuestionIndex: 0,
      responses: [],
      startTime: null
    };

    this.questions = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadQuestions();
  }

  setupEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.addEventListener('click', e => {
        this.selectMode(e.currentTarget.dataset.mode);
      });
    });

    // Start button
    const startBtn = document.getElementById('start-assessment');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAssessment());
    }

    // Navigation
    const prevBtn = document.getElementById('prev-button');
    const nextBtn = document.getElementById('next-button');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateQuestion(1));
    }

    // Results actions
    const downloadBtn = document.getElementById('download-results');
    const shareBtn = document.getElementById('share-results');
    const retakeBtn = document.getElementById('retake-assessment');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadResults());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareResults());
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => this.retakeAssessment());
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (this.state.currentScreen === 'question') {
        if (e.key === 'ArrowLeft') this.navigateQuestion(-1);
        if (e.key === 'ArrowRight' && !document.getElementById('next-button').disabled) {
          this.navigateQuestion(1);
        }
      }
    });
  }

  selectMode(mode) {
    this.state.currentMode = mode;

    // Update UI
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.mode === mode) {
        btn.classList.add('selected');
      }
    });

    // Enable start button
    const startBtn = document.getElementById('start-assessment');
    if (startBtn) {
      startBtn.disabled = false;
      const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
      startBtn.textContent = `Begin ${modeText} Assessment`;
    }
  }

  loadQuestions() {
    // Load questions based on mode
    this.questions = this.generateQuestions();
  }

  generateQuestions() {
    // Simplified question set
    const baseQuestions = [
      {
        text: 'I enjoy working in teams and collaborating with others.',
        category: 'Extraversion',
        type: 'likert'
      },
      {
        text: 'I prefer to plan things out in detail before starting.',
        category: 'Conscientiousness',
        type: 'likert'
      },
      {
        text: "I find it easy to empathize with others' feelings.",
        category: 'Agreeableness',
        type: 'likert'
      },
      {
        text: 'I enjoy exploring new ideas and concepts.',
        category: 'Openness',
        type: 'likert'
      },
      {
        text: 'I remain calm under pressure.',
        category: 'Emotional Stability',
        type: 'likert'
      },
      {
        text: 'I take initiative in group settings.',
        category: 'Leadership',
        type: 'likert'
      },
      {
        text: 'I pay attention to small details.',
        category: 'Conscientiousness',
        type: 'likert'
      },
      {
        text: 'I enjoy meeting new people.',
        category: 'Extraversion',
        type: 'likert'
      },
      {
        text: 'I prefer routine over spontaneity.',
        category: 'Openness',
        type: 'likert',
        reverse: true
      },
      {
        text: 'I find it easy to trust others.',
        category: 'Agreeableness',
        type: 'likert'
      }
    ];

    // Adjust question count based on mode
    let questionCount = 10;
    if (this.state.currentMode === 'standard') questionCount = 20;
    if (this.state.currentMode === 'deep') questionCount = 30;

    // Repeat and shuffle questions to reach desired count
    const questions = [];
    while (questions.length < questionCount) {
      questions.push(...baseQuestions.map(q => ({ ...q })));
    }

    return questions.slice(0, questionCount);
  }

  startAssessment() {
    if (!this.state.currentMode) return;

    this.state.startTime = Date.now();
    this.state.currentQuestionIndex = 0;
    this.state.responses = [];

    this.transitionToScreen('question');
    this.displayQuestion();
    this.updateProgress();
  }

  displayQuestion() {
    const question = this.questions[this.state.currentQuestionIndex];
    if (!question) return;

    // Update header
    document.getElementById('question-num').textContent = this.state.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = this.questions.length;
    document.getElementById('question-category').textContent = question.category;

    // Render question
    const contentEl = document.getElementById('question-content');
    contentEl.innerHTML = `
            <h3 class="question-text">${question.text}</h3>
            <div class="likert-scale">
                <button class="likert-option" data-value="1">
                    <span class="likert-label">Strongly Disagree</span>
                </button>
                <button class="likert-option" data-value="2">
                    <span class="likert-label">Disagree</span>
                </button>
                <button class="likert-option" data-value="3">
                    <span class="likert-label">Neutral</span>
                </button>
                <button class="likert-option" data-value="4">
                    <span class="likert-label">Agree</span>
                </button>
                <button class="likert-option" data-value="5">
                    <span class="likert-label">Strongly Agree</span>
                </button>
            </div>
        `;

    // Setup click handlers
    contentEl.querySelectorAll('.likert-option').forEach(btn => {
      btn.addEventListener('click', e => {
        this.selectAnswer(e.currentTarget.dataset.value);
      });
    });

    // Load previous response if exists
    const previousResponse = this.state.responses[this.state.currentQuestionIndex];
    if (previousResponse) {
      const btn = contentEl.querySelector(`[data-value="${previousResponse.value}"]`);
      if (btn) btn.classList.add('selected');
      document.getElementById('next-button').disabled = false;
    } else {
      document.getElementById('next-button').disabled = true;
    }

    // Update navigation buttons
    document.getElementById('prev-button').disabled = this.state.currentQuestionIndex === 0;
  }

  selectAnswer(value) {
    // Update UI
    document.querySelectorAll('.likert-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.querySelector(`[data-value="${value}"]`).classList.add('selected');

    // Store response
    this.state.responses[this.state.currentQuestionIndex] = {
      questionIndex: this.state.currentQuestionIndex,
      value: parseInt(value),
      category: this.questions[this.state.currentQuestionIndex].category,
      timestamp: Date.now()
    };

    // Enable next button
    document.getElementById('next-button').disabled = false;
  }

  navigateQuestion(direction) {
    const newIndex = this.state.currentQuestionIndex + direction;

    if (newIndex < 0 || newIndex > this.questions.length) return;

    if (newIndex === this.questions.length) {
      // Complete assessment
      this.completeAssessment();
    } else {
      this.state.currentQuestionIndex = newIndex;
      this.displayQuestion();
      this.updateProgress();
    }
  }

  updateProgress() {
    const progress = ((this.state.currentQuestionIndex + 1) / this.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
  }

  completeAssessment() {
    this.showLoading('Analyzing your responses...');

    // Simulate processing
    setTimeout(() => {
      const results = this.calculateResults();
      this.hideLoading();
      this.displayResults(results);
    }, 1500);
  }

  calculateResults() {
    // Simple result calculation
    const categories = {};

    this.state.responses.forEach(response => {
      if (!categories[response.category]) {
        categories[response.category] = {
          total: 0,
          count: 0
        };
      }
      categories[response.category].total += response.value;
      categories[response.category].count++;
    });

    const results = {};
    for (const category in categories) {
      results[category] = Math.round(
        (categories[category].total / categories[category].count) * 20
      );
    }

    return results;
  }

  displayResults(results) {
    this.transitionToScreen('results');

    const contentEl = document.getElementById('results-content');
    let html = '<div class="results-grid">';

    for (const category in results) {
      html += `
                <div class="result-item">
                    <h4>${category}</h4>
                    <div class="result-bar">
                        <div class="result-fill" style="width: ${results[category]}%"></div>
                    </div>
                    <span class="result-percentage">${results[category]}%</span>
                </div>
            `;
    }

    html += '</div>';

    // Add summary
    const timeElapsed = Math.round((Date.now() - this.state.startTime) / 60000);
    html += `
            <div class="results-summary">
                <p>Assessment completed in ${timeElapsed} minutes</p>
                <p>Based on ${this.state.responses.length} responses</p>
            </div>
        `;

    contentEl.innerHTML = html;
  }

  downloadResults() {
    // Placeholder for download functionality
    alert('Download feature coming soon');
  }

  shareResults() {
    // Placeholder for share functionality
    alert('Share feature coming soon');
  }

  retakeAssessment() {
    this.state = {
      currentMode: null,
      currentScreen: 'welcome',
      currentQuestionIndex: 0,
      responses: [],
      startTime: null
    };
    this.transitionToScreen('welcome');
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById('start-assessment').disabled = true;
  }

  transitionToScreen(screen) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.add('hidden');
    });

    // Show target screen
    const targetScreen = document.getElementById(`${screen}-screen`);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.state.currentScreen = screen;
    }
  }

  showLoading(message = 'Loading...') {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.querySelector('p').textContent = message;
      this.transitionToScreen('loading');
    }
  }

  hideLoading() {
    const currentScreen =
      this.state.currentScreen === 'loading' ? 'welcome' : this.state.currentScreen;
    this.transitionToScreen(currentScreen);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neurlynApp = new NeurlynApp();
  });
} else {
  window.neurlynApp = new NeurlynApp();
}

export default NeurlynApp;
