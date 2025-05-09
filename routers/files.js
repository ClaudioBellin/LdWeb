import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import multer from 'multer';
import { body, query, validationResult } from 'express-validator';
import errorLog from '../utils/errorLog.js';
import gestioneFiles from '../utils/gestioneFiles.js';
import impostazioni from '../impostazioni/impostazioni.js';
import mysql from '../mysql/mysql.js';
import { errorHandlerAsync } from '../middlewares/errorsMiddleware.js';

const router = express.Router();

// Metadati amministratore usati in tutte le operazioni
const ADMIN_META = JSON.stringify({ idUtente: 0, nome: 'Admin', idLivello: 1 });

// --------------------
// Configurazione Multer
// --------------------
const storage = multer.diskStorage({
  // Destinazione: config.uploadsDir (es. './uploads')
  destination: (req, file, cb) => cb(null, impostazioni.uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeBase = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safeBase}`);
  }
});

/**
 * Limiti e filtro file (es. solo PDF e immagini)
 */
const upload = multer({
  storage,
  limits: { fileSize: impostazioni.maxFileSize },
  fileFilter: (req, file, cb) => {
    // Accetta solo PDF o immagini
    const allowed = /pdf|jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext.substring(1))) return cb(null, true);
    cb(new Error('Formato file non supportato')); 
  }
});

/**
 * Middleware di validazione express-validator
 */
const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

/**
 * @route GET /tree
 * @desc  Ottiene struttura ad albero della cartella opzionale
 * @query {string} [path] - Percorso relativo da esplorare
 */
router.get(
  '/tree',
  validate([query('path').optional().isString()]),
  errorHandlerAsync(async (req, res) => {
    const folderPath = req.query.path || '';
    const tree = await gestioneFiles.tree(folderPath);
    res.status(200).json({ success: true, data: tree });
  })
);

/**
 * @route GET /contenuto
 * @desc  Lista contenuto di una cartella
 * @query {string} [path] - Percorso relativo da leggere
 */
router.get(
  '/contenuto',
  validate([query('path').optional().isString()]),
  errorHandlerAsync(async (req, res) => {
    const folderPath = req.query.path || '';
    const content = await gestioneFiles.contenutoCartella(folderPath);
    res.status(200).json({ success: true, data: content });
  })
);

/**
 * @route POST /refresh-tree
 * @desc  Ricostruisce e memorizza gli alberi da configurazione
 */
router.post(
  '/refresh-tree',
  errorHandlerAsync(async (_req, res) => {
    await mysql.eseguiSql('TRUNCATE TABLE PathOttimizzazioni');
    const entries = Object.entries(impostazioni.tree);
    for (const [key, { path: root, descrizione }] of entries) {
      const treeObj = await gestioneFiles.tree(root, key);
      treeObj.descrizione = descrizione;
      const payload = JSON.stringify(treeObj);
      await mysql.eseguiSql(
        'INSERT INTO PathOttimizzazioni (Nome, Json) VALUES (?, ?)',
        [key, payload]
      );
    }
    res.status(200).json({ success: true, message: 'PathOttimizzazioni aggiornate' });
  })
);

/**
 * @route GET /find
 * @desc  Cerca file per nome
 * @query {string} file - Parte di nome da cercare
 */
router.get(
  '/find',
  validate([query('file').isString().notEmpty()]),
  errorHandlerAsync(async (req, res) => {
    const results = await gestioneFiles.findFiles(req.query.file);
    res.status(200).json({ success: true, data: results });
  })
);

/**
 * @route GET /exists
 * @desc  Verifica esistenza del file
 * @query {string} file - Percorso file da controllare
 */
router.get(
  '/exists',
  validate([query('file').isString().notEmpty()]),
  errorHandlerAsync(async (req, res) => {
    const exists = await gestioneFiles.checkFileExists(req.query.file);
    res.status(200).json({ success: exists });
  })
);

/**
 * @route POST /upload
 * @desc  Carica un file e lo sposta nella cartella "ordine"
 * @body {string} ordine - Codice alfanumerico dell'ordine
 * @body {file} file - File da caricare
 */
router.post(
  '/upload',
  upload.single('file'),
  validate([body('ordine').isAlphanumeric()]),
  errorHandlerAsync(async (req, res) => {
    const ordine = req.body.ordine;
    const { filename, path: tempPath } = req.file;
    const destDir = path.join(impostazioni.pathDati, ordine);
    // Crea cartella ordine
    await gestioneFiles.createFolder(0, `${destDir}/`, ADMIN_META, ordine);
    // Sposta file con prefisso ordine
    const finalPath = path.join(destDir, `${ordine}-${filename}`);
    await gestioneFiles.muoviFile(0, tempPath, finalPath, ADMIN_META);
    res.status(201).json({ success: true, data: { path: finalPath } });
  })
);

/**
 * @route GET /download
 * @desc  Scarica un file in streaming
 * @query {string} file - Path assoluto o relativo del file
 */
router.get(
  '/download',
  validate([query('file').isString().notEmpty()]),
  errorHandlerAsync(async (req, res) => {
    const target = path.resolve(req.query.file);
    try {
      await fs.access(target);
      // Imposta header automaticamente via express
      return res.download(target);
    } catch {
      return res.status(404).json({ success: false, message: 'File non trovato' });
    }
  })
);

/**
 * @route DELETE /file
 * @desc  Rimuove un file
 * @query {string} file - Path file da eliminare
 */
router.delete(
  '/file',
  validate([query('file').isString().notEmpty()]),
  errorHandlerAsync(async (req, res) => {
    const filePath = req.query.file;
    if (!(await gestioneFiles.checkFileExists(filePath))) {
      return res.status(404).json({ success: false, message: 'File non presente' });
    }
    await gestioneFiles.deleteFile(0, filePath, ADMIN_META, 0);
    res.status(204).end();
  })
);

/**
 * @route POST /verify
 * @desc  Copia un file per controllo e registra l'operazione
 * @body {string} filename     - Path file originale
 * @body {string} istruzione   - Cartella di destinazione del controllo
 * @body {number} utente       - ID utente che verifica
 */
router.post(
  '/verify',
  validate([
    body('filename').isString().notEmpty(),
    body('istruzione').isString().notEmpty(),
    body('utente').isInt()
  ]),
  errorHandlerAsync(async (req, res) => {
    const { filename, istruzione, utente } = req.body;
    const baseName = path.basename(filename);
    errorLog.logError('PDF', 0, `Controllo: ${istruzione}`, utente, 0);
    await gestioneFiles.copiaFile(0, filename, `${istruzione}/${baseName}`, utente, 0);
    res.status(200).json({ success: true });
  })
);

export default router;
