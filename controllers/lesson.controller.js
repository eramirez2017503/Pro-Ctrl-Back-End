'use strict'

var User = require('../models/user.model');
var Topic = require('../models/topic.model');
var Course = require('../models/course.model');
var Lesson = require('../models/lesson.model');
var bcrypt = require('bcrypt-nodejs'); 
var fs = require('fs');
var path = require('path');


function createLesson(req, res){
    var userId = req.params.userId;
    var topicId = req.params.topicId;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posee permisos para hacer esta accion'});
    }else{
        if(params.nameLesson && params.content){
            Lesson.findOne({topic : topicId, nameLesson : params.nameLesson}, (err, lessonFind)=>{
                if(err){
                    return res.status(400).send({message:'Error general al buscar la leccion'});
                }else if(lessonFind){
                    return res.send({message: 'Ya existe una leccion con este nombre en el tema'});
                }else{
                    let lesson = new Lesson();
                    lesson.nameLesson = params.nameLesson;
                    lesson.content = params.content;
                    lesson.topic = topicId;
                    lesson.gradeLesson = params.gradeLesson;
                    lesson.save((err, lessonSaved)=>{
                        if(err){
                            return res.status(400).send({message:'Error general al guardar la leccion'});
                        }else if(lessonSaved){
                            Topic.findByIdAndUpdate(topicId, {$push:{lessons: lessonSaved._id}}, {new: true}, (err, lessonPush)=>{
                                if(err){
                                    return res.status(400).send({message:'Error general al guardar la leccion en el tema'});
                                }else if(lessonPush){
                                    return res.send({message:'La leccion se guardo satisfactoriamente', lessonPush});
                                }else{
                                    console.log(lessonPush)
                                    return res.send({message: 'No se pudo guardar la leccion en el tema'});
                                }
                            })
                        }else{
                            return res.send({message: 'No se pudo guardar la leccion'});
                        }
                    });
                }
            });
        }else{
            console.log(params)
            return res.send({message:'Ingrese todos los parametros minimos'});
        }
    }
}

function updateLesson(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var topicId = req.params.topicId;
    var lessonId = req.params.lessonId;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posee permisos para hacer esta accion'});
    }else{
        Course.findOne({_id:courseId, administrator:userId}, (err, courseFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el curso'});
            }else if(courseFind){
                Topic.findById(topicId, (err, topicFind)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el curso'});
                    }else if(topicFind){
                        if(params.nameLesson){
                            Lesson.findById(lessonId, (err, lessonFind)=>{
                                if(err){
                                    return res.status(500).send({message:'Error al buscar la leccion'});
                                }else if(lessonFind){
                                    Lesson.findOne({topic: topicId,nameLesson : params.nameLesson}, (err, lessonMatch)=>{
                                        if(err){
                                            return res.status(500).send({message:'Error al buscar el curso'});
                                        }else if (lessonMatch){
                                            if (lessonMatch._id != lessonId){
                                                return res.send({message: 'Ya existente un tema con este nombre'})
                                            }else{  
                                                Lesson.findOneAndUpdate({_id: lessonId, topic: topicId}, params, {new: true}, (err, lessonUpdated)=>{
                                                    if(err){
                                                        return res.status(500).send({message:'Error general al actualizar el tema'});
                                                    }else if(lessonUpdated){
                                                        return res.status(200).send({message:'Se actualizo el tema correctamente', lessonUpdated});
                                                    }else{
                                                        return res.send({message: 'No se pudo actualizar el tema'})
                                                    }
                                                });
                                            }                               
                                        }else{  
                                            Lesson.findOneAndUpdate({_id: lessonId, topic: topicId}, params, {new: true}, (err, lessonUpdated)=>{
                                                if(err){
                                                    return res.status(500).send({message:'Error general al actualizar el tema'});
                                                }else if(lessonUpdated){
                                                    return res.status(200).send({message:'Se actualizo el tema correctamente', lessonUpdated});
                                                }else{
                                                    return res.send({message: 'No se pudo actualizar el tema'})
                                                }
                                            });
                                        }
                                    });                        
                                }else{  
                                    return res.send({message: 'No se encontro el tema'})
                                }
                            });
                        }else{
                            Lesson.findOneAndUpdate({_id: lessonId, topic: topicId}, params, {new: true}, (err, lessonUpdated)=>{
                                if(err){
                                    return res.status(500).send({message:'Error general al actualizar el tema'});
                                }else if(lessonUpdated){
                                    return res.status(200).send({message:'Se actualizo el tema correctamente', lessonUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar el tema'})
                                }
                            });
                        }
                    }else{
                        return res.send({message: 'No se encontro el tema para actualizarlo'})
                    }
                });
            }else{
                return res.send({message: 'No se encontro el curso para actualizarlo'})
            }
        });
    }
}

function deleteLesson(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var topicId = req.params.topicId;
    var lessonId = req.params.lessonId;
    var params =  req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({message:'Error general al buscar el usuario'});
            }else if (userFind){
                Course.findOne({_id : courseId, administrator: userId}, (err, courseFind)=>{
                    if(err){
                        return res.status(500).send({message:'Error general al buscar el curso'});
                    }else if(courseFind){
                        Topic.findOne({_id : topicId}, (err, topicFind)=>{
                            if(err){
                                return res.status(500).send({message:'Error general al buscar el tema'});
                            }else if(topicFind){
                                bcrypt.compare(params.password, userFind.password, (err, equalsPassword)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error al comparar contraseñas'});    
                                    }else if(equalsPassword){
                                        Topic.findOneAndUpdate({_id : topicId}, {$pull: {lessons: lessonId}}, {new : true}, (err, topicUpdated)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al actualizar el tema'});
                                            }else if(topicUpdated){
                                                Lesson.findByIdAndDelete(lessonId, (err, lessonDelete)=>{
                                                    if(err){
                                                        return res.status(500).send({message:'Error general al eliminar la leccion'});
                                                    }else if(lessonDelete){
                                                        return res.send({message: 'La leccion fue eliminado', lessonDelete});
                                                    }else{
                                                        return res.status(404).send({message:'No se pudo eliminar la leccion'});
                                                    }
                                                });
                                            }else{
                                                return res.status(404).send({message:'No se pudo eliminar la leccion del tema'});
                                            }
                                        })
                                    }else{
                                        return res.status(400).send({message:'No se pudo eliminar el tema del curso'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'No se pudo encontrar el tema deseado'});
                            }
                        });
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

function listLessons(req, res){
    let topicId = req.params.topicId

    Lesson.find({topic: topicId}).populate("topic").exec((err,lessons)=>{
        if(err){
            return res.status(500).send({message:'Error general al buscar las lecciones'});
        }else if(lessons){
            return res.send({message: 'Lecciones encontradas', lessons});
        }else{
            return res.status(404).send({message:'No se encotnro ninguna leccion'});
        }
    })
}

module.exports = {
    createLesson,
    updateLesson,
    deleteLesson,
    listLessons
}