import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { pool } from './config/db.js'
import axios from "axios";
////////////////////////////////////////////////////////
import helmet from "helmet";
/////////////////////////////////////////////////////////
import indexRoutes from './routes/index.routes.js';
import bitrixRoutes from "./routes/bitrix.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import { BITRIX_WEBHOOK_OUT } from './config/bitrix.js';
/////////////////////////////////////////////////////////////////////////////////
const bitrixApiOut = axios.create({
    baseURL: BITRIX_WEBHOOK_OUT,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});


const app = express()

/////////////////////////////////////////////////////////////////////////////////
app.use(cors());
//app.use(helmet());
app.use(morgan('dev'));
/////////////////////////////////////////////////////////////////////////////////
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}))

////////////////////////////////////////////////////////////
// RUTAS MODULARES
////////////////////////////////////////////////////////////
app.use('/api/', indexRoutes)
app.use("/api/bitrix/", bitrixRoutes);
app.use("/api/clientes/", clientesRoutes);
///////////////////////////////////////////////////////////
//app.use('/api/', indexRoutes)
//app.use("/api/bitrix", bitrixRoutes);
//app.use("/api/clientes", clientesRoutes);
//////////////////////////////////////////////////////////
app.get('/', (req, res) => {
   res.send('Servidor funcionando')
})

//////////////////////////////////////////////////////////
app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada'
    })
})

///////////////////////////////////////////////////////////
export default app
////////////////////////////////////////////