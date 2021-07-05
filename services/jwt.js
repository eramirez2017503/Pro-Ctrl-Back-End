'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'ProCTRL-v1@';

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        rol: user.rol,
        iat: moment().unix(),
        exp: moment().add(5, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}