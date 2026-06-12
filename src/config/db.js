////////////////////////////////////////
// db.js
////////////////////////////////////////
import { createPool } from 'mysql2/promise'
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

//import mysql from 'mysql2/promise'
import {
  MYSQLHOST,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
  MYSQLPORT
} from '../config.js';

export const pool = createPool({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASSWORD,
  database: MYSQLDATABASE,
  port: MYSQLPORT,

   waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 10,
    queueLimit: Number(process.env.MYSQL_QUEUE_LIMIT) || 0,

  ssl: {
    rejectUnauthorized: false
  },
  //////////////////////////////////////////
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

//////////////////////////////////////////////////////////
// TEST DE CONEXION
//////////////////////////////////////////////////////////

pool.getConnection()
    .then(connection => {

        console.log(chalk.blueBright('MYSQL RAILWAY CONECTADO'))

        connection.release()

    })
    .catch(error => {

        console.error('ERROR MYSQL:')
        console.error(error)
    })

export default pool;