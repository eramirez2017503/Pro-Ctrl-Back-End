'use strict'

var Course = require('../models/course.model');
var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs'); 
var Progress = require('../models/progress.model');
var fs = require('fs');
var path = require('path');
const { param } = require('../routes/course.route');


function createCourse(req, res){
    var userId = req.params.userId;
    var params = req.body;    

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el usuario'});
            }else if(userFind.rol == 'ADMIN' || userFind.rol == 'MAESTRO'){
                Course.findOne({idCourse : params.idCourse}, (err, courseFind)=>{ //buscar si el nombre o courseId ya existe
                    //posiblemente convertir a toLowerCase------------ revisar luego
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el curso'});
                    }else if(courseFind){
                        return res.send({message: 'El nombre identificador del curso ya existe'});
                    }else{ //El campo de la contraseña será opcional y de esto se encaragar un ngIf de angular
                        Course.findOne({name : params.name}, (err, courseNameFind)=>{
                            if(err){
                                return res.status(400).send({message:'Error general al buscar el curso'});
                            }else if(courseNameFind){
                                return res.send({message: 'El nombre del curso ya existe'});
                            }else{
                                let course = new Course();
                                course.name = params.name;
                                course.idCourse = params.idCourse;
                                course.level = params.level;
                                course.description = params.description;
                                course.requirements = params.requirements;
                                course.type = params.type;
                                course.administrator = userId; 
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
                    }
                });
            }else{
                return res.send({message: 'No posees permisos para esta función'});
            }
        })
    }
}

