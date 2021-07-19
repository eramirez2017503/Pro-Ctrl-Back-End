'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicSchema = Schema({
    nameTopic: String,
    descriptionTopic: String,
    course: {type: Schema.ObjectId, ref:'course'},
    level: Number,
    content: String,
    ImageTopic: String
});

module.exports = mongoose.model('topic', topicSchema);