const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    image: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required:true
        },
    description: {
        type: String,
        required:false
        },
    categoryId:{
        type: mongoose.ObjectId,
        require: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        require: true
    }
});

productSchema.plugin(uniqueValidator);
const Product = mongoose.model('Product', productSchema);
module.exports = Product;