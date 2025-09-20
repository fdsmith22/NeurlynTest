import { BaseTask } from './base-task.js';
export class WordAssociationTask extends BaseTask {
  constructor(e) {
    (super(e),
      (this.type = 'word-association'),
      (this.words = e.words || [
        'home',
        'mother',
        'success',
        'fear',
        'love',
        'work',
        'future',
        'past',
        'friend',
        'alone',
        'happy',
        'angry',
        'dream',
        'failure',
        'power'
      ]),
      (this.timeLimit = e.timeLimit || 9e4),
      (this.responseTimeLimit = 5e3),
      (this.currentWordIndex = 0),
      (this.associations = []),
      (this.startTimes = []),
      (this.wordTimer = null),
      (this.inputField = null),
      (this.currentWordElement = null),
      (this.progressElement = null));
  }
  async render() {
    const e = this.createContainer(),
      n = document.createElement('div');
    ((n.className = 'task-start-screen'),
      (n.innerHTML =
        '\n            <div class="task-intro-card">\n                <div class="task-icon-large">\n                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>\n                        <circle cx="9" cy="10" r="1"/>\n                        <circle cx="15" cy="10" r="1"/>\n                    </svg>\n                </div>\n                <h3>Rapid Word Association</h3>\n                <p class="task-description">This task measures your semantic networks and unconscious associations.</p>\n                <div class="task-rules">\n                    <div class="rule-item">\n                        <span class="rule-icon">⚡</span>\n                        <span>You have <strong>5 seconds</strong> per word</span>\n                    </div>\n                    <div class="rule-item">\n                        <span class="rule-icon">🧠</span>\n                        <span>Type the <strong>first word</strong> that comes to mind</span>\n                    </div>\n                    <div class="rule-item">\n                        <span class="rule-icon">✨</span>\n                        <span>Don\'t overthink - be spontaneous!</span>\n                    </div>\n                </div>\n                <button id="start-task-btn" class="btn btn-primary btn-large">\n                    Start Task\n                    <svg width="20" height="20">\n                        <use href="assets/icons/icons.svg#icon-arrow-right"></use>\n                    </svg>\n                </button>\n            </div>\n        '),
      e.appendChild(n));
    const s = document.createElement('div');
    ((s.className = 'task-main-screen hidden'),
      (s.innerHTML =
        '\n            <div class="word-association-header">\n                <h3>Word Association</h3>\n                <p class="instruction-emphasis">Type the first word that comes to mind!</p>\n            </div>\n        '),
      e.appendChild(s));
    const t = document.createElement('div');
    ((t.className = 'word-progress-container'),
      (t.innerHTML = `\n            <div class="word-progress-bar">\n                <div id="word-progress-fill" class="word-progress-fill" style="width: 0%"></div>\n            </div>\n            <div class="word-progress-text">\n                <span id="word-count">Word 1 of ${this.words.length}</span>\n                <span id="time-remaining" class="time-indicator">\n                    <svg width="16" height="16" class="timer-icon">\n                        <use href="assets/icons/icons.svg#icon-clock"></use>\n                    </svg>\n                    <span id="timer-text">5s</span>\n                </span>\n            </div>\n        `),
      s.appendChild(t));
    const a = document.createElement('div');
    ((a.className = 'word-display-container'),
      (a.innerHTML =
        '\n            <div class="stimulus-word-container">\n                <div class="stimulus-label">Respond to:</div>\n                <div id="stimulus-word" class="stimulus-word">\n                    \x3c!-- Word will appear here --\x3e\n                </div>\n                <div class="word-pulse-effect"></div>\n            </div>\n        '),
      s.appendChild(a));
    const i = document.createElement('div');
    ((i.className = 'word-input-container'),
      (i.innerHTML =
        '\n            <div class="input-wrapper">\n                <input \n                    type="text" \n                    id="word-input" \n                    class="word-input-field" \n                    placeholder="Type your association..."\n                    autocomplete="off"\n                    autocorrect="off"\n                    autocapitalize="off"\n                    spellcheck="false"\n                    disabled\n                />\n                <button id="submit-word" class="btn btn-primary word-submit-btn" disabled>\n                    Submit\n                    <svg width="16" height="16">\n                        <use href="assets/icons/icons.svg#icon-arrow-right"></use>\n                    </svg>\n                </button>\n            </div>\n            <div class="input-hint">Press Enter or click Submit</div>\n        '),
      s.appendChild(i));
    const r = document.createElement('div');
    return (
      (r.id = 'word-feedback'),
      (r.className = 'word-feedback-area'),
      s.appendChild(r),
      this.addStyles(),
      e
    );
  }
  async initialize() {
    (await super.initialize(),
      (this.inputField = document.getElementById('word-input')),
      (this.currentWordElement = document.getElementById('stimulus-word')),
      (this.progressElement = document.getElementById('word-progress-fill')),
      document.getElementById('start-task-btn').addEventListener('click', () => this.startTask()),
      document
        .getElementById('submit-word')
        .addEventListener('click', () => this.submitAssociation()),
      this.inputField.addEventListener('keypress', e => {
        'Enter' !== e.key || this.inputField.disabled || this.submitAssociation();
      }));
  }
  startTask() {
    const e = document.querySelector('.task-start-screen'),
      n = document.querySelector('.task-main-screen');
    ((e.style.opacity = '0'),
      setTimeout(() => {
        (e.classList.add('hidden'),
          n.classList.remove('hidden'),
          (this.inputField.disabled = !1),
          (document.getElementById('submit-word').disabled = !1),
          this.inputField.focus(),
          this.presentWord());
      }, 300));
  }
  presentWord() {
    if (this.currentWordIndex >= this.words.length) return void this.completeTask();
    const e = this.words[this.currentWordIndex];
    ((this.currentWordElement.style.opacity = '0'),
      (this.currentWordElement.style.transform = 'scale(0.8)'),
      setTimeout(() => {
        ((this.currentWordElement.textContent = e.toUpperCase()),
          (this.currentWordElement.style.opacity = '1'),
          (this.currentWordElement.style.transform = 'scale(1)'));
      }, 200),
      (this.inputField.value = ''),
      this.inputField.focus(),
      (document.getElementById('word-count').textContent =
        `Word ${this.currentWordIndex + 1} of ${this.words.length}`));
    const n = (this.currentWordIndex / this.words.length) * 100;
    ((this.progressElement.style.width = `${n}%`),
      (this.startTimes[this.currentWordIndex] = performance.now()),
      this.startWordTimer(),
      this.logEvent('word_presented', { word: e, index: this.currentWordIndex }));
  }
  startWordTimer() {
    let e = this.responseTimeLimit / 1e3;
    const n = document.getElementById('time-remaining');
    (this.wordTimer && clearInterval(this.wordTimer),
      (this.wordTimer = setInterval(() => {
        (e--,
          (n.textContent = `Time: ${e}s`),
          e <= 2 ? n.classList.add('time-warning') : n.classList.remove('time-warning'),
          e <= 0 && (clearInterval(this.wordTimer), this.submitAssociation(!0)));
      }, 1e3)));
  }
  submitAssociation(e = !1) {
    const n = this.inputField.value.trim(),
      s = performance.now() - this.startTimes[this.currentWordIndex];
    (this.associations.push({
      stimulus: this.words[this.currentWordIndex],
      response: n || (e ? '[no response]' : '[skipped]'),
      responseTime: s,
      isTimeout: e,
      isEmpty: !n
    }),
      this.showQuickFeedback(n ? 'Good!' : e ? "Time's up!" : 'Skipped'),
      this.logEvent('association_submitted', {
        stimulus: this.words[this.currentWordIndex],
        response: n,
        responseTime: s,
        isTimeout: e
      }),
      this.currentWordIndex++,
      setTimeout(() => {
        this.presentWord();
      }, 500));
  }
  showQuickFeedback(e) {
    const n = document.getElementById('word-feedback'),
      s = document.createElement('div');
    ((s.className = 'word-feedback-message'),
      (s.textContent = e),
      (n.innerHTML = ''),
      n.appendChild(s),
      setTimeout(() => {
        s.classList.add('show');
      }, 10),
      setTimeout(() => {
        s.classList.remove('show');
      }, 1500));
  }
  completeTask() {
    this.wordTimer && clearInterval(this.wordTimer);
    const e = this.analyzeAssociations();
    ((this.response = { associations: this.associations, analysis: e }),
      this.showCompletion(e),
      this.logEvent('task_completed', {
        totalWords: this.words.length,
        completedWords: this.associations.filter(e => !e.isEmpty).length,
        averageResponseTime: e.averageResponseTime
      }));
  }
  analyzeAssociations() {
    const e = this.associations.filter(e => !e.isEmpty),
      n = e.map(e => e.responseTime),
      s = n.reduce((e, n) => e + n, 0) / n.length,
      t = {
        positive: [
          'happy',
          'love',
          'joy',
          'good',
          'great',
          'wonderful',
          'beautiful',
          'success',
          'friend',
          'hope'
        ],
        negative: [
          'sad',
          'fear',
          'angry',
          'bad',
          'terrible',
          'awful',
          'ugly',
          'failure',
          'alone',
          'death'
        ],
        neutral: [
          'thing',
          'object',
          'place',
          'time',
          'person',
          'work',
          'day',
          'year',
          'way',
          'life'
        ]
      };
    let a = 0,
      i = 0,
      r = 0;
    e.forEach(e => {
      const n = e.response.toLowerCase();
      t.positive.some(e => n.includes(e)) ? a++ : t.negative.some(e => n.includes(e)) ? i++ : r++;
    });
    const o = 1 - new Set(e.map(e => e.response.toLowerCase())).size / e.length,
      d = n.filter(e => e < 1500).length,
      l = n.filter(e => e > 3e3).length;
    return {
      totalResponses: this.associations.length,
      validResponses: e.length,
      averageResponseTime: s,
      fastResponseRate: d / e.length,
      slowResponseRate: l / e.length,
      emotionalValence: { positive: a / e.length, negative: i / e.length, neutral: r / e.length },
      repetitionRate: o,
      timeouts: this.associations.filter(e => e.isTimeout).length,
      skipped: this.associations.filter(e => !e.isTimeout && e.isEmpty).length
    };
  }
  showCompletion(e) {
    const n = document.querySelector('.task-content'),
      s =
        e.emotionalValence.positive > 0.5
          ? 'positive'
          : e.emotionalValence.negative > 0.5
            ? 'cautious'
            : 'balanced',
      t = e.fastResponseRate > 0.6 ? 'quick' : e.slowResponseRate > 0.4 ? 'thoughtful' : 'moderate';
    n.innerHTML = `\n            <div class="task-completion">\n                <h3>Word Association Complete!</h3>\n                <div class="completion-stats">\n                    <div class="stat-row">\n                        <span class="stat-label">Responses:</span>\n                        <span class="stat-value">${e.validResponses} / ${e.totalResponses}</span>\n                    </div>\n                    <div class="stat-row">\n                        <span class="stat-label">Response Style:</span>\n                        <span class="stat-value">${t}</span>\n                    </div>\n                    <div class="stat-row">\n                        <span class="stat-label">Emotional Tone:</span>\n                        <span class="stat-value">${s}</span>\n                    </div>\n                </div>\n                <p class="completion-message">Your responses have been recorded for analysis.</p>\n            </div>\n        `;
  }
  async getResults() {
    return {
      ...(await super.getResults()),
      associations: this.associations,
      analysis: this.response?.analysis
    };
  }
  addStyles() {
    if (document.getElementById('word-association-styles')) return;
    const e = document.createElement('style');
    ((e.id = 'word-association-styles'),
      (e.textContent =
        '\n            .word-association-instructions {\n                margin-bottom: var(--space-6);\n                padding: var(--space-4);\n                background: linear-gradient(135deg, var(--sage-50) 0%, var(--white) 100%);\n                border-radius: var(--radius-lg);\n                border: 1px solid var(--sage-200);\n            }\n            \n            .instruction-content h3 {\n                color: var(--sage-700);\n                margin-bottom: var(--space-3);\n            }\n            \n            .instruction-emphasis {\n                color: var(--sage-600);\n                font-weight: var(--font-semibold);\n                font-style: italic;\n            }\n            \n            .word-progress-container {\n                margin-bottom: var(--space-4);\n            }\n            \n            .word-progress-bar {\n                height: 8px;\n                background: var(--gray-200);\n                border-radius: var(--radius-full);\n                overflow: hidden;\n                margin-bottom: var(--space-2);\n            }\n            \n            .word-progress-fill {\n                height: 100%;\n                background: linear-gradient(90deg, var(--sage-400) 0%, var(--sage-600) 100%);\n                transition: width 0.3s ease;\n            }\n            \n            .word-progress-text {\n                display: flex;\n                justify-content: space-between;\n                font-size: var(--text-sm);\n                color: var(--gray-600);\n            }\n            \n            .time-indicator {\n                font-weight: var(--font-semibold);\n                transition: color 0.3s ease;\n            }\n            \n            .time-indicator.time-warning {\n                color: var(--red-500);\n                animation: pulse 1s infinite;\n            }\n            \n            .word-display-container {\n                text-align: center;\n                margin: var(--space-8) 0;\n            }\n            \n            .stimulus-word-container {\n                display: inline-block;\n                padding: var(--space-6) var(--space-8);\n                background: var(--white);\n                border: 3px solid var(--sage-300);\n                border-radius: var(--radius-xl);\n                box-shadow: var(--shadow-lg);\n            }\n            \n            .stimulus-label {\n                font-size: var(--text-sm);\n                color: var(--gray-500);\n                text-transform: uppercase;\n                letter-spacing: 1px;\n                margin-bottom: var(--space-2);\n            }\n            \n            .stimulus-word {\n                font-size: var(--text-4xl);\n                font-weight: var(--font-bold);\n                color: var(--sage-700);\n                letter-spacing: 2px;\n                transition: all 0.3s ease;\n                min-height: 60px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n            }\n            \n            .word-input-container {\n                display: flex;\n                gap: var(--space-3);\n                max-width: 500px;\n                margin: 0 auto var(--space-6);\n            }\n            \n            .word-input-field {\n                flex: 1;\n                padding: var(--space-3) var(--space-4);\n                font-size: var(--text-lg);\n                border: 2px solid var(--gray-300);\n                border-radius: var(--radius-lg);\n                transition: all 0.2s ease;\n            }\n            \n            .word-input-field:focus {\n                outline: none;\n                border-color: var(--sage-500);\n                box-shadow: 0 0 0 3px rgba(108, 158, 131, 0.1);\n            }\n            \n            .word-submit-btn {\n                min-width: 120px;\n            }\n            \n            .word-feedback-area {\n                height: 40px;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n            }\n            \n            .word-feedback-message {\n                padding: var(--space-2) var(--space-4);\n                background: var(--sage-100);\n                color: var(--sage-700);\n                border-radius: var(--radius-full);\n                font-weight: var(--font-semibold);\n                opacity: 0;\n                transform: translateY(10px);\n                transition: all 0.3s ease;\n            }\n            \n            .word-feedback-message.show {\n                opacity: 1;\n                transform: translateY(0);\n            }\n            \n            .task-completion {\n                text-align: center;\n                padding: var(--space-6);\n                background: linear-gradient(135deg, var(--sage-50) 0%, var(--white) 100%);\n                border-radius: var(--radius-xl);\n                border: 2px solid var(--sage-200);\n            }\n            \n            .completion-stats {\n                margin: var(--space-4) 0;\n                padding: var(--space-4);\n                background: var(--white);\n                border-radius: var(--radius-lg);\n            }\n            \n            .stat-row {\n                display: flex;\n                justify-content: space-between;\n                padding: var(--space-2) 0;\n                border-bottom: 1px solid var(--gray-100);\n            }\n            \n            .stat-row:last-child {\n                border-bottom: none;\n            }\n            \n            .completion-message {\n                color: var(--gray-600);\n                font-style: italic;\n            }\n            \n            @keyframes pulse {\n                0%, 100% {\n                    opacity: 1;\n                }\n                50% {\n                    opacity: 0.6;\n                }\n            }\n            \n            /* Dark mode adjustments */\n            [data-theme="dark"] .word-association-instructions {\n                background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);\n                border-color: var(--gray-300);\n            }\n            \n            [data-theme="dark"] .stimulus-word-container {\n                background: var(--gray-100);\n                border-color: var(--sage-600);\n            }\n            \n            [data-theme="dark"] .word-input-field {\n                background: var(--gray-50);\n                border-color: var(--gray-400);\n                color: var(--gray-900);\n            }\n            \n            [data-theme="dark"] .task-completion {\n                background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);\n                border-color: var(--sage-600);\n            }\n        '),
      document.head.appendChild(e));
  }
}
export default WordAssociationTask;
