const mongoose = require('mongoose');

/**
 * Report Template Schema - Stores templates and data for generating reports
 * No user-specific data is stored
 */
const reportTemplateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['personality', 'neurodiversity', 'comprehensive', 'clinical']
    },
    tier: {
      type: String,
      required: true,
      enum: ['free', 'premium', 'professional']
    },
    sections: [
      {
        title: String,
        order: Number,
        content: {
          introduction: String,
          methodology: String,
          interpretation: String
        },
        visualizations: [
          {
            type: String, // bar, radar, pie, etc.
            dataMapping: String,
            config: mongoose.Schema.Types.Mixed
          }
        ]
      }
    ],
    interpretations: {
      // Score ranges and their interpretations
      ranges: [
        {
          trait: String,
          low: { min: Number, max: Number, text: String },
          medium: { min: Number, max: Number, text: String },
          high: { min: Number, max: Number, text: String }
        }
      ],
      // Profile combinations
      profiles: [
        {
          name: String,
          conditions: mongoose.Schema.Types.Mixed,
          description: String,
          strengths: [String],
          challenges: [String],
          recommendations: [String]
        }
      ]
    },
    insights: {
      career: [
        {
          profile: String,
          suggestions: [String],
          avoid: [String]
        }
      ],
      relationships: [
        {
          profile: String,
          strengths: [String],
          workOn: [String]
        }
      ],
      personal_growth: [
        {
          profile: String,
          focus_areas: [String],
          exercises: [String]
        }
      ]
    },
    scientificBasis: {
      references: [String],
      validityScores: mongoose.Schema.Types.Mixed,
      reliability: mongoose.Schema.Types.Mixed
    },
    disclaimers: [String],
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for efficient lookups
reportTemplateSchema.index({ category: 1, tier: 1, active: 1 });

const ReportTemplate = mongoose.model('ReportTemplate', reportTemplateSchema);

module.exports = ReportTemplate;
