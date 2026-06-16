//////////////////////////////////////////////////////
// app.js
//////////////////////////////////////////////////////
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import crypto from "crypto";
///////////////////////////////////////////////////////////

import indexRoutes from "./routes/index.routes.js";
import bitrixRoutes from "./routes/bitrix.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";

import productosRoutes
    from "./routes/inventarios/productos.routes.js";

import inventarioRoutes
    from "./routes/inventarios/inventario.routes.js";
///////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
// INICIALIZACIÓN DE EXPRESS
////////////////////////////////////////////////////////////

const app = express();

////////////////////////////////////////////////////////////
// CORS
////////////////////////////////////////////////////////////

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

///////////////////////////////////////////////////////////
// MIDDLEWARES
///////////////////////////////////////////////////////////
app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

///////////////////////////////////////////////////////////
// BODY PARSER
///////////////////////////////////////////////////////////
app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);

////////////////////////////////////////////////////////////
// LOGGER HTTP
////////////////////////////////////////////////////////////
app.use(
    morgan("dev")
);

////////////////////////////////////////////////////////////
// CONFIGURACIÓN GLOBAL
////////////////////////////////////////////////////////////
app.disable("x-powered-by");

//////////////////////////
// PRUEBA PROXY
//////////////////////////
app.set("trust proxy", 1);

///////////////////////////////////////////////////////////
// WEBHOOK RUTAS
///////////////////////////////////////////////////////////

app.use("/api", indexRoutes);

app.use("/webhook", bitrixRoutes);

app.use("/clientes", clientesRoutes);

app.use(
    "/api/productos",
    productosRoutes
);

app.use(
    "/api/inventario",
    inventarioRoutes
);

////////////////////////////////////////////////////////////
// RUTA PRINCIPAL
////////////////////////////////////////////////////////////
app.get("/", (req, res) => {

    return res.status(200).json({
        success: true,
        message: "🚀 API REST funcionando correctamente",
        timestamp: new Date().toISOString()
    });

});

////////////////////////////////////
// VALIDA CRYPTO
///////////////////////////////////
app.use((req, res, next) => {

    req.requestId = crypto.randomUUID();

    console.log(
        `[${req.requestId}] ${req.method} ${req.originalUrl}`
    );

    next();

});

///////////////////////////////////////////////////////////
// HEALTH CHECK
///////////////////////////////////////////////////////////

/*app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Servidor funcionando"
    });
});

///////////////////////////////////////////////////////////
// PRUEBA DE RUTAS
///////////////////////////////////////////////////////////
app.get("/webhook/test", (req, res) => {

    res.json({
        success: true,
        message: "Webhook registrado y funcionando correctamente"
    });

});
*/

////////////////////////////////////////////////////////////
// MANEJO GLOBAL DE ERRORES
////////////////////////////////////////////////////////////
/*app.use((error, req, res, next) => {

    console.error(error);

    return res.status(error.status || 500).json({
        success: false,
        error:
            error.code ||
            error.name ||
            "INTERNAL_SERVER_ERROR",
        message:
            process.env.NODE_ENV === "production"
                ? "Error interno del servidor"
                : error.message,
        stack:
            process.env.NODE_ENV !== "production"
                ? error.stack
                : undefined
    });

});
*/
app.use((err, req, res, next) => {

    console.error("=================================");
    console.error("ERROR GLOBAL");
    console.error(err);
    console.error("=================================");

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: err.message
    });
});


/*
app.use((error, req, res, next) => {

    console.error(
        "================================="
    );

    console.error("ERROR GLOBAL");

    console.error(
        error.stack || error
    );

    console.error(
        "================================="
    );

    return res.status(
        error.status || 500
    ).json({
        success: false,
        message: error.message
    });

});
*/

//////////////////////////////////////////////////////////
// CAPTURA DE ERROR JSON
//////////////////////////////////////////////////////////
app.use((error, req, res, next) => {

    if (error instanceof SyntaxError) {

        return res.status(400).json({
            success: false,
            message: "JSON inválido"
        });

    }

    next(error);

});

////////////////////////////////////////////////////////////
// ERROR 404 - MANEJO DE RUTAS NO ENCONTRADAS
////////////////////////////////////////////////////////////
app.use((req, res) => {

    return res.status(404).json({
        success: false,
        error: "ENDPOINT_NOT_FOUND",
        message: `La ruta ${req.originalUrl} no existe`
    });

});

////////////////////////////////////////////////////////////
// EXPORTAR APP
////////////////////////////////////////////////////////////
export default app;

