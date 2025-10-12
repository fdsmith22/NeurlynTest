#!/usr/bin/env node

const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test';

// NEO-PI-R Facet Questions - 3-4 questions per facet (30 facets total)
const neoFacetQuestions = {
  openness: {
    fantasy: [
      {
        text: "I often get lost in my own imaginary worlds and daydreams.",
        reverseScored: false
      },
      {
        text: "I prefer to focus on reality rather than dwelling on fantasies.",
        reverseScored: true
      },
      {
        text: "My imagination often takes me to places far from the everyday world.",
        reverseScored: false
      }
    ],
    aesthetics: [
      {
        text: "I am deeply moved by the beauty I find in art, nature, or poetry.",
        reverseScored: false
      },
      {
        text: "Art and beauty don't play a major role in my life.",
        reverseScored: true
      },
      {
        text: "I often notice and appreciate subtle patterns, colors, or designs that others might miss.",
        reverseScored: false
      }
    ],
    feelings: [
      {
        text: "I experience my emotions intensely and value emotional experiences.",
        reverseScored: false
      },
      {
        text: "I tend to keep my emotions under control and don't dwell on feelings.",
        reverseScored: true
      },
      {
        text: "I believe it's important to fully experience both positive and negative emotions.",
        reverseScored: false
      }
    ],
    actions: [
      {
        text: "I enjoy trying new activities and experiencing different ways of doing things.",
        reverseScored: false
      },
      {
        text: "I prefer familiar routines and am uncomfortable with too much change.",
        reverseScored: true
      },
      {
        text: "I actively seek out new experiences and adventures.",
        reverseScored: false
      },
      {
        text: "When traveling, I prefer to explore off-the-beaten-path destinations.",
        reverseScored: false
      }
    ],
    ideas: [
      {
        text: "I enjoy philosophical discussions and exploring abstract concepts.",
        reverseScored: false
      },
      {
        text: "I prefer practical matters over theoretical or philosophical discussions.",
        reverseScored: true
      },
      {
        text: "I'm intellectually curious and enjoy learning for its own sake.",
        reverseScored: false
      }
    ],
    values: [
      {
        text: "I often question traditional values and social conventions.",
        reverseScored: false
      },
      {
        text: "I believe strongly in maintaining traditional values and ways of doing things.",
        reverseScored: true
      },
      {
        text: "I'm open to reconsidering my beliefs when presented with new information.",
        reverseScored: false
      }
    ]
  },
  conscientiousness: {
    competence: [
      {
        text: "I feel capable and effective in what I do.",
        reverseScored: false
      },
      {
        text: "I often doubt my ability to achieve my goals.",
        reverseScored: true
      },
      {
        text: "I handle most situations competently and make good decisions.",
        reverseScored: false
      },
      {
        text: "I feel well-prepared to deal with most aspects of my life.",
        reverseScored: false
      }
    ],
    order: [
      {
        text: "I keep my living and working spaces neat and organized.",
        reverseScored: false
      },
      {
        text: "I don't mind clutter and often leave things where I last used them.",
        reverseScored: true
      },
      {
        text: "I have systems and routines for keeping things organized.",
        reverseScored: false
      }
    ],
    dutifulness: [
      {
        text: "I always follow through on my commitments, even when inconvenient.",
        reverseScored: false
      },
      {
        text: "I sometimes break rules or commitments if they seem unreasonable.",
        reverseScored: true
      },
      {
        text: "I have a strong sense of moral obligation and duty.",
        reverseScored: false
      }
    ],
    achievement_striving: [
      {
        text: "I set high standards for myself and work hard to achieve them.",
        reverseScored: false
      },
      {
        text: "I'm content with moderate success and don't push myself too hard.",
        reverseScored: true
      },
      {
        text: "I'm driven to excel and often go above and beyond what's expected.",
        reverseScored: false
      },
      {
        text: "I constantly strive to improve my performance and reach new goals.",
        reverseScored: false
      }
    ],
    self_discipline: [
      {
        text: "I can stick with difficult tasks until they're completed.",
        reverseScored: false
      },
      {
        text: "I often get distracted and have trouble finishing what I start.",
        reverseScored: true
      },
      {
        text: "I have strong willpower and can resist temptations when necessary.",
        reverseScored: false
      }
    ],
    deliberation: [
      {
        text: "I carefully think through decisions before acting.",
        reverseScored: false
      },
      {
        text: "I often act on impulse without considering consequences.",
        reverseScored: true
      },
      {
        text: "I consider all options and potential outcomes before making choices.",
        reverseScored: false
      }
    ]
  },
  extraversion: {
    warmth: [
      {
        text: "I genuinely enjoy connecting with people and showing affection.",
        reverseScored: false
      },
      {
        text: "I tend to keep people at a distance emotionally.",
        reverseScored: true
      },
      {
        text: "People describe me as warm and approachable.",
        reverseScored: false
      },
      {
        text: "I easily form close bonds with others.",
        reverseScored: false
      }
    ],
    gregariousness: [
      {
        text: "I love being surrounded by people and seek out social gatherings.",
        reverseScored: false
      },
      {
        text: "I prefer solitude or very small groups to large gatherings.",
        reverseScored: true
      },
      {
        text: "The more people around, the more energized I feel.",
        reverseScored: false
      }
    ],
    assertiveness: [
      {
        text: "I naturally take charge in group situations.",
        reverseScored: false
      },
      {
        text: "I prefer to let others lead and make decisions.",
        reverseScored: true
      },
      {
        text: "I speak up confidently and make my opinions known.",
        reverseScored: false
      }
    ],
    activity: [
      {
        text: "I maintain a fast pace and stay busy throughout the day.",
        reverseScored: false
      },
      {
        text: "I prefer a slow, relaxed pace of life.",
        reverseScored: true
      },
      {
        text: "I have high energy levels and am always on the go.",
        reverseScored: false
      },
      {
        text: "I feel restless when I'm not actively doing something.",
        reverseScored: false
      }
    ],
    excitement_seeking: [
      {
        text: "I actively seek thrills and exciting experiences.",
        reverseScored: false
      },
      {
        text: "I prefer quiet, predictable activities over excitement.",
        reverseScored: true
      },
      {
        text: "I enjoy taking risks and living on the edge.",
        reverseScored: false
      }
    ],
    positive_emotions: [
      {
        text: "I frequently experience joy, enthusiasm, and optimism.",
        reverseScored: false
      },
      {
        text: "I rarely feel enthusiastic or exuberant about things.",
        reverseScored: true
      },
      {
        text: "I laugh easily and often feel cheerful.",
        reverseScored: false
      }
    ]
  },
  agreeableness: {
    trust: [
      {
        text: "I generally believe that people have good intentions.",
        reverseScored: false
      },
      {
        text: "I'm suspicious of others' motives and slow to trust.",
        reverseScored: true
      },
      {
        text: "I assume the best about people until proven otherwise.",
        reverseScored: false
      },
      {
        text: "I believe most people are basically honest and trustworthy.",
        reverseScored: false
      }
    ],
    straightforwardness: [
      {
        text: "I am frank, sincere, and straightforward with others.",
        reverseScored: false
      },
      {
        text: "I sometimes manipulate situations to get what I want.",
        reverseScored: true
      },
      {
        text: "I believe in being completely honest even when it's uncomfortable.",
        reverseScored: false
      }
    ],
    altruism: [
      {
        text: "I genuinely enjoy helping others and contributing to their welfare.",
        reverseScored: false
      },
      {
        text: "I prefer to focus on my own needs rather than helping others.",
        reverseScored: true
      },
      {
        text: "I go out of my way to help people in need.",
        reverseScored: false
      }
    ],
    compliance: [
      {
        text: "I prefer to cooperate rather than compete with others.",
        reverseScored: false
      },
      {
        text: "I can be aggressive and confrontational when challenged.",
        reverseScored: true
      },
      {
        text: "I try to avoid conflicts and find peaceful solutions.",
        reverseScored: false
      },
      {
        text: "I defer to others to maintain harmony.",
        reverseScored: false
      }
    ],
    modesty: [
      {
        text: "I'm uncomfortable being the center of attention or boasting about achievements.",
        reverseScored: false
      },
      {
        text: "I don't mind talking about my accomplishments and abilities.",
        reverseScored: true
      },
      {
        text: "I prefer to let my actions speak rather than promoting myself.",
        reverseScored: false
      }
    ],
    tender_mindedness: [
      {
        text: "I'm easily moved by others' needs and feel sympathy for those less fortunate.",
        reverseScored: false
      },
      {
        text: "I make decisions based on logic rather than sympathy.",
        reverseScored: true
      },
      {
        text: "I have a soft heart and am affected by others' emotions.",
        reverseScored: false
      }
    ]
  },
  neuroticism: {
    anxiety: [
      {
        text: "I frequently worry about things that might go wrong.",
        reverseScored: false
      },
      {
        text: "I rarely feel anxious or worried about the future.",
        reverseScored: true
      },
      {
        text: "I often feel tense and on edge.",
        reverseScored: false
      },
      {
        text: "Anxiety and nervousness are common feelings for me.",
        reverseScored: false
      }
    ],
    angry_hostility: [
      {
        text: "I get angry and frustrated easily when things don't go my way.",
        reverseScored: false
      },
      {
        text: "I rarely feel angry even in frustrating situations.",
        reverseScored: true
      },
      {
        text: "I have a quick temper and can be irritable.",
        reverseScored: false
      }
    ],
    depression: [
      {
        text: "I often feel sad, hopeless, or discouraged.",
        reverseScored: false
      },
      {
        text: "I rarely experience feelings of sadness or depression.",
        reverseScored: true
      },
      {
        text: "I tend to see the negative side of situations.",
        reverseScored: false
      }
    ],
    self_consciousness: [
      {
        text: "I feel uncomfortable and self-conscious in social situations.",
        reverseScored: false
      },
      {
        text: "I'm comfortable being myself regardless of what others think.",
        reverseScored: true
      },
      {
        text: "I worry about how others perceive me.",
        reverseScored: false
      },
      {
        text: "I often feel embarrassed or inferior around others.",
        reverseScored: false
      }
    ],
    impulsiveness: [
      {
        text: "I have trouble resisting cravings and urges.",
        reverseScored: false
      },
      {
        text: "I have strong self-control over my desires and impulses.",
        reverseScored: true
      },
      {
        text: "I often do things I later regret in the heat of the moment.",
        reverseScored: false
      }
    ],
    vulnerability: [
      {
        text: "I feel overwhelmed and unable to cope when under pressure.",
        reverseScored: false
      },
      {
        text: "I handle stress well and remain calm under pressure.",
        reverseScored: true
      },
      {
        text: "I panic easily when faced with stressful situations.",
        reverseScored: false
      }
    ]
  }
};

