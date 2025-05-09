const express = require('express');
const esecuzioneRouters = express.Router(); // Router principale

const { errorHandler } = require('../middlewares/errorsMiddleware.js')

const esegui = require('../utils/esegui.js');
const virgo  = require('../utils/virgo.js');

esecuzioneRouters.get('/', async (req, res) => {
    const { id, Ordine, Json, FileStampa, utente } = req.query;
    Json.replace(/\~/g, '+');
    FileStampa.replace(/\~/g, '+');
    try {
        // Attendi il completamento di eseguiOperazioni prima di proseguire
        await esegui.eseguiOperazioni(id, Ordine, Json, FileStampa, utente);
        res.json("Eseguito"); // Questa linea viene eseguita solo dopo il completamento di eseguiOperazioni
    } catch (error) {
        console.error("Errore in eseguiOperazioni:", error);
        throw error; // Rilancia l'errore per gestirlo ulteriormente se necessario
    }
       
});

esecuzioneRouters.get('/aggiornaVirgo', async (req, res) => {
    //const { id, Ordine, Json, FileStampa, utente } = req.query;
    const { FileStampa } = req.query;
    try {
        // Attendi il completamento di eseguiOperazioni prima di proseguire
        //await virgo.virgoUltimoLavoro(id, Ordine, Json, FileStampa, utente);
        await virgo.virgoUltimoLavoro(FileStampa);
        res.json("Eseguito"); // Questa linea viene eseguita solo dopo il completamento di eseguiOperazioni
    } catch (error) {
        console.error("Errore in eseguiOperazioni:", error);
        throw error; // Rilancia l'errore per gestirlo ulteriormente se necessario
    }
       
});

module.exports = esecuzioneRouters; // Esporta solo il router principale
