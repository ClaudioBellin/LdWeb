const express = require('express');
const error=express.Router();

const { errorHandler } = require('../middlewares/errorsMiddleware.js');

const errorLog = require('../utils/errorLog');

error.get('/', errorHandler(async (req, res) => {
    res.json(errorLog.getErrors());
}));

// Endpoint per cancellare gli errori
error.delete('/', errorHandler(async (req, res) => {
    errorLog.clearErrors();
    res.status(204).send();
}));

module.exports =error;

