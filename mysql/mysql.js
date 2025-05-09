import mysql from 'mysql2/promise';
import config from '../impostazioni/config.js';
import { logError } from '../utils/errorLog.js';

/**
 * Crea un pool di connessioni MySQL condiviso
 */
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit || 10,
  queueLimit: 0,
  timezone: config.db.timezone || 'Z',
});

/**
 * Esegue una query SQL in modo sicuro con prepared statements
 * @param {string} query       - Query SQL con placeholders (?)
 * @param {Array<any>} params  - Valori da sostituire nei placeholders
 * @returns {Promise<any[]>}   - Risultato della query
 * @throws {Error}             - Se la query fallisce
 */
export async function eseguiSql(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (err) {
    // Log dell'errore con WebSocket e file
    await logError('DB', 0, err, JSON.stringify({ idUtente: 0, nome: 'Admin', idLivello: 1 }), 0);
    console.error(`Errore SQL: ${err.message}`);
    throw err;
  }
}

/**
 * Ottiene una connessione dedicata (ad esempio per transazioni)
 * @returns {Promise<mysql.PoolConnection>}
 */
export async function getConnection() {
  return pool.getConnection();
}

/**
 * Chiude il pool di connessioni (es. in fase di shutdown)
 */
export async function closePool() {
  await pool.end();
}
