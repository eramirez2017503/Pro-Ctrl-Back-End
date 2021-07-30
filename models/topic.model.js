'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicSchema = Schema({
    nameTopic: String,
    descriptionTopic: String,
    course: {type: Schema.ObjectId, ref:'course'},
    level: Number,
    lessons: [{type: Schema.ObjectId, ref:'lesson'}],
    imageTopic: String
});

module.exports = mongoose.model('topic', topicSchema);