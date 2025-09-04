import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findOne({ 
      userId: decoded.userId, 
      isActive: true 
    }).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'User not found or inactive'
      });
    }

    // Add user info to request
    req.user = {
      userId: user.userId,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Token is malformed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Please login again'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has Pro subscription
 */
export const requirePro = (req, res, next) => {
  if (req.user.subscriptionTier !== 'pro') {
    return res.status(403).json({
      error: 'Pro Subscription Required',
      message: 'This feature requires a Pro subscription'
    });
  }
  next();
};

/**
 * Middleware to check usage limits for free users
 */
export const checkUsageLimit = async (req, res, next) => {
  try {
    if (req.user.subscriptionTier === 'pro') {
      return next(); // Pro users have unlimited usage
    }

    const user = await User.findOne({ userId: req.user.userId });
    if (!user.canCreateSession()) {
      return res.status(429).json({
        error: 'Usage Limit Exceeded',
        message: 'Free tier limit of 5 sessions per month reached. Upgrade to Pro for unlimited access.',
        upgradeUrl: '/upgrade'
      });
    }

    next();
  } catch (error) {
    console.error('Usage limit check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check usage limits'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ 
      userId: decoded.userId, 
      isActive: true 
    }).select('-password');

    req.user = user ? {
      userId: user.userId,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    } : null;

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};