// Helper function to generate adaptive criteria based on facet
function getAdaptiveCriteria(trait, facet) {
  const baseScore = Math.random() * 20 + 40; // Random between 40-60

  return {
    triggerTraits: [
      {
        trait: trait,
        minScore: Math.max(20, baseScore - 20),
        maxScore: Math.min(80, baseScore + 20)
      }
    ],
    triggerPatterns: [`high_${facet}`, `low_${facet}`],
    followUpTo: [],
    incompatibleWith: [],
    requiredPrior: []
  };
}

// Helper function to format questions
function formatFacetQuestions() {
  const questions = [];
  let questionId = 1000; // Start from 1000 to avoid conflicts

  for (const [trait, facets] of Object.entries(neoFacetQuestions)) {
    for (const [facet, facetQuestions] of Object.entries(facets)) {
      facetQuestions.forEach((q, index) => {
        const question = {
          questionId: `NEO_FACET_${questionId++}`,
          text: q.text,
          category: 'personality',
          instrument: 'NEO-PI-R',
          trait: trait,
          facet: facet.replace(/_/g, '_'), // Keep underscores as-is
          subcategory: `${trait}_facets`,
          responseType: 'likert',
          options: [
            { value: 1, label: 'Strongly Disagree', score: q.reverseScored ? 5 : 1 },
            { value: 2, label: 'Disagree', score: q.reverseScored ? 4 : 2 },
            { value: 3, label: 'Neutral', score: 3 },
            { value: 4, label: 'Agree', score: q.reverseScored ? 2 : 4 },
            { value: 5, label: 'Strongly Agree', score: q.reverseScored ? 1 : 5 }
          ],
          reverseScored: q.reverseScored,
          weight: 1.2, // Slightly higher weight for facet questions
          tier: 'comprehensive',
          adaptive: {
            isBaseline: false,
            adaptiveCriteria: getAdaptiveCriteria(trait, facet),
            correlatedTraits: [trait],
            diagnosticWeight: 3,
            difficultyLevel: 3,
            discriminationIndex: 0.65
          },
          metadata: {
            scientificSource: 'Costa & McCrae (1992) NEO-PI-R Manual',
            validationStudy: 'Internal consistency α = .56-.81 for facets'
          },
          active: true
        };

        questions.push(question);
      });
    }
  }

  return questions;
}

