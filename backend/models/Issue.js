const mongoose = require("mongoose");

const issueSchema = new Schema(
  {
 // Repository reference
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  
  // GitHub issue information (if it's a GitHub issue)
  githubIssueId: {
    type: Number,
    sparse: true // Allows multiple null values
  },
  
  githubIssueNumber: {
    type: Number,
    sparse: true
  },
  
  // Issue identification
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true
  },
  
  // Issue classification
  type: {
    type: String,
    enum: [
      'bug',
      'security',
      'performance',
      'code-quality',
      'documentation',
      'dependency',
      'style',
      'test',
      'enhancement',
      'other'
    ],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
    default: 'medium'
  },
  
  category: {
    type: String,
    enum: [
      'syntax-error',
      'logic-error',
      'security-vulnerability',
      'performance-issue',
      'code-smell',
      'unused-code',
      'deprecated-api',
      'missing-documentation',
      'test-coverage',
      'dependency-issue',
      'other'
    ],
    required: true
  },
  
  // Code location
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  
  lineNumber: {
    type: Number,
    min: 1
  },
  
  columnNumber: {
    type: Number,
    min: 1
  },
  
  // Code context
  codeSnippet: {
    type: String,
    trim: true
  },
  
  affectedLines: {
    start: Number,
    end: Number
  },
  
  // Issue status
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'ignored'],
    default: 'open'
  },
  
  // AI Analysis
  aiAnalysis: {
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    explanation: String,
    suggestedFix: String,
    estimatedEffort: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    tags: [String],
    relatedIssues: [String]
  },
  
  // Resolution information
  resolution: {
    method: {
      type: String,
      enum: ['manual', 'ai-assisted', 'automated'],
      default: null
    },
    description: String,
    appliedFix: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    commitHash: String,
    pullRequestUrl: String
  },
  
  // User interactions
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Issue metadata
  labels: [String],
  
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  estimatedTime: {
    type: Number, // in minutes
    min: 0
  },
  
  actualTime: {
    type: Number, // in minutes
    min: 0
  },
  
  // External references
  externalReferences: [{
    type: {
      type: String,
      enum: ['stackoverflow', 'github', 'documentation', 'blog', 'other']
    },
    url: String,
    title: String,
    description: String
  }],
  
  // Comments and discussions
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  
  lastViewed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
issueSchema.index({ repository: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ type: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ githubIssueId: 1 });

// Virtual for issue priority display
issueSchema.virtual('priorityDisplay').get(function() {
  const priorityMap = {
    1: 'Lowest',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Highest'
  };
  return priorityMap[this.priority] || 'Medium';
});

// Virtual for severity color
issueSchema.virtual('severityColor').get(function() {
  const colorMap = {
    critical: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745',
    info: '#17a2b8'
  };
  return colorMap[this.severity] || '#6c757d';
});

// Instance method to add comment
issueSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content,
    createdAt: new Date()
  });
  return this.save();
};


// instance method to resolve issue

issueSchema.methods.resolve = function(resolvedBy, method, description, appliedFix){

    this.status = 'resolved';
    this.resolution ={
         method: method,
    description: description,
    appliedFix: appliedFix,
    resolvedBy: resolvedBy,
    resolvedAt: new Date()
    }
    return this.save();
}

// Static method to find issues by repository
issueSchema.statics.findByRepository = function(repositoryId) {
  return this.find({ repository: repositoryId })
    .populate('reportedBy', 'username email')
    .populate('assignedTo', 'username email')
    .populate('resolution.resolvedBy', 'username email');
};

// Static method to find open issues
issueSchema.statics.findOpenIssues = function() {
  return this.find({ status: { $in: ['open', 'in-progress'] } })
    .populate('repository', 'name fullName')
    .populate('reportedBy', 'username email');
};

module.exports = mongoose.model('Issue', issueSchema);