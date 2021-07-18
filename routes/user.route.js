'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middleware/authenticated');
var connectMultiparty = require('connect-multiparty');
var upload = connectMultiparty({ uploadDir: './uploads/users'});

var api = express.Router();

api.post('/signUp', userController.signUp);
api.post('/login', userController.login);
api.put('/updateUser/:id', [mdAuth.ensureAuth], userController.updateUser);
api.delete('/removeUser/:id', [mdAuth.ensureAuth], userController.removeUser);
api.put('/:id/uploadImage', [mdAuth.ensureAuth, upload], userController.uploadImage); //YA
api.get('/getImage/:fileName', [upload], userController.getImage);// N/A

module.exports = api;