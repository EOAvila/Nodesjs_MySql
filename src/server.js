import app from './app.js';
import { pool } from './config/db.js';
import dotenv from 'dotenv';
import chalk from 'chalk';
////////////////////////////////////////////

dotenv.config();

////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

///////////////////////////////////////////

const server = app.listen(PORT);
server.keepAliveTimeout = 65000;

server.on('listening', () => {
  console.log(chalk.green(`Server is running on port ${PORT}`));
});

server.on('error', (error) => {
  console.error(chalk.red('Error starting server:'), error);
  process.exit(1);
});

///////////////////////////////////////////
// RUTA PARA WEBHOOK CREADA
//////////////////////////////////////////
app.post("/webhook/bitrix", (req, res) => {
    console.log("Webhook recibido");
    console.log(req.body);

    res.status(200).json({
        exito: true,
        mensaje: "Webhook recibido"
    });
});
////////////////////////////////////////////////
console.log(chalk.green(`
✅ ${process.env.APP_NAME || 'Node API'} running
🌍 Environment : ${process.env.NODE_ENV || 'development'}
🚪 Port        : ${PORT}
🔗 Local URL   : http://localhost:${PORT}
⏰ Time        : ${new Date().toLocaleString()}
`));

console.log(chalk.yellowBright(
  "MYSQL CONNECTED IN RAILWAY")
);
