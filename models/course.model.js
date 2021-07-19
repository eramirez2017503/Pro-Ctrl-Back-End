'use strict'

var moongose = require('mongoose');
var Schema = moongose.Schema;

var courseSchema = Schema({
    name : String,
    idCourse : String,
    level : String, 
    description : String, 
    requirements : String,
    password : String,
    imageCourse : String,
    themes : [{type: Schema.ObjectId, ref: "theme"}], //falta revisar el nombre que se ponga a la colleción.
    administrator : {type: Schema.ObjectId, ref: "user"},
    users : [{type: Schema.ObjectId, ref: "user"}]
});

module.exports = moongose.model('course', courseSchema);