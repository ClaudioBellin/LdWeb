const express = require('express');
const log=express.Router();
const gestisciLog = require('../interfacce/gestisciLog.js');


// Serve il file JSON
log.get('/', (req, res) => {
  gestisciLog.importaTutto();
  res.send("ok"); // Invia il contenuto del file JSON come stringa

}); 

module.exports =log;