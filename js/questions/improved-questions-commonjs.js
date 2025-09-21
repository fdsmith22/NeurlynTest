/**
 * CommonJS version of improved-questions.js for Node.js seed scripts
 * This file is auto-generated from improved-questions.js
 * DO NOT EDIT DIRECTLY - Edit improved-questions.js instead
 */

const improvedQuestions = {
  openness: [
    {
      text: 'When I discover a hidden path while walking, I usually take it to see where it leads',
      category: 'Openness',
      reversed: false
    },
    {
      text: "I get excited when someone recommends music from a genre I've never explored",
      category: 'Openness',
      reversed: false
    },
    {
      text: 'I prefer restaurants where I can order the same dish I love every time',
      category: 'Openness',
      reversed: true
    },
    {
      text: "Abstract art often speaks to me in ways I can't quite explain",
      category: 'Openness',
      reversed: false
    },
    {
      text: 'I enjoy conversations that challenge my fundamental beliefs',
      category: 'Openness',
      reversed: false
    },
    {
      text: 'When traveling, I prefer having every detail planned in advance',
      category: 'Openness',
      reversed: true
    },
    {
      text: 'I often find myself lost in Wikipedia rabbit holes for hours',
      category: 'Openness',
      reversed: false
    },
    {
      text: "I'd rather watch a documentary about quantum physics than a romantic comedy",
      category: 'Openness',
      reversed: false
    }
  ],
  conscientiousness: [
    {
      text: 'My workspace naturally stays organized without much effort',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: 'I often start projects with enthusiasm but struggle to finish them',
      category: 'Conscientiousness',
      reversed: true
    },
    {
      text: 'I arrive at least 10 minutes early to appointments',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: 'My to-do lists have sub-lists with their own sub-lists',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: 'I can work effectively even when my environment is chaotic',
      category: 'Conscientiousness',
      reversed: true
    },
    {
      text: 'I review my work multiple times before considering it complete',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: 'Deadlines motivate me - I work best under pressure',
      category: 'Conscientiousness',
      reversed: true
    },
    {
      text: 'I keep track of my expenses down to the penny',
      category: 'Conscientiousness',
      reversed: false
    }
  ],
  extraversion: [
    {
      text: 'After a long week, a crowded party sounds perfect',
      category: 'Extraversion',
      reversed: false
    },
    {
      text: 'I need alone time to recharge after social events',
      category: 'Extraversion',
      reversed: true
    },
    {
      text: 'I naturally take charge when working in groups',
      category: 'Extraversion',
      reversed: false
    },
    { text: 'Small talk with strangers energizes me', category: 'Extraversion', reversed: false },
    { text: 'I prefer texting over phone calls', category: 'Extraversion', reversed: true },
    {
      text: 'Being the center of attention feels natural to me',
      category: 'Extraversion',
      reversed: false
    },
    {
      text: 'I do my best thinking when talking ideas through with others',
      category: 'Extraversion',
      reversed: false
    },
    {
      text: "I'd choose a quiet coffee shop over a bustling café",
      category: 'Extraversion',
      reversed: true
    }
  ],
  agreeableness: [
    {
      text: 'I instinctively trust people until they prove otherwise',
      category: 'Agreeableness',
      reversed: false
    },
    {
      text: 'I find it satisfying when someone who wronged me faces consequences',
      category: 'Agreeableness',
      reversed: true
    },
    {
      text: 'I often go out of my way to help strangers',
      category: 'Agreeableness',
      reversed: false
    },
    {
      text: 'In negotiations, I focus on what I can gain rather than mutual benefit',
      category: 'Agreeableness',
      reversed: true
    },
    {
      text: 'Seeing others succeed genuinely makes me happy',
      category: 'Agreeableness',
      reversed: false
    },
    {
      text: 'I believe most people would take advantage if given the chance',
      category: 'Agreeableness',
      reversed: true
    },
    {
      text: 'I tend to forgive easily and rarely hold grudges',
      category: 'Agreeableness',
      reversed: false
    },
    {
      text: 'I enjoy debates where I can prove my point',
      category: 'Agreeableness',
      reversed: true
    }
  ],
  neuroticism: [
    {
      text: 'Minor setbacks can affect my mood for the entire day',
      category: 'Neuroticism',
      reversed: false
    },
    {
      text: 'I remain calm even when everything seems to go wrong',
      category: 'Neuroticism',
      reversed: true
    },
    {
      text: 'I often replay embarrassing moments from years ago',
      category: 'Neuroticism',
      reversed: false
    },
    {
      text: 'Uncertainty excites me rather than worries me',
      category: 'Neuroticism',
      reversed: true
    },
    {
      text: 'I check my sent emails multiple times to ensure they were okay',
      category: 'Neuroticism',
      reversed: false
    },
    {
      text: 'I sleep soundly even before important events',
      category: 'Neuroticism',
      reversed: true
    },
    { text: 'Small changes in routine make me anxious', category: 'Neuroticism', reversed: false },
    { text: 'I can laugh at myself when I make mistakes', category: 'Neuroticism', reversed: true }
  ],
  behavioral: [
    {
      text: 'I keep my phone on silent to avoid distractions',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: "I've stayed up all night pursuing a fascinating topic",
      category: 'Openness',
      reversed: false
    },
    {
      text: 'I prefer working alone on important projects',
      category: 'Extraversion',
      reversed: true
    },
    {
      text: 'I double-check locks and appliances before leaving home',
      category: 'Neuroticism',
      reversed: false
    },
    { text: 'I share my food without being asked', category: 'Agreeableness', reversed: false },
    { text: 'I color-code my calendar and notes', category: 'Conscientiousness', reversed: false },
    {
      text: 'I enjoy movies that leave the ending open to interpretation',
      category: 'Openness',
      reversed: false
    },
    {
      text: 'I feel drained after video calls, even with friends',
      category: 'Extraversion',
      reversed: true
    }
  ],
  situational: [
    {
      text: "If I won the lottery, I'd invest most of it rather than spend it",
      category: 'Conscientiousness',
      reversed: false
    },
    { text: 'At a museum, I read every placard thoroughly', category: 'Openness', reversed: false },
    {
      text: 'In group photos, I naturally position myself in the center',
      category: 'Extraversion',
      reversed: false
    },
    {
      text: 'When someone cuts in line, I speak up immediately',
      category: 'Agreeableness',
      reversed: true
    },
    {
      text: 'Before a trip, I research everything that could go wrong',
      category: 'Neuroticism',
      reversed: false
    },
    {
      text: 'I notice when picture frames are slightly crooked',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: "I'd rather explore a new city without a map or guide",
      category: 'Openness',
      reversed: false
    },
    { text: "At parties, I'm usually the last to leave", category: 'Extraversion', reversed: false }
  ],
  preferences: [
    {
      text: 'I prefer fiction that explores impossible worlds over realistic stories',
      category: 'Openness',
      reversed: false
    },
    {
      text: 'My ideal vacation involves a detailed itinerary',
      category: 'Conscientiousness',
      reversed: false
    },
    {
      text: "I'd choose dinner with one close friend over a party with twenty acquaintances",
      category: 'Extraversion',
      reversed: true
    },
    {
      text: 'I enjoy competitive activities more than cooperative ones',
      category: 'Agreeableness',
      reversed: true
    },
    {
      text: 'I prefer predictable routines over spontaneous adventures',
      category: 'Neuroticism',
      reversed: false
    }
  ]
};

