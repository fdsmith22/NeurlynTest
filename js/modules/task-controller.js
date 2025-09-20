export class TaskController {
  constructor() {
    ((this.taskTypes = {
      likert: 'LikertTask',
      lateral: 'LateralTask',
      'risk-balloon': 'RiskBalloonTask',
      'word-association': 'WordAssociationTask',
      'visual-attention': 'VisualAttentionTask',
      'pattern-recognition': 'PatternRecognitionTask'
    }),
      (this.loadedTasks = new Map()),
      (this.currentTask = null),
      (this.behavioralData = []),
      this.validateTaskMappings());
  }
  async validateTaskMappings() {
// console.log('🔍 Validating task type mappings...');
    const e = { valid: [], invalid: [], warnings: [] };
    for (const [t, s] of Object.entries(this.taskTypes))
      try {
        (await import(`../tasks/${t}.js`))[s]
          ? (e.valid.push({ taskType: t, className: s }), console.log(`✅ ${t} → ${s}`))
          : (e.invalid.push({
              taskType: t,
              className: s,
              error: `Class '${s}' not found in module`
            }),
            console.error(`❌ ${t} → ${s} (class not found)`));
      } catch (a) {
        (e.invalid.push({ taskType: t, className: s, error: a.message }),
          console.error(`❌ ${t} → ${s} (${a.message})`));
      }
    return (
      ['lateral', 'likert', 'choice', 'multiple-choice', 'scale'].forEach(t => {
        this.taskTypes[t] ||
          (e.warnings.push(`Warning: Common task type '${t}' not in mapping`),
          console.warn(`⚠️  Common task type '${t}' not in mapping`));
      }),
// console.log(
        `📊 Validation complete: ${e.valid.length} valid, ${e.invalid.length} invalid, ${e.warnings.length} warnings`
      ),
      e.invalid.length > 0 && console.warn('Some task types may not work correctly:', e.invalid),
      e
    );
  }
  async loadTask(e, t) {
    const s = e;
    if (
      (this.taskTypes[e] ||
        (console.error(
          `CRITICAL: Unknown task type: '${e}'. This will cause incorrect question rendering!`
        ),
        console.error('Available task types:', Object.keys(this.taskTypes)),
        console.error('Question data:', {
          type: t.type,
          question: t.question?.substring(0, 100) + '...'
        }),
        'undefined' != typeof window &&
          window.neurlynApp &&
          window.neurlynApp.showToast(
            `ERROR: Task type '${e}' not found. Falling back to Likert.`,
            'error'
          ),
        (e = 'likert')),
      !this.loadedTasks.has(e))
    )
      try {
        const t = (await import(`../tasks/${e}.js`))[this.taskTypes[e]];
        if (!t) throw new Error(`Task class '${this.taskTypes[e]}' not found in module ${e}.js`);
        (this.loadedTasks.set(e, t),
          s !== e
            ? console.warn(`Successfully loaded fallback task: ${e}`)
            : console.log(`Successfully loaded task: ${e}`));
      } catch (t) {
        (console.error(`Failed to load task module: ${e}`, t),
          console.error(`Module path attempted: ../tasks/${e}.js`),
          console.error(`Expected class name: ${this.taskTypes[e]}`));
        try {
          const t = (await import('../tasks/likert.js')).LikertTask;
          (this.loadedTasks.set(e, t),
            'undefined' != typeof window &&
              window.neurlynApp &&
              window.neurlynApp.showToast(
                `Failed to load ${s} task. Using Likert fallback.`,
                'error'
              ));
        } catch (e) {
          throw (
            console.error('FATAL: Even Likert fallback failed:', e),
            new Error(`Cannot load any task type. Original: ${s}, Fallback: likert`)
          );
        }
      }
    const a = this.loadedTasks.get(e);
    return ((this.currentTask = new a(t)), this.currentTask);
  }
  async renderTask(e) {
    if (!this.currentTask) throw new Error('No task loaded');
    ((e.innerHTML = ''), (e.className = `task-container task-${this.currentTask.type}`));
    const t = await this.currentTask.render();
    (e.appendChild(t), await this.currentTask.initialize(), this.startBehavioralTracking(e));
  }
  startBehavioralTracking(e) {
    const t = performance.now(),
      s = [],
      a = e => {
        s.push({
          type: 'mouse',
          x: e.clientX,
          y: e.clientY,
          timestamp: performance.now() - t,
          target: e.target.className
        });
      },
      n = e => {
        s.push({
          type: 'click',
          x: e.clientX,
          y: e.clientY,
          timestamp: performance.now() - t,
          target: e.target.className
        });
      },
      r = e => {
        s.push({ type: 'key', key: e.key, timestamp: performance.now() - t });
      },
      o = e => {
        s.push({ type: 'focus', target: e.target.className, timestamp: performance.now() - t });
      },
      i = e => {
        s.push({ type: 'scroll', scrollY: window.scrollY, timestamp: performance.now() - t });
      };
    (e.addEventListener('mousemove', a, { passive: !0 }),
      e.addEventListener('click', n),
      e.addEventListener('keydown', r),
      e.addEventListener('focus', o, !0),
      window.addEventListener('scroll', i, { passive: !0 }),
      (this.currentTask.cleanup = () => {
        (e.removeEventListener('mousemove', a),
          e.removeEventListener('click', n),
          e.removeEventListener('keydown', r),
          e.removeEventListener('focus', o),
          window.removeEventListener('scroll', i),
          this.behavioralData.push({
            taskId: this.currentTask.id,
            taskType: this.currentTask.type,
            events: s,
            duration: performance.now() - t
          }));
      }));
  }
  async getTaskResults() {
    if (!this.currentTask) throw new Error('No task loaded');
    return (
      this.currentTask.cleanup && this.currentTask.cleanup(),
      {
        ...(await this.currentTask.getResults()),
        behavioral: this.analyzeBehavioralData(),
        taskType: this.currentTask.type,
        taskId: this.currentTask.id,
        timestamp: Date.now()
      }
    );
  }
  analyzeBehavioralData() {
    if (0 === this.behavioralData.length) return null;
    const e = this.behavioralData[this.behavioralData.length - 1],
      t = e.events;
    return {
      totalDuration: e.duration,
      mouseMovements: t.filter(e => 'mouse' === e.type).length,
      clicks: t.filter(e => 'click' === e.type).length,
      keystrokes: t.filter(e => 'key' === e.type).length,
      averageResponseTime: this.calculateAverageResponseTime(t),
      hesitationScore: this.calculateHesitationScore(t),
      engagementScore: this.calculateEngagementScore(t),
      mousePathLength: this.calculateMousePathLength(t),
      focusChanges: t.filter(e => 'focus' === e.type).length
    };
  }
  calculateAverageResponseTime(e) {
    const t = e.filter(e => 'click' === e.type || 'key' === e.type);
    if (t.length < 2) return 0;
    let s = 0;
    for (let e = 1; e < t.length; e++) s += t[e].timestamp - t[e - 1].timestamp;
    return s / (t.length - 1);
  }
  calculateHesitationScore(e) {
    const t = e.filter(e => 'click' === e.type || 'key' === e.type);
    if (t.length < 2) return 0;
    let s = 0;
    for (let e = 1; e < t.length; e++) t[e].timestamp - t[e - 1].timestamp > 2e3 && s++;
    return s / t.length;
  }
  calculateEngagementScore(e) {
    if (0 === e.length) return 0;
    const t = e[e.length - 1].timestamp,
      s = e.length / (t / 1e3);
    return Math.min(1, Math.max(0, (s - 2) / 8));
  }
  calculateMousePathLength(e) {
    const t = e.filter(e => 'mouse' === e.type);
    if (t.length < 2) return 0;
    let s = 0;
    for (let e = 1; e < t.length; e++) {
      const a = t[e].x - t[e - 1].x,
        n = t[e].y - t[e - 1].y;
      s += Math.sqrt(a * a + n * n);
    }
    return s;
  }
  destroy() {
    this.currentTask &&
      (this.currentTask.cleanup && this.currentTask.cleanup(),
      this.currentTask.destroy && this.currentTask.destroy(),
      (this.currentTask = null));
  }
}
export const taskController = new TaskController();
