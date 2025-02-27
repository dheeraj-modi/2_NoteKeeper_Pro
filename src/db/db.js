const mongoose = require('mongoose');

function connectDB()
{
    mongoose.connect("mongodb://0.0.0.0/NoteKeeperPro")
    .then(()=>{
        console.log("Connected to Mongo DB");
    }).catch(err => console.log("error connecting"));
}

module.exports = connectDB;