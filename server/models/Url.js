const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(8)
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[a-zA-Z0-9_-]+$/, 'Custom alias can only contain letters, numbers, hyphens, and underscores']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow guest users
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() { return this.isPasswordProtected; }
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
urlSchema.index({ shortId: 1 });
urlSchema.index({ customAlias: 1 });
urlSchema.index({ userId: 1 });
urlSchema.index({ expiresAt: 1 });
urlSchema.index({ isActive: 1 });

// Check if URL is expired
urlSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Get the actual short ID (custom alias or generated)
urlSchema.virtual('shortUrl').get(function() {
  return this.customAlias || this.shortId;
});

// Ensure virtual fields are serialized
urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
