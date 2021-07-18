'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs'); 
var jwt = require('../services/jwt');

var fs = require('fs');
var path = require('path');

//CREACIÓN DE ADMIN DE FORMA AUTOMÁTICA
function adminInit(req, res){
    let admin = new User();

    admin.username = 'admin';
    admin.password = '12345';
    admin.rol = 'ADMIN';

    User.findOne({username: admin.username}, (err, adminFind) => {
        if(err){
            console.log('Error al crear al admin')
        }else if(adminFind){
            console.log('administrador ya creado');
        }else{
            bcrypt.hash(admin.password, null, null, (err, passwordHash) => {
                if(err){
                    return res.status(500).send({message:'Error al encriptar la contraseña'});
                }else if(passwordHash){
                    admin.password = passwordHash;
                    admin.save((err, adminSaved) => {
                        if(err){
                            console.log('Error al crear el admin');
                        }else if(adminSaved){
                            console.log('Usuario creado exitosamente');
                        }else{
                            console.log('Usuario no creado, error al crear usuario');
                        }
                    })
                }else{
                    return res.status(401).send({message:'Password no encriptada'});
                }
            })            
        }
    })
}

//CREAR USUARIO COMO MAESTRO O ALUMNO
function signUp(req, res){
    var user = new User();
    var params = req.body;

    if(params.rol && params.name && params.lastname && params.username && params.phone && params.email && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar el username'});
            }else if(userFind){
                return res.send({message:'Username ya existente, por favor elije otro'});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if(err){
                        return res.status(500).send({message:'Error al encriptar la contraseña'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.rol = params.rol;
                        user.phone = params.phone; 
                        user.email = params.email;

                        user.save((err, userSaved) => {
                            if(err){
                                return res.status(500).send({message:'Error al intentar crear el usuario'});
                            }else if(userSaved){
                                return res.send({message:'Te has registrado con exito', userSaved});
                            }else{
                                return res.status(401).send({message:'No se guardo el usuario'});
                            }
                        })
                    }else{
                        return res.status(401).send({message:'Password no encriptada'});
                    }
                })
            }
        })
    }else{
        return res.send({message:'Ingresa todos los parametros minimos'});
    }
}

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar usuario'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, equalsPassword) => {
                    if(err){
                        return res.status(500).send({message:'Error al comparar contraseñas'});
                    }else if(equalsPassword){
                            if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind), userFind});
                        }else{
                            return res.send({message:'Usuario logeado'});
                        }
                    }else{
                        return res.status(404).send({message:'No hay coincidencias en la password'});
                    }
                })
            }else{
                return res.status(404).send({message:'Usuario no encontrado'});
            }
        })
    }else{
        return res.status(404).send({message:'Por favor llena los campos obligatorios'});
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permiso para actualizar esta cuenta'});
    }else{
        if(update.password){
            return res.status(404).send({message:'No se puede actualizar la password'});
        }else{
            if(update.rol){
                return res.status(404).send({message: 'No puedes actualizar el rol'});
            }else if(update.username){
                update.username = update.username.toLowerCase();
                User.findOne({username: update.username.toLowerCase()}, (err, userFind) => {
                    if(err){
                        return res.status(500).send({message:'Error al buscar usuario'});
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Usuario actualizado', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar al usuario'});
                                }
                            })
                        }else{
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
                            if(err){
                                return res.status(500).send({message:'Error al intentar actualizar'});
                            }else if(userUpdated){
                                return res.send({message:'Usuario actualizado', userUpdated});
                            }else{
                                return res.status(500).send({message:'No se puede actualizar'});
                            }
                        });                
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
                    if(err){
                        return res.status(500).send({message:'Error al intentar actualizar'});
                    }else if(userUpdated){
                        return res.send({message:'Usuario actualizado', userUpdated});
                    }else{
                        return res.status(500).send({message:'No se puede actualizar'});
                    }
                })
            }
        }
    }        
}

function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({message:'No tienes permiso para eliminar'});
    }else{
        User.findOne({_id: userId}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar usuario'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPas) => {
                    if(err){
                        return res.status(500).send({message:'Error al buscar password, no olvides colocar la contraseña'});
                    }else if(checkPas){
                        User.findByIdAndRemove(userId, (err, userRemoved) => {
                            if(err){
                                return res.status(500).send({message:'Error al buscar usuario'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado', userRemoved});
                            }else{
                                return res.status(404).send({message:'No se pudo eliminar al usuario o ya fue eliminado'});
                            }
                        })
                    }else{
                        return res.status(500).send({message:'Password incorrecta'});
                    }
                })
            }else{
                return res.status(404).send({message:'El usuario no existe'});
            }
        })        
    }
}

function uploadImage(req, res){
    var userId = req.params.id;
    var update = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(401).send({message:'No tienes permisos'});
    }else{
        // Identifica si vienen archivos
        if(req.files){
            
            //ruta en la que llega la imagen
            var filePath = req.files.image.path;

            //fileSplit separa palabras, direcciones, etc
            // Separar en jerarquia la ruta de la imagen alt + 92 "\\   alt + 124 ||"
            var fileSplit = filePath.split('\\');
            //filePath: document/image/mi-imagen.jpg   0/1/2
            var fileName = fileSplit[2];

            var extension = fileName.split('\.');
            var fileExt = extension[1];
            if( fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
                User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) => {
                    if(err){
                        res.status(500).send({message:'Error general en imagen'});
                    }else if(userUpdate){
                        res.send({user: userUpdate, userImage: userUpdate.image});
                    }else{
                        res.status(401).send({message:'No se ha podido actualizar'});
                    }
                });
            }else{
                fs.unlink(filePath, (err) =>{
                    if(err){
                        res.status(500).send({message:'Extension no valida y error al eliminar el archivo'});
                    }else{
                        res.send({message:'Extension no valida'});
                    }
                })
            }
        }else{
            res.status(404).send({message:'No has enviado una imagen a subir'});
        }
    }
}

function getImage(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/users/' + fileName;

    fs.exists(pathFile, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message:'Imagen inexistente'})
        }
    })
}


module.exports = {
    adminInit,
    signUp,
    login,
    updateUser,
    removeUser,
    uploadImage,
    getImage
}