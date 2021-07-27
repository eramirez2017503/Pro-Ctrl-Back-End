'use strict'

var express = require('express');
var progressController = require('../controllers/progress.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/:id/:idC/:idT/createProgress', [mdAuth.ensureAuth], progressController.createProgress);
api.put('/:id/updateProgress/:idP', [mdAuth.ensureAuth], progressController.updateProgress);
api.post('/:id/deleteProgress/:idP', [mdAuth.ensureAuth], progressController.deleteProgress);
api.get('/:idT/listProgress', [mdAuth.ensureAuth], progressController.listProgress);

module.exports = api;
