const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../model/producto');

/**
 * Buscar productos
 */
app.get('/producto/buscar/:filtro', verificarToken, (req, res) => {

    let filtro = req.params.filtro;
    let regex = new RegExp(filtro, 'i'); // Expresión regular. 'i' para que sea sensible a minúsculas y mayúsculas

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Obtiene todos los productos
 */
app.get('/producto', verificarToken, (req, res) => {
    // Trae todos los productos
    // populate: usuario y categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(10)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Obtiene un producto por ID
 */
app.get('/producto/:id', verificarToken, (req, res) => {
    // populate: usuario y categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((error, productoDB) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'No existe el producto buscado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

/**
 * Crea un nuevo producto
 */
app.post('/producto', verificarToken, (req, res) => {
    // guarda el usuario
    // guarda la categoria del listado
    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});

/**
 * Actualiza un producto
 */
app.put('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'No existe el ID del producto'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((error, productoGuardar) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
    });
});

/**
 * Elimina un producto de forma lógica
 */
app.delete('/producto/:id', verificarToken, (req, res) => {
    // Disponible = false
    let id = req.params.id;

    Producto.findById(id, (error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'No existe el ID del producto'
                }
            });
        }

        productoDB.disponible = false;
        productoDB.save((error, productoBorrrado) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }

            res.json({
                ok: true,
                producto: productoBorrrado,
                message: 'Producto borrado'
            });
        });
    });
});

module.exports = app;