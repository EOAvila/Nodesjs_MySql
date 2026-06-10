import validator from "validator";
import { pool } from "../config/db.js";

///////////////////////////////////////////////////////////
// BUSCAR POR BITRIX ID
///////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////
// BUSCAR POR ID
///////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////
// UPSERT CLIENTE
///////////////////////////////////////////////////////////
export const upsertCliente = async ({
    bitrix_id,
    nombre,
    apellido,
    correo,
    telefono
}) => {

    if (
        bitrix_id === null ||
        bitrix_id === undefined
    ) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    correo = correo?.trim() || "";

    if (
        correo &&
        !validator.isEmail(correo)
    ) {
        throw new Error(
            "Correo inválido"
        );
    }

    const sql = `
        INSERT INTO pro_clientes
        (
            bitrix_id,
            pri_nombre,
            pri_apellido,
            correo,
            telefono
        )
        VALUES
        (
            ?, ?, ?, ?, ?
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

            updated_at =
                NOW()
    `;

    const [result] =
        await pool.query(sql, [

            Number(bitrix_id),

            nombre?.trim() || "",

            apellido?.trim() || "",

            correo,

            telefono?.trim() || ""
        ]);

    return result;
};

///////////////////////////////////////////////////
/*export const upsertCliente =
async ({
    bitrix_id,
    nombre,
    apellido,
    correo,
    telefono
}) => {

    if (!bitrix_id) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    if (
        correo &&
        !validator.isEmail(correo)
    ) {
        throw new Error(
            "Correo inválido"
        );
    }

    const sql = `
        INSERT INTO pro_clientes
        (
            bitrix_id,
            pri_nombre,
            pri_apellido,
            correo,
            telefono
        )
        VALUES
        (
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

        updated_at =
            NOW()
    `;

    const values = [

        Number(bitrix_id),

        nombre || "",

        apellido || "",

        correo || "",

        telefono || ""
    ];

    const [result] =
        await pool.query(
            sql,
            values
        );

    return result;
};
*/

///////////////////////////////////////////////////////////
// ELIMINAR
///////////////////////////////////////////////////////////

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
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// INSERT DEAL
////////////////////////////////////////////////////////////////
export const upsertDeal = async(deal)=>{

    const sql=`
    INSERT INTO deals(

        id,
        titulo,
        etapa,
        monto,
        contacto_id,
        company_id,
        fecha_modificacion

    )
    VALUES(
        ?,?,?,?,?,?,NOW()
    )
    ON DUPLICATE KEY UPDATE

        titulo=VALUES(titulo),
        etapa=VALUES(etapa),
        monto=VALUES(monto),
        contacto_id=VALUES(contacto_id),
        company_id=VALUES(company_id),
        fecha_modificacion=NOW()
    `;

    await pool.query(sql,[

        deal.ID,
        deal.TITLE,
        deal.STAGE_ID,
        deal.OPPORTUNITY,
        deal.CONTACT_ID,
        deal.COMPANY_ID

    ]);
};
/////////////////////////////////////////////
/////////////////////////////////////////////
/*
export const upsertDeal = async (deal) => {

    await pool.query(`
        INSERT INTO deals
        (
            bitrix_id,
            titulo,
            opportunity
        )
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            titulo = VALUES(titulo),
            opportunity = VALUES(opportunity)
    `,[
        deal.bitrix_id,
        deal.titulo,
        deal.opportunity
    ]);
};
*/
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
export const upsertLead = async(lead)=>{

    const sql=`
    INSERT INTO leads(

        id,
        titulo,
        nombre,
        apellido,
        telefono,
        email,
        estado

    )
    VALUES(
        ?,?,?,?,?,?,?
    )
    ON DUPLICATE KEY UPDATE

        titulo=VALUES(titulo),
        nombre=VALUES(nombre),
        apellido=VALUES(apellido),
        telefono=VALUES(telefono),
        email=VALUES(email),
        estado=VALUES(estado)
    `;

    await pool.query(sql,[

        lead.ID,
        lead.TITLE,
        lead.NAME,
        lead.LAST_NAME,
        lead.PHONE?.[0]?.VALUE,
        lead.EMAIL?.[0]?.VALUE,
        lead.STATUS_ID

    ]);
};
///////////////////////////////////////////////
//////////////////////////////////////////////
export const upsertCompany = async(company)=>{

    const sql=`
    INSERT INTO companies(

        id,
        nombre,
        telefono,
        email

    )
    VALUES(
        ?,?,?,?
    )
    ON DUPLICATE KEY UPDATE

        nombre=VALUES(nombre),
        telefono=VALUES(telefono),
        email=VALUES(email)
    `;

    await pool.query(sql,[

        company.ID,
        company.TITLE,
        company.PHONE?.[0]?.VALUE,
        company.EMAIL?.[0]?.VALUE

    ]);
};
/////////////////////////////////////////////
/////////////////////////////////////////////
/*
export const upsertCompany = async (company) => {

    await pool.query(`
        INSERT INTO companies
        (
            bitrix_id,
            title
        )
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title)
    `,[
        company.bitrix_id,
        company.title
    ]);
};
*/
/////////////////////////////////////////////////////////////////

export const upsertProducto = async(producto)=>{

    const sql=`
    INSERT INTO productos(

        id,
        nombre,
        precio,
        moneda

    )
    VALUES(
        ?,?,?,?
    )
    ON DUPLICATE KEY UPDATE

        nombre=VALUES(nombre),
        precio=VALUES(precio),
        moneda=VALUES(moneda)
    `;

    await pool.query(sql,[

        producto.ID,
        producto.NAME,
        producto.PRICE,
        producto.CURRENCY_ID

    ]);
};
/////////////////////////////////////////////
/////////////////////////////////////////////
/*
export const upsertProducto = async (producto) => {

    await pool.query(`
        INSERT INTO products
        (
            bitrix_id,
            name
        )
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name)
    `,[
        producto.bitrix_id,
        producto.name
    ]);
};
*/
