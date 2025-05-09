/**
 * Configurazione applicativa centralizzata
 * Utilizza variabili d'ambiente con fallback a percorsi di default.
 * Strutturata in categorie per chiarezza e manutenzione.
 */
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Percorsi base (directory condivise, cartelle temporanee, network share)
 */
const paths = {
  tempDir: process.env.PATH_TEMP || 'D:/LDAutomate/fileTemp',
  schedeLavoro: process.env.PATH_SCHEDA_LAVORO || '//dataserver/gestione_pdf/SchedeLavoro',
  dati: process.env.PATH_DATI || '//dataserver/dati',
  pdf: process.env.PATH_PDF || '//dataserver/gestione_pdf/pdf',
  istruzioniTemp: process.env.PATH_ISTR_TEMP || 'D:/LDAutomate/Output',
  montato: process.env.PATH_MONTATO || '//dataserver/gestione_pdf/montato',
  pdfErrore: process.env.PATH_PDF_ERRORE || 'D:/LDAutomate/Controllo-Errore',
  pdfRapporto: process.env.PATH_PDF_RAPPORTO || 'D:/LDAutomate/Controllo-Rapporto',
  pdfAvvertenza: process.env.PATH_PDF_AVVERTENZA || 'D:/LDAutomate/Controllo-Avvertenza',
  virgoData: process.env.PATH_VIRGO_DATA || 'D:/LDAutomate/virgo/Data/SavedSettings.xml',
  virgoLastJob: process.env.PATH_VIRGO_LAST_JOB || 'D:/LDAutomate/virgo/Data/LastJobName.txt',
  virgoPdfTaglio: process.env.PATH_VIRGO_PDF_TAGLIO || '//dataserver/Gestione_PDF/TaglioOki',
  importDati: process.env.PATH_IMPORT || 'D:/LDAutomate/importa_dati',
  cartellaErrori: process.env.PATH_CART_ERR || 'D:/LDAutomate/Errore',
};

/**
 * Configurazione hot-folders e relative funzioni di gestione
 */
const tree = {
  Controllo: { path: process.env.PATH_TREE_CONTROLL0 || 'D:/LDAutomate/ControlloFiles', handler: 'functionControllo' },
  Twin:      { path: process.env.PATH_TREE_TWIN    || '//twin/hotTwin/input',       handler: 'functionTwin' },
  Ottimizza:{ path: process.env.PATH_TREE_OTTIM    || 'D:/LDAutomate/input',        handler: 'functionOttimizza' },
  Montaggio:{ path: process.env.PATH_TREE_MONT     || '//dataserver/gestione_pdf/quite', handler: 'functionMontaggio' },
  Mimaki:   { path: process.env.PATH_TREE_MIMAKI   || '//mimaki-server/Hot',          handler: 'functionMimaki' },
  Develop:  { path: process.env.PATH_TREE_DEVEL    || '//print-server/hotDevelop',    handler: 'functionDevelop' },
  Komori:   { path: process.env.PATH_TREE_KOMORI   || '//studiorip/HotFolder',        handler: 'functionKomori' },
};

/**
 * Estensioni di file da escludere nelle operazioni di scansione
 */
const exclusions = ['.ini', '.mmconf', '.lnk', '.db'];

/**
 * Parametri per invio email automatiche
 */
const email = {
  ordineInterno: process.env.EMAIL_ORD_INT || 'cc:shop@litodelta.com',
  ordineWeb:      process.env.EMAIL_ORD_WEB || 'to:shop@litodelta.com subject:"Nuovo ordine | Shop Litodelta |*"',
  ordineMail:     process.env.EMAIL_ORD_MAIL|| 'from:claudio@litodelta.com subject:"Ordine LDWEB*"',
};

/**
 * Messaggi di notifica utente
 */
const messages = {
  lavoroPronto: process.env.MSG_LAVORO_PRONTO || 'è pronto per essere ritirato',
};

/**
 * Percorso all'eseguibile Quite
 */
const commands = {
  applicazioneQuite: process.env.CMD_QUITE || 'C:\\progra~2\\Quite\\quiteh~1\\qi_applycommands.exe',
};

export default {
  paths,
  tree,
  exclusions,
  email,
  messages,
  commands,
};
