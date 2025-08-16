const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  browser: {
    name: String,
    version: String
  },
  os: {
    name: String,
    version: String
  },
  device: {
    type: {
      type: String, // mobile, tablet, desktop
      default: 'desktop'
    },
    vendor: String,
    model: String
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  referrer: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isUnique: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
analyticsSchema.index({ urlId: 1, timestamp: -1 });
analyticsSchema.index({ visitorId: 1, urlId: 1 });
analyticsSchema.index({ timestamp: -1 });

// Compound index for unique visitor tracking
analyticsSchema.index({ urlId: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
