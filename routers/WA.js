const express   = require('express');
const WARouters = express.Router(); 
const errorLog  = require('../utils/errorLog');
const WA        = require('../whatsApp/whatsApp');


WARouters.get('/connetti', (req, res) => {
    try {
        WA.connettiWA()
        res.json('Connesso con successo.');
    } catch (errore) {
        res.json('Si è verificato un errore la connessione a WhatsApp:', errore);
    }
});

WARouters.get('/disconnetti', (req, res) => {
  
    try {
        WA.disconnettiWA();
        res.json('Disconnesso con successo.');
    } catch (errore) {
        res.json('Si è verificato un errore durante la disconnessione a WhatsApp:', errore);
    }
});


WARouters.get('/lavoroPronto', (req, res) => {
    const { idUtente, idScheda } = req.query;
    try {
        WA.lavoroPronto(idUtente, idScheda);
        res.json('Messaggio Inviato');
    } catch (errore) {
        res.json('Si è verificato un errore durante l\'invio del WhatsApp:', errore);
    }
});

module.exports = WARouters; 
 