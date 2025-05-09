const express = require('express');
const tabelleRouter = express.Router();

const { errorHandler } = require('../middlewares/errorsMiddleware.js');

const mysql = require('../mysql/mysql.js');



tabelleRouter.get('/lista', errorHandler(async (req, res) => {
    // Prepara la query base.
    let query = 'SHOW TABLES';
    const tables = await mysql.eseguiSql(query);
    let tablesDetails = []; // Array per raccogliere i dettagli di tutte le tabelle
    let i=0;
        for (const table of tables) {
            const tableName = table[`Tables_in_ldweb`]; // Sostituire yourDatabaseName con il nome effettivo del tuo database
            try {
                const columns = await mysql.eseguiSql(`SHOW COLUMNS FROM ${tableName}`);
                // Crea un oggetto per rappresentare i dettagli della tabella, includendo il nome e le colonne
                let tableDetails = {
                    id:i,
                    Nome: tableName,
                    Colonne: columns
                };
                i=i+1;
                tablesDetails.push(tableDetails); // Aggiungi l'oggetto all'array
            } catch (err) {
                console.error(`Errore nella query SHOW COLUMNS per la tabella ${tableName}: ` + err.message);
                // Potresti voler gestire l'errore in modo più specifico qui
            }
        }

    res.json(tablesDetails); // Restituisce l'array con i dettagli di tutte le tabelle
}));




tabelleRouter.get('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id } = req.query;
    const rows = await mysql.eseguiSql(`SELECT * FROM ${tabella} WHERE id = ${id}`);
    res.json(rows);
}));

tabelleRouter.delete('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id } = req.query;
    const rows = await mysql.eseguiSql(`DELETE FROM ${tabella} WHERE id = ${id}`);
    res.json(rows);
}));

  
tabelleRouter.put('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id, data } = req.body;
    // Validazione dei dati ricevuti
    if (!tabella || !id || !data) {
        return res.status(400).json({ error: 'Dati mancanti o non validi' });
    } 

    // Costruzione della query SQL per l'aggiornamento
    const setClause = Object.keys(data).map(key => `${key} = '${data[key]}'`).join(', ');
    const sql = `UPDATE ${tabella} SET ${setClause} WHERE id = ${id}`;
    // Esecuzione della query
    await mysql.eseguiSql(sql);

    res.json({ success: true });
}));


tabelleRouter.get('/nuovo', errorHandler(async (req, res) => {
    const { tabella } = req.query;
    const result = await mysql.eseguiSql(`INSERT INTO ${tabella} VALUES ()`);
    const nuovo = await mysql.eseguiSql(`SELECT * FROM ${tabella} WHERE id = ${result.insertId}`);
    res.json(nuovo);
}));


// Assicurati di avere questa riga da qualche parte nel tuo setup di Express


tabelleRouter.get('/inserisci', errorHandler(async (req, res) => {
    const { tabella, id__Prodotto,id__FasiLavorazione, nome, sequenza } = req.query;
    var parti = tabella.split("_");
    var risultato = parti[1];
    let query=`INSERT INTO ${tabella} (Nome, id__${risultato},id__FasiLavorazione,  Sequenza) VALUES ('${nome}', '${id__Prodotto}','${id__FasiLavorazione}','${sequenza}')`;
    const rows = await mysql.eseguiSql(query);
    res.json(rows);
}));



tabelleRouter.get('/caratteristiche', errorHandler(async (req, res) => {
    const { tabella } = req.query;
    const rows = await mysql.eseguiSql(`SHOW FULL COLUMNS FROM ${tabella}`);
    res.json(rows);
}));

module.exports = tabelleRouter;
