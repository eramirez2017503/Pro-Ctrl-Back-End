'use strict'

var User = require('../models/user.model'); 
var Course = require('../models/course.model'); 
var Topic = require('../models/topic.model'); 
var Lesson = require('../models/lesson.model'); 
var Progress = require('../models/progress.model'); 

function createProgress(req, res){
    var userId = req.params.id;
    var courseId = req.params.idC;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{  
        Progress.findOne({course : courseId, user : userId}, (err, progressFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el progreso'});
            }else if(progressFind){
                return res.send({message: 'Ya estas en el curso'});
            }else{
                let progress = new Progress();
                progress.user = userId;
                progress.course = courseId;
                progress.lesson = params.lesson;
                progress.total = params.total;
                progress.save((err, progressSaved)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al guardar la leccion'});
                    }else if(progressSaved){
                        Course.findByIdAndUpdate(courseId, {$push:{progress: progressSaved._id}}, {new: true}, (err, progressPush)=>{
                            if(err){
                                return res.status(400).send({message:'Error general al guardar el progreso'});
                            }else if(progressPush){
                                return res.send({message:'Te has suscrito', progressPush});
                            }else{
                                console.log(lessonPush)
                                return res.send({message: 'No se pudo guardar suscribirse'});
                            }
                        })
                    }else{
                        return res.send({message: 'No se puede guardar'});
                    }
                });
            }
        });
    }

}

function updateProgress(req, res){
    let userId = req.params.id;
    let courseId = req.params.idC
    let lessonId = req.params.idL;
    let progressId = req.params.idP;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permiso para actualizar este servicio'});
    }else{
        Course.findOne({course:courseId}, (err, courseFind)=>{
            if(err){
                return res.status(400).send({message:'Error general al buscar el curso'});
            }else if(courseFind){


                Lesson.findOne({lesson:lessonId}, (err, lessonFind)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al buscar la leccion'});
                    }else if(lessonFind){
        
        
                        /*Progress.findOne({lesson: lessonId}, (err, progressFind) => {
                            if(err){
                                return res.status(500).send({message:'Error al buscar el progreso'});
                            }else if(progressFind && progressFind._id != progressId){
                                return res.send({message: 'Ya existe este progreso'})
                            }else{*/

                                Progress.findOneAndUpdate({_id: progressId}, update, {new: true}, (err, progressUpdate) => {
                                    if(err){
                                        return res.status(500).send({message:'Error al actualizar el progreso'});
                                    }else if(progressUpdate){

                                        if(lesson.gradeLesson > 0){
                                            progress.total = 100;
                                            return res.status(200).send({progressUpdate});
                                        }else{
                                            return res.status(200).send({progressUpdate});
                                        }
                                    }else{
                                        return res.status(404).send({message:'No se pudo actualizar el progreso'});
                                    }
                                })
                            /*}
                        })*/

        
                    }else{
                        return res.send({message: 'No se encontro la leccion para actualizarlo'})
                    }
                });



            }else{
                return res.send({message: 'No se encontro el curso para actualizarlo'})
            }
        });
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
                            return res.send({message: 'El progreso fue eliminado', progressRemoved});
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

function listProgress(req,res){
    let userId = req.params.id;
    let courseId = req.params.idC;

    User.find({user: userId}).exec((err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener usuario'});
        }else if(userFind){
            Course.find({course: courseId, user: userId}).exec((err, courseFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al obtener curso'});
                }else if(courseFind){

                    Progress.find({course: courseId, user: userId}).exec((err, progressFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al obtener progreso'});
                        }else if(progressFind){
                            Topic.find({course: courseId, user: userId}).exec((err, topicsFind)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al obtener temas'});
                                }else if(topicsFind){
                                    topicsFind.forEach(topicFind =>{
                                        console.log("Sí llega aquí");
                                        Topic.find({_id : topicFind._id}, (err, topiiic)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error general al obtener progreso'});
                                            }else if(topiiic){
                                                topiiic.lessons.forEach(lesson=>{
                                                    Lesson.find({_id: lesson._id}, (err, lessonFind)=>{
                                                        if(err){
                                                            return res.status(500).send({message: 'Error general al obtener progreso'});
                                                        }else if(lessonFind){
                                                            progressFind.lesson.push(lessonFind._id);
                                                            progressFind.grades.push(lessonFind.gradeLesson); 
                                                        }else{
                                                            return res.status(404).send({message:'No se pudo hacer push'});   
                                                        }
                                                    });
                                                });
                                            }else{
                                                return res.status(404).send({message:'No se encontró el tema para luego hacer push '});
                                            }
                                        });
                                    });
                                    return res.status(404).send({message:'Este son los arreglos', progressFind});
                                }else{
                                    return res.status(404).send({message:'No se encontró el tema'});
                                }
                            })
                        }else{
                            return res.status(404).send({message:'No se encontró el progreso'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontró el curso'});
                }
            })
        }else{
            return res.status(404).send({message:'No se encontró el usuario'});
        }
    })

}


