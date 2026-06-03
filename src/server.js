import app from './app.js';
import { pool } from './config/db.js';
//import dotenv from 'dotenv';
import chalk from 'chalk';
import {
    iniciarWorker
} from './jobs/sync.worker.js';
////////////////////////////////////////////

//dotenv.config();
////////////////////////////////////////////

const PORT = process.env.PORT || 3000;
///////////////////////////////////////////

//const server = app.listen(PORT);
//server.keepAliveTimeout = 65000;

//server.on('listening', () => {
//  console.log(chalk.green(`Server is running on port ${PORT}`));
//});

//server.on('error', (error) => {
//  console.error(chalk.red('Error starting server:'), error);
//  process.exit(1);
//});


///////////////////////////////////////////////////////////

const startServer = async () => {

    try {

        const connection =
            await pool.getConnection();

        console.log(chalk.yellowBright(
            "MYSQL CONNECTED IN RAILWAY")
        );

        connection.release();

        ///////////////////////////////////////////////////

        app.listen(PORT, () => {

            console.log(chalk.green(
                `SERVER IS RUNNING IN PORT: ${PORT}`)
            );

             ///////////////////////////////////////////////////

            iniciarWorker();
        });



    } catch (error) {

        console.error(
            "MYSQL ERROR",
            error.message
        );
    }
};

///////////////////////////////////////////////////////////

startServer();