import { BaseTask } from './base-task.js';
export class PatternRecognitionTask extends BaseTask {
  constructor(t) {
    (super(t),
      (this.type = 'pattern-recognition'),
      (this.difficulty = t.difficulty || 'adaptive'),
      (this.timeLimit = t.timeLimit || 12e4),
      (this.patternTypes = ['sequence', 'matrix', 'rotation', 'symmetry', 'rule-based']),
      (this.currentPattern = 0),
      (this.patterns = []),
      (this.responses = []),
      (this.currentDifficulty = 1),
      (this.adaptiveHistory = []),
      (this.canvas = null),
      (this.ctx = null),
      (this.selectedOption = null),
      (this.detailFocus = 0),
      (this.holisticProcessing = 0),
      (this.processingSpeed = []),
      (this.accuracyByType = {}));
  }
  async render() {
    const t = this.createContainer(),
      e = document.createElement('div');
    ((e.className = 'task-start-screen'),
      (e.innerHTML =
        '\n            <div class="task-intro-card">\n                <div class="task-icon-large">\n                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n                        <rect x="3" y="3" width="7" height="7"/>\n                        <rect x="14" y="3" width="7" height="7"/>\n                        <rect x="14" y="14" width="7" height="7"/>\n                        <rect x="3" y="14" width="7" height="7"/>\n                    </svg>\n                </div>\n                <h3>Pattern Recognition</h3>\n                <p class="task-description">Find the pattern and select what comes next.</p>\n                <div class="task-rules">\n                    <div class="rule-item">\n                        <span class="rule-icon">🧩</span>\n                        <span>Look for <strong>patterns</strong> in shapes, colors, or positions</span>\n                    </div>\n                    <div class="rule-item">\n                        <span class="rule-icon">🎯</span>\n                        <span>Click the <strong>correct answer</strong> from the options</span>\n                    </div>\n                    <div class="rule-item">\n                        <span class="rule-icon">📈</span>\n                        <span>Difficulty <strong>adapts</strong> to your performance</span>\n                    </div>\n                </div>\n                <button id="start-pattern-task" class="btn btn-primary btn-large">\n                    Start Task\n                    <svg width="20" height="20">\n                        <use href="assets/icons/icons.svg#icon-arrow-right"></use>\n                    </svg>\n                </button>\n            </div>\n        '),
      t.appendChild(e));
    const n = document.createElement('div');
    return (
      (n.className = 'task-main-screen hidden'),
      (n.innerHTML =
        '\n            <div class="pattern-header">\n                <h3>Find the Pattern</h3>\n                <div class="pattern-progress">\n                    <span id="pattern-count">Pattern 1 of 10</span>\n                    <span id="pattern-timer" class="timer-display">2:00</span>\n                </div>\n            </div>\n            \n            <div class="pattern-display">\n                <canvas id="pattern-canvas" width="600" height="300"></canvas>\n            </div>\n            \n            <div class="pattern-question">\n                <p>What comes next in the sequence?</p>\n            </div>\n            \n            <div class="pattern-options" id="pattern-options">\n                \x3c!-- Options will be generated dynamically --\x3e\n            </div>\n            \n            <div class="pattern-feedback hidden" id="pattern-feedback">\n                \x3c!-- Feedback will appear here --\x3e\n            </div>\n        '),
      t.appendChild(n),
      this.addStyles(),
      t
    );
  }
  async initialize() {
    (await super.initialize(),
      (this.canvas = document.getElementById('pattern-canvas')),
      (this.ctx = this.canvas.getContext('2d')));
    const t = document.getElementById('start-pattern-task');
    (t && t.addEventListener('click', () => this.startTask()), this.generatePatterns());
  }
  startTask() {
    const t = document.querySelector('.task-start-screen'),
      e = document.querySelector('.task-main-screen');
    (t.classList.add('hidden'),
      e.classList.remove('hidden'),
      this.startTimer(),
      this.showPattern(0));
  }
  generatePatterns() {
    const t = [];
    (t.push(this.createSequencePattern(1)),
      t.push(this.createMatrixPattern(1)),
      t.push(this.createRotationPattern(1)));
    for (let e = 3; e < 10; e++) {
      const n = this.patternTypes[e % this.patternTypes.length],
        s = this.calculateAdaptiveDifficulty();
      t.push(this.createPattern(n, s));
    }
    this.patterns = t;
  }
  createSequencePattern(t) {
    const e = { type: 'sequence', difficulty: t, elements: [], answer: null, options: [] };
    if (1 === t) {
      const t = Math.floor(5 * Math.random()) + 1,
        n = Math.floor(3 * Math.random()) + 1;
      for (let s = 0; s < 4; s++) e.elements.push({ type: 'number', value: t + s * n });
      ((e.answer = { type: 'number', value: t + 4 * n }), (e.options = [e.answer]));
      for (let t = 0; t < 3; t++)
        e.options.push({
          type: 'number',
          value: e.answer.value + (Math.random() < 0.5 ? -(t + 1) : t + 1) * n
        });
    } else if (2 === t) {
      const t = ['circle', 'square', 'triangle'],
        n = ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        s = Math.floor(Math.random() * t.length);
      for (let a = 0; a < 4; a++)
        e.elements.push({ type: 'shape', shape: t[(s + a) % t.length], color: n[a % n.length] });
      ((e.answer = { type: 'shape', shape: t[(s + 4) % t.length], color: n[4 % n.length] }),
        (e.options = this.generateShapeOptions(e.answer)));
    }
    return (e.options.sort(() => Math.random() - 0.5), e);
  }
  createMatrixPattern(t) {
    const e = { type: 'matrix', difficulty: t, grid: [], answer: null, options: [] },
      n = [],
      s = Math.floor(3 * Math.random());
    for (let e = 0; e < 3; e++) {
      n[e] = [];
      for (let a = 0; a < 3; a++)
        n[e][a] = 2 === e && 2 === a ? null : this.generateMatrixElement(e, a, s, t);
    }
    ((e.grid = n), (e.answer = this.generateMatrixElement(2, 2, s, t)), (e.options = [e.answer]));
    for (let n = 0; n < 3; n++)
      e.options.push(
        this.generateMatrixElement(
          Math.floor(3 * Math.random()),
          Math.floor(3 * Math.random()),
          (s + n + 1) % 3,
          t
        )
      );
    return (e.options.sort(() => Math.random() - 0.5), e);
  }
  createRotationPattern(t) {
    const e = { type: 'rotation', difficulty: t, elements: [], answer: null, options: [] },
      n = this.createComplexShape(t),
      s = 1 === t ? 90 : 45;
    for (let t = 0; t < 4; t++) e.elements.push({ type: 'rotation', shape: n, rotation: t * s });
    ((e.answer = { type: 'rotation', shape: n, rotation: 4 * s }), (e.options = [e.answer]));
    for (let t = 1; t <= 3; t++)
      e.options.push({ type: 'rotation', shape: n, rotation: (4 * s + 30 * t) % 360 });
    return (e.options.sort(() => Math.random() - 0.5), e);
  }
  showPattern(t) {
    if (t >= this.patterns.length) return void this.completeTask();
    this.currentPattern = t;
    const e = this.patterns[t];
    ((document.getElementById('pattern-count').textContent =
      `Pattern ${t + 1} of ${this.patterns.length}`),
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height),
      'sequence' === e.type
        ? this.drawSequence(e)
        : 'matrix' === e.type
          ? this.drawMatrix(e)
          : 'rotation' === e.type && this.drawRotation(e),
      this.showOptions(e),
      (this.patternStartTime = performance.now()));
  }
  drawSequence(t) {
    const e = (this.canvas.width - 120 * t.elements.length) / 2,
      n = this.canvas.height / 2;
    t.elements.forEach((t, s) => {
      const a = e + 120 * s;
      'number' === t.type
        ? ((this.ctx.font = '48px Inter'),
          (this.ctx.fillStyle = '#333'),
          (this.ctx.textAlign = 'center'),
          (this.ctx.textBaseline = 'middle'),
          this.ctx.fillText(t.value, a, n))
        : 'shape' === t.type && this.drawShape(a, n, t.shape, t.color);
    });
    const s = e + 120 * t.elements.length;
    ((this.ctx.font = '48px Inter'),
      (this.ctx.fillStyle = '#999'),
      (this.ctx.textAlign = 'center'),
      (this.ctx.textBaseline = 'middle'),
      this.ctx.fillText('?', s, n));
  }
  drawShape(t, e, n, s) {
    ((this.ctx.fillStyle = s || '#6C9E83'),
      (this.ctx.strokeStyle = '#333'),
      (this.ctx.lineWidth = 2),
      'circle' === n
        ? (this.ctx.beginPath(),
          this.ctx.arc(t, e, 30, 0, 2 * Math.PI),
          this.ctx.fill(),
          this.ctx.stroke())
        : 'square' === n
          ? (this.ctx.fillRect(t - 30, e - 30, 60, 60), this.ctx.strokeRect(t - 30, e - 30, 60, 60))
          : 'triangle' === n &&
            (this.ctx.beginPath(),
            this.ctx.moveTo(t, e - 30),
            this.ctx.lineTo(t - 30, e + 30),
            this.ctx.lineTo(t + 30, e + 30),
            this.ctx.closePath(),
            this.ctx.fill(),
            this.ctx.stroke()));
  }
  showOptions(t) {
    const e = document.getElementById('pattern-options');
    ((e.innerHTML = ''),
      t.options.forEach((t, n) => {
        const s = document.createElement('button');
        ((s.className = 'pattern-option-btn'), (s.dataset.index = n));
        const a = document.createElement('canvas');
        ((a.width = 100), (a.height = 100));
        const r = a.getContext('2d');
        ('number' === t.type
          ? ((r.font = '32px Inter'),
            (r.fillStyle = '#333'),
            (r.textAlign = 'center'),
            (r.textBaseline = 'middle'),
            r.fillText(t.value, 50, 50))
          : 'shape' === t.type
            ? this.drawShapeOnContext(r, 50, 50, t.shape, t.color, 20)
            : 'rotation' === t.type &&
              (r.save(),
              r.translate(50, 50),
              r.rotate((t.rotation * Math.PI) / 180),
              this.drawShapeOnContext(r, 0, 0, t.shape.type, t.shape.color, 20),
              r.restore()),
          s.appendChild(a),
          s.addEventListener('click', () => this.selectOption(n)),
          e.appendChild(s));
      }));
  }
  drawShapeOnContext(t, e, n, s, a, r) {
    ((t.fillStyle = a || '#6C9E83'),
      (t.strokeStyle = '#333'),
      (t.lineWidth = 2),
      'circle' === s
        ? (t.beginPath(), t.arc(e, n, r, 0, 2 * Math.PI), t.fill(), t.stroke())
        : 'square' === s
          ? (t.fillRect(e - r, n - r, 2 * r, 2 * r), t.strokeRect(e - r, n - r, 2 * r, 2 * r))
          : 'triangle' === s &&
            (t.beginPath(),
            t.moveTo(e, n - r),
            t.lineTo(e - r, n + r),
            t.lineTo(e + r, n + r),
            t.closePath(),
            t.fill(),
            t.stroke()));
  }
  selectOption(t) {
    const e = this.patterns[this.currentPattern],
      n = e.options[t],
      s = this.compareOptions(n, e.answer),
      a = performance.now() - this.patternStartTime;
    (this.responses.push({
      pattern: this.currentPattern,
      type: e.type,
      difficulty: e.difficulty,
      correct: s,
      responseTime: a,
      selected: n,
      answer: e.answer
    }),
      this.updateNeurodivergentIndicators(e, s, a),
      this.showFeedback(s),
      setTimeout(() => {
        this.showPattern(this.currentPattern + 1);
      }, 1500));
  }
  compareOptions(t, e) {
    return (
      t.type === e.type &&
      ('number' === t.type
        ? t.value === e.value
        : 'shape' === t.type
          ? t.shape === e.shape && t.color === e.color
          : 'rotation' === t.type && t.rotation === e.rotation)
    );
  }
  updateNeurodivergentIndicators(t, e, n) {
    (this.accuracyByType[t.type] || (this.accuracyByType[t.type] = { correct: 0, total: 0 }),
      this.accuracyByType[t.type].total++,
      e && this.accuracyByType[t.type].correct++,
      this.processingSpeed.push(n),
      'matrix' === t.type && e
        ? this.holisticProcessing++
        : 'sequence' === t.type && e && this.detailFocus++,
      this.adaptiveHistory.push({ difficulty: t.difficulty, correct: e, responseTime: n }));
  }
  calculateAdaptiveDifficulty() {
    if (this.adaptiveHistory.length < 2) return this.currentDifficulty;
    const t = this.adaptiveHistory.slice(-3),
      e = t.filter(t => t.correct).length / t.length,
      n = t.reduce((t, e) => t + e.responseTime, 0) / t.length;
    return (
      e > 0.8 && n < 5e3
        ? (this.currentDifficulty = Math.min(3, this.currentDifficulty + 1))
        : (e < 0.4 || n > 15e3) &&
          (this.currentDifficulty = Math.max(1, this.currentDifficulty - 1)),
      this.currentDifficulty
    );
  }
  createPattern(t, e) {
    switch (t) {
      case 'sequence':
      default:
        return this.createSequencePattern(e);
      case 'matrix':
        return this.createMatrixPattern(e);
      case 'rotation':
        return this.createRotationPattern(e);
      case 'symmetry':
        return this.createSymmetryPattern(e);
      case 'rule-based':
        return this.createRuleBasedPattern(e);
    }
  }
  createSymmetryPattern(t) {
    return this.createSequencePattern(t);
  }
  createRuleBasedPattern(t) {
    return this.createMatrixPattern(t);
  }
  generateMatrixElement(t, e, n, s) {
    const a = ['circle', 'square', 'triangle'],
      r = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    return { type: 'shape', shape: a[(t + e) % a.length], color: r[(t * e) % r.length] };
  }
  generateShapeOptions(t) {
    const e = ['circle', 'square', 'triangle'],
      n = ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      s = [t];
    for (let t = 0; t < 3; t++)
      s.push({
        type: 'shape',
        shape: e[Math.floor(Math.random() * e.length)],
        color: n[Math.floor(Math.random() * n.length)]
      });
    return s;
  }
  createComplexShape(t) {
    return { type: 1 === t ? 'square' : 'triangle', color: '#6C9E83' };
  }
  drawMatrix(t) {
    this.drawSequence(t);
  }
  drawRotation(t) {
    this.drawSequence(t);
  }
  completeTask() {
    const t = this.responses.filter(t => t.correct).length / this.responses.length,
      e = this.processingSpeed.reduce((t, e) => t + e, 0) / this.processingSpeed.length,
      n = {
        accuracy: t,
        speed: e,
        detailFocus: this.detailFocus / this.responses.length,
        holisticProcessing: this.holisticProcessing / this.responses.length,
        accuracyByType: this.accuracyByType,
        adaptiveLearning: this.calculateLearningCurve()
      },
      s = {
        patternRecognition: t > 0.8 ? 0.7 : 0.3,
        detailOriented: this.detailFocus > this.holisticProcessing ? 0.6 : 0.2,
        systemizing:
          this.accuracyByType.sequence?.correct / this.accuracyByType.sequence?.total || 0
      };
    ((this.response = { patternRecognition: n, autismIndicators: s, responses: this.responses }),
      this.showCompletionFeedback(t, e));
  }
  calculateLearningCurve() {
    if (this.responses.length < 4) return 0;
    const t = this.responses.slice(0, Math.floor(this.responses.length / 2)),
      e = this.responses.slice(Math.floor(this.responses.length / 2)),
      n = t.filter(t => t.correct).length / t.length;
    return e.filter(t => t.correct).length / e.length - n;
  }
  showCompletionFeedback(t, e) {
    const n = document.createElement('div');
    ((n.className = 'task-completion-feedback'),
      (n.innerHTML = `\n            <h3>Pattern Recognition Complete!</h3>\n            <div class="completion-stats">\n                <div class="stat">\n                    <span class="stat-label">Accuracy</span>\n                    <span class="stat-value">${Math.round(100 * t)}%</span>\n                </div>\n                <div class="stat">\n                    <span class="stat-label">Avg Response Time</span>\n                    <span class="stat-value">${(e / 1e3).toFixed(1)}s</span>\n                </div>\n                <div class="stat">\n                    <span class="stat-label">Pattern Strength</span>\n                    <span class="stat-value">${t > 0.8 ? 'High' : t > 0.5 ? 'Medium' : 'Developing'}</span>\n                </div>\n            </div>\n        `));
    const s = document.querySelector('.task-pattern-recognition');
    s && ((s.innerHTML = ''), s.appendChild(n));
  }
  addStyles() {
    if (document.getElementById('pattern-recognition-styles')) return;
    const t = document.createElement('style');
    ((t.id = 'pattern-recognition-styles'),
      (t.textContent =
        '\n            .pattern-header {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n                margin-bottom: 2rem;\n            }\n            \n            .pattern-progress {\n                display: flex;\n                gap: 2rem;\n                font-size: 0.9rem;\n                color: #666;\n            }\n            \n            .timer-display {\n                font-weight: 600;\n                color: #6C9E83;\n            }\n            \n            .pattern-display {\n                background: white;\n                border: 2px solid #E0E0E0;\n                border-radius: 12px;\n                padding: 2rem;\n                margin-bottom: 2rem;\n                display: flex;\n                justify-content: center;\n            }\n            \n            #pattern-canvas {\n                max-width: 100%;\n                height: auto;\n            }\n            \n            .pattern-question {\n                text-align: center;\n                font-size: 1.2rem;\n                margin-bottom: 2rem;\n                color: #333;\n            }\n            \n            .pattern-options {\n                display: flex;\n                justify-content: center;\n                gap: 1rem;\n                flex-wrap: wrap;\n            }\n            \n            .pattern-option-btn {\n                background: white;\n                border: 3px solid #E0E0E0;\n                border-radius: 12px;\n                padding: 1rem;\n                cursor: pointer;\n                transition: all 0.3s ease;\n            }\n            \n            .pattern-option-btn:hover {\n                border-color: #6C9E83;\n                transform: translateY(-2px);\n                box-shadow: 0 4px 12px rgba(108, 158, 131, 0.2);\n            }\n            \n            .pattern-option-btn.selected {\n                border-color: #6C9E83;\n                background: rgba(108, 158, 131, 0.1);\n            }\n            \n            .pattern-option-btn.correct {\n                border-color: #4CAF50;\n                background: rgba(76, 175, 80, 0.1);\n            }\n            \n            .pattern-option-btn.incorrect {\n                border-color: #F44336;\n                background: rgba(244, 67, 54, 0.1);\n            }\n            \n            .pattern-feedback {\n                text-align: center;\n                padding: 1rem;\n                border-radius: 8px;\n                margin-top: 1rem;\n            }\n            \n            .pattern-feedback.correct {\n                background: rgba(76, 175, 80, 0.1);\n                color: #4CAF50;\n            }\n            \n            .pattern-feedback.incorrect {\n                background: rgba(244, 67, 54, 0.1);\n                color: #F44336;\n            }\n            \n            .task-completion-feedback {\n                text-align: center;\n                padding: 3rem;\n            }\n            \n            .completion-stats {\n                display: flex;\n                justify-content: center;\n                gap: 3rem;\n                margin-top: 2rem;\n            }\n            \n            .completion-stats .stat {\n                text-align: center;\n            }\n            \n            .completion-stats .stat-label {\n                display: block;\n                font-size: 0.9rem;\n                color: #666;\n                margin-bottom: 0.5rem;\n            }\n            \n            .completion-stats .stat-value {\n                display: block;\n                font-size: 1.8rem;\n                font-weight: 600;\n                color: #6C9E83;\n            }\n        '),
      document.head.appendChild(t));
  }
}
export default PatternRecognitionTask;
