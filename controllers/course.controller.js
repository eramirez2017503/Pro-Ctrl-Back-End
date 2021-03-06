'use strict'

var Course = require('../models/course.model');
var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs'); 
var fs = require('fs');
var path = require('path');


function createCourse(req, res){
    var userId = req.params.userId;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el usuario'});
            }else if(userFind){
                Course.findOne({idCourse : params.idCourse, name : params.name}, (err, courseFind)=>{ //buscar si el nombre o courseId ya existe
                    //posiblemente convertir a toLowerCase------------ revisar luego
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el curso'});
                    }else if(courseFind){
                        return res.send({message: 'El nombre identificador del curso ya existe'});
                    }else{ //El campo de la contraseña será opcional y de esto se encaragar un ngIf de angular
                        let course = new Course();
                        course.nombre = params.name;
                        course.idCourse = params.idCourse;
                        course.level = params.level;
                        course.description = params.description;
                        course.requirements = params.requirements;
                        administrator = userId; 
                        if(params.password == null || params.password == ''){ //si viene contraseña nula (para los publicos)
                            course.password = '';
                            course.save((err, courseSaved)=>{
                                if(err){
                                    return res.status(400).send({message:'Error general al guardar el curso'});
                                }else if(courseSaved){
                                    User.findByIdAndUpdate(userId, {$push : {courses : courseSaved}}, {new : true}, (err, coursePush)=>{
                                        if(err){
                                            return res.status(400).send({message:'Error general al guardar el curso'});
                                        }else if(coursePush){
                                            return res.send({message:'El curso se guardo satisfactoriamente', coursePush});
                                        }else{
                                            return res.send({message: 'No se pudo guardar el curso deseado'});
                                        }
                                    })
                                }else{
                                    return res.send({message: 'No se pudo guardar el curso'});
                                }
                            });
                        }else{ //si es curso privado necesitara tener contraseña 
                            bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                                if(err){
                                    return res.status(500).send({message:'Error al encriptar la contraseña'});
                                }else if(passwordHash){
                                    course.password = passwordHash;
                                    course.save((err, courseSaved)=>{
                                        if(err){
                                            return res.status(400).send({message:'Error general al guardar el curso'});
                                        }else if(courseSaved){
                                            User.findByIdAndUpdate(userId, {$push : {courses : courseSaved}}, {new : true}, (err, coursePush)=>{
                                                if(err){
                                                    return res.status(400).send({message:'Error general al guardar el curso'});
                                                }else if(coursePush){
                                                    return res.send({message:'El curso se guardo satisfactoriamente', coursePush});
                                                }else{
                                                    return res.send({message: 'No se pudo guardar el curso deseado'});
                                                }
                                            })
                                        }else{
                                            return res.send({message: 'No se pudo guardar el curso'});
                                        }
                                    });
                                }else{
                                    return res.status(401).send({message:'Password no encriptada'});
                                }
                            })       
                        }
                    }
                });
            }else{
                return res.send({message: 'El usuario no fue encontrado'});
            }
        })
    }
}

function updateCourse(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params = req.body;
    var actualizacion = false; 

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el usuario'});
            }else if(userFind){
                Course.findById(courseId, (err, courseFind)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el curso'});
                    }else if(courseFind){
                        if(params.name != courseFind.name || params.idCourse != courseFind.idCourse){
                            if(params.name != courseFind.name){ //si se cambio el nombre
                                Course.findOne({name : params.name}, (err, courseNameFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseNameFind){
                                        return res.send({message: 'Ya existente un curso con este nombre'})
                                    }else{  
                                        Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al actualizar'});
                                            }else if(courseUpdated){
                                                actualizacion = true;
                                            }else{
                                                return res.send({message: 'No se pudo actualizar el curso'})
                                            }
                                        });
                                    }
                                });
                            }
                            if(params.idCourse != courseFind.idCourse){
                                Course.findOne({idCourse : params.idCourse}, (err, courseNameFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseNameFind){
                                        return res.send({message: 'Ya existente un curso con este identificador'})
                                    }else{  
                                        Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al actualizar'});
                                            }else if(courseUpdated){
                                                actualizacion = true;
                                            }else{
                                                return res.send({message: 'No se pudo actualizar el curso'})
                                            }
                                        });
                                    }
                                });
                            }
                            if(actualizacion){
                                return res.status(200).send({message:'Se actualizo el curso satisfactoriamente'});
                            }
                        }else{
                            Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                if(err){
                                    return res.status(500).send({message:'Error general al actualizar'});
                                }else if(courseUpdated){
                                    return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar el curso'})
                                }
                            });
                        }
                    }else{
                        return res.send({message: 'No se encontro el curso para actualizarlo'})
                    }
                });
            }else{
                return res.send({message:'No se encontro al usuario'});
            }
        })
    }
}