function listProgressbyLesson(req,res){

    let userId = req.params.id;
    let courseId = req.params.idC;
    let lessonId = req.params.idL;
    let progressId = req.params.idP;


    User.find({user: userId}).exec((err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener usuario'});
        }else if(userFind){

            Progress.find({course: courseId, user: userId}).exec((err, progressFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al obtener progreso'});
                }else if(progressFind){
                    
                    if(progress.lesson == []){



                    }
            

                }else{
                    return res.status(404).send({message:'No se encontró el usuario'});
                }
            })

        }else{
            return res.status(404).send({message:'No se encontró el usuario'});
        }
    })
}


module.exports = {
    createProgress,
    updateProgress,
    deleteProgress,
    listProgress,
    listProgressbyLesson,
}



/*Topic.find({course: courseId}).exec((err, topicFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al obtener tema'});
                }else if(topicFind){
                    let count = 0;
                    let lecciones = 0;
                    let conteofinal = 0;

                    for(var c = 1;lesson.gradeLesson >= 0; c++){

                        count = c

                        if(lesson.gradeLesson == 0){
                            lecciones = lecciones
                        }else if(lesson.gradeLesson > 0){
                            lecciones = lecciones + 100;
                        }
                    }

                    conteofinal = lecciones/count;

                    return res.status(404).send({message:'Tu progreso en este curso es de:', conteofinal});

                }else{
                    return res.status(404).send({message:'No se encontró el tema'});
                }
            })*/

/*
function createProgress(req, res){
    var userId = req.params.id;
    var courseId = req.params.idC;
    var lessonId = req.params.idL;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{        
       --Course.findOne({_id: courseId, user: userId}, (err, courseFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el curso'});
            }else if(courseFind){   
                
                Topic.findOne({topic: topicId, user: userId}, (err, topicFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar el tema'});
                    }else if(topicFind){   --
                        
                    Progress.findOne({lesson : params.lesson}, (err, progressFind)=>{
                        if(err){
                            return res.status(400).send({message:'Error general al buscar el progreso'});
                        }else if(progressFind){
                            return res.send({message: 'El progreso de este tema ya existe'});
                        }else{
                            let progress = new Progress();
                            progress.user = userId;
                            progress.course = courseId;
                            progress.lesson = lessonId;
                            progress.total = params.total;
                            progress.save((err, progressSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar el progreso'});
                                }else if(progressSaved){
                                    Topic.findByIdAndUpdate(topicId, {$push:{progress: progressSaved._id}}, {new: true}, (err, progressPush)=>{
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
             --   }else{
                    return res.status(404).send({message:'No se encontro el tema'});
                }
                    })                
            }else{
                return res.status(404).send({message:'No se pudo encontrar el progreso'});
            }
        });--
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
                    Progress.findOneAndUpdate({_id: progressId}, update, {new: true}, (err, progressUpdate) => {
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
                    return res.status(404).send({message:'No se puede actualizar el progreso'});
                }
            })
        }
    }
}

function listProgressbyLesson(req,res){

    let lessonId = req.params.idL;

    Progress.find({lesson: lessonId}).populate("lesson").exec((err,progressFind)=>{
        if(err){
            return res.status(500).send({message:'Error general al buscar el progreso'});
        }else if(progressFind){
            return res.send({message: 'Este es el progreso', progressFind});
        }else{
            return res.status(404).send({message:'No se encontró ningun progreso'});
        }
    })
}


function listProgressbyCourse(req,res){

    let courseId = req.params.idC;

    Progress.find({course: courseId}).populate("course").exec((err,progressFind)=>{
        if(err){
            return res.status(500).send({message:'Error general al buscar el progreso'});
        }else if(progressFind){
            return res.send({message: 'Este es el progreso', progressFind});
        }else{
            return res.status(404).send({message:'No se encontró ningun progreso'});
        }
    })
}


function listProgressbyLessons(req,res){
    let userId = req.params.id;
    let courseId = req.params.idC;
    let lessonId = req.params.idL;
    let progressId = req.params.idP;

    User.find({user: userId}).exec((err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener usuario'});
        }else if(userFind){
            Course.find({course: courseId}).exec((err, courseFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al obtener curso'});
                }else if(courseFind){
                    Lesson.find({lesson: lessonId}).exec((err, lessonFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al obtener lección'});
                        }else if(lessonFind){
                            if(lesson.gradeLesson > 0){
                                Progress.find({progress: progressId}).populate("progress").exec((err, progressFind)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general al obtener progreso'});
                                    }else if(progressFind){
                                        progress.total = 100;
                                        return res.send({message: 'Progreso:', progressFind});
                                    }else{
                                        return res.status(404).send({message:'No se encontró el progreso'});
                                    }
                                })
                            }else if(lesson.gradeLesson = 0){
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
                        }else{
                            return res.status(404).send({message:'No se encontró el lección'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontró el curso'});
                }
            })
        }else{
            return res.status(404).send({message:'No se encontró el usuario'});
        }
    })
}


function listProgressbyCourse(req, res){

    let userId = req.params.id;
    let courseId = req.params.idC;
    let lessonId = req.params.idL;
    let progressId = req.params.idP;

    User.find({user: userId}).exec((err, userFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener usuario'});
        }else if(userFind){
            Course.find({course: courseId}).exec((err, courseFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al obtener curso'});
                }else if(courseFind){
                }else{
                    return res.status(404).send({message:'No se encontró el curso'});
                }
            })
        }else{
            return res.status(404).send({message:'No se encontró el usuario'});
        }
    })
}*/