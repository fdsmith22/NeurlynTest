import { BaseTask } from './base-task.js';
export class RiskBalloonTask extends BaseTask {
  constructor(t) {
    (super(t),
      (this.type = 'risk-balloon'),
      (this.balloons = t.balloons || 5),
      (this.maxPumps = t.maxPumps || 128),
      (this.pumpValue = t.pumpValue || 0.05),
      (this.currency = this.detectCurrency()),
      (this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6B3', '#F7DC6F']),
      (this.currentBalloon = 0),
      (this.currentPumps = 0),
      (this.totalScore = 0),
      (this.balloonHistory = []),
      (this.canvas = null),
      (this.ctx = null),
      (this.animationFrame = null),
      (this.balloon = {
        x: 0,
        y: 0,
        baseRadius: 30,
        currentRadius: 30,
        targetRadius: 30,
        color: this.colors[0],
        popped: !1,
        particles: []
      }),
      (this.explosionProbabilities = this.generateExplosionCurve()));
  }
  detectCurrency() {
    try {
      const t =
          new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'narrowSymbol'
          }).resolvedOptions().locale ||
          navigator.language ||
          'en-US',
        o = Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        n = {
          GB: { symbol: '£', code: 'GBP', name: 'pound' },
          UK: { symbol: '£', code: 'GBP', name: 'pound' },
          US: { symbol: '$', code: 'USD', name: 'dollar' },
          CA: { symbol: '$', code: 'CAD', name: 'dollar' },
          AU: { symbol: '$', code: 'AUD', name: 'dollar' },
          NZ: { symbol: '$', code: 'NZD', name: 'dollar' },
          IN: { symbol: '₹', code: 'INR', name: 'rupee' },
          DE: { symbol: '€', code: 'EUR', name: 'euro' },
          FR: { symbol: '€', code: 'EUR', name: 'euro' },
          ES: { symbol: '€', code: 'EUR', name: 'euro' },
          IT: { symbol: '€', code: 'EUR', name: 'euro' },
          NL: { symbol: '€', code: 'EUR', name: 'euro' },
          BE: { symbol: '€', code: 'EUR', name: 'euro' },
          AT: { symbol: '€', code: 'EUR', name: 'euro' },
          PT: { symbol: '€', code: 'EUR', name: 'euro' },
          FI: { symbol: '€', code: 'EUR', name: 'euro' },
          GR: { symbol: '€', code: 'EUR', name: 'euro' },
          IE: { symbol: '€', code: 'EUR', name: 'euro' },
          BR: { symbol: 'R$', code: 'BRL', name: 'real' },
          JP: { symbol: '¥', code: 'JPY', name: 'yen' },
          CN: { symbol: '¥', code: 'CNY', name: 'yuan' },
          KR: { symbol: '₩', code: 'KRW', name: 'won' },
          RU: { symbol: '₽', code: 'RUB', name: 'ruble' },
          SE: { symbol: 'kr', code: 'SEK', name: 'krona' },
          NO: { symbol: 'kr', code: 'NOK', name: 'krone' },
          DK: { symbol: 'kr', code: 'DKK', name: 'krone' },
          PL: { symbol: 'zł', code: 'PLN', name: 'zloty' },
          TR: { symbol: '₺', code: 'TRY', name: 'lira' },
          TH: { symbol: '฿', code: 'THB', name: 'baht' },
          ID: { symbol: 'Rp', code: 'IDR', name: 'rupiah' },
          MY: { symbol: 'RM', code: 'MYR', name: 'ringgit' },
          VN: { symbol: '₫', code: 'VND', name: 'dong' }
        };
      let e = n[t.split('-')[1] || ''];
      return (
        !e &&
          o &&
          (o.includes('London') || o.includes('Dublin')
            ? (e = n.GB)
            : o.includes('Europe/')
              ? (e = n.DE)
              : o.includes('America/New_York') || o.includes('America/Los_Angeles')
                ? (e = n.US)
                : o.includes('America/Toronto')
                  ? (e = n.CA)
                  : o.includes('Australia/')
                    ? (e = n.AU)
                    : o.includes('Asia/Tokyo')
                      ? (e = n.JP)
                      : (o.includes('Asia/Shanghai') || o.includes('Asia/Beijing')) && (e = n.CN)),
        e || { symbol: '$', code: 'USD', name: 'dollar' }
      );
    } catch (t) {
      return { symbol: '$', code: 'USD', name: 'dollar' };
    }
  }
  formatCurrency(t) {
    return `${this.currency.symbol}${t.toFixed(2)}`;
  }
  generateExplosionCurve() {
    const t = [];
    for (let o = 0; o <= this.maxPumps; o++) {
      const n = Math.pow(o / this.maxPumps, 2);
      t.push(n);
    }
    return t;
  }
  async render() {
    const t = this.createContainer(),
      o = document.createElement('div');
    ((o.className = 'balloon-info-panel'),
      (o.innerHTML = `\n            <div class="balloon-stats">\n                <div class="stat-item">\n                    <span class="stat-label">Balloon</span>\n                    <span class="stat-value" id="balloon-number">1 / ${this.balloons}</span>\n                </div>\n                <div class="stat-item">\n                    <span class="stat-label">Current Value</span>\n                    <span class="stat-value" id="current-value">${this.formatCurrency(0)}</span>\n                </div>\n                <div class="stat-item">\n                    <span class="stat-label">Total Earned</span>\n                    <span class="stat-value" id="total-score">${this.formatCurrency(0)}</span>\n                </div>\n            </div>\n        `),
      t.appendChild(o),
      (this.canvas = document.createElement('canvas')),
      (this.canvas.className = 'balloon-canvas'),
      (this.canvas.width = 600),
      (this.canvas.height = 400),
      t.appendChild(this.canvas),
      (this.ctx = this.canvas.getContext('2d')));
    const n = document.createElement('div');
    ((n.className = 'balloon-controls'),
      (n.innerHTML =
        '\n            <button id="pump-button" class="btn btn-primary balloon-btn">\n                <svg width="20" height="20">\n                    <use href="assets/icons/icons.svg#icon-arrow-up"></use>\n                </svg>\n                Pump Balloon\n            </button>\n            <button id="collect-button" class="btn btn-secondary balloon-btn">\n                <svg width="20" height="20">\n                    <use href="assets/icons/icons.svg#icon-check"></use>\n                </svg>\n                Collect Money\n            </button>\n        '),
      t.appendChild(n));
    const e = document.createElement('div');
    return (
      (e.className = 'risk-indicator'),
      (e.innerHTML =
        '\n            <div class="risk-bar">\n                <div id="risk-fill" class="risk-fill"></div>\n            </div>\n            <span class="risk-label">Risk Level</span>\n        '),
      t.appendChild(e),
      this.addStyles(),
      t
    );
  }
  async initialize() {
    (await super.initialize(),
      (this.balloon.x = this.canvas.width / 2),
      (this.balloon.y = this.canvas.height / 2));
    const t = document.getElementById('pump-button'),
      o = document.getElementById('collect-button');
    (t && t.addEventListener('click', () => this.pumpBalloon()),
      o && o.addEventListener('click', () => this.collectMoney()),
      document.addEventListener('keydown', t => {
        'Space' === t.code
          ? (t.preventDefault(), this.pumpBalloon())
          : 'Enter' === t.code && (t.preventDefault(), this.collectMoney());
      }),
      this.newBalloon(),
      this.animate());
  }
  newBalloon() {
    (this.currentBalloon++,
      (this.currentPumps = 0),
      (this.balloon.color = this.colors[Math.floor(Math.random() * this.colors.length)]),
      (this.balloon.baseRadius = 30),
      (this.balloon.currentRadius = 30),
      (this.balloon.targetRadius = 30),
      (this.balloon.popped = !1),
      (this.balloon.particles = []));
    const t = document.getElementById('balloon-number');
    t && (t.textContent = `${this.currentBalloon} / ${this.balloons}`);
    const o = document.getElementById('current-value');
    o && (o.textContent = this.formatCurrency(0));
    const n = document.getElementById('risk-fill');
    n && (n.style.width = '0%');
    const e = document.getElementById('pump-button');
    e && (e.disabled = !1);
    const s = document.getElementById('collect-button');
    (s && (s.disabled = !1),
      this.logEvent('new_balloon', { number: this.currentBalloon, color: this.balloon.color }));
  }
  pumpBalloon() {
    if (this.balloon.popped || this.currentBalloon > this.balloons) return;
    this.currentPumps++;
    const t = this.currentPumps * this.pumpValue,
      o = this.explosionProbabilities[Math.min(this.currentPumps, this.maxPumps)];
    if (Math.random() < o || this.currentPumps >= this.maxPumps) this.popBalloon();
    else {
      this.balloon.targetRadius = this.balloon.baseRadius + 2 * this.currentPumps;
      const n = document.getElementById('current-value');
      n && (n.textContent = this.formatCurrency(t));
      const e = (this.currentPumps / this.maxPumps) * 100,
        s = document.getElementById('risk-fill');
      (s &&
        ((s.style.width = `${e}%`),
        (s.style.background = e < 30 ? '#96E6B3' : e < 60 ? '#F7DC6F' : '#FF6B6B')),
        navigator.vibrate && navigator.vibrate(10),
        this.logEvent('pump', {
          balloon: this.currentBalloon,
          pumps: this.currentPumps,
          value: t,
          risk: o
        }));
    }
  }
  popBalloon() {
    this.balloon.popped = !0;
    for (let t = 0; t < 20; t++)
      this.balloon.particles.push({
        x: this.balloon.x,
        y: this.balloon.y,
        vx: 10 * (Math.random() - 0.5),
        vy: 10 * (Math.random() - 0.5),
        radius: 5 * Math.random() + 2,
        color: this.balloon.color,
        life: 1
      });
    const t = document.getElementById('pump-button');
    t && (t.disabled = !0);
    const o = document.getElementById('collect-button');
    (o && (o.disabled = !0),
      this.balloonHistory.push({
        balloon: this.currentBalloon,
        pumps: this.currentPumps,
        earned: 0,
        popped: !0,
        color: this.balloon.color
      }),
      this.showFeedback('💥 Balloon Popped! No money earned.', 'error'),
      navigator.vibrate && navigator.vibrate([50, 30, 50]),
      this.logEvent('balloon_popped', {
        balloon: this.currentBalloon,
        pumps: this.currentPumps,
        potentialValue: this.currentPumps * this.pumpValue
      }),
      setTimeout(() => {
        this.currentBalloon < this.balloons ? this.newBalloon() : this.endTask();
      }, 2e3));
  }
  collectMoney() {
    if (this.balloon.popped || 0 === this.currentPumps) return;
    const t = this.currentPumps * this.pumpValue;
    this.totalScore += t;
    const o = document.getElementById('total-score');
    (o && (o.textContent = `$${this.totalScore.toFixed(2)}`),
      this.balloonHistory.push({
        balloon: this.currentBalloon,
        pumps: this.currentPumps,
        earned: t,
        popped: !1,
        color: this.balloon.color
      }),
      (this.balloon.targetRadius = 0),
      this.showFeedback(`✓ Collected $${t.toFixed(2)}!`, 'success'),
      this.logEvent('money_collected', {
        balloon: this.currentBalloon,
        pumps: this.currentPumps,
        earned: t,
        total: this.totalScore
      }));
    const n = document.getElementById('pump-button');
    n && (n.disabled = !0);
    const e = document.getElementById('collect-button');
    (e && (e.disabled = !0),
      setTimeout(() => {
        this.currentBalloon < this.balloons ? this.newBalloon() : this.endTask();
      }, 1e3));
  }
  animate() {
    if (
      ((this.animationFrame = requestAnimationFrame(() => this.animate())),
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height),
      !this.balloon.popped &&
        this.balloon.currentRadius > 0 &&
        (this.ctx.save(),
        (this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'),
        this.ctx.beginPath(),
        this.ctx.ellipse(
          this.balloon.x,
          this.balloon.y + this.balloon.currentRadius + 20,
          0.8 * this.balloon.currentRadius,
          0.3 * this.balloon.currentRadius,
          0,
          0,
          2 * Math.PI
        ),
        this.ctx.fill(),
        this.ctx.restore()),
      this.balloon.currentRadius !== this.balloon.targetRadius)
    ) {
      const t = this.balloon.targetRadius - this.balloon.currentRadius;
      ((this.balloon.currentRadius += 0.1 * t),
        Math.abs(t) < 0.5 && (this.balloon.currentRadius = this.balloon.targetRadius));
    }
    if (!this.balloon.popped && this.balloon.currentRadius > 0) {
      (this.ctx.save(),
        (this.ctx.fillStyle = this.balloon.color),
        this.ctx.beginPath(),
        this.ctx.arc(this.balloon.x, this.balloon.y, this.balloon.currentRadius, 0, 2 * Math.PI),
        this.ctx.fill());
      const t = this.ctx.createRadialGradient(
        this.balloon.x - 0.3 * this.balloon.currentRadius,
        this.balloon.y - 0.3 * this.balloon.currentRadius,
        0,
        this.balloon.x,
        this.balloon.y,
        this.balloon.currentRadius
      );
      (t.addColorStop(0, 'rgba(255, 255, 255, 0.5)'),
        t.addColorStop(1, 'rgba(255, 255, 255, 0)'),
        (this.ctx.fillStyle = t),
        this.ctx.fill(),
        this.ctx.restore(),
        this.ctx.save(),
        (this.ctx.strokeStyle = '#666'),
        (this.ctx.lineWidth = 2),
        this.ctx.beginPath(),
        this.ctx.moveTo(this.balloon.x, this.balloon.y + this.balloon.currentRadius),
        this.ctx.lineTo(this.balloon.x, this.balloon.y + this.balloon.currentRadius + 100),
        this.ctx.stroke(),
        this.ctx.restore());
    }
    this.balloon.particles = this.balloon.particles.filter(
      t => (
        (t.x += t.vx),
        (t.y += t.vy),
        (t.vy += 0.3),
        (t.life -= 0.02),
        t.life > 0 &&
          (this.ctx.save(),
          (this.ctx.globalAlpha = t.life),
          (this.ctx.fillStyle = t.color),
          this.ctx.beginPath(),
          this.ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI),
          this.ctx.fill(),
          this.ctx.restore(),
          !0)
      )
    );
  }
  endTask() {
    cancelAnimationFrame(this.animationFrame);
    const t = this.calculateRiskMetrics();
    this.response = {
      totalScore: this.totalScore,
      balloonHistory: this.balloonHistory,
      riskMetrics: t
    };
    const o = t.averagePumps.toFixed(1),
      n = (100 * t.popRate).toFixed(0);
    (this.showFeedback(
      `Task Complete! Total: $${this.totalScore.toFixed(2)} | Avg Pumps: ${o} | Pop Rate: ${n}%`,
      'success'
    ),
      this.logEvent('task_completed', { totalScore: this.totalScore, metrics: t }));
  }
  calculateRiskMetrics() {
    const t = this.balloonHistory.filter(t => !t.popped),
      o = this.balloonHistory.filter(t => t.popped),
      n = t.length > 0 ? t.reduce((t, o) => t + o.pumps, 0) / t.length : 0,
      e = o.length > 0 ? o.reduce((t, o) => t + o.pumps, 0) / o.length : 0,
      s = Math.floor(this.balloonHistory.length / 2),
      a = this.balloonHistory.slice(0, s),
      l = this.balloonHistory.slice(s),
      i = a.reduce((t, o) => t + o.pumps, 0) / a.length,
      r = l.reduce((t, o) => t + o.pumps, 0) / l.length,
      c = {};
    return (
      this.colors.forEach(t => {
        const o = this.balloonHistory.filter(o => o.color === t);
        o.length > 0 &&
          (c[t] = {
            count: o.length,
            avgPumps: o.reduce((t, o) => t + o.pumps, 0) / o.length,
            popRate: o.filter(t => t.popped).length / o.length
          });
      }),
      {
        totalBalloons: this.balloonHistory.length,
        balloonsCollected: t.length,
        balloonsPopped: o.length,
        popRate: o.length / this.balloonHistory.length,
        averagePumps:
          this.balloonHistory.reduce((t, o) => t + o.pumps, 0) / this.balloonHistory.length,
        avgPumpsCollected: n,
        avgPumpsPopped: e,
        learningCurve: r - i,
        adaptationRate: (r - i) / i,
        colorPerformance: c,
        riskTolerance: this.calculateRiskTolerance(),
        consistency: this.calculateConsistency()
      }
    );
  }
  calculateRiskTolerance() {
    const t = this.balloonHistory.reduce((t, o) => t + o.pumps, 0) / this.balloonHistory.length;
    return Math.min(1, t / 64);
  }
  calculateConsistency() {
    if (this.balloonHistory.length < 2) return 0;
    const t = this.balloonHistory.map(t => t.pumps),
      o = t.reduce((t, o) => t + o, 0) / t.length,
      n = t.reduce((t, n) => t + Math.pow(n - o, 2), 0) / t.length,
      e = Math.sqrt(n) / o;
    return Math.max(0, 1 - e);
  }
  addStyles() {
    if (document.getElementById('balloon-task-styles')) return;
    const t = document.createElement('style');
    ((t.id = 'balloon-task-styles'),
      (t.textContent =
        '\n            .task-risk-balloon {\n                padding: var(--space-4);\n            }\n            \n            .balloon-info-panel {\n                background: var(--white);\n                border: 1px solid var(--border-color);\n                border-radius: var(--radius-lg);\n                padding: var(--space-4);\n                margin-bottom: var(--space-4);\n            }\n            \n            .balloon-stats {\n                display: flex;\n                justify-content: space-between;\n                gap: var(--space-4);\n            }\n            \n            .stat-item {\n                text-align: center;\n                flex: 1;\n            }\n            \n            .stat-label {\n                display: block;\n                font-size: var(--text-sm);\n                color: var(--gray-600);\n                margin-bottom: var(--space-1);\n            }\n            \n            .stat-value {\n                display: block;\n                font-size: var(--text-xl);\n                font-weight: var(--font-semibold);\n                color: var(--sage-600);\n            }\n            \n            .balloon-canvas {\n                display: block;\n                width: 100%;\n                max-width: 600px;\n                height: 400px;\n                margin: 0 auto var(--space-4);\n                border: 1px solid var(--border-color);\n                border-radius: var(--radius-lg);\n                background: linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 100%);\n            }\n            \n            .balloon-controls {\n                display: flex;\n                gap: var(--space-3);\n                justify-content: center;\n                margin-bottom: var(--space-4);\n            }\n            \n            .balloon-btn {\n                min-width: 150px;\n            }\n            \n            .risk-indicator {\n                max-width: 400px;\n                margin: 0 auto;\n                text-align: center;\n            }\n            \n            .risk-bar {\n                height: 20px;\n                background: var(--gray-200);\n                border-radius: var(--radius-full);\n                overflow: hidden;\n                margin-bottom: var(--space-2);\n            }\n            \n            .risk-fill {\n                height: 100%;\n                width: 0%;\n                background: #96E6B3;\n                transition: width 0.3s ease, background-color 0.3s ease;\n            }\n            \n            .risk-label {\n                font-size: var(--text-sm);\n                color: var(--gray-600);\n            }\n            \n            .task-feedback {\n                position: fixed;\n                top: 50%;\n                left: 50%;\n                transform: translate(-50%, -50%);\n                padding: var(--space-4);\n                border-radius: var(--radius-lg);\n                background: var(--white);\n                box-shadow: var(--shadow-xl);\n                z-index: 1000;\n                animation: feedbackPulse 0.3s ease;\n            }\n            \n            .feedback-success {\n                border-left: 4px solid var(--sage-500);\n                color: var(--sage-700);\n            }\n            \n            .feedback-error {\n                border-left: 4px solid #FF6B6B;\n                color: #CC5555;\n            }\n            \n            @keyframes feedbackPulse {\n                0% {\n                    transform: translate(-50%, -50%) scale(0.9);\n                    opacity: 0;\n                }\n                50% {\n                    transform: translate(-50%, -50%) scale(1.05);\n                }\n                100% {\n                    transform: translate(-50%, -50%) scale(1);\n                    opacity: 1;\n                }\n            }\n        '),
      document.head.appendChild(t));
  }
}
export default RiskBalloonTask;
