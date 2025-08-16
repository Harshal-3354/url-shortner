const express = require('express');
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');
const { auth } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/analytics/url/:urlId
// @desc    Get analytics for a specific URL
// @access  Private (owner only)
router.get('/url/:urlId', auth, async (req, res) => {
  try {
    const { urlId } = req.params;
    const { period = '7d' } = req.query;

    // Verify URL ownership
    const url = await Url.findOne({ 
      _id: urlId, 
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Calculate date range
    const endDate = moment();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = moment().subtract(1, 'day');
        break;
      case '7d':
        startDate = moment().subtract(7, 'days');
        break;
      case '30d':
        startDate = moment().subtract(30, 'days');
        break;
      case '90d':
        startDate = moment().subtract(90, 'days');
        break;
      default:
        startDate = moment().subtract(7, 'days');
    }

    // Get analytics data
    const analytics = await Analytics.find({
      urlId,
      timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    }).sort({ timestamp: 1 });

    // Process data for charts
    const timeSeriesData = processTimeSeriesData(analytics, startDate, endDate, period);
    const deviceData = processDeviceData(analytics);
    const browserData = processBrowserData(analytics);
    const locationData = processLocationData(analytics);
    const referrerData = processReferrerData(analytics);

    // Calculate summary stats
    const summary = {
      totalClicks: url.clicks,
      uniqueVisitors: url.uniqueVisitors,
      periodClicks: analytics.length,
      periodUniqueVisitors: analytics.filter(a => a.isUnique).length,
      averageClicksPerDay: Math.round((analytics.length / moment.duration(endDate.diff(startDate)).asDays()) * 100) / 100
    };

    res.json({
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        createdAt: url.createdAt
      },
      summary,
      charts: {
        timeSeries: timeSeriesData,
        devices: deviceData,
        browsers: browserData,
        locations: locationData,
        referrers: referrerData
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: period
      }
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for all user URLs
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const endDate = moment();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = moment().subtract(1, 'day');
        break;
      case '7d':
        startDate = moment().subtract(7, 'days');
        break;
      case '30d':
        startDate = moment().subtract(30, 'days');
        break;
      default:
        startDate = moment().subtract(7, 'days');
    }

    // Get user's URLs
    const urls = await Url.find({ userId: req.user._id });
    const urlIds = urls.map(url => url._id);

    // Get analytics for all URLs
    const analytics = await Analytics.find({
      urlId: { $in: urlIds },
      timestamp: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    // Calculate dashboard stats
    const dashboardStats = {
      totalUrls: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
      totalUniqueVisitors: urls.reduce((sum, url) => sum + url.uniqueVisitors, 0),
      periodClicks: analytics.length,
      periodUniqueVisitors: analytics.filter(a => a.isUnique).length,
      activeUrls: urls.filter(url => url.isActive && !url.isExpired()).length,
      expiredUrls: urls.filter(url => url.isExpired()).length
    };

    // Top performing URLs
    const topUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(url => ({
        id: url._id,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        uniqueVisitors: url.uniqueVisitors
      }));

    // Recent activity
    const recentActivity = await Analytics.find({
      urlId: { $in: urlIds }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('urlId', 'shortUrl originalUrl');

    res.json({
      dashboardStats,
      topUrls,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        url: activity.urlId,
        timestamp: activity.timestamp,
        visitorId: activity.visitorId,
        location: activity.location,
        device: activity.device,
        browser: activity.browser
      }))
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard analytics' });
  }
});

// Helper function to process time series data
function processTimeSeriesData(analytics, startDate, endDate, period) {
  const data = [];
  let current = moment(startDate);
  
  while (current.isSameOrBefore(endDate)) {
    const dayStart = current.clone().startOf('day');
    const dayEnd = current.clone().endOf('day');
    
    const dayAnalytics = analytics.filter(a => 
      moment(a.timestamp).isBetween(dayStart, dayEnd, null, '[]')
    );
    
    data.push({
      date: current.format('YYYY-MM-DD'),
      clicks: dayAnalytics.length,
      uniqueVisitors: dayAnalytics.filter(a => a.isUnique).length
    });
    
    current.add(1, 'day');
  }
  
  return data;
}

// Helper function to process device data
function processDeviceData(analytics) {
  const deviceCounts = {};
  
  analytics.forEach(activity => {
    const deviceType = activity.device?.type || 'desktop';
    deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
  });
  
  return Object.entries(deviceCounts).map(([device, count]) => ({
    device,
    count
  }));
}

// Helper function to process browser data
function processBrowserData(analytics) {
  const browserCounts = {};
  
  analytics.forEach(activity => {
    const browserName = activity.browser?.name || 'Unknown';
    browserCounts[browserName] = (browserCounts[browserName] || 0) + 1;
  });
  
  return Object.entries(browserCounts).map(([browser, count]) => ({
    browser,
    count
  }));
}

// Helper function to process location data
function processLocationData(analytics) {
  const locationCounts = {};
  
  analytics.forEach(activity => {
    const country = activity.location?.country || 'Unknown';
    locationCounts[country] = (locationCounts[country] || 0) + 1;
  });
  
  return Object.entries(locationCounts).map(([country, count]) => ({
    country,
    count
  }));
}

// Helper function to process referrer data
function processReferrerData(analytics) {
  const referrerCounts = {};
  
  analytics.forEach(activity => {
    const referrer = activity.referrer || 'Direct';
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });
  
  return Object.entries(referrerCounts).map(([referrer, count]) => ({
    referrer,
    count
  }));
}

module.exports = router;