function deleteCourse(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params =  req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message:'Error general al buscar el usuario'});
            }else if (userFind){
                Course.findOne({_id : courseId, administrator: userId}, (err, courseFind)=>{
                    if(err){
                        return res.status(500).send({message:'Error general al buscar el equipo'});
                    }else if(courseFind){
                        bcrypt.compare(params.password, userFind.password, (err, equalsPassword)=>{
                            if(err){
                                return res.status(500).send({message:'Error al comparar contraseñas'});    
                            }else if(equalsPassword){
                                User.findOneAndUpdate({_id : userId, courses : courseId}, {$pull : {courses : courseId}}, {new : true}, (err, userUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error general al actualizar el usuario'});
                                    }else if(userUpdated){
                                        Course.findByIdAndRemove(courseId, (err, courseDelete)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al eliminar el curso'});
                                            }else if(courseDelete){
                                                return res.send({message: 'El curso fue eliminado', courseDelete});
                                            }else{
                                                return res.status(404).send({message:'No se pudo eliminar el curso o ya fue eliminado'});
                                            }
                                        });
                                    }else{
                                        return res.status(404).send({message:'No se pudo eliminar el curso del administrador'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'No se pudo eliminar el equipo de la liga'});
                            }
                        })
                    }else{
                        return res.status(404).send({message:'No se pudo encontrar el curso deseado'});
                    }
                });
            }else{
                return res.status(404).send({message:'No se pudo encontrar el usuario deseado'});
            }
        })
    }
}

function getCourseById(req, res){
    var courseId = req.params.courseId;

    if(courseId){
        Course.findOne({_id : courseId}, (err, courseFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al obtener el curso'});
            }else if(courseFind){
                return res.send({message: 'Curso encontrado', courseFind})
            }else{
                return res.status(404).send({message:'No se encontraron coincidencias'});
            }
        })
    }else{
        return res.status(404).send({message:'No se encontraro el curso'});
    }
}

function listCoursesAdmin(req, res){
    var userId = req.params.userId; 

    Course.find({administrator : userId}).exec((err, coursesFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener los cursos'});
        }else if(coursesFind){
            return res.send({message: 'Cursos encontrados', coursesFind});
        }else{
            return res.status(500).send({message: 'Error general al obtener los cursos'});            
        }
    });
}

function listCoursesUser(req, res){
    var userId = req.params.userId; 

    Course.find({users : userId}).exec((err, coursesFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener los cursos'});
        }else if(coursesFind){
            return res.send({message: 'Cursos encontrados', coursesFind});
        }else{
            return res.status(500).send({message: 'Error general al obtener los cursos'});            
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var fileName;

    if(userId != req.user.sub){
        res.status(401).send({message:'No tienes permisos'});
    }else{
        // Identifica si vienen archivos
        if(req.files.imageCourse){
            //ruta en la que llega la imagen
            var filePath = req.files.imageCourse.path;
            
            //fileSplit separa palabras, direcciones, etc
            // Separar en jerarquia la ruta de la imagen alt + 92 "\\   alt + 124 ||"
            var fileSplit = filePath.split('\\');
            //filePath: document/image/mi-imagen.jpg   0/1/2
            var fileName = fileSplit[2];

            var extension = fileName.split('\.');
            var fileExt = extension[1];
            if( fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
                Course.findOneAndUpdate({_id: courseId, administrator : userId}, {imageTeam: fileName}, {new: true}, (err, courseUpdate) => {
                    if(err){
                        res.status(500).send({message:'Error general en imagen'});
                    }else if(courseUpdate){
                        res.send({course: courseUpdate, imageCourse: courseUpdate.imageCourse});
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

function getImageCourse(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/courses/' + fileName;

    fs.exists(pathFile, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message:'Imagen inexistente'})
        }
    })
}

module.exports = {
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    listCoursesAdmin,
    listCoursesUser,
    uploadImage,
    getImageCourse
}