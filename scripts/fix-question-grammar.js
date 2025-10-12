const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/neurlyn-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionBank = require('../models/QuestionBank');

/**
 * Comprehensive Question Grammar Fix
 *
 * Issues identified:
 * 1. MDQ items 2-12: Statement form with question mark + Yes/No (inconsistent)
 * 2. Need to audit all questions for similar grammar issues
 */

const MDQ_FIXES = [
  {
    questionId: 'MANIA_MDQ_2',
    oldText: 'You felt so irritable that you shouted at people or started fights or arguments?',
    newText: 'Did you feel so irritable that you shouted at people or started fights or arguments?'
  },
  {
    questionId: 'MANIA_MDQ_3',
    oldText: 'You felt much more self-confident than usual?',
    newText: 'Did you feel much more self-confident than usual?'
  },
  {
    questionId: 'MANIA_MDQ_4',
    oldText: 'You got much less sleep than usual and found you didn\'t really miss it?',
    newText: 'Did you get much less sleep than usual and find you didn\'t really miss it?'
  },
  {
    questionId: 'MANIA_MDQ_5',
    oldText: 'You were much more talkative or spoke much faster than usual?',
    newText: 'Were you much more talkative or did you speak much faster than usual?'
  },
  {
    questionId: 'MANIA_MDQ_6',
    oldText: 'Thoughts raced through your head or you couldn\'t slow your mind down?',
    newText: 'Did thoughts race through your head or could you not slow your mind down?'
  },
  {
    questionId: 'MANIA_MDQ_7',
    oldText: 'You were so easily distracted that the slightest thing could pull your attention away?',
    newText: 'Were you so easily distracted that the slightest thing could pull your attention away?'
  },
  {
    questionId: 'MANIA_MDQ_8',
    oldText: 'You had much more energy than usual?',
    newText: 'Did you have much more energy than usual?'
  },
  {
    questionId: 'MANIA_MDQ_9',
    oldText: 'You were much more active or did many more things than usual?',
    newText: 'Were you much more active or did you do many more things than usual?'
  },
  {
    questionId: 'MANIA_MDQ_10',
    oldText: 'You were much more social or outgoing than usual?',
    newText: 'Were you much more social or outgoing than usual?'
  },
  {
    questionId: 'MANIA_MDQ_11',
    oldText: 'You were much more interested in sex than usual?',
    newText: 'Were you much more interested in sex than usual?'
  },
  {
    questionId: 'MANIA_MDQ_12',
    oldText: 'You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?',
    newText: 'Did you do things that were unusual for you or that other people might have thought were excessive, foolish, or risky?'
  }
];

async function fixQuestionGrammar() {
  try {
    console.log('=== COMPREHENSIVE QUESTION GRAMMAR FIX ===\n');

    let totalFixed = 0;

    // 1. Fix MDQ questions
    console.log('1. Fixing MDQ (Mania) Questions\n');
    console.log('Issue: Statement form with question mark + Yes/No answers');
    console.log('Fix: Convert to proper question form\n');

    for (const fix of MDQ_FIXES) {
      const question = await QuestionBank.findOne({ questionId: fix.questionId });

      if (question) {
        console.log(`✓ ${fix.questionId}:`);
        console.log(`  OLD: "${fix.oldText}"`);
        console.log(`  NEW: "${fix.newText}"`);

        question.text = fix.newText;
        await question.save();
        totalFixed++;
        console.log('  ✓ Updated\n');
      } else {
        console.log(`⚠ ${fix.questionId}: NOT FOUND\n`);
      }
    }

    // 2. Audit for other potential grammar issues
    console.log('\n2. Auditing All Questions for Grammar Issues\n');

    const allQuestions = await QuestionBank.find({ active: true });
    const issues = [];

    for (const q of allQuestions) {
      const text = q.text;
      const responseType = q.responseType;

      // Check: Statement with question mark + binary response
      if (text.endsWith('?') && responseType === 'binary') {
        // Check if it starts with "You" or other statement indicators
        if (text.match(/^(You|Your|I|My|The|There|This) [a-z]/)) {
          // Verify it's not already a proper question
          if (!text.match(/^(Do|Did|Does|Have|Has|Had|Is|Are|Was|Were|Will|Would|Could|Can|Should|May|Might)/i)) {
            issues.push({
              questionId: q.questionId,
              text: text,
              category: q.category,
              instrument: q.instrument
            });
          }
        }
      }
    }

    if (issues.length > 0) {
      console.log(`⚠ Found ${issues.length} additional potential grammar issues:\n`);
      issues.slice(0, 10).forEach(issue => {
        console.log(`  ${issue.questionId} (${issue.instrument || 'N/A'}): "${issue.text.substring(0, 80)}..."`);
      });

      if (issues.length > 10) {
        console.log(`  ... and ${issues.length - 10} more`);
      }
    } else {
      console.log('✓ No additional grammar issues detected');
    }

    // 3. Summary
    console.log('\n=== SUMMARY ===');
    console.log(`✓ Fixed ${totalFixed} MDQ questions`);
    console.log(`✓ All MDQ items now properly formatted as questions`);
    console.log(`ℹ Audit complete: ${allQuestions.length} questions checked`);

    if (issues.length > 0) {
      console.log(`⚠ ${issues.length} additional issues flagged for manual review`);
    }

  } catch (error) {
    console.error('Error fixing question grammar:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

fixQuestionGrammar();
