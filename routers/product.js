const express = require('express');
const fs = require('fs');
const mime = require('mime');

const mongoose = require('mongoose');

// model
const Product = require('../models/product');
const Order = require('../models/order');

// middleware
const auth = require('../middleware/auth');

// utils
const utils = require('../utils/response-util');


const router = new express.Router();

router.post(
    '/product',
    auth.verifyAdmin,
    (req, res, next) => {

        try{
            var matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            
            if (matches.length !== 3) {
                res.status(400).json(utils.createResponse(400, "Invalid image", e.message));
            }

            const imgeBuffer = Buffer.from(matches[2], 'base64');
            const extension = mime.extension(matches[1]);
            let fileName =  new Date().getMilliseconds() + '_' + req.body.name + "_product_image." + extension;
            
            fs.writeFileSync('public/product/' + fileName, imgeBuffer, 'utf8');
            req.body.image = 'resources/product/'+ fileName;
        }catch(e){
            res.status(400).json(utils.createResponse(400, "Image upload error", e.message));
        }

        var productData = new Product(req.body);
        productData.save()
            .then(()=> res.status(200).json(utils.createResponse(200, "Product successfully added")))
            .catch(error =>{
                if (error.name === 'ValidationError'){
                    res.status(400).json(utils.createResponse(400, error._message, error.error));
               }else{
                    res.status(500).json(utils.createResponse(500, "Internal server error", error));
               }
            });
    }
);

router.put(
    '/product',
    auth.verifyAdmin,
    (req, res, next) =>{
        Product.findOne({_id: req.body._id}, (error, response)=>{
            if(error){
                res.status(404).json(utils.createResponse(400, error._message, error.error));
            }else{

                if(req.body.name != undefined) response.name = req.body.name;
                if(req.body.description != undefined) response.description = req.body.description;
                if(req.body.price != undefined) response.price = req.body.price;
                if(req.body.categoryId != undefined) response.categoryId = req.body.categoryId;

                
                if(response.image !== req.body.image && req.body.image != undefined){
                    try{
                        var matches = req.body.profileImage.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        
                        if (matches.length !== 3) {
                            res.status(400).json(utils.createResponse(400, "Invalid image", e.message));
                        }

                        const imgeBuffer = Buffer.from(matches[2], 'base64');
                        const extension = matches[1];
                        let fileName =  new Date().getMilliseconds() + '_' + req.body.name + "_product_image." + extension;
            
                        fs.writeFileSync('public/product/' + fileName, imgeBuffer, 'utf8');
                        req.body.image = 'resources/product/'+ fileName;
                    }catch(e){
                        res.status(400).json(utils.createResponse(400, "Product Image upload error", e.message));
                    }
                }

                response.save()
                .then(_ => {
                    res.json(utils.createResponse(200, "Product successfully updated", response));
                })
                .catch(error =>{
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


router.get(
    '/product/:productId',
    auth.verifyAdmin,
    (req, res, next) =>{
        Product.findOne(
            {_id: req.params.productId}, 
            (error, product) => {
                if(error) res.status(400).json(utils.createResponse(500, error.message));
                else res.status(200).json(utils.createResponse(200, 'Product successfully fetched', product));
            }
        );
    }
);

router.delete(
    '/product/:productId',
    auth.verifyAdmin,
    (req, res, next) => {
        Product.deleteOne({_id: req.params.productId}, (error)=>{
            if(error) res.status(400).json(utils.createResponse(400, error.message, error));
            else res.status(200).json(utils.createResponse(200, "Product successfully deleted"));
        });
    }
);

router.get(
    '/products', 
    auth.verifyUser, 
    (req, res, next) =>{
        var conditions = (req.query.categoryId === undefined) ? {} :  {categoryId: req.query.categoryId};
        Product.find(conditions, (error, response)=>{
            if(error)res.status(500).json(utils.createResponse(500, error.message, response));
            else res.status(200).json(utils.createResponse(200, "Products", response));
        });
    }
);


router.get(
    '/products/getAll', 
    auth.verifyUser, 
    (req, res, next) =>{

        Product.aggregate([
            {
                $lookup : {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                },
            },
            {   $unwind:"$category" }   
    ]).then(response =>{
        res.status(200).json(utils.createResponse(200, "Products", response));
    }).catch(error =>{
        res.status(500).json(utils.createResponse(500, error.message, error));
    });
}
);


router.post(
    '/product/order',
    auth.verifyUser,
    (req, res, next) =>{
        var user = req.user;
        var orders = req.body.orders;

        for(order of orders){
            order.userId = user._id;
        }
        Order.insertMany(orders, (error, doc) =>{
            if(error){
                res.status(500).json(utils.createResponse(500, "Internal server error", error));
            }else{
                res.status(200).json(utils.createResponse(200, "Order successfully added"))
            }
        });      
    }
);

router.get(
    '/orders', 
    auth.verifyUser, 
    (req, res, next) =>{
        var result = Order.aggregate([
            {
                $lookup : {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
        }]).then(result => {
            let orders = result.filter(it => req.user._id.toString() == it.userId).map(it => {
                it.product = it.product.length > 0 ? it.product[0] : undefined;
                return it;
            })
            res.json(utils.createResponse(200, "Orders successfully fetched", orders));
        })
        .catch(error => {
            res.status(500).json(utils.createResponse(500, error.message, error));
        });
    }
);

router.get(
    '/order/requests', 
    auth.verifyAdmin, 
    (req, res, next) =>{
        Order.aggregate([
            {
                $lookup : {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                },
            },
            {   $unwind:"$product" },   
            {
                $lookup : {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {   $unwind:"$user" },   
    ]).then(result => {
            let orders = result;
            res.json(utils.createResponse(200, "Orders successfully fetched", orders));
        })
        .catch(error => {
            res.status(500).json(utils.createResponse(500, error.message, error));
        });
    }
);

router.post(
    '/order/status',
    auth.verifyAdmin,
    (req, res, next) =>{
        Order.findById(req.body.orderId, (error, response)=>{
            if(error){
                res.status(400).json(utils.createResponse(400, error.message));
            }else{
                response.status = req.body.status;
                response.save()
                    .then(_ =>{
                        res.status(200).json(utils.createResponse(200, "Orders status successfully changed"));
                    })
                    .catch(error =>{
                        res.status(500).json(utils.createResponse(500, error.message, error))
                    })
            }
        });
    }
)

router.delete(
    '/order/:orderId',
    auth.verifyUser,
    (req, res, next) => {
        Order.deleteOne({_id: req.params.orderId, userId: req.user._id}, (error)=>{
            if(error) res.status(400).json(utils.createResponse(500, error.message));
            else res.status(200).json(utils.createResponse(200, "Order successfully deleted"));
        });
    }
);

module.exports = router;