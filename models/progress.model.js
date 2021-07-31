'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var progressSchema = Schema({
    user: [{type: Schema.ObjectId, ref:'user'}],
    course: [{type: Schema.ObjectId, ref:'course'}],
    lesson: [],
    grades: [],
    total:{type: Number, default: 0}
});

module.exports = mongoose.model('progress', progressSchema);