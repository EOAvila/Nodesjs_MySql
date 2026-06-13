///////////////////////////
// config.js
//////////////////////////
import dotenv from 'dotenv';
//////////////////////////////////////////////////
dotenv.config();
//////////////////////////////////////////////////
export const PORT = process.env.PORT || 3000;
//////////////////////////////////////////////////
export const MYSQLHOST = process.env.MYSQLHOST || '';
export const MYSQLUSER = process.env.MYSQLUSER || '';
export const MYSQLPASSWORD = process.env.MYSQLPASSWORD || '';
export const MYSQLDATABASE = process.env.MYSQLDATABASE || '';
//////////////////////////////////////////////////
export const MYSQLPORT =
    Number(process.env.MYSQLPORT) || 3306;
    //////////////////////////////////////////////////////////////////////////////////
export const BITRIX_WEBHOOK_IN = process.env.BITRIX_WEBHOOK_IN;
export const BITRIX_WEBHOOK_OUT = process.env.BITRIX_WEBHOOK_OUT;
