/////////////////////////////////////////////////////////////
// productos.controller.js
/////////////////////////////////////////////////////////////

import {

    existeProducto,
    obtenerProducto,
    listarProductos,
    upsertProducto,
    eliminarProducto

} from "../../services/inventarios/productos.service.js";

import {

    crearProductoBitrix,
    obtenerProductoBitrix,
    actualizarProductoBitrix,
    eliminarProductoBitrix,
    listarProductosBitrix

} from "../../services/inventarios/bitrix-productos.service.js";

/////////////////////////////////////////////////////////////
// CREAR PRODUCTO
/////////////////////////////////////////////////////////////

export const crearProductoController =
async (req, res) => {

    try {

        const producto = req.body;

        if (!producto.nombre?.trim()) {

            return res.status(400).json({

                success: false,
                message:
                    "Nombre requerido"

            });
        }

        /////////////////////////////////////////////////////
        // CREAR EN BITRIX
        /////////////////////////////////////////////////////

        const bitrix_id =
            await crearProductoBitrix(
                producto
            );

        /////////////////////////////////////////////////////
        // GUARDAR EN MYSQL
        /////////////////////////////////////////////////////

        await upsertProducto({

            ...producto,
            bitrix_id

        });

        return res.status(201).json({

            success: true,
            bitrix_id

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// OBTENER PRODUCTO
/////////////////////////////////////////////////////////////

export const obtenerProductoController =
async (req, res) => {

    try {

        const { bitrix_id } =
            req.params;

        const producto =
            await obtenerProducto(
                bitrix_id
            );

        if (!producto) {

            return res.status(404).json({

                success: false,
                message:
                    "Producto no encontrado"

            });
        }

        return res.json({

            success: true,
            data: producto

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// LISTAR PRODUCTOS
/////////////////////////////////////////////////////////////

export const listarProductosController =
async (req, res) => {

    try {

        const productos =
            await listarProductos();

        return res.json({

            success: true,
            total:
                productos.length,
            data: productos

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// ACTUALIZAR PRODUCTO
/////////////////////////////////////////////////////////////

export const actualizarProductoController =
async (req, res) => {

    try {

        const { bitrix_id } =
            req.params;

        const producto =
            req.body;

        const existe =
            await existeProducto(
                bitrix_id
            );

        if (!existe) {

            return res.status(404).json({

                success: false,
                message:
                    "Producto no existe"

            });
        }

        /////////////////////////////////////////////////////
        // BITRIX
        /////////////////////////////////////////////////////

        await actualizarProductoBitrix(

            bitrix_id,
            producto

        );

        /////////////////////////////////////////////////////
        // MYSQL
        /////////////////////////////////////////////////////

        await upsertProducto({

            ...producto,
            bitrix_id

        });

        return res.json({

            success: true,
            message:
                "Producto actualizado"

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// ELIMINAR PRODUCTO
/////////////////////////////////////////////////////////////

export const eliminarProductoController =
async (req, res) => {

    try {

        const { bitrix_id } =
            req.params;

        /////////////////////////////////////////////////////
        // BITRIX
        /////////////////////////////////////////////////////

        await eliminarProductoBitrix(
            bitrix_id
        );

        /////////////////////////////////////////////////////
        // MYSQL
        /////////////////////////////////////////////////////

        await eliminarProducto(
            bitrix_id
        );

        return res.json({

            success: true,
            message:
                "Producto eliminado"

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// SINCRONIZAR TODO
/////////////////////////////////////////////////////////////

export const sincronizarProductosController =
async (req, res) => {

    try {

        const productosBitrix =
            await listarProductosBitrix();

        let sincronizados = 0;

        for (
            const productoBitrix
            of productosBitrix
        ) {

            await upsertProducto({

                bitrix_id:
                    productoBitrix.ID,

                nombre:
                    productoBitrix.NAME,

                descripcion:
                    productoBitrix.DESCRIPTION,

                precio:
                    productoBitrix.PRICE,

                moneda:
                    productoBitrix.CURRENCY_ID,

                activo: true

            });

            sincronizados++;
        }

        return res.json({

            success: true,

            sincronizados

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};

/////////////////////////////////////////////////////////////
// WEBHOOK BITRIX
/////////////////////////////////////////////////////////////

export const webhookProductosController =
async (req, res) => {

    try {

        const body = req.body;

        const event =
            body.event;

        /////////////////////////////////////////////////////
        // PRODUCTO CREADO
        /////////////////////////////////////////////////////

        if (
            event ===
            "ONCRMPRODUCTADD"
        ) {

            const bitrix_id =
                body.data
                    ?.FIELDS?.ID;

            const producto =
                await obtenerProductoBitrix(
                    bitrix_id
                );

            await upsertProducto({

                bitrix_id:
                    producto.ID,

                nombre:
                    producto.NAME,

                descripcion:
                    producto.DESCRIPTION,

                precio:
                    producto.PRICE,

                moneda:
                    producto.CURRENCY_ID,

                activo: true

            });

            console.log(
                "PRODUCTO CREADO:",
                bitrix_id
            );
        }

        /////////////////////////////////////////////////////
        // PRODUCTO ACTUALIZADO
        /////////////////////////////////////////////////////

        if (
            event ===
            "ONCRMPRODUCTUPDATE"
        ) {

            const bitrix_id =
                body.data
                    ?.FIELDS?.ID;

            const producto =
                await obtenerProductoBitrix(
                    bitrix_id
                );

            await upsertProducto({

                bitrix_id:
                    producto.ID,

                nombre:
                    producto.NAME,

                descripcion:
                    producto.DESCRIPTION,

                precio:
                    producto.PRICE,

                moneda:
                    producto.CURRENCY_ID,

                activo: true

            });

            console.log(
                "PRODUCTO ACTUALIZADO:",
                bitrix_id
            );
        }

        /////////////////////////////////////////////////////
        // PRODUCTO ELIMINADO
        /////////////////////////////////////////////////////

        if (
            event ===
            "ONCRMPRODUCTDELETE"
        ) {

            const bitrix_id =
                body.data
                    ?.FIELDS?.ID;

            await eliminarProducto(
                bitrix_id
            );

            console.log(
                "PRODUCTO ELIMINADO:",
                bitrix_id
            );
        }

        return res.status(200).json({

            success: true

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,
            message: error.message

        });
    }
};