const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:false
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    authType:{
        type:String,
        enum:["google","local"],
        required:true
    }
})
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;