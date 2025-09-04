import express from 'express';
import { body, validationResult } from 'express-validator';
import CurationSession from '../models/CurationSession.js';
import CuratedItem from '../models/CuratedItem.js';
import User from '../models/User.js';
import { authenticateToken, checkUsageLimit } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/curation/sessions
 * @desc    Create a new curation session
 * @access  Private
 */
router.post('/sessions', [
  authenticateToken,
  checkUsageLimit,
  body('title').optional().isLength({ max: 200 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    // Check if user already has an active session
    const existingSession = await CurationSession.findActiveByUser(req.user.userId);
    if (existingSession) {
      return res.status(409).json({
        error: 'Active Session Exists',
        message: 'You already have an active curation session. Complete it before starting a new one.',
        session: existingSession
      });
    }

    const { title, description, tags } = req.body;

    // Create new session
    const session = new CurationSession({
      userId: req.user.userId,
      title,
      description,
      tags: tags || []
    });

    await session.save();

    // Increment user usage
    const user = await User.findOne({ userId: req.user.userId });
    await user.incrementUsage();

    res.status(201).json({
      message: 'Curation session created successfully',
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create curation session'
    });
  }
});

/**
 * @route   GET /api/curation/sessions
 * @desc    Get user's curation sessions
 * @access  Private
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.userId };
    if (status) {
      query.status = status;
    }

    const sessions = await CurationSession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('curatedItems');

    const total = await CurationSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve sessions'
    });
  }
});

/**
 * @route   GET /api/curation/sessions/:sessionId
 * @desc    Get specific curation session
 * @access  Private
 */
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await CurationSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.userId
    }).populate('curatedItems');

    if (!session) {
      return res.status(404).json({
        error: 'Session Not Found',
        message: 'Curation session not found'
      });
    }

    res.json({ session });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve session'
    });
  }
});

/**
 * @route   POST /api/curation/items
 * @desc    Add curated item to active session
 * @access  Private
 */
router.post('/items', [
  authenticateToken,
  body('text').isLength({ min: 10, max: 5000 }).trim(),
  body('sourceUrl').isURL(),
  body('threadTitle').optional().isLength({ max: 300 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    // Find active session
    const session = await CurationSession.findActiveByUser(req.user.userId);
    if (!session) {
      return res.status(404).json({
        error: 'No Active Session',
        message: 'Please start a curation session first'
      });
    }

    const { text, sourceUrl, threadTitle, redditData } = req.body;

    // Create curated item
    const item = new CuratedItem({
      sessionId: session.sessionId,
      text,
      sourceUrl,
      threadTitle,
      redditData: redditData || {}
    });

    // Extract Reddit information from URL
    item.extractRedditInfo();

    await item.save();

    // Update session item count
    await session.incrementItemCount();

    res.status(201).json({
      message: 'Item curated successfully',
      item
    });

  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add curated item'
    });
  }
});

/**
 * @route   GET /api/curation/items
 * @desc    Get curated items for a session
 * @access  Private
 */
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing Parameter',
        message: 'sessionId is required'
      });
    }

    // Verify session belongs to user
    const session = await CurationSession.findOne({
      sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session Not Found',
        message: 'Curation session not found'
      });
    }

    const items = await CuratedItem.findBySession(sessionId);

    res.json({ items });

  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve curated items'
    });
  }
});

/**
 * @route   PUT /api/curation/sessions/:sessionId/complete
 * @desc    Complete a curation session
 * @access  Private
 */
router.put('/sessions/:sessionId/complete', authenticateToken, async (req, res) => {
  try {
    const session = await CurationSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.userId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session Not Found',
        message: 'Active curation session not found'
      });
    }

    await session.complete();

    res.json({
      message: 'Session completed successfully',
      session
    });

  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete session'
    });
  }
});

/**
 * @route   DELETE /api/curation/items/:itemId
 * @desc    Delete a curated item
 * @access  Private
 */
router.delete('/items/:itemId', authenticateToken, async (req, res) => {
  try {
    // Find the item and verify ownership through session
    const item = await CuratedItem.findOne({ itemId: req.params.itemId });
    if (!item) {
      return res.status(404).json({
        error: 'Item Not Found',
        message: 'Curated item not found'
      });
    }

    // Verify session belongs to user
    const session = await CurationSession.findOne({
      sessionId: item.sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You do not have permission to delete this item'
      });
    }

    await CuratedItem.deleteOne({ itemId: req.params.itemId });

    // Update session item count
    session.itemCount = Math.max(0, session.itemCount - 1);
    await session.save();

    res.json({
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete item'
    });
  }
});

export default router;
