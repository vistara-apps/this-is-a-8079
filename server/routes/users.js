import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    res.json({
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  authenticateToken,
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    const { email } = req.body;

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, userId: { $ne: user.userId } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Email Already Taken',
          message: 'This email is already associated with another account'
        });
      }
      user.email = email;
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * @route   POST /api/users/upgrade
 * @desc    Upgrade user to Pro subscription
 * @access  Private
 */
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    if (user.subscriptionTier === 'pro') {
      return res.status(400).json({
        error: 'Already Pro',
        message: 'User is already on Pro subscription'
      });
    }

    // In production, this would integrate with Stripe or similar payment processor
    // For now, we'll simulate the upgrade
    user.subscriptionTier = 'pro';
    user.subscriptionStatus = 'active';
    user.updatedAt = new Date();
    
    await user.save();

    res.json({
      message: 'Successfully upgraded to Pro subscription',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upgrade subscription'
    });
  }
});

/**
 * @route   POST /api/users/downgrade
 * @desc    Downgrade user to free subscription
 * @access  Private
 */
router.post('/downgrade', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    if (user.subscriptionTier === 'free') {
      return res.status(400).json({
        error: 'Already Free',
        message: 'User is already on free subscription'
      });
    }

    user.subscriptionTier = 'free';
    user.subscriptionStatus = 'active';
    user.updatedAt = new Date();
    
    await user.save();

    res.json({
      message: 'Successfully downgraded to free subscription',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Downgrade error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to downgrade subscription'
    });
  }
});

/**
 * @route   GET /api/users/usage
 * @desc    Get user usage statistics
 * @access  Private
 */
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    // Check if usage should be reset
    if (new Date() >= user.usageResetDate) {
      user.monthlyUsage = 0;
      user.usageResetDate = new Date();
      user.usageResetDate.setMonth(user.usageResetDate.getMonth() + 1);
      user.usageResetDate.setDate(1);
      user.usageResetDate.setHours(0, 0, 0, 0);
      await user.save();
    }

    const usage = {
      current: user.monthlyUsage,
      limit: user.subscriptionTier === 'pro' ? null : 5,
      resetDate: user.usageResetDate,
      subscriptionTier: user.subscriptionTier,
      canCreateSession: user.canCreateSession()
    };

    res.json({ usage });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve usage statistics'
    });
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', [
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password'
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete('/account', [
  authenticateToken,
  body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { password } = req.body;

    const user = await User.findOne({ userId: req.user.userId, isActive: true });
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Password',
        message: 'Password is incorrect'
      });
    }

    // Deactivate account (soft delete)
    user.isActive = false;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to deactivate account'
    });
  }
});

export default router;
