const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    profileImage: {
        type: String,
        required:false
    },
    firstname: {
        type: String,
        required:true
    },
    lastname: {
        type: String,
        required:true
    },
    address: {
        type: String,
        required:true
        },
    phone:{
        type: String,
        required:true
    },
    email: {
        type: String,
        unique: true,
        required:true
        },
    password: {
        type: String,
        required:true
        },
    admin: {
        type: Boolean,
        default: false,
        required:false
        },
    gender:{
        type:String
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }]
    });



userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET)
    user.tokens = user.tokens.concat({ token :token })
    await user.save()
    return token
}


userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);
module.exports = User;

