'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var progressSchema = Schema({
    user: String,
    course: [{type: Schema.ObjectId, ref:'course'}],
    themes: [{type: Schema.ObjectId, ref:'themes'}],
    total: Number
});

module.exports = mongoose.model('progress', progressSchema);