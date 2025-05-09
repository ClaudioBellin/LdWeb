const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const json=express.Router();
const path = require('path');  // Importa il modulo path


// Serve il file JSON
json.get('/', (req, res) => {
    // Ottieni il parametro 'file' dalla query string
    const file = req.query.file;
    if (!file) {
        return res.status(400).send('Parametro "file" mancante.');
    }
    // Costruisci il percorso completo al file JSON
    const filePath = path.join("./impostazioni/"+file+".json");
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Errore durante la lettura del file JSON.');
        }
        res.send(data); // Invia il contenuto del file JSON come stringa
    });
}); 

   
  // Riceve il file JSON modificato e lo salva
  json.post('/', (req, res) => {
        // Ottieni il parametro 'file' dalla query string
    const file = req.query.file;
    const filePath = path.join("./impostazioni/"+file+".json");
    const jsonData = req.body;  // Il contenuto JSON inviato dal client
    // Salva il file JSON modificato

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Errore durante il salvataggio del file JSON.');
      }
      res.send('File JSON salvato correttamente.');
    });
  });



module.exports =json;