/////////////////////////////////////////////////////////////
// mysql.service.js
/////////////////////////////////////////////////////////////

import validator from "validator";
import { pool } from "../config/db.js";

/////////////////////////////////////////////////////////////
// NORMALIZAR DUI DE EL SALVADOR
/////////////////////////////////////////////////////////////

/**

Acepta:


012345678
01234567-8
01 234567-8
01-234567-8


Devuelve siempre:


01234567-8


Si viene vacío:



null
*/
export const normalizarDui = (dui) => {

if (
dui === null ||
dui === undefined ||
String(dui).trim() === ""
) {
return null;
}

const digitos = String(dui)
.trim()
.replace(/\D/g, "");

if (
digitos.length !== 9
) {
throw new Error(
DUI inválido: "${dui}". Debe contener exactamente 9 dígitos.
);
}

return ${digitos.slice(0, 8)}-${digitos.slice(8)};
};