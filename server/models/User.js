import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  monthlyUsage: {
    type: Number,
    default: 0,
    min: 0
  },
  usageResetDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  subscriptionId: {
    type: String,
    sparse: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ subscriptionTier: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can create new session
userSchema.methods.canCreateSession = function() {
  if (this.subscriptionTier === 'pro') return true;
  
  // Reset monthly usage if needed
  if (new Date() >= this.usageResetDate) {
    this.monthlyUsage = 0;
    this.usageResetDate = new Date();
    this.usageResetDate.setMonth(this.usageResetDate.getMonth() + 1);
    this.usageResetDate.setDate(1);
    this.usageResetDate.setHours(0, 0, 0, 0);
  }
  
  return this.monthlyUsage < 5;
};

// Increment usage
userSchema.methods.incrementUsage = function() {
  this.monthlyUsage += 1;
  return this.save();
};

// Convert to JSON (exclude sensitive fields)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.stripeCustomerId;
  delete user.subscriptionId;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
