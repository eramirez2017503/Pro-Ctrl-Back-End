'use strict'

var mongoose = require('mongoose');
var app = require('./App')
var port = 3200;
var adminInit = require('./controllers/user.controller');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/ProCtrl', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('El servidor de Node JS esta funcionando');
        adminInit.adminInit();
        app.listen(port, () => {
            console.log('Servidor de Express esta corriendo');
        })
    })
    .catch((err) => {
        console.log('Error al conecctar la BD', err)
    })