function updateCourse(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params = req.body;
    var actualizacionNombre = false; 
    var actualizacionidCurse = false; 

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        /*
        if(params.password != null != params.password != ''){
            return res.status(400).send({message:'No se puede actualizar la contraseña desde esta función'});
        }else{
            
        }
        */
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el usuario'});
            }else if(userFind){
                Course.findById(courseId, (err, courseFind)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el curso'});
                    }else if(courseFind){
                        if(params.name != courseFind.name && params.idCourse != courseFind.idCourse){ //actualización si se cambia el nombre y el identificador
                            if(params.name != courseFind.name){ //si se cambio el nombre
                                Course.findOne({name : params.name}, (err, courseNameFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseNameFind){
                                        return res.send({message: 'Ya existente un curso con este nombre'})
                                    }else{  
                                        actualizacionNombre = true;
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
                                        actualizacionidCurse = true;
                                    }
                                });
                            }
                            if(!actualizacionNombre && !actualizacionidCurse){
                                Course.findOne({_id : courseId}, (err, courseFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseFind){
                                        if(courseFind.type == params.type){
                                            Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message:'Error general al actualizar'});
                                                }else if(courseUpdated){
                                                    return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                }else{
                                                    return res.send({message: 'No se pudo actualizar el curso'})
                                                }
                                            });
                                        }else{
                                            if(courseFind.type == 'PUBLIC' && params.type == 'PRIVATE'){
                                                bcrypt.hash(params.passwordCourse, null, null, (err, passwordHash)=>{
                                                    if(err){
                                                        return res.status(500).send({message:'Error general encriptar la password'});
                                                    }else if(passwordHash){
                                                        params.password = passwordHash;
                                                        Course.findOneAndUpdate({_id : courseId}, params, {new : true}, (err, courseUpdated)=>{
                                                            if(err){
                                                                res.status(500).send({message:'Error actualizar el curso'});
                                                            }else if(courseUpdated){
                                                                return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                            }else{
                                                                return res.send({message: 'No se pudo actualizar'});        
                                                            }
                                                        })

                                                    }else{

                                                    }
                                                });
                                            }else if(courseFind.type == 'PRIVATE' && params.type == 'PUBLIC'){
                                                Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                    if(err){
                                                        return res.status(500).send({message:'Error general al actualizar'});
                                                    }else if(courseUpdated){
                                                        return res.send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                    }else{
                                                        return res.send({message: 'No se pudo actualizar el curso'})
                                                    }
                                                });
                                            }
                                        }  
                                    }else{  
                                        return res.send({message: 'No se encontro el curso'})
                                    }
                                });

                            }
                        }else if(params.name != courseFind.name || params.idCourse != courseFind.idCourse){ //si solo se cambio uno de los dos
                            if(params.name != courseFind.name){ //si se cambio el nombre
                                Course.findOne({name : params.name}, (err, courseNameFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseNameFind){
                                        return res.send({message: 'Ya existente un curso con este nombre'})
                                    }else{  
                                        Course.findOne({_id : courseId}, (err, courseFind)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error al buscar el curso'});
                                            }else if (courseFind){
                                                if(courseFind.type == params.type){
                                                    Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al actualizar'});
                                                        }else if(courseUpdated){
                                                            return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                        }else{
                                                            return res.send({message: 'No se pudo actualizar el curso'})
                                                        }
                                                    });
                                                }else{
                                                    if(courseFind.type == 'PUBLIC' && params.type == 'PRIVATE'){
                                                        bcrypt.hash(params.passwordCourse, null, null, (err, passwordHash)=>{
                                                            if(err){
                                                                return res.status(500).send({message:'Error general encriptar la password'});
                                                            }else if(passwordHash){
                                                                params.password = passwordHash;
                                                                Course.findOneAndUpdate({_id : courseId}, params, {new : true}, (err, courseUpdated)=>{
                                                                    if(err){
                                                                        res.status(500).send({message:'Error actualizar el curso'});
                                                                    }else if(courseUpdated){
                                                                        return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                                    }else{
                                                                        return res.send({message: 'No se pudo actualizar'});        
                                                                    }
                                                                })
        
                                                            }else{
        
                                                            }
                                                        });
                                                    }else if(courseFind.type == 'PRIVATE' && params.type == 'PUBLIC'){
                                                        Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                            if(err){
                                                                return res.status(500).send({message:'Error general al actualizar'});
                                                            }else if(courseUpdated){
                                                                return res.send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                            }else{
                                                                return res.send({message: 'No se pudo actualizar el curso'})
                                                            }
                                                        });
                                                    }
                                                }  
                                            }else{  
                                                return res.send({message: 'No se encontro el curso'})
                                            }
                                        });
                                    }
                                });
                            }
                            else if (params.idCourse != courseFind.idCourse){ //Se probo, esto revisar bastante
                                Course.findOne({idCourse : params.idCourse}, (err, courseNameFind)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al buscar el curso'});
                                    }else if (courseNameFind){
                                        return res.send({message: 'Ya existente un curso con este identificador'})
                                    }else{  
                                        Course.findOne({_id : courseId}, (err, courseFind)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error al buscar el curso'});
                                            }else if (courseFind){
                                                if(courseFind.type == params.type){
                                                    Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al actualizar'});
                                                        }else if(courseUpdated){
                                                            return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                        }else{
                                                            return res.send({message: 'No se pudo actualizar el curso'})
                                                        }
                                                    });
                                                }else{
                                                    if(courseFind.type == 'PUBLIC' && params.type == 'PRIVATE'){
                                                        bcrypt.hash(params.passwordCourse, null, null, (err, passwordHash)=>{
                                                            if(err){
                                                                return res.status(500).send({message:'Error general encriptar la password'});
                                                            }else if(passwordHash){
                                                                params.password = passwordHash;
                                                                Course.findOneAndUpdate({_id : courseId}, params, {new : true}, (err, courseUpdated)=>{
                                                                    if(err){
                                                                        res.status(500).send({message:'Error actualizar el curso'});
                                                                    }else if(courseUpdated){
                                                                        return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                                    }else{
                                                                        return res.send({message: 'No se pudo actualizar'});        
                                                                    }
                                                                })
        
                                                            }else{
        
                                                            }
                                                        });
                                                    }else if(courseFind.type == 'PRIVATE' && params.type == 'PUBLIC'){
                                                        Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                            if(err){
                                                                return res.status(500).send({message:'Error general al actualizar'});
                                                            }else if(courseUpdated){
                                                                return res.send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                            }else{
                                                                return res.send({message: 'No se pudo actualizar el curso'})
                                                            }
                                                        });
                                                    }
                                                }  
                                            }else{  
                                                return res.send({message: 'No se encontro el curso'})
                                            }
                                        });
                                    }
                                });
                            }
                        }else{
                            Course.findOne({_id : courseId}, (err, courseFind)=>{
                                if(err){
                                    return res.status(500).send({message:'Error al buscar el curso'});
                                }else if (courseFind){
                                    if(courseFind.type == params.type){
                                        Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al actualizar'});
                                            }else if(courseUpdated){
                                                return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                            }else{
                                                return res.send({message: 'No se pudo actualizar el curso'})
                                            }
                                        });
                                    }else{
                                        if(courseFind.type == 'PUBLIC' && params.type == 'PRIVATE'){
                                            bcrypt.hash(params.passwordCourse, null, null, (err, passwordHash)=>{
                                                if(err){
                                                    return res.status(500).send({message:'Error general encriptar la password'});
                                                }else if(passwordHash){
                                                    params.password = passwordHash;
                                                    Course.findOneAndUpdate({_id : courseId}, params, {new : true}, (err, courseUpdated)=>{
                                                        if(err){
                                                            res.status(500).send({message:'Error actualizar el curso'});
                                                        }else if(courseUpdated){
                                                            return res.status(200).send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                        }else{
                                                            return res.send({message: 'No se pudo actualizar'});        
                                                        }
                                                    })

                                                }else{

                                                }
                                            });
                                        }else if(courseFind.type == 'PRIVATE' && params.type == 'PUBLIC'){
                                            Course.findByIdAndUpdate(courseId, params, {new: true}, (err, courseUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message:'Error general al actualizar'});
                                                }else if(courseUpdated){
                                                    return res.send({message:'Se actualizo el curso satisfactoriamente', courseUpdated});
                                                }else{
                                                    return res.send({message: 'No se pudo actualizar el curso'})
                                                }
                                            });
                                        }
                                    }  
                                }else{  
                                    return res.send({message: 'No se encontro el curso'})
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

function listMyCourses(req, res){
    var userId = req.params.userId; 
    User.findOne({_id : userId}, (err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener el usuario'});
        }else if(userFind){
            if(userFind.rol == 'ADMIN' || userFind.rol == 'MAESTRO'){
                Course.find({administrator : userId}).exec((err, coursesFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al obtener los cursos'});
                    }else if(coursesFind){
                        return res.send({message: 'Cursos encontrados', coursesFind});
                    }else{
                        return res.status(500).send({message: 'Error general al obtener los cursos'});            
                    }
                });
            }else{
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
        }else{
            return res.status(500).send({message: 'No se encontro ningun usuario, verifica bien'});            
        }
    })
    
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
                Course.findOneAndUpdate({_id: courseId, administrator : userId}, {imageCourse: fileName}, {new: true}, (err, courseUpdate) => {
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
    var pathFile = './uploads/course/' + fileName;

    fs.exists(pathFile, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message:'Imagen inexistente'})
        }
    })
}


