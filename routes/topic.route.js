'use strict'

var express = require('express');
var topicController = require('../controllers/topic.controller');
var mdAuth = require('../middleware/authenticated');
var connectMultiparty = require('connect-multiparty');
var upload = connectMultiparty({ uploadDir: './uploads/topics'});

var api = express.Router();

api.post('/:userId/:courseId/createTopic', [mdAuth.ensureAuth], topicController.createTopic);
api.put('/:userId/:courseId/updateTopic/:topicId', [mdAuth.ensureAuth], topicController.updateTopic);
api.delete('/:userId/:courseId/removeTopic/:topicId', [mdAuth.ensureAuth], topicController.deleteTopic);
api.get('/:courseId/listTopics', topicController.listTopics);
api.put('/:userId/:courseId/uploadImageTopic/:topicId', [mdAuth.ensureAuth, upload], topicController.uploadImage);
api.get('/getImageTopic/:fileName', upload, topicController.getImage);

module.exports = api;