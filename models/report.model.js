'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportSchema = Schema({
    nameUnit: String,
    grade: Number,
    status: String,
    password: String,
    administrator : {type: Schema.ObjectId, ref: "user"},
    users : [{type: Schema.ObjectId, ref: "user"}] 
});

module.exports = mongoose.model('report', reportSchema);