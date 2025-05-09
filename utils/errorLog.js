import fs from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import winston from 'winston';
import 'winston-daily-rotate-file';
//import webSocketServer from '../utils/webSocketServer.js';
import impostazioni from '../impostazioni/impostazioni.js';

// Percorso del file di log (configurabile)
const LOG_FILE = path.resolve(impostazioni.logDir, 'errors.log');

// Configurazione Winston con rotazione giornaliera
const transport = new winston.transports.DailyRotateFile({
  filename: path.join(impostazioni.logDir, 'errors-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [transport]
});

/**
 * Registra un errore nel file di log e opzionalmente invia un messaggio via WebSocket
 * @param {string} tipo      - Tipologia di errore (es. 'PDF', 'DB')
 * @param {number} id        - ID correlato all'errore
 * @param {string|Error} msg - Messaggio di errore o oggetto Error
 * @param {object|string} utente - Utente in formato JSON o oggetto {idUtente,nome,idLivello}
 * @param {number} ordine    - Numero ordine associato
 * @returns {object}         - L'entry di log creata
 */
export async function logError(tipo, id, msg, utente, ordine) {
  // Estrae testo dal messaggio
  const messageText =
    typeof msg === 'string' ? msg : msg?.message ?? 'Errore sconosciuto';

  // Garantisce oggetto utente
  const userObj =
    typeof utente === 'string' ? JSON.parse(utente) : utente;

  const entry = {
    timestamp: dayjs().format('YYYY/MM/DD HH:mm:ss'),
    tipo,
    id,
    ordine,
    message: messageText,
    utente: userObj
  };

  try {
    // Log su file tramite Winston
    logger.info(entry);

    // Invio messaggio via WebSocket
    const wsMessage = { type: tipo, data: entry };
    if (userObj.idUtente) {
      //webSocketServer.specificClientSend(userObj.idUtente, wsMessage);
    } else {
      //webSocketServer.broadcast(wsMessage);
    }
  } catch (error) {
    console.error('Errore durante il logging:', error);
  }

  return entry;
}

/**
 * Restituisce tutte le entry di errore memorizzate
 * @returns {Array<object>} - Lista di oggetti di log
 */
export function getErrors() {
  if (!existsSync(LOG_FILE)) return [];

  const content = readFileSync(LOG_FILE, 'utf-8').trim();
  if (!content) return [];

  return content
    .split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Pulisce il file di log e inizializza con un'intestazione
 */
export async function clearErrors() {
  try {
    // Sovrascrive il file di log
    await fs.writeFile(LOG_FILE, '');

    const initEntry = {
      timestamp: dayjs().format('YYYY/MM/DD HH:mm:ss'),
      message: 'Log iniziato',
      utente: { idUtente: 0, nome: 'Admin', idLivello: 1 },
      tipo: 'SYSTEM',
      id: 0,
      ordine: 0
    };
    // Registra entry di inizio log
    logger.info(initEntry);
  } catch (error) {
    console.error('Errore durante la pulizia del log:', error);
  }
}