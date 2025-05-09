const express = require('express');
const contattiRouters = express.Router(); 
const fs = require('fs');
const gmailContatti = require('../interfacce/gmailContatti.js');
const errorLog = require('../utils/errorLog');

//const { errorHandler } = require('../middlewares/errorsMiddleware.js')



contattiRouters.get('/lista', (req, res) => {
    fs.readFile('./impostazioni/credentials-contatti.json', (err, content) => {
        if (err) {
            errorLog.logError("Generale", 0, 'Errore durante la lettura del file delle credenziali:'+ err, 0, 0);
            res.status(500).send('Errore interno del server.');
            return;
        }
        gmailContatti.authorize(JSON.parse(content), (auth) => {
            gmailContatti.getAllContacts(auth, (err, contatti) => {
                if (err) {
                    res.status(500).send('Errore interno del server.');
                } else {
                    res.json(contatti);
                }
            });
        });
    });
});


contattiRouters.get('/nuovo', (req, res) => {
    const { persona } = req.query;
    fs.readFile('./impostazioni/credentials-contatti.json', (err, content) => {
        if (err) {
            errorLog.logError("Generale", 0, 'Errore durante la lettura del file delle credenziali:'+ err, 0, 0);
            res.status(500).send('Errore interno del server.');
            return;
        }
        gmailContatti.authorize(JSON.parse(content), (auth) => {
            gmailContatti.createContact(auth, JSON.parse(persona), (err, contatti) => {
                if (err) {
                    res.status(500).send('Errore interno del server.');
                } else {
                    res.json(contatti);
                }
            });
        });
    });
});


contattiRouters.get('/scaricaContatti', (req, res) => {
    fs.readFile('./impostazioni/credentials-contatti.json', (err, content) => {
        if (err) {
            errorLog.logError("Generale", 0, 'Errore durante la lettura del file delle credenziali:'+ err, 0, 0);
            res.status(500).send('Errore interno del server.');
            return;
        }
        gmailContatti.authorize(JSON.parse(content), (auth) => {
            gmailContatti.getAllContacts(auth, (err, contatti) => {
                if (err) {
                    res.status(500).send('Errore interno del server.');
                } else {
                    res.json(contatti);

                    
                }
            });
        });
    });
});

module.exports = contattiRouters; 

