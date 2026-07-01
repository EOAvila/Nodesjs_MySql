///////////////////////////////////////////////
// validator.js
///////////////////////////////////////////////
import Joi from 'joi';

export const asociadoSchema = Joi.object({
    codigo_asociado: Joi.string().max(20).required(),
    dui: Joi.string().max(10).required(),
    nit: Joi.string().allow(null, ''),
    nombres: Joi.string().max(100).required(),
    apellidos: Joi.string().max(100).required(),
    fecha_nacimiento: Joi.date().required(),
    genero: Joi.string().valid('M', 'F').required(),
    estado_civil: Joi.string().allow(null, ''),
    profesion: Joi.string().allow(null, ''),
    fecha_ingreso: Joi.date().allow(null),
    estado: Joi.string().valid('ACTIVO', 'INACTIVO').default('ACTIVO')
});