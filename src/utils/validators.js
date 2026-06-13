////////////////////////////////////////////////
// validators.js
////////////////////////////////////////////////
import validator from "validator";

export const validarCliente = (data) => {

    if (!data.nombre || validator.isEmpty(data.nombre)) {
        return "Nombre requerido";
    }

    if (!data.correo || !validator.isEmail(data.correo)) {
        return "Correo inválido";
    }

    return null;
};
