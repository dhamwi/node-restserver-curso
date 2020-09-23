require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('./control/usuario'));

// parse application/json
app.use(bodyParser.json());

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (error, respons) => {
        if (error) throw error;
        console.log('Base de datos CONECTADA');
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});