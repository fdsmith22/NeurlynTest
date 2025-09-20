export const lateralQuestions = {
  openness: [
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
  conscientiousness: [
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
  extraversion: [
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
  agreeableness: [
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
  neuroticism: [
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
  mixed: [
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
      measures: ['self_perception', 'life_narrative', 'identity_focus', 'temporal_orientation']
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
  projective: [
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
  ]
};
export function getLateralQuestions(e = 20) {
  return [
    ...lateralQuestions.openness,
    ...lateralQuestions.conscientiousness,
    ...lateralQuestions.extraversion,
    ...lateralQuestions.agreeableness,
    ...lateralQuestions.neuroticism,
    ...lateralQuestions.mixed,
    ...lateralQuestions.projective
  ]
    .sort(() => Math.random() - 0.5)
    .slice(0, e);
}
export const lateralScoringMatrix = {
  curiosity: { openness: 0.8, conscientiousness: -0.1 },
  risk_tolerance: { openness: 0.6, neuroticism: -0.4, extraversion: 0.3 },
  imagination: { openness: 0.9, agreeableness: 0.1 },
  abstract_thinking: { openness: 0.7, conscientiousness: 0.2 },
  perfectionism: { conscientiousness: 0.8, neuroticism: 0.3, agreeableness: -0.2 },
  planning_style: { conscientiousness: 0.7, openness: -0.2 },
  energy_source: { extraversion: 0.9, neuroticism: -0.2 },
  social_preference: { extraversion: 0.8, agreeableness: 0.3 },
  cooperation: { agreeableness: 0.9, extraversion: 0.2 },
  empathy_focus: { agreeableness: 0.8, neuroticism: 0.1 },
  emotional_stability: { neuroticism: -0.9, conscientiousness: 0.3 },
  stress_response: { neuroticism: -0.7, openness: 0.2 }
};
