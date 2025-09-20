import { BaseTask } from './base-task.js';
export class LikertTask extends BaseTask {
  constructor(e) {
    (super(e),
      (this.type = 'likert'),
      (this.scale = e.scale || 5),
      (this.labels = e.labels || this.getDefaultLabels()),
      (this.selectedValue = null));
  }
  getDefaultLabels() {
    return 5 === this.scale
      ? ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
      : 7 === this.scale
        ? [
            'Strongly Disagree',
            'Disagree',
            'Somewhat Disagree',
            'Neutral',
            'Somewhat Agree',
            'Agree',
            'Strongly Agree'
          ]
        : Array.from({ length: this.scale }, (e, t) => `${t + 1}`);
  }
  async render() {
    const e = this.createContainer(),
      t = document.createElement('div');
    t.className = 'likert-scale';
    for (let e = 0; e < this.scale; e++) {
      const s = document.createElement('button');
      ((s.className = 'likert-option'),
        (s.dataset.value = e + 1),
        (s.innerHTML = `\n                <span class="likert-value">${e + 1}</span>\n                <span class="likert-label">${this.labels[e]}</span>\n            `),
        s.addEventListener('click', () => this.selectOption(e + 1, s)),
        t.appendChild(s),
        setTimeout(() => {
          this.animateIn(s);
        }, 50 * e));
    }
    return (e.appendChild(t), e);
  }
  selectOption(e, t) {
    (document.querySelectorAll('.likert-option').forEach(e => {
      e.classList.remove('selected');
    }),
      t.classList.add('selected'),
      (this.selectedValue = e),
      this.logEvent('option_selected', { value: e, label: this.labels[e - 1] }),
      (this.response = { value: e, label: this.labels[e - 1] }));
    const s = document.getElementById('next-button');
    s && (s.disabled = !1);
  }
  async getResults() {
    return {
      ...(await super.getResults()),
      scale: this.scale,
      selectedValue: this.selectedValue,
      selectedLabel: this.selectedValue ? this.labels[this.selectedValue - 1] : null
    };
  }
}
export default LikertTask;
