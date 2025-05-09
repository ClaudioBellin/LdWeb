const express = require('express');
const varieRouters = express.Router(); // Router principale
const fs = require('fs');
const generaBarCode= require('../utils/generaBarCode.js');
const interrogaAi= require('../interfacce/interrogaAiClient.js');

const { errorHandler } = require('../middlewares/errorsMiddleware.js')

const utils = require('../utils/utils.js');

varieRouters.get('/menuPrincipale', errorHandler(async (req, res) => {
    const idLivello = parseInt(req.query.idLivello, 10); // Converte il livello di accesso dell'utente in numero
    let menu = await utils.sendJsonData(res, './impostazioni/menuPrincipale.json');
        // Funzione ricorsiva per filtrare il menu
        const filterMenu = (items, livello) => {
            return items
                .filter(item => item.livello >= livello) // Filtra le voci basate sul livello di accesso
                .map(item => ({
                    ...item,
                    children: item.children ? filterMenu(item.children, livello) : undefined
                }))
                .filter(item => item.children === undefined || item.children.length > 0); // Rimuove nodi senza figli validi
        };

    const filteredMenu = filterMenu(menu, idLivello);
    res.json(filteredMenu); // Manda il menu filtrato al client
}));







// Restituisci al frontend il menu in basso
varieRouters.get('/menuButton', async (req, res) => {
    res.json(await utils.sendJsonData(res, './impostazioni/menuButton.json'));
});

// Restituisci al frontend dei menu contestuali
varieRouters.get('/menuContestuale', async (req, res) => {
    res.json(await utils.sendJsonData(res, './impostazioni/menuContestuale.json'));
});


varieRouters.get('/associazioneOrdineLavoro', async (req, res) => {
    res.json(await utils.sendJsonData(res, './impostazioni/associazioneOrdineLavoro.json'));
});

// Ricarica il server
varieRouters.get('/reloadServer', async (req, res) => {
    await utils.reloadServer(req, res);
});


varieRouters.get('/salvaMenu', errorHandler(async (req, res) => {
    const { nomeMenu, Json } = req.query;
        try {
            // Sovrascrivi il file con i nuovi dati
            fs.writeFileSync( `./impostazioni/${nomeMenu}.json`, Json, 'utf-8');
            res.json('File sovrascritto con successo.');
        } catch (errore) {
            res.json('Si è verificato un errore durante la scrittura del file:', errore);
        }
}));


varieRouters.get('/generaBarCode', errorHandler(async (req, res) => {
    const { id } = req.query;
    try {
        await generaBarCode.generaBarCode(id);
        res.json("Datamatrix generato");
    } catch (errore) {
        res.json("Errore generazione Datamatrix");
    }
}));

varieRouters.get('/interrogaAi', errorHandler(async (req, res) => {
 
        interrogaAi.interrogaAiClient()
        
}));

module.exports = varieRouters; // Esporta solo il router principale
