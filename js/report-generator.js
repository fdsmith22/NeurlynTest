export class ReportGenerator {
  constructor() {
    ((this.traits = {
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
          description: 'You balance social engagement with personal reflection effectively.',
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
          description: 'You prefer meaningful one-on-one connections and quiet environments.',
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
          growth: ['Allow for flexibility', 'Embrace imperfection', 'Delegate when appropriate'],
          careers: ['Executive', 'Engineer', 'Surgeon', 'Financial Analyst', 'Quality Assurance'],
          icon: '🎯'
        },
        medium: {
          title: 'The Balanced Planner',
          description: 'You maintain a healthy balance between structure and spontaneity.',
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
          growth: ['Develop routines', 'Use planning tools', 'Break large tasks into steps'],
          careers: ['Artist', 'Musician', 'Travel Writer', 'Photographer', 'Chef'],
          icon: '🎨'
        }
      },
      Agreeableness: {
        high: {
          title: 'The Harmonizer',
          description:
            'You prioritize cooperation, empathy, and maintaining positive relationships.',
          strengths: ['Empathy', 'Team collaboration', 'Conflict resolution', 'Trustworthiness'],
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
          strengths: ['Fair judgment', 'Balanced perspective', 'Negotiation', 'Objectivity'],
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
          growth: ['Develop empathy', 'Practice diplomacy', "Consider others' perspectives"],
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
          description: 'You appreciate both tradition and innovation in balanced measure.',
          strengths: [
            'Balanced thinking',
            'Selective curiosity',
            'Practical creativity',
            'Adaptability'
          ],
          growth: ['Expand comfort zone', 'Embrace more risks', 'Explore new perspectives'],
          careers: ['Product Manager', 'Marketing', 'Teacher', 'Architect', 'Journalist'],
          icon: '🧭'
        },
        low: {
          title: 'The Traditionalist',
          description: 'You value proven methods, stability, and practical approaches.',
          strengths: ['Practicality', 'Consistency', 'Focus', 'Reliability'],
          growth: ['Try new approaches', 'Embrace change gradually', 'Explore creative outlets'],
          careers: ['Accountant', 'Administrator', 'Banker', 'Insurance Agent', 'Mechanic'],
          icon: '🏛️'
        }
      },
      'Emotional Stability': {
        high: {
          title: 'The Steady Rock',
          description: 'You maintain emotional balance and handle stress exceptionally well.',
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
          description: 'You experience a healthy range of emotions with good coping strategies.',
          strengths: [
            'Emotional awareness',
            'Balanced responses',
            'Authentic expression',
            'Adaptability'
          ],
          growth: ['Strengthen coping strategies', 'Practice mindfulness', 'Build resilience'],
          careers: ['Teacher', 'Manager', 'Consultant', 'Healthcare', 'Social Services'],
          icon: '🌊'
        },
        low: {
          title: 'The Sensitive Soul',
          description: 'You experience emotions deeply and intensely.',
          strengths: ['Emotional depth', 'Empathy', 'Passion', 'Artistic sensitivity'],
          growth: ['Develop coping strategies', 'Practice self-care', 'Build emotional resilience'],
          careers: ['Artist', 'Writer', 'Therapist', 'Musician', 'Actor'],
          icon: '🌺'
        }
      }
    }),
      (this.archetypes = {
        LEADER: {
          name: 'The Visionary Leader',
          description: 'Natural born leaders who inspire and guide others toward shared goals',
          traits: ['High Extraversion', 'High Conscientiousness', 'High Emotional Stability'],
          strengths: 'Strategic thinking, Team building, Decision making, Crisis management',
          challenges: 'May overlook details, Can be overly demanding, Risk of burnout',
          famous: 'Steve Jobs, Winston Churchill, Oprah Winfrey'
        },
        INNOVATOR: {
          name: 'The Creative Innovator',
          description: 'Original thinkers who challenge conventions and create new possibilities',
          traits: ['High Openness', 'Medium Conscientiousness', 'Medium Extraversion'],
          strengths: 'Creative problem-solving, Vision, Adaptability, Pattern recognition',
          challenges: 'May struggle with routine, Can be impractical, Difficulty focusing',
          famous: 'Einstein, Da Vinci, Elon Musk'
        },
        HARMONIZER: {
          name: 'The Peaceful Harmonizer',
          description: 'Empathetic souls who create harmony and understanding between people',
          traits: ['High Agreeableness', 'Medium Emotional Stability', 'Medium Extraversion'],
          strengths: 'Conflict resolution, Empathy, Team cohesion, Emotional intelligence',
          challenges: 'Difficulty with confrontation, May neglect own needs, Can be exploited',
          famous: 'Mr. Rogers, Mother Teresa, Dalai Lama'
        },
        ANALYST: {
          name: 'The Logical Analyst',
          description: 'Systematic thinkers who excel at understanding complex systems',
          traits: ['High Conscientiousness', 'Low Extraversion', 'High Emotional Stability'],
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
  }
  generateComprehensiveReport(e, t, i, n) {
    return {
      meta: this.generateMeta(i, n, t.length),
      overview: this.generateOverview(e),
      traits: this.generateDetailedTraits(e),
      archetype: this.determineArchetype(e),
      insights: this.generateInsights(e),
      comparisons: this.generateComparisons(e),
      recommendations: this.generateRecommendations(e),
      visualData: this.prepareVisualizationData(e)
    };
  }
  generateMeta(e, t, i) {
    return {
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      mode: e.charAt(0).toUpperCase() + e.slice(1),
      duration: Math.round(t / 6e4) + ' minutes',
      questions: i,
      reliability: this.calculateReliability(i)
    };
  }
  generateOverview(e) {
    const t = Object.entries(e).sort((e, t) => t[1].score - e[1].score),
      i = t[0],
      n = t[1],
      s = t[t.length - 1];
    return {
      summary: this.generatePersonalitySummary(i, n, s),
      dominantTrait: i[0],
      dominantScore: i[1].score,
      profile: this.generateProfileDescription(e)
    };
  }
  generatePersonalitySummary(e, t, i) {
    const n = [
      `Your personality is characterized by strong ${e[0].toLowerCase()} (${e[1].score}%), complemented by notable ${t[0].toLowerCase()} (${t[1].score}%). This unique combination suggests you are someone who ${this.getTraitDescription(e[0], e[1].raw)}. Your relatively lower ${i[0].toLowerCase()} (${i[1].score}%) indicates ${this.getContrastDescription(i[0], i[1].raw)}.`,
      `You exhibit a distinctive personality profile with exceptional ${e[0].toLowerCase()} at ${e[1].score}%, making you naturally inclined toward ${this.getTraitTendency(e[0], e[1].raw)}. Your ${t[0].toLowerCase()} score of ${t[1].score}% further enhances your ability to ${this.getTraitAbility(t[0], t[1].raw)}.`
    ];
    return n[Math.floor(Math.random() * n.length)];
  }
  getTraitDescription(e, t) {
    const i = t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium';
    return (
      {
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
      }[e]?.[i] || 'exhibits unique characteristics'
    );
  }
  getTraitTendency(e, t) {
    const i = t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium';
    return this.traits[e][i].strengths[0].toLowerCase();
  }
  getTraitAbility(e, t) {
    const i = t > 3.5 ? 'high' : t < 2.5 ? 'low' : 'medium';
    return this.traits[e][i].strengths[1].toLowerCase();
  }
  getContrastDescription(e, t) {
    return t < 2.5
      ? `you may prefer alternatives to ${this.traits[e].high.description.toLowerCase().split('you ')[1]}`
      : 'a balanced approach in this area';
  }
  generateProfileDescription(e) {
    let t = 'Your complete personality profile reveals ';
    const i = [];
    for (const [t, n] of Object.entries(e)) {
      const e = n.raw > 3.5 ? 'high' : n.raw < 2.5 ? 'low' : 'moderate';
      i.push(`${e} ${t.toLowerCase()}`);
    }
    return (
      (t += i.slice(0, -1).join(', ') + ', and ' + i[i.length - 1] + '. '),
      (t +=
        'This combination is found in approximately ' +
        this.calculateRarity(e) +
        '% of the population.'),
      t
    );
  }
  calculateRarity(e) {
    let t = 100;
    for (const i of Object.values(e))
      i.score > 80 || i.score < 20 ? (t *= 0.7) : (i.score > 70 || i.score < 30) && (t *= 0.85);
    return Math.max(1, Math.round(t));
  }
  generateDetailedTraits(e) {
    const t = {};
    for (const [i, n] of Object.entries(e)) {
      const e = n.raw > 3.5 ? 'high' : n.raw < 2.5 ? 'low' : 'medium',
        s = this.traits[i][e];
      t[i] = {
        score: n.score,
        percentile: n.percentile,
        level: e,
        title: s.title,
        description: s.description,
        icon: s.icon,
        strengths: s.strengths,
        growth: s.growth,
        careers: s.careers,
        interpretation: n.interpretation,
        comparison: this.generateComparison(n.percentile)
      };
    }
    return t;
  }
  generateComparison(e) {
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
  determineArchetype(e) {
    let t = null,
      i = 0;
    for (const [n, s] of Object.entries(this.archetypes)) {
      let n = 0;
      for (const t of s.traits) {
        const [i, s] = t.split(' '),
          r = e[s]?.raw || 3;
        (('High' === i && r > 3.5) ||
          ('Medium' === i && r >= 2.5 && r <= 3.5) ||
          ('Low' === i && r < 2.5)) &&
          (n += 1);
      }
      n > i && ((i = n), (t = { ...s, matchScore: Math.round((n / s.traits.length) * 100) }));
    }
    return t;
  }
  generateInsights(e) {
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
  identifyTopStrengths(e) {
    const t = [];
    for (const [i, n] of Object.entries(e))
      if (n.score > 70) {
        const e = n.raw > 3.5 ? 'high' : 'medium';
        t.push(...this.traits[i][e].strengths.slice(0, 2));
      }
    return [...new Set(t)].slice(0, 5);
  }
  identifyGrowthAreas(e) {
    const t = [];
    for (const [i, n] of Object.entries(e)) {
      const e = n.raw > 3.5 ? 'high' : n.raw < 2.5 ? 'low' : 'medium';
      t.push(...this.traits[i][e].growth.slice(0, 1));
    }
    return [...new Set(t)].slice(0, 3);
  }
  generateCareerInsights(e) {
    const t = new Set(),
      i = [];
    for (const [n, s] of Object.entries(e)) {
      const e = s.raw > 3.5 ? 'high' : s.raw < 2.5 ? 'low' : 'medium';
      (this.traits[n][e].careers.forEach(e => t.add(e)), s.score > 60 && i.push(n.toLowerCase()));
    }
    return {
      suitable: Array.from(t).slice(0, 8),
      strengths: `Your combination of ${i.join(' and ')} makes you well-suited for roles that require ${this.getCareerRequirements(e)}.`,
      environment: this.getIdealWorkEnvironment(e)
    };
  }
  getCareerRequirements(e) {
    const t = [];
    return (
      e.Extraversion?.score > 60 && t.push('interpersonal interaction'),
      e.Conscientiousness?.score > 60 && t.push('organization and planning'),
      e.Openness?.score > 60 && t.push('creativity and innovation'),
      e.Agreeableness?.score > 60 && t.push('collaboration and empathy'),
      e['Emotional Stability']?.score > 60 && t.push('stress management'),
      t.join(', ') || 'balanced skills'
    );
  }
  getIdealWorkEnvironment(e) {
    const t = [];
    return (
      e.Extraversion?.raw > 3.5
        ? t.push('collaborative open spaces')
        : e.Extraversion?.raw < 2.5 && t.push('quiet, private workspace'),
      e.Conscientiousness?.raw > 3.5
        ? t.push('structured with clear expectations')
        : e.Conscientiousness?.raw < 2.5 && t.push('flexible and autonomous'),
      e.Openness?.raw > 3.5 && t.push('innovative and dynamic'),
      'You thrive in environments that are ' + (t.join(', ') || 'balanced and adaptable')
    );
  }
  generateRelationshipInsights(e) {
    return {
      style: this.getRelationshipStyle(e),
      strengths: this.getRelationshipStrengths(e),
      needs: this.getRelationshipNeeds(e),
      compatibility: this.getCompatibilityInsights(e)
    };
  }
  getRelationshipStyle(e) {
    const t = e.Extraversion?.raw || 3,
      i = e.Agreeableness?.raw || 3;
    return t > 3.5 && i > 3.5
      ? 'Warm and engaging - you build connections easily and maintain them with care'
      : t > 3.5 && i < 2.5
        ? 'Direct and independent - you value honesty and maintain clear boundaries'
        : t < 2.5 && i > 3.5
          ? 'Supportive and loyal - you form deep, meaningful connections with select individuals'
          : t < 2.5 && i < 2.5
            ? 'Reserved and selective - you value quality over quantity in relationships'
            : 'Balanced and adaptive - you adjust your approach based on the situation and person';
  }
  getRelationshipStrengths(e) {
    const t = [];
    return (
      e.Agreeableness?.raw > 3.5 && t.push('empathy', 'conflict resolution'),
      e.Conscientiousness?.raw > 3.5 && t.push('reliability', 'commitment'),
      e.Openness?.raw > 3.5 && t.push('open communication', 'growth mindset'),
      e['Emotional Stability']?.raw > 3.5 && t.push('emotional support', 'stability'),
      e.Extraversion?.raw > 3.5 && t.push('social energy', 'enthusiasm'),
      t.slice(0, 4)
    );
  }
  getRelationshipNeeds(e) {
    const t = [];
    return (
      e.Extraversion?.raw > 3.5
        ? t.push('regular social interaction')
        : e.Extraversion?.raw < 2.5 && t.push('personal space and alone time'),
      e.Agreeableness?.raw > 3.5 && t.push('harmony and appreciation'),
      e.Conscientiousness?.raw > 3.5 && t.push('reliability and follow-through'),
      e.Openness?.raw > 3.5 && t.push('intellectual stimulation'),
      e['Emotional Stability']?.raw < 2.5 && t.push('patience and understanding'),
      t.slice(0, 3)
    );
  }
  getCompatibilityInsights(e) {
    return 'You connect best with people who ' + this.getCompatibilityTraits(e);
  }
  getCompatibilityTraits(e) {
    const t = [];
    return (
      e.Openness?.raw > 3.5 && t.push('share your curiosity and love of learning'),
      e.Conscientiousness?.raw > 3.5 && t.push('value commitment and reliability'),
      e.Agreeableness?.raw < 2.5 && t.push('appreciate directness and independence'),
      t.join(', ') || 'complement your balanced approach to life'
    );
  }
  generateCommunicationStyle(e) {
    const t = e.Extraversion?.raw || 3,
      i = e.Agreeableness?.raw || 3,
      n = e.Openness?.raw || 3;
    let s = '';
    return (
      (s +=
        t > 3.5
          ? 'Expressive and engaging. '
          : t < 2.5
            ? 'Thoughtful and measured. '
            : 'Balanced and adaptive. '),
      i > 3.5
        ? (s += 'You prioritize harmony and understanding. ')
        : i < 2.5 && (s += 'You value directness and clarity. '),
      n > 3.5
        ? (s += 'You enjoy exploring ideas and possibilities.')
        : n < 2.5 && (s += 'You prefer practical, concrete discussions.'),
      s
    );
  }
  generateLeadershipStyle(e) {
    const t = e.Conscientiousness?.raw || 3,
      i = e.Extraversion?.raw || 3,
      n = e.Agreeableness?.raw || 3;
    return i > 3.5 && t > 3.5
      ? 'Charismatic and organized - you inspire through vision and execution'
      : i < 2.5 && t > 3.5
        ? 'Leading by example - you demonstrate excellence through your work'
        : n > 3.5 && i > 3.5
          ? 'Servant leadership - you empower others and build consensus'
          : t > 3.5 && n < 2.5
            ? 'Results-driven - you focus on objectives and performance'
            : 'Situational leadership - you adapt your style to meet team needs';
  }
  generateStressProfile(e) {
    const t = e['Emotional Stability']?.raw || 3;
    return (
      e.Conscientiousness,
      {
        triggers: this.getStressTriggers(e),
        responses: this.getStressResponses(t),
        copingStrategies: this.getCopingStrategies(e)
      }
    );
  }
  getStressTriggers(e) {
    const t = [];
    return (
      e.Conscientiousness?.raw > 3.5 && t.push('disorganization', 'missed deadlines'),
      e.Agreeableness?.raw > 3.5 && t.push('conflict', 'criticism'),
      e.Openness?.raw < 2.5 && t.push('unexpected changes', 'ambiguity'),
      e.Extraversion?.raw < 2.5 && t.push('overstimulation', 'forced social interaction'),
      t.slice(0, 3)
    );
  }
  getStressResponses(e) {
    return e > 3.5
      ? 'You typically remain calm and focused under pressure'
      : e < 2.5
        ? 'You may experience intense emotional responses to stress'
        : 'You have moderate stress responses with good recovery';
  }
  getCopingStrategies(e) {
    const t = [];
    return (
      e.Extraversion?.raw > 3.5
        ? t.push('Talk with friends', 'Social activities')
        : t.push('Quiet reflection', 'Solo activities'),
      e.Conscientiousness?.raw > 3.5 && t.push('Planning and organizing', 'Problem-solving'),
      e.Openness?.raw > 3.5 && t.push('Creative expression', 'Learning new skills'),
      e['Emotional Stability']?.raw > 3.5 && t.push('Physical exercise', 'Mindfulness'),
      t.slice(0, 4)
    );
  }
  generateMotivationProfile(e) {
    const t = [];
    return (
      e.Conscientiousness?.raw > 3.5 && t.push('Achievement and recognition'),
      e.Agreeableness?.raw > 3.5 && t.push('Helping others succeed'),
      e.Openness?.raw > 3.5 && t.push('Learning and discovery'),
      e.Extraversion?.raw > 3.5 && t.push('Social connection and collaboration'),
      e['Emotional Stability']?.raw > 3.5 && t.push('Challenge and growth'),
      {
        primary: t.slice(0, 2),
        description: `You are primarily motivated by ${t.slice(0, 2).join(' and ').toLowerCase()}. You find fulfillment when ${this.getMotivationContext(e)}.`
      }
    );
  }
  getMotivationContext(e) {
    const t = [];
    return (
      e.Conscientiousness?.raw > 3.5 && t.push('achieving your goals'),
      e.Agreeableness?.raw > 3.5 && t.push('making a positive impact'),
      e.Openness?.raw > 3.5 && t.push('exploring new possibilities'),
      t.join(' and ') || 'pursuing meaningful work'
    );
  }
  generateComparisons(e) {
    const t = {};
    for (const [i, n] of Object.entries(e))
      t[i] = {
        score: n.score,
        percentile: n.percentile,
        population: this.getPopulationComparison(n.percentile),
        similar: this.getSimilarProfiles(i, n.score)
      };
    return t;
  }
  getPopulationComparison(e) {
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
  getSimilarProfiles(e, t) {
    return {
      high: ['Leaders', 'Innovators', 'Performers'],
      medium: ['Managers', 'Educators', 'Consultants'],
      low: ['Researchers', 'Artists', 'Analysts']
    }[t > 70 ? 'high' : t < 30 ? 'low' : 'medium'];
  }
  generateRecommendations(e) {
    return {
      books: this.recommendBooks(e),
      activities: this.recommendActivities(e),
      skills: this.recommendSkills(e),
      mindfulness: this.recommendMindfulness(e),
      goals: this.generateGoals(e)
    };
  }
  recommendBooks(e) {
    const t = [];
    return (
      e.Openness?.raw > 3.5 &&
        t.push("'Sapiens' by Yuval Noah Harari", "'Thinking, Fast and Slow' by Daniel Kahneman"),
      e.Conscientiousness?.raw > 3.5 &&
        t.push("'Atomic Habits' by James Clear", "'Deep Work' by Cal Newport"),
      e.Agreeableness?.raw > 3.5 && t.push("'Nonviolent Communication' by Marshall Rosenberg"),
      e['Emotional Stability']?.raw < 2.5 && t.push("'The Power of Now' by Eckhart Tolle"),
      t.slice(0, 3)
    );
  }
  recommendActivities(e) {
    const t = [];
    return (
      e.Extraversion?.raw > 3.5
        ? t.push('Join networking groups', 'Attend social events', 'Team sports')
        : t.push('Solo hiking', 'Reading clubs', 'Creative writing'),
      e.Openness?.raw > 3.5 &&
        t.push('Travel to new places', 'Learn a new language', 'Art classes'),
      e.Conscientiousness?.raw < 2.5 && t.push('Improv classes', 'Spontaneous adventures'),
      t.slice(0, 4)
    );
  }
  recommendSkills(e) {
    const t = [];
    for (const [i, n] of Object.entries(e))
      if (n.raw < 2.5)
        switch (i) {
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
    return t.slice(0, 3);
  }
  recommendMindfulness(e) {
    const t = [];
    return (
      e['Emotional Stability']?.raw < 3 && t.push('Daily meditation', 'Breathing exercises'),
      e.Conscientiousness?.raw > 3.5
        ? t.push('Structured mindfulness routine')
        : t.push('Informal mindfulness moments'),
      e.Openness?.raw > 3.5 && t.push('Walking meditation', 'Body scan'),
      t.slice(0, 3)
    );
  }
  generateGoals(e) {
    const t = { shortTerm: [], longTerm: [] };
    for (const [i, n] of Object.entries(e)) {
      const e = n.raw > 3.5 ? 'high' : n.raw < 2.5 ? 'low' : 'medium',
        s = this.traits[i][e];
      s.growth && s.growth.length > 0 && t.shortTerm.push(s.growth[0]);
    }
    const i = this.determineArchetype(e);
    return (
      i &&
        t.longTerm.push(
          `Develop your ${i.name} potential`,
          `Build on your natural ${i.strengths.split(',')[0].toLowerCase()}`
        ),
      { shortTerm: t.shortTerm.slice(0, 3), longTerm: t.longTerm.slice(0, 2) }
    );
  }
  prepareVisualizationData(e) {
    return {
      radar: { labels: Object.keys(e), data: Object.values(e).map(e => e.score) },
      bars: Object.entries(e).map(([e, t]) => ({
        trait: e,
        score: t.score,
        percentile: t.percentile
      })),
      distribution: this.generateDistribution(e)
    };
  }
  generateDistribution(e) {
    const t = {};
    for (const [i, n] of Object.entries(e))
      t[i] = { userScore: n.score, mean: 50, stdDev: 15, percentile: n.percentile };
    return t;
  }
  calculateReliability(e) {
    return e >= 30 ? 'Excellent' : e >= 20 ? 'Good' : e >= 10 ? 'Moderate' : 'Basic';
  }
}
export default ReportGenerator;
