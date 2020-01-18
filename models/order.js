const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const orderSchema = mongoose.Schema({
    productId: {
        type: mongoose.ObjectId,
        required:true
    },
    userId: {
        type: mongoose.ObjectId,
        required:true
    },
    quantity: {
        type: Number,
        required:true
    },
    status:{
        type: String,
        default: "Pending",
        require: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        require: true
    }
});


orderSchema.plugin(uniqueValidator);
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;