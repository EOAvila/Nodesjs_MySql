/////////////////////////////////////////////////////////////
// mysql.service.js
/////////////////////////////////////////////////////////////

import validator from "validator";
import { pool } from "../config/db.js";

/////////////////////////////////////////////////////////////
// NORMALIZAR DUI DE EL SALVADOR
/////////////////////////////////////////////////////////////

/**

Normaliza un DUI salvadoreño al formato:


01234567-8


Acepta valores como:


01234567-8
012345678
01 234567-8
01-234567-8


Retorna:




DUI normalizado


null si el DUI está vacío



Lanza error si el formato es inválido.
*/
export const normalizarDui = (dui) => {

if (
dui === null ||
dui === undefined ||
dui === ""
) {
return null;
}

// Convertir a texto y eliminar espacios
const duiTexto = String(dui).trim();

// Conservar únicamente los dígitos
const duiDigitos = duiTexto.replace(/\D/g, "");

// Un DUI válido debe contener exactamente 9 dígitos
if (duiDigitos.length !== 9) {

 throw new Error(
     "DUI inválido. Debe contener exactamente 9 dígitos."
 );

}

// Formato oficial: 8 dígitos + guion + 1 dígito
return `${duiDigitos.slice(0, 8)}-${duiDigitos.slice(8)}`;
};

/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE EN MYSQL POR BITRIX ID
/////////////////////////////////////////////////////////////

export const buscarClientePorBitrixId =
async (bitrixId) => {

const sql = `
    SELECT *
    FROM pro_clientes
    WHERE bitrix_id = ?
    LIMIT 1
`;

const [rows] =
    await pool.query(
        sql,
        [Number(bitrixId)]
    );

return rows.length
    ? rows[0]
    : null;

};

/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR ID
/////////////////////////////////////////////////////////////

export const buscarClientePorId =
async (id) => {

const sql = `
    SELECT *
    FROM pro_clientes
    WHERE id_pro_clientes = ?
    LIMIT 1
`;

const [rows] =
    await pool.query(
        sql,
        [Number(id)]
    );

return rows.length
    ? rows[0]
    : null;

};

/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR CORREO
/////////////////////////////////////////////////////////////

export const buscarClientePorCorreo =
async (correo) => {

const [rows] =
    await pool.query(
        `
            SELECT *
            FROM pro_clientes
            WHERE correo = ?
            LIMIT 1
        `,
        [correo]
    );

return rows.length
    ? rows[0]
    : null;

};

/////////////////////////////////////////////////////////////
// UPSERT CLIENTE
/////////////////////////////////////////////////////////////

export const upsertCliente =
async ({
bitrix_id,
nombre,
apellido,
correo,
telefono,
dui
}) => {

if (!bitrix_id) {

    throw new Error(
        "bitrix_id requerido"
    );
}

/////////////////////////////////////////////////////////////
// VALIDAR CORREO
/////////////////////////////////////////////////////////////

if (
    correo &&
    !validator.isEmail(correo)
) {

    throw new Error(
        "Correo inválido"
    );
}

/////////////////////////////////////////////////////////////
// NORMALIZAR DUI
/////////////////////////////////////////////////////////////

const duiNormalizado =
    normalizarDui(dui);

/////////////////////////////////////////////////////////////
// SQL
/////////////////////////////////////////////////////////////

const sql = `
    INSERT INTO pro_clientes
    (
        bitrix_id,
        pri_nombre,
        pri_apellido,
        correo,
        telefono,
        dui
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )

    ON DUPLICATE KEY UPDATE

        pri_nombre =
            VALUES(pri_nombre),

        pri_apellido =
            VALUES(pri_apellido),

        correo =
            VALUES(correo),

        telefono =
            VALUES(telefono),

        dui =
            VALUES(dui),

        updated_at =
            NOW()
`;

const values = [

    Number(bitrix_id),

    nombre || "",

    apellido || "",

    correo || "",

    telefono || "",

    duiNormalizado
];

const [result] =
    await pool.query(
        sql,
        values
    );

return result;

};

/////////////////////////////////////////////////////////////
// ELIMINAR CLIENTE
/////////////////////////////////////////////////////////////

export const eliminarCliente =
async (id) => {

const sql = `
    DELETE
    FROM pro_clientes
    WHERE id_pro_clientes = ?
`;

const [result] =
    await pool.query(
        sql,
        [Number(id)]
    );

return result;

};

/////////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE
/////////////////////////////////////////////////////////////

export const actualizarCliente =
async (
bitrix_id,
cliente
) => {

/////////////////////////////////////////////////////////////
// NORMALIZAR DUI
/////////////////////////////////////////////////////////////

const duiNormalizado =
    normalizarDui(cliente.dui);

/////////////////////////////////////////////////////////////
// ACTUALIZAR
/////////////////////////////////////////////////////////////

const [result] =
    await pool.query(
        `
            UPDATE pro_clientes

            SET

                pri_nombre = ?,

                pri_apellido = ?,

                correo = ?,

                telefono = ?,

                dui = ?,

                updated_at = NOW()

            WHERE bitrix_id = ?
        `,
        [

            cliente.nombre || "",

            cliente.apellido || "",

            cliente.correo || "",

            cliente.telefono || "",

            duiNormalizado,

            Number(bitrix_id)

        ]
    );

return result;

};