function inscriptionCourse(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params = req.body; 

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        Course.findOne({_id : courseId}, (err, courseFind)=>{
            if(err){
                res.status(500).send({message:'Error general al buscar los usuarios'});
            }else if(courseFind){
                if(courseFind.type == 'PRIVATE'){ //si es curso con contraseña
                    bcrypt.compare(params.password, courseFind.password, (err, equalsPassword)=>{
                        if(err){
                            return res.status(500).send({message:'Error al comparar contraseñas'});
                        }else if(equalsPassword){
                            User.findByIdAndUpdate(userId, {$push:{courses: courseFind._id}}, {new : true}).populate('courses').exec((err, coursePush)=>{
                                if(err){
                                    res.status(500).send({message:'Error general al hacer el push de cursos'});
                                }else if(coursePush){
                                    Course.findByIdAndUpdate(courseId, {$push : {users : userId}}, {new : true}, (err, userPush)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general al hacer el push de cursos'});
                                        }else if(userPush){
                                            let progress = new Progress();
                                            progress.user = userId;
                                            progress.save((err, progressSaved)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al guardar el nuevo Progreso'});
                                                }else if(progressSaved){
                                                    Progress.findOneAndUpdate({_id : progressSaved._id}, {$push : {course : courseId}}, {new : true}).populate('course').exec((err, courseProgressPush)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al hacer push de curso'});
                                                        }else if(courseProgressPush){
                                                            return res.send({message: 'Estas incrito al curso', courseProgressPush});
                                                        }else{
                                                            return res.status(404).send({message: 'No se pudo hacer el push de curso a Progress'})
                                                        }
                                                    });
                                                }else{
                                                    return res.send({message: 'No se pudo guardar el progreso'});
                                                }
                                            })
                                        }else{
                                            return res.status(404).send({message: 'No se pudo hacer el push de usuario a curso'})
                                        }
                                    });
                                }else{
                                    return res.status(404).send({message: 'No se pudo hacer el push de cursos a usuarios'})
                                }
                            });    
                        }else{
                            return res.status(404).send({message:'No hay coincidencias en la password'});
                        }
                    })
                }else{ //si el curso no tiene contraseña
                    User.findByIdAndUpdate(userId, {$push:{courses: courseFind._id}}, {new : true}).populate('courses').exec((err, coursePush)=>{
                        if(err){
                            res.status(500).send({message:'Error general al hacer el push de cursos'});
                        }else if(coursePush){
                            Course.findByIdAndUpdate(courseId, {$push : {users : userId}}, {new : true}, (err, userPush)=>{
                                if(err){
                                    res.status(500).send({message:'Error general al hacer el push de cursos'});
                                }else if(userPush){
                                    let progress = new Progress();
                                    progress.user = userId;
                                    progress.save((err, progressSaved)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al guardar el nuevo Progreso'});
                                        }else if(progressSaved){
                                            Progress.findOneAndUpdate({_id : progressSaved._id}, {$push : {course : courseId}}, {new : true}).populate('course').exec((err, courseProgressPush)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al hacer push de curso'});
                                                }else if(courseProgressPush){
                                                    return res.send({message: 'Estas incrito al curso', courseProgressPush});
                                                }else{
                                                    return res.status(404).send({message: 'No se pudo hacer el push de curso a Progress'})
                                                }
                                            });
                                        }else{
                                            return res.send({message: 'No se pudo guardar el progreso'});
                                        }
                                    })
                                }else{
                                    return res.status(404).send({message: 'No se pudo hacer el push de usuario a curso'})
                                }
                            });
                        }else{
                            return res.status(404).send({message: 'No se pudo hacer el push de cursos a usuarios'})
                        }
                    });
                    
                }
            }else{
                res.status(404).send({message:'No se encontro ningun curso'});
            }
        })
    }
}


