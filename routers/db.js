const express = require('express');
const sqlRouter = express.Router();

const { errorHandler } = require('../middlewares/errorsMiddleware.js');

const mysql = require('../mysql/mysql');
const errorLog = require('../utils/errorLog');
const creaSchedaLavoro = require('../ai/creaSchedaLavoro.js');

const { ids } = require('googleapis/build/src/apis/ids/index.js');

sqlRouter.get('/lista', errorHandler(async (req, res) => {
    // Estrai il nome della tabella.
    const { tabella } = req.query;

    // Prepara la query base.
    let query = `SELECT * FROM ${tabella}`;

    // Estrai tutti i parametri di query eccetto 'tabella'.
    const queryParams = {...req.query};
    delete queryParams.tabella;

    // Controlla se ci sono altri parametri di query e costruisci la parte WHERE della query.
    const otherParams = Object.keys(queryParams);
    if (otherParams.length > 0) {
        // Aggiungi condizioni WHERE alla query basate sui parametri.
        const whereConditions = otherParams.map(key => `${key} = '${queryParams[key]}'`).join(' AND ');
        query += ` WHERE ${whereConditions}`;
    }
    // Esegui la query senza binding dei parametri.
    const rows = await mysql.eseguiSql(query);
    res.json(rows);
}));

//verificata e funzionante
sqlRouter.get('/listaOggetti', errorHandler(async (req, res) => {
    const { tabella, ...queryParams } = req.query;

    // Verifica la presenza della colonna 'Sequenza'
    let query = `SHOW COLUMNS FROM ${tabella} LIKE 'Sequenza'`;
    const sequenzaExists = await mysql.eseguiSql(query);

    // Costruzione della query principale
    query = `SELECT id, Nome`;
    query += sequenzaExists.length > 0 ? `, Sequenza` : '';
    query += ` FROM ${tabella}`;

    // Costruzione della clausola WHERE
    const whereConditions = [];
        for (const [key, value] of Object.entries(queryParams)) {
            whereConditions.push(`${key} = '${value}'`);
        }
    query += whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

    // Aggiunge l'ordinamento
    query += sequenzaExists.length > 0 ? ` ORDER BY Sequenza` : ` ORDER BY Nome`;

    // Esegue la query
    const rows = await mysql.eseguiSql(query);
    res.json(rows);
}));



sqlRouter.get('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id } = req.query;
    const rows = await mysql.eseguiSql(`SELECT * FROM ${tabella} WHERE id = ${id}`);
    res.json(rows);
}));

sqlRouter.delete('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id } = req.query;
    const rows = await mysql.eseguiSql(`DELETE FROM ${tabella} WHERE id = ${id}`);
    res.json(rows);
}));

  
sqlRouter.put('/oggetto', errorHandler(async (req, res) => {
    const { tabella, id, data } = req.body;
    
    // Validazione rafforzata
    if (!tabella || !id || !data || isNaN(Number(id))) {
        return res.status(400).json({ error: 'Dati mancanti o non validi' });
    }

    // Funzioni di conversione migliorate
    const parseDate = (value) => {
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})( \d{2}:\d{2}:\d{2})?$/;
        if (!datePattern.test(value)) return null;
        
        const [_, day, month, year, time] = datePattern.exec(value);
        return time 
            ? `${year}-${month}-${day}${time}`
            : `${year}-${month}-${day}`;
    };

    // Preparazione parametri
    const setClauses = [];
    const params = [];
    
    for (const [key, value] of Object.entries(data)) {
        let processedValue = value;
        
        // Conversione dati temporali
        if ((key.startsWith('Data') || key.startsWith('Ora_')) && typeof value === 'string') {
            processedValue = parseDate(value) || value;
        }
        
        // Gestione valori vuoti
        if (processedValue === '') {
            setClauses.push(`${key} = NULL`);
        } else {
            setClauses.push(`${key} = ?`);
            params.push(processedValue);
        }
    }

    if (setClauses.length === 0) {
        return res.status(400).json({ error: 'Nessun dato da aggiornare' });
    }

    try {
        const sql = `UPDATE ${tabella} SET ${setClauses.join(', ')} WHERE id = ?`;
        await mysql.eseguiSql(sql, [...params, id]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Errore database:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
}));




sqlRouter.get('/nuovo', errorHandler(async (req, res) => {
    const { tabella } = req.query;
    const result = await mysql.eseguiSql(`INSERT INTO ${tabella} VALUES ()`);
    const nuovo = await mysql.eseguiSql(`SELECT * FROM ${tabella} WHERE id = ${result.insertId}`);
    res.json(nuovo);
}));


// Assicurati di avere questa riga da qualche parte nel tuo setup di Express


sqlRouter.get('/inserisci', errorHandler(async (req, res) => {
    const { tabella, id__Prodotto, id__FasiLavorazione, Nome, Sequenza } = req.query;

    // Validazione input per evitare query errate
    if (!tabella || !id__Prodotto || !id__FasiLavorazione || !Nome || !Sequenza) {
        return res.status(400).json({ error: 'Dati mancanti o non validi' });
    }

    // Funzione per evitare errori sugli apostrofi
    const escapeSqlString = (value) => {
        return value.replace(/'/g, "''");
    };

    // Estrarre il nome della colonna da 'tabella' (presumo sia strutturata come 'prefix_nomeTabella')
    var parti = tabella.split("_");
    var risultato = parti[1];

    // Escape dei valori
    const nomeEscaped = escapeSqlString(Nome);
    const sequenzaEscaped = escapeSqlString(Sequenza);

    // Query SQL sicura dagli errori sugli apostrofi
    let query = `INSERT INTO ${tabella} (Nome, id__${risultato}, id__FasiLavorazione, Sequenza) 
                 VALUES ('${nomeEscaped}', '${id__Prodotto}', '${id__FasiLavorazione}', '${sequenzaEscaped}')`;

    const rows = await mysql.eseguiSql(query);
    res.json(rows);
}));


sqlRouter.get('/inserisciManuale', errorHandler(async (req, res) => {
    let { query } = req.query;
    // Verifica che la query non sia vuota
    if (!query) {
        return res.status(400).json({ error: 'Query non fornita' });
    }

    // Escape sugli apostrofi per evitare errori SQL (NON protegge da SQL Injection!)
    const escapeSqlString = (value) => {
        return value.includes("''") ? value : value.replace(/'/g, "''");
    };

    // Escape della query per evitare errori sintattici (ma non per injection)
    query = escapeSqlString(query);

    const rows = await mysql.eseguiSql(query);
    res.json(rows);
}));



sqlRouter.get('/caratteristiche', errorHandler(async (req, res) => {
    const { tabella } = req.query;
    const rows = await mysql.eseguiSql(`SHOW FULL COLUMNS FROM ${tabella}`);
    res.json(rows);
}));


sqlRouter.get('/login', errorHandler(async (req, res) => {
    const { username, password } = req.query;
    const rows = await mysql.eseguiSql(`SELECT * FROM Utente WHERE Username = '${username}' AND Password = '${password}' `);
    res.json(rows);
}));


sqlRouter.get('/aggiornaFasi', errorHandler(async (req, res) => {
    const { idScheda, idProdotto } = req.query;
    creaSchedaLavoro.inserisciFasiLavorazione(idProdotto, idScheda)
    res.json("Eseguito");
}));

module.exports = sqlRouter;
