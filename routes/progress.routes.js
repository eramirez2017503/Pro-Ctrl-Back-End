'use strict'

var express = require('express');
var progressController = require('../controllers/progress.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.put('/:id/:idC/updateProgress', progressController.updateProgress);
api.post('/:id/:idC/listProgress', progressController.listProgress);

module.exports = api;
