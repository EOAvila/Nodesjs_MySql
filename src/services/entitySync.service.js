// src/services/entitySync.service.js

import {
    obtenerContactoBitrix,
    obtenerLeadBitrix,
    obtenerDealBitrix,
    obtenerProductoBitrix
} from "./bitrix.service.js";

export const procesarEntidadBitrix = async ({
    entidad,
    bitrixId
}) => {

    switch (entidad) {

        case "CONTACT":
            return await obtenerContactoBitrix(bitrixId);

        case "LEAD":
            return await obtenerLeadBitrix(bitrixId);

        case "DEAL":
            return await obtenerDealBitrix(bitrixId);

        case "PRODUCT":
            return await obtenerProductoBitrix(bitrixId);

        default:
            throw new Error(
                `Entidad no soportada: ${entidad}`
            );
    }
};