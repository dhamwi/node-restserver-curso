const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../model/usuario');
const usuario = require('../model/usuario');

const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificarToken, (req, res) => {

    let desde = req.query.desde || 0; // Para seleccionar la página que queremos
    desde = Number(desde); // Para transformar el String en un número

    let limite = req.query.limite || 5; // Para que obtenga el número de registros que queramos
    limite = Number(limite);

    let estadoFiltro = {
        estado: true
    };

    Usuario.find(estadoFiltro, 'nombre email role estado google img') // Para obtener los campos que queramos
        .skip(desde) // Para que salte de x en x en la paginación
        .limit(limite) // Para que obtenga los primeros registros que indicamos
        .exec((error, usuarios) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }

            Usuario.count(estadoFiltro, (error, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
});

app.post('/usuario', [verificarToken, verificarAdminRole], function(req, res) {

    let body = req.body;

    // Obtenemos el objeto Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Grabamos en BBDD
    usuario.save((error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

// Para recibir un parámetro se pone :etc
// Para actualizar un registro
app.put('/usuario/:id', [verificarToken, verificarAdminRole], function(req, res) {
    let id = req.params.id;
    // En el método pick ponemos las propiedades que queremos que sean válidas
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

// Borrado lógico
app.delete('/usuario/:id', [verificarToken, verificarAdminRole], function(req, res) {
    let id = req.params.id;

    let nuevoEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, nuevoEstado, { new: true }, (error, usuarioBorrado) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        // Si se borra
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

// Borrado físico
// app.delete('/usuario/:id', function(req, res) {
//     let id = req.params.id;
//     Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
//         if (error) {
//             return res.status(400).json({
//                 ok: false,
//                 error
//             });
//         }

//         if (!usuarioBorrado) {
//             return res.status(400).json({
//                 ok: false,
//                 error: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }

//         // Si se borra
//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     });
// });

module.exports = app;