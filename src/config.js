///////////////////////////
// config.js
//////////////////////////
import dotenv from 'dotenv';
//////////////////////////////////////////////////
dotenv.config();
//////////////////////////////////////////////////
export const PORT = process.env.PORT || 3000;
//////////////////////////////////////////////////
export const MYSQLHOST = process.env.MYSQLHOST || 'localhost';
export const MYSQLUSER = process.env.MYSQLUSER || 'root';
export const MYSQLPASSWORD = process.env.MYSQLPASSWORD || 'admin';
export const MYSQLDATABASE = process.env.MYSQLDATABASE || 'cal1pz0_cofin';
//////////////////////////////////////////////////
export const MYSQLPORT =
    Number(process.env.MYSQLPORT) || 3306;

    //////////////////////////////////////////////////////////////////////////////////

export const BITRIX_WEBHOOK_IN = process.env.BITRIX_WEBHOOK_IN;
export const BITRIX_WEBHOOK_OUT = process.env.BITRIX_WEBHOOK_OUT;