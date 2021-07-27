'use strict'

var User = require('../models/user.model'); 
var Report = require('../models/report.model');
var bcrypt = require('bcrypt-nodejs'); 

function createReport(req, res){
    var userId = req.params.userId;
    var params = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el usuario'});
            }else if(userFind){
                Report.findOne({idReport: params.idReport}, (err, reportFind)=>{
                    if(err){
                        return res.status(400).send({message:'Error general al buscar el reporte'});
                    }else if(reportFind){
                        return res.send({message: 'El nombre identificador del reporte ya existe'});
                    }else{
                        Report.findOne({name : params.name}, (err, reportNameFind)=>{
                            if(err){
                                return res.status(400).send({message:'Error general al buscar el reporte'});
                            }else if(reportNameFind){
                                return res.send({message: 'El nombre del reporte ya existe'});
                            }else{
                                let report = new Report();
                                report.nameUnit = params.nameUnit;
                                /*report.idReport = params.idReport;*/
                                report.grade = params.grade;
                                report.status = params.status;
                                report.administrator = userId; 
                                if(params.password == null || params.password == ''){ //si viene contraseña nula para los usuarios/alumnos
                                    report.password = '';
                                    report.save((err, reportSaved)=>{
                                        if(err){
                                            return res.status(400).send({message:'Error general al guardar el reporte'});
                                        }else if(reportSaved){
                                            User.findByIdAndUpdate(userId, {$push : {reports : reportSaved._id}}, {new : true}, (err, reportPush)=>{
                                                if(err){
                                                    return res.status(400).send({message:'Error general al guardar el reporte'});
                                                }else if(reportPush){                                                    
                                                    console.log('Valores de reportPush: '+reportPush);
                                                    return res.send({message:'El reporte se guardo satisfactoriamente', reportPush});
                                                }else{
                                                    return res.send({message: 'No se pudo guardar el reporte deseado'});
                                                }
                                            }).populate('reports');
                                        }else{
                                            return res.send({message: 'No se pudo guardar el reporte'});
                                        }
                                    });
                                }else{ //si es administrador ingresar la contraseña
                                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                                        if(err){
                                            return res.status(500).send({message:'Error al encriptar la contraseña'});
                                        }else if(passwordHash){
                                            report.password = passwordHash;
                                            report.save((err, reportSaved)=>{
                                                if(err){
                                                    return res.status(400).send({message:'Error general al guardar el reporte'});
                                                }else if(reportSaved){
                                                    User.findByIdAndUpdate(userId, {$push : {reports : reportSaved._id}}, {new : true}, (err, reportPush)=>{
                                                        if(err){
                                                            return res.status(400).send({message:'Error general al guardar el reporte'});
                                                        }else if(reportPush){
                                                            return res.send({message:'El reporte se guardo satisfactoriamente', reportPush});
                                                        }else{
                                                            return res.send({message: 'No se pudo guardar el reporte deseado'});
                                                        }
                                                    }).populate('reports');
                                                }else{
                                                    return res.send({message: 'No se pudo guardar el reporte'});
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
                return res.send({message: 'El usuario no fue encontrado'});
            }
        })
    }
}

function updateReport(req,res){
    var userId = req.params.userId;
    var reportId = req.params.reportId;
    var update = req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId, reports: reportId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al buscar el usuario'});
            }else if(userFind){
                Report.findOne({_id: reportId}, (err, reportFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar el report'});
                    }else if(reportFind != null || reportFind != undefined){
                        if(update.password){
                            return res.status(401).send({message: 'No puedes actualizar la password'});
                        }else if(update.nameUnit != reportFind.nameUnit){
                            Report.findOne({nameUnit : update.nameUnit}, (err, existingReport)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al buscar unidad del reporte'});
                                }else if(existingReport){
                                    return res.send({message: 'Este nombre de unidad del reporte ya esta en uso'})
                                }else{
                                    Report.findByIdAndUpdate(reportId, update,{new: true}, (err, reportUpdated)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al actualizar el reporte'});
                                        }else if(reportUpdated){
                                            return res.send({message: 'El reporte se actualizo satisfactoriamente', reportUpdated});
                                        }else{
                                            return res.status(404).send({message:'No se pudo actualizar el reporte'});
                                        }
                                    });
                                }
                            });
                        }else{
                            Report.findByIdAndUpdate(reportId, update, {new: true}, (err, reportUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar el reporte'});
                                }else if(reportUpdated){
                                    return res.send({message: 'El reporte se actualizo satisfactoriamente', reportUpdated});
                                }else{
                                    return res.status(404).send({message:'No se pudo actualizar el reporte'});
                                }
                            });
                        }
                    }else{
                        return res.status(404).send({message:'No se encontro el reporte a actualizar'});
                    }
                });
                
            }else{
                return res.status(404).send({message:'No se encontro el usuario deseado'});
            }
        });
    }
}


function listReportAdmin(req,res){
    var userId = req.params.userId;
    Report.find({administrator : userId}).exec((err, reportFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener los reportes'});
        }else if(reportFind){
            return res.send({message: 'Reportes encontrados', reportFind});
        }else{
            return res.status(500).send({message: 'Error general al obtener los reportes'});            
        }
    });
}

function listReportUser(req, res){
    var userId = req.params.userId; 

    Report.find({users : userId}).exec((err, reportFind)=>{
        if(err){
            return res.status(500).send({message: 'Error general al obtener los reportes'});
        }else if(reportFind){
            return res.send({message: 'Reportes encontrados', reportFind});
        }else{
            return res.status(500).send({message: 'Error general al obtener los reportes'});            
        }
    });
}

function deleteReport(req,res){
    var userId = req.params.userId;
    var reportId = req.params.reportId;
    var params =  req.body;

    if(userId != req.user.sub){
        return res.status(400).send({message:'No posees permisos para hacer esta accion'});
    }else{
        User.findOne({_id : userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message:'Error general al buscar el usuario'});
            }else if (userFind){
                Report.findOne({_id : reportId, administrator: userId}, (err, reportFind)=>{
                    if(err){
                        return res.status(500).send({message:'Error general al buscar el reporte'});
                    }else if(reportFind){
                        bcrypt.compare(params.password, userFind.password, (err, equalsPassword)=>{
                            if(err){
                                return res.status(500).send({message:'Error al comparar contraseñas'});    
                            }else if(equalsPassword){
                                User.findOneAndUpdate({_id : userId, reports : reportId}, {$pull : {reports : reportId}}, {new : true}, (err, userUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message:'Error general al actualizar el usuario'});
                                    }else if(userUpdated){
                                        Report.findByIdAndRemove(reportId, (err, reportDelete)=>{
                                            if(err){
                                                return res.status(500).send({message:'Error general al eliminar el reporte'});
                                            }else if(reportDelete){
                                                return res.send({message: 'El reporte fue eliminado', reportDelete});
                                            }else{
                                                return res.status(404).send({message:'No se pudo eliminar el reporte o ya fue eliminado'});
                                            }
                                        });
                                    }else{
                                        return res.status(404).send({message:'No se pudo eliminar el reporte del administrador'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'No se pudo eliminar el reporte de usuario'});
                            }
                        })
                    }else{
                        return res.status(404).send({message:'No se pudo encontrar el reporte deseado'});
                    }
                });
            }else{
                return res.status(404).send({message:'No se pudo encontrar el usuario deseado'});
            }
        })
    }
}

module.exports = {
    createReport,
    updateReport,
    listReportAdmin,
    listReportUser,
    deleteReport
}