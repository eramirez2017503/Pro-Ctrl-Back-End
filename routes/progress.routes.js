'use strict'

var express = require('express');
var progressController = require('../controllers/progress.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/:id/:idC/createProgress', [mdAuth.ensureAuth], progressController.createProgress);
api.put('/:id/:idC/:idL/updateProgress/:idP', [mdAuth.ensureAuth], progressController.updateProgress);
api.post('/:id/deleteProgress/:idP', [mdAuth.ensureAuth], progressController.deleteProgress);
api.get('/:id/:idC/listProgressbyLesson', progressController.listProgressbyLesson);
api.post('/:id/:idC/listProgress', progressController.listProgress);

module.exports = api;
