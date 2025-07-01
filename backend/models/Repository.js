const mongoose = require("mongoose");

const repositorySchema = new Schema({

    //github repository information
    githubId: {
        type: Number,
        required:true,
        unique: true
    },

    name:{
        type:String,
        required: [true, 'Repository name is required'],
        trim: true
    },

    fullName: {
        type: String,
        required: [true, 'Repository full name is required'],
        unique: true,
        trim: true
    },

    owner:{
        login:{
            type:String,
            required: true
        },

        id:{
            type: Number,
            required: true
        },

        avatar_url: String,
        type:{
            type:String,
            enum: ['User', 'Organization'],
            default: 'User'
        }
    },

    description: {
        type: String,
        trim: true
    },

    //Repository urls

    htmlUrl: {
        type:String,
        required: true
    },

    cloneUrl: {
        type:String,
        required: true
    },

    //Repository metadata
    language: {
        type:String,
        trim: true
    },

    languages: [{
        name:String,
        percentage: Number
    }],

    topics: [String],

    //Repository statistics

    stargazersCount: {
        type: Number,
        default: 0
    },

    forksCount: {
        type: Number,
        default: 0
    },

    openIssuesCount:{
        type: Number,
        default: 0
    },

    size: {
        type: Number,
        default: 0
    },

    // repository status
    
    isPrivate: {
        type: Boolean,
        default: false
    },

    isFork:{
        type:Boolean,
        default: false
    },

    //Analysis information

    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    analysisStatus: {
        type:String,
        enum: ['pending', 'analyzing', 'completed', 'failed'],
        default: 'pending'
    },

    lastAnalyzed: {
        type: Date,
        default: null
    },

    analysisCount: {
        type: Number,
        default: 0
    },

    //analysis results summary

    totalIssuesFound: {
        type: Number,
        default: 0
    },

    criticalIssues: {
        type: Number,
        default: 0
    },

    warningIssues: {
        type:Number,
        default: 0
    },

    infoIssues: {
        type:Number,
        default: 0
    },

    //repository health score(0-100)

    healtScore:{
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    //github repository dates

    githubCreatedAt:{
        type: Date,
        required: true
    },

    githubUpdatedAt:{
        type: Date,
        required: true,
    },

    githubPushedAt:{
        type: Date
    },

    //access permissions

    permissions: {
        admin: {
            type:Boolean,
            default: false
        },

        push: {
            type: Boolean,
            default: false,
        },

        pull: {
            type: Boolean,
            default: true,
        },
        
    },

    //webhook information

    webhookId:{
        type: Number,
        default: null,
    },

    webhookId:{
        type: Number,
        default: null
    },

    webhookActive: {
      type: Boolean,
     default: false
    },
},{
    timeStamps: true,
    toJson: {virtuals: true},
    toObject: {virtuals: true}
})

// Indexes for better query performance
repositorySchema.index({ githubId: 1 });
repositorySchema.index({ fullName: 1 });
repositorySchema.index({ addedBy: 1 });
repositorySchema.index({ analysisStatus: 1 });
repositorySchema.index({ lastAnalyzed: -1 });
repositorySchema.index({ 'owner.login': 1 });


//virtual for repository url

repositorySchema.virtual('url').get(function (){
    return this.htmlUrl;
});

//virtual for analysis status display 
repositorySchema.virtual('analysisStatusDisplay').get(function () {
    const statusMap = {
        pending: 'Pending Analysis',
        analyzing: 'Analyzing...',
        completed: 'Analysis Complete',
        failed: 'Analysis Failed'
    };

    return statusMap[this.analysisStatus] || this.analysisStatus;
});

// instance method to update analysis status

repositorySchema.methods.updateAnlaysisStatus = function(status, results = {} ){
     this.analysisStatus = status;
  this.lastAnalyzed = new Date();
  this.analysisCount += 1;
  
  if (results.totalIssues !== undefined) {
    this.totalIssuesFound = results.totalIssues;
  }
  if (results.criticalIssues !== undefined) {
    this.criticalIssues = results.criticalIssues;
  }
  if (results.warningIssues !== undefined) {
    this.warningIssues = results.warningIssues;
  }
  if (results.infoIssues !== undefined) {
    this.infoIssues = results.infoIssues;
  }
  if (results.healthScore !== undefined) {
    this.healthScore = results.healthScore;
  }
  
  return this.save();
}


//static method to find repositories by user

repositorySchema.statics.findByUser = function(userId){
    return this.find({
        addeddBy: userId
    }).populate('addedBy', 'username email');
};

//static method to find repositories needing analysis

repositorySchema.statics.findPendingAnalysis = function (){
    return this.find({
        analysisStatus: { $in: ['pending', 'failed']}
    }).populate('addedBy', 'username email')
};

module.exports = mongoose.model('Repository', repositorySchema);