import mongoose from 'mongoose';

const curationSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  itemCount: {
    type: Number,
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
curationSessionSchema.index({ userId: 1, status: 1 });
curationSessionSchema.index({ sessionId: 1 });
curationSessionSchema.index({ createdAt: -1 });

// Virtual for curated items
curationSessionSchema.virtual('curatedItems', {
  ref: 'CuratedItem',
  localField: 'sessionId',
  foreignField: 'sessionId'
});

// Ensure virtual fields are serialized
curationSessionSchema.set('toJSON', { virtuals: true });

// Methods
curationSessionSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

curationSessionSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

curationSessionSchema.methods.incrementItemCount = function() {
  this.itemCount += 1;
  return this.save();
};

// Static methods
curationSessionSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, status: 'active' });
};

curationSessionSchema.statics.findByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const CurationSession = mongoose.model('CurationSession', curationSessionSchema);

export default CurationSession;
