const mongoose = require("mongoose");

const repositorySchema = new Schema({

    //github repository information
    githubId: {
        type: Number,
        required:true,
        unique: true
    }
})