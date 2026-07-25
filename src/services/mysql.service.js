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

    // Si viene vacío, se guarda como NULL
    if (
        dui === null ||
        dui === undefined ||
        String(dui).trim() === ""
    ) {

        return null;
    }


    // Convertir a texto
    const duiTexto =
        String(dui).trim();


    // Conservar únicamente los números
    const duiDigitos =
        duiTexto.replace(/\D/g, "");


    // El DUI salvadoreño debe tener 9 dígitos
    if (
        duiDigitos.length !== 9
    ) {

        throw new Error(
            "DUI inválido. Debe contener exactamente 9 dígitos."
        );
    }


    // Formato oficial:
    //
    // 8 dígitos - 1 dígito
    //
    // Ejemplo:
    //
    // 01234567-8

    return `${duiDigitos.slice(0, 8)}-${duiDigitos.slice(8)}`;
};


/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR BITRIX ID
/////////////////////////////////////////////////////////////

export const buscarClientePorBitrixId =
async (
    bitrixId
) => {

    const sql = `
        SELECT *
        FROM pro_clientes
        WHERE bitrix_id = ?
        LIMIT 1
    `;


    const [
        rows
    ] = await pool.query(
        sql,
        [
            Number(bitrixId)
        ]
    );


    return rows.length
        ? rows[0]
        : null;
};


/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR ID
/////////////////////////////////////////////////////////////

export const buscarClientePorId =
async (
    id
) => {

    const sql = `
        SELECT *
        FROM pro_clientes
        WHERE id_pro_clientes = ?
        LIMIT 1
    `;


    const [
        rows
    ] = await pool.query(
        sql,
        [
            Number(id)
        ]
    );


    return rows.length
        ? rows[0]
        : null;
};


/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR CORREO
/////////////////////////////////////////////////////////////

export const buscarClientePorCorreo =
async (
    correo
) => {

    if (
        !correo
    ) {

        return null;
    }


    const [
        rows
    ] = await pool.query(
        `
            SELECT *
            FROM pro_clientes
            WHERE correo = ?
            LIMIT 1
        `,
        [
            correo
        ]
    );


    return rows.length
        ? rows[0]
        : null;
};


/////////////////////////////////////////////////////////////
// INSERTAR O ACTUALIZAR CLIENTE
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


    /////////////////////////////////////////////////////////////
    // VALIDAR BITRIX ID
    /////////////////////////////////////////////////////////////

    if (
        !bitrix_id
    ) {

        throw new Error(
            "bitrix_id requerido"
        );
    }


    /////////////////////////////////////////////////////////////
    // NORMALIZAR DATOS
    /////////////////////////////////////////////////////////////

    const nombreNormalizado =
        String(
            nombre || ""
        ).trim();


    const apellidoNormalizado =
        String(
            apellido || ""
        ).trim();


    const correoNormalizado =
        String(
            correo || ""
        ).trim()
        .toLowerCase();


    const telefonoNormalizado =
        String(
            telefono || ""
        ).trim();


    const duiNormalizado =
        normalizarDui(
            dui
        );


    /////////////////////////////////////////////////////////////
    // VALIDAR CORREO
    /////////////////////////////////////////////////////////////

    if (

        correoNormalizado &&

        !validator.isEmail(
            correoNormalizado
        )

    ) {

        throw new Error(
            "Correo inválido"
        );
    }


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

            dui,

            created_at,

            updated_at

        )

        VALUES

        (

            ?,

            ?,

            ?,

            ?,

            ?,

            ?,

            NOW(),

            NOW()

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

        Number(
            bitrix_id
        ),

        nombreNormalizado,

        apellidoNormalizado,

        correoNormalizado,

        telefonoNormalizado,

        duiNormalizado

    ];


    const [
        result
    ] = await pool.query(
        sql,
        values
    );


    return result;
};


/////////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE
/////////////////////////////////////////////////////////////

export const actualizarCliente =
async (
    bitrixId,
    cliente
) => {


    /////////////////////////////////////////////////////////////
    // NORMALIZAR DATOS
    /////////////////////////////////////////////////////////////

    const nombreNormalizado =
        String(
            cliente.nombre || ""
        ).trim();


    const apellidoNormalizado =
        String(
            cliente.apellido || ""
        ).trim();


    const correoNormalizado =
        String(
            cliente.correo || ""
        ).trim()
        .toLowerCase();


    const telefonoNormalizado =
        String(
            cliente.telefono || ""
        ).trim();


    const duiNormalizado =
        normalizarDui(
            cliente.dui
        );


    /////////////////////////////////////////////////////////////
    // VALIDAR CORREO
    /////////////////////////////////////////////////////////////

    if (

        correoNormalizado &&

        !validator.isEmail(
            correoNormalizado
        )

    ) {

        throw new Error(
            "Correo inválido"
        );
    }


    /////////////////////////////////////////////////////////////
    // UPDATE
    /////////////////////////////////////////////////////////////

    const sql = `

        UPDATE pro_clientes

        SET

            pri_nombre = ?,

            pri_apellido = ?,

            correo = ?,

            telefono = ?,

            dui = ?,

            updated_at = NOW()

        WHERE bitrix_id = ?

    `;


    const values = [

        nombreNormalizado,

        apellidoNormalizado,

        correoNormalizado,

        telefonoNormalizado,

        duiNormalizado,

        Number(
            bitrixId
        )

    ];


    const [
        result
    ] = await pool.query(
        sql,
        values
    );


    return result;
};


/////////////////////////////////////////////////////////////
// ELIMINAR CLIENTE
/////////////////////////////////////////////////////////////

export const eliminarCliente =
async (
    bitrixId
) => {


    const sql = `

        DELETE FROM pro_clientes

        WHERE bitrix_id = ?

    `;


    const [
        result
    ] = await pool.query(
        sql,
        [
            Number(
                bitrixId
            )
        ]
    );


    return result;
};