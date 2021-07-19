'use strict'

var User = require('../models/user.model');
var Course = require('../models/course.model');
var Topic = require('../models/topic.model');
var bcrypt = require('bcrypt-nodejs'); 
var fs = require('fs');
var path = require('path');


function createTopic(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var params = req.body;
    let topic = new Topic();

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posee permisos para hacer esta accion'});
    }else{
        if(params.nameTopic && params.level){
            Topic.findOne({course : courseId, nameTopic : params.nameTopic}, (err, topicFind)=>{
                if(err){
                    return res.status(400).send({message:'Error general al buscar el curso'});
                }else if(topicFind){
                    return res.send({message: 'Ya existe un tema con este nombre en el curso'});
                }else{
                    topic.nameTopic = params.nameTopic;
                    topic.descriptionTopic = params.descriptionTopic;
                    topic.course = courseId;
                    topic.level = params.level;
                    topic.save((err, topicSaved)=>{
                        if(err){
                            return res.status(400).send({message:'Error general al guardar el tema'});
                        }else if(topicSaved){
                            Course.findByIdAndUpdate(courseId, {$push: {topics: topicSaved}}, {new : true}, (err, topicPush)=>{
                                if(err){
                                    return res.status(400).send({message:'Error general al guardar el tema en el curso'});
                                }else if(topicPush){
                                    return res.send({message:'El tema se guardo satisfactoriamente', topicPush});
                                }else{
                                    console.log(topicPush)
                                    return res.send({message: 'No se pudo guardar el tema en el curso'});
                                }
                            })
                        }else{
                            return res.send({message: 'No se pudo guardar el tema'});
                        }
                    });
                }
            });
        }else{
            return res.send({message:'Ingrese todos los parametros minimos'});
        }
    }
}

function updateTopic(req, res){
    var userId = req.params.userId;
    var topicId = req.params.topicId;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posee permisos para hacer esta accion'});
    }else{
        Course.findOne({_id:courseId, administrator:userId}, (err, courseFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el curso'});
            }else if(courseFind){
                if(params.nameTopic){
                    Topic.findById(topicId, (err, topicFind)=>{
                        if(err){
                            return res.status(500).send({message:'Error al buscar el curso'});
                        }else if (topicId){
                            Topic.findOne({course: courseId,nameTopic : params.nameTopic}, (err, topicMatch)=>{
                                if(err){
                                    return res.status(500).send({message:'Error al buscar el curso'});
                                }else if (topicMatch._id != topicFind._id){
                                    return res.send({message: 'Ya existente un tema con este nombre'})
                                }else{  
                                    Topic.findOneAndUpdate({_id: topicId, course: courseId}, params, {new: true}, (err, topicUpdated)=>{
                                        if(err){
                                            return res.status(500).send({message:'Error general al actualizar el tema'});
                                        }else if(topicUpdated){
                                            return res.status(200).send({message:'Se actualizo el tema correctamente', topicUpdated});
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
                    Topic.findOneAndUpdate({_id: topicId, course: courseId}, params, {new: true}, (err, topicUpdated)=>{
                        if(err){
                            return res.status(500).send({message:'Error general al actualizar el tema'});
                        }else if(topicUpdated){
                            return res.status(200).send({message:'Se actualizo el tema correctamente', topicUpdated});
                        }else{
                            return res.send({message: 'No se pudo actualizar el tema'})
                        }
                    });
                }
            }else{
                return res.send({message: 'No se encontro el curso para actualizarlo'})
            }
        });
    }
}

function deleteTopic(req, res){
    var userId = req.params.userId;
    var courseId = req.params.courseId;
    var topicId = req.params.topicId;
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
                        bcrypt.compare(params.password, userFind.password, (err, equalsPassword)=>{
                            if(err){
                                return res.status(500).send({message:'Error al comparar contraseñas'});    
                            }else if(equalsPassword){
                                Course.findOneAndUpdate({_id : courseId, topics : topicId}, {$pull : {topics : topicId}}, {new : true}, (err, courseUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error general al actualizar el usuario'});
                                    }else if(userUpdated){
                                        Topic.findOneAndUpdate({_id: topicId, course: courseId}, (err, topicDelete)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al eliminar el tema'});
                                            }else if(topicDelete){
                                                return res.send({message: 'El tema fue eliminado', topicDelete});
                                            }else{
                                                return res.status(404).send({message:'No se pudo eliminar el tema'});
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

function listTopics(req, res){
    let courseId = req.params.courseId

    Topic.find({course: courseId}).exec((err,topics)=>{
        if(err){
            return res.status(500).send({message:'Error general al buscar los temas'});
        }else if(topics){
            return res.send({message: 'Temas encontrados', topics});
        }else{
            return res.status(404).send({message:'No se encotnro ningun tema'});
        }
    })
}

function getTopicById(req, res){
    var courseId = req.params.courseId;
    var topicId = req.params.topicId;

    if(courseId && topicId){
        Topic.findOne({_id : topicId, course: courseId}, (err, topicFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al obtener el tema'});
            }else if(topicFind){
                return res.send({message: 'Tema encontrado', topicFind})
            }else{
                return res.status(404).send({message:'No se encontraron coincidencias'});
            }
        })
    }else{
        return res.status(404).send({message:'Faltan parametros en la busqueda'});
    }
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

function getImage(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/topics/' + fileName;

    fs.exists(pathFile, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message:'Imagen inexistente'})
        }
    })
}

module.exports = {
    createTopic,
    updateTopic,
    deleteTopic,
    listTopics,
    getTopicById,
    uploadImage,
    getImage
}