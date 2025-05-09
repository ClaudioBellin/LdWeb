const express = require('express');
const aiRouters = express.Router();

/* const { errorHandler } = require('../middlewares/errorsMiddleware.js');

const mysql = require('../mysql/mysql');
const errorLog = require('../utils/errorLog');
const openAi = require('../ai/openAi.js'); */



aiRouters.get('/formato', (req, res) => {
    //let { query } = req.query;
    console.log("pipppofranco",query)
    // Verifica che la query non sia vuota
   /*  if (!query) {
        return res.status(400).json({ error: 'Query non fornita' });
    }

    // Escape sugli apostrofi per evitare errori SQL (NON protegge da SQL Injection!)
    const escapeSqlString = (value) => {
        return value.includes("''") ? value : value.replace(/'/g, "''");
    };

    // Escape della query per evitare errori sintattici (ma non per injection)
    query = escapeSqlString(query);

    const rows = await mysql.eseguiSql(query);
 */
    res.json("rows");
});



module.exports = aiRouters;
