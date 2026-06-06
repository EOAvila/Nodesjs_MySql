import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

///////////////////////////////////////////////////////////

import indexRoutes from "./routes/index.routes.js";
import bitrixRoutes from "./routes/bitrix.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";

///////////////////////////////////////////////////////////

const app = express();

///////////////////////////////////////////////////////////
// MIDDLEWARES
///////////////////////////////////////////////////////////

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

///////////////////////////////////////////////////////////
// BODY PARSER
///////////////////////////////////////////////////////////

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

///////////////////////////////////////////////////////////
// RUTAS
///////////////////////////////////////////////////////////

app.use("/api/", indexRoutes);

app.use("/webhook/bitrix", bitrixRoutes);
app.get("/webhook/test", (req, res) => {

    res.json({
        success: true,
        message: "Webhook registrado"
    });

});

app.use("/api/clientes", clientesRoutes);

///////////////////////////////////////////////////////////
// HEALTH CHECK
///////////////////////////////////////////////////////////

app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Servidor funcionando"
    });
});

///////////////////////////////////////////////////////////
// Prueba de Rutas
///////////////////////////////////////////////////////////
app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Ruta test funcionando"
    });
});

///////////////////////////////////////////////////////////
// 404
///////////////////////////////////////////////////////////

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });
});

///////////////////////////////////////////////////////////
// MANEJO GLOBAL DE ERRORES
///////////////////////////////////////////////////////////

app.use((error, req, res, next) => {

    console.error("ERROR GLOBAL:", error);

    ///////////////////////////////////////////////////////

    res.status(500).json({
        success: false,
        message:
            error.message ||
            "Error interno del servidor"
    });
});

///////////////////////////////////////////////////////////
app.get(
    "/api/health",
    (req,res)=>{

        res.status(200)
        .json({

            success:true,

            server:"online",

            timestamp:
                new Date()
        });
    }
);

///////////////////////////////////////////////////////////

export default app;