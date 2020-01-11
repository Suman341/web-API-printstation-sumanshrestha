const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const mime = require('mime');

// utils
const utils = require('../utils/response-util');

// models
const User = require('../models/user')

// middleware
const auth = require('../middleware/auth');


const router = new express.Router();

router.post(
    "/user/register", 
    (req, res) => {

        if(req.body.profileImage != undefined){
            try{
                var matches = req.body.profileImage.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                
                if (matches.length !== 3) {
                    res.status(400).json(utils.createResponse(400, "Invalid image", e.message));
                }
    
                const imgeBuffer = Buffer.from(matches[2], 'base64');
                const extension = matches[1];
                let fileName =  new Date().getMilliseconds() + '_' + req.body.firstname + "_profile_image." + extension;
                
                fs.writeFileSync('public/profile/' + fileName, imgeBuffer, 'utf8');
                req.body.profileImage = 'resources/profile/'+ fileName;
            }catch(e){
                res.status(400).json(utils.createResponse(400, "Profile Image upload error", e.message));
            }
        }

        req.body.password = bcrypt.hashSync(req.body.password, 10);
        req.body.admin = undefined;

        var userData = new User(req.body);
        userData.save()
            .then(()=> res.status(200).json(utils.createResponse(200, "User successfully created")))
            .catch(error =>{
                if (error.name === 'ValidationError'){
                let errors = [];
                for(key in error.errors){
                    let item = error.errors[key];
                    errors.push({
                        name: key,
                        type: item.kind,
                        message: item.kind == 'unique' ? key + " already exist" : item.message,
                    })
                }
                    return res.status(400).json(utils.createResponse(400, "User details contains malformed data", errors))
               }else{
                    res.status(500).json(utils.createResponse(500, "Internal server error"))
               }
            });
    }
);


router.post(
    "/admin/register", 
    auth.verifyAdmin,
    (req, res) => {

        req.body.password = bcrypt.hashSync(req.body.password, 10);
        var userData = new User(req.body);
        userData.save()
            .then(()=> res.status(200).json(utils.createResponse(200, "User successfully created")))
            .catch(error =>{
                if (error.name === 'ValidationError'){   
                let errors = [];
                for(key in error.errors){
                    let item = error.errors[key];
                    errors.push({
                        name: key,
                        type: item.kind,
                        message: item.kind == 'unique' ? key + " already exist" : item.message,
                    })
                }
                    return res.status(400).json(utils.createResponse(400, "User details contains malformed data", errors))
               }else{
                    res.status(500).json(utils.createResponse(500, "Internal server error"))
               }
            });
    }
);


router.post(
    '/user/login', 
    (req, res, next) => {
        const {email, password} = req.body;
        User.findOne({email: email}, function(error, user){
            if(null == user) {
                res.status(401).json(utils.createResponse(401, "Email or password did not match"));
                return;
            }
            
            bcrypt.compare(password, user.password)
                .then(matched => {
                    if(!matched) {
                        res.status(401).json(utils.createResponse(401, "Email or password did not match"));
                        return;
                    }
                    
                    user.generateAuthToken()
                    .then(token => {
                        res.status(200).json(utils.createResponse(200, "You have been logged in successfully", {token, user})); 
                    })
                    .catch(error =>{
                        res.status(500).json(utils.createResponse(500, error.message))
                    });
                })
                .catch(error=> res.status(500).json(utils.createResponse(500, error.message)));
            
        });
    }
);

router.post(
    '/user/logout',
    auth.verifyUser,
    (req, res, next) =>{
        let headerToken = authHeader.split(' ')[1];
        req.user.tokens = req.user.tokens.filter(token => token.token !== headerToken)

        req.user.save()
        .then(token => {
            res.status(200).json(utils.createResponse(200, "You have been logged out successfully")); 
        })
        .catch(error =>{
            res.status(500).json(utils.createResponse(500, error.message))
        })
    }
);

router.get(
    '/user/profile', 
    auth.verifyUser, 
    (req, res, next) => {
        res.json(utils.createResponse(200, "User successfully fetched", req.user));
    }
);

router.get(
    '/users', 
    auth.verifyAdmin, 
    (req, res, next) => {
        User.find((error, response) =>{
            let users = response.filter(user => req.user._id.toString() !== user._id.toString());
            if(error){
                res.status(500).json(utils.createResponse(500, error.message));
            }else{
                res.json(utils.createResponse(200, "Users successfully fetched", users));
            }
        })
    }
);

router.delete(
    '/user/:userId',
    auth.verifyAdmin,
    (req, res, next) => {
        User.deleteOne({_id: req.params.userId}, (error)=>{
            if(error) res.status(400).json(utils.createResponse(400, error.message, error));
            else res.status(200).json(utils.createResponse(200, "User successfully deleted"));
        });
    }
);

router.put('/user/profile', auth.verifyUser,  (req, res, next) =>{
    var user = req.user;

    if(user.profileImage !== req.body.profileImage && req.body.profileImage !== undefined){
        try{
            var matches = req.body.profileImage.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            
            if (matches.length !== 3) {
                res.status(400).json(utils.createResponse(400, "Invalid image", e.message));
            }

            const imgeBuffer = Buffer.from(matches[2], 'base64');
            const extension = matches[1];
            let fileName =  new Date().getMilliseconds() + '_' + req.body.firstname + "_profile_image." + extension;
            
            fs.writeFileSync('public/profile/' + fileName, imgeBuffer, 'utf8');
            req.body.profileImage = 'resources/profile/'+ fileName;
        }catch(e){
            res.status(400).json(utils.createResponse(400, "Profile Image upload error", e.message));
        }
    }

    if(req.body.firstname != undefined) user.firstname = req.body.firstname;
    if(req.body.lastname != undefined) user.lastname = req.body.lastname;
    
    if(req.body.profileImage != undefined) user.profileImage = req.body.profileImage;
    if(req.body.address != undefined) user.address = req.body.address;
    if(req.body.phone != undefined) user.phone = req.body.phone;
    
    user.save()
    .then(_ =>{
        res.status(400).json(utils.createResponse(400, err.message, err));
    })
    .catch(err =>{
        res.status(200).json(utils.createResponse(200, "success", user));
    });
}
); 


// // Image handel
// const multer = require('multer');
// const path = require("path");

// const storage = multer.diskStorage({
//     destination: "./public/uploads",
//     filename: (req, file, callback) => {
//         let ext = path.extname(file.originalname);
//         callback(null, `${file.fieldname}-${Date.now()}${ext}`);
//     }
// });

// const imageFileFilter = (req, file, cb) => {
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//         return cb(new Error("You can upload only image files!"), false);
//     }
//     cb(null, true);
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: imageFileFilter
// });

// router.post("/imageinsert", upload.single('profileimage'), (req, res) => {
//    res.json(req.file);

// });


module.exports = router;