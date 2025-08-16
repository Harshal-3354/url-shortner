const express = require('express');
const { body, validationResult } = require('express-validator');
const Url = require('../models/Url');
const { auth, optionalAuth } = require('../middleware/auth');
const QRCode = require('qrcode');

const router = express.Router();

// @route   POST /api/urls
// @desc    Create a new shortened URL
// @access  Public (with optional auth)
router.post('/', [
  body('originalUrl').isURL().withMessage('Please provide a valid URL'),
  body('customAlias').optional().matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  body('expiresAt').optional().isISO8601().withMessage('Please provide a valid date'),
  body('isPasswordProtected').optional().isBoolean().withMessage('Password protection must be a boolean'),
  body('password').optional().isLength({ min: 1 }).withMessage('Password is required when password protection is enabled')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, customAlias, expiresAt, isPasswordProtected, password } = req.body;

    // Check if custom alias is already taken
    if (customAlias) {
      const existingUrl = await Url.findOne({ 
        $or: [{ customAlias }, { shortId: customAlias }] 
      });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias is already taken' });
      }
    }

    // Validate password protection
    if (isPasswordProtected && !password) {
      return res.status(400).json({ error: 'Password is required when password protection is enabled' });
    }

    // Create URL object
    const urlData = {
      originalUrl,
      customAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPasswordProtected: isPasswordProtected || false,
      password: isPasswordProtected ? password : undefined
    };

    // Add user ID if authenticated
    if (req.user) {
      urlData.userId = req.user._id;
    }

    const url = new Url(urlData);
    await url.save();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/${url.shortUrl}`);

    res.status(201).json({
      message: 'URL shortened successfully',
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        isPasswordProtected: url.isPasswordProtected,
        qrCode,
        createdAt: url.createdAt
      }
    });
  } catch (error) {
    console.error('URL creation error:', error);
    res.status(500).json({ error: 'Server error while creating URL' });
  }
});

// @route   GET /api/urls
// @desc    Get user's URLs (authenticated users only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { userId: req.user._id };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } },
        { shortId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await Url.countDocuments(query);

    res.json({
      urls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUrls: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('URL fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching URLs' });
  }
});

// @route   GET /api/urls/:id
// @desc    Get specific URL details
// @access  Private (owner only)
router.get('/:id', auth, async (req, res) => {
  try {
    const url = await Url.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).select('-password');

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/${url.shortUrl}`);

    res.json({
      url: {
        ...url.toObject(),
        qrCode
      }
    });
  } catch (error) {
    console.error('URL fetch error:', error);
    res.status(500).json({ error: 'Server error while fetching URL' });
  }
});

// @route   PUT /api/urls/:id
// @desc    Update URL
// @access  Private (owner only)
router.put('/:id', [
  auth,
  body('originalUrl').optional().isURL().withMessage('Please provide a valid URL'),
  body('customAlias').optional().matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  body('expiresAt').optional().isISO8601().withMessage('Please provide a valid date'),
  body('isPasswordProtected').optional().isBoolean().withMessage('Password protection must be a boolean'),
  body('password').optional().isLength({ min: 1 }).withMessage('Password is required when password protection is enabled')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { originalUrl, customAlias, expiresAt, isPasswordProtected, password } = req.body;

    // Check if URL exists and user owns it
    const existingUrl = await Url.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!existingUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if custom alias is already taken by another URL
    if (customAlias && customAlias !== existingUrl.customAlias) {
      const aliasTaken = await Url.findOne({ 
        $or: [{ customAlias }, { shortId: customAlias }],
        _id: { $ne: req.params.id }
      });
      if (aliasTaken) {
        return res.status(400).json({ error: 'Custom alias is already taken' });
      }
    }

    // Validate password protection
    if (isPasswordProtected && !password) {
      return res.status(400).json({ error: 'Password is required when password protection is enabled' });
    }

    // Update fields
    const updateFields = {};
    if (originalUrl) updateFields.originalUrl = originalUrl;
    if (customAlias !== undefined) updateFields.customAlias = customAlias;
    if (expiresAt !== undefined) updateFields.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isPasswordProtected !== undefined) updateFields.isPasswordProtected = isPasswordProtected;
    if (password !== undefined) updateFields.password = password;

    const updatedUrl = await Url.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'URL updated successfully',
      url: updatedUrl
    });
  } catch (error) {
    console.error('URL update error:', error);
    res.status(500).json({ error: 'Server error while updating URL' });
  }
});

// @route   DELETE /api/urls/:id
// @desc    Delete URL
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('URL deletion error:', error);
    res.status(500).json({ error: 'Server error while deleting URL' });
  }
});

module.exports = router;
