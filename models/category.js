const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const categorySchema = mongoose.Schema({
    category: {
        type: String,
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        require: true
    }
});

categorySchema.plugin(uniqueValidator);
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;