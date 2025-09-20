export class EmergencyProtocols {
  constructor() {
    ((this.crisisIndicators = {
      severe: [
        'want to die',
        'kill myself',
        'end it all',
        'suicide',
        'not worth living',
        'better off dead',
        'no point',
        'self harm',
        'hurt myself',
        'cutting'
      ],
      moderate: [
        'hopeless',
        'worthless',
        'cant go on',
        'giving up',
        'no way out',
        'trapped',
        'unbearable',
        'cant cope'
      ],
      trauma: [
        'flashback',
        'panic',
        'triggered',
        'ptsd',
        'nightmare',
        'dissociate',
        'numb',
        'hypervigilant'
      ]
    }),
      (this.resources = {
        crisis: {
          us: {
            name: '988 Suicide & Crisis Lifeline',
            phone: '988',
            text: 'Text HOME to 741741',
            web: 'https://988lifeline.org'
          },
          uk: {
            name: 'Samaritans',
            phone: '116 123',
            email: 'jo@samaritans.org',
            web: 'https://www.samaritans.org'
          },
          international: { name: 'International Crisis Lines', web: 'https://findahelpline.com' }
        },
        neurodivergent: {
          adhd: {
            name: 'CHADD - ADHD Support',
            web: 'https://chadd.org',
            description: 'Resources and support for ADHD'
          },
          autism: {
            name: 'Autistic Self Advocacy Network',
            web: 'https://autisticadvocacy.org',
            description: 'By and for autistic people'
          },
          dyslexia: {
            name: 'International Dyslexia Association',
            web: 'https://dyslexiaida.org',
            description: 'Information and support for dyslexia'
          }
        },
        mentalHealth: {
          therapy: {
            name: 'Psychology Today',
            web: 'https://www.psychologytoday.com/us/therapists',
            description: 'Find therapists near you'
          },
          apps: {
            name: 'Mental Health Apps',
            list: ['Headspace', 'Calm', 'DBT Coach', 'MindShift']
          },
          peer: {
            name: 'NAMI - Peer Support',
            web: 'https://www.nami.org/Support-Education/Support-Groups',
            description: 'Peer-led support groups'
          }
        },
        trauma: {
          ptsd: {
            name: 'PTSD Alliance',
            web: 'http://www.ptsdalliance.org',
            description: 'PTSD resources and support'
          },
          cptsd: {
            name: 'Complex PTSD Resources',
            web: 'https://cptsdfoundation.org',
            description: 'Complex trauma support'
          },
          therapy: {
            name: 'Trauma-Informed Therapists',
            web: 'https://www.psychologytoday.com/us/therapists/trauma-and-ptsd',
            description: 'Specialized trauma therapy'
          }
        }
      }));
  }
  checkForCrisis(e) {
    if (!e) return null;
    const s = e.toLowerCase();
    for (const e of this.crisisIndicators.severe)
      if (s.includes(e))
        return { level: 'severe', action: 'immediate', resources: this.getCrisisResources() };
    let t = 0;
    for (const e of this.crisisIndicators.moderate) s.includes(e) && t++;
    if (t >= 2)
      return { level: 'moderate', action: 'support', resources: this.getSupportResources() };
    for (const e of this.crisisIndicators.trauma)
      if (s.includes(e))
        return { level: 'trauma', action: 'trauma-informed', resources: this.getTraumaResources() };
    return null;
  }
  checkAssessmentResults(e) {
    const s = [];
    return (
      e.adhd_probability > 0.8 &&
        s.push({
          type: 'adhd',
          confidence: e.adhd_probability,
          message: 'Your responses suggest strong ADHD traits',
          resources: this.resources.neurodivergent.adhd
        }),
      e.autism_probability > 0.8 &&
        s.push({
          type: 'autism',
          confidence: e.autism_probability,
          message: 'Your responses suggest autistic traits',
          resources: this.resources.neurodivergent.autism
        }),
      e.dyslexia_indicators > 0.7 &&
        s.push({
          type: 'dyslexia',
          confidence: e.dyslexia_indicators,
          message: 'Your responses suggest possible dyslexia',
          resources: this.resources.neurodivergent.dyslexia
        }),
      e.depression_score >= 15 &&
        s.push({
          type: 'depression',
          severity: 'moderate-severe',
          message: 'Your mood responses suggest you may benefit from support',
          resources: this.resources.mentalHealth.therapy
        }),
      e.anxiety_score >= 15 &&
        s.push({
          type: 'anxiety',
          severity: 'severe',
          message: 'Your anxiety levels appear elevated',
          resources: this.resources.mentalHealth.therapy
        }),
      s
    );
  }
  getCrisisResources() {
    const e = navigator.language || 'en-US',
      s = [];
    return (
      e.includes('US')
        ? s.push(this.resources.crisis.us)
        : (e.includes('GB') || e.includes('UK')) && s.push(this.resources.crisis.uk),
      s.push(this.resources.crisis.international),
      {
        immediate: s,
        message: 'Your wellbeing matters. Please reach out for support:',
        priority: 'high'
      }
    );
  }
  getSupportResources() {
    return {
      therapy: this.resources.mentalHealth.therapy,
      peer: this.resources.mentalHealth.peer,
      apps: this.resources.mentalHealth.apps,
      message: 'Support is available. Consider these resources:',
      priority: 'medium'
    };
  }
  getTraumaResources() {
    return {
      ptsd: this.resources.trauma.ptsd,
      cptsd: this.resources.trauma.cptsd,
      therapy: this.resources.trauma.therapy,
      message: 'Trauma-informed support can help:',
      priority: 'medium'
    };
  }
  showIntervention(e) {
    const s = document.createElement('div');
    ((s.className = 'intervention-modal'),
      (s.innerHTML = `\n            <div class="intervention-content">\n                <h3>We're Here to Help</h3>\n                <p>${e.message}</p>\n                \n                <div class="resource-list">\n                    ${this.renderResources(e.resources)}\n                </div>\n                \n                <div class="intervention-actions">\n                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">\n                        I'll Get Help\n                    </button>\n                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">\n                        Continue Assessment\n                    </button>\n                </div>\n            </div>\n        `),
      document.body.appendChild(s),
      this.logIntervention(e));
  }
  renderResources(e) {
    return e.immediate
      ? e.immediate
          .map(
            e =>
              `\n                <div class="crisis-resource">\n                    <strong>${e.name}</strong>\n                    ${e.phone ? `<a href="tel:${e.phone}" class="crisis-phone">${e.phone}</a>` : ''}\n                    ${e.text ? `<p>${e.text}</p>` : ''}\n                    ${e.web ? `<a href="${e.web}" target="_blank">Website</a>` : ''}\n                </div>\n            `
          )
          .join('')
      : Object.values(e)
          .map(e =>
            e.name
              ? `\n                    <div class="support-resource">\n                        <strong>${e.name}</strong>\n                        ${e.description ? `<p>${e.description}</p>` : ''}\n                        ${e.web ? `<a href="${e.web}" target="_blank">Learn More</a>` : ''}\n                    </div>\n                `
              : ''
          )
          .join('');
  }
  logIntervention(e) {
    const s = {
      timestamp: new Date().toISOString(),
      type: e.level || e.type,
      action: e.action,
      shown: !0
    };
    (sessionStorage.setItem('intervention_log', JSON.stringify(s)),
// console.log('[Safety] Intervention shown:', s));
  }
  checkFollowUp() {
    const e = sessionStorage.getItem('intervention_log');
    if (e) {
      const s = JSON.parse(e);
      Date.now() - new Date(s.timestamp).getTime() > 6e5 && this.showFollowUp();
    }
  }
  showFollowUp() {
    const e = document.createElement('div');
    ((e.className = 'follow-up-banner'),
      (e.innerHTML =
        '\n            <p>How are you feeling? Remember, support is always available.</p>\n            <button onclick="this.parentElement.remove()">I\'m OK</button>\n        '),
      document.body.insertBefore(e, document.body.firstChild));
  }
}
export const emergencyProtocols = new EmergencyProtocols();
