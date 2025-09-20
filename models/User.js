const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    hashedPassword: String,
    assessments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment'
      }
    ],
    subscription: {
      active: Boolean,
      plan: String,
      expiresAt: Date
    },
    preferences: {
      theme: String,
      emailUpdates: Boolean,
      researchParticipation: Boolean
    }
  },
  { timestamps: true }
);

// Add index for email lookups
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