function listCoursesPublic(req, res){

    Course.find({type : 'PUBLIC'}, (err, coursesFind)=>{
        if(err){
            res.status(500).send({message:'Error general al buscar los usuarios'});
        }else if(coursesFind){
            return res.send({message: 'Cursos encontrados', coursesFind});
        }else{
            res.status(404).send({message:'No se encontraron cursos'})
        }
    })
}

function listAllCourses(req, res){
    Course.find({}, (err, coursesFind)=>{
        if(err){
            res.status(500).send({message:'Error general al buscar los usuarios'});
        }else if(coursesFind){
            return res.send({message: 'Cursos encontrados', coursesFind});
        }else{
            res.status(404).send({message:'No se encontraron cursos'})
        }
    })
}

function verifyProgress(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var progressFinded = false;

    Progress.findOne({course : courseId, user : userId}, (err, progressFind)=>{
        if(err){
            res.status(500).send({message:'Error general al buscar los usuarios'});
        }else if(progressFind){
            progressFinded = true;
            return res.send({message: 'Cursos encontrados', progressFind, progressFinded});
        }else{
            return res.send({message: 'No se encontro un progressFind', progressFinded});
        }
    })
}

function updatePassword(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params = req.body; 

    User.findOne({_id : userId}, (err, userFind)=>{
        if(err){
            res.status(500).send({message:'Error general al buscar los usuarios'});
        }else if(userFind){
            bcrypt.compare(params.passwordAdmin, userFind.password, (err, equalsPasswordAdmin)=>{
                if(err){
                    res.status(500).send({message:'Error general al comparar contraseña'});
                }else if(equalsPasswordAdmin){
                    Course.findOne({_id : courseId}, (err, courseFind)=>{
                        if(err){
                            res.status(500).send({message:'Error al buscar el curso'});
                        }else if(courseFind){
                            bcrypt.hash(params.passwordCourse, null, null, (err, passwordHash)=>{
                                if(err){
                                    res.status(500).send({message:'Error al encriptar la contraseña'});
                                }else if(passwordHash){
                                    Course.findOneAndUpdate({_id : courseId}, {password : passwordHash}, {new : true}, (err, courseUpdated)=>{
                                        if(err){
                                            res.status(500).send({message:'Error actualizar el curso'});
                                        }else if(courseUpdated){
                                            return res.send({message: 'Se actualizo satisfactoriamente la password de curso', courseUpdated});        
                                        }else{
                                            return res.send({message: 'No se pudo actualizar'});        
                                        }
                                    })
                                }else{
                                    return res.send({message: 'No se pudo encriptar la contraseña'});        
                                }
                            });
                        }else{
                            return res.send({message: 'No se encontro el curso'});
                        }
                    })
                }else{
                    return res.send({message: 'La password de administrador no coincide'});
                }
            });            
        }else{
            return res.send({message: 'No se encontro el '});
        }
    });
}

module.exports = {
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    listMyCourses,
    uploadImage,
    getImageCourse,
    listCoursesPublic,
    listAllCourses,
    inscriptionCourse,
    verifyProgress,
    updatePassword
}
