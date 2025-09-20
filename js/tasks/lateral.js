import { BaseTask } from './base-task.js';
export class LateralTask extends BaseTask {
  constructor(n) {
    (super(n),
      (this.type = 'lateral'),
      (this.question = n.question || n.text),
      (this.options = n.options || []),
      (this.measures = n.measures || []),
      (this.response = null),
      (this.responseTime = null),
      (this.startTime = null));
  }
  async render() {
    const n = document.createElement('div');
    if (((n.className = 'task-content'), this.instructions)) {
      const e = document.createElement('div');
      ((e.className = 'task-instructions'),
        (e.innerHTML = `\n                <svg class="instruction-icon" width="16" height="16">\n                    <use href="assets/icons/icons.svg#icon-info"></use>\n                </svg>\n                <p>${this.instructions}</p>\n            `),
        n.appendChild(e));
    }
    const e = document.createElement('div');
    if (
      ((e.className = 'lateral-question-container'),
      (e.innerHTML = `\n            <div class="lateral-question-text">\n                ${this.question}\n            </div>\n        `),
      n.appendChild(e),
      this.timeLimit)
    ) {
      const e = document.createElement('div');
      ((e.className = 'task-timer'),
        (e.innerHTML = `\n                <svg width="16" height="16">\n                    <use href="assets/icons/icons.svg#icon-clock"></use>\n                </svg>\n                <span id="task-timer-display">${this.formatTime(this.timeLimit)}</span>\n            `),
        n.appendChild(e),
        this.startTimer(e.querySelector('#task-timer-display')));
    }
    this.container = n;
    const t = document.createElement('div');
    ((t.className = 'lateral-options-container'),
      this.options.forEach((n, e) => {
        const a = document.createElement('button');
        ((a.className = 'lateral-option-btn'), (a.dataset.index = e));
        const s = String.fromCharCode(65 + e);
        ((a.innerHTML = `\n                <span class="option-letter">${s}</span>\n                <span class="option-text">${n}</span>\n            `),
          a.addEventListener('click', () => this.selectOption(e)),
          this.addKeyboardShortcut(s.toLowerCase(), () => this.selectOption(e)),
          t.appendChild(a));
      }),
      n.appendChild(t));
    const a = document.createElement('div');
    return (
      (a.className = 'lateral-hint'),
      (a.innerHTML =
        '\n            <p>💡 Tip: There\'s no "right" answer - choose what resonates with you most!</p>\n        '),
      n.appendChild(a),
      this.addStyles(),
      (this.startTime = performance.now()),
      n
    );
  }
  async initialize() {
    (await super.initialize(),
      this.logEvent('lateral_question_shown', {
        question: this.question,
        measures: this.measures
      }));
  }
  formatTime(n) {
    const e = Math.floor(n / 1e3);
    return `${Math.floor(e / 60)}:${(e % 60).toString().padStart(2, '0')}`;
  }
  startTimer(n) {
    let e = this.timeLimit;
    this.timerInterval = setInterval(() => {
      ((e -= 1e3),
        e <= 0
          ? (clearInterval(this.timerInterval), this.onTimeUp(), (n.textContent = '0:00'))
          : ((n.textContent = this.formatTime(e)),
            e < 1e4 && n.parentElement.classList.add('timer-warning')));
    }, 1e3);
  }
  onTimeUp() {
    this.logEvent('time_up');
  }
  addKeyboardShortcut(n, e) {
    const t = t => {
      t.key === n && e();
    };
    (document.addEventListener('keypress', t),
      this.keyHandlers || (this.keyHandlers = []),
      this.keyHandlers.push({ event: 'keypress', handler: t }));
  }
  selectOption(n) {
    ((this.response = n),
      (this.responseTime = performance.now() - this.startTime),
      document.querySelectorAll('.lateral-option-btn').forEach((e, t) => {
        (e.classList.remove('selected'), t === n && e.classList.add('selected'));
      }),
      this.showFeedback(),
      this.logEvent('lateral_response', {
        question: this.question,
        selectedIndex: n,
        selectedOption: this.options[n],
        responseTime: this.responseTime,
        measures: this.measures
      }));
    const e = document.getElementById('next-button');
    e && ((e.disabled = !1), e.classList.add('pulse'));
  }
  showFeedback() {
    const existing = document.querySelector('.lateral-feedback');
    existing && existing.remove();
    const n = document.createElement('div');
    n.className = 'lateral-feedback show';
    n.innerHTML = `\n            <div class="feedback-content">\n                <svg width="24" height="24" class="feedback-icon">\n                    <use href="assets/icons/icons.svg#icon-check-circle"></use>\n                </svg>\n                <span>Response selected</span>\n            </div>\n        `;
    const t = document.querySelector('.task-lateral');
    t && t.appendChild(n);
  }
  getInsight(n) {
    const e = [
      'Response selected',
      'Answer recorded',
      'Choice saved',
      'Selection confirmed',
      'Response noted'
    ];
    return e[n % e.length];
  }
  destroy() {
    (this.timerInterval && clearInterval(this.timerInterval),
      this.keyHandlers &&
        this.keyHandlers.forEach(({ event: n, handler: e }) => {
          document.removeEventListener(n, e);
        }),
      this.container && this.container.remove(),
      super.destroy());
  }
  addStyles() {
    if (document.getElementById('lateral-task-styles')) return;
    const n = document.createElement('style');
    ((n.id = 'lateral-task-styles'),
      (n.textContent =
        "\n            .lateral-question-container {\n                margin-bottom: 2rem;\n            }\n            \n            .lateral-question-text {\n                font-size: 1.3rem;\n                line-height: 1.6;\n                color: #333;\n                text-align: center;\n                padding: 1.5rem;\n                background: linear-gradient(135deg, rgba(108, 158, 131, 0.05) 0%, rgba(108, 158, 131, 0.02) 100%);\n                border-radius: 12px;\n                border: 1px solid rgba(108, 158, 131, 0.1);\n            }\n            \n            .lateral-options-container {\n                display: grid;\n                gap: 1rem;\n                margin: 2rem 0;\n            }\n            \n            .lateral-option-btn {\n                display: flex;\n                align-items: center;\n                gap: 1rem;\n                padding: 1.25rem 1.5rem;\n                background: white;\n                border: 2px solid rgba(108, 158, 131, 0.2);\n                border-radius: 12px;\n                cursor: pointer;\n                transition: all 0.3s ease;\n                text-align: left;\n                font-size: 1.05rem;\n                color: #444;\n                position: relative;\n                overflow: hidden;\n            }\n            \n            .lateral-option-btn::before {\n                content: '';\n                position: absolute;\n                top: 0;\n                left: -100%;\n                width: 100%;\n                height: 100%;\n                background: linear-gradient(90deg, transparent, rgba(108, 158, 131, 0.1), transparent);\n                transition: left 0.5s ease;\n            }\n            \n            .lateral-option-btn:hover:not(:disabled) {\n                border-color: #6C9E83;\n                transform: translateX(4px);\n                box-shadow: 0 4px 20px rgba(108, 158, 131, 0.15);\n            }\n            \n            .lateral-option-btn:hover:not(:disabled)::before {\n                left: 100%;\n            }\n            \n            .lateral-option-btn.selected {\n                background: linear-gradient(135deg, rgba(108, 158, 131, 0.15) 0%, rgba(108, 158, 131, 0.08) 100%);\n                border-color: #6C9E83;\n                box-shadow: 0 4px 20px rgba(108, 158, 131, 0.2);\n            }\n            \n            .lateral-option-btn:disabled {\n                cursor: default;\n                opacity: 0.7;\n            }\n            \n            .option-letter {\n                display: inline-flex;\n                align-items: center;\n                justify-content: center;\n                width: 32px;\n                height: 32px;\n                background: linear-gradient(135deg, #6C9E83 0%, #5A8A70 100%);\n                color: white;\n                border-radius: 50%;\n                font-weight: 600;\n                flex-shrink: 0;\n            }\n            \n            .lateral-option-btn.selected .option-letter {\n                background: linear-gradient(135deg, #5A8A70 0%, #4A7059 100%);\n                box-shadow: 0 2px 8px rgba(108, 158, 131, 0.3);\n            }\n            \n            .option-text {\n                flex: 1;\n                line-height: 1.4;\n            }\n            \n            .lateral-hint {\n                text-align: center;\n                color: #666;\n                font-size: 0.95rem;\n                margin-top: 1.5rem;\n                padding: 1rem;\n                background: rgba(255, 193, 7, 0.05);\n                border-radius: 8px;\n                border: 1px solid rgba(255, 193, 7, 0.15);\n            }\n            \n            .lateral-hint p {\n                margin: 0;\n            }\n            \n            .lateral-feedback {\n                margin-top: 1.5rem;\n                padding: 1rem;\n                background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);\n                border: 1px solid rgba(76, 175, 80, 0.2);\n                border-radius: 8px;\n                opacity: 0;\n                transform: translateY(10px);\n                transition: all 0.3s ease;\n            }\n            \n            .lateral-feedback.show {\n                opacity: 1;\n                transform: translateY(0);\n            }\n            \n            .feedback-content {\n                display: flex;\n                align-items: center;\n                gap: 0.75rem;\n                color: #2E7D32;\n            }\n            \n            .feedback-icon {\n                fill: #4CAF50;\n            }\n            \n            /* Dark mode support */\n            .dark-mode .lateral-question-text {\n                color: #E0E0E0;\n                background: linear-gradient(135deg, rgba(108, 158, 131, 0.1) 0%, rgba(108, 158, 131, 0.05) 100%);\n            }\n            \n            .dark-mode .lateral-option-btn {\n                background: rgba(30, 30, 50, 0.5);\n                color: #E0E0E0;\n                border-color: rgba(108, 158, 131, 0.3);\n            }\n            \n            .dark-mode .lateral-option-btn.selected {\n                background: linear-gradient(135deg, rgba(108, 158, 131, 0.25) 0%, rgba(108, 158, 131, 0.15) 100%);\n            }\n            \n            /* Mobile responsive */\n            @media (max-width: 768px) {\n                .lateral-question-text {\n                    font-size: 1.1rem;\n                    padding: 1rem;\n                }\n                \n                .lateral-option-btn {\n                    padding: 1rem;\n                    font-size: 0.95rem;\n                }\n                \n                .option-letter {\n                    width: 28px;\n                    height: 28px;\n                    font-size: 0.9rem;\n                }\n            }\n            \n            /* Animation for option appearance */\n            @keyframes slideInOption {\n                from {\n                    opacity: 0;\n                    transform: translateX(-20px);\n                }\n                to {\n                    opacity: 1;\n                    transform: translateX(0);\n                }\n            }\n            \n            .lateral-option-btn {\n                animation: slideInOption 0.3s ease forwards;\n            }\n            \n            .lateral-option-btn:nth-child(1) { animation-delay: 0s; }\n            .lateral-option-btn:nth-child(2) { animation-delay: 0.1s; }\n            .lateral-option-btn:nth-child(3) { animation-delay: 0.2s; }\n            .lateral-option-btn:nth-child(4) { animation-delay: 0.3s; }\n            .lateral-option-btn:nth-child(5) { animation-delay: 0.4s; }\n        "),
      document.head.appendChild(n));
  }
}
export default LateralTask;
