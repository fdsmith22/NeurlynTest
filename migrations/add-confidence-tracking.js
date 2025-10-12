/**
 * Database Migration: Add Confidence Tracking Fields
 *
 * Adds new fields to existing AssessmentSession documents:
 * - confidenceState (Map)
 * - currentStage (Number, default 1)
 * - stageHistory (Array)
 * - adaptiveMetadata (Object)
 *
 * Run with: node migrations/add-confidence-tracking.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('../models/AssessmentSession');
const AssessmentSession = mongoose.model('AssessmentSession');

/**
 * Migration function
 */
async function migrate() {
  try {
    console.log('[Migration] Starting confidence tracking migration...');
    console.log('[Migration] Connecting to database...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('[Migration] Connected successfully');

    // Find all sessions without confidence tracking fields
    const sessions = await AssessmentSession.find({
      $or: [
        { confidenceState: { $exists: false } },
        { currentStage: { $exists: false } },
        { stageHistory: { $exists: false } }
      ]
    });

    console.log(`[Migration] Found ${sessions.length} sessions to migrate`);

    if (sessions.length === 0) {
      console.log('[Migration] No sessions need migration');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    // Migrate each session
    for (const session of sessions) {
      try {
        // Add confidenceState if missing
        if (!session.confidenceState) {
          session.confidenceState = new Map();
        }

        // Add currentStage if missing
        if (!session.currentStage) {
          // Determine stage based on responses count if available
          const responseCount = session.responses?.length || 0;
          if (responseCount >= 60) {
            session.currentStage = 4;
          } else if (responseCount >= 40) {
            session.currentStage = 3;
          } else if (responseCount >= 15) {
            session.currentStage = 2;
          } else {
            session.currentStage = 1;
          }
        }

        // Add stageHistory if missing
        if (!session.stageHistory) {
          session.stageHistory = [];
        }

        // Add adaptiveMetadata if missing
        if (!session.adaptiveMetadata) {
          session.adaptiveMetadata = {
            useMultiStage: false, // Assume legacy sessions don't use multi-stage
            totalQuestionLimit: 70,
            skipCount: 0
          };
        }

        // Save with validation disabled to avoid schema issues
        await session.save({ validateBeforeSave: false });
        migratedCount++;

        if (migratedCount % 100 === 0) {
          console.log(`[Migration] Migrated ${migratedCount}/${sessions.length} sessions`);
        }
      } catch (error) {
        console.error(`[Migration] Error migrating session ${session.sessionId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`[Migration] Migration complete!`);
    console.log(`[Migration] Successfully migrated: ${migratedCount}`);
    console.log(`[Migration] Errors: ${errorCount}`);

    // Verify migration
    const verifyCount = await AssessmentSession.countDocuments({
      confidenceState: { $exists: true },
      currentStage: { $exists: true },
      stageHistory: { $exists: true }
    });

    console.log(`[Migration] Verification: ${verifyCount} sessions now have confidence tracking fields`);

  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('[Migration] Database connection closed');
  }
}

/**
 * Rollback function (optional)
 * Use to remove migrated fields if needed
 */
async function rollback() {
  try {
    console.log('[Rollback] Starting rollback...');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const result = await AssessmentSession.updateMany(
      {},
      {
        $unset: {
          confidenceState: '',
          currentStage: '',
          stageHistory: '',
          'adaptiveMetadata.useMultiStage': ''
        }
      }
    );

    console.log(`[Rollback] Removed fields from ${result.modifiedCount} documents`);

  } catch (error) {
    console.error('[Rollback] Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Check command line argument
const command = process.argv[2];

if (command === 'rollback') {
  rollback()
    .then(() => {
      console.log('[Rollback] Complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Rollback] Failed:', error);
      process.exit(1);
    });
} else {
  migrate()
    .then(() => {
      console.log('[Migration] Complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Migration] Failed:', error);
      process.exit(1);
    });
}
