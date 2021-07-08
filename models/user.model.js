'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    rol: String,
    phone: Number,
    email: String,
    password: String,
    image: String,
    courses: [{type: Schema.ObjectId, ref:'course'}],
    //Progreso: ??
});

module.exports = mongoose.model('user', userSchema);