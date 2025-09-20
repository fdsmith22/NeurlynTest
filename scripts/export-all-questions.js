#!/usr/bin/env node

/**
 * Export All Questions Script
 * Retrieves all questions from the database and saves them in multiple formats
 */

require('dotenv').config();
const mongoose = require('mongoose');
const QuestionBank = require('../models/QuestionBank');
const fs = require('fs');
const path = require('path');

async function exportAllQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurlyn');
// console.log('Connected to MongoDB');

    // Fetch all questions
    const questions = await QuestionBank.find({}).lean();
// console.log(`Found ${questions.length} questions`);

    // Group questions by category
    const grouped = {
      personality: [],
      neurodiversity: [],
      lateral: [],
      cognitive: []
    };

    questions.forEach(q => {
      if (grouped[q.category]) {
        grouped[q.category].push({
          id: q.questionId,
          text: q.text,
          instrument: q.instrument,
          trait: q.trait,
          responseType: q.responseType,
          tier: q.tier,
          options: q.options?.map(o => o.label).join(' | '),
          reversed: q.reverseScored
        });
      }
    });

    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Save as JSON
    const jsonPath = path.join(exportDir, 'all-questions.json');
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2));
// console.log(`✅ Full JSON saved to: ${jsonPath}`);

    // Save grouped JSON
    const groupedPath = path.join(exportDir, 'questions-grouped.json');
    fs.writeFileSync(groupedPath, JSON.stringify(grouped, null, 2));
// console.log(`✅ Grouped JSON saved to: ${groupedPath}`);

    // Save as CSV
    const csvPath = path.join(exportDir, 'questions.csv');
    let csv = 'Category,ID,Text,Instrument,Trait,Response Type,Tier,Options,Reversed\n';

    questions.forEach(q => {
      const text = q.text.replace(/"/g, '""'); // Escape quotes for CSV
      const options = q.options?.map(o => o.label).join(' | ') || '';
      csv += `"${q.category}","${q.questionId}","${text}","${q.instrument}","${q.trait || ''}","${q.responseType}","${q.tier}","${options}","${q.reverseScored || false}"\n`;
    });

    fs.writeFileSync(csvPath, csv);
// console.log(`✅ CSV saved to: ${csvPath}`);

    // Save as Markdown
    const mdPath = path.join(exportDir, 'questions.md');
    let markdown = '# Neurlyn Question Bank\n\n';
    markdown += `Total Questions: ${questions.length}\n\n`;

    // Add summary
    markdown += '## Summary\n\n';
    Object.entries(grouped).forEach(([category, items]) => {
      markdown += `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${items.length} questions\n`;
    });
    markdown += '\n';

    // Add detailed sections
    Object.entries(grouped).forEach(([category, items]) => {
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Questions\n\n`;

      // Group by instrument within category
      const byInstrument = {};
      items.forEach(item => {
        if (!byInstrument[item.instrument]) {
          byInstrument[item.instrument] = [];
        }
        byInstrument[item.instrument].push(item);
      });

      Object.entries(byInstrument).forEach(([instrument, questions]) => {
        markdown += `### ${instrument} (${questions.length} questions)\n\n`;
        questions.forEach((q, idx) => {
          markdown += `${idx + 1}. **${q.id}** - ${q.text}\n`;
          if (q.trait) markdown += `   - Trait: ${q.trait}\n`;
          if (q.options) markdown += `   - Options: ${q.options}\n`;
          if (q.reversed) markdown += `   - ⚠️ Reverse scored\n`;
          markdown += '\n';
        });
      });
    });

    fs.writeFileSync(mdPath, markdown);
// console.log(`✅ Markdown saved to: ${mdPath}`);

    // Print summary to console
// console.log('\n📊 Question Bank Summary:');
// console.log('========================');
    Object.entries(grouped).forEach(([category, items]) => {
// console.log(`${category.toUpperCase()}: ${items.length} questions`);

      // Count by instrument
      const instruments = {};
      items.forEach(item => {
        instruments[item.instrument] = (instruments[item.instrument] || 0) + 1;
      });

      Object.entries(instruments).forEach(([inst, count]) => {
// console.log(`  - ${inst}: ${count}`);
      });
    });

    await mongoose.disconnect();
// console.log('\n✨ Export complete! Check the exports/ directory for files.');
  } catch (error) {
    console.error('Error exporting questions:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  exportAllQuestions();
}

module.exports = { exportAllQuestions };
