import { BaseTask } from './base-task.js';
export class VisualAttentionTask extends BaseTask {
  constructor(t) {
    (super(t),
      (this.type = 'visual-attention'),
      (this.timeLimit = t.timeLimit || 12e4),
      (this.targetCount = t.targetCount || 20),
      (this.score = 0),
      (this.targetsFound = 0),
      (this.missedTargets = 0),
      (this.falsePositives = 0),
      (this.reactionTimes = []),
      (this.clickPositions = []),
      (this.canvas = null),
      (this.ctx = null),
      (this.animationFrame = null),
      (this.targets = []),
      (this.distractors = []),
      (this.currentTarget = null),
      (this.targetAppearTime = null),
      (this.targetInterval = 3e3),
      (this.targetDuration = 2e3),
      (this.lastTargetTime = 0));
  }
  async render() {
    const t = this.createContainer(),
      s = document.createElement('div');
    ((s.className = 'visual-attention-instructions'),
      (s.innerHTML =
        '\n            <h3>Visual Attention Task</h3>\n            <p>Click on the <span class="target-preview">⭐ stars</span> as quickly as you can.</p>\n            <p>Ignore the <span class="distractor-preview">● dots</span> - they\'re distractors!</p>\n        '),
      t.appendChild(s));
    const a = document.createElement('div');
    ((a.className = 'visual-score-panel'),
      (a.innerHTML =
        '\n            <div class="score-items">\n                <div class="score-item">\n                    <span class="score-label">Found</span>\n                    <span class="score-value" id="targets-found">0</span>\n                </div>\n                <div class="score-item">\n                    <span class="score-label">Missed</span>\n                    <span class="score-value" id="targets-missed">0</span>\n                </div>\n                <div class="score-item">\n                    <span class="score-label">Accuracy</span>\n                    <span class="score-value" id="accuracy">100%</span>\n                </div>\n                <div class="score-item">\n                    <span class="score-label">Time</span>\n                    <span class="score-value" id="time-left">2:00</span>\n                </div>\n            </div>\n        '),
      t.appendChild(a),
      (this.canvas = document.createElement('canvas')),
      (this.canvas.className = 'visual-attention-canvas'),
      (this.canvas.width = 800),
      (this.canvas.height = 500),
      t.appendChild(this.canvas),
      (this.ctx = this.canvas.getContext('2d')),
      this.canvas.addEventListener('click', t => this.handleClick(t)),
      this.canvas.addEventListener('mousemove', t => this.handleMouseMove(t)));
    const e = document.createElement('div');
    return (
      (e.className = 'visual-controls'),
      (e.innerHTML =
        '\n            <label class="heatmap-toggle">\n                <input type="checkbox" id="show-heatmap">\n                <span>Show attention heatmap</span>\n            </label>\n        '),
      t.appendChild(e),
      this.addStyles(),
      t
    );
  }
  async initialize() {
    (await super.initialize(),
      this.startGameLoop(),
      this.startCountdown(),
      this.createDistractors(),
      this.logEvent('task_started'));
  }
  createDistractors() {
    for (let t = 0; t < 15; t++)
      this.distractors.push({
        x: Math.random() * (this.canvas.width - 40) + 20,
        y: Math.random() * (this.canvas.height - 40) + 20,
        vx: 2 * (Math.random() - 0.5),
        vy: 2 * (Math.random() - 0.5),
        radius: 8 + 4 * Math.random(),
        color: `hsl(${60 * Math.random() + 200}, 70%, 60%)`,
        opacity: 0.3 + 0.4 * Math.random()
      });
  }
  startGameLoop() {
    const t = () => {
      ((this.animationFrame = requestAnimationFrame(t)),
        (this.ctx.fillStyle = '#f8f9fa'),
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height),
        this.drawGrid(),
        this.updateDistractors());
      const s = performance.now();
      (s - this.lastTargetTime > this.targetInterval &&
        this.targetsFound + this.missedTargets < this.targetCount &&
        (this.spawnTarget(), (this.lastTargetTime = s)),
        this.currentTarget && this.updateTarget(),
        document.getElementById('show-heatmap')?.checked && this.drawHeatmap());
    };
    t();
  }
  drawGrid() {
    ((this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'), (this.ctx.lineWidth = 1));
    for (let t = 0; t < this.canvas.width; t += 50)
      (this.ctx.beginPath(),
        this.ctx.moveTo(t, 0),
        this.ctx.lineTo(t, this.canvas.height),
        this.ctx.stroke());
    for (let t = 0; t < this.canvas.height; t += 50)
      (this.ctx.beginPath(),
        this.ctx.moveTo(0, t),
        this.ctx.lineTo(this.canvas.width, t),
        this.ctx.stroke());
  }
  updateDistractors() {
    this.distractors.forEach(t => {
      ((t.x += t.vx),
        (t.y += t.vy),
        (t.x <= t.radius || t.x >= this.canvas.width - t.radius) && (t.vx *= -1),
        (t.y <= t.radius || t.y >= this.canvas.height - t.radius) && (t.vy *= -1),
        this.ctx.save(),
        (this.ctx.globalAlpha = t.opacity),
        (this.ctx.fillStyle = t.color),
        this.ctx.beginPath(),
        this.ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI),
        this.ctx.fill(),
        this.ctx.restore());
    });
  }
  spawnTarget() {
    const t = 50 + Math.random() * (this.canvas.width - 100),
      s = 50 + Math.random() * (this.canvas.height - 100);
    ((this.currentTarget = {
      x: t,
      y: s,
      radius: 20,
      pulsePhase: 0,
      appearTime: performance.now(),
      fadeIn: !0
    }),
      (this.targetAppearTime = performance.now()),
      this.logEvent('target_spawned', { x: t, y: s }));
  }
  updateTarget() {
    if (!this.currentTarget) return;
    const t = performance.now() - this.currentTarget.appearTime;
    if (t > this.targetDuration) return void this.missTarget();
    let s = 1;
    (t < 200
      ? (s = t / 200)
      : t > this.targetDuration - 200 && (s = (this.targetDuration - t) / 200),
      (this.currentTarget.pulsePhase += 0.05));
    const a = 1 + 0.1 * Math.sin(this.currentTarget.pulsePhase);
    (this.ctx.save(),
      (this.ctx.globalAlpha = s),
      this.ctx.translate(this.currentTarget.x, this.currentTarget.y),
      this.ctx.scale(a, a),
      (this.ctx.fillStyle = '#FFD700'),
      (this.ctx.strokeStyle = '#FFA500'),
      (this.ctx.lineWidth = 2),
      this.drawStar(0, 0, this.currentTarget.radius),
      this.ctx.restore());
  }
  drawStar(t, s, a) {
    const e = a,
      i = 0.5 * a;
    this.ctx.beginPath();
    for (let a = 0; a < 10; a++) {
      const n = (Math.PI / 5) * a - Math.PI / 2,
        r = a % 2 == 0 ? e : i,
        o = t + Math.cos(n) * r,
        c = s + Math.sin(n) * r;
      0 === a ? this.ctx.moveTo(o, c) : this.ctx.lineTo(o, c);
    }
    (this.ctx.closePath(), this.ctx.fill(), this.ctx.stroke());
  }
  handleClick(t) {
    const s = this.canvas.getBoundingClientRect(),
      a = t.clientX - s.left,
      e = t.clientY - s.top;
    (this.clickPositions.push({ x: a, y: e, timestamp: performance.now() }),
      this.currentTarget
        ? Math.sqrt(
            Math.pow(a - this.currentTarget.x, 2) + Math.pow(e - this.currentTarget.y, 2)
          ) <=
          1.5 * this.currentTarget.radius
          ? this.hitTarget()
          : (this.falsePositives++, this.showFeedback(a, e, 'Miss!', '#FF6B6B'))
        : (this.falsePositives++, this.showFeedback(a, e, 'No target!', '#FF6B6B')),
      this.updateScore());
  }
  handleMouseMove(t) {}
  hitTarget() {
    const t = performance.now() - this.targetAppearTime;
    (this.reactionTimes.push(t),
      this.targetsFound++,
      (this.score += Math.max(100 - Math.floor(t / 20), 10)),
      this.showFeedback(
        this.currentTarget.x,
        this.currentTarget.y,
        `+${Math.max(100 - Math.floor(t / 20), 10)}`,
        '#4ECDC4'
      ),
      (this.currentTarget = null),
      this.logEvent('target_hit', { reactionTime: t, targetsFound: this.targetsFound }),
      this.updateScore());
  }
  missTarget() {
    (this.missedTargets++,
      this.currentTarget &&
        this.showFeedback(this.currentTarget.x, this.currentTarget.y, 'Missed!', '#FF6B6B'),
      (this.currentTarget = null),
      this.logEvent('target_missed', { missedTargets: this.missedTargets }),
      this.updateScore());
  }
  showFeedback(t, s, a, e) {
    const i = { x: t, y: s, text: a, color: e, opacity: 1, offsetY: 0 },
      n = () => {
        i.opacity <= 0 ||
          (this.ctx.save(),
          (this.ctx.globalAlpha = i.opacity),
          (this.ctx.fillStyle = e),
          (this.ctx.font = 'bold 20px Inter'),
          (this.ctx.textAlign = 'center'),
          this.ctx.fillText(a, i.x, i.y - i.offsetY),
          this.ctx.restore(),
          (i.opacity -= 0.02),
          (i.offsetY += 1),
          requestAnimationFrame(n));
      };
    n();
  }
  updateScore() {
    ((document.getElementById('targets-found').textContent = this.targetsFound),
      (document.getElementById('targets-missed').textContent = this.missedTargets));
    const t = this.targetsFound + this.missedTargets + this.falsePositives,
      s = t > 0 ? (this.targetsFound / t) * 100 : 100;
    document.getElementById('accuracy').textContent = `${s.toFixed(0)}%`;
  }
  startCountdown() {
    const t = performance.now(),
      s = () => {
        const a = performance.now() - t,
          e = Math.max(0, this.timeLimit - a),
          i = Math.floor(e / 6e4),
          n = Math.floor((e % 6e4) / 1e3);
        ((document.getElementById('time-left').textContent =
          `${i}:${n.toString().padStart(2, '0')}`),
          e > 0 && this.targetsFound + this.missedTargets < this.targetCount
            ? requestAnimationFrame(s)
            : this.completeTask());
      };
    s();
  }
  drawHeatmap() {
    0 !== this.clickPositions.length &&
      (this.ctx.save(),
      (this.ctx.globalAlpha = 0.3),
      this.clickPositions.forEach(t => {
        const s = this.ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 50);
        (s.addColorStop(0, 'rgba(255, 0, 0, 0.5)'),
          s.addColorStop(1, 'rgba(255, 0, 0, 0)'),
          (this.ctx.fillStyle = s),
          this.ctx.fillRect(t.x - 50, t.y - 50, 100, 100));
      }),
      this.ctx.restore());
  }
  completeTask() {
    this.animationFrame && cancelAnimationFrame(this.animationFrame);
    const t =
        this.reactionTimes.length > 0
          ? this.reactionTimes.reduce((t, s) => t + s, 0) / this.reactionTimes.length
          : 0,
      s =
        (this.targetsFound / (this.targetsFound + this.missedTargets + this.falsePositives)) * 100,
      a = this.analyzeClickDistribution();
    ((this.response = {
      targetsFound: this.targetsFound,
      targetsMissed: this.missedTargets,
      falsePositives: this.falsePositives,
      accuracy: s,
      averageReactionTime: t,
      reactionTimes: this.reactionTimes,
      clickDistribution: a,
      score: this.score
    }),
      this.showCompletion(),
      this.logEvent('task_completed', this.response));
  }
  analyzeClickDistribution() {
    if (0 === this.clickPositions.length) return null;
    const t = [0, 0, 0, 0],
      s = this.canvas.width / 2,
      a = this.canvas.height / 2;
    this.clickPositions.forEach(e => {
      e.x < s && e.y < a
        ? t[0]++
        : e.x >= s && e.y < a
          ? t[1]++
          : e.x < s && e.y >= a
            ? t[2]++
            : t[3]++;
    });
    const e = this.clickPositions.map(t => Math.sqrt(Math.pow(t.x - s, 2) + Math.pow(t.y - a, 2))),
      i = e.reduce((t, s) => t + s, 0) / e.length;
    return {
      quadrants: t,
      averageDistanceFromCenter: i,
      totalClicks: this.clickPositions.length,
      clicksPerSecond: this.clickPositions.length / (this.timeLimit / 1e3)
    };
  }
  showCompletion() {
    const t = document.querySelector('.task-content'),
      s =
        this.response.accuracy > 80
          ? 'Excellent'
          : this.response.accuracy > 60
            ? 'Good'
            : this.response.accuracy > 40
              ? 'Fair'
              : 'Needs Practice';
    t.innerHTML = `\n            <div class="visual-completion">\n                <h3>Visual Attention Task Complete!</h3>\n                <div class="completion-stats">\n                    <div class="stat-row">\n                        <span class="stat-label">Targets Found:</span>\n                        <span class="stat-value">${this.targetsFound} / ${this.targetCount}</span>\n                    </div>\n                    <div class="stat-row">\n                        <span class="stat-label">Accuracy:</span>\n                        <span class="stat-value">${this.response.accuracy.toFixed(1)}%</span>\n                    </div>\n                    <div class="stat-row">\n                        <span class="stat-label">Avg Reaction Time:</span>\n                        <span class="stat-value">${this.response.averageReactionTime.toFixed(0)}ms</span>\n                    </div>\n                    <div class="stat-row">\n                        <span class="stat-label">Performance:</span>\n                        <span class="stat-value">${s}</span>\n                    </div>\n                </div>\n                <p class="completion-message">Your visual attention patterns have been recorded.</p>\n            </div>\n        `;
  }
  addStyles() {
    if (document.getElementById('visual-attention-styles')) return;
    const t = document.createElement('style');
    ((t.id = 'visual-attention-styles'),
      (t.textContent =
        '\n            .visual-attention-instructions {\n                margin-bottom: var(--space-4);\n                padding: var(--space-3);\n                background: var(--sage-50);\n                border-radius: var(--radius-lg);\n                text-align: center;\n            }\n            \n            .visual-attention-instructions h3 {\n                color: var(--sage-700);\n                margin-bottom: var(--space-2);\n            }\n            \n            .target-preview {\n                color: #FFD700;\n                font-size: var(--text-xl);\n                font-weight: bold;\n            }\n            \n            .distractor-preview {\n                color: #4A90E2;\n                font-size: var(--text-xl);\n            }\n            \n            .visual-score-panel {\n                margin-bottom: var(--space-4);\n                padding: var(--space-3);\n                background: var(--white);\n                border: 1px solid var(--border-color);\n                border-radius: var(--radius-lg);\n            }\n            \n            .score-items {\n                display: flex;\n                justify-content: space-around;\n                gap: var(--space-4);\n            }\n            \n            .score-item {\n                text-align: center;\n            }\n            \n            .score-label {\n                display: block;\n                font-size: var(--text-sm);\n                color: var(--gray-600);\n                margin-bottom: var(--space-1);\n            }\n            \n            .score-value {\n                display: block;\n                font-size: var(--text-xl);\n                font-weight: var(--font-semibold);\n                color: var(--sage-600);\n            }\n            \n            .visual-attention-canvas {\n                display: block;\n                width: 100%;\n                max-width: 800px;\n                height: auto;\n                margin: 0 auto var(--space-4);\n                border: 2px solid var(--border-color);\n                border-radius: var(--radius-lg);\n                cursor: crosshair;\n                background: #f8f9fa;\n            }\n            \n            .visual-controls {\n                text-align: center;\n            }\n            \n            .heatmap-toggle {\n                display: inline-flex;\n                align-items: center;\n                gap: var(--space-2);\n                cursor: pointer;\n                padding: var(--space-2) var(--space-3);\n                background: var(--white);\n                border: 1px solid var(--border-color);\n                border-radius: var(--radius-full);\n                transition: all 0.2s ease;\n            }\n            \n            .heatmap-toggle:hover {\n                background: var(--sage-50);\n                border-color: var(--sage-300);\n            }\n            \n            .visual-completion {\n                text-align: center;\n                padding: var(--space-6);\n                background: linear-gradient(135deg, var(--sage-50) 0%, var(--white) 100%);\n                border-radius: var(--radius-xl);\n                border: 2px solid var(--sage-200);\n            }\n            \n            /* Dark mode adjustments */\n            [data-theme="dark"] .visual-attention-canvas {\n                background: #2a2a2a;\n                border-color: var(--gray-600);\n            }\n            \n            [data-theme="dark"] .visual-score-panel {\n                background: var(--gray-100);\n                border-color: var(--gray-300);\n            }\n            \n            [data-theme="dark"] .visual-completion {\n                background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-50) 100%);\n                border-color: var(--sage-600);\n            }\n        '),
      document.head.appendChild(t));
  }
}
export default VisualAttentionTask;
