/**
 * Neurlyn Enhanced - Polished Minimal App
 * With localStorage, dark mode, keyboard shortcuts, and enhanced UX
 */

import { ReportGenerator } from './report-generator.js';

class NeurlynApp {
  constructor() {
    this.state = {
      currentMode: null,
      currentScreen: 'welcome',
      currentQuestionIndex: 0,
      responses: [],
      startTime: null,
      sessionId: this.generateSessionId(),
      isPaused: false,
      theme: 'system'
    };

    this.questions = [];
    this.autoSaveInterval = null;
    this.reportGenerator = new ReportGenerator();
    this.init();
  }

  init() {
    this.initTheme();
    this.loadSavedState();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.loadQuestions();
    this.checkForSavedProgress();
    this.initServiceWorker();
  }

  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem('neurlyn-theme') || 'system';
    this.state.theme = savedTheme;

    if (savedTheme === 'system') {
      // Let CSS handle it with prefers-color-scheme
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Theme toggle button
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

    // Smooth transition animation
    document.body.style.transition = 'background-color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  // LocalStorage Management
  saveState() {
    const stateToSave = {
      ...this.state,
      questions: this.questions,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('neurlyn-assessment', JSON.stringify(stateToSave));
      this.showToast('Progress saved', 'success');
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem('neurlyn-assessment');
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Check if saved state is less than 24 hours old
        if (Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000) {
          return parsedState;
        }
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    return null;
  }

  clearSavedState() {
    localStorage.removeItem('neurlyn-assessment');
  }

  // Enhanced Event Listeners
  setupEventListeners() {
    // Mode selection with smooth transitions
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.addEventListener('click', e => {
        this.selectMode(e.currentTarget.dataset.mode);
        this.addRippleEffect(e);
      });
    });

    // Start button
    const startBtn = document.getElementById('start-assessment');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAssessment());
    }

    // Navigation with animations
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
    const homeBtn = document.getElementById('home-button');
    const skipBtn = document.getElementById('skip-button');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadResults());
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareResults());
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => this.retakeAssessment());
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.goHome());
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skipQuestion());
    }

    // Auto-save on page unload
    window.addEventListener('beforeunload', () => {
      if (this.state.currentScreen === 'question') {
        this.saveState();
      }
    });

    // Visibility change detection for auto-pause
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.currentScreen === 'question') {
        this.pauseAssessment();
      }
    });
  }

  // Keyboard Shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (this.state.currentScreen === 'question') {
              this.saveState();
            }
            break;
          case 'd':
            e.preventDefault();
            this.toggleTheme();
            break;
        }
      }

      // Screen-specific shortcuts
      if (this.state.currentScreen === 'question' && !e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            this.navigateQuestion(-1);
            break;
          case 'ArrowRight':
            if (!document.getElementById('next-button').disabled) {
              this.navigateQuestion(1);
            }
            break;
          case 'Enter':
            if (!document.getElementById('next-button').disabled) {
              this.navigateQuestion(1);
            }
            break;
          case 'Escape':
            this.pauseAssessment();
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

  // Enhanced Mode Selection
  selectMode(mode) {
    this.state.currentMode = mode;

    // Animate selection
    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.classList.remove('selected', 'selecting');
      if (btn.dataset.mode === mode) {
        btn.classList.add('selecting');
        setTimeout(() => {
          btn.classList.remove('selecting');
          btn.classList.add('selected');
        }, 150);
      }
    });

    // Enable start button with animation
    const startBtn = document.getElementById('start-assessment');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.classList.add('pulse');
      const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
      startBtn.textContent = `Begin ${modeText} Assessment`;

      setTimeout(() => startBtn.classList.remove('pulse'), 600);
    }

    // Update question count based on mode
    this.updateExpectedDuration(mode);
  }

  updateExpectedDuration(mode) {
    const durations = {
      quick: '5-7 minutes',
      standard: '15-20 minutes',
      deep: '25-30 minutes'
    };

    const durationElement = document.getElementById('expected-duration');
    if (durationElement) {
      durationElement.textContent = durations[mode];
    }
  }

  // Progress Management
  checkForSavedProgress() {
    const saved = this.loadSavedState();
    if (saved && saved.currentScreen === 'question') {
      this.showResumeDialog(saved);
    }
  }

  showResumeDialog(savedState) {
    const dialog = document.createElement('div');
    dialog.className = 'resume-dialog';
    dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Resume Assessment?</h3>
                <p>You have an assessment in progress from ${this.formatTime(savedState.timestamp)}.</p>
                <p>Progress: Question ${savedState.currentQuestionIndex + 1} of ${savedState.questions.length}</p>
                <div class="dialog-actions">
                    <button class="btn btn-primary" id="resume-yes">Resume</button>
                    <button class="btn btn-secondary" id="resume-no">Start New</button>
                </div>
            </div>
        `;

    document.body.appendChild(dialog);

    document.getElementById('resume-yes').addEventListener('click', () => {
      this.resumeAssessment(savedState);
      dialog.remove();
    });

    document.getElementById('resume-no').addEventListener('click', () => {
      this.clearSavedState();
      dialog.remove();
    });
  }

  resumeAssessment(savedState) {
    this.state = savedState;
    this.questions = savedState.questions;
    this.transitionToScreen('question');
    this.displayQuestion();
    this.startAutoSave();
    this.showToast('Assessment resumed', 'info');
  }

  pauseAssessment() {
    this.state.isPaused = true;
    this.saveState();
    this.showToast('Assessment paused', 'info');
  }

  // Auto-save functionality
  startAutoSave() {
    // Save every 5 responses or every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.state.currentScreen === 'question') {
        this.saveState();
      }
    }, 30000);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Enhanced Questions
  loadQuestions() {
    // Enhanced question set with better variety
    this.questions = this.generateEnhancedQuestions();
  }

  generateEnhancedQuestions() {
    const baseQuestions = [
      {
        text: 'I enjoy working in teams and collaborating with others.',
        category: 'Extraversion',
        type: 'likert',
        weight: 1
      },
      {
        text: 'I prefer to plan things out in detail before starting.',
        category: 'Conscientiousness',
        type: 'likert',
        weight: 1
      },
      {
        text: "I find it easy to empathize with others' feelings.",
        category: 'Agreeableness',
        type: 'likert',
        weight: 1
      },
      {
        text: 'I enjoy exploring new ideas and concepts.',
        category: 'Openness',
        type: 'likert',
        weight: 1
      },
      {
        text: 'I remain calm under pressure.',
        category: 'Emotional Stability',
        type: 'likert',
        weight: 1
      }
    ];

    // Adjust based on mode
    let questionCount = 10;
    if (this.state.currentMode === 'standard') questionCount = 20;
    if (this.state.currentMode === 'deep') questionCount = 30;

    const questions = [];
    while (questions.length < questionCount) {
      questions.push(
        ...baseQuestions.map(q => ({
          ...q,
          id: this.generateQuestionId()
        }))
      );
    }

    // Shuffle for variety
    return this.shuffleArray(questions.slice(0, questionCount));
  }

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Enhanced Start Assessment
  startAssessment() {
    if (!this.state.currentMode) return;

    this.state.startTime = Date.now();
    this.state.currentQuestionIndex = 0;
    this.state.responses = [];

    // Smooth transition
    this.fadeTransition('welcome-screen', 'question-screen');

    setTimeout(() => {
      this.displayQuestion();
      this.updateProgress();
      this.startAutoSave();
    }, 300);
  }

  // Enhanced Question Display
  displayQuestion() {
    const question = this.questions[this.state.currentQuestionIndex];
    if (!question) return;

    // Update header with animation
    this.animateNumber('question-num', this.state.currentQuestionIndex + 1);
    this.animateNumber('total-questions', this.questions.length);

    const categoryBadge = document.getElementById('question-category');
    categoryBadge.style.opacity = '0';
    setTimeout(() => {
      categoryBadge.textContent = question.category;
      categoryBadge.style.opacity = '1';
    }, 150);

    // Render question with fade effect
    const contentEl = document.getElementById('question-content');
    contentEl.style.opacity = '0';

    setTimeout(() => {
      contentEl.innerHTML = this.renderEnhancedQuestion(question);
      contentEl.style.opacity = '1';
      this.setupQuestionInteractions(question);
    }, 200);

    // Load previous response
    const previousResponse = this.state.responses[this.state.currentQuestionIndex];
    if (previousResponse) {
      setTimeout(() => {
        const btn = contentEl.querySelector(`[data-value="${previousResponse.value}"]`);
        if (btn) {
          btn.classList.add('selected');
          document.getElementById('next-button').disabled = false;
        }
      }, 300);
    } else {
      document.getElementById('next-button').disabled = true;
    }

    // Update navigation
    document.getElementById('prev-button').disabled = this.state.currentQuestionIndex === 0;

    this.updateProgress();
    this.updateBreadcrumb();
  }

  renderEnhancedQuestion(question) {
    return `
            <h3 class="question-text">${question.text}</h3>
            <div class="likert-scale">
                <button class="likert-option" data-value="1" aria-label="Strongly Disagree">
                    <span class="likert-value">1</span>
                    <span class="likert-label">Strongly<br>Disagree</span>
                </button>
                <button class="likert-option" data-value="2" aria-label="Disagree">
                    <span class="likert-value">2</span>
                    <span class="likert-label">Disagree</span>
                </button>
                <button class="likert-option" data-value="3" aria-label="Neutral">
                    <span class="likert-value">3</span>
                    <span class="likert-label">Neutral</span>
                </button>
                <button class="likert-option" data-value="4" aria-label="Agree">
                    <span class="likert-value">4</span>
                    <span class="likert-label">Agree</span>
                </button>
                <button class="likert-option" data-value="5" aria-label="Strongly Agree">
                    <span class="likert-value">5</span>
                    <span class="likert-label">Strongly<br>Agree</span>
                </button>
            </div>
            <div class="keyboard-hint">
                Press 1-5 to select • Enter to continue • ← → to navigate
            </div>
        `;
  }

  setupQuestionInteractions(question) {
    const options = document.querySelectorAll('.likert-option');
    options.forEach((option, index) => {
      option.addEventListener('click', e => {
        this.selectAnswer(e.currentTarget.dataset.value);
        this.addRippleEffect(e);
      });

      // Add hover sound effect (if enabled)
      option.addEventListener('mouseenter', () => {
        this.playSound('hover');
      });
    });
  }

  selectAnswer(value) {
    // Visual feedback
    document.querySelectorAll('.likert-option').forEach(btn => {
      btn.classList.remove('selected', 'selecting');
    });

    const selectedBtn = document.querySelector(`[data-value="${value}"]`);
    selectedBtn.classList.add('selecting');

    setTimeout(() => {
      selectedBtn.classList.remove('selecting');
      selectedBtn.classList.add('selected');
    }, 150);

    // Store response
    this.state.responses[this.state.currentQuestionIndex] = {
      questionIndex: this.state.currentQuestionIndex,
      questionId: this.questions[this.state.currentQuestionIndex].id,
      value: parseInt(value),
      category: this.questions[this.state.currentQuestionIndex].category,
      timestamp: Date.now()
    };

    // Enable next button
    const nextBtn = document.getElementById('next-button');
    nextBtn.disabled = false;
    nextBtn.classList.add('pulse');
    setTimeout(() => nextBtn.classList.remove('pulse'), 300);

    // Auto-advance after short delay (optional)
    if (this.state.autoAdvance) {
      setTimeout(() => this.navigateQuestion(1), 800);
    }

    // Play selection sound
    this.playSound('select');

    // Save progress every 5 questions
    if ((this.state.currentQuestionIndex + 1) % 5 === 0) {
      this.saveState();
    }
  }

  // Enhanced Navigation
  navigateQuestion(direction) {
    const newIndex = this.state.currentQuestionIndex + direction;

    if (newIndex < 0 || newIndex > this.questions.length) return;

    if (newIndex === this.questions.length) {
      // Show review modal before completing
      this.showReviewModal();
    } else {
      // Smooth transition
      const contentEl = document.getElementById('question-content');
      const slideClass = direction > 0 ? 'slide-left' : 'slide-right';

      contentEl.classList.add(slideClass);

      setTimeout(() => {
        this.state.currentQuestionIndex = newIndex;
        this.displayQuestion();
        contentEl.classList.remove(slideClass);

        // Update next button text on last question
        if (newIndex === this.questions.length - 1) {
          const nextBtn = document.getElementById('next-button');
          if (nextBtn) {
            nextBtn.innerHTML =
              'Review & Submit <svg width="16" height="16"><use href="assets/icons/icons.svg#icon-check"></use></svg>';
          }
        }
      }, 200);
    }
  }

  // Enhanced Progress
  updateProgress() {
    const progress = ((this.state.currentQuestionIndex + 1) / this.questions.length) * 100;
    const progressFill = document.getElementById('progress-fill');

    progressFill.style.width = `${progress}%`;

    // Animate percentage
    this.animateNumber('progress-percent', Math.round(progress), '%');

    // Update time estimate
    this.updateTimeEstimate();
  }

  updateTimeEstimate() {
    if (!this.state.startTime) return;

    const elapsed = Date.now() - this.state.startTime;
    const avgTimePerQuestion = elapsed / (this.state.currentQuestionIndex + 1);
    const remainingQuestions = this.questions.length - this.state.currentQuestionIndex - 1;
    const estimatedRemaining = avgTimePerQuestion * remainingQuestions;

    const element = document.getElementById('time-remaining');
    if (element) {
      element.textContent = this.formatDuration(estimatedRemaining);
    }
  }

  // Complete Assessment
  async completeAssessment() {
    this.stopAutoSave();
    this.showLoading('Analyzing your responses...');

    // Simulate processing with progress
    await this.simulateProcessing();

    const results = this.calculateEnhancedResults();

    this.hideLoading();
    this.fadeTransition('question-screen', 'results-screen');

    setTimeout(() => {
      this.displayEnhancedResults(results);
      this.clearSavedState();
    }, 300);
  }

  async simulateProcessing() {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        const loadingText = document.querySelector('.loading-container p');
        if (loadingText) {
          const messages = [
            'Analyzing responses...',
            'Calculating personality traits...',
            'Generating insights...',
            'Preparing your report...'
          ];
          loadingText.textContent = messages[Math.floor(progress / 25)];
        }

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }

  calculateEnhancedResults() {
    const categories = {};

    this.state.responses.forEach(response => {
      if (!categories[response.category]) {
        categories[response.category] = {
          total: 0,
          count: 0,
          scores: []
        };
      }
      categories[response.category].total += response.value;
      categories[response.category].count++;
      categories[response.category].scores.push(response.value);
    });

    const results = {};
    for (const category in categories) {
      const avg = categories[category].total / categories[category].count;
      results[category] = {
        score: Math.round(avg * 20),
        raw: avg,
        percentile: this.calculatePercentile(avg),
        interpretation: this.getInterpretation(category, avg)
      };
    }

    return results;
  }

  calculatePercentile(score) {
    // Simplified percentile calculation
    const normalized = (score - 1) / 4;
    return Math.round(normalized * 100);
  }

  getInterpretation(category, score) {
    const interpretations = {
      high: {
        Extraversion: 'You tend to be outgoing, energetic, and enjoy social interactions.',
        Conscientiousness: 'You are organized, dependable, and goal-oriented.',
        Agreeableness: 'You are compassionate, cooperative, and value harmony.',
        Openness: 'You are creative, curious, and open to new experiences.',
        'Emotional Stability': 'You handle stress well and maintain emotional balance.'
      },
      medium: {
        Extraversion: 'You balance social interaction with alone time.',
        Conscientiousness: 'You are moderately organized and flexible.',
        Agreeableness: 'You balance cooperation with assertiveness.',
        Openness: 'You appreciate both tradition and innovation.',
        'Emotional Stability': 'You experience a typical range of emotions.'
      },
      low: {
        Extraversion: 'You prefer quieter environments and smaller social circles.',
        Conscientiousness: 'You value flexibility and spontaneity.',
        Agreeableness: 'You are direct and value honesty over harmony.',
        Openness: 'You prefer familiarity and established methods.',
        'Emotional Stability': 'You experience emotions intensely and deeply.'
      }
    };

    let level = 'medium';
    if (score > 3.5) level = 'high';
    else if (score < 2.5) level = 'low';

    return interpretations[level][category] || '';
  }

  displayEnhancedResults(results) {
    // Generate comprehensive report
    const duration = Date.now() - this.state.startTime;
    const report = this.reportGenerator.generateComprehensiveReport(
      results,
      this.state.responses,
      this.state.currentMode,
      duration
    );

    // Build comprehensive report HTML
    const contentEl = document.getElementById('results-content');
    let html = `
            <div class="report-container">
                <!-- Report Header -->
                <div class="report-header">
                    <h1 class="report-title">Your Personality Profile</h1>
                    <p class="report-subtitle">Comprehensive Assessment Report</p>
                    <div class="report-meta">
                        <span>📅 ${report.meta.date}</span>
                        <span>⏱️ ${report.meta.duration}</span>
                        <span>📊 ${report.meta.questions} questions</span>
                        <span>✓ ${report.meta.reliability} reliability</span>
                    </div>
                </div>
                
                <!-- Personality Overview -->
                <div class="personality-overview">
                    <div class="personality-type">
                        <div class="type-badge">${report.archetype?.name?.charAt(0) || 'P'}</div>
                        <div class="type-info">
                            <h3>${report.archetype?.name || 'Your Unique Profile'}</h3>
                            <p class="type-description">${report.overview.summary}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Detailed Traits -->
                <section class="traits-section">
                    <h2>Personality Traits Analysis</h2>
                    <div class="traits-grid">
        `;

    // Add trait cards
    for (const [trait, data] of Object.entries(report.traits)) {
      html += `
                <div class="trait-card">
                    <div class="trait-header">
                        <span class="trait-name">${trait}</span>
                        <div class="trait-score">
                            <span class="score-badge">${data.score}%</span>
                            <span class="percentile-badge">${data.comparison}</span>
                        </div>
                    </div>
                    <div class="trait-visual">
                        <div class="trait-bar-container">
                            <div class="trait-bar-fill" data-score="${data.score}" style="width: 0"></div>
                        </div>
                    </div>
                    <p class="trait-description">${data.description}</p>
                    <div class="trait-details">
                        <p><strong>${data.icon} ${data.title}</strong></p>
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.5rem;">${data.interpretation}</p>
                    </div>
                </div>
            `;
    }

    html += `
                    </div>
                </section>
                
                <!-- Archetype Section -->
                ${
                  report.archetype
                    ? `
                <section class="archetype-section">
                    <div class="archetype-header">
                        <h2 class="archetype-title">${report.archetype.name}</h2>
                        <p class="archetype-subtitle">${report.archetype.description}</p>
                    </div>
                    <div class="archetype-traits">
                        ${report.archetype.strengths
                          .split(',')
                          .map(s => `<span class="archetype-trait">${s.trim()}</span>`)
                          .join('')}
                    </div>
                    <p style="text-align: center; margin-top: 1rem; color: var(--gray-600);">
                        ${report.archetype.matchScore}% match • Similar to: ${report.archetype.famous}
                    </p>
                </section>
                `
                    : ''
                }
                
                <!-- Insights Grid -->
                <div class="insights-container">
                    <!-- Strengths -->
                    <div class="insight-card">
                        <h3>
                            <svg width="24" height="24"><use href="assets/icons/icons.svg#icon-check"></use></svg>
                            Your Strengths
                        </h3>
                        <ul class="insight-list">
                            ${report.insights.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <!-- Growth Areas -->
                    <div class="insight-card">
                        <h3>
                            <svg width="24" height="24"><use href="assets/icons/icons.svg#icon-arrow-right"></use></svg>
                            Growth Opportunities
                        </h3>
                        <ul class="insight-list">
                            ${report.insights.growth.map(g => `<li>${g}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <!-- Career Insights -->
                <div class="insight-card" style="margin-top: 2rem;">
                    <h3>Career Insights</h3>
                    <p>${report.insights.career.strengths}</p>
                    <p style="margin-top: 1rem;">${report.insights.career.environment}</p>
                    <div style="margin-top: 1rem;">
                        <strong>Suitable Careers:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                            ${report.insights.career.suitable
                              .map(c => `<span class="archetype-trait">${c}</span>`)
                              .join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Relationship Insights -->
                <div class="insight-card" style="margin-top: 2rem;">
                    <h3>Relationship Insights</h3>
                    <p>${report.insights.relationships.style}</p>
                    <div style="margin-top: 1rem;">
                        <strong>Relationship Strengths:</strong>
                        <ul class="insight-list">
                            ${report.insights.relationships.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <p style="margin-top: 1rem;">${report.insights.relationships.compatibility}</p>
                </div>
                
                <!-- Communication & Leadership -->
                <div class="insights-container" style="margin-top: 2rem;">
                    <div class="insight-card">
                        <h3>Communication Style</h3>
                        <p>${report.insights.communication}</p>
                    </div>
                    <div class="insight-card">
                        <h3>Leadership Style</h3>
                        <p>${report.insights.leadership}</p>
                    </div>
                </div>
                
                <!-- Stress & Motivation -->
                <div class="insights-container" style="margin-top: 2rem;">
                    <div class="insight-card">
                        <h3>Stress Profile</h3>
                        <p>${report.insights.stress.responses}</p>
                        <strong style="display: block; margin-top: 1rem;">Coping Strategies:</strong>
                        <ul class="insight-list">
                            ${report.insights.stress.copingStrategies.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="insight-card">
                        <h3>Motivation</h3>
                        <p>${report.insights.motivation.description}</p>
                    </div>
                </div>
                
                <!-- Recommendations -->
                <section class="action-items">
                    <h3>Personalized Recommendations</h3>
                    <div class="action-grid">
                        <div class="action-card">
                            <h4>📚 Recommended Reading</h4>
                            <p>${report.recommendations.books.join(', ')}</p>
                        </div>
                        <div class="action-card">
                            <h4>🎯 Activities to Try</h4>
                            <p>${report.recommendations.activities.join(', ')}</p>
                        </div>
                        <div class="action-card">
                            <h4>💡 Skills to Develop</h4>
                            <p>${report.recommendations.skills.join(', ')}</p>
                        </div>
                        <div class="action-card">
                            <h4>🧘 Mindfulness Practices</h4>
                            <p>${report.recommendations.mindfulness.join(', ')}</p>
                        </div>
                    </div>
                </section>
                
                <!-- Goals -->
                <section class="action-items" style="background: var(--warm-100); border-color: var(--warm-200);">
                    <h3>Personal Development Goals</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <h4>Short-term Goals (3 months)</h4>
                            <ul class="insight-list">
                                ${report.recommendations.goals.shortTerm.map(g => `<li>${g}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h4>Long-term Goals (1 year)</h4>
                            <ul class="insight-list">
                                ${report.recommendations.goals.longTerm.map(g => `<li>${g}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        `;

    contentEl.innerHTML = html;

    // Animate progress bars and trait fills
    setTimeout(() => {
      document.querySelectorAll('.trait-bar-fill, .result-fill').forEach(fill => {
        const score = fill.dataset.score;
        fill.style.width = `${score}%`;
      });
    }, 100);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger celebration
    this.celebrate();
  }

  // Download Results as PDF
  async downloadResults() {
    this.showToast('Preparing download...', 'info');

    // Generate PDF content (simplified version)
    const results = this.calculateEnhancedResults();
    let content = `Neurlyn Assessment Report\n\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Session: ${this.state.sessionId}\n\n`;
    content += `Results:\n`;

    for (const category in results) {
      content += `\n${category}: ${results[category].score}%\n`;
      content += `${results[category].interpretation}\n`;
    }

    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurlyn-report-${this.state.sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('Report downloaded', 'success');
  }

  // Share Results
  async shareResults() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Neurlyn Assessment Results',
          text: 'I just completed a personality assessment on Neurlyn!',
          url: window.location.href
        });
        this.showToast('Shared successfully', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.showToast('Failed to share', 'error');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      const text = `I completed a personality assessment on Neurlyn! Check it out: ${window.location.href}`;
      navigator.clipboard.writeText(text);
      this.showToast('Link copied to clipboard', 'success');
    }
  }

  retakeAssessment() {
    if (confirm('Start a new assessment? Your current results will be saved.')) {
      this.saveAssessmentHistory();
      this.resetState();
      this.fadeTransition('results-screen', 'welcome-screen');
    }
  }

  goHome() {
    if (this.state.currentScreen === 'question') {
      if (confirm('Return to home? Your progress will be saved.')) {
        this.saveState();
        this.resetState();
        this.fadeTransition('question-screen', 'welcome-screen');
      }
    } else {
      this.resetState();
      this.fadeTransition('results-screen', 'welcome-screen');
    }
  }

  resetState() {
    this.state = {
      currentMode: null,
      currentScreen: 'welcome',
      currentQuestionIndex: 0,
      responses: [],
      startTime: null,
      sessionId: this.generateSessionId(),
      isPaused: false,
      theme: this.state.theme
    };

    document.querySelectorAll('.mode-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById('start-assessment').disabled = true;
  }

  skipQuestion() {
    // Mark question as skipped
    this.state.responses[this.state.currentQuestionIndex] = {
      questionIndex: this.state.currentQuestionIndex,
      questionId: this.questions[this.state.currentQuestionIndex].id,
      value: null,
      skipped: true,
      category: this.questions[this.state.currentQuestionIndex].category,
      timestamp: Date.now()
    };

    // Add skip indicator
    const card = document.querySelector('.question-card');
    if (card) {
      card.classList.add('skipped');
      setTimeout(() => card.classList.remove('skipped'), 500);
    }

    this.showToast('Question skipped', 'info');
    this.navigateQuestion(1);
  }

  saveAssessmentHistory() {
    const history = JSON.parse(localStorage.getItem('neurlyn-history') || '[]');
    const results = this.calculateEnhancedResults();

    history.push({
      date: Date.now(),
      mode: this.state.currentMode,
      results: results,
      duration: Date.now() - this.state.startTime,
      sessionId: this.state.sessionId
    });

    // Keep only last 10 assessments
    if (history.length > 10) {
      history.shift();
    }

    localStorage.setItem('neurlyn-history', JSON.stringify(history));
  }

  showReviewModal() {
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.innerHTML = `
            <div class="review-content">
                <div class="review-header">
                    <h2>Review Your Answers</h2>
                    <button class="btn btn-ghost" onclick="this.closest('.review-modal').remove()">✕</button>
                </div>
                <div class="review-grid">
                    ${this.generateReviewItems()}
                </div>
                <div class="review-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.review-modal').remove()">
                        Continue Editing
                    </button>
                    <button class="btn btn-primary" id="submit-review">
                        Submit Assessment
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    document.getElementById('submit-review').addEventListener('click', () => {
      modal.remove();
      this.completeAssessment();
    });

    // Add edit functionality
    modal.querySelectorAll('.review-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const index = parseInt(e.target.dataset.index);
        modal.remove();
        this.state.currentQuestionIndex = index;
        this.displayQuestion();
      });
    });
  }

  generateReviewItems() {
    return this.questions
      .map((q, i) => {
        const response = this.state.responses[i];
        const answered = response && !response.skipped;

        return `
                <div class="review-item ${!answered ? 'unanswered' : ''}">
                    <div class="review-number">${i + 1}</div>
                    <div class="review-question">${q.text}</div>
                    <div class="review-answer">
                        ${answered ? this.getAnswerLabel(response.value) : 'Not answered'}
                    </div>
                    <button class="review-edit" data-index="${i}">Edit</button>
                </div>
            `;
      })
      .join('');
  }

  getAnswerLabel(value) {
    const labels = {
      1: 'Strongly Disagree',
      2: 'Disagree',
      3: 'Neutral',
      4: 'Agree',
      5: 'Strongly Agree'
    };
    return labels[value] || 'Unknown';
  }

  // Update breadcrumb
  updateBreadcrumb() {
    const modeBreadcrumb = document.getElementById('mode-breadcrumb');
    const questionBreadcrumb = document.getElementById('breadcrumb-question');

    if (modeBreadcrumb && this.state.currentMode) {
      modeBreadcrumb.textContent =
        this.state.currentMode.charAt(0).toUpperCase() +
        this.state.currentMode.slice(1) +
        ' Assessment';
    }

    if (questionBreadcrumb) {
      questionBreadcrumb.textContent = this.state.currentQuestionIndex + 1;
    }
  }

  // Utility Functions
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateQuestionId() {
    return Math.random().toString(36).substr(2, 9);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Animation Utilities
  fadeTransition(fromScreen, toScreen) {
    const from = document.getElementById(fromScreen);
    const to = document.getElementById(toScreen);

    if (from) from.classList.add('fade-out');

    setTimeout(() => {
      if (from) {
        from.classList.add('hidden');
        from.classList.remove('fade-out');
      }
      if (to) {
        to.classList.remove('hidden');
        to.classList.add('fade-in');
        setTimeout(() => to.classList.remove('fade-in'), 300);
      }

      this.state.currentScreen = toScreen.replace('-screen', '');
    }, 200);
  }

  animateNumber(elementId, value, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const current = parseInt(element.textContent) || 0;
    const duration = 300;
    const steps = 20;
    const increment = (value - current) / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const newValue = Math.round(current + increment * step);
      element.textContent = newValue + suffix;

      if (step >= steps) {
        clearInterval(interval);
        element.textContent = value + suffix;
      }
    }, duration / steps);
  }

  addRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  // Toast Notifications
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Sound Effects (optional)
  playSound(type) {
    if (!this.state.soundEnabled) return;

    // Sound implementation would go here
    // Using Web Audio API for subtle UI sounds
  }

  // Celebration Animation
  celebrate() {
    // Create subtle celebration effect
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = '🎉';
    document.body.appendChild(celebration);

    setTimeout(() => celebration.remove(), 2000);
  }

  // Loading States
  showLoading(message = 'Loading...') {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.querySelector('p').textContent = message;
      loadingScreen.classList.remove('hidden');
    }
  }

  hideLoading() {
    document.getElementById('loading-screen')?.classList.add('hidden');
  }

  // Service Worker for Offline Support
  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
    }
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
