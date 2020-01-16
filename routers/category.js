const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const mime = require('mime');

// utils
const utils = require('../utils/response-util');

// models
const Category = require('../models/category')

// middleware
const auth = require('../middleware/auth');


const router = new express.Router();

router.post(
    '/category',
    auth.verifyAdmin,
    (req, res, next) =>{
        var category = new Category(req.body);
        category.save()
        .then(_ => {
            res.json(utils.createResponse(200, "Category successfully added", category));
        })
        .catch(error =>{
            if (error.name === 'ValidationError'){
                res.status(400).json(utils.createResponse(400, error._message, error.error));
           }else{
                res.status(500).json(utils.createResponse(500, "Internal server error", error));
           }
        })
    }
);


module.exports = router;