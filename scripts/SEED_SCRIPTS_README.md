# Database Seeding Scripts

## ⚠️ IMPORTANT: Use Only Active Scripts

### Active Scripts (Use These)

1. **`seed-master-questions.js`** - Main database seeder
   - Seeds 81 base questions
   - Includes personality (Big 5), neurodiversity, and cognitive questions
   - Run: `npm run seed:master`

2. **`seed-complete-expanded-questions.js`** - Additional questions
   - Adds 137 more specialized questions
   - Includes attachment, enneagram, trauma screening, etc.
   - Run: `npm run seed:expanded`

### Combined Seeding (Recommended)

```bash
# Seed all 218+ questions (runs both scripts)
npm run seed
```

### For CI/CD and Testing

The CI/CD workflows automatically run both scripts in sequence:

1. First: `seed-master-questions.js`
2. Then: `seed-complete-expanded-questions.js`

Total: 218+ questions across all categories

### Question Distribution

After running both scripts, you'll have:

- **Personality**: 61 questions (Big 5 traits)
- **Neurodiversity**: 86 questions (ADHD, autism, sensory)
- **Cognitive**: 5 questions
- **Attachment**: 12 questions
- **Enneagram**: 18 questions
- **Cognitive Functions**: 16 questions
- **Learning Style**: 8 questions
- **Trauma Screening**: 12 questions

### Archived Scripts (DO NOT USE)

The following scripts have been archived in `scripts/archived-seeds/`:

- `seed-all-expanded-questions.js` - Deprecated
- `seed-all-questions.js` - Deprecated
- `seed-database.js` - Replaced by seed-master-questions.js
- `seed-expanded-questions.js` - Incomplete
- `seed-psychoanalytic-questions.js` - Merged into seed-complete-expanded

These scripts are kept for reference only but should NOT be used for seeding.

### Development Usage

```bash
# For local development - seed the test database
export MONGODB_URI=mongodb://localhost:27017/neurlyn-test
npm run seed

# For production - seed the production database
export MONGODB_URI=<your-production-mongodb-uri>
npm run seed
```

### Troubleshooting

If you're getting empty database errors in tests:

1. Make sure MongoDB is running
2. Run `npm run seed` to populate the database
3. Check that the MONGODB_URI environment variable is set correctly

### Adding New Questions

To add new questions:

1. Add them to `seed-master-questions.js` for base personality questions
2. Add them to `seed-complete-expanded-questions.js` for specialized assessments
3. Ensure they follow the QuestionBank schema structure
4. Test locally before deploying

## Schema Reference

All questions must follow this structure:

```javascript
{
  questionId: String (unique),
  text: String,
  category: String (from enum),
  instrument: String,
  trait: String,
  responseType: 'likert' | 'multiple-choice' | etc.,
  options: Array,
  tier: 'free' | 'core' | 'comprehensive',
  active: Boolean
}
```
