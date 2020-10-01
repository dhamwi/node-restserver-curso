const express = require('express');

const { verificarToken, verificarAdminRole } = require('../middlewares/autenticacion');
const categoria = require('../model/categoria');
let app = express();

let Categoria = require('../model/categoria');


// Creamos 5 servicios
/**
 * Muestra todas las categorías
 */
app.get('/categoria', verificarToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') // Revisa qué IDs u objectos ID existen en la categoría y nos permite cargar información
        // En este caso nos cargaría el usuario con toda su información
        .exec((error, categorias) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }

            Categoria.count((error, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });
        });
});

/**
 * Muestra una categoría por ID
 */
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (error, categoriaDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                error: {
                    message: 'No existe la categoría buscada.'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * Crea una nueva categoría 
 */
app.post('/categoria', verificarToken, (req, res) => {
    // Regresa la nueva categoría
    // Al crear la nueva categoría, tenemos el ID en el token
    // req.usuario._id

    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((error, categoriaDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        // Si llegamos a este punto, es que la categoría se creó con éxito,
        // así que lo mostramos enviándolo
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

/**
 * Actualiza la categoría. Solo la descripción de la categoría
 */
app.put('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (error, categoriaDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * Elimina una categoría por ID
 */
app.delete('/categoria/:id', [verificarToken, verificarAdminRole], (req, res) => {
    // Solo puede eliminar categorias un administrador
    let id = req.params.id;
    Categoria.findOneAndRemove(id, (error, categoriaDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El id no existe en BBDD'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoría borrada con éxito'
        });
    });
});

module.exports = app;