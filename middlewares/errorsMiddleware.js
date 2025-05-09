import { logError } from '../utils/errorLog.js';

/**
 * Avvolge route asincrone per inoltrare errori al middleware di Express
 * @param {Function} fn Async handler (req, res, next)
 * @returns {Function} Handler Express
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware globale per la gestione degli errori Express
 * @param {Error} err - Errore generato
 * @param {import('express').Request} req - Richiesta Express
 * @param {import('express').Response} res - Risposta Express
 * @param {import('express').NextFunction} next - Funzione next
 */
export function errorHandlerAsync(err, req, res, next) {
  // Prepara metadati utente (se autenticato)
  const userMeta = req.user
    ? JSON.stringify(req.user)
    : JSON.stringify({ idUtente: 0, nome: 'Guest', idLivello: 0 });

  // Logga l'errore con stack completo
  logError(
    'Generale',
    0,
    err.stack || err.message || 'Errore sconosciuto',
    userMeta,
    req.body?.ordine || 0
  );

  // Risposta JSON standardizzata
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Errore interno del server'
  });
}