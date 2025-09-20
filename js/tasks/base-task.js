export class BaseTask {
  constructor(t) {
    if (new.target === BaseTask)
      throw new Error('BaseTask is an abstract class and cannot be instantiated directly');
    ((this.id = t.id || this.generateId()),
      (this.type = t.type || 'unknown'),
      (this.question = t.question || ''),
      (this.instructions = t.instructions || ''),
      (this.category = t.category || 'general'),
      (this.timeLimit = t.timeLimit || null),
      (this.data = t),
      (this.startTime = null),
      (this.endTime = null),
      (this.response = null),
      (this.metrics = {}),
      (this.container = null),
      (this.cleanup = null));
  }
  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  async render() {
    throw new Error('render() method must be implemented by subclass');
  }
  async initialize() {
    ((this.startTime = performance.now()), this.logEvent('task_started'));
  }
  async getResults() {
    this.endTime = performance.now();
    const t = this.endTime - this.startTime;
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      question: this.question,
      response: this.response,
      metrics: { ...this.metrics, duration: t, startTime: this.startTime, endTime: this.endTime },
      timestamp: Date.now()
    };
  }
  logEvent(t, e = {}) {
    (this.metrics.events || (this.metrics.events = []),
      this.metrics.events.push({
        type: t,
        timestamp: performance.now() - this.startTime,
        data: e
      }));
  }
  createContainer() {
    const t = document.createElement('div');
    if (((t.className = 'task-content'), this.instructions)) {
      const e = document.createElement('div');
      ((e.className = 'task-instructions'),
        (e.innerHTML = `\n                <svg class="instruction-icon" width="16" height="16">\n                    <use href="assets/icons/icons.svg#icon-info"></use>\n                </svg>\n                <p>${this.instructions}</p>\n            `),
        t.appendChild(e));
    }
    if (this.question) {
      const e = document.createElement('h3');
      ((e.className = 'task-question'), (e.textContent = this.question), t.appendChild(e));
    }
    if (this.timeLimit) {
      const e = document.createElement('div');
      ((e.className = 'task-timer'),
        (e.innerHTML = `\n                <svg width="16" height="16">\n                    <use href="assets/icons/icons.svg#icon-clock"></use>\n                </svg>\n                <span id="task-timer-display">${this.formatTime(this.timeLimit)}</span>\n            `),
        t.appendChild(e),
        this.startTimer(e.querySelector('#task-timer-display')));
    }
    return ((this.container = t), t);
  }
  startTimer(t) {
    let e = this.timeLimit;
    this.timerInterval = setInterval(() => {
      ((e -= 1e3),
        e <= 0
          ? (clearInterval(this.timerInterval), this.onTimeUp(), (t.textContent = '0:00'))
          : ((t.textContent = this.formatTime(e)),
            e < 1e4 && t.parentElement.classList.add('timer-warning')));
    }, 1e3);
  }
  formatTime(t) {
    const e = Math.floor(t / 1e3);
    return `${Math.floor(e / 60)}:${(e % 60).toString().padStart(2, '0')}`;
  }
  onTimeUp() {
    this.logEvent('time_up');
  }
  validateResponse() {
    return null !== this.response && void 0 !== this.response;
  }
  destroy() {
    (this.timerInterval && clearInterval(this.timerInterval),
      this.cleanup && this.cleanup(),
      this.container && this.container.remove());
  }
  showFeedback(t, e = 'info') {
    const s = document.createElement('div');
    ((s.className = `task-feedback feedback-${e}`),
      (s.textContent = t),
      this.container &&
        (this.container.appendChild(s),
        setTimeout(() => {
          s.remove();
        }, 3e3)));
  }
  animateIn(t) {
    ((t.style.opacity = '0'),
      (t.style.transform = 'translateY(20px)'),
      requestAnimationFrame(() => {
        ((t.style.transition = 'opacity 0.3s ease, transform 0.3s ease'),
          (t.style.opacity = '1'),
          (t.style.transform = 'translateY(0)'));
      }));
  }
  animateOut(t) {
    return new Promise(e => {
      ((t.style.transition = 'opacity 0.2s ease, transform 0.2s ease'),
        (t.style.opacity = '0'),
        (t.style.transform = 'translateY(-20px)'),
        setTimeout(() => {
          (t.remove(), e());
        }, 200));
    });
  }
}
