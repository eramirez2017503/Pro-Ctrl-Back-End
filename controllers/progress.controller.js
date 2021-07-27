'use strict'

var User = require('../models/user.model'); 
var Course = require('../models/course.model'); 
var Topic = require('../models/topic.model'); 
var Progress = require('../models/progress.model'); 


function createProgress(req, res){
    var userId = req.params.id;
    var courseId = req.params.idC;
    var topicId = req.params.idT;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{        
        Course.findOne({_id: courseId, user: userId}, (err, courseFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el curso'});
            }else if(courseFind){   
                
                Topic.findOne({_id: topicId, user: userId}, (err, topicFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar el tema'});
                    }else if(topicFind){   
                        
                    Progress.findOne({topic : params.topicId}, (err, progressFind)=>{
                        if(err){
                            return res.status(400).send({message:'Error general al buscar el progreso'});
                        }else if(progressFind){
                            return res.send({message: 'El progreso de este tema ya existe'});
                        }else{
                            let progress = new Progress();
                            progress.user = params.user;
                            progress.course = courseId;
                            progress.topic = topicId;
                            progress.total = params.total;
                            team.save((err, progressSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar el progreso'});
                                }else if(progressSaved){
                                    Topic.findByIdAndUpdate(themeId, {$push:{progress: progressSaved._id}}, {new: true}, (err, progressPush)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al agregar el progreso en el tema'})
                                        }else if(progressPush){
                                            return res.send({message: 'El progreso se guardo satisfactoriamente', progressPush});
                                        }else{
                                            return res.status(500).send({message: 'Error al agregar el progreso'})
                                        }
                                    })
                                }else{
                                    return res.send({message: 'No se pudo agregar el progreso'});
                                }
                            })
                        }
                    })                
                }else{
                    return res.status(404).send({message:'No se encontro el progreso'});
                }
                    })                
            }else{
                return res.status(404).send({message:'No se encontro el progreso'});
            }
        });
    }
}

function updateProgress(req, res){
    let userId = req.params.id;
    let progressId = req.params.idP;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permiso para actualizar este servicio'});
    }else{
        if(update.user){
            update.user = update.user.toLowerCase();

            Progress.findOne({user: update.user}, (err, progressFind) => {
                if(err){
                    return res.status(500).send({message:'Error al buscar el progreso'});
                }else if(progressFind && progressFind._id != progressId){
                    return res.send({message: 'Ya existe este progreso'})
                }else{
                    Progress.findOneAndUpdate({_id: progressId, user:userId}, update, {new: true}, (err, progressUpdate) => {
                        if(err){
                            return res.status(500).send({message:'Error al actualizar el progreso'});
                        }else if(progressUpdate){
                            return res.status(200).send({message:'Progreso actualizado', progressUpdate});
                        }else{
                            return res.status(404).send({message:'No se pudo actualizar el progreso'});
                        }
                    })
                }
            })
        }else{
            Progress.findOneAndUpdate({_id: progressId, user:userId}, update, {new: true}, (err, progressUpdate) => {
                if(err){
                    return res.status(500).send({message:'Error al actualizar el progreso'});
                }else if(progressUpdate){
                    return res.status(200).send({message:'Progreso actualizado', progressUpdate});
                }else{
                    return res.status(404).send({message:'No se pudo actualizar el progreso'});
                }
            })
        }
    }
}

function deleteProgress(req, res){
    var userId = req.params.id;
    var progressId = req.params.idP;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para eliminar el progreso'});
    }else{
        User.findOneAndUpdate({_id: userId},
            {$pull:{progreso: progressId}}, {new:true}, (err, progressPull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al eliminar el progreso'});
                }else if(progressPull){
                    Progress.findByIdAndRemove({_id: progressId},(err, progressRemoved) => {
                        if(err){
                            return res.status(500).send({message:'Error al eliminar el progreso'});
                        }else if(progressRemoved){
                            return res.send({message: 'El jugador fue eliminado', progressRemoved});
                        }else{
                            return res.status(404).send({message:'No se pudo eliminar el progreso o ya fue eliminado'});
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar el progreso del usuario'});
                }
            }
        ).populate('progress')
    }
}

function listProgress(req, res){

    let progressId = req.params.idP

    Progress.find({progress: progressId}).populate("progress").exec((err, progressFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener progreso'});
        }else if(progressFind){
            return res.send({message: 'Progreso:', progressFind});
        }else{
            return res.status(404).send({message:'No se encontró el progreso'});
        }
    })
}

module.exports = {
    createProgress,
    updateProgress,
    deleteProgress,
    listProgress
}