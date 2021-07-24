'use strict'

var express = require('express');
var reportController = require('../controllers/report.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/createReport/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.createReport);
api.put('/:userId/updateReport/:reportId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.updateReport);
api.get('/listReportAdmin/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.listReportAdmin); //Admin
api.get('/listReportUser/:userId', [mdAuth.ensureAuth, mdAuth.validRolAlumno], reportController.listReportUser); //Usuarios
api.delete('/:userId/deleteReport/:reportId', [mdAuth.ensureAuth], reportController.deleteReport);


module.exports = api;