async function seedNeoFacetQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate the facet questions
    const facetQuestions = formatFacetQuestions();
    console.log(`Generated ${facetQuestions.length} NEO-PI-R facet questions`);

    // Count unique facets
    const uniqueFacets = new Set(facetQuestions.map(q => q.facet));
    console.log(`Covering ${uniqueFacets.size} unique facets`);

    // Remove any existing NEO facet questions
    const deleteResult = await QuestionBank.deleteMany({
      questionId: { $regex: /^NEO_FACET_/ }
    });
    console.log(`Removed ${deleteResult.deletedCount} existing NEO facet questions`);

    // Insert the new questions
    const result = await QuestionBank.insertMany(facetQuestions);
    console.log(`Successfully inserted ${result.length} NEO-PI-R facet questions`);

    // Verify the insertion
    const verifyCount = await QuestionBank.countDocuments({
      instrument: 'NEO-PI-R',
      facet: { $exists: true, $ne: null }
    });
    console.log(`Verification: ${verifyCount} NEO-PI-R facet questions in database`);

    // Show distribution by trait
    console.log('\nQuestions per trait:');
    for (const trait of ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']) {
      const count = await QuestionBank.countDocuments({
        instrument: 'NEO-PI-R',
        trait: trait,
        facet: { $exists: true }
      });
      console.log(`  ${trait}: ${count} questions`);
    }

    console.log('\n✅ NEO-PI-R facet questions seeded successfully!');

  } catch (error) {
    console.error('Error seeding NEO facet questions:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
if (require.main === module) {
  seedNeoFacetQuestions();
}

module.exports = { formatFacetQuestions, seedNeoFacetQuestions };
