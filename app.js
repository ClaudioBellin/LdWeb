import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import filesRouter      from './routers/files.js';
/*import jsonRouter       from './routers/json.js';
import dbRouter         from './routers/db.js';
import utenteRouter     from './routers/utente.js';
import varieRouter      from './routers/varie.js';
import errorRouter      from './routers/error.js';
import contattiRouter   from './routers/contatti.js';
import tabelleRouter    from './routers/tabelle.js';
import printRouter      from './routers/print.js';
import esecuzioneRouter from './routers/esecuzione.js';
import waRouter         from './routers/WA.js';
import logRouter        from './routers/log.js'; */

import { logError, errorHandler, notFoundHandler } from './utils/errorHandlers.js';

dotenv.config();

const app = express();

// Middleware di base
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

 // Routers
app.use('/files',      filesRouter);
/*app.use('/json',       jsonRouter);
app.use('/db',         dbRouter);
app.use('/utente',     utenteRouter);
app.use('/varie',      varieRouter);
app.use('/contatti',   contattiRouter);
app.use('/print',      printRouter);
app.use('/tabelle',    tabelleRouter);
app.use('/esecuzione', esecuzioneRouter);
app.use('/wa',         waRouter);
app.use('/log',        logRouter); */

// Gestione 404
app.use(notFoundHandler);

// Gestione errori centralizzata
app.use(errorHandler);

// Gestione Promise rejection e uncaught exception
process.on('unhandledRejection', (reason, promise) => {
  logError('unhandledRejection', { reason, promise });
});
process.on('uncaughtException', err => {
  logError('uncaughtException', { message: err.message, stack: err.stack });
  process.exit(1);
});

export default app;
