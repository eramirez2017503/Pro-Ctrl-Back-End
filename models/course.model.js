'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var courseSchema = Schema({
    name : String,
    idCourse : String,
    level : Number, 
    description : String, 
    requirements : String,
    password : String,
    imageCourse : String,
    type : String,
    topics : [{type: Schema.ObjectId, ref: "topic"}],
    administrator : {type: Schema.ObjectId, ref: "user"},
    users : [{type: Schema.ObjectId, ref: "user"}]
});

module.exports = moongose.model('course', courseSchema);