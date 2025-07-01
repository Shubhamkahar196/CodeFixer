const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new Schema({

    username:{
        type:String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email:{
        type:String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
         match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    password:{
        type:String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },

    // Github integration

    githubId:{
        type:String,
        sparse: true, // allows multiple null values
    },

    githubUsername: {
        type: String,
        sparse: true
    },

    githubAccessToken:{
        type: String,
        select: false  // Don't include in queries by default
    },

    //user profile

    firstName: {
        type:String,
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName:{
        type:String,
        trim:true,
        maxlength: [50, "First name cannot exceed 50 characters"],  
    },

    avatar: {
        type: String,
        default: null
    },

    //User preferences
   
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        theme:{
            type:String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        language:{
            type:String,
            default: 'en'
        }
    },

    //account status

    isActive: {
        type: Boolean,
        default: true
    },

    isVerfied:{
        type:Boolean,
        default: false
    },

    //useage statistics
    repositoriesAnalyzed:{
        type: Number,
        default: 0
    },

    issuesFixed: {
        type:Number,
        defualt: 0
    },

    lastLogin:{
        type:Date,
        defualt: Date.now
    }
    

},{
        timestamps: true,  // Adds createdAt and updatedAt
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    });

    //Virtual for full name

    userSchema.virtuals('fullName').get(function(){
        return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
    })

    // index for better query performance

    userSchema.index({email: 1});
    userSchema.index({githubId: 1});
    userSchema.index({createdAt: -1});

    //pre-save middleware to hash password

   userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

    userSchema.methods.isPasswordCorrect = async function(password){
        return await bcrypt.compare(password, this.password)
    }

    // instance method to update last login
    userSchema.methods.updateLastLogin = function(){
        this.lastLogin = new Date();
        return this.save();
    };


    //static method to find by email or username

    userSchema.statics.findByEmailOrUsername = function(){
        return this.findOne({
            $or: [
                {email: identifier.toLowerCase()},
                {username: identifier}
            ]
        });
    }

    module.exports = mongoose.model ("User", userSchema);