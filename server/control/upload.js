const express = require('express');
const fileUpload = require('express-fileupload');
const { sample } = require('underscore');
const app = express();

const Usuario = require('../model/usuario');
const Producto = require('../model/producto');
const fs = require('fs');
const path = require('path');

// Todos los archivos que carguemos van a req.files
app.use(fileUpload());

// Carga tanto imagenes de productos como de usuarios
// Tipo usuario o producto
// id usuario
app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Si no hay archivos
    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                error: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    // Validar tipo
    let tipoValidos = ['productos', 'usuarios'];
    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                error: {
                    message: 'Los tipos permitidos son: ' + tipoValidos.join(', ')
                }
            });
    }

    // Si viene un archivo
    let archivoData = req.files.archivo;

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    let archivoFragmentado = archivoData.name.split('.');
    let extension = archivoFragmentado[1];

    // Si no lo encuentra
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'La extensión no es válida. Las extensiones válidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiamos el nombre del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivoData.mv(`uploads/${tipo}/${nombreArchivo}`, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        // Imagen cargada en este punto
        // Actualizamos la imagen del usuario o de producto
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });
});

/**
 * Actualiza la imagen de un usuario
 */
function imagenUsuario(id, res, nombreArchivo) {

    // Primero buscamos el usuario para comprobar que existe previamente
    Usuario.findById(id, (error, usuarioDB) => {
        if (error) {
            // Si hay un error, debemos borrar la imagen
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!usuarioDB) {
            // Si hay un error, debemos borrar la imagen
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El usuario no existe'
                }
            });
        }

        // Si la imagen ya existía, borramos la versión anterior
        borraArchivo(usuarioDB.img, 'usuarios');

        // Si existe el usuario, actualizamo la imagen
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((error, usuarioGuardado) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}

/**
 * Actualiza la imagen de un producto
 */
function imagenProducto(id, res, nombreArchivo) {

    // Primero buscamos el producto para comprobar que existe previamente
    Producto.findById(id, (error, productoDB) => {
        if (error) {
            // Si hay un error, debemos borrar la imagen
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!productoDB) {
            // Si hay un error, debemos borrar la imagen
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            });
        }

        // Si la imagen ya existía, borramos la versión anterior
        borraArchivo(productoDB.img, 'productos');

        // Si existe el producto, actualizamo la imagen
        productoDB.img = nombreArchivo;
        productoDB.save((error, productoGuardado) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

/**
 * Borra un archivo
 */
function borraArchivo(nombreArchivo, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(pathImagen)) {
        // Si existe, lo borramos
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;