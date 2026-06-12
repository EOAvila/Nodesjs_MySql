/////////////////////////////////
// bitrix.js
//////////////////////////////////
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

/**
 * Validar variables requeridas
 */
const requiredEnvVars = [
    "BITRIX_WEBHOOK_IN",
    "BITRIX_WEBHOOK_OUT"
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(
            `❌ La variable de entorno ${envVar} no está definida en el archivo .env`
        );
    }
}

/**
 * Configuración centralizada de la aplicación
 */
export const config = Object.freeze({
    bitrix: {
        webhookIn: process.env.BITRIX_WEBHOOK_IN.trim(),
        webhookOut: process.env.BITRIX_WEBHOOK_OUT.trim()
    },

    app: {
        env: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT) || 3000
    }
});

/**
 * Exportaciones directas para compatibilidad
 */
export const BITRIX_WEBHOOK_IN = config.bitrix.webhookIn;
export const BITRIX_WEBHOOK_OUT = config.bitrix.webhookOut;