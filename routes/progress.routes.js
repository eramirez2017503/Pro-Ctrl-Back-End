'use strict'

var express = require('express');
var progressController = require('../controllers/progress.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.put('/:id/:idC/:idL/updateProgress', mdAuth.ensureAuth, progressController.updateProgress);
api.post('/:id/:idC/listProgress', mdAuth.ensureAuth, progressController.listProgress);
api.post('/:id/:idC/listProgressAdmin', mdAuth.ensureAuth, progressController.listProgressAdmin);
api.post('/:id/:idC/:idT/listProgress', mdAuth.ensureAuth, progressController.listProgressByTopic);
api.get('/:courseId/usersInProgress', progressController.getUsersCourse);

module.exports = api;