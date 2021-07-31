'use strict'

var express = require('express');
var reportController = require('../controllers/report.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.post('/:userId/createReport', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.createReport);//Admin
api.post('/:userId/createReportUsers', [mdAuth.ensureAuth], reportController.createReportUsers);//Users
api.put('/:userId/:reportId/updateReport', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.updateReport);
api.get('/:userId/listReportAdmin', [mdAuth.ensureAuth, mdAuth.validRolAdmin], reportController.listReportAdmin); //Admin
api.get('/:userId/listReportUser', [mdAuth.ensureAuth], reportController.listReportUser); //Usuarios
api.delete('/:userId/:reportId/deleteReport', [mdAuth.ensureAuth], reportController.deleteReport);


module.exports = api;