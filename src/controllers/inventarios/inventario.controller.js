/////////////////////////////////////////////////////////////
// inventario.controller.js
/////////////////////////////////////////////////////////////
import {
    listarInventario
} from "../../services/inventarios/inventario.service.js";

/////////////////////////////////////////////////////////////

export const obtenerInventarioController =
async (req, res) => {

    res.json({
        success: true,
        message: "obtenerInventarioController"
    });
};

export const listarInventarioController =
async (req, res) => {

    try {

        const inventario =
            await listarInventario();

        return res.status(200).json({

            success: true,

            total:
                inventario.length,

            data:
                inventario
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};

export const registrarEntradaController =
async (req, res) => {

    res.json({
        success: true,
        message: "registrarEntradaController"
    });
};

export const registrarSalidaController =
async (req, res) => {

    res.json({
        success: true,
        message: "registrarSalidaController"
    });
};

export const ajustarInventarioController =
async (req, res) => {

    res.json({
        success: true,
        message: "ajustarInventarioController"
    });
};

export const listarMovimientosController =
async (req, res) => {

    res.json({
        success: true,
        message: "listarMovimientosController"
    });
};

export const sincronizarInventarioController =
async (req, res) => {

    res.json({
        success: true,
        message: "sincronizarInventarioController"
    });
};