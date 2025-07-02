/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require("../models/User");

const authenticationToken = async (req,resizeBy, next) =>{
    try{
        //get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];  //Bearer Token
    }
}