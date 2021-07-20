'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var progressSchema = Schema({
    user: String,
    course: [{type: Schema.ObjectId, ref:'course'}],
    topic: [{type: Schema.ObjectId, ref:'topic'}],
    total: Number
});

module.exports = mongoose.model('progress', progressSchema);