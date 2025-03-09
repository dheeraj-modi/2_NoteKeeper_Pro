require("dotenv").config();
const mongoose = require('mongoose');

function connectDB()
{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to Mongo DB");
    }).catch(err => console.log("error connecting"));
}

module.exports = connectDB;