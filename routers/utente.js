const express = require('express');
const utenteRouter = express.Router();

const mysql = require('../mysql/mysql.js');
const { errorHandler } = require('../middlewares/errorsMiddleware.js');
 
utenteRouter.get('/stato', errorHandler(async (req, res) => {
    // Estrai l'ID dell'utente dalla query string
    let { utente } = req.query;
    utente = JSON.parse(utente);
    // Controlla se l'utente è stato passato nella query
    if (!utente) {
        return res.status(400).json({ error: "Parametro 'utente' mancante" });
    }

    // Esegui la query per verificare la presenza in azienda
    const rows = await mysql.eseguiSql(`SELECT * FROM Presenze WHERE id_Dipendente=${utente.idUtente} AND OraUscita IS NULL`);

    // Costruisci l'oggetto di risposta basato sulla presenza o assenza di record
    if (rows.length > 0) {
        // Se esiste un record, popola i dati utente e imposta `presente` a 1
        utente = {
            ...utente,
            Data: rows[0].Data,
            OraIngresso: rows[0].OraIngresso,
            OraUscita: rows[0].OraUscita,
            Presente: 1
        };
    } else {
        // Se non ci sono record, imposta i campi a `null` e `presente` a 0
        utente = {
            ...utente,
            Data: null,
            OraIngresso: null,
            OraUscita: null,
            Presente: 0
        };
    } 
    // Rispondi con l'oggetto utente aggiornato
    res.json(utente);
}));


module.exports = utenteRouter;

