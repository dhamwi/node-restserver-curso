const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Usuario = require('../model/usuario');

// Obtenemos el esquema
let Schema = mongoose.Schema;


// Declaramos el esquema
let catergoriaSchema = new Schema({

    descripcion: {
        type: String
    },
    usuario: {
        type: String,
        ref: Usuario
    }
});

// Modificamos el método toJSON
catergoriaSchema.methods.toJSON = function() {
    let categoria = this;
    let categoriarObject = categoria.toObject();

    return categoriarObject;
};

catergoriaSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único' // El mensaje de error lo inyecta Mongo en el PATH
});

// Exportamos el archivo
module.exports = mongoose.model('Categoria', catergoriaSchema);