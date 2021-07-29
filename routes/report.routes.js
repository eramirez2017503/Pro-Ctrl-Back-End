'use strict'

var express = require('express');
var reportController = require('../controllers/report.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/createReport/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.createReport);//Admin
api.post('/createReportUsers/:userId', [mdAuth.ensureAuth], reportController.createReportUsers);//Users
api.put('/:userId/updateReport/:reportId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.updateReport);
api.get('/listReportAdmin/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.listReportAdmin); //Admin
api.get('/listReportUser/:userId', [mdAuth.ensureAuth], reportController.listReportUser); //Usuarios
api.delete('/:userId/deleteReport/:reportId', [mdAuth.ensureAuth], reportController.deleteReport);


module.exports = api;