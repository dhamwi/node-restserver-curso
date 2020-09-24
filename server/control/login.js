const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuario = require('../model/usuario');

const app = express();

module.exports = app;

app.post('/login', (req, res) => {

    // Obtenemos del body el email y el password
    let body = req.body;
    usuario.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: 'ERROR NO SE QUE PASA'
                }
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'USUARIO o contraseña incorrectos'
                }
            });
        }

        // Comparamos la contraseña insertada encriptándola con la guardada que ya está encriptada
        // para comprobar si son iguales o no
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o CONTRASEÑA incorrectos'
                }
            });
        }

        // Generamos el token
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: parseInt(process.env.CADUCIDAD_TOKEN) }); // Para que expire en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });
    });
});