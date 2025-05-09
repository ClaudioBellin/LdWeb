// config.js
import dotenv from 'dotenv';
dotenv.config();

export default {
  // …le tue sezioni paths, tree, ecc.
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASS     || '',
    database: process.env.DB_NAME     || 'mydatabase',
    connectionLimit: Number(process.env.DB_CONN_LIMIT) || 10,
    timezone: process.env.DB_TIMEZONE || 'Z'
  }
};
