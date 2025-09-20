export class BehavioralTracker {
  constructor(t = {}) {
    ((this.options = {
      trackMouse: !1 !== t.trackMouse,
      trackKeyboard: !1 !== t.trackKeyboard,
      trackScroll: !1 !== t.trackScroll,
      trackFocus: !1 !== t.trackFocus,
      trackClicks: !1 !== t.trackClicks,
      trackTouch: !1 !== t.trackTouch,
      sampleRate: t.sampleRate || 60,
      ...t
    }),
      (this.isTracking = !1),
      (this.sessionData = {
        events: [],
        mouseTrail: [],
        keystrokes: [],
        scrollPatterns: [],
        focusChanges: [],
        clicks: [],
        touches: [],
        startTime: null,
        endTime: null
      }),
      (this.lastMouseTime = 0),
      (this.mouseSampleInterval = 1e3 / this.options.sampleRate),
      (this.metrics = {
        mouseVelocity: [],
        mouseAcceleration: [],
        dwellTimes: [],
        hesitations: [],
        corrections: [],
        attentionSpans: []
      }),
      (this.handleMouseMove = this.handleMouseMove.bind(this)),
      (this.handleClick = this.handleClick.bind(this)),
      (this.handleKeyDown = this.handleKeyDown.bind(this)),
      (this.handleKeyUp = this.handleKeyUp.bind(this)),
      (this.handleScroll = this.handleScroll.bind(this)),
      (this.handleFocus = this.handleFocus.bind(this)),
      (this.handleBlur = this.handleBlur.bind(this)),
      (this.handleTouchStart = this.handleTouchStart.bind(this)),
      (this.handleTouchMove = this.handleTouchMove.bind(this)),
      (this.handleTouchEnd = this.handleTouchEnd.bind(this)),
      (this.handleVisibilityChange = this.handleVisibilityChange.bind(this)));
  }
  start(t = document) {
    this.isTracking ||
      ((this.isTracking = !0),
      (this.sessionData.startTime = performance.now()),
      (this.container = t),
      this.options.trackMouse &&
        t.addEventListener('mousemove', this.handleMouseMove, { passive: !0 }),
      this.options.trackClicks && t.addEventListener('click', this.handleClick, !0),
      this.options.trackKeyboard &&
        (t.addEventListener('keydown', this.handleKeyDown),
        t.addEventListener('keyup', this.handleKeyUp)),
      this.options.trackScroll &&
        window.addEventListener('scroll', this.handleScroll, { passive: !0 }),
      this.options.trackFocus &&
        (t.addEventListener('focus', this.handleFocus, !0),
        t.addEventListener('blur', this.handleBlur, !0)),
      this.options.trackTouch &&
        'ontouchstart' in window &&
        (t.addEventListener('touchstart', this.handleTouchStart, { passive: !0 }),
        t.addEventListener('touchmove', this.handleTouchMove, { passive: !0 }),
        t.addEventListener('touchend', this.handleTouchEnd, { passive: !0 })),
      document.addEventListener('visibilitychange', this.handleVisibilityChange),
      this.logEvent('tracking_started'));
  }
  stop() {
    this.isTracking &&
      ((this.isTracking = !1),
      (this.sessionData.endTime = performance.now()),
      this.container &&
        (this.container.removeEventListener('mousemove', this.handleMouseMove),
        this.container.removeEventListener('click', this.handleClick),
        this.container.removeEventListener('keydown', this.handleKeyDown),
        this.container.removeEventListener('keyup', this.handleKeyUp),
        this.container.removeEventListener('focus', this.handleFocus),
        this.container.removeEventListener('blur', this.handleBlur),
        this.container.removeEventListener('touchstart', this.handleTouchStart),
        this.container.removeEventListener('touchmove', this.handleTouchMove),
        this.container.removeEventListener('touchend', this.handleTouchEnd)),
      window.removeEventListener('scroll', this.handleScroll),
      document.removeEventListener('visibilitychange', this.handleVisibilityChange),
      this.logEvent('tracking_stopped'),
      this.calculateMetrics());
  }
  handleMouseMove(t) {
    const e = performance.now();
    if (e - this.lastMouseTime < this.mouseSampleInterval) return;
    this.lastMouseTime = e;
    const s = e - this.sessionData.startTime,
      i = {
        x: t.clientX,
        y: t.clientY,
        pageX: t.pageX,
        pageY: t.pageY,
        timestamp: s,
        target: this.getElementSelector(t.target)
      };
    if ((this.sessionData.mouseTrail.push(i), this.sessionData.mouseTrail.length > 1)) {
      const t = this.sessionData.mouseTrail[this.sessionData.mouseTrail.length - 2],
        e = Math.sqrt(Math.pow(i.x - t.x, 2) + Math.pow(i.y - t.y, 2)),
        a = i.timestamp - t.timestamp,
        n = e / a;
      if (
        (this.metrics.mouseVelocity.push({ velocity: n, timestamp: s }),
        this.metrics.mouseVelocity.length > 1)
      ) {
        const t =
          (n - this.metrics.mouseVelocity[this.metrics.mouseVelocity.length - 2].velocity) / a;
        this.metrics.mouseAcceleration.push({ acceleration: t, timestamp: s });
      }
    }
  }
  handleClick(t) {
    const e = performance.now() - this.sessionData.startTime,
      s = {
        x: t.clientX,
        y: t.clientY,
        button: t.button,
        target: this.getElementSelector(t.target),
        timestamp: e,
        doubleClick: this.isDoubleClick(e)
      };
    (this.sessionData.clicks.push(s), this.logEvent('click', s));
  }
  handleKeyDown(t) {
    const e = performance.now() - this.sessionData.startTime,
      s = {
        key: t.key,
        code: t.code,
        timestamp: e,
        target: this.getElementSelector(t.target),
        modifiers: { shift: t.shiftKey, ctrl: t.ctrlKey, alt: t.altKey, meta: t.metaKey }
      };
    (this.sessionData.keystrokes.push({ ...s, type: 'down' }),
      ('Backspace' !== t.key && 'Delete' !== t.key) || this.metrics.corrections.push(e));
  }
  handleKeyUp(t) {
    const e = performance.now() - this.sessionData.startTime;
    this.sessionData.keystrokes.push({ key: t.key, code: t.code, timestamp: e, type: 'up' });
    const s = this.sessionData.keystrokes.filter(e => 'down' === e.type && e.code === t.code).pop();
    if (s) {
      const i = e - s.timestamp;
      this.metrics.dwellTimes.push({ key: t.key, duration: i, timestamp: e });
    }
  }
  handleScroll(t) {
    const e = performance.now() - this.sessionData.startTime;
    this.sessionData.scrollPatterns.push({
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      timestamp: e,
      velocity: this.calculateScrollVelocity()
    });
  }
  handleFocus(t) {
    const e = performance.now() - this.sessionData.startTime;
    if (
      (this.sessionData.focusChanges.push({
        type: 'focus',
        target: this.getElementSelector(t.target),
        timestamp: e
      }),
      this.lastBlurTime)
    ) {
      const t = e - this.lastBlurTime;
      this.metrics.attentionSpans.push(t);
    }
  }
  handleBlur(t) {
    const e = performance.now() - this.sessionData.startTime;
    (this.sessionData.focusChanges.push({
      type: 'blur',
      target: this.getElementSelector(t.target),
      timestamp: e
    }),
      (this.lastBlurTime = e));
  }
  handleTouchStart(t) {
    const e = performance.now() - this.sessionData.startTime;
    for (let s of t.touches)
      this.sessionData.touches.push({
        type: 'start',
        identifier: s.identifier,
        x: s.clientX,
        y: s.clientY,
        force: s.force || 0,
        timestamp: e
      });
  }
  handleTouchMove(t) {
    const e = performance.now() - this.sessionData.startTime;
    for (let s of t.touches)
      this.sessionData.touches.push({
        type: 'move',
        identifier: s.identifier,
        x: s.clientX,
        y: s.clientY,
        force: s.force || 0,
        timestamp: e
      });
  }
  handleTouchEnd(t) {
    const e = performance.now() - this.sessionData.startTime;
    for (let s of t.changedTouches)
      this.sessionData.touches.push({
        type: 'end',
        identifier: s.identifier,
        x: s.clientX,
        y: s.clientY,
        timestamp: e
      });
  }
  handleVisibilityChange() {
    const t = performance.now() - this.sessionData.startTime;
    (this.logEvent('visibility_change', { hidden: document.hidden, timestamp: t }),
      document.hidden && this.metrics.hesitations.push({ type: 'tab_switch', timestamp: t }));
  }
  logEvent(t, e = {}) {
    this.sessionData.events.push({
      type: t,
      data: e,
      timestamp: performance.now() - (this.sessionData.startTime || 0)
    });
  }
  getElementSelector(t) {
    if (!t) return null;
    let e = t.tagName.toLowerCase();
    return (
      t.id && (e += `#${t.id}`),
      t.className &&
        'string' == typeof t.className &&
        (e += `.${t.className.split(' ').join('.')}`),
      e
    );
  }
  isDoubleClick(t) {
    return (
      0 !== this.sessionData.clicks.length &&
      t - this.sessionData.clicks[this.sessionData.clicks.length - 1].timestamp < 500
    );
  }
  calculateScrollVelocity() {
    if (this.sessionData.scrollPatterns.length < 2) return 0;
    const t = this.sessionData.scrollPatterns[this.sessionData.scrollPatterns.length - 1],
      e = this.sessionData.scrollPatterns[this.sessionData.scrollPatterns.length - 2];
    return (t.scrollY - e.scrollY) / (t.timestamp - e.timestamp);
  }
  calculateMetrics() {
    return {
      totalDuration: this.sessionData.endTime - this.sessionData.startTime,
      activeTime: this.calculateActiveTime(),
      idleTime: this.calculateIdleTime(),
      mouseDistance: this.calculateMouseDistance(),
      averageMouseVelocity: this.calculateAverageVelocity(),
      mouseAccelerationPatterns: this.analyzeAcceleration(),
      mouseIdleTimes: this.calculateMouseIdleTimes(),
      typingSpeed: this.calculateTypingSpeed(),
      averageDwellTime: this.calculateAverageDwellTime(),
      correctionRate: this.metrics.corrections.length / this.sessionData.keystrokes.length,
      clickCount: this.sessionData.clicks.length,
      doubleClickCount: this.sessionData.clicks.filter(t => t.doubleClick).length,
      focusChanges: this.sessionData.focusChanges.length,
      averageAttentionSpan: this.calculateAverageAttentionSpan(),
      distractionEvents: this.metrics.hesitations.length,
      scrollEvents: this.sessionData.scrollPatterns.length,
      averageScrollVelocity: this.calculateAverageScrollVelocity(),
      touchEvents: this.sessionData.touches.length,
      averageTouchPressure: this.calculateAverageTouchPressure()
    };
  }
  calculateActiveTime() {
    const t = [
      ...this.sessionData.clicks,
      ...this.sessionData.keystrokes,
      ...this.sessionData.scrollPatterns
    ].sort((t, e) => t.timestamp - e.timestamp);
    if (t.length < 2) return 0;
    let e = 0,
      s = t[0].timestamp;
    for (let i of t) {
      const t = i.timestamp - s;
      (t < 5e3 && (e += t), (s = i.timestamp));
    }
    return e;
  }
  calculateIdleTime() {
    return this.sessionData.endTime - this.sessionData.startTime - this.calculateActiveTime();
  }
  calculateMouseDistance() {
    let t = 0;
    for (let e = 1; e < this.sessionData.mouseTrail.length; e++) {
      const s = this.sessionData.mouseTrail[e - 1],
        i = this.sessionData.mouseTrail[e];
      t += Math.sqrt(Math.pow(i.x - s.x, 2) + Math.pow(i.y - s.y, 2));
    }
    return t;
  }
  calculateAverageVelocity() {
    return 0 === this.metrics.mouseVelocity.length
      ? 0
      : this.metrics.mouseVelocity.reduce((t, e) => t + e.velocity, 0) /
          this.metrics.mouseVelocity.length;
  }
  analyzeAcceleration() {
    if (0 === this.metrics.mouseAcceleration.length) return null;
    const t = this.metrics.mouseAcceleration.map(t => t.acceleration);
    return {
      mean: t.reduce((t, e) => t + e, 0) / t.length,
      max: Math.max(...t),
      min: Math.min(...t),
      std: this.calculateStandardDeviation(t)
    };
  }
  calculateMouseIdleTimes() {
    const t = [];
    for (let e = 1; e < this.sessionData.mouseTrail.length; e++) {
      const s =
        this.sessionData.mouseTrail[e].timestamp - this.sessionData.mouseTrail[e - 1].timestamp;
      s > 1e3 && t.push(s);
    }
    return t;
  }
  calculateTypingSpeed() {
    const t = this.sessionData.keystrokes.filter(t => 'down' === t.type && 1 === t.key.length);
    if (t.length < 2) return 0;
    const e = (t[t.length - 1].timestamp - t[0].timestamp) / 6e4;
    return t.length / 5 / e;
  }
  calculateAverageDwellTime() {
    return 0 === this.metrics.dwellTimes.length
      ? 0
      : this.metrics.dwellTimes.reduce((t, e) => t + e.duration, 0) /
          this.metrics.dwellTimes.length;
  }
  calculateAverageAttentionSpan() {
    return 0 === this.metrics.attentionSpans.length
      ? 0
      : this.metrics.attentionSpans.reduce((t, e) => t + e, 0) / this.metrics.attentionSpans.length;
  }
  calculateAverageScrollVelocity() {
    if (0 === this.sessionData.scrollPatterns.length) return 0;
    const t = this.sessionData.scrollPatterns.map(t => Math.abs(t.velocity)).filter(t => t > 0);
    return 0 === t.length ? 0 : t.reduce((t, e) => t + e, 0) / t.length;
  }
  calculateAverageTouchPressure() {
    const t = this.sessionData.touches.filter(t => t.force > 0);
    return 0 === t.length ? 0 : t.reduce((t, e) => t + e.force, 0) / t.length;
  }
  calculateStandardDeviation(t) {
    const e = t.reduce((t, e) => t + e, 0) / t.length,
      s = t.map(t => Math.pow(t - e, 2)).reduce((t, e) => t + e, 0) / t.length;
    return Math.sqrt(s);
  }
  getData() {
    return {
      session: this.sessionData,
      metrics: this.calculateMetrics(),
      patterns: this.analyzePatterns()
    };
  }
  analyzePatterns() {
    return {
      impulsivity: this.analyzeImpulsivity(),
      precision: this.analyzePrecision(),
      consistency: this.analyzeConsistency(),
      engagement: this.analyzeEngagement(),
      anxiety: this.analyzeAnxiety()
    };
  }
  analyzeImpulsivity() {
    const t = this.sessionData.clicks.filter(
        (t, e) => 0 !== e && t.timestamp - this.sessionData.clicks[e - 1].timestamp < 500
      ).length,
      e = this.metrics.mouseVelocity.filter(t => t.velocity > 2).length;
    return {
      score: (t + e) / (this.sessionData.clicks.length + this.metrics.mouseVelocity.length),
      quickClicks: t,
      highVelocityMoves: e
    };
  }
  analyzePrecision() {
    const t = this.metrics.corrections.length / Math.max(1, this.sessionData.keystrokes.length),
      e = this.calculateMouseJitter();
    return { score: 1 - (t + e) / 2, correctionRate: t, mouseJitter: e };
  }
  calculateMouseJitter() {
    if (this.metrics.mouseAcceleration.length < 2) return 0;
    let t = 0;
    for (let e = 1; e < this.metrics.mouseAcceleration.length; e++) {
      const s = this.metrics.mouseAcceleration[e].acceleration,
        i = this.metrics.mouseAcceleration[e - 1].acceleration;
      Math.sign(s) !== Math.sign(i) && t++;
    }
    return t / this.metrics.mouseAcceleration.length;
  }
  analyzeConsistency() {
    const t =
        this.metrics.mouseVelocity.length > 0
          ? this.calculateStandardDeviation(this.metrics.mouseVelocity.map(t => t.velocity))
          : 0,
      e =
        this.metrics.dwellTimes.length > 0
          ? this.calculateStandardDeviation(this.metrics.dwellTimes.map(t => t.duration))
          : 0;
    return { score: 1 / (1 + t + e), velocityVariance: t, dwellTimeVariance: e };
  }
  analyzeEngagement() {
    const t = this.calculateActiveTime() / (this.sessionData.endTime - this.sessionData.startTime),
      e =
        (this.sessionData.clicks.length + this.sessionData.keystrokes.length) /
        ((this.sessionData.endTime - this.sessionData.startTime) / 1e3);
    return { score: (t + Math.min(1, e / 5)) / 2, activeRatio: t, interactionRate: e };
  }
  analyzeAnxiety() {
    const t = this.metrics.hesitations.length,
      e = this.metrics.corrections.length / Math.max(1, this.sessionData.keystrokes.length),
      s = this.calculateMouseIdleTimes().length;
    return {
      score: (t + 10 * e + s) / (this.sessionData.events.length || 1),
      hesitations: t,
      corrections: e,
      mouseIdles: s
    };
  }
}
export const behavioralTracker = new BehavioralTracker();
