const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    content:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
});

const notesModel = mongoose.model('notes', notesSchema);
module.exports = notesModel;