import mongoose from 'mongoose';

const curatedItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'CurationSession'
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 5000
  },
  sourceUrl: {
    type: String,
    required: true,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  threadTitle: {
    type: String,
    trim: true,
    maxlength: 300
  },
  redditData: {
    subreddit: {
      type: String,
      trim: true
    },
    postId: {
      type: String,
      trim: true
    },
    commentId: {
      type: String,
      trim: true
    },
    author: {
      type: String,
      trim: true
    },
    upvotes: {
      type: Number,
      min: 0
    }
  },
  metadata: {
    wordCount: {
      type: Number,
      min: 0
    },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    topics: [{
      type: String,
      trim: true
    }],
    extractedAt: {
      type: Date,
      default: Date.now
    }
  },
  highlightedAt: {
    type: Date,
    default: Date.now
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
curatedItemSchema.index({ sessionId: 1 });
curatedItemSchema.index({ itemId: 1 });
curatedItemSchema.index({ highlightedAt: -1 });
curatedItemSchema.index({ 'redditData.subreddit': 1 });

// Pre-save middleware to calculate word count
curatedItemSchema.pre('save', function(next) {
  if (this.isModified('text')) {
    this.metadata.wordCount = this.text.split(/\s+/).length;
  }
  next();
});

// Methods
curatedItemSchema.methods.extractRedditInfo = function() {
  const url = this.sourceUrl;
  const redditMatch = url.match(/reddit\.com\/r\/([^\/]+)\/comments\/([^\/]+)/);
  
  if (redditMatch) {
    this.redditData.subreddit = redditMatch[1];
    this.redditData.postId = redditMatch[2];
    
    // Extract comment ID if present
    const commentMatch = url.match(/#([a-zA-Z0-9]+)$/);
    if (commentMatch) {
      this.redditData.commentId = commentMatch[1];
    }
  }
  
  return this;
};

// Static methods
curatedItemSchema.statics.findBySession = function(sessionId) {
  return this.find({ sessionId }).sort({ highlightedAt: -1 });
};

curatedItemSchema.statics.findByUser = function(userId) {
  return this.aggregate([
    {
      $lookup: {
        from: 'curationsessions',
        localField: 'sessionId',
        foreignField: 'sessionId',
        as: 'session'
      }
    },
    {
      $match: {
        'session.userId': userId
      }
    },
    {
      $sort: { highlightedAt: -1 }
    }
  ]);
};

curatedItemSchema.statics.getTopicStats = function(sessionId) {
  return this.aggregate([
    { $match: { sessionId } },
    { $unwind: '$metadata.topics' },
    {
      $group: {
        _id: '$metadata.topics',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

const CuratedItem = mongoose.model('CuratedItem', curatedItemSchema);

export default CuratedItem;
