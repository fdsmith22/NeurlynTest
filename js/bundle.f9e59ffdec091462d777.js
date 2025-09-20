/*! For license information please see bundle.f9e59ffdec091462d777.js.LICENSE.txt */
(() => {
  var e = {
      8: e => {
        function t(e) {
          return Promise.resolve().then(() => {
            var t = new Error("Cannot find module '" + e + "'");
            throw ((t.code = 'MODULE_NOT_FOUND'), t);
          });
        }
        ((t.keys = () => []), (t.resolve = t), (t.id = 8), (e.exports = t));
      }
    },
    t = {};
  function n(i) {
    var s = t[i];
    if (void 0 !== s) return s.exports;
    var r = (t[i] = { exports: {} });
    return (e[i](r, r.exports, n), r.exports);
  }
  ((n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (() => {
      'use strict';
      function e(t) {
        return (
          (e =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    'function' == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? 'symbol'
                    : typeof e;
                }),
          e(t)
        );
      }
      function t(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return l(e);
          })(e) ||
          (function (e) {
            if (
              ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e['@@iterator']
            )
              return Array.from(e);
          })(e) ||
          c(e) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function i(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          (t &&
            (i = i.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, i));
        }
        return n;
      }
      function s(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? i(Object(n), !0).forEach(function (t) {
                r(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : i(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function r(e, t, n) {
        return (
          (t = h(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = n),
          e
        );
      }
      function o(e, t) {
        var n = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
        if (!n) {
          if (Array.isArray(e) || (n = c(e)) || (t && e && 'number' == typeof e.length)) {
            n && (e = n);
            var i = 0,
              s = function () {};
            return {
              s,
              n: function () {
                return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
              },
              e: function (e) {
                throw e;
              },
              f: s
            };
          }
          throw new TypeError(
            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
          );
        }
        var r,
          o = !0,
          a = !1;
        return {
          s: function () {
            n = n.call(e);
          },
          n: function () {
            var e = n.next();
            return ((o = e.done), e);
          },
          e: function (e) {
            ((a = !0), (r = e));
          },
          f: function () {
            try {
              o || null == n.return || n.return();
            } finally {
              if (a) throw r;
            }
          }
        };
      }
      function a(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
            if (null != n) {
              var i,
                s,
                r,
                o,
                a = [],
                c = !0,
                l = !1;
              try {
                if (((r = (n = n.call(e)).next), 0 === t)) {
                  if (Object(n) !== n) return;
                  c = !1;
                } else
                  for (; !(c = (i = r.call(n)).done) && (a.push(i.value), a.length !== t); c = !0);
              } catch (e) {
                ((l = !0), (s = e));
              } finally {
                try {
                  if (!c && null != n.return && ((o = n.return()), Object(o) !== o)) return;
                } finally {
                  if (l) throw s;
                }
              }
              return a;
            }
          })(e, t) ||
          c(e, t) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function c(e, t) {
        if (e) {
          if ('string' == typeof e) return l(e, t);
          var n = {}.toString.call(e).slice(8, -1);
          return (
            'Object' === n && e.constructor && (n = e.constructor.name),
            'Map' === n || 'Set' === n
              ? Array.from(e)
              : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? l(e, t)
                : void 0
          );
        }
      }
      function l(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      function u(e, t) {
        for (var n = 0; n < t.length; n++) {
          var i = t[n];
          ((i.enumerable = i.enumerable || !1),
            (i.configurable = !0),
            'value' in i && (i.writable = !0),
            Object.defineProperty(e, h(i.key), i));
        }
      }
      function h(t) {
        var n = (function (t) {
          if ('object' != e(t) || !t) return t;
          var n = t[Symbol.toPrimitive];
          if (void 0 !== n) {
            var i = n.call(t, 'string');
            if ('object' != e(i)) return i;
            throw new TypeError('@@toPrimitive must return a primitive value.');
          }
          return String(t);
        })(t);
        return 'symbol' == e(n) ? n : n + '';
      }
      var d = (function () {
        return (
          (e = function e() {
            (!(function (e, t) {
              if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
            })(this, e),
              (this.traits = {
                Extraversion: {
                  high: {
                    title: 'The Social Energizer',
                    description:
                      'You thrive in social situations and draw energy from interactions with others.',
                    strengths: [
                      'Natural leadership',
                      'Excellent communication',
                      'Team building',
                      'Networking ability'
                    ],
                    growth: [
                      'Practice active listening',
                      'Value quiet reflection time',
                      'Develop deeper one-on-one connections'
                    ],
                    careers: [
                      'Sales Manager',
                      'Public Relations',
                      'Event Coordinator',
                      'Teacher',
                      'Marketing Director'
                    ],
                    icon: '🌟'
                  },
                  medium: {
                    title: 'The Adaptive Socializer',
                    description:
                      'You balance social engagement with personal reflection effectively.',
                    strengths: [
                      'Versatile communication',
                      'Situational awareness',
                      'Balanced perspective',
                      'Flexible approach'
                    ],
                    growth: [
                      'Identify optimal social environments',
                      'Set clear boundaries',
                      'Practice assertiveness'
                    ],
                    careers: ['Project Manager', 'Consultant', 'Designer', 'Writer', 'Analyst'],
                    icon: '⚖️'
                  },
                  low: {
                    title: 'The Thoughtful Observer',
                    description:
                      'You prefer meaningful one-on-one connections and quiet environments.',
                    strengths: [
                      'Deep thinking',
                      'Active listening',
                      'Written communication',
                      'Independent work'
                    ],
                    growth: [
                      'Build presentation skills',
                      'Expand comfort zone gradually',
                      'Practice small talk'
                    ],
                    careers: [
                      'Research Scientist',
                      'Software Developer',
                      'Accountant',
                      'Librarian',
                      'Technical Writer'
                    ],
                    icon: '🔍'
                  }
                },
                Conscientiousness: {
                  high: {
                    title: 'The Achiever',
                    description: 'You are highly organized, disciplined, and goal-oriented.',
                    strengths: [
                      'Strong work ethic',
                      'Attention to detail',
                      'Reliability',
                      'Planning ability'
                    ],
                    growth: [
                      'Allow for flexibility',
                      'Embrace imperfection',
                      'Delegate when appropriate'
                    ],
                    careers: [
                      'Executive',
                      'Engineer',
                      'Surgeon',
                      'Financial Analyst',
                      'Quality Assurance'
                    ],
                    icon: '🎯'
                  },
                  medium: {
                    title: 'The Balanced Planner',
                    description:
                      'You maintain a healthy balance between structure and spontaneity.',
                    strengths: ['Adaptability', 'Pragmatism', 'Prioritization', 'Realistic goals'],
                    growth: [
                      'Develop consistency',
                      'Strengthen follow-through',
                      'Refine organization systems'
                    ],
                    careers: ['Manager', 'Entrepreneur', 'Therapist', 'Teacher', 'Nurse'],
                    icon: '📊'
                  },
                  low: {
                    title: 'The Creative Free Spirit',
                    description: 'You value flexibility and spontaneity over rigid structure.',
                    strengths: ['Creativity', 'Adaptability', 'Open-mindedness', 'Innovation'],
                    growth: [
                      'Develop routines',
                      'Use planning tools',
                      'Break large tasks into steps'
                    ],
                    careers: ['Artist', 'Musician', 'Travel Writer', 'Photographer', 'Chef'],
                    icon: '🎨'
                  }
                },
                Agreeableness: {
                  high: {
                    title: 'The Harmonizer',
                    description:
                      'You prioritize cooperation, empathy, and maintaining positive relationships.',
                    strengths: [
                      'Empathy',
                      'Team collaboration',
                      'Conflict resolution',
                      'Trustworthiness'
                    ],
                    growth: [
                      'Practice assertiveness',
                      'Set healthy boundaries',
                      'Develop negotiation skills'
                    ],
                    careers: ['Counselor', 'Human Resources', 'Social Worker', 'Nurse', 'Teacher'],
                    icon: '💝'
                  },
                  medium: {
                    title: 'The Diplomatic Negotiator',
                    description: 'You balance cooperation with healthy assertiveness.',
                    strengths: [
                      'Fair judgment',
                      'Balanced perspective',
                      'Negotiation',
                      'Objectivity'
                    ],
                    growth: [
                      'Trust your instincts',
                      'Practice difficult conversations',
                      'Develop empathy further'
                    ],
                    careers: ['Lawyer', 'Manager', 'Mediator', 'Business Analyst', 'Consultant'],
                    icon: '🤝'
                  },
                  low: {
                    title: 'The Independent Thinker',
                    description: 'You value directness, honesty, and objective decision-making.',
                    strengths: [
                      'Critical thinking',
                      'Independence',
                      'Direct communication',
                      'Objective analysis'
                    ],
                    growth: [
                      'Develop empathy',
                      'Practice diplomacy',
                      "Consider others' perspectives"
                    ],
                    careers: ['CEO', 'Surgeon', 'Military Officer', 'Investigator', 'Critic'],
                    icon: '⚡'
                  }
                },
                Openness: {
                  high: {
                    title: 'The Innovator',
                    description: 'You embrace new experiences, ideas, and creative expression.',
                    strengths: ['Creativity', 'Curiosity', 'Innovation', 'Artistic appreciation'],
                    growth: ['Focus on execution', 'Develop practical skills', 'Complete projects'],
                    careers: ['Researcher', 'Designer', 'Writer', 'Entrepreneur', 'Professor'],
                    icon: '🚀'
                  },
                  medium: {
                    title: 'The Practical Explorer',
                    description:
                      'You appreciate both tradition and innovation in balanced measure.',
                    strengths: [
                      'Balanced thinking',
                      'Selective curiosity',
                      'Practical creativity',
                      'Adaptability'
                    ],
                    growth: [
                      'Expand comfort zone',
                      'Embrace more risks',
                      'Explore new perspectives'
                    ],
                    careers: ['Product Manager', 'Marketing', 'Teacher', 'Architect', 'Journalist'],
                    icon: '🧭'
                  },
                  low: {
                    title: 'The Traditionalist',
                    description: 'You value proven methods, stability, and practical approaches.',
                    strengths: ['Practicality', 'Consistency', 'Focus', 'Reliability'],
                    growth: [
                      'Try new approaches',
                      'Embrace change gradually',
                      'Explore creative outlets'
                    ],
                    careers: [
                      'Accountant',
                      'Administrator',
                      'Banker',
                      'Insurance Agent',
                      'Mechanic'
                    ],
                    icon: '🏛️'
                  }
                },
                'Emotional Stability': {
                  high: {
                    title: 'The Steady Rock',
                    description:
                      'You maintain emotional balance and handle stress exceptionally well.',
                    strengths: [
                      'Stress management',
                      'Emotional regulation',
                      'Resilience',
                      'Calm under pressure'
                    ],
                    growth: [
                      'Express emotions openly',
                      'Develop deeper empathy',
                      'Acknowledge vulnerabilities'
                    ],
                    careers: [
                      'Emergency Medicine',
                      'Air Traffic Controller',
                      'Crisis Manager',
                      'Pilot',
                      'Military'
                    ],
                    icon: '🗿'
                  },
                  medium: {
                    title: 'The Emotional Navigator',
                    description:
                      'You experience a healthy range of emotions with good coping strategies.',
                    strengths: [
                      'Emotional awareness',
                      'Balanced responses',
                      'Authentic expression',
                      'Adaptability'
                    ],
                    growth: [
                      'Strengthen coping strategies',
                      'Practice mindfulness',
                      'Build resilience'
                    ],
                    careers: ['Teacher', 'Manager', 'Consultant', 'Healthcare', 'Social Services'],
                    icon: '🌊'
                  },
                  low: {
                    title: 'The Sensitive Soul',
                    description: 'You experience emotions deeply and intensely.',
                    strengths: ['Emotional depth', 'Empathy', 'Passion', 'Artistic sensitivity'],
                    growth: [
                      'Develop coping strategies',
                      'Practice self-care',
                      'Build emotional resilience'
                    ],
                    careers: ['Artist', 'Writer', 'Therapist', 'Musician', 'Actor'],
                    icon: '🌺'
                  }
                }
              }),
              (this.archetypes = {
                LEADER: {
                  name: 'The Visionary Leader',
                  description:
                    'Natural born leaders who inspire and guide others toward shared goals',
                  traits: [
                    'High Extraversion',
                    'High Conscientiousness',
                    'High Emotional Stability'
                  ],
                  strengths:
                    'Strategic thinking, Team building, Decision making, Crisis management',
                  challenges: 'May overlook details, Can be overly demanding, Risk of burnout',
                  famous: 'Steve Jobs, Winston Churchill, Oprah Winfrey'
                },
                INNOVATOR: {
                  name: 'The Creative Innovator',
                  description:
                    'Original thinkers who challenge conventions and create new possibilities',
                  traits: ['High Openness', 'Medium Conscientiousness', 'Medium Extraversion'],
                  strengths: 'Creative problem-solving, Vision, Adaptability, Pattern recognition',
                  challenges: 'May struggle with routine, Can be impractical, Difficulty focusing',
                  famous: 'Einstein, Da Vinci, Elon Musk'
                },
                HARMONIZER: {
                  name: 'The Peaceful Harmonizer',
                  description:
                    'Empathetic souls who create harmony and understanding between people',
                  traits: [
                    'High Agreeableness',
                    'Medium Emotional Stability',
                    'Medium Extraversion'
                  ],
                  strengths: 'Conflict resolution, Empathy, Team cohesion, Emotional intelligence',
                  challenges:
                    'Difficulty with confrontation, May neglect own needs, Can be exploited',
                  famous: 'Mr. Rogers, Mother Teresa, Dalai Lama'
                },
                ANALYST: {
                  name: 'The Logical Analyst',
                  description: 'Systematic thinkers who excel at understanding complex systems',
                  traits: [
                    'High Conscientiousness',
                    'Low Extraversion',
                    'High Emotional Stability'
                  ],
                  strengths: 'Problem analysis, Attention to detail, Objectivity, Deep focus',
                  challenges: 'May seem detached, Struggle with ambiguity, Perfectionism',
                  famous: 'Warren Buffett, Bill Gates, Marie Curie'
                },
                EXPLORER: {
                  name: 'The Adventurous Explorer',
                  description: 'Free spirits who seek new experiences and push boundaries',
                  traits: ['High Openness', 'Low Conscientiousness', 'High Extraversion'],
                  strengths: 'Adaptability, Risk-taking, Enthusiasm, Versatility',
                  challenges: 'Lack of follow-through, Impulsiveness, Difficulty with routine',
                  famous: 'Richard Branson, Anthony Bourdain, Amelia Earhart'
                },
                GUARDIAN: {
                  name: 'The Reliable Guardian',
                  description: 'Dependable protectors who maintain stability and tradition',
                  traits: ['High Conscientiousness', 'High Agreeableness', 'Low Openness'],
                  strengths: 'Reliability, Loyalty, Organization, Duty',
                  challenges: 'Resistance to change, Rigidity, May miss opportunities',
                  famous: 'Queen Elizabeth II, George Washington, Tom Hanks'
                }
              }));
          }),
          (n = [
            {
              key: 'generateComprehensiveReport',
              value: function (e, t, n, i) {
                return {
                  meta: this.generateMeta(n, i, t.length),
                  overview: this.generateOverview(e),
                  traits: this.generateDetailedTraits(e),
                  archetype: this.determineArchetype(e),
                  insights: this.generateInsights(e),
                  comparisons: this.generateComparisons(e),
                  recommendations: this.generateRecommendations(e),
                  visualData: this.prepareVisualizationData(e)
                };
              }
            },
            {
              key: 'generateMeta',
              value: function (e, t, n) {
                return {
                  date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  mode: e.charAt(0).toUpperCase() + e.slice(1),
                  duration: Math.round(t / 6e4) + ' minutes',
                  questions: n,
                  reliability: this.calculateReliability(n)
                };
              }
            },
            {
              key: 'generateOverview',
              value: function (e) {
                var t = Object.entries(e).sort(function (e, t) {
                    return t[1].score - e[1].score;
                  }),
                  n = t[0],
                  i = t[1],
                  s = t[t.length - 1];
                return {
                  summary: this.generatePersonalitySummary(n, i, s),
                  dominantTrait: n[0],
                  dominantScore: n[1].score,
                  profile: this.generateProfileDescription(e)
                };
              }
            },
            {
              key: 'generatePersonalitySummary',
              value: function (e, t, n) {
                var i = [
                  'Your personality is characterized by strong '
                    .concat(e[0].toLowerCase(), ' (')
                    .concat(e[1].score, '%), complemented by notable ')
                    .concat(t[0].toLowerCase(), ' (')
                    .concat(t[1].score, '%). This unique combination suggests you are someone who ')
                    .concat(this.getTraitDescription(e[0], e[1].raw), '. Your relatively lower ')
                    .concat(n[0].toLowerCase(), ' (')
                    .concat(n[1].score, '%) indicates ')
                    .concat(this.getContrastDescription(n[0], n[1].raw), '.'),
                  'You exhibit a distinctive personality profile with exceptional '
                    .concat(e[0].toLowerCase(), ' at ')
                    .concat(e[1].score, '%, making you naturally inclined toward ')
                    .concat(this.getTraitTendency(e[0], e[1].raw), '. Your ')
                    .concat(t[0].toLowerCase(), ' score of ')
                    .concat(t[1].score, '% further enhances your ability to ')
                    .concat(this.getTraitAbility(t[0], t[1].raw), '.')
                ];
                return i[Math.floor(Math.random() * i.length)];
              }
            },
            {
              key: 'getTraitDescription',
              value: function (e, t) {
                var n;
                return (
                  (null ===
                    (n = {
                      Extraversion: {
                        high: 'thrives in social environments and energizes others with your enthusiasm',
                        medium: 'balances social interaction with thoughtful reflection',
                        low: 'values deep connections and meaningful solitude'
                      },
                      Conscientiousness: {
                        high: 'approaches life with discipline, organization, and unwavering determination',
                        medium: 'maintains flexibility while pursuing your goals',
                        low: 'embraces spontaneity and creative freedom'
                      },
                      Agreeableness: {
                        high: 'naturally creates harmony and builds trust in relationships',
                        medium: 'balances cooperation with healthy assertiveness',
                        low: 'values directness and objective decision-making'
                      },
                      Openness: {
                        high: 'constantly seeks new experiences and innovative solutions',
                        medium: 'appreciates both tradition and innovation',
                        low: 'values proven methods and practical approaches'
                      },
                      'Emotional Stability': {
                        high: 'maintains remarkable composure even in challenging situations',
                        medium: 'navigates emotions with awareness and balance',
                        low: 'experiences life with emotional depth and intensity'
                      }
                    }[e]) || void 0 === n
                    ? void 0
                    : n[t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium']) ||
                  'exhibits unique characteristics'
                );
              }
            },
            {
              key: 'getTraitTendency',
              value: function (e, t) {
                var n = t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium';
                return this.traits[e][n].strengths[0].toLowerCase();
              }
            },
            {
              key: 'getTraitAbility',
              value: function (e, t) {
                var n = t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium';
                return this.traits[e][n].strengths[1].toLowerCase();
              }
            },
            {
              key: 'getContrastDescription',
              value: function (e, t) {
                if (t < 2.5) {
                  var n = this.traits[e].high.description;
                  return 'you may prefer alternatives to '.concat(n.toLowerCase().split('you ')[1]);
                }
                return 'a balanced approach in this area';
              }
            },
            {
              key: 'generateProfileDescription',
              value: function (e) {
                for (
                  var t = 'Your complete personality profile reveals ',
                    n = [],
                    i = 0,
                    s = Object.entries(e);
                  i < s.length;
                  i++
                ) {
                  var r = a(s[i], 2),
                    o = r[0],
                    c = r[1],
                    l = c.raw > 3.5 ? 'high' : c.raw < 2.5 ? 'low' : 'moderate';
                  n.push(''.concat(l, ' ').concat(o.toLowerCase()));
                }
                return (
                  (t += n.slice(0, -1).join(', ') + ', and ' + n[n.length - 1] + '. ') +
                  'This combination is found in approximately ' +
                  this.calculateRarity(e) +
                  '% of the population.'
                );
              }
            },
            {
              key: 'calculateRarity',
              value: function (e) {
                for (var t = 100, n = 0, i = Object.values(e); n < i.length; n++) {
                  var s = i[n];
                  s.score > 80 || s.score < 20
                    ? (t *= 0.7)
                    : (s.score > 70 || s.score < 30) && (t *= 0.85);
                }
                return Math.max(1, Math.round(t));
              }
            },
            {
              key: 'generateDetailedTraits',
              value: function (e) {
                for (var t = {}, n = 0, i = Object.entries(e); n < i.length; n++) {
                  var s = a(i[n], 2),
                    r = s[0],
                    o = s[1],
                    c = o.raw > 3.5 ? 'high' : o.raw < 2.5 ? 'low' : 'medium',
                    l = this.traits[r][c];
                  t[r] = {
                    score: o.score,
                    percentile: o.percentile,
                    level: c,
                    title: l.title,
                    description: l.description,
                    icon: l.icon,
                    strengths: l.strengths,
                    growth: l.growth,
                    careers: l.careers,
                    interpretation: o.interpretation,
                    comparison: this.generateComparison(o.percentile)
                  };
                }
                return t;
              }
            },
            {
              key: 'generateComparison',
              value: function (e) {
                return e >= 90
                  ? 'You score higher than 90% of people in this trait'
                  : e >= 75
                    ? 'You score higher than 75% of people in this trait'
                    : e >= 60
                      ? 'You score above average in this trait'
                      : e >= 40
                        ? 'You score around average in this trait'
                        : e >= 25
                          ? 'You score below average in this trait'
                          : 'You score in the lower range for this trait';
              }
            },
            {
              key: 'determineArchetype',
              value: function (e) {
                for (
                  var t = null, n = 0, i = 0, r = Object.entries(this.archetypes);
                  i < r.length;
                  i++
                ) {
                  var c,
                    l = a(r[i], 2),
                    u = (l[0], l[1]),
                    h = 0,
                    d = o(u.traits);
                  try {
                    for (d.s(); !(c = d.n()).done; ) {
                      var p,
                        m = a(c.value.split(' '), 2),
                        y = m[0],
                        v = (null === (p = e[m[1]]) || void 0 === p ? void 0 : p.raw) || 3;
                      (('High' === y && v > 3.5) ||
                        ('Medium' === y && v >= 2.5 && v <= 3.5) ||
                        ('Low' === y && v < 2.5)) &&
                        (h += 1);
                    }
                  } catch (e) {
                    d.e(e);
                  } finally {
                    d.f();
                  }
                  h > n &&
                    ((n = h),
                    (t = s(s({}, u), {}, { matchScore: Math.round((h / u.traits.length) * 100) })));
                }
                return t;
              }
            },
            {
              key: 'generateInsights',
              value: function (e) {
                return {
                  strengths: this.identifyTopStrengths(e),
                  growth: this.identifyGrowthAreas(e),
                  career: this.generateCareerInsights(e),
                  relationships: this.generateRelationshipInsights(e),
                  communication: this.generateCommunicationStyle(e),
                  leadership: this.generateLeadershipStyle(e),
                  stress: this.generateStressProfile(e),
                  motivation: this.generateMotivationProfile(e)
                };
              }
            },
            {
              key: 'identifyTopStrengths',
              value: function (e) {
                for (var n = [], i = 0, s = Object.entries(e); i < s.length; i++) {
                  var r = a(s[i], 2),
                    o = r[0],
                    c = r[1];
                  if (c.score > 70) {
                    var l = c.raw > 3.5 ? 'high' : 'medium';
                    n.push.apply(n, t(this.traits[o][l].strengths.slice(0, 2)));
                  }
                }
                return t(new Set(n)).slice(0, 5);
              }
            },
            {
              key: 'identifyGrowthAreas',
              value: function (e) {
                for (var n = [], i = 0, s = Object.entries(e); i < s.length; i++) {
                  var r = a(s[i], 2),
                    o = r[0],
                    c = r[1],
                    l = c.raw > 3.5 ? 'high' : c.raw < 2.5 ? 'low' : 'medium';
                  n.push.apply(n, t(this.traits[o][l].growth.slice(0, 1)));
                }
                return t(new Set(n)).slice(0, 3);
              }
            },
            {
              key: 'generateCareerInsights',
              value: function (e) {
                for (var t = new Set(), n = [], i = 0, s = Object.entries(e); i < s.length; i++) {
                  var r = a(s[i], 2),
                    o = r[0],
                    c = r[1],
                    l = c.raw > 3.5 ? 'high' : c.raw < 2.5 ? 'low' : 'medium';
                  (this.traits[o][l].careers.forEach(function (e) {
                    return t.add(e);
                  }),
                    c.score > 60 && n.push(o.toLowerCase()));
                }
                return {
                  suitable: Array.from(t).slice(0, 8),
                  strengths: 'Your combination of '
                    .concat(n.join(' and '), ' makes you well-suited for roles that require ')
                    .concat(this.getCareerRequirements(e), '.'),
                  environment: this.getIdealWorkEnvironment(e)
                };
              }
            },
            {
              key: 'getCareerRequirements',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r,
                  o = [];
                return (
                  (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.score) > 60 &&
                    o.push('interpersonal interaction'),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.score) > 60 &&
                    o.push('organization and planning'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.score) > 60 &&
                    o.push('creativity and innovation'),
                  (null === (s = e.Agreeableness) || void 0 === s ? void 0 : s.score) > 60 &&
                    o.push('collaboration and empathy'),
                  (null === (r = e['Emotional Stability']) || void 0 === r ? void 0 : r.score) >
                    60 && o.push('stress management'),
                  o.join(', ') || 'balanced skills'
                );
              }
            },
            {
              key: 'getIdealWorkEnvironment',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r,
                  o = [];
                return (
                  (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) > 3.5
                    ? o.push('collaborative open spaces')
                    : (null === (n = e.Extraversion) || void 0 === n ? void 0 : n.raw) < 2.5 &&
                      o.push('quiet, private workspace'),
                  (null === (i = e.Conscientiousness) || void 0 === i ? void 0 : i.raw) > 3.5
                    ? o.push('structured with clear expectations')
                    : (null === (s = e.Conscientiousness) || void 0 === s ? void 0 : s.raw) < 2.5 &&
                      o.push('flexible and autonomous'),
                  (null === (r = e.Openness) || void 0 === r ? void 0 : r.raw) > 3.5 &&
                    o.push('innovative and dynamic'),
                  'You thrive in environments that are ' +
                    (o.join(', ') || 'balanced and adaptable')
                );
              }
            },
            {
              key: 'generateRelationshipInsights',
              value: function (e) {
                return {
                  style: this.getRelationshipStyle(e),
                  strengths: this.getRelationshipStrengths(e),
                  needs: this.getRelationshipNeeds(e),
                  compatibility: this.getCompatibilityInsights(e)
                };
              }
            },
            {
              key: 'getRelationshipStyle',
              value: function (e) {
                var t,
                  n,
                  i = (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) || 3,
                  s = (null === (n = e.Agreeableness) || void 0 === n ? void 0 : n.raw) || 3;
                return i > 3.5 && s > 3.5
                  ? 'Warm and engaging - you build connections easily and maintain them with care'
                  : i > 3.5 && s < 2.5
                    ? 'Direct and independent - you value honesty and maintain clear boundaries'
                    : i < 2.5 && s > 3.5
                      ? 'Supportive and loyal - you form deep, meaningful connections with select individuals'
                      : i < 2.5 && s < 2.5
                        ? 'Reserved and selective - you value quality over quantity in relationships'
                        : 'Balanced and adaptive - you adjust your approach based on the situation and person';
              }
            },
            {
              key: 'getRelationshipStrengths',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r,
                  o = [];
                return (
                  (null === (t = e.Agreeableness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    o.push('empathy', 'conflict resolution'),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    o.push('reliability', 'commitment'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    o.push('open communication', 'growth mindset'),
                  (null === (s = e['Emotional Stability']) || void 0 === s ? void 0 : s.raw) >
                    3.5 && o.push('emotional support', 'stability'),
                  (null === (r = e.Extraversion) || void 0 === r ? void 0 : r.raw) > 3.5 &&
                    o.push('social energy', 'enthusiasm'),
                  o.slice(0, 4)
                );
              }
            },
            {
              key: 'getRelationshipNeeds',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r,
                  o,
                  a = [];
                return (
                  (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) > 3.5
                    ? a.push('regular social interaction')
                    : (null === (n = e.Extraversion) || void 0 === n ? void 0 : n.raw) < 2.5 &&
                      a.push('personal space and alone time'),
                  (null === (i = e.Agreeableness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    a.push('harmony and appreciation'),
                  (null === (s = e.Conscientiousness) || void 0 === s ? void 0 : s.raw) > 3.5 &&
                    a.push('reliability and follow-through'),
                  (null === (r = e.Openness) || void 0 === r ? void 0 : r.raw) > 3.5 &&
                    a.push('intellectual stimulation'),
                  (null === (o = e['Emotional Stability']) || void 0 === o ? void 0 : o.raw) <
                    2.5 && a.push('patience and understanding'),
                  a.slice(0, 3)
                );
              }
            },
            {
              key: 'getCompatibilityInsights',
              value: function (e) {
                return 'You connect best with people who ' + this.getCompatibilityTraits(e);
              }
            },
            {
              key: 'getCompatibilityTraits',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = [];
                return (
                  (null === (t = e.Openness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    s.push('share your curiosity and love of learning'),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    s.push('value commitment and reliability'),
                  (null === (i = e.Agreeableness) || void 0 === i ? void 0 : i.raw) < 2.5 &&
                    s.push('appreciate directness and independence'),
                  s.join(', ') || 'complement your balanced approach to life'
                );
              }
            },
            {
              key: 'generateCommunicationStyle',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) || 3,
                  r = (null === (n = e.Agreeableness) || void 0 === n ? void 0 : n.raw) || 3,
                  o = (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) || 3,
                  a = '';
                return (
                  (a +=
                    s > 3.5
                      ? 'Expressive and engaging. '
                      : s < 2.5
                        ? 'Thoughtful and measured. '
                        : 'Balanced and adaptive. '),
                  r > 3.5
                    ? (a += 'You prioritize harmony and understanding. ')
                    : r < 2.5 && (a += 'You value directness and clarity. '),
                  o > 3.5
                    ? (a += 'You enjoy exploring ideas and possibilities.')
                    : o < 2.5 && (a += 'You prefer practical, concrete discussions.'),
                  a
                );
              }
            },
            {
              key: 'generateLeadershipStyle',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = (null === (t = e.Conscientiousness) || void 0 === t ? void 0 : t.raw) || 3,
                  r = (null === (n = e.Extraversion) || void 0 === n ? void 0 : n.raw) || 3,
                  o = (null === (i = e.Agreeableness) || void 0 === i ? void 0 : i.raw) || 3;
                return r > 3.5 && s > 3.5
                  ? 'Charismatic and organized - you inspire through vision and execution'
                  : r < 2.5 && s > 3.5
                    ? 'Leading by example - you demonstrate excellence through your work'
                    : o > 3.5 && r > 3.5
                      ? 'Servant leadership - you empower others and build consensus'
                      : s > 3.5 && o < 2.5
                        ? 'Results-driven - you focus on objectives and performance'
                        : 'Situational leadership - you adapt your style to meet team needs';
              }
            },
            {
              key: 'generateStressProfile',
              value: function (e) {
                var t,
                  n,
                  i =
                    (null === (t = e['Emotional Stability']) || void 0 === t ? void 0 : t.raw) || 3;
                return (
                  null === (n = e.Conscientiousness) || void 0 === n || n.raw,
                  {
                    triggers: this.getStressTriggers(e),
                    responses: this.getStressResponses(i),
                    copingStrategies: this.getCopingStrategies(e)
                  }
                );
              }
            },
            {
              key: 'getStressTriggers',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r = [];
                return (
                  (null === (t = e.Conscientiousness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    r.push('disorganization', 'missed deadlines'),
                  (null === (n = e.Agreeableness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    r.push('conflict', 'criticism'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) < 2.5 &&
                    r.push('unexpected changes', 'ambiguity'),
                  (null === (s = e.Extraversion) || void 0 === s ? void 0 : s.raw) < 2.5 &&
                    r.push('overstimulation', 'forced social interaction'),
                  r.slice(0, 3)
                );
              }
            },
            {
              key: 'getStressResponses',
              value: function (e) {
                return e > 3.5
                  ? 'You typically remain calm and focused under pressure'
                  : e < 2.5
                    ? 'You may experience intense emotional responses to stress'
                    : 'You have moderate stress responses with good recovery';
              }
            },
            {
              key: 'getCopingStrategies',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r = [];
                return (
                  (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) > 3.5
                    ? r.push('Talk with friends', 'Social activities')
                    : r.push('Quiet reflection', 'Solo activities'),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    r.push('Planning and organizing', 'Problem-solving'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    r.push('Creative expression', 'Learning new skills'),
                  (null === (s = e['Emotional Stability']) || void 0 === s ? void 0 : s.raw) >
                    3.5 && r.push('Physical exercise', 'Mindfulness'),
                  r.slice(0, 4)
                );
              }
            },
            {
              key: 'generateMotivationProfile',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r,
                  o = [];
                return (
                  (null === (t = e.Conscientiousness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    o.push('Achievement and recognition'),
                  (null === (n = e.Agreeableness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    o.push('Helping others succeed'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    o.push('Learning and discovery'),
                  (null === (s = e.Extraversion) || void 0 === s ? void 0 : s.raw) > 3.5 &&
                    o.push('Social connection and collaboration'),
                  (null === (r = e['Emotional Stability']) || void 0 === r ? void 0 : r.raw) >
                    3.5 && o.push('Challenge and growth'),
                  {
                    primary: o.slice(0, 2),
                    description: 'You are primarily motivated by '
                      .concat(
                        o.slice(0, 2).join(' and ').toLowerCase(),
                        '. You find fulfillment when '
                      )
                      .concat(this.getMotivationContext(e), '.')
                  }
                );
              }
            },
            {
              key: 'getMotivationContext',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = [];
                return (
                  (null === (t = e.Conscientiousness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    s.push('achieving your goals'),
                  (null === (n = e.Agreeableness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    s.push('making a positive impact'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    s.push('exploring new possibilities'),
                  s.join(' and ') || 'pursuing meaningful work'
                );
              }
            },
            {
              key: 'generateComparisons',
              value: function (e) {
                for (var t = {}, n = 0, i = Object.entries(e); n < i.length; n++) {
                  var s = a(i[n], 2),
                    r = s[0],
                    o = s[1];
                  t[r] = {
                    score: o.score,
                    percentile: o.percentile,
                    population: this.getPopulationComparison(o.percentile),
                    similar: this.getSimilarProfiles(r, o.score)
                  };
                }
                return t;
              }
            },
            {
              key: 'getPopulationComparison',
              value: function (e) {
                return e >= 95
                  ? 'Top 5% of population'
                  : e >= 90
                    ? 'Top 10% of population'
                    : e >= 75
                      ? 'Upper quartile'
                      : e >= 60
                        ? 'Above average'
                        : e >= 40
                          ? 'Average range'
                          : e >= 25
                            ? 'Below average'
                            : e >= 10
                              ? 'Lower quartile'
                              : 'Unique profile';
              }
            },
            {
              key: 'getSimilarProfiles',
              value: function (e, t) {
                return {
                  high: ['Leaders', 'Innovators', 'Performers'],
                  medium: ['Managers', 'Educators', 'Consultants'],
                  low: ['Researchers', 'Artists', 'Analysts']
                }[t > 70 ? 'high' : t < 30 ? 'low' : 'medium'];
              }
            },
            {
              key: 'generateRecommendations',
              value: function (e) {
                return {
                  books: this.recommendBooks(e),
                  activities: this.recommendActivities(e),
                  skills: this.recommendSkills(e),
                  mindfulness: this.recommendMindfulness(e),
                  goals: this.generateGoals(e)
                };
              }
            },
            {
              key: 'recommendBooks',
              value: function (e) {
                var t,
                  n,
                  i,
                  s,
                  r = [];
                return (
                  (null === (t = e.Openness) || void 0 === t ? void 0 : t.raw) > 3.5 &&
                    r.push(
                      "'Sapiens' by Yuval Noah Harari",
                      "'Thinking, Fast and Slow' by Daniel Kahneman"
                    ),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    r.push("'Atomic Habits' by James Clear", "'Deep Work' by Cal Newport"),
                  (null === (i = e.Agreeableness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    r.push("'Nonviolent Communication' by Marshall Rosenberg"),
                  (null === (s = e['Emotional Stability']) || void 0 === s ? void 0 : s.raw) <
                    2.5 && r.push("'The Power of Now' by Eckhart Tolle"),
                  r.slice(0, 3)
                );
              }
            },
            {
              key: 'recommendActivities',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = [];
                return (
                  (null === (t = e.Extraversion) || void 0 === t ? void 0 : t.raw) > 3.5
                    ? s.push('Join networking groups', 'Attend social events', 'Team sports')
                    : s.push('Solo hiking', 'Reading clubs', 'Creative writing'),
                  (null === (n = e.Openness) || void 0 === n ? void 0 : n.raw) > 3.5 &&
                    s.push('Travel to new places', 'Learn a new language', 'Art classes'),
                  (null === (i = e.Conscientiousness) || void 0 === i ? void 0 : i.raw) < 2.5 &&
                    s.push('Improv classes', 'Spontaneous adventures'),
                  s.slice(0, 4)
                );
              }
            },
            {
              key: 'recommendSkills',
              value: function (e) {
                for (var t = [], n = 0, i = Object.entries(e); n < i.length; n++) {
                  var s = a(i[n], 2),
                    r = s[0];
                  if (s[1].raw < 2.5)
                    switch (r) {
                      case 'Extraversion':
                        t.push('Public speaking', 'Networking');
                        break;
                      case 'Conscientiousness':
                        t.push('Time management', 'Goal setting');
                        break;
                      case 'Agreeableness':
                        t.push('Empathy training', 'Active listening');
                        break;
                      case 'Openness':
                        t.push('Creative thinking', 'Adaptability');
                        break;
                      case 'Emotional Stability':
                        t.push('Stress management', 'Emotional regulation');
                    }
                }
                return t.slice(0, 3);
              }
            },
            {
              key: 'recommendMindfulness',
              value: function (e) {
                var t,
                  n,
                  i,
                  s = [];
                return (
                  (null === (t = e['Emotional Stability']) || void 0 === t ? void 0 : t.raw) < 3 &&
                    s.push('Daily meditation', 'Breathing exercises'),
                  (null === (n = e.Conscientiousness) || void 0 === n ? void 0 : n.raw) > 3.5
                    ? s.push('Structured mindfulness routine')
                    : s.push('Informal mindfulness moments'),
                  (null === (i = e.Openness) || void 0 === i ? void 0 : i.raw) > 3.5 &&
                    s.push('Walking meditation', 'Body scan'),
                  s.slice(0, 3)
                );
              }
            },
            {
              key: 'generateGoals',
              value: function (e) {
                for (
                  var t = { shortTerm: [], longTerm: [] }, n = 0, i = Object.entries(e);
                  n < i.length;
                  n++
                ) {
                  var s = a(i[n], 2),
                    r = s[0],
                    o = s[1],
                    c = o.raw > 3.5 ? 'high' : o.raw < 2.5 ? 'low' : 'medium',
                    l = this.traits[r][c];
                  l.growth && l.growth.length > 0 && t.shortTerm.push(l.growth[0]);
                }
                var u = this.determineArchetype(e);
                return (
                  u &&
                    t.longTerm.push(
                      'Develop your '.concat(u.name, ' potential'),
                      'Build on your natural '.concat(u.strengths.split(',')[0].toLowerCase())
                    ),
                  { shortTerm: t.shortTerm.slice(0, 3), longTerm: t.longTerm.slice(0, 2) }
                );
              }
            },
            {
              key: 'prepareVisualizationData',
              value: function (e) {
                return {
                  radar: {
                    labels: Object.keys(e),
                    data: Object.values(e).map(function (e) {
                      return e.score;
                    })
                  },
                  bars: Object.entries(e).map(function (e) {
                    var t = a(e, 2),
                      n = t[0],
                      i = t[1];
                    return { trait: n, score: i.score, percentile: i.percentile };
                  }),
                  distribution: this.generateDistribution(e)
                };
              }
            },
            {
              key: 'generateDistribution',
              value: function (e) {
                for (var t = {}, n = 0, i = Object.entries(e); n < i.length; n++) {
                  var s = a(i[n], 2),
                    r = s[0],
                    o = s[1];
                  t[r] = { userScore: o.score, mean: 50, stdDev: 15, percentile: o.percentile };
                }
                return t;
              }
            },
            {
              key: 'calculateReliability',
              value: function (e) {
                return e >= 30 ? 'Excellent' : e >= 20 ? 'Good' : e >= 10 ? 'Moderate' : 'Basic';
              }
            }
          ]),
          n && u(e.prototype, n),
          Object.defineProperty(e, 'prototype', { writable: !1 }),
          e
        );
        var e, n;
      })();
      function p(e) {
        return (
          (p =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    'function' == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? 'symbol'
                    : typeof e;
                }),
          p(e)
        );
      }
      function m(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return g(e);
          })(e) ||
          (function (e) {
            if (
              ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e['@@iterator']
            )
              return Array.from(e);
          })(e) ||
          v(e) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function y(e, t) {
        var n = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
        if (!n) {
          if (Array.isArray(e) || (n = v(e)) || (t && e && 'number' == typeof e.length)) {
            n && (e = n);
            var i = 0,
              s = function () {};
            return {
              s,
              n: function () {
                return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
              },
              e: function (e) {
                throw e;
              },
              f: s
            };
          }
          throw new TypeError(
            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
          );
        }
        var r,
          o = !0,
          a = !1;
        return {
          s: function () {
            n = n.call(e);
          },
          n: function () {
            var e = n.next();
            return ((o = e.done), e);
          },
          e: function (e) {
            ((a = !0), (r = e));
          },
          f: function () {
            try {
              o || null == n.return || n.return();
            } finally {
              if (a) throw r;
            }
          }
        };
      }
      function v(e, t) {
        if (e) {
          if ('string' == typeof e) return g(e, t);
          var n = {}.toString.call(e).slice(8, -1);
          return (
            'Object' === n && e.constructor && (n = e.constructor.name),
            'Map' === n || 'Set' === n
              ? Array.from(e)
              : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? g(e, t)
                : void 0
          );
        }
      }
      function g(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      function f(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          (t &&
            (i = i.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, i));
        }
        return n;
      }
      function b(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? f(Object(n), !0).forEach(function (t) {
                w(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : f(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function w(e, t, n) {
        return (
          (t = T(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = n),
          e
        );
      }
      function k(e, t) {
        for (var n = 0; n < t.length; n++) {
          var i = t[n];
          ((i.enumerable = i.enumerable || !1),
            (i.configurable = !0),
            'value' in i && (i.writable = !0),
            Object.defineProperty(e, T(i.key), i));
        }
      }
      function T(e) {
        var t = (function (e) {
          if ('object' != p(e) || !e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var n = t.call(e, 'string');
            if ('object' != p(n)) return n;
            throw new TypeError('@@toPrimitive must return a primitive value.');
          }
          return String(e);
        })(e);
        return 'symbol' == p(t) ? t : t + '';
      }
      var S = new ((function () {
        return (
          (e = function e() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            (!(function (e, t) {
              if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
            })(this, e),
              (this.options = b(
                {
                  trackMouse: !1 !== t.trackMouse,
                  trackKeyboard: !1 !== t.trackKeyboard,
                  trackScroll: !1 !== t.trackScroll,
                  trackFocus: !1 !== t.trackFocus,
                  trackClicks: !1 !== t.trackClicks,
                  trackTouch: !1 !== t.trackTouch,
                  sampleRate: t.sampleRate || 60
                },
                t
              )),
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
          }),
          (t = [
            {
              key: 'start',
              value: function () {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document;
                this.isTracking ||
                  ((this.isTracking = !0),
                  (this.sessionData.startTime = performance.now()),
                  (this.container = e),
                  this.options.trackMouse &&
                    e.addEventListener('mousemove', this.handleMouseMove, { passive: !0 }),
                  this.options.trackClicks && e.addEventListener('click', this.handleClick, !0),
                  this.options.trackKeyboard &&
                    (e.addEventListener('keydown', this.handleKeyDown),
                    e.addEventListener('keyup', this.handleKeyUp)),
                  this.options.trackScroll &&
                    window.addEventListener('scroll', this.handleScroll, { passive: !0 }),
                  this.options.trackFocus &&
                    (e.addEventListener('focus', this.handleFocus, !0),
                    e.addEventListener('blur', this.handleBlur, !0)),
                  this.options.trackTouch &&
                    'ontouchstart' in window &&
                    (e.addEventListener('touchstart', this.handleTouchStart, { passive: !0 }),
                    e.addEventListener('touchmove', this.handleTouchMove, { passive: !0 }),
                    e.addEventListener('touchend', this.handleTouchEnd, { passive: !0 })),
                  document.addEventListener('visibilitychange', this.handleVisibilityChange),
                  this.logEvent('tracking_started'));
              }
            },
            {
              key: 'stop',
              value: function () {
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
            },
            {
              key: 'handleMouseMove',
              value: function (e) {
                var t = performance.now();
                if (!(t - this.lastMouseTime < this.mouseSampleInterval)) {
                  this.lastMouseTime = t;
                  var n = t - this.sessionData.startTime,
                    i = {
                      x: e.clientX,
                      y: e.clientY,
                      pageX: e.pageX,
                      pageY: e.pageY,
                      timestamp: n,
                      target: this.getElementSelector(e.target)
                    };
                  if (
                    (this.sessionData.mouseTrail.push(i), this.sessionData.mouseTrail.length > 1)
                  ) {
                    var s = this.sessionData.mouseTrail[this.sessionData.mouseTrail.length - 2],
                      r = Math.sqrt(Math.pow(i.x - s.x, 2) + Math.pow(i.y - s.y, 2)),
                      o = i.timestamp - s.timestamp,
                      a = r / o;
                    if (
                      (this.metrics.mouseVelocity.push({ velocity: a, timestamp: n }),
                      this.metrics.mouseVelocity.length > 1)
                    ) {
                      var c =
                        (a -
                          this.metrics.mouseVelocity[this.metrics.mouseVelocity.length - 2]
                            .velocity) /
                        o;
                      this.metrics.mouseAcceleration.push({ acceleration: c, timestamp: n });
                    }
                  }
                }
              }
            },
            {
              key: 'handleClick',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime,
                  n = {
                    x: e.clientX,
                    y: e.clientY,
                    button: e.button,
                    target: this.getElementSelector(e.target),
                    timestamp: t,
                    doubleClick: this.isDoubleClick(t)
                  };
                (this.sessionData.clicks.push(n), this.logEvent('click', n));
              }
            },
            {
              key: 'handleKeyDown',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime,
                  n = {
                    key: e.key,
                    code: e.code,
                    timestamp: t,
                    target: this.getElementSelector(e.target),
                    modifiers: {
                      shift: e.shiftKey,
                      ctrl: e.ctrlKey,
                      alt: e.altKey,
                      meta: e.metaKey
                    }
                  };
                (this.sessionData.keystrokes.push(b(b({}, n), {}, { type: 'down' })),
                  ('Backspace' !== e.key && 'Delete' !== e.key) ||
                    this.metrics.corrections.push(t));
              }
            },
            {
              key: 'handleKeyUp',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime;
                this.sessionData.keystrokes.push({
                  key: e.key,
                  code: e.code,
                  timestamp: t,
                  type: 'up'
                });
                var n = this.sessionData.keystrokes
                  .filter(function (t) {
                    return 'down' === t.type && t.code === e.code;
                  })
                  .pop();
                if (n) {
                  var i = t - n.timestamp;
                  this.metrics.dwellTimes.push({ key: e.key, duration: i, timestamp: t });
                }
              }
            },
            {
              key: 'handleScroll',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime;
                this.sessionData.scrollPatterns.push({
                  scrollX: window.scrollX,
                  scrollY: window.scrollY,
                  timestamp: t,
                  velocity: this.calculateScrollVelocity()
                });
              }
            },
            {
              key: 'handleFocus',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime;
                if (
                  (this.sessionData.focusChanges.push({
                    type: 'focus',
                    target: this.getElementSelector(e.target),
                    timestamp: t
                  }),
                  this.lastBlurTime)
                ) {
                  var n = t - this.lastBlurTime;
                  this.metrics.attentionSpans.push(n);
                }
              }
            },
            {
              key: 'handleBlur',
              value: function (e) {
                var t = performance.now() - this.sessionData.startTime;
                (this.sessionData.focusChanges.push({
                  type: 'blur',
                  target: this.getElementSelector(e.target),
                  timestamp: t
                }),
                  (this.lastBlurTime = t));
              }
            },
            {
              key: 'handleTouchStart',
              value: function (e) {
                var t,
                  n = performance.now() - this.sessionData.startTime,
                  i = y(e.touches);
                try {
                  for (i.s(); !(t = i.n()).done; ) {
                    var s = t.value;
                    this.sessionData.touches.push({
                      type: 'start',
                      identifier: s.identifier,
                      x: s.clientX,
                      y: s.clientY,
                      force: s.force || 0,
                      timestamp: n
                    });
                  }
                } catch (e) {
                  i.e(e);
                } finally {
                  i.f();
                }
              }
            },
            {
              key: 'handleTouchMove',
              value: function (e) {
                var t,
                  n = performance.now() - this.sessionData.startTime,
                  i = y(e.touches);
                try {
                  for (i.s(); !(t = i.n()).done; ) {
                    var s = t.value;
                    this.sessionData.touches.push({
                      type: 'move',
                      identifier: s.identifier,
                      x: s.clientX,
                      y: s.clientY,
                      force: s.force || 0,
                      timestamp: n
                    });
                  }
                } catch (e) {
                  i.e(e);
                } finally {
                  i.f();
                }
              }
            },
            {
              key: 'handleTouchEnd',
              value: function (e) {
                var t,
                  n = performance.now() - this.sessionData.startTime,
                  i = y(e.changedTouches);
                try {
                  for (i.s(); !(t = i.n()).done; ) {
                    var s = t.value;
                    this.sessionData.touches.push({
                      type: 'end',
                      identifier: s.identifier,
                      x: s.clientX,
                      y: s.clientY,
                      timestamp: n
                    });
                  }
                } catch (e) {
                  i.e(e);
                } finally {
                  i.f();
                }
              }
            },
            {
              key: 'handleVisibilityChange',
              value: function () {
                var e = performance.now() - this.sessionData.startTime;
                (this.logEvent('visibility_change', { hidden: document.hidden, timestamp: e }),
                  document.hidden &&
                    this.metrics.hesitations.push({ type: 'tab_switch', timestamp: e }));
              }
            },
            {
              key: 'logEvent',
              value: function (e) {
                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                this.sessionData.events.push({
                  type: e,
                  data: t,
                  timestamp: performance.now() - (this.sessionData.startTime || 0)
                });
              }
            },
            {
              key: 'getElementSelector',
              value: function (e) {
                if (!e) return null;
                var t = e.tagName.toLowerCase();
                return (
                  e.id && (t += '#'.concat(e.id)),
                  e.className &&
                    'string' == typeof e.className &&
                    (t += '.'.concat(e.className.split(' ').join('.'))),
                  t
                );
              }
            },
            {
              key: 'isDoubleClick',
              value: function (e) {
                return (
                  0 !== this.sessionData.clicks.length &&
                  e - this.sessionData.clicks[this.sessionData.clicks.length - 1].timestamp < 500
                );
              }
            },
            {
              key: 'calculateScrollVelocity',
              value: function () {
                if (this.sessionData.scrollPatterns.length < 2) return 0;
                var e = this.sessionData.scrollPatterns[this.sessionData.scrollPatterns.length - 1],
                  t = this.sessionData.scrollPatterns[this.sessionData.scrollPatterns.length - 2];
                return (e.scrollY - t.scrollY) / (e.timestamp - t.timestamp);
              }
            },
            {
              key: 'calculateMetrics',
              value: function () {
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
                  correctionRate:
                    this.metrics.corrections.length / this.sessionData.keystrokes.length,
                  clickCount: this.sessionData.clicks.length,
                  doubleClickCount: this.sessionData.clicks.filter(function (e) {
                    return e.doubleClick;
                  }).length,
                  focusChanges: this.sessionData.focusChanges.length,
                  averageAttentionSpan: this.calculateAverageAttentionSpan(),
                  distractionEvents: this.metrics.hesitations.length,
                  scrollEvents: this.sessionData.scrollPatterns.length,
                  averageScrollVelocity: this.calculateAverageScrollVelocity(),
                  touchEvents: this.sessionData.touches.length,
                  averageTouchPressure: this.calculateAverageTouchPressure()
                };
              }
            },
            {
              key: 'calculateActiveTime',
              value: function () {
                var e = []
                  .concat(
                    m(this.sessionData.clicks),
                    m(this.sessionData.keystrokes),
                    m(this.sessionData.scrollPatterns)
                  )
                  .sort(function (e, t) {
                    return e.timestamp - t.timestamp;
                  });
                if (e.length < 2) return 0;
                var t,
                  n = 0,
                  i = e[0].timestamp,
                  s = y(e);
                try {
                  for (s.s(); !(t = s.n()).done; ) {
                    var r = t.value,
                      o = r.timestamp - i;
                    (o < 5e3 && (n += o), (i = r.timestamp));
                  }
                } catch (e) {
                  s.e(e);
                } finally {
                  s.f();
                }
                return n;
              }
            },
            {
              key: 'calculateIdleTime',
              value: function () {
                return (
                  this.sessionData.endTime - this.sessionData.startTime - this.calculateActiveTime()
                );
              }
            },
            {
              key: 'calculateMouseDistance',
              value: function () {
                for (var e = 0, t = 1; t < this.sessionData.mouseTrail.length; t++) {
                  var n = this.sessionData.mouseTrail[t - 1],
                    i = this.sessionData.mouseTrail[t];
                  e += Math.sqrt(Math.pow(i.x - n.x, 2) + Math.pow(i.y - n.y, 2));
                }
                return e;
              }
            },
            {
              key: 'calculateAverageVelocity',
              value: function () {
                return 0 === this.metrics.mouseVelocity.length
                  ? 0
                  : this.metrics.mouseVelocity.reduce(function (e, t) {
                      return e + t.velocity;
                    }, 0) / this.metrics.mouseVelocity.length;
              }
            },
            {
              key: 'analyzeAcceleration',
              value: function () {
                if (0 === this.metrics.mouseAcceleration.length) return null;
                var e = this.metrics.mouseAcceleration.map(function (e) {
                  return e.acceleration;
                });
                return {
                  mean:
                    e.reduce(function (e, t) {
                      return e + t;
                    }, 0) / e.length,
                  max: Math.max.apply(Math, m(e)),
                  min: Math.min.apply(Math, m(e)),
                  std: this.calculateStandardDeviation(e)
                };
              }
            },
            {
              key: 'calculateMouseIdleTimes',
              value: function () {
                for (var e = [], t = 1; t < this.sessionData.mouseTrail.length; t++) {
                  var n =
                    this.sessionData.mouseTrail[t].timestamp -
                    this.sessionData.mouseTrail[t - 1].timestamp;
                  n > 1e3 && e.push(n);
                }
                return e;
              }
            },
            {
              key: 'calculateTypingSpeed',
              value: function () {
                var e = this.sessionData.keystrokes.filter(function (e) {
                  return 'down' === e.type && 1 === e.key.length;
                });
                if (e.length < 2) return 0;
                var t = (e[e.length - 1].timestamp - e[0].timestamp) / 6e4;
                return e.length / 5 / t;
              }
            },
            {
              key: 'calculateAverageDwellTime',
              value: function () {
                return 0 === this.metrics.dwellTimes.length
                  ? 0
                  : this.metrics.dwellTimes.reduce(function (e, t) {
                      return e + t.duration;
                    }, 0) / this.metrics.dwellTimes.length;
              }
            },
            {
              key: 'calculateAverageAttentionSpan',
              value: function () {
                return 0 === this.metrics.attentionSpans.length
                  ? 0
                  : this.metrics.attentionSpans.reduce(function (e, t) {
                      return e + t;
                    }, 0) / this.metrics.attentionSpans.length;
              }
            },
            {
              key: 'calculateAverageScrollVelocity',
              value: function () {
                if (0 === this.sessionData.scrollPatterns.length) return 0;
                var e = this.sessionData.scrollPatterns
                  .map(function (e) {
                    return Math.abs(e.velocity);
                  })
                  .filter(function (e) {
                    return e > 0;
                  });
                return 0 === e.length
                  ? 0
                  : e.reduce(function (e, t) {
                      return e + t;
                    }, 0) / e.length;
              }
            },
            {
              key: 'calculateAverageTouchPressure',
              value: function () {
                var e = this.sessionData.touches.filter(function (e) {
                  return e.force > 0;
                });
                return 0 === e.length
                  ? 0
                  : e.reduce(function (e, t) {
                      return e + t.force;
                    }, 0) / e.length;
              }
            },
            {
              key: 'calculateStandardDeviation',
              value: function (e) {
                var t =
                    e.reduce(function (e, t) {
                      return e + t;
                    }, 0) / e.length,
                  n =
                    e
                      .map(function (e) {
                        return Math.pow(e - t, 2);
                      })
                      .reduce(function (e, t) {
                        return e + t;
                      }, 0) / e.length;
                return Math.sqrt(n);
              }
            },
            {
              key: 'getData',
              value: function () {
                return {
                  session: this.sessionData,
                  metrics: this.calculateMetrics(),
                  patterns: this.analyzePatterns()
                };
              }
            },
            {
              key: 'analyzePatterns',
              value: function () {
                return {
                  impulsivity: this.analyzeImpulsivity(),
                  precision: this.analyzePrecision(),
                  consistency: this.analyzeConsistency(),
                  engagement: this.analyzeEngagement(),
                  anxiety: this.analyzeAnxiety()
                };
              }
            },
            {
              key: 'analyzeImpulsivity',
              value: function () {
                var e = this,
                  t = this.sessionData.clicks.filter(function (t, n) {
                    return 0 !== n && t.timestamp - e.sessionData.clicks[n - 1].timestamp < 500;
                  }).length,
                  n = this.metrics.mouseVelocity.filter(function (e) {
                    return e.velocity > 2;
                  }).length;
                return {
                  score:
                    (t + n) / (this.sessionData.clicks.length + this.metrics.mouseVelocity.length),
                  quickClicks: t,
                  highVelocityMoves: n
                };
              }
            },
            {
              key: 'analyzePrecision',
              value: function () {
                var e =
                    this.metrics.corrections.length /
                    Math.max(1, this.sessionData.keystrokes.length),
                  t = this.calculateMouseJitter();
                return { score: 1 - (e + t) / 2, correctionRate: e, mouseJitter: t };
              }
            },
            {
              key: 'calculateMouseJitter',
              value: function () {
                if (this.metrics.mouseAcceleration.length < 2) return 0;
                for (var e = 0, t = 1; t < this.metrics.mouseAcceleration.length; t++) {
                  var n = this.metrics.mouseAcceleration[t].acceleration,
                    i = this.metrics.mouseAcceleration[t - 1].acceleration;
                  Math.sign(n) !== Math.sign(i) && e++;
                }
                return e / this.metrics.mouseAcceleration.length;
              }
            },
            {
              key: 'analyzeConsistency',
              value: function () {
                var e =
                    this.metrics.mouseVelocity.length > 0
                      ? this.calculateStandardDeviation(
                          this.metrics.mouseVelocity.map(function (e) {
                            return e.velocity;
                          })
                        )
                      : 0,
                  t =
                    this.metrics.dwellTimes.length > 0
                      ? this.calculateStandardDeviation(
                          this.metrics.dwellTimes.map(function (e) {
                            return e.duration;
                          })
                        )
                      : 0;
                return { score: 1 / (1 + e + t), velocityVariance: e, dwellTimeVariance: t };
              }
            },
            {
              key: 'analyzeEngagement',
              value: function () {
                var e =
                    this.calculateActiveTime() /
                    (this.sessionData.endTime - this.sessionData.startTime),
                  t =
                    (this.sessionData.clicks.length + this.sessionData.keystrokes.length) /
                    ((this.sessionData.endTime - this.sessionData.startTime) / 1e3);
                return { score: (e + Math.min(1, t / 5)) / 2, activeRatio: e, interactionRate: t };
              }
            },
            {
              key: 'analyzeAnxiety',
              value: function () {
                var e = this.metrics.hesitations.length,
                  t =
                    this.metrics.corrections.length /
                    Math.max(1, this.sessionData.keystrokes.length),
                  n = this.calculateMouseIdleTimes().length;
                return {
                  score: (e + 10 * t + n) / (this.sessionData.events.length || 1),
                  hesitations: e,
                  corrections: t,
                  mouseIdles: n
                };
              }
            }
          ]),
          t && k(e.prototype, t),
          Object.defineProperty(e, 'prototype', { writable: !1 }),
          e
        );
        var e, t;
      })())();
      function x(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return I(e);
          })(e) ||
          (function (e) {
            if (
              ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e['@@iterator']
            )
              return Array.from(e);
          })(e) ||
          (function (e, t) {
            if (e) {
              if ('string' == typeof e) return I(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                'Object' === n && e.constructor && (n = e.constructor.name),
                'Map' === n || 'Set' === n
                  ? Array.from(e)
                  : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? I(e, t)
                    : void 0
              );
            }
          })(e) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function I(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      var E = [
          {
            id: 'o1',
            text: "You discover a door in your home you've never noticed before. What do you do?",
            type: 'choice',
            options: [
              'Immediately open it to explore',
              "Research the house's history first",
              "Ask others if they've seen it",
              'Leave it alone - it was hidden for a reason',
              "Test if it's real or imagined"
            ],
            measures: ['curiosity', 'risk_tolerance', 'imagination']
          },
          {
            id: 'o2',
            text: 'If colors had personalities, which would be the leader?',
            type: 'choice',
            options: [
              'Red - bold and commanding',
              'Blue - calm and strategic',
              'Gold - prestigious and traditional',
              'Purple - mysterious and wise',
              'Green - balanced and growth-oriented'
            ],
            measures: ['abstract_thinking', 'leadership_perception', 'creativity']
          },
          {
            id: 'o3',
            text: 'You can speak to one type of animal for a day. Which provides the most valuable insights?',
            type: 'choice',
            options: [
              'Birds - they see everything from above',
              'Cats - they know secrets of independence',
              'Dogs - they understand loyalty',
              "Ants - they've mastered cooperation",
              'Dolphins - they play while being intelligent'
            ],
            measures: ['value_systems', 'perspective_taking', 'curiosity_direction']
          }
        ],
        C = [
          {
            id: 'c1',
            text: "You're given a magic notebook that makes written plans happen. What's your first concern?",
            type: 'choice',
            options: [
              'My handwriting might cause misinterpretations',
              'I need to plan the perfect first entry',
              'What if I change my mind later?',
              'Testing with something small first',
              'Whether I deserve this power'
            ],
            measures: ['perfectionism', 'planning_style', 'responsibility']
          },
          {
            id: 'c2',
            text: "Your life is a video game. What's your biggest achievement?",
            type: 'choice',
            options: [
              '100% completion rate',
              'Speedrun record holder',
              'Most creative solutions',
              'Helping most other players',
              'Finding all easter eggs'
            ],
            measures: ['achievement_orientation', 'thoroughness', 'goal_type']
          },
          {
            id: 'c3',
            text: 'You must organize a library where books arrange themselves by...',
            type: 'choice',
            options: [
              "How much they've changed someone's life",
              'The emotions they evoke',
              'Their hidden connections to each other',
              'The questions they answer',
              'The worlds they create'
            ],
            measures: ['organization_style', 'value_priorities', 'systematic_thinking']
          }
        ],
        A = [
          {
            id: 'e1',
            text: "You're a battery. What charges you most efficiently?",
            type: 'choice',
            options: [
              'Being plugged into a group celebration',
              'Solar power from quiet contemplation',
              'Quick bursts from brief interactions',
              'Slow steady charge from one deep connection',
              'Wireless charging from being near others'
            ],
            measures: ['energy_source', 'social_preference', 'stimulation_needs']
          },
          {
            id: 'e2',
            text: 'In a world where thoughts are visible as colors above heads, you prefer...',
            type: 'choice',
            options: [
              'Vibrant rainbow crowds - so much to see',
              'Subtle pastels - gentle and non-intrusive',
              'Bold primaries - clear and direct',
              'Invisible option - privacy matters',
              'Selective visibility - control who sees'
            ],
            measures: ['openness_level', 'privacy_needs', 'social_energy']
          },
          {
            id: 'e3',
            text: "You're designing a personal workspace. The walls are...",
            type: 'choice',
            options: [
              'Glass - see and be seen',
              'One-way mirrors - observe but private',
              'Convertible - walls that appear/disappear',
              'Covered in interaction points',
              'Soundproof but with windows'
            ],
            measures: ['boundary_preferences', 'interaction_style', 'environmental_needs']
          }
        ],
        D = [
          {
            id: 'a1',
            text: 'You find a wallet with $1000. The ID shows someone wealthy. Your first thought?',
            type: 'choice',
            options: [
              "Return it immediately - it's theirs",
              'Donate the cash, return the wallet',
              "Check if there's a reward first",
              "They won't miss it as much as I need it",
              'Post online to find them publicly'
            ],
            measures: ['honesty', 'fairness_perception', 'moral_flexibility']
          },
          {
            id: 'a2',
            text: 'In a game where you can only win if others lose, you...',
            type: 'choice',
            options: [
              'Find a way for everyone to win instead',
              'Win efficiently to minimize their loss',
              "Play your best - that's the game",
              'Let others win sometimes',
              'Refuse to play'
            ],
            measures: ['cooperation', 'competition_comfort', 'win_win_thinking']
          },
          {
            id: 'a3',
            text: 'You can read emotions as weather patterns around people. You focus on...',
            type: 'choice',
            options: [
              'Storm warnings to offer help',
              'Sunny people to enjoy their energy',
              'Your own forecast first',
              'Overall climate of the room',
              'Interesting unusual patterns'
            ],
            measures: ['empathy_focus', 'emotional_awareness', 'helping_orientation']
          }
        ],
        M = [
          {
            id: 'n1',
            text: "Your emotions are playlist. What's on repeat most often?",
            type: 'choice',
            options: [
              'Carefully curated mix - balanced',
              "Whatever's trending - goes with flow",
              'Same comfort songs - predictable',
              'Wildly varies - emotional DJ',
              'Trying to find the off button'
            ],
            measures: ['emotional_stability', 'mood_regulation', 'emotional_awareness']
          },
          {
            id: 'n2',
            text: "You're sailing a boat. A storm approaches. Your instinct?",
            type: 'choice',
            options: [
              'Sail straight through - fastest route',
              'Find shelter immediately',
              'Enjoy the thrill of the challenge',
              'Calculate optimal path around it',
              'Prepare for worst while hoping for best'
            ],
            measures: ['stress_response', 'risk_assessment', 'anxiety_management']
          },
          {
            id: 'n3',
            text: 'Your mind is a house. The basement contains...',
            type: 'choice',
            options: [
              'Organized archive of experiences',
              "Things I'm not ready to sort yet",
              "I don't go down there",
              'Hidden treasures and old fears',
              'Workshop where I process things'
            ],
            measures: ['psychological_insight', 'emotional_processing', 'self_awareness']
          }
        ],
        O = [
          {
            id: 'm1',
            text: 'You wake up with the ability to freeze time for everyone but you. First hour?',
            type: 'choice',
            options: [
              'Fix things people are struggling with',
              "Explore places I couldn't normally",
              "Catch up on everything I'm behind on",
              'Study frozen moments like art',
              'Plan how to use this responsibly'
            ],
            measures: ['altruism', 'curiosity', 'conscientiousness', 'aesthetics', 'ethics']
          },
          {
            id: 'm2',
            text: "You're writing your autobiography but each chapter must be a different genre. Chapter 1 is...",
            type: 'choice',
            options: [
              'Mystery - understanding myself',
              'Adventure - all the risks I took',
              'Comedy - laughing at my mistakes',
              'Drama - the relationships that shaped me',
              "Science fiction - who I'm becoming"
            ],
            measures: [
              'self_perception',
              'life_narrative',
              'identity_focus',
              'temporal_orientation'
            ]
          },
          {
            id: 'm3',
            text: 'You discover your reflection sometimes does things differently than you. This means...',
            type: 'choice',
            options: [
              "I'm seeing my potential self",
              'My subconscious is communicating',
              'Parallel universe crossing over',
              "I need to pay attention to what I'm suppressing",
              'Time to experiment with the mirror'
            ],
            measures: ['self_concept', 'unconscious_awareness', 'reality_testing', 'integration']
          },
          {
            id: 'm4',
            text: "In dreams, you always return to the same mysterious place. It's...",
            type: 'choice',
            options: [
              "A library with books I've never read",
              'A garden where each plant is a memory',
              'An empty theater waiting for performance',
              'A workshop full of unfinished projects',
              'A crossroads with infinite paths'
            ],
            measures: ['unconscious_themes', 'life_metaphors', 'unfulfilled_needs', 'identity']
          }
        ],
        P = [
          {
            id: 'p1',
            text: "You're tasked with designing a new emotion. It feels like...",
            type: 'choice',
            options: [
              'The moment before a first kiss',
              'Solving a puzzle after hours of trying',
              "Finding something you didn't know you lost",
              'The silence after perfect music ends',
              "Watching someone become who they're meant to be"
            ],
            measures: ['emotional_complexity', 'value_systems', 'aesthetic_sense']
          },
          {
            id: 'p2',
            text: 'If your personality was a recipe, the main ingredient would be...',
            type: 'choice',
            options: [
              'Curiosity with a dash of chaos',
              'Reliability slow-cooked to perfection',
              'Enthusiasm with surprise spices',
              'Carefully measured empathy',
              'Adaptability with seasonal variations'
            ],
            measures: ['self_concept', 'core_identity', 'personality_insight']
          },
          {
            id: 'p3',
            text: "You're an architect of realities. Your signature style includes...",
            type: 'choice',
            options: [
              'Hidden doors to everywhere',
              "Rooms that adapt to occupants' needs",
              'Windows showing different times',
              'Spaces that connect distant people',
              'Structures that grow and evolve'
            ],
            measures: ['world_view', 'relationship_patterns', 'change_orientation']
          }
        ];
      function L() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 20;
        return []
          .concat(x(E), x(C), x(A), x(D), x(M), x(O), x(P))
          .sort(function () {
            return Math.random() - 0.5;
          })
          .slice(0, e);
      }
      function j(e) {
        return (
          (j =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    'function' == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? 'symbol'
                    : typeof e;
                }),
          j(e)
        );
      }
      function q(e, t) {
        var n = ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
        if (!n) {
          if (
            Array.isArray(e) ||
            (n = (function (e, t) {
              if (e) {
                if ('string' == typeof e) return R(e, t);
                var n = {}.toString.call(e).slice(8, -1);
                return (
                  'Object' === n && e.constructor && (n = e.constructor.name),
                  'Map' === n || 'Set' === n
                    ? Array.from(e)
                    : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                      ? R(e, t)
                      : void 0
                );
              }
            })(e)) ||
            (t && e && 'number' == typeof e.length)
          ) {
            n && (e = n);
            var i = 0,
              s = function () {};
            return {
              s,
              n: function () {
                return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
              },
              e: function (e) {
                throw e;
              },
              f: s
            };
          }
          throw new TypeError(
            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
          );
        }
        var r,
          o = !0,
          a = !1;
        return {
          s: function () {
            n = n.call(e);
          },
          n: function () {
            var e = n.next();
            return ((o = e.done), e);
          },
          e: function (e) {
            ((a = !0), (r = e));
          },
          f: function () {
            try {
              o || null == n.return || n.return();
            } finally {
              if (a) throw r;
            }
          }
        };
      }
      function R(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      function Y(e, t) {
        for (var n = 0; n < t.length; n++) {
          var i = t[n];
          ((i.enumerable = i.enumerable || !1),
            (i.configurable = !0),
            'value' in i && (i.writable = !0),
            Object.defineProperty(e, _(i.key), i));
        }
      }
      function _(e) {
        var t = (function (e) {
          if ('object' != j(e) || !e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var n = t.call(e, 'string');
            if ('object' != j(n)) return n;
            throw new TypeError('@@toPrimitive must return a primitive value.');
          }
          return String(e);
        })(e);
        return 'symbol' == j(t) ? t : t + '';
      }
      var B = new ((function () {
        return (
          (e = function e() {
            (!(function (e, t) {
              if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
            })(this, e),
              (this.crisisIndicators = {
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
                  international: {
                    name: 'International Crisis Lines',
                    web: 'https://findahelpline.com'
                  }
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
          }),
          (t = [
            {
              key: 'checkForCrisis',
              value: function (e) {
                if (!e) return null;
                var t,
                  n = e.toLowerCase(),
                  i = q(this.crisisIndicators.severe);
                try {
                  for (i.s(); !(t = i.n()).done; ) {
                    var s = t.value;
                    if (n.includes(s))
                      return {
                        level: 'severe',
                        action: 'immediate',
                        resources: this.getCrisisResources()
                      };
                  }
                } catch (e) {
                  i.e(e);
                } finally {
                  i.f();
                }
                var r,
                  o = 0,
                  a = q(this.crisisIndicators.moderate);
                try {
                  for (a.s(); !(r = a.n()).done; ) {
                    var c = r.value;
                    n.includes(c) && o++;
                  }
                } catch (e) {
                  a.e(e);
                } finally {
                  a.f();
                }
                if (o >= 2)
                  return {
                    level: 'moderate',
                    action: 'support',
                    resources: this.getSupportResources()
                  };
                var l,
                  u = q(this.crisisIndicators.trauma);
                try {
                  for (u.s(); !(l = u.n()).done; ) {
                    var h = l.value;
                    if (n.includes(h))
                      return {
                        level: 'trauma',
                        action: 'trauma-informed',
                        resources: this.getTraumaResources()
                      };
                  }
                } catch (e) {
                  u.e(e);
                } finally {
                  u.f();
                }
                return null;
              }
            },
            {
              key: 'checkAssessmentResults',
              value: function (e) {
                var t = [];
                return (
                  e.adhd_probability > 0.8 &&
                    t.push({
                      type: 'adhd',
                      confidence: e.adhd_probability,
                      message: 'Your responses suggest strong ADHD traits',
                      resources: this.resources.neurodivergent.adhd
                    }),
                  e.autism_probability > 0.8 &&
                    t.push({
                      type: 'autism',
                      confidence: e.autism_probability,
                      message: 'Your responses suggest autistic traits',
                      resources: this.resources.neurodivergent.autism
                    }),
                  e.dyslexia_indicators > 0.7 &&
                    t.push({
                      type: 'dyslexia',
                      confidence: e.dyslexia_indicators,
                      message: 'Your responses suggest possible dyslexia',
                      resources: this.resources.neurodivergent.dyslexia
                    }),
                  e.depression_score >= 15 &&
                    t.push({
                      type: 'depression',
                      severity: 'moderate-severe',
                      message: 'Your mood responses suggest you may benefit from support',
                      resources: this.resources.mentalHealth.therapy
                    }),
                  e.anxiety_score >= 15 &&
                    t.push({
                      type: 'anxiety',
                      severity: 'severe',
                      message: 'Your anxiety levels appear elevated',
                      resources: this.resources.mentalHealth.therapy
                    }),
                  t
                );
              }
            },
            {
              key: 'getCrisisResources',
              value: function () {
                var e = navigator.language || 'en-US',
                  t = [];
                return (
                  e.includes('US')
                    ? t.push(this.resources.crisis.us)
                    : (e.includes('GB') || e.includes('UK')) && t.push(this.resources.crisis.uk),
                  t.push(this.resources.crisis.international),
                  {
                    immediate: t,
                    message: 'Your wellbeing matters. Please reach out for support:',
                    priority: 'high'
                  }
                );
              }
            },
            {
              key: 'getSupportResources',
              value: function () {
                return {
                  therapy: this.resources.mentalHealth.therapy,
                  peer: this.resources.mentalHealth.peer,
                  apps: this.resources.mentalHealth.apps,
                  message: 'Support is available. Consider these resources:',
                  priority: 'medium'
                };
              }
            },
            {
              key: 'getTraumaResources',
              value: function () {
                return {
                  ptsd: this.resources.trauma.ptsd,
                  cptsd: this.resources.trauma.cptsd,
                  therapy: this.resources.trauma.therapy,
                  message: 'Trauma-informed support can help:',
                  priority: 'medium'
                };
              }
            },
            {
              key: 'showIntervention',
              value: function (e) {
                var t = document.createElement('div');
                ((t.className = 'intervention-modal'),
                  (t.innerHTML =
                    '\n            <div class="intervention-content">\n                <h3>We\'re Here to Help</h3>\n                <p>'
                      .concat(
                        e.message,
                        '</p>\n                \n                <div class="resource-list">\n                    '
                      )
                      .concat(
                        this.renderResources(e.resources),
                        '\n                </div>\n                \n                <div class="intervention-actions">\n                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">\n                        I\'ll Get Help\n                    </button>\n                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">\n                        Continue Assessment\n                    </button>\n                </div>\n            </div>\n        '
                      )),
                  document.body.appendChild(t),
                  this.logIntervention(e));
              }
            },
            {
              key: 'renderResources',
              value: function (e) {
                return e.immediate
                  ? e.immediate
                      .map(function (e) {
                        return '\n                <div class="crisis-resource">\n                    <strong>'
                          .concat(e.name, '</strong>\n                    ')
                          .concat(
                            e.phone
                              ? '<a href="tel:'
                                  .concat(e.phone, '" class="crisis-phone">')
                                  .concat(e.phone, '</a>')
                              : '',
                            '\n                    '
                          )
                          .concat(
                            e.text ? '<p>'.concat(e.text, '</p>') : '',
                            '\n                    '
                          )
                          .concat(
                            e.web ? '<a href="'.concat(e.web, '" target="_blank">Website</a>') : '',
                            '\n                </div>\n            '
                          );
                      })
                      .join('')
                  : Object.values(e)
                      .map(function (e) {
                        return e.name
                          ? '\n                    <div class="support-resource">\n                        <strong>'
                              .concat(e.name, '</strong>\n                        ')
                              .concat(
                                e.description ? '<p>'.concat(e.description, '</p>') : '',
                                '\n                        '
                              )
                              .concat(
                                e.web
                                  ? '<a href="'.concat(e.web, '" target="_blank">Learn More</a>')
                                  : '',
                                '\n                    </div>\n                '
                              )
                          : '';
                      })
                      .join('');
              }
            },
            {
              key: 'logIntervention',
              value: function (e) {
                var t = {
                  timestamp: new Date().toISOString(),
                  type: e.level || e.type,
                  action: e.action,
                  shown: !0
                };
                (sessionStorage.setItem('intervention_log', JSON.stringify(t)),
// console.log('[Safety] Intervention shown:', t));
              }
            },
            {
              key: 'checkFollowUp',
              value: function () {
                var e = sessionStorage.getItem('intervention_log');
                if (e) {
                  var t = JSON.parse(e);
                  Date.now() - new Date(t.timestamp).getTime() > 6e5 && this.showFollowUp();
                }
              }
            },
            {
              key: 'showFollowUp',
              value: function () {
                var e = document.createElement('div');
                ((e.className = 'follow-up-banner'),
                  (e.innerHTML =
                    '\n            <p>How are you feeling? Remember, support is always available.</p>\n            <button onclick="this.parentElement.remove()">I\'m OK</button>\n        '),
                  document.body.insertBefore(e, document.body.firstChild));
              }
            }
          ]) && Y(e.prototype, t),
          Object.defineProperty(e, 'prototype', { writable: !1 }),
          e
        );
        var e, t;
      })())();
      function Q(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return N(e);
          })(e) ||
          (function (e) {
            if (
              ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e['@@iterator']
            )
              return Array.from(e);
          })(e) ||
          (function (e, t) {
            if (e) {
              if ('string' == typeof e) return N(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                'Object' === n && e.constructor && (n = e.constructor.name),
                'Map' === n || 'Set' === n
                  ? Array.from(e)
                  : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? N(e, t)
                    : void 0
              );
            }
          })(e) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function N(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      var H,
        z = [
          {
            text: 'When I discover a hidden path while walking, I usually take it to see where it leads',
            category: 'Openness',
            reversed: !1
          },
          {
            text: "I get excited when someone recommends music from a genre I've never explored",
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'I prefer restaurants where I can order the same dish I love every time',
            category: 'Openness',
            reversed: !0
          },
          {
            text: "Abstract art often speaks to me in ways I can't quite explain",
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'I enjoy conversations that challenge my fundamental beliefs',
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'When traveling, I prefer having every detail planned in advance',
            category: 'Openness',
            reversed: !0
          },
          {
            text: 'I often find myself lost in Wikipedia rabbit holes for hours',
            category: 'Openness',
            reversed: !1
          },
          {
            text: "I'd rather watch a documentary about quantum physics than a romantic comedy",
            category: 'Openness',
            reversed: !1
          }
        ],
        F = [
          {
            text: 'My workspace naturally stays organized without much effort',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'I often start projects with enthusiasm but struggle to finish them',
            category: 'Conscientiousness',
            reversed: !0
          },
          {
            text: 'I arrive at least 10 minutes early to appointments',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'My to-do lists have sub-lists with their own sub-lists',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'I can work effectively even when my environment is chaotic',
            category: 'Conscientiousness',
            reversed: !0
          },
          {
            text: 'I review my work multiple times before considering it complete',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'Deadlines motivate me - I work best under pressure',
            category: 'Conscientiousness',
            reversed: !0
          },
          {
            text: 'I keep track of my expenses down to the penny',
            category: 'Conscientiousness',
            reversed: !1
          }
        ],
        W = [
          {
            text: 'After a long week, a crowded party sounds perfect',
            category: 'Extraversion',
            reversed: !1
          },
          {
            text: 'I need alone time to recharge after social events',
            category: 'Extraversion',
            reversed: !0
          },
          {
            text: 'I naturally take charge when working in groups',
            category: 'Extraversion',
            reversed: !1
          },
          {
            text: 'Small talk with strangers energizes me',
            category: 'Extraversion',
            reversed: !1
          },
          { text: 'I prefer texting over phone calls', category: 'Extraversion', reversed: !0 },
          {
            text: 'Being the center of attention feels natural to me',
            category: 'Extraversion',
            reversed: !1
          },
          {
            text: 'I do my best thinking when talking ideas through with others',
            category: 'Extraversion',
            reversed: !1
          },
          {
            text: "I'd choose a quiet coffee shop over a bustling café",
            category: 'Extraversion',
            reversed: !0
          }
        ],
        G = [
          {
            text: 'I instinctively trust people until they prove otherwise',
            category: 'Agreeableness',
            reversed: !1
          },
          {
            text: 'I find it satisfying when someone who wronged me faces consequences',
            category: 'Agreeableness',
            reversed: !0
          },
          {
            text: 'I often go out of my way to help strangers',
            category: 'Agreeableness',
            reversed: !1
          },
          {
            text: 'In negotiations, I focus on what I can gain rather than mutual benefit',
            category: 'Agreeableness',
            reversed: !0
          },
          {
            text: 'Seeing others succeed genuinely makes me happy',
            category: 'Agreeableness',
            reversed: !1
          },
          {
            text: 'I believe most people would take advantage if given the chance',
            category: 'Agreeableness',
            reversed: !0
          },
          {
            text: 'I tend to forgive easily and rarely hold grudges',
            category: 'Agreeableness',
            reversed: !1
          },
          {
            text: 'I enjoy debates where I can prove my point',
            category: 'Agreeableness',
            reversed: !0
          }
        ],
        V = [
          {
            text: 'Minor setbacks can affect my mood for the entire day',
            category: 'Neuroticism',
            reversed: !1
          },
          {
            text: 'I remain calm even when everything seems to go wrong',
            category: 'Neuroticism',
            reversed: !0
          },
          {
            text: 'I often replay embarrassing moments from years ago',
            category: 'Neuroticism',
            reversed: !1
          },
          {
            text: 'Uncertainty excites me rather than worries me',
            category: 'Neuroticism',
            reversed: !0
          },
          {
            text: 'I check my sent emails multiple times to ensure they were okay',
            category: 'Neuroticism',
            reversed: !1
          },
          {
            text: 'I sleep soundly even before important events',
            category: 'Neuroticism',
            reversed: !0
          },
          {
            text: 'Small changes in routine make me anxious',
            category: 'Neuroticism',
            reversed: !1
          },
          {
            text: 'I can laugh at myself when I make mistakes',
            category: 'Neuroticism',
            reversed: !0
          }
        ],
        U = [
          {
            text: 'I keep my phone on silent to avoid distractions',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: "I've stayed up all night pursuing a fascinating topic",
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'I prefer working alone on important projects',
            category: 'Extraversion',
            reversed: !0
          },
          {
            text: 'I double-check locks and appliances before leaving home',
            category: 'Neuroticism',
            reversed: !1
          },
          { text: 'I share my food without being asked', category: 'Agreeableness', reversed: !1 },
          {
            text: 'I color-code my calendar and notes',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'I enjoy movies that leave the ending open to interpretation',
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'I feel drained after video calls, even with friends',
            category: 'Extraversion',
            reversed: !0
          }
        ],
        K = [
          {
            text: "If I won the lottery, I'd invest most of it rather than spend it",
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: 'At a museum, I read every placard thoroughly',
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'In group photos, I naturally position myself in the center',
            category: 'Extraversion',
            reversed: !1
          },
          {
            text: 'When someone cuts in line, I speak up immediately',
            category: 'Agreeableness',
            reversed: !0
          },
          {
            text: 'Before a trip, I research everything that could go wrong',
            category: 'Neuroticism',
            reversed: !1
          },
          {
            text: 'I notice when picture frames are slightly crooked',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: "I'd rather explore a new city without a map or guide",
            category: 'Openness',
            reversed: !1
          },
          {
            text: "At parties, I'm usually the last to leave",
            category: 'Extraversion',
            reversed: !1
          }
        ],
        J = [
          {
            text: 'I prefer fiction that explores impossible worlds over realistic stories',
            category: 'Openness',
            reversed: !1
          },
          {
            text: 'My ideal vacation involves a detailed itinerary',
            category: 'Conscientiousness',
            reversed: !1
          },
          {
            text: "I'd choose dinner with one close friend over a party with twenty acquaintances",
            category: 'Extraversion',
            reversed: !0
          },
          {
            text: 'I enjoy competitive activities more than cooperative ones',
            category: 'Agreeableness',
            reversed: !0
          },
          {
            text: 'I prefer predictable routines over spontaneous adventures',
            category: 'Neuroticism',
            reversed: !1
          }
        ];
      function X() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 20,
          t = [].concat(Q(z), Q(F), Q(W), Q(G), Q(V), Q(U), Q(K), Q(J)),
          n = [];
        ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'].forEach(
          function (i) {
            var s = t
              .filter(function (e) {
                return e.category === i;
              })
              .sort(function () {
                return Math.random() - 0.5;
              });
            n.push.apply(n, Q(s.slice(0, Math.min(2, Math.floor(e / 5)))));
          }
        );
        var i = e - n.length,
          s = t
            .filter(function (e) {
              return !n.includes(e);
            })
            .sort(function () {
              return Math.random() - 0.5;
            });
        return (
          n.push.apply(n, Q(s.slice(0, i))),
          n.sort(function () {
            return Math.random() - 0.5;
          })
        );
      }
      function $(e) {
        return (
          ($ =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    'function' == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? 'symbol'
                    : typeof e;
                }),
          $(e)
        );
      }
      function Z(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          (t &&
            (i = i.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, i));
        }
        return n;
      }
      function ee(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? Z(Object(n), !0).forEach(function (t) {
                te(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : Z(Object(n)).forEach(function (t) {
                  Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                });
        }
        return e;
      }
      function te(e, t, n) {
        return (
          (t = oe(t)) in e
            ? Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
              })
            : (e[t] = n),
          e
        );
      }
      function ne(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return se(e);
          })(e) ||
          (function (e) {
            if (
              ('undefined' != typeof Symbol && null != e[Symbol.iterator]) ||
              null != e['@@iterator']
            )
              return Array.from(e);
          })(e) ||
          ie(e) ||
          (function () {
            throw new TypeError(
              'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
            );
          })()
        );
      }
      function ie(e, t) {
        if (e) {
          if ('string' == typeof e) return se(e, t);
          var n = {}.toString.call(e).slice(8, -1);
          return (
            'Object' === n && e.constructor && (n = e.constructor.name),
            'Map' === n || 'Set' === n
              ? Array.from(e)
              : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? se(e, t)
                : void 0
          );
        }
      }
      function se(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
        return i;
      }
      function re(e, t) {
        for (var n = 0; n < t.length; n++) {
          var i = t[n];
          ((i.enumerable = i.enumerable || !1),
            (i.configurable = !0),
            'value' in i && (i.writable = !0),
            Object.defineProperty(e, oe(i.key), i));
        }
      }
      function oe(e) {
        var t = (function (e) {
          if ('object' != $(e) || !e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var n = t.call(e, 'string');
            if ('object' != $(n)) return n;
            throw new TypeError('@@toPrimitive must return a primitive value.');
          }
          return String(e);
        })(e);
        return 'symbol' == $(t) ? t : t + '';
      }
      function ae() {
        var e,
          t,
          n = 'function' == typeof Symbol ? Symbol : {},
          i = n.iterator || '@@iterator',
          s = n.toStringTag || '@@toStringTag';
        function r(n, i, s, r) {
          var c = i && i.prototype instanceof a ? i : a,
            l = Object.create(c.prototype);
          return (
            ce(
              l,
              '_invoke',
              (function (n, i, s) {
                var r,
                  a,
                  c,
                  l = 0,
                  u = s || [],
                  h = !1,
                  d = {
                    p: 0,
                    n: 0,
                    v: e,
                    a: p,
                    f: p.bind(e, 4),
                    d: function (t, n) {
                      return ((r = t), (a = 0), (c = e), (d.n = n), o);
                    }
                  };
                function p(n, i) {
                  for (a = n, c = i, t = 0; !h && l && !s && t < u.length; t++) {
                    var s,
                      r = u[t],
                      p = d.p,
                      m = r[2];
                    n > 3
                      ? (s = m === i) && ((c = r[(a = r[4]) ? 5 : ((a = 3), 3)]), (r[4] = r[5] = e))
                      : r[0] <= p &&
                        ((s = n < 2 && p < r[1])
                          ? ((a = 0), (d.v = i), (d.n = r[1]))
                          : p < m &&
                            (s = n < 3 || r[0] > i || i > m) &&
                            ((r[4] = n), (r[5] = i), (d.n = m), (a = 0)));
                  }
                  if (s || n > 1) return o;
                  throw ((h = !0), i);
                }
                return function (s, u, m) {
                  if (l > 1) throw TypeError('Generator is already running');
                  for (h && 1 === u && p(u, m), a = u, c = m; (t = a < 2 ? e : c) || !h; ) {
                    r || (a ? (a < 3 ? (a > 1 && (d.n = -1), p(a, c)) : (d.n = c)) : (d.v = c));
                    try {
                      if (((l = 2), r)) {
                        if ((a || (s = 'next'), (t = r[s]))) {
                          if (!(t = t.call(r, c)))
                            throw TypeError('iterator result is not an object');
                          if (!t.done) return t;
                          ((c = t.value), a < 2 && (a = 0));
                        } else
                          (1 === a && (t = r.return) && t.call(r),
                            a < 2 &&
                              ((c = TypeError(
                                "The iterator does not provide a '" + s + "' method"
                              )),
                              (a = 1)));
                        r = e;
                      } else if ((t = (h = d.n < 0) ? c : n.call(i, d)) !== o) break;
                    } catch (t) {
                      ((r = e), (a = 1), (c = t));
                    } finally {
                      l = 1;
                    }
                  }
                  return { value: t, done: h };
                };
              })(n, s, r),
              !0
            ),
            l
          );
        }
        var o = {};
        function a() {}
        function c() {}
        function l() {}
        t = Object.getPrototypeOf;
        var u = [][i]
            ? t(t([][i]()))
            : (ce((t = {}), i, function () {
                return this;
              }),
              t),
          h = (l.prototype = a.prototype = Object.create(u));
        function d(e) {
          return (
            Object.setPrototypeOf
              ? Object.setPrototypeOf(e, l)
              : ((e.__proto__ = l), ce(e, s, 'GeneratorFunction')),
            (e.prototype = Object.create(h)),
            e
          );
        }
        return (
          (c.prototype = l),
          ce(h, 'constructor', l),
          ce(l, 'constructor', c),
          (c.displayName = 'GeneratorFunction'),
          ce(l, s, 'GeneratorFunction'),
          ce(h),
          ce(h, s, 'Generator'),
          ce(h, i, function () {
            return this;
          }),
          ce(h, 'toString', function () {
            return '[object Generator]';
          }),
          (ae = function () {
            return { w: r, m: d };
          })()
        );
      }
      function ce(e, t, n, i) {
        var s = Object.defineProperty;
        try {
          s({}, '', {});
        } catch (e) {
          s = 0;
        }
        ((ce = function (e, t, n, i) {
          function r(t, n) {
            ce(e, t, function (e) {
              return this._invoke(t, n, e);
            });
          }
          t
            ? s
              ? s(e, t, { value: n, enumerable: !i, configurable: !i, writable: !i })
              : (e[t] = n)
            : (r('next', 0), r('throw', 1), r('return', 2));
        }),
          ce(e, t, n, i));
      }
      function le(e, t, n, i, s, r, o) {
        try {
          var a = e[r](o),
            c = a.value;
        } catch (e) {
          return void n(e);
        }
        a.done ? t(c) : Promise.resolve(c).then(i, s);
      }
      function ue(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (i, s) {
            var r = e.apply(t, n);
            function o(e) {
              le(r, i, s, o, a, 'next', e);
            }
            function a(e) {
              le(r, i, s, o, a, 'throw', e);
            }
            o(void 0);
          });
        };
      }
      var he = (function () {
          var e = ue(
            ae().m(function e() {
              var t, i;
              return ae().w(function (e) {
                for (;;)
                  switch (e.n) {
                    case 0:
                      if (H) {
                        e.n = 2;
                        break;
                      }
                      return (
                        (t = new Date().getTime()),
                        (e.n = 1),
                        n(8)('./task-controller.js?v='.concat(t))
                      );
                    case 1:
                      ((i = e.v), (H = i.taskController));
                    case 2:
                      return e.a(2, H);
                  }
              }, e);
            })
          );
          return function () {
            return e.apply(this, arguments);
          };
        })(),
        de = (function () {
          return (
            (e = function e() {
              (!(function (e, t) {
                if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
              })(this, e),
                (this.state = {
                  currentMode: null,
                  currentScreen: 'disclaimer',
                  assessmentTrack: null,
                  currentQuestionIndex: 0,
                  responses: [],
                  startTime: null,
                  sessionId: this.generateSessionId(),
                  isPaused: !1,
                  theme: 'system',
                  taskMode: 'hybrid',
                  consentGiven: !1,
                  neurodiversityData: {
                    adhd_indicators: [],
                    autism_indicators: [],
                    dyslexia_indicators: [],
                    sensory_profile: {},
                    executive_function: {}
                  }
                }),
                (this.questions = []),
                (this.currentTask = null),
                (this.autoSaveInterval = null),
                (this.reportGenerator = new d()),
                (this.taskController = null),
                (this.behavioralTracker = S),
                (this.emergencyProtocols = B),
                this.init());
            }),
            (t = [
              {
                key: 'init',
                value: function () {
                  (this.initTheme(),
                    this.loadSavedState(),
                    this.setupDisclaimerListeners(),
                    this.setupEventListeners(),
                    this.setupKeyboardShortcuts(),
                    this.loadQuestions(),
                    this.checkForSavedProgress(),
                    this.initServiceWorker());
                }
              },
              {
                key: 'setupDisclaimerListeners',
                value: function () {
                  var e = this,
                    t = document.getElementById('consent-check'),
                    n = document.getElementById('age-check'),
                    i = document.getElementById('accept-disclaimer'),
                    s = document.querySelectorAll('.selector-tab'),
                    r = document.getElementById('selected-description');
                  if (
                    (s.length > 0 &&
                      (s.forEach(function (t) {
                        t.addEventListener('click', function () {
                          (s.forEach(function (e) {
                            return e.classList.remove('active');
                          }),
                            t.classList.add('active'));
                          var n = t.dataset.plan;
                          'free' === n
                            ? ((r.textContent =
                                'Get your basic personality profile with key traits - completely free'),
                              (i.textContent = 'Start Free Assessment'),
                              (e.state.assessmentPlan = 'free'))
                            : 'premium' === n &&
                              ((r.textContent =
                                'Complete neurodiversity screening with detailed analysis and downloadable report'),
                              (i.textContent = 'Start In-Depth Analysis - £1.99'),
                              (e.state.assessmentPlan = 'premium'));
                        });
                      }),
                      (this.state.assessmentPlan = 'free')),
                    t && n && i)
                  ) {
                    var o = function () {
                      i.disabled = !(t.checked && n.checked);
                    };
                    (t.addEventListener('change', o),
                      n.addEventListener('change', o),
                      i.addEventListener('click', function () {
                        ((e.state.consentGiven = !0),
                          'premium' === e.state.assessmentPlan &&
// console.log('Premium assessment selected - would trigger payment flow'),
                          e.showScreen('welcome'));
                      }));
                  }
                }
              },
              {
                key: 'initTheme',
                value: function () {
                  var e = this,
                    t = localStorage.getItem('neurlyn-theme') || 'system';
                  ((this.state.theme = t),
                    'system' === t
                      ? document.documentElement.removeAttribute('data-theme')
                      : document.documentElement.setAttribute('data-theme', t));
                  var n = document.getElementById('theme-toggle');
                  n &&
                    n.addEventListener('click', function () {
                      return e.toggleTheme();
                    });
                }
              },
              {
                key: 'toggleTheme',
                value: function () {
                  var e =
                    'dark' === document.documentElement.getAttribute('data-theme')
                      ? 'light'
                      : 'dark';
                  (document.documentElement.setAttribute('data-theme', e),
                    localStorage.setItem('neurlyn-theme', e),
                    (this.state.theme = e),
                    (document.body.style.transition = 'background-color 0.3s ease'),
                    setTimeout(function () {
                      document.body.style.transition = '';
                    }, 300));
                }
              },
              {
                key: 'setupEventListeners',
                value: function () {
                  var e = this;
                  (document.querySelectorAll('.track-option').forEach(function (t) {
                    t.addEventListener('click', function () {
                      e.selectTrack(t.dataset.track);
                    });
                  }),
                    document.querySelectorAll('.mode-option').forEach(function (t) {
                      t.addEventListener('click', function () {
                        e.selectMode(t.dataset.mode);
                      });
                    }));
                  var t = document.getElementById('start-assessment');
                  t &&
                    t.addEventListener('click', function () {
                      return e.startAssessment();
                    });
                  var n = document.getElementById('prev-button'),
                    i = document.getElementById('next-button'),
                    s = document.getElementById('skip-button');
                  (n &&
                    n.addEventListener('click', function () {
                      return e.navigateQuestion(-1);
                    }),
                    i &&
                      i.addEventListener('click', function () {
                        return e.navigateQuestion(1);
                      }),
                    s &&
                      s.addEventListener('click', function () {
                        return e.skipQuestion();
                      }));
                  var r = document.getElementById('download-results'),
                    o = document.getElementById('share-results'),
                    a = document.getElementById('retake-assessment');
                  (r &&
                    r.addEventListener('click', function () {
                      return e.downloadResults();
                    }),
                    o &&
                      o.addEventListener('click', function () {
                        return e.shareResults();
                      }),
                    a &&
                      a.addEventListener('click', function () {
                        return e.retakeAssessment();
                      }));
                }
              },
              {
                key: 'selectTrack',
                value: function (e) {
                  ((this.state.assessmentTrack = e),
                    document.querySelectorAll('.track-option').forEach(function (t) {
                      (t.classList.remove('selected'),
                        t.dataset.track === e && t.classList.add('selected'));
                    }));
                  var t = document.querySelector('.mode-selection');
                  if (t) {
                    var n = t.querySelector('h3');
                    'neurodiversity' === e
                      ? ((n.textContent = 'Select Assessment Depth'),
                        this.updateModeDescriptionsForNeurodiversity())
                      : (n.textContent =
                          'comprehensive' === e
                            ? 'Select Comprehensive Assessment'
                            : 'Select Assessment Type');
                  }
                  this.showToast(
                    'Selected: '.concat(e.charAt(0).toUpperCase() + e.slice(1), ' Assessment'),
                    'info'
                  );
                }
              },
              {
                key: 'updateModeDescriptionsForNeurodiversity',
                value: function () {
                  var e = document.querySelectorAll('.mode-option'),
                    t = {
                      quick: 'Rapid screening<br>5-7 minutes',
                      standard: 'Comprehensive evaluation<br>15-20 minutes',
                      deep: 'Complete analysis<br>25-30 minutes'
                    };
                  e.forEach(function (e) {
                    var n = e.dataset.mode,
                      i = e.querySelector('p');
                    i && t[n] && (i.innerHTML = t[n]);
                  });
                }
              },
              {
                key: 'updateExpectedDuration',
                value: function (e) {
                  var t = document.getElementById('expected-duration');
                  t &&
                    (t.textContent = {
                      quick: '5-7 minutes',
                      standard: '15-20 minutes',
                      deep: '25-30 minutes'
                    }[e]);
                }
              },
              {
                key: 'loadQuestions',
                value: function () {
                  this.questions = [];
                }
              },
              {
                key: 'selectMode',
                value: function (e) {
                  ((this.state.currentMode = e),
                    document.querySelectorAll('.mode-option').forEach(function (t) {
                      (t.classList.remove('selected', 'selecting'),
                        t.dataset.mode === e &&
                          (t.classList.add('selecting'),
                          setTimeout(function () {
                            (t.classList.remove('selecting'), t.classList.add('selected'));
                          }, 150)));
                    }),
                    this.showTaskTypeSelector());
                  var t = document.getElementById('start-assessment');
                  if (t) {
                    ((t.disabled = !1), t.classList.add('pulse'));
                    var n = e.charAt(0).toUpperCase() + e.slice(1);
                    ((t.textContent = 'Begin '.concat(n, ' Assessment')),
                      setTimeout(function () {
                        return t.classList.remove('pulse');
                      }, 600));
                  }
                  this.updateExpectedDuration(e);
                }
              },
              {
                key: 'showTaskTypeSelector',
                value: function () {
                  var e = this,
                    t = document.getElementById('task-type-selector');
                  t && t.remove();
                  var n = document.createElement('div');
                  ((n.id = 'task-type-selector'),
                    (n.className = 'task-type-selector'),
                    (n.innerHTML =
                      '\n            <h4>Assessment Style</h4>\n            <div class="task-type-options">\n                <label class="task-type-option">\n                    <input type="radio" name="taskType" value="traditional" />\n                    <span class="option-content">\n                        <span class="option-title">Traditional</span>\n                        <span class="option-desc">Standard questionnaire</span>\n                    </span>\n                </label>\n                <label class="task-type-option">\n                    <input type="radio" name="taskType" value="gamified" />\n                    <span class="option-content">\n                        <span class="option-title">Interactive</span>\n                        <span class="option-desc">Games & activities</span>\n                    </span>\n                </label>\n                <label class="task-type-option">\n                    <input type="radio" name="taskType" value="lateral" />\n                    <span class="option-content">\n                        <span class="option-title">Lateral</span>\n                        <span class="option-desc">Creative scenarios</span>\n                    </span>\n                </label>\n                <label class="task-type-option">\n                    <input type="radio" name="taskType" value="hybrid" checked />\n                    <span class="option-content">\n                        <span class="option-title">Hybrid</span>\n                        <span class="option-desc">Mixed approach</span>\n                    </span>\n                </label>\n            </div>\n                <label class="task-type-option">\n                    <input type="radio" name="taskMode" value="traditional" '
                        .concat(
                          'traditional' === this.state.taskMode ? 'checked' : '',
                          '>\n                    <span class="option-label">\n                        <strong>Traditional</strong>\n                        <small>Classic questionnaire format</small>\n                    </span>\n                </label>\n                <label class="task-type-option">\n                    <input type="radio" name="taskMode" value="gamified" '
                        )
                        .concat(
                          'gamified' === this.state.taskMode ? 'checked' : '',
                          '>\n                    <span class="option-label">\n                        <strong>Gamified</strong>\n                        <small>Interactive games & tasks</small>\n                    </span>\n                </label>\n                <label class="task-type-option">\n                    <input type="radio" name="taskMode" value="hybrid" '
                        )
                        .concat(
                          'hybrid' === this.state.taskMode ? 'checked' : '',
                          '>\n                    <span class="option-label">\n                        <strong>Hybrid</strong>\n                        <small>Mix of questions & games</small>\n                    </span>\n                </label>\n            </div>\n        '
                        )));
                  var i = document.querySelector('.mode-selection');
                  (i && i.appendChild(n),
                    n.querySelectorAll('input[name="taskType"]').forEach(function (t) {
                      t.addEventListener('change', function (t) {
                        ((e.state.taskMode = t.target.value),
                          e.showToast('Assessment style: '.concat(t.target.value), 'info'));
                      });
                    }));
                }
              },
              {
                key: 'generateEnhancedQuestions',
                value: function () {
                  var e = this,
                    t = {
                      quick: {
                        questionCount: 7,
                        gamifiedTasks: ['risk-balloon'],
                        traditionalCount: 6
                      },
                      standard: {
                        questionCount: 15,
                        gamifiedTasks: ['risk-balloon', 'word-association', 'visual-attention'],
                        traditionalCount: 12
                      },
                      deep: {
                        questionCount: 30,
                        gamifiedTasks: [
                          'risk-balloon',
                          'word-association',
                          'visual-attention',
                          'microexpression',
                          'iowa-gambling',
                          'card-sorting'
                        ],
                        traditionalCount: 24
                      }
                    },
                    n = t[this.state.currentMode] || t.standard,
                    i = [];
                  if ('traditional' === this.state.taskMode)
                    i.push.apply(i, ne(this.generateLikertQuestions(n.questionCount)));
                  else if ('gamified' === this.state.taskMode)
                    (i.push.apply(i, ne(this.generateGamifiedTasks(n.gamifiedTasks))),
                      i.length < n.questionCount &&
                        i.push.apply(
                          i,
                          ne(this.generateLikertQuestions(n.questionCount - i.length))
                        ));
                  else if ('lateral' === this.state.taskMode) {
                    var s = L(n.questionCount);
                    i.push.apply(
                      i,
                      ne(
                        s.map(function (t) {
                          return e.createLateralQuestion(t);
                        })
                      )
                    );
                  } else {
                    var r = n.questionCount,
                      o = n.gamifiedTasks.length,
                      a = Math.floor(0.3 * r),
                      c = r - o - a;
                    i.push.apply(i, ne(this.generateGamifiedTasks(n.gamifiedTasks)));
                    var l = L(a);
                    (i.push.apply(
                      i,
                      ne(
                        l.map(function (t) {
                          return e.createLateralQuestion(t);
                        })
                      )
                    ),
                      c > 0 && i.push.apply(i, ne(this.generateLikertQuestions(c))),
                      i.sort(function () {
                        return Math.random() - 0.5;
                      }));
                  }
                  return i;
                }
              },
              {
                key: 'generateGamifiedTasks',
                value: function (e) {
                  var t = this;
                  return e.map(function (e) {
                    return t.createGamifiedTask(e);
                  });
                }
              },
              {
                key: 'createGamifiedTask',
                value: function (e) {
                  return (
                    {
                      'risk-balloon': {
                        type: 'risk-balloon',
                        question: 'Balloon Risk Game',
                        instructions:
                          'Pump the balloon to earn money, but be careful - it might pop! Press SPACE to pump, ENTER to collect.',
                        category: 'Risk Taking',
                        timeLimit: 12e4,
                        balloons: 5
                      },
                      'word-association': {
                        type: 'word-association',
                        question: 'Word Association',
                        instructions:
                          'Type the first word that comes to mind for each prompt. Be spontaneous!',
                        category: 'Cognitive Processing',
                        timeLimit: 9e4,
                        words: [
                          'home',
                          'mother',
                          'success',
                          'fear',
                          'love',
                          'work',
                          'future',
                          'past'
                        ]
                      },
                      'visual-attention': {
                        type: 'visual-attention',
                        question: 'Visual Attention Task',
                        instructions: 'Track the moving dots and click on them as they appear.',
                        category: 'Attention',
                        timeLimit: 12e4
                      },
                      microexpression: {
                        type: 'microexpression',
                        question: 'Emotion Recognition',
                        instructions: 'Identify the emotion shown in each brief facial expression.',
                        category: 'Emotional Intelligence',
                        timeLimit: 9e4
                      },
                      'iowa-gambling': {
                        type: 'iowa-gambling',
                        question: 'Card Selection Game',
                        instructions:
                          'Select cards from different decks to maximize your winnings.',
                        category: 'Decision Making',
                        timeLimit: 24e4
                      },
                      'card-sorting': {
                        type: 'card-sorting',
                        question: 'Pattern Matching',
                        instructions:
                          'Sort cards according to changing rules. Figure out the pattern!',
                        category: 'Cognitive Flexibility',
                        timeLimit: 18e4
                      }
                    }[e] || this.createLikertQuestion(0)
                  );
                }
              },
              {
                key: 'generateLikertQuestions',
                value: function (e) {
                  return X(e).map(function (e, t) {
                    return {
                      type: 'likert',
                      question: e.text,
                      category: e.category,
                      reversed: e.reversed || !1,
                      scale: 5
                    };
                  });
                }
              },
              {
                key: 'checkForSavedProgress',
                value: function () {
                  var e = this.loadSavedState();
                  e && 'question' === e.currentScreen && this.showResumeDialog(e);
                }
              },
              {
                key: 'initServiceWorker',
                value: function () {
                  'serviceWorker' in navigator &&
                    navigator.serviceWorker
                      .register('sw.js')
                      .then(function () {
                        return console.log('Service Worker registered');
                      })
                      .catch(function (e) {
                        return console.error('Service Worker registration failed:', e);
                      });
                }
              },
              {
                key: 'loadSavedState',
                value: function () {
                  try {
                    var e = localStorage.getItem('neurlyn-assessment');
                    if (e) {
                      var t = JSON.parse(e);
                      if (Date.now() - t.timestamp < 864e5) return t;
                    }
                  } catch (e) {
                    console.error('Failed to load saved state:', e);
                  }
                  return null;
                }
              },
              {
                key: 'setupKeyboardShortcuts',
                value: function () {
                  var e = this;
                  document.addEventListener('keydown', function (t) {
                    if ('question' === e.state.currentScreen)
                      switch (t.key) {
                        case 'ArrowLeft':
                          e.navigateQuestion(-1);
                          break;
                        case 'ArrowRight':
                        case 'Enter':
                          document.getElementById('next-button').disabled || e.navigateQuestion(1);
                          break;
                        case '1':
                        case '2':
                        case '3':
                        case '4':
                        case '5':
                          var n = document.querySelectorAll('.likert-option'),
                            i = parseInt(t.key) - 1;
                          n[i] && n[i].click();
                      }
                  });
                }
              },
              {
                key: 'saveProgress',
                value: function () {
                  var e = {
                    sessionId: this.state.sessionId,
                    currentQuestionIndex: this.state.currentQuestionIndex,
                    responses: this.state.responses,
                    timestamp: Date.now()
                  };
                  (localStorage.setItem('neurlyn-progress', JSON.stringify(e)),
                    this.showToast('Progress saved', 'success'));
                }
              },
              {
                key: 'togglePause',
                value: function () {
                  ((this.state.isPaused = !this.state.isPaused),
                    this.state.isPaused
                      ? this.showToast('Assessment paused', 'info')
                      : this.showToast('Assessment resumed', 'info'));
                }
              },
              {
                key: 'showToast',
                value: function (e) {
                  var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'info',
                    n = document.createElement('div');
                  ((n.className = 'toast toast-'.concat(t)),
                    (n.textContent = e),
                    document.body.appendChild(n),
                    setTimeout(function () {
                      n.classList.add('show');
                    }, 10),
                    setTimeout(function () {
                      (n.classList.remove('show'),
                        setTimeout(function () {
                          return n.remove();
                        }, 300));
                    }, 3e3));
                }
              },
              {
                key: 'showScreen',
                value: function (e) {
                  document.querySelectorAll('.screen').forEach(function (e) {
                    e.classList.add('hidden');
                  });
                  var t = document.getElementById(''.concat(e, '-screen'));
                  t &&
                    (t.classList.remove('hidden'),
                    t.classList.add('active'),
                    (this.state.currentScreen = e));
                }
              },
              {
                key: 'generateSessionId',
                value: function () {
                  return 'session_'
                    .concat(Date.now(), '_')
                    .concat(Math.random().toString(36).substr(2, 9));
                }
              },
              {
                key: 'createLateralQuestion',
                value: function (e) {
                  return {
                    type: 'lateral',
                    id: e.id,
                    question: e.text,
                    options: e.options,
                    category: 'Lateral Thinking',
                    measures: e.measures
                  };
                }
              },
              {
                key: 'createLikertQuestion',
                value: function (e) {
                  var t = X(30),
                    n = t[e % t.length];
                  return {
                    type: 'likert',
                    question: n.text,
                    category: n.category,
                    reversed: n.reversed || !1,
                    scale: 5
                  };
                }
              },
              {
                key: 'startAssessment',
                value:
                  ((o = ue(
                    ae().m(function e() {
                      return ae().w(
                        function (e) {
                          for (;;)
                            switch (e.n) {
                              case 0:
                                if (this.state.currentMode) {
                                  e.n = 1;
                                  break;
                                }
                                return (
                                  this.showToast('Please select an assessment mode', 'error'),
                                  e.a(2)
                                );
                              case 1:
                                return (
                                  (this.state.startTime = Date.now()),
                                  (this.state.currentQuestionIndex = 0),
                                  (this.state.responses = []),
                                  (this.questions = this.generateEnhancedQuestions()),
                                  this.behavioralTracker.start(),
                                  this.transitionToScreen('question'),
                                  (e.n = 2),
                                  this.displayQuestion()
                                );
                              case 2:
                                (this.startAutoSave(),
                                  this.showToast('Assessment started', 'success'));
                              case 3:
                                return e.a(2);
                            }
                        },
                        e,
                        this
                      );
                    })
                  )),
                  function () {
                    return o.apply(this, arguments);
                  })
              },
              {
                key: 'displayQuestion',
                value:
                  ((r = ue(
                    ae().m(function e() {
                      var t, n, i, s, r, o;
                      return ae().w(
                        function (e) {
                          for (;;)
                            switch ((e.p = e.n)) {
                              case 0:
                                if (
                                  ((i = this.questions[this.state.currentQuestionIndex]),
                                  (s = document.getElementById('question-content')))
                                ) {
                                  e.n = 1;
                                  break;
                                }
                                return e.a(2);
                              case 1:
                                if (this.taskController) {
                                  e.n = 3;
                                  break;
                                }
                                return ((e.n = 2), he());
                              case 2:
                                this.taskController = e.v;
                              case 3:
                                if (
                                  (console.log('📋 Displaying question:', {
                                    index: this.state.currentQuestionIndex,
                                    type: i.type,
                                    category: i.category,
                                    hasOptions: !!i.options,
                                    optionsCount:
                                      null === (t = i.options) || void 0 === t ? void 0 : t.length,
                                    questionText:
                                      (null === (n = i.question) || void 0 === n
                                        ? void 0
                                        : n.substring(0, 50)) + '...'
                                  }),
                                  this.currentTask &&
                                    (this.taskController.destroy(), (this.currentTask = null)),
                                  this.updateProgress(),
                                  (r = document.getElementById('question-category')) &&
                                    (r.textContent = i.category),
                                  (e.p = 4),
                                  'lateral' !== i.type)
                                ) {
                                  e.n = 6;
                                  break;
                                }
                                return (
// console.log('✅ Loading lateral task for question'),
                                  (e.n = 5),
                                  this.taskController.loadTask('lateral', i)
                                );
                              case 5:
                                ((this.currentTask = e.v), (e.n = 8));
                                break;
                              case 6:
                                return (
// console.log('Loading '.concat(i.type, ' task for question')),
                                  (e.n = 7),
                                  this.taskController.loadTask(i.type, i)
                                );
                              case 7:
                                this.currentTask = e.v;
                              case 8:
                                return ((e.n = 9), this.taskController.renderTask(s));
                              case 9:
                                ('likert' !== i.type &&
                                  'lateral' !== i.type &&
                                  this.setupGamifiedTaskCompletion(),
                                  (e.n = 12));
                                break;
                              case 10:
                                return (
                                  (e.p = 10),
                                  (o = e.v),
                                  console.error('Failed to load task:', o),
                                  (e.n = 11),
                                  this.taskController.loadTask('likert', i)
                                );
                              case 11:
                                return (
                                  (this.currentTask = e.v),
                                  (e.n = 12),
                                  this.taskController.renderTask(s)
                                );
                              case 12:
                                this.updateNavigationButtons();
                              case 13:
                                return e.a(2);
                            }
                        },
                        e,
                        this,
                        [[4, 10]]
                      );
                    })
                  )),
                  function () {
                    return r.apply(this, arguments);
                  })
              },
              {
                key: 'setupGamifiedTaskCompletion',
                value: function () {
                  var e = this,
                    t = setInterval(
                      ue(
                        ae().m(function n() {
                          var i;
                          return ae().w(function (n) {
                            for (;;)
                              switch (n.n) {
                                case 0:
                                  if (!e.currentTask || null === e.currentTask.response) {
                                    n.n = 4;
                                    break;
                                  }
                                  if ((clearInterval(t), e.taskController)) {
                                    n.n = 2;
                                    break;
                                  }
                                  return ((n.n = 1), he());
                                case 1:
                                  e.taskController = n.v;
                                case 2:
                                  return ((n.n = 3), e.taskController.getTaskResults());
                                case 3:
                                  ((i = n.v),
                                    e.state.responses.push({
                                      questionIndex: e.state.currentQuestionIndex,
                                      question: e.questions[e.state.currentQuestionIndex].question,
                                      category: e.questions[e.state.currentQuestionIndex].category,
                                      response: i,
                                      timestamp: Date.now(),
                                      taskType: e.questions[e.state.currentQuestionIndex].type
                                    }),
                                    setTimeout(function () {
                                      e.state.currentQuestionIndex < e.questions.length - 1
                                        ? e.navigateQuestion(1)
                                        : e.completeAssessment();
                                    }, 1500));
                                case 4:
                                  return n.a(2);
                              }
                          }, n);
                        })
                      ),
                      100
                    );
                }
              },
              {
                key: 'navigateQuestion',
                value:
                  ((s = ue(
                    ae().m(function e(t) {
                      var n;
                      return ae().w(
                        function (e) {
                          for (;;)
                            switch (e.n) {
                              case 0:
                                if (this.taskController) {
                                  e.n = 2;
                                  break;
                                }
                                return ((e.n = 1), he());
                              case 1:
                                this.taskController = e.v;
                              case 2:
                                if (!(t > 0 && this.currentTask)) {
                                  e.n = 5;
                                  break;
                                }
                                if (
                                  'likert' !== this.currentTask.type ||
                                  this.currentTask.response
                                ) {
                                  e.n = 3;
                                  break;
                                }
                                return (this.showToast('Please select an answer', 'error'), e.a(2));
                              case 3:
                                return ((e.n = 4), this.taskController.getTaskResults());
                              case 4:
                                ((n = e.v),
                                  this.state.responses.push({
                                    questionIndex: this.state.currentQuestionIndex,
                                    question:
                                      this.questions[this.state.currentQuestionIndex].question,
                                    category:
                                      this.questions[this.state.currentQuestionIndex].category,
                                    response: n,
                                    timestamp: Date.now(),
                                    taskType: this.questions[this.state.currentQuestionIndex].type
                                  }));
                              case 5:
                                if (
                                  ((this.state.currentQuestionIndex += t),
                                  !(this.state.currentQuestionIndex < 0))
                                ) {
                                  e.n = 6;
                                  break;
                                }
                                ((this.state.currentQuestionIndex = 0), (e.n = 7));
                                break;
                              case 6:
                                if (!(this.state.currentQuestionIndex >= this.questions.length)) {
                                  e.n = 7;
                                  break;
                                }
                                return (this.completeAssessment(), e.a(2));
                              case 7:
                                return ((e.n = 8), this.displayQuestion());
                              case 8:
                                this.saveState();
                              case 9:
                                return e.a(2);
                            }
                        },
                        e,
                        this
                      );
                    })
                  )),
                  function (e) {
                    return s.apply(this, arguments);
                  })
              },
              {
                key: 'completeAssessment',
                value:
                  ((i = ue(
                    ae().m(function e() {
                      var t, n;
                      return ae().w(
                        function (e) {
                          for (;;)
                            switch (e.n) {
                              case 0:
                                if (this.taskController) {
                                  e.n = 2;
                                  break;
                                }
                                return ((e.n = 1), he());
                              case 1:
                                this.taskController = e.v;
                              case 2:
                                return (
                                  this.behavioralTracker.stop(),
                                  (t = this.behavioralTracker.getData()),
                                  this.currentTask && this.taskController.destroy(),
                                  this.stopAutoSave(),
                                  (this.state.currentScreen = 'results'),
                                  (e.n = 3),
                                  this.calculateEnhancedResults(t)
                                );
                              case 3:
                                ((n = e.v),
                                  this.transitionToScreen('results'),
                                  this.displayResults(n),
                                  this.clearSavedState(),
                                  this.saveResultsToHistory(n));
                              case 4:
                                return e.a(2);
                            }
                        },
                        e,
                        this
                      );
                    })
                  )),
                  function () {
                    return i.apply(this, arguments);
                  })
              },
              {
                key: 'calculateEnhancedResults',
                value:
                  ((n = ue(
                    ae().m(function e(t) {
                      var n, i, s, r, o, a, c;
                      return ae().w(
                        function (e) {
                          for (;;)
                            switch (e.n) {
                              case 0:
                                return (
                                  (n = this.state.responses.filter(function (e) {
                                    return 'likert' === e.taskType;
                                  })),
                                  (i = this.state.responses.filter(function (e) {
                                    return 'likert' !== e.taskType;
                                  })),
                                  (s = this.calculateTraits(n)),
                                  (r = this.analyzeGamifiedTasks(i)),
                                  (o = t.patterns),
                                  (a = this.integrateAssessmentData(s, r, o)),
                                  (e.n = 1),
                                  this.reportGenerator.generateReport({
                                    mode: this.state.currentMode,
                                    traits: a.traits,
                                    responses: this.state.responses,
                                    gamifiedMetrics: r,
                                    behavioralMetrics: t.metrics,
                                    behavioralPatterns: o,
                                    duration: Date.now() - this.state.startTime
                                  })
                                );
                              case 1:
                                return (
                                  (c = e.v),
                                  e.a(
                                    2,
                                    ee(
                                      ee({}, c),
                                      {},
                                      {
                                        behavioralInsights: this.generateBehavioralInsights(t),
                                        gamifiedInsights: this.generateGamifiedInsights(i)
                                      }
                                    )
                                  )
                                );
                            }
                        },
                        e,
                        this
                      );
                    })
                  )),
                  function (e) {
                    return n.apply(this, arguments);
                  })
              },
              {
                key: 'analyzeGamifiedTasks',
                value: function (e) {
                  var t = {};
                  return (
                    e.forEach(function (e) {
                      var n, i, s;
                      'risk-balloon' === e.response.taskType &&
                        ((t.riskTolerance =
                          (null === (n = e.response.riskMetrics) || void 0 === n
                            ? void 0
                            : n.riskTolerance) || 0),
                        (t.learningAbility =
                          (null === (i = e.response.riskMetrics) || void 0 === i
                            ? void 0
                            : i.learningCurve) || 0),
                        (t.consistency =
                          (null === (s = e.response.riskMetrics) || void 0 === s
                            ? void 0
                            : s.consistency) || 0));
                    }),
                    t
                  );
                }
              },
              {
                key: 'integrateAssessmentData',
                value: function (e, t, n) {
                  var i = { traditional: 0.4, gamified: 0.35, behavioral: 0.25 },
                    s = ee({}, e);
                  return (
                    n.engagement &&
                      (s.openness =
                        e.openness * i.traditional +
                        100 * n.engagement.score * i.behavioral +
                        100 * (t.learningAbility || 0) * i.gamified),
                    n.precision &&
                      (s.conscientiousness =
                        e.conscientiousness * i.traditional +
                        100 * n.precision.score * i.behavioral +
                        100 * (t.consistency || 0) * i.gamified),
                    n.anxiety &&
                      (s.neuroticism =
                        e.neuroticism * i.traditional + 100 * n.anxiety.score * i.behavioral),
                    { traits: s, confidence: this.calculateConfidence(i) }
                  );
                }
              },
              {
                key: 'generateBehavioralInsights',
                value: function (e) {
                  var t,
                    n,
                    i,
                    s = [],
                    r = e.patterns;
                  return (
                    (null === (t = r.impulsivity) || void 0 === t ? void 0 : t.score) > 0.6 &&
                      s.push({
                        type: 'impulsivity',
                        title: 'Quick Decision Maker',
                        description:
                          'Your interaction patterns suggest you make decisions quickly and spontaneously.',
                        score: r.impulsivity.score
                      }),
                    (null === (n = r.precision) || void 0 === n ? void 0 : n.score) > 0.7 &&
                      s.push({
                        type: 'precision',
                        title: 'Detail Oriented',
                        description:
                          'Your careful movements and low error rate indicate strong attention to detail.',
                        score: r.precision.score
                      }),
                    (null === (i = r.anxiety) || void 0 === i ? void 0 : i.score) > 0.5 &&
                      s.push({
                        type: 'anxiety',
                        title: 'Thoughtful Consideration',
                        description:
                          'You take time to consider your responses carefully before committing.',
                        score: r.anxiety.score
                      }),
                    s
                  );
                }
              },
              {
                key: 'generateGamifiedInsights',
                value: function (e) {
                  var t = [];
                  return (
                    e.forEach(function (e) {
                      if ('risk-balloon' === e.response.taskType && e.response.riskMetrics) {
                        var n = e.response.riskMetrics;
                        (n.riskTolerance > 0.6 &&
                          t.push({
                            type: 'risk-taking',
                            title: 'Calculated Risk Taker',
                            description: 'You demonstrated a '.concat(
                              (100 * n.riskTolerance).toFixed(0),
                              '% risk tolerance level.'
                            ),
                            metrics: n
                          }),
                          n.learningCurve > 0 &&
                            t.push({
                              type: 'adaptive-learning',
                              title: 'Quick Learner',
                              description:
                                'You showed improvement throughout the task, adapting your strategy.',
                              metrics: n
                            }));
                      }
                    }),
                    t
                  );
                }
              },
              {
                key: 'calculateConfidence',
                value: function (e) {
                  var t = (this.state.responses.length / this.questions.length) * 0.5;
                  return (
                    this.state.responses.some(function (e) {
                      return 'likert' !== e.taskType;
                    }) && (t += 0.25),
                    this.behavioralTracker.getData().metrics.totalDuration > 0 && (t += 0.25),
                    Math.min(t, 1)
                  );
                }
              },
              {
                key: 'displayResults',
                value: function (e) {
                  var t,
                    n,
                    i = document.getElementById('results-content');
                  i &&
                    ((i.innerHTML =
                      '\n            <div class="results-summary">\n                <h3>Your Personality Profile</h3>\n                <div class="confidence-indicator">\n                    <span>Assessment Confidence: '
                        .concat(
                          (100 * e.confidence).toFixed(0),
                          '%</span>\n                    <div class="confidence-bar">\n                        <div class="confidence-fill" style="width: '
                        )
                        .concat(
                          100 * e.confidence,
                          '%"></div>\n                    </div>\n                </div>\n            </div>\n            \n            <div class="trait-results">\n                '
                        )
                        .concat(
                          this.renderTraitResults(e.traits),
                          '\n            </div>\n            \n            '
                        )
                        .concat(
                          (null === (t = e.behavioralInsights) || void 0 === t
                            ? void 0
                            : t.length) > 0
                            ? '\n                <div class="behavioral-insights">\n                    <h4>Behavioral Insights</h4>\n                    '.concat(
                                e.behavioralInsights
                                  .map(function (e) {
                                    return '\n                        <div class="insight-card">\n                            <h5>'
                                      .concat(e.title, '</h5>\n                            <p>')
                                      .concat(
                                        e.description,
                                        '</p>\n                        </div>\n                    '
                                      );
                                  })
                                  .join(''),
                                '\n                </div>\n            '
                              )
                            : '',
                          '\n            \n            '
                        )
                        .concat(
                          (null === (n = e.gamifiedInsights) || void 0 === n ? void 0 : n.length) >
                            0
                            ? '\n                <div class="gamified-insights">\n                    <h4>Task Performance Insights</h4>\n                    '.concat(
                                e.gamifiedInsights
                                  .map(function (e) {
                                    return '\n                        <div class="insight-card">\n                            <h5>'
                                      .concat(e.title, '</h5>\n                            <p>')
                                      .concat(
                                        e.description,
                                        '</p>\n                        </div>\n                    '
                                      );
                                  })
                                  .join(''),
                                '\n                </div>\n            '
                              )
                            : '',
                          '\n            \n            <div class="archetype-section">\n                <h4>Your Personality Archetype</h4>\n                <div class="archetype-card">\n                    <h5>'
                        )
                        .concat(e.archetype.name, '</h5>\n                    <p>')
                        .concat(
                          e.archetype.description,
                          '</p>\n                </div>\n            </div>\n            \n            <div class="recommendations-section">\n                <h4>Personalized Recommendations</h4>\n                '
                        )
                        .concat(
                          e.recommendations
                            .map(function (e) {
                              return '\n                    <div class="recommendation-card">\n                        <strong>'
                                .concat(e.area, ':</strong> ')
                                .concat(
                                  e.suggestion,
                                  '\n                    </div>\n                '
                                );
                            })
                            .join(''),
                          '\n            </div>\n        '
                        )),
                    this.addResultsInteractivity(e));
                }
              },
              {
                key: 'renderTraitResults',
                value: function (e) {
                  var t = this;
                  return Object.entries(e)
                    .map(function (e) {
                      var n = (function (e, t) {
                          return (
                            (function (e) {
                              if (Array.isArray(e)) return e;
                            })(e) ||
                            (function (e, t) {
                              var n =
                                null == e
                                  ? null
                                  : ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
                                    e['@@iterator'];
                              if (null != n) {
                                var i,
                                  s,
                                  r,
                                  o,
                                  a = [],
                                  c = !0,
                                  l = !1;
                                try {
                                  if (((r = (n = n.call(e)).next), 0 === t)) {
                                    if (Object(n) !== n) return;
                                    c = !1;
                                  } else
                                    for (
                                      ;
                                      !(c = (i = r.call(n)).done) &&
                                      (a.push(i.value), a.length !== t);
                                      c = !0
                                    );
                                } catch (e) {
                                  ((l = !0), (s = e));
                                } finally {
                                  try {
                                    if (
                                      !c &&
                                      null != n.return &&
                                      ((o = n.return()), Object(o) !== o)
                                    )
                                      return;
                                  } finally {
                                    if (l) throw s;
                                  }
                                }
                                return a;
                              }
                            })(e, t) ||
                            ie(e, t) ||
                            (function () {
                              throw new TypeError(
                                'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                              );
                            })()
                          );
                        })(e, 2),
                        i = n[0],
                        s = n[1];
                      return '\n            <div class="trait-item">\n                <div class="trait-header">\n                    <span class="trait-name">'
                        .concat(
                          i.charAt(0).toUpperCase() + i.slice(1),
                          '</span>\n                    <span class="trait-score">'
                        )
                        .concat(
                          s.toFixed(0),
                          '%</span>\n                </div>\n                <div class="trait-bar">\n                    <div class="trait-fill" style="width: '
                        )
                        .concat(s, '%; background: ')
                        .concat(
                          t.getTraitColor(i),
                          ';"></div>\n                </div>\n            </div>\n        '
                        );
                    })
                    .join('');
                }
              },
              {
                key: 'getTraitColor',
                value: function (e) {
                  return (
                    {
                      openness: '#4ECDC4',
                      conscientiousness: '#96E6B3',
                      extraversion: '#F7DC6F',
                      agreeableness: '#45B7D1',
                      neuroticism: '#FF6B6B'
                    }[e] || '#6C9E83'
                  );
                }
              },
              {
                key: 'addResultsInteractivity',
                value: function (e) {
                  (document.querySelectorAll('.insight-card').forEach(function (e) {
                    (e.addEventListener('mouseenter', function () {
                      ((e.style.transform = 'translateY(-2px)'),
                        (e.style.boxShadow = 'var(--shadow-lg)'));
                    }),
                      e.addEventListener('mouseleave', function () {
                        ((e.style.transform = 'translateY(0)'),
                          (e.style.boxShadow = 'var(--shadow-md)'));
                      }));
                  }),
                    document.querySelectorAll('.recommendation-card').forEach(function (e) {
                      ((e.style.cursor = 'pointer'),
                        e.addEventListener('click', function () {
                          e.classList.toggle('expanded');
                        }));
                    }));
                }
              },
              {
                key: 'calculateTraits',
                value: function (e) {
                  var t = {
                    openness: 50,
                    conscientiousness: 50,
                    extraversion: 50,
                    agreeableness: 50,
                    neuroticism: 50
                  };
                  return (
                    0 === e.length ||
                      e.forEach(function (e) {
                        var n,
                          i =
                            ((((null === (n = e.response) ||
                            void 0 === n ||
                            null === (n = n.response) ||
                            void 0 === n
                              ? void 0
                              : n.value) || 3) -
                              1) /
                              4) *
                            100,
                          s = e.category.toLowerCase();
                        void 0 !== t[s] && (t[s] = (t[s] + i) / 2);
                      }),
                    t
                  );
                }
              },
              {
                key: 'updateProgress',
                value: function () {
                  var e = ((this.state.currentQuestionIndex + 1) / this.questions.length) * 100,
                    t = document.getElementById('progress-fill'),
                    n = document.getElementById('progress-percent'),
                    i = document.getElementById('question-num'),
                    s = document.getElementById('total-questions'),
                    r = document.getElementById('breadcrumb-question');
                  (t && (t.style.width = ''.concat(e, '%')),
                    n && (n.textContent = ''.concat(Math.round(e), '%')),
                    i && (i.textContent = this.state.currentQuestionIndex + 1),
                    s && (s.textContent = this.questions.length),
                    r && (r.textContent = this.state.currentQuestionIndex + 1));
                }
              },
              {
                key: 'updateNavigationButtons',
                value: function () {
                  var e = document.getElementById('prev-button'),
                    t = document.getElementById('next-button');
                  if ((e && (e.disabled = 0 === this.state.currentQuestionIndex), t)) {
                    var n = this.state.currentQuestionIndex === this.questions.length - 1;
                    ((t.textContent = n ? 'Complete' : 'Next'),
                      this.currentTask && 'likert' !== this.currentTask.type
                        ? (t.disabled = !0)
                        : (t.disabled = !1));
                  }
                }
              },
              {
                key: 'transitionToScreen',
                value: function (e) {
                  document.querySelectorAll('.screen').forEach(function (e) {
                    e.classList.add('hidden');
                  });
                  var t = document.getElementById(''.concat(e, '-screen'));
                  (t && t.classList.remove('hidden'), (this.state.currentScreen = e));
                }
              },
              {
                key: 'saveState',
                value: function () {
                  var e = ee(
                    ee({}, this.state),
                    {},
                    { questions: this.questions, timestamp: Date.now() }
                  );
                  try {
                    (localStorage.setItem('neurlyn-assessment', JSON.stringify(e)),
                      this.showToast('Progress saved', 'success'));
                  } catch (e) {
                    console.error('Failed to save state:', e);
                  }
                }
              },
              {
                key: 'clearSavedState',
                value: function () {
                  localStorage.removeItem('neurlyn-assessment');
                }
              },
              {
                key: 'showResumeDialog',
                value: function (e) {
                  var t = this,
                    n = document.createElement('div');
                  ((n.className = 'resume-dialog'),
                    (n.innerHTML =
                      '\n            <div class="dialog-content">\n                <h3>Resume Assessment?</h3>\n                <p>You have an assessment in progress.</p>\n                <p>Progress: Question '.concat(
                        e.currentQuestionIndex + 1,
                        '</p>\n                <div class="dialog-actions">\n                    <button class="btn btn-primary" id="resume-yes">Resume</button>\n                    <button class="btn btn-secondary" id="resume-no">Start New</button>\n                </div>\n            </div>\n        '
                      )),
                    document.body.appendChild(n),
                    document.getElementById('resume-yes').addEventListener('click', function () {
                      (t.resumeAssessment(e), n.remove());
                    }),
                    document.getElementById('resume-no').addEventListener('click', function () {
                      (t.clearSavedState(), n.remove());
                    }));
                }
              },
              {
                key: 'resumeAssessment',
                value: function (e) {
                  ((this.state = e),
                    (this.questions = e.questions),
                    this.transitionToScreen('question'),
                    this.displayQuestion(),
                    this.startAutoSave(),
                    this.showToast('Assessment resumed', 'info'));
                }
              },
              {
                key: 'startAutoSave',
                value: function () {
                  var e = this;
                  this.autoSaveInterval = setInterval(function () {
                    'question' === e.state.currentScreen && e.saveState();
                  }, 3e4);
                }
              },
              {
                key: 'stopAutoSave',
                value: function () {
                  this.autoSaveInterval &&
                    (clearInterval(this.autoSaveInterval), (this.autoSaveInterval = null));
                }
              },
              {
                key: 'skipQuestion',
                value: function () {
                  (this.state.responses.push({
                    questionIndex: this.state.currentQuestionIndex,
                    question: this.questions[this.state.currentQuestionIndex].question,
                    category: this.questions[this.state.currentQuestionIndex].category,
                    response: { skipped: !0 },
                    timestamp: Date.now(),
                    taskType: this.questions[this.state.currentQuestionIndex].type
                  }),
                    this.navigateQuestion(1));
                }
              },
              {
                key: 'saveResultsToHistory',
                value: function (e) {
                  try {
                    var t = JSON.parse(localStorage.getItem('neurlyn-history') || '[]');
                    (t.push({ date: Date.now(), mode: this.state.currentMode, results: e }),
                      t.length > 10 && t.shift(),
                      localStorage.setItem('neurlyn-history', JSON.stringify(t)));
                  } catch (e) {
                    console.error('Failed to save results:', e);
                  }
                }
              },
              {
                key: 'downloadResults',
                value: function () {
                  this.showToast('Preparing download...', 'info');
                }
              },
              {
                key: 'shareResults',
                value: function () {
                  navigator.share
                    ? navigator.share({
                        title: 'My Neurlyn Assessment Results',
                        text: 'Check out my personality profile!',
                        url: window.location.href
                      })
                    : this.showToast('Sharing not available on this device', 'error');
                }
              },
              {
                key: 'retakeAssessment',
                value: function () {
                  location.reload();
                }
              }
            ]),
            t && re(e.prototype, t),
            Object.defineProperty(e, 'prototype', { writable: !1 }),
            e
          );
          var e, t, n, i, s, r, o;
        })();
      'loading' === document.readyState
        ? document.addEventListener('DOMContentLoaded', function () {
            window.neurlynApp = new de();
          })
        : (window.neurlynApp = new de());
    })());
})();
