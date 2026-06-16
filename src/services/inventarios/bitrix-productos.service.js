/////////////////////////////////////////////////////////////
// bitrix-productos.service.js
/////////////////////////////////////////////////////////////

import validator from "validator";
import pool from "../../config/db.js";

//import {
//    bitrixRequest
//} from "./bitrix.service.js";

const log = (...args) => {

    console.log(
        `[${new Date().toISOString()}]`,
        ...args
    );
};

/////////////////////////////////////////////////////////////
// VALIDAR PRODUCTO
/////////////////////////////////////////////////////////////

const validarProducto =
(producto) => {

    const errores = [];

    if (
        !producto.nombre ||
        !producto.nombre.trim()
    ) {
        errores.push(
            "Nombre requerido"
        );
    }

    if (
        producto.precio !== undefined &&
        (
            isNaN(producto.precio) ||
            Number(producto.precio) < 0
        )
    ) {
        errores.push(
            "Precio inválido"
        );
    }

    if (
        producto.moneda &&
        producto.moneda.length > 10
    ) {
        errores.push(
            "Moneda inválida"
        );
    }

    if (
        errores.length > 0
    ) {

        throw new Error(
            errores.join(", ")
        );
    }
};

/////////////////////////////////////////////////////////////
// MAPEAR PRODUCTO
/////////////////////////////////////////////////////////////

const mapearProductoBitrix =
(producto) => {

    return {

        NAME:
            producto.nombre,

        DESCRIPTION:
            producto.descripcion || "",

        PRICE:
            Number(
                producto.precio || 0
            ),

        CURRENCY_ID:
            producto.moneda || "USD",

        ACTIVE:
            producto.activo !== false
                ? "Y"
                : "N"
    };
};

/////////////////////////////////////////////////////////////
// CREAR PRODUCTO
/////////////////////////////////////////////////////////////

export const crearProductoBitrix =
async (
    producto
) => {

    validarProducto(
        producto
    );

    const fields =
        mapearProductoBitrix(
            producto
        );

    const result =
        await bitrixRequest(

            "crm.product.add",

            {
                fields
            }

        );
  
        log(
            "PRODUCTO CREADO EN BITRIX:",
                result
        );

    return Number(
        result
        
    );
};

/////////////////////////////////////////////////////////////
// OBTENER PRODUCTO
/////////////////////////////////////////////////////////////

export const obtenerProductoBitrix =
async (
    bitrix_id
) => {

    if (
        !bitrix_id
    ) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    const result =
        await bitrixRequest(

            "crm.product.get",

            {
                id: bitrix_id
            }

        );

    return result;
};

/////////////////////////////////////////////////////////////
// ACTUALIZAR PRODUCTO
/////////////////////////////////////////////////////////////

export const actualizarProductoBitrix =
async (
    bitrix_id,
    producto
) => {

    if (
        !bitrix_id
    ) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    validarProducto(
        producto
    );

    const fields =
        mapearProductoBitrix(
            producto
        );

    const result =
        await bitrixRequest(

            "crm.product.update",

            {
                id: bitrix_id,
                fields
            }

        );

        log(
            "PRODUCTO ACTUALIZADO EN BITRIX:",
                result
        );

    return result;
};

/////////////////////////////////////////////////////////////
// ELIMINAR PRODUCTO
/////////////////////////////////////////////////////////////

export const eliminarProductoBitrix =
async (
    bitrix_id
) => {

    if (
        !bitrix_id
    ) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    return await bitrixRequest(

        "crm.product.delete",

        {
            id: bitrix_id
        }

    );
    log(
        "PRODUCTO ELIMINADO EN BITRIX:",
            result
    );


};

/////////////////////////////////////////////////////////////
// EXISTE PRODUCTO
/////////////////////////////////////////////////////////////

export const existeProductoBitrix =
async (
    bitrix_id
) => {

    try {

        const producto =
            await obtenerProductoBitrix(
                bitrix_id
            );

        return !!producto;

    } catch {

        return false;
    }
};

/////////////////////////////////////////////////////////////
// LISTAR PRODUCTOS
/////////////////////////////////////////////////////////////

export const listarProductosBitrix =
async () => {

    let start = 0;

    let productos = [];

    while (true) {

        const result =
            await bitrixRequest(

                "crm.product.list",

                {
                    order: {
                        ID: "ASC"
                    },

                    start
                }

            );

        if (
            !result ||
            result.length === 0
        ) {
            break;
        }

        productos.push(
            ...result
        );

        start += 50;
    }

    return productos;
};

/////////////////////////////////////////////////////////////
// BUSCAR PRODUCTO
/////////////////////////////////////////////////////////////

export const buscarProductoBitrix =
async (
    texto
) => {

    if (
        !texto
    ) {
        return [];
    }

    return await bitrixRequest(

        "crm.product.list",

        {
            filter: {

                "%NAME":
                    texto

            }
        }

    );
};

/////////////////////////////////////////////////////////////
// SINCRONIZAR PRODUCTO
/////////////////////////////////////////////////////////////

export const sincronizarProductoBitrix =
async (
    bitrix_id
) => {

    if (
        !bitrix_id
    ) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    return await obtenerProductoBitrix(
        bitrix_id
    );

    log(
        "PRODUCTOS SINCRONIZADOS:",
        productos.length
    );

};

/////////////////////////////////////////////////////////////
// SINCRONIZAR TODOS
/////////////////////////////////////////////////////////////

export const sincronizarTodosBitrix =
async () => {

    return await listarProductosBitrix();
};

/////////////////////////////////////////////////////////////
// ACTIVAR PRODUCTO
/////////////////////////////////////////////////////////////

export const activarProductoBitrix =
async (
    bitrix_id
) => {

    return await bitrixRequest(

        "crm.product.update",

        {

            id: bitrix_id,

            fields: {
                ACTIVE: "Y"
            }
        }

    );

    log(
        "TODOS LOS PRODUCTOS SINCRONIZADOS:",
        productos.length
    );

};

/////////////////////////////////////////////////////////////
// DESACTIVAR PRODUCTO
/////////////////////////////////////////////////////////////

export const desactivarProductoBitrix =
async (
    bitrix_id
) => {

    return await bitrixRequest(

        "crm.product.update",

        {

            id: bitrix_id,

            fields: {
                ACTIVE: "N"
            }
        }

    );
    
    log(
        "PRODUCTOS DESACTIVADOS:",
        productos.length
    );
};