function getBalancedQuestions(count = 20) {
  const allQuestions = [
    ...improvedQuestions.openness,
    ...improvedQuestions.conscientiousness,
    ...improvedQuestions.extraversion,
    ...improvedQuestions.agreeableness,
    ...improvedQuestions.neuroticism,
    ...improvedQuestions.behavioral,
    ...improvedQuestions.situational,
    ...improvedQuestions.preferences
  ];

  const selected = [];
  const traits = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];

  traits.forEach(trait => {
    const traitQuestions = allQuestions
      .filter(q => q.category === trait)
      .sort(() => Math.random() - 0.5);
    selected.push(...traitQuestions.slice(0, Math.min(2, Math.floor(count / 5))));
  });

  const remaining = count - selected.length;
  const unselected = allQuestions
    .filter(q => !selected.includes(q))
    .sort(() => Math.random() - 0.5);
  selected.push(...unselected.slice(0, remaining));

  return selected.sort(() => Math.random() - 0.5);
}

const scoringGuide = {
  calculateScore: (score, reversed) => (reversed ? 6 - score : score),
  dimensionScores: {
    Openness: { low: [0, 2.5], medium: [2.5, 3.5], high: [3.5, 5] },
    Conscientiousness: { low: [0, 2.5], medium: [2.5, 3.5], high: [3.5, 5] },
    Extraversion: { low: [0, 2.5], medium: [2.5, 3.5], high: [3.5, 5] },
    Agreeableness: { low: [0, 2.5], medium: [2.5, 3.5], high: [3.5, 5] },
    Neuroticism: { low: [0, 2.5], medium: [2.5, 3.5], high: [3.5, 5] }
  }
};

// CommonJS exports
module.exports = {
  improvedQuestions,
  getBalancedQuestions,
  scoringGuide
};
