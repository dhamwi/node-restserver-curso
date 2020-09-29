const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../model/usuario');
const { json } = require('body-parser');

const app = express();

app.post('/login', (req, res) => {

    // Obtenemos del body el email y el password
    let body = req.body;
    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
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

// Configuraciones de Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                error: error
            });
        });

    // Guardamos en la BBDD
    // Primero comprobamos que no exista el usuario
    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        // Si no existe, creamos el usuario
        if (usuarioDB) { // Existe el usuario en BBDD
            if (usuarioDB.google === false) { // Comprobamos si NO se ha autenticado por Google
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else { // Si se ha autenticado con google, renovamos su token
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: parseInt(process.env.CADUCIDAD_TOKEN) }); // Para que expire en 30 días

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { // Si el usuario no existe, insertamos en usuario de Google en BBDD
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; // Para no insertar el password de google, además que no lo podemos obtener

            usuario.save((error, usuarioDB) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: parseInt(process.env.CADUCIDAD_TOKEN) }); // Para que expire en 30 días

                return json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;