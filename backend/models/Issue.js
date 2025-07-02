const mongoose = require("mongoose");

const issueSchema = new Schema({
  //repository reference
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },

  //github issue information (if it's a github issue)
  githubIssueId: {
    type: Number,
    sparse: true,  // allow multiple null values
  },

  githubIssueNumber: {
    type: Number,
    sparse: true
  },

  //issue identification
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },

  description:{
    type:String,
    required: [true, 'Issue description is required'],
    trim: true
  },

  //issue classification
  type:{
    type:String,
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

  severity:{
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
        'security-vulnerablility',
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

  //code location

  filePath:{
    type:String,
    required: true,
    trim: true,
  },

  lineNumber: {
    type: Number,
    min:1
  },

  columnNumber:{
    type: Number,
    min: 1
  },

  //code context
  codeSnippet:{
    type: String,
    trim: true,
  },

  affectedLines: {
    start: Number,
    end: Number
  },

//   issue status
status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'ignored'],
    default: 'open'
},

//AI analysis

aiAnalysis: {
    confidence: {
        type: Number,
        min: 0,
        max: 100
    },
    explanation: String,
    suggestedFix: String,
    estimatedEffort: {
        type:String,
        enum: ['low','medium', 'high'],
        default: 'medium'
    },
    tags: [String],
    relatedIssues: [String]
},

// Resoultion information

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
    pullRequestUrl: String,
},

//User interactions

reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},

assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
},

//Issue metadata
labels: [String],

priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
},

estimatedTime: {
    type: Number,
    min: 0
},

actualTime: {
    type: Number,
    min: 0
},

//external references

externalReferences: [{
    type: String,
    enum: [
        'stackoverFlow',
        'github',
        'documentation',
        'blog',
        'other'
    ],
    url: String,
    title: String,
    description: String,
}],

// comments and discussions

comments: [{
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    content: {
        type:String,
        required: true,
        trim: true,
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
}],

//Tracking
viewCount:{
    type:Number,
    default: 0
},

lastViewed: {
    type:Date,
    default: Date.now
},
},{
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});


//indexes for better query performance

issueSchema.index({ repository: 1});
issueSchema.index({ status: 1});
issueSchema.index({ severity: 1});
issueSchema.index({ type: 1});
issueSchema.index({ reportedBy: 1});
issueSchema.index({ assignedTo: 1});
issueSchema.index({ createdAt: -1});
issueSchema.index({ githubIssueId: 1});

