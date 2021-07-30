'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lessonSchema = Schema({
    nameLesson: String,
    content: String,
    gradeLesson: {type: Number, default: 0},
    topic: {type: Schema.ObjectId, ref:'topic'},
});

module.exports = mongoose.model('lesson', lessonSchema);