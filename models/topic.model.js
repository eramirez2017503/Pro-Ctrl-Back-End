'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var topicSchema = Schema({
    nameTopic: String,
    descriptionTopiv: String,
    cursos: {type: Schema.ObjectId, ref:'curso'},
    level: Number,
    content: String,
    ImageTopic: String
});

module.exports = mongoose.model('topic', userSchema);