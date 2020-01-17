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

router.put(
    '/category/:categoryId',
    auth.verifyAdmin,
    (req, res, next) =>{
        Category.findOne({_id: req.params.categoryId}, (error, response)=>{
            if(error){
                res.status(404).json(utils.createResponse(400, error._message, error.error));
            }else{
                response.category = req.body.category;
                response.save()
                .then(_ => {
                    res.status(200).json(utils.createResponse(200, "Category successfully updated", response));
                })
                .catch(error =>{
                    console.log(error);
                    if (error.name === 'ValidationError'){
                        res.status(400).json(utils.createResponse(400, error._message, error.error));
                   }else{
                        res.status(500).json(utils.createResponse(500, "Internal server error", error));
                   }
                });

            }
        });
    }
);

router.delete(
    '/category/:categoryId',
    auth.verifyAdmin,
    (req, res, next) => {
        Category.deleteOne({_id: req.params.categoryId}, (error)=>{
            if(error) res.status(400).json(utils.createResponse(500, error.message));
            else res.status(200).json(utils.createResponse(200, "Category successfully deleted"));
        });
    }
);

router.get(
    '/category/:categoryId',
    auth.verifyUser,
    (req, res, next) => {
        Category.findOne({_id: req.params.categoryId}, (error, response)=>{
            if(error){
                res.status(500).json(utils.createResponse(500, error.message, error));
            }else{
                res.json(utils.createResponse(200, "Category successfully fetched", response));
            }
        });
    }
);

router.get(
    '/categories',
    auth.verifyUser,
    (req, res, next) => {
        Category.find((error, response)=>{
            if(error){
                res.status(500).json(utils.createResponse(500, error.message, error));
            }else{
                res.json(utils.createResponse(200, "Category successfully fetched", response));
            }
        });
    }
);

module.exports = router;