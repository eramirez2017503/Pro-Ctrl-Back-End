'use strict'

var express = require('express');
var courseController = require('../controllers/course.controller');
var mdAuth = require('../middleware/authenticated');
var connectMultiparty = require('connect-multiparty');
var upload = connectMultiparty({uploadDir: './uploads/course'});

var api = express.Router();

api.post('/createCourse/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], courseController.createCourse); //revisar quien lo creará 
api.put('/:userId/updateCourse/:courseId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], courseController.updateCourse);//maestro
api.post('/:userId/deleteCourse/:courseId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], courseController.deleteCourse); //maestro
api.get('/getCourseById/:courseId', [mdAuth.ensureAuth], courseController.getCourseById);
api.get('/listCoursesAdmin/:userId', [mdAuth.ensureAuth, mdAuth.validRolAdmin], courseController.listCoursesAdmin); //maestro
api.get('/listCoursesUser/:userId', [mdAuth.ensureAuth, mdAuth.validRolAlumno], courseController.listCoursesUser);
api.post('/:userId/uploadImage/:courseId', [mdAuth.ensureAuth, mdAuth.validRolMaestro], courseController.uploadImage);
api.get('/getImageCourse/:fileName', [upload], courseController.getImageCourse);

module.exports = api;