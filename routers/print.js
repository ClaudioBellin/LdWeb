const express = require('express');
const prints = express.Router()
const pdfToPrinter  = require('pdf-to-printer');

const printSchedaLavoro = require('../impostazioni/stampe/printScheda.js');
const printEtichetta = require('../impostazioni/stampe/printEtichetta.js');

prints.get('/stampanti', async (req, res) => {
    try {
        const printers = await pdfToPrinter.getPrinters();
        res.json(printers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'ottenere la lista delle stampanti.');
    }
});

prints.get('/stampanteDefault', async (req, res) => {
    try {
        const printers = await pdfToPrinter.getDefaultPrinter();
        res.json(printers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'ottenere la lista delle stampanti.'); 
    }
});

prints.get('/', async (req, res) => {
    const { tabella, id } = req.query;
    try {
        const myPdfDoc = await printSchedaLavoro(tabella,id);
        res.json("stampato");
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nell\'ottenere la lista delle stampanti.');
    }
});

prints.get('/stampaEtichetta', async (req, res) => {
    const { tabella, id, numeroEtichette,quantitaPerPacco, logoAttivo } = req.query;
    try {
        const myPdfDoc = await printEtichetta.printEtichetta(id, numeroEtichette, quantitaPerPacco, logoAttivo);
        res.json("stampato");
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore stampa etichhetta.');
    }
});

module.exports = prints;

