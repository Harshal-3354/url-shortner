const express = require('express');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const { nanoid } = require('nanoid');

const router = express.Router();

// @route   GET /:shortId
// @desc    Redirect short URL to original URL
// @access  Public
router.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.query;
    console.log(req.query);
    // Find URL by shortId or customAlias
    const url = await Url.findOne({
      $or: [{ shortId }, { customAlias: shortId }],
      isActive: true
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found or inactive' });
    }

    // Check if URL is expired
    if (url.isExpired()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Check password protection
    if (url.isPasswordProtected) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required',
          requiresPassword: true,
          shortId: url.shortUrl
        });
      }
      
      if (password !== url.password) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    // Generate visitor ID (simple fingerprint)
    const visitorId = generateVisitorId(req);

    // Track analytics
    await trackAnalytics(url._id, req, visitorId);

    // Update URL stats
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      lastAccessed: new Date()
    });

    // Redirect to original URL
    res.redirect(url.originalUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Server error during redirect' });
  }
});

// @route   POST /:shortId/verify-password
// @desc    Verify password for password-protected URLs
// @access  Public
router.post('/:shortId/verify-password', async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const url = await Url.findOne({
      $or: [{ shortId }, { customAlias: shortId }],
      isActive: true
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found or inactive' });
    }

    if (url.isExpired()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    if (!url.isPasswordProtected) {
      return res.status(400).json({ error: 'This URL is not password protected' });
    }

    if (password !== url.password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate visitor ID
    const visitorId = generateVisitorId(req);

    // Track analytics
    await trackAnalytics(url._id, req, visitorId);

    // Update URL stats
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      lastAccessed: new Date()
    });

    res.json({
      success: true,
      originalUrl: url.originalUrl
    });

  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ error: 'Server error during password verification' });
  }
});

// Helper function to generate visitor ID
function generateVisitorId(req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  
  // Simple hash of IP + User-Agent + Accept-Language
  const combined = `${ip}-${userAgent}-${acceptLanguage}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Helper function to track analytics
async function trackAnalytics(urlId, req, visitorId) {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referrer') || null;

    // Parse user agent
    const ua = new UAParser(userAgent);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    // Get location from IP
    const geo = geoip.lookup(ip);
    const location = geo ? {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone
    } : {};

    // Check if this is a unique visitor
    const existingVisit = await Analytics.findOne({
      urlId,
      visitorId
    });

    const analyticsData = {
      urlId,
      visitorId,
      ipAddress: ip,
      userAgent,
      browser: {
        name: browser.name || 'Unknown',
        version: browser.version || 'Unknown'
      },
      os: {
        name: os.name || 'Unknown',
        version: os.version || 'Unknown'
      },
      device: {
        type: device.type || 'desktop',
        vendor: device.vendor || null,
        model: device.model || null
      },
      location,
      referrer,
      timestamp: new Date(),
      isUnique: !existingVisit
    };

    // Save analytics
    await Analytics.create(analyticsData);

    // Update unique visitors count if this is a new visitor
    if (!existingVisit) {
      await Url.findByIdAndUpdate(urlId, {
        $inc: { uniqueVisitors: 1 }
      });
    }

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the redirect if analytics fails
  }
}

module.exports = router;
