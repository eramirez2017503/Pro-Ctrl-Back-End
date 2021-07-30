'use strict'

var express = require('express');
var lessonController = require('../controllers/lesson.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/:userId/:topicId/createLesson', [mdAuth.ensureAuth], lessonController.createLesson);
api.put('/:userId/:courseId/:topicId/updateLesson/:lessonId', [mdAuth.ensureAuth], lessonController.updateLesson);
api.post('/:userId/:courseId/:topicId/removeLesson/:lessonId', [mdAuth.ensureAuth], lessonController.deleteLesson);
api.get('/:topicId/listLessons', lessonController.listLessons);

module.exports = api;