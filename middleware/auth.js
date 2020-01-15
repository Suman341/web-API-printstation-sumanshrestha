const jwt = require('jsonwebtoken');
const User = require('../models/user');

// utils
const utils = require('../utils/response-util');

module.exports.verifyUser = (req, res, next) => {
    let authHeader = req.headers.authorization;
    
    if (!authHeader) {
        let error = Error("Unauthorized");  
        error.code = 401;
        return next(error);
    }

    let token = authHeader.split(' ')[1];

    let data;

    try {
        data = jwt.verify(token, process.env.SECRET);
    } catch (err) {
        let error = Error("Unauthorized");  
        error.code = 401;
        return next(error);
    }

    User.findById(data._id)
        .then((user) => {
            req.user = user;
            return next();
        });
}

module.exports.verifyAdmin = (req, res, next) => {
    this.verifyUser(req, res, ()=>{
        if (!req.user || !req.user.admin) {
            let error = Error("Unauthorized");  
            error.code = 401;
            return next(error);
        }else{   
            return next();
        }
    });
}