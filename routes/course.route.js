'use strict'

var express = require('express');
var courseController = require('../controllers/course.controller');
var mdAuth = require('../middleware/authenticated');
var connectMultiparty = require('connect-multiparty');
var upload = connectMultiparty({uploadDir: './uploads/course'});

var api = express.Router();

api.post('/createCourse/:userId', [mdAuth.ensureAuth], courseController.createCourse); //revisar quien lo creará 
api.put('/:userId/updateCourse/:courseId', [mdAuth.ensureAuth], courseController.updateCourse);//maestro y admin
api.post('/:userId/deleteCourse/:courseId', [mdAuth.ensureAuth, mdAuth.validRolAdmin || mdAuth.validRolMaestro], courseController.deleteCourse); //maestro y admin
api.get('/getCourseById/:courseId', [mdAuth.ensureAuth], courseController.getCourseById);
api.get('/listMyCourses/:userId', [mdAuth.ensureAuth], courseController.listMyCourses); //Lista de cursos asignados o cursos de alumnos. 
api.put('/:userId/uploadImage/:courseId', [mdAuth.ensureAuth, upload], courseController.uploadImage); //imagen
api.get('/getImageCourse/:fileName', [upload], courseController.getImageCourse);//imagen 

api.get('/getlistCoursesPublic',  courseController.listCoursesPublic); //lista para los no logueados
api.get('/getAllCourses', courseController.listAllCourses); //mostrar todos los cursos, incluso los privados para los loguedos
api.post('/:userId/inscriptionCourse/:courseId', [mdAuth.ensureAuth, mdAuth.validRolAlumno || mdAuth.validRolAdmin], courseController.inscriptionCourse); //inscripción
api.post('/:userId/verifyProgress/:courseId', [mdAuth.ensureAuth, mdAuth.validRolAlumno], courseController.verifyProgress); //para verificar si esta suscrito
api.post('/:userId/updatePassword/:courseId', [mdAuth.ensureAuth], courseController.updatePassword); //actualizar la password
api.post('/:userId/deleteCourseUser/:courseId', [mdAuth.ensureAuth], courseController.deleteCourseUser); //actualizar la password


module.exports = api;