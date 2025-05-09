import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const logFile = path.resolve(__dirname, '../logs/error.log');


export function logError(type, info) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    ...info
  };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Risorsa non trovata' });
}

export function errorHandler(err, req, res, next) {
  logError('applicationError', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Errore interno del server'
  });
}
  