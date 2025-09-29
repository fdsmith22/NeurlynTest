// Trait Facets Database
// Based on NEO-PI-R (Costa & McCrae) and latest personality research

const TraitFacetsDatabase = {
  // Openness Facets (NEO-PI-R validated)
  openness: {
    fantasy: {
      name: 'Fantasy/Imagination',
      description: 'Tendency to create rich inner world and imaginative experiences',
      high: {
        characteristics: 'Vivid imagination, creative daydreaming, rich fantasy life',
        strengths: ['Creative problem-solving', 'Innovation', 'Artistic expression'],
        challenges: ['May lose touch with practical matters', 'Escapism tendencies'],
        careers: ['Writer', 'Designer', 'Film director', 'Game developer'],
        development: 'Balance imagination with grounded action plans'
      },
      low: {
        characteristics: 'Practical, realistic, focused on concrete matters',
        strengths: ['Pragmatic solutions', 'Reality-based decisions', 'Practical efficiency'],
        challenges: ['May miss creative opportunities', 'Limited innovation'],
        careers: ['Accountant', 'Engineer', 'Project manager', 'Analyst'],
        development: 'Practice creative visualization exercises'
      },
      research: 'McCrae (1987) found fantasy correlates with divergent thinking (r=0.51)'
    },
    aesthetics: {
      name: 'Artistic Interests/Aesthetics',
      description: 'Appreciation for art, beauty, and aesthetic experiences',
      high: {
        characteristics: 'Deep appreciation for beauty, moved by art and nature',
        strengths: ['Aesthetic sensitivity', 'Cultural appreciation', 'Design sense'],
        challenges: ['May prioritize form over function', 'Perfectionism'],
        careers: ['Artist', 'Curator', 'Interior designer', 'Photographer'],
        development: 'Channel aesthetic sense into practical applications'
      },
      low: {
        characteristics: 'Function-focused, practical aesthetics, utility-oriented',
        strengths: ['Efficiency focus', 'Cost-effectiveness', 'Pragmatic design'],
        challenges: ['May undervalue presentation', 'Missing emotional connections'],
        careers: ['Engineer', 'Analyst', 'Operations manager', 'Auditor'],
        development: 'Explore art appreciation to broaden perspective'
      },
      research: 'Aesthetics predicts engagement with arts (r=0.63, Feist & Brady, 2004)'
    },
    feelings: {
      name: 'Emotional Awareness/Openness to Feelings',
      description: 'Receptivity to and valuation of emotional experiences',
      high: {
        characteristics: 'Deep emotional awareness, values feelings as important',
        strengths: ['Emotional intelligence', 'Empathy', 'Authenticity'],
        challenges: ['Emotional overwhelm', 'Decision paralysis'],
        careers: ['Therapist', 'Counselor', 'HR specialist', 'Social worker'],
        development: 'Develop emotional regulation strategies'
      },
      low: {
        characteristics: 'Emotionally controlled, rational focus, steady affect',
        strengths: ['Emotional stability', 'Objective decisions', 'Crisis management'],
        challenges: ['May seem detached', 'Missing emotional cues'],
        careers: ['Surgeon', 'Air traffic controller', 'Military officer', 'Judge'],
        development: 'Practice emotional awareness exercises'
      },
      research: 'Links to emotional intelligence (r=0.48, Brackett et al., 2006)'
    },
    actions: {
      name: 'Adventurousness/Actions',
      description: 'Preference for variety, novelty, and new experiences',
      high: {
        characteristics: 'Seeks new experiences, embraces change, adventurous',
        strengths: ['Adaptability', 'Innovation', 'Risk tolerance'],
        challenges: ['Restlessness', 'Difficulty with routine', 'Impulsivity'],
        careers: ['Entrepreneur', 'Travel writer', 'Emergency responder', 'Consultant'],
        development: 'Balance novelty-seeking with stability needs'
      },
      low: {
        characteristics: 'Prefers routine, values familiarity, cautious with change',
        strengths: ['Consistency', 'Reliability', 'Risk management'],
        challenges: ['Resistance to change', 'Missed opportunities'],
        careers: ['Accountant', 'Quality control', 'Archivist', 'Database admin'],
        development: 'Gradually introduce small changes to build comfort'
      },
      research: 'Predicts entrepreneurial success (r=0.42, Zhao & Seibert, 2006)'
    },
    ideas: {
      name: 'Intellectual Curiosity/Ideas',
      description: 'Interest in abstract ideas and intellectual pursuits',
      high: {
        characteristics: 'Intellectually curious, enjoys philosophical discussions',
        strengths: ['Abstract thinking', 'Strategic vision', 'Knowledge synthesis'],
        challenges: ['Overthinking', 'Analysis paralysis', 'Impractical ideas'],
        careers: ['Researcher', 'Professor', 'Strategic planner', 'Philosopher'],
        development: 'Connect abstract ideas to practical applications'
      },
      low: {
        characteristics: 'Practical minded, concrete thinking, solution-focused',
        strengths: ['Practical solutions', 'Quick decisions', 'Implementation focus'],
        challenges: ['May miss bigger picture', 'Limited strategic thinking'],
        careers: ['Technician', 'Operations', 'Sales', 'Customer service'],
        development: 'Explore conceptual frameworks in your field'
      },
      research: 'Correlates with academic achievement (r=0.33, Poropat, 2009)'
    },
    values: {
      name: 'Values/Liberalism',
      description: 'Readiness to re-examine values and challenge authority',
      high: {
        characteristics: 'Questions traditions, open to social change, progressive',
        strengths: ['Innovation', 'Social progress', 'Critical thinking'],
        challenges: ['May alienate traditionalists', 'Constant questioning'],
        careers: ['Activist', 'Journalist', 'Social entrepreneur', 'Policy maker'],
        development: 'Appreciate wisdom in some traditions'
      },
      low: {
        characteristics: 'Respects tradition, values stability, conservative approach',
        strengths: ['Cultural preservation', 'Stability', 'Respect for hierarchy'],
        challenges: ['Resistance to necessary change', 'Rigid thinking'],
        careers: ['Military', 'Law enforcement', 'Banking', 'Government'],
        development: 'Consider benefits of selective change'
      },
      research: 'Predicts political orientation (r=-0.57 with conservatism, Carney et al., 2008)'
    }
  },

  // Conscientiousness Facets
  conscientiousness: {
    competence: {
      name: 'Self-Efficacy/Competence',
      description: "Belief in one's ability to accomplish tasks effectively",
      high: {
        characteristics: 'Confident in abilities, feels capable and prepared',
        strengths: ['Task mastery', 'Leadership', 'Problem-solving confidence'],
        challenges: ['Overconfidence', 'Taking on too much', 'Perfectionism'],
        careers: ['CEO', 'Surgeon', 'Pilot', 'Project manager'],
        development: 'Maintain humility and continuous learning'
      },
      low: {
        characteristics: 'Self-doubt, uncertainty about abilities, seeks validation',
        strengths: ['Humility', 'Collaborative approach', 'Continuous improvement'],
        challenges: ['Imposter syndrome', 'Underachievement', 'Dependency'],
        careers: ['Support roles', 'Team member', 'Assistant positions'],
        development: 'Build confidence through skill development'
      },
      research: 'Strongest predictor of job performance (r=0.45, Judge et al., 2013)'
    },
    order: {
      name: 'Orderliness/Organization',
      description: 'Tendency toward neatness, organization, and methodical approach',
      high: {
        characteristics: 'Highly organized, neat, methodical, structured',
        strengths: ['Efficiency', 'System creation', 'Detail management'],
        challenges: ['Rigidity', 'Difficulty with ambiguity', 'Over-organizing'],
        careers: ['Librarian', 'Database administrator', 'Accountant', 'Editor'],
        development: 'Practice flexibility within structure'
      },
      low: {
        characteristics: 'Flexible organization, comfortable with some disorder',
        strengths: ['Adaptability', 'Creative chaos', 'Flexibility'],
        challenges: ['Losing items', 'Missed deadlines', 'Inefficiency'],
        careers: ['Artist', 'Emergency responder', 'Startup founder'],
        development: 'Implement basic organizational systems'
      },
      research: 'Links to academic performance (r=0.28, Richardson et al., 2012)'
    },
    dutifulness: {
      name: 'Dutifulness/Reliability',
      description: 'Adherence to moral and ethical principles, reliability',
      high: {
        characteristics: 'Strong sense of duty, reliable, follows through',
        strengths: ['Trustworthiness', 'Integrity', 'Dependability'],
        challenges: ['Inflexibility', 'Self-sacrifice', 'Guilt proneness'],
        careers: ['Auditor', 'Compliance officer', 'Judge', 'Military officer'],
        development: 'Balance duty with self-care'
      },
      low: {
        characteristics: 'Flexible with rules, situational ethics, pragmatic',
        strengths: ['Adaptability', 'Negotiation', 'Creative solutions'],
        challenges: ['Reliability concerns', 'Trust issues', 'Rule-breaking'],
        careers: ['Entrepreneur', 'Sales', 'Creative fields', 'Negotiator'],
        development: 'Strengthen commitment practices'
      },
      research: 'Predicts ethical behavior at work (r=0.38, Berry et al., 2007)'
    },
    achievementStriving: {
      name: 'Achievement Striving/Ambition',
      description: 'Drive to accomplish goals and achieve excellence',
      high: {
        characteristics: 'Ambitious, driven, goal-oriented, competitive',
        strengths: ['High achievement', 'Goal attainment', 'Motivation'],
        challenges: ['Burnout risk', 'Work-life imbalance', 'Stress'],
        careers: ['Executive', 'Entrepreneur', 'Athlete', 'Surgeon'],
        development: 'Balance achievement with wellbeing'
      },
      low: {
        characteristics: 'Content with current state, less competitive, relaxed',
        strengths: ['Work-life balance', 'Stress management', 'Contentment'],
        challenges: ['Underachievement', 'Lack of advancement', 'Complacency'],
        careers: ['Support roles', 'Steady positions', 'Lifestyle businesses'],
        development: 'Set meaningful personal goals'
      },
      research: 'Correlates with career success (r=0.39, Ng et al., 2005)'
    },
    selfDiscipline: {
      name: 'Self-Discipline/Persistence',
      description: 'Ability to persist despite boredom or distractions',
      high: {
        characteristics: 'Strong willpower, persistent, follows through',
        strengths: ['Task completion', 'Long-term goals', 'Habit formation'],
        challenges: ['Inflexibility', 'Missing opportunities', 'Burnout'],
        careers: ['Researcher', 'Author', 'Marathon runner', 'PhD student'],
        development: 'Allow for spontaneity and breaks'
      },
      low: {
        characteristics: 'Easily distracted, procrastination tendency, flexible focus',
        strengths: ['Multitasking', 'Adaptability', 'Spontaneity'],
        challenges: ['Incomplete projects', 'Procrastination', 'Goal abandonment'],
        careers: ['Crisis management', 'Emergency response', 'Entertainment'],
        development: 'Use external accountability systems'
      },
      research: 'Predicts academic success better than IQ (Duckworth & Seligman, 2005)'
    },
    deliberation: {
      name: 'Deliberation/Cautiousness',
      description: 'Tendency to think carefully before acting',
      high: {
        characteristics: 'Careful, thoughtful, considers consequences',
        strengths: ['Risk management', 'Wise decisions', 'Planning'],
        challenges: ['Analysis paralysis', 'Missed opportunities', 'Slow decisions'],
        careers: ['Risk analyst', 'Strategic planner', 'Judge', 'Researcher'],
        development: 'Practice quick decision-making for low-stakes choices'
      },
      low: {
        characteristics: 'Quick decisions, spontaneous, action-oriented',
        strengths: ['Fast response', 'Seizing opportunities', 'Adaptability'],
        challenges: ['Impulsivity', 'Poor planning', 'Regrettable decisions'],
        careers: ['Emergency responder', 'Day trader', 'Performer', 'Sales'],
        development: 'Implement decision-checking protocols'
      },
      research: 'Inversely related to risk-taking behaviors (r=-0.42, Hoyle et al., 2000)'
    }
  },

  // Extraversion Facets
  extraversion: {
    warmth: {
      name: 'Warmth/Friendliness',
      description: 'Genuine affection and friendliness toward others',
      high: {
        characteristics: 'Affectionate, friendly, warm interpersonal style',
        strengths: ['Relationship building', 'Team cohesion', 'Customer service'],
        challenges: ['Boundary issues', 'Over-involvement', 'Energy drain'],
        careers: ['Therapist', 'Teacher', 'Nurse', 'Customer success'],
        development: 'Maintain appropriate boundaries'
      },
      low: {
        characteristics: 'Reserved, formal, maintains distance',
        strengths: ['Professional boundaries', 'Objectivity', 'Independence'],
        challenges: ['Seeming cold', 'Relationship difficulties', 'Isolation'],
        careers: ['Researcher', 'Analyst', 'Technical writer', 'Auditor'],
        development: 'Practice warmth in safe contexts'
      },
      research: 'Strongest predictor of relationship satisfaction (r=0.44, Malouff et al., 2010)'
    },
    gregariousness: {
      name: 'Gregariousness/Sociability',
      description: "Preference for and enjoyment of others' company",
      high: {
        characteristics: 'Enjoys groups, seeks social interaction, party-lover',
        strengths: ['Networking', 'Team building', 'Social influence'],
        challenges: ['Difficulty alone', 'Dependency on others', 'Distraction'],
        careers: ['Event planner', 'Sales', 'PR manager', 'Tour guide'],
        development: 'Cultivate comfort with solitude'
      },
      low: {
        characteristics: 'Prefers small groups or solitude, selective socializing',
        strengths: ['Deep relationships', 'Independent work', 'Focus'],
        challenges: ['Networking difficulties', 'Missed opportunities', 'Isolation'],
        careers: ['Writer', 'Programmer', 'Researcher', 'Artist'],
        development: 'Build structured social connections'
      },
      research: 'Predicts social network size (r=0.52, Pollet et al., 2011)'
    },
    assertiveness: {
      name: 'Assertiveness/Dominance',
      description: 'Tendency to speak up, lead, and influence others',
      high: {
        characteristics: 'Takes charge, speaks up, influences others',
        strengths: ['Leadership', 'Negotiation', 'Advocacy', 'Initiative'],
        challenges: ['Domineering', 'Conflict', 'Intimidation'],
        careers: ['CEO', 'Lawyer', 'Military officer', 'Sales director'],
        development: 'Practice collaborative leadership'
      },
      low: {
        characteristics: 'Lets others lead, quiet in groups, accommodating',
        strengths: ['Collaboration', 'Listening', 'Support', 'Harmony'],
        challenges: ['Being overlooked', 'Unexpressed needs', 'Resentment'],
        careers: ['Support staff', 'Counselor', 'Librarian', 'Researcher'],
        development: 'Practice assertive communication'
      },
      research: 'Strongest extraversion predictor of leadership (r=0.38, Judge et al., 2002)'
    },
    activity: {
      name: 'Activity Level/Energy',
      description: 'Pace of living and energy level',
      high: {
        characteristics: 'High energy, fast-paced, busy lifestyle',
        strengths: ['Productivity', 'Multi-tasking', 'Endurance'],
        challenges: ['Burnout', 'Impatience', 'Restlessness'],
        careers: ['Emergency medicine', 'Entrepreneur', 'Athlete', 'Consultant'],
        development: 'Schedule regular rest and recovery'
      },
      low: {
        characteristics: 'Relaxed pace, deliberate, energy-conserving',
        strengths: ['Sustainability', 'Thoughtfulness', 'Presence'],
        challenges: ['Perceived laziness', 'Missed deadlines', 'Low output'],
        careers: ['Therapist', 'Artist', 'Writer', 'Craftsperson'],
        development: 'Build energy through physical activity'
      },
      research: 'Correlates with physical activity levels (r=0.38, Rhodes & Smith, 2006)'
    },
    excitementSeeking: {
      name: 'Excitement Seeking/Sensation Seeking',
      description: 'Need for environmental stimulation and excitement',
      high: {
        characteristics: 'Thrill-seeker, loves excitement, craves stimulation',
        strengths: ['Adventure', 'Innovation', 'Risk tolerance'],
        challenges: ['Risk-taking', 'Boredom', 'Impulsivity'],
        careers: ['Stunt performer', 'Entrepreneur', 'Emergency responder', 'Trader'],
        development: 'Find healthy outlets for excitement needs'
      },
      low: {
        characteristics: 'Prefers calm, avoids overwhelming situations',
        strengths: ['Stability', 'Safety', 'Thoughtful decisions'],
        challenges: ['Risk aversion', 'Missed experiences', 'Predictability'],
        careers: ['Accountant', 'Librarian', 'Researcher', 'Archivist'],
        development: 'Gradually expand comfort zone'
      },
      research: 'Predicts risk-taking behaviors (r=0.45, Roberti, 2004)'
    },
    positiveEmotions: {
      name: 'Positive Emotions/Cheerfulness',
      description: 'Tendency to experience joy, happiness, and enthusiasm',
      high: {
        characteristics: 'Cheerful, optimistic, laughs easily, enthusiastic',
        strengths: ['Mood contagion', 'Resilience', 'Team morale'],
        challenges: ['Unrealistic optimism', 'Minimizing problems'],
        careers: ['Motivational speaker', 'Teacher', 'Coach', 'Entertainer'],
        development: 'Balance optimism with realism'
      },
      low: {
        characteristics: 'Serious, less prone to enthusiasm, realistic',
        strengths: ['Realistic assessment', 'Crisis management', 'Objectivity'],
        challenges: ['Perceived negativity', 'Low mood', 'Team morale impact'],
        careers: ['Risk analyst', 'Auditor', 'Quality control', 'Editor'],
        development: 'Practice gratitude and joy-finding'
      },
      research: 'Links to life satisfaction (r=0.49, Steel et al., 2008)'
    }
  },

  // Agreeableness Facets
  agreeableness: {
    trust: {
      name: 'Trust',
      description: 'Disposition to believe others are honest and well-intentioned',
      high: {
        characteristics: 'Trusting, sees best in others, assumes good intentions',
        strengths: ['Relationship building', 'Collaboration', 'Team trust'],
        challenges: ['Naivety', 'Exploitation risk', 'Poor judgment'],
        careers: ['Counselor', 'Teacher', 'HR manager', 'Community organizer'],
        development: 'Develop healthy skepticism'
      },
      low: {
        characteristics: 'Skeptical, questions motives, careful with trust',
        strengths: ['Fraud detection', 'Risk assessment', 'Protection'],
        challenges: ['Relationship difficulties', 'Paranoia', 'Isolation'],
        careers: ['Auditor', 'Detective', 'Security analyst', 'Investigator'],
        development: 'Practice calculated trust-building'
      },
      research: 'Essential for team performance (r=0.32, Costa et al., 2001)'
    },
    straightforwardness: {
      name: 'Straightforwardness/Honesty',
      description: 'Frankness, sincerity, and directness in dealing with others',
      high: {
        characteristics: 'Direct, honest, transparent, genuine',
        strengths: ['Trustworthiness', 'Clear communication', 'Integrity'],
        challenges: ['Tactlessness', 'Hurting feelings', 'Inflexibility'],
        careers: ['Judge', 'Auditor', 'Journalist', 'Whistleblower'],
        development: 'Learn diplomatic communication'
      },
      low: {
        characteristics: 'Diplomatic, tactful, strategic in communication',
        strengths: ['Negotiation', 'Politics navigation', 'Conflict avoidance'],
        challenges: ['Trust issues', 'Perceived manipulation', 'Complexity'],
        careers: ['Diplomat', 'Negotiator', 'Politician', 'Sales'],
        development: 'Practice authentic expression'
      },
      research: 'Predicts ethical leadership (r=0.41, Brown & Trevino, 2006)'
    },
    altruism: {
      name: 'Altruism/Helpfulness',
      description: "Active concern for others' welfare and willingness to help",
      high: {
        characteristics: 'Helpful, generous, considerate, self-sacrificing',
        strengths: ['Service excellence', 'Team support', 'Caregiving'],
        challenges: ['Burnout', 'Being taken advantage of', 'Neglecting self'],
        careers: ['Social worker', 'Nurse', 'Non-profit leader', 'Teacher'],
        development: 'Balance helping with self-care'
      },
      low: {
        characteristics: 'Self-focused, reluctant to inconvenience self',
        strengths: ['Self-preservation', 'Boundary setting', 'Efficiency'],
        challenges: ['Seeming selfish', 'Team friction', 'Reputation'],
        careers: ['Independent contractor', 'Day trader', 'Researcher'],
        development: 'Practice acts of service'
      },
      research: 'Correlates with prosocial behavior (r=0.54, Graziano et al., 2007)'
    },
    compliance: {
      name: 'Compliance/Cooperation',
      description: 'Tendency to defer to others and avoid conflict',
      high: {
        characteristics: 'Accommodating, avoids conflict, yields to others',
        strengths: ['Harmony', 'Team cohesion', 'Flexibility'],
        challenges: ['Doormat tendency', 'Unexpressed needs', 'Resentment'],
        careers: ['Mediator', 'Customer service', 'Support staff', 'Counselor'],
        development: 'Practice healthy assertiveness'
      },
      low: {
        characteristics: 'Competitive, willing to conflict, stands ground',
        strengths: ['Advocacy', 'Negotiation', 'Leadership', 'Change agent'],
        challenges: ['Conflict escalation', 'Team disruption', 'Aggression'],
        careers: ['Lawyer', 'Activist', 'CEO', 'Military leader'],
        development: 'Learn collaborative conflict resolution'
      },
      research: 'Inversely predicts workplace deviance (r=-0.36, Berry et al., 2007)'
    },
    modesty: {
      name: 'Modesty/Humility',
      description: 'Tendency to be humble and self-effacing',
      high: {
        characteristics: 'Humble, self-effacing, uncomfortable with attention',
        strengths: ['Team player', 'Likability', 'Learning mindset'],
        challenges: ['Undervaluation', 'Missed recognition', 'Low visibility'],
        careers: ['Researcher', 'Behind-scenes roles', 'Support positions'],
        development: 'Practice appropriate self-promotion'
      },
      low: {
        characteristics: 'Self-confident, comfortable with recognition',
        strengths: ['Self-promotion', 'Leadership presence', 'Visibility'],
        challenges: ['Arrogance perception', 'Team resentment', 'Blind spots'],
        careers: ['CEO', 'Performer', 'Sales', 'Public speaker'],
        development: 'Cultivate genuine humility'
      },
      research: 'Predicts leader effectiveness in collective cultures (r=0.29, Ou et al., 2014)'
    },
    tenderness: {
      name: 'Tender-Mindedness/Sympathy',
      description: "Sympathy and concern for others' struggles",
      high: {
        characteristics: "Sympathetic, moved by others' needs, compassionate",
        strengths: ['Empathy', 'Caregiving', 'Emotional support'],
        challenges: ['Emotional overwhelm', 'Soft decision-making', 'Exploitation'],
        careers: ['Therapist', 'Nurse', 'Social worker', 'Veterinarian'],
        development: 'Build emotional boundaries'
      },
      low: {
        characteristics: 'Tough-minded, objective, less swayed by emotion',
        strengths: ['Objective decisions', 'Crisis management', 'Fairness'],
        challenges: ['Seeming cold', 'Missing emotional needs', 'Harsh judgments'],
        careers: ['Surgeon', 'Military', 'Judge', 'CEO'],
        development: 'Develop compassion practices'
      },
      research: 'Links to caregiving behaviors (r=0.47, Shiota et al., 2006)'
    }
  },

  // Neuroticism Facets
  neuroticism: {
    anxiety: {
      name: 'Anxiety/Worry',
      description: 'Tendency to feel anxious, worried, and fearful',
      high: {
        characteristics: 'Worry-prone, anticipates problems, fearful',
        strengths: ['Risk awareness', 'Preparation', 'Caution'],
        challenges: ['Chronic stress', 'Decision paralysis', 'Avoidance'],
        interventions: ['CBT', 'Mindfulness', 'Exposure therapy'],
        development: 'Practice anxiety management techniques'
      },
      low: {
        characteristics: 'Calm, unworried, confident in face of uncertainty',
        strengths: ['Stress management', 'Clear thinking', 'Risk-taking'],
        challenges: ['Underestimating risks', 'Lack of preparation'],
        careers: ['Emergency responder', 'Pilot', 'Surgeon', 'Military'],
        development: 'Maintain healthy concern for real risks'
      },
      research: 'Strongest predictor of anxiety disorders (r=0.58, Kotov et al., 2010)'
    },
    anger: {
      name: 'Anger/Hostility',
      description: 'Tendency to feel angry and frustrated',
      high: {
        characteristics: 'Quick to anger, easily frustrated, irritable',
        strengths: ['Passion', 'Drive for change', 'Boundary setting'],
        challenges: ['Relationship damage', 'Impulsive actions', 'Health risks'],
        interventions: ['Anger management', 'DBT', 'Meditation'],
        development: 'Channel anger constructively'
      },
      low: {
        characteristics: 'Even-tempered, slow to anger, patient',
        strengths: ['Relationship stability', 'Negotiation', 'Teaching'],
        challenges: ['Suppressed emotions', 'Being overlooked', 'Exploitation'],
        careers: ['Mediator', 'Teacher', 'Customer service', 'Therapist'],
        development: 'Learn healthy anger expression'
      },
      research: 'Predicts cardiovascular disease (r=0.19, Chida & Steptoe, 2009)'
    },
    depression: {
      name: 'Depression/Sadness',
      description: 'Susceptibility to feelings of sadness and hopelessness',
      high: {
        characteristics: 'Prone to sadness, feelings of hopelessness',
        strengths: ['Depth', 'Empathy', 'Realism', 'Art appreciation'],
        challenges: ['Low mood', 'Motivation issues', 'Pessimism'],
        interventions: ['Therapy', 'Exercise', 'Social connection', 'Medication'],
        development: 'Build mood regulation skills'
      },
      low: {
        characteristics: 'Emotionally resilient, rarely sad, optimistic',
        strengths: ['Emotional stability', 'Resilience', 'Motivation'],
        challenges: ["May minimize others' pain", 'Unrealistic optimism'],
        careers: ['Sales', 'Motivational speaker', 'Entrepreneur'],
        development: "Develop empathy for others' struggles"
      },
      research: 'Core feature of major depression (r=0.52, Kotov et al., 2010)'
    },
    selfConsciousness: {
      name: 'Self-Consciousness/Social Anxiety',
      description: 'Sensitivity to social judgment and embarrassment',
      high: {
        characteristics: 'Easily embarrassed, socially anxious, self-aware',
        strengths: ['Social awareness', 'Politeness', 'Consideration'],
        challenges: ['Social anxiety', 'Performance issues', 'Avoidance'],
        interventions: ['Social skills training', 'Exposure therapy', 'CBT'],
        development: 'Build social confidence gradually'
      },
      low: {
        characteristics: 'Socially confident, unconcerned with judgment',
        strengths: ['Social ease', 'Performance', 'Authenticity'],
        challenges: ['May miss social cues', 'Insensitivity'],
        careers: ['Performer', 'Sales', 'Public speaker', 'CEO'],
        development: 'Increase social awareness'
      },
      research: 'Central to social anxiety disorder (r=0.65, Watson et al., 2008)'
    },
    impulsiveness: {
      name: 'Impulsiveness/Urgency',
      description: 'Tendency to act on urges and have difficulty resisting temptation',
      high: {
        characteristics: 'Acts on impulse, difficulty resisting urges',
        strengths: ['Spontaneity', 'Quick action', 'Authenticity'],
        challenges: ['Poor decisions', 'Regret', 'Addiction risk'],
        interventions: ['DBT', 'Impulse control training', 'Mindfulness'],
        development: 'Implement pause strategies'
      },
      low: {
        characteristics: 'High self-control, resists temptation easily',
        strengths: ['Self-discipline', 'Long-term thinking', 'Reliability'],
        challenges: ['Rigidity', 'Missing opportunities', 'Over-control'],
        careers: ['Financial planner', 'Researcher', 'Judge'],
        development: 'Allow calculated spontaneity'
      },
      research: 'Predicts substance abuse (r=0.41, Whiteside & Lynam, 2001)'
    },
    vulnerability: {
      name: 'Vulnerability/Stress Sensitivity',
      description: 'Difficulty coping with stress and pressure',
      high: {
        characteristics: 'Easily overwhelmed, stress-sensitive, needs support',
        strengths: ['Seeks help', 'Team collaboration', 'Empathy'],
        challenges: ['Burnout', 'Dependency', 'Avoidance'],
        interventions: ['Stress management', 'Building resilience', 'Support systems'],
        development: 'Build stress tolerance gradually'
      },
      low: {
        characteristics: 'Stress-resistant, handles pressure well, self-reliant',
        strengths: ['Crisis management', 'Leadership', 'Independence'],
        challenges: ['May not seek help', 'Burnout risk', 'Isolation'],
        careers: ['Emergency responder', 'Military', 'Surgeon', 'CEO'],
        development: 'Recognize when support is needed'
      },
      research: 'Predicts PTSD development (r=0.37, Breslau et al., 1991)'
    }
  }
};

// Helper function to get facet interpretation
TraitFacetsDatabase.getFacetInterpretation = function (trait, facet, score) {
  const facetData = this[trait]?.[facet];
  if (!facetData) return null;

  const level = score >= 70 ? 'high' : score <= 30 ? 'low' : 'moderate';
  const interpretation = facetData[level];

  return {
    name: facetData.name,
    description: facetData.description,
    level: level,
    score: score,
    interpretation: interpretation,
    research: facetData.research
  };
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TraitFacetsDatabase;
}
