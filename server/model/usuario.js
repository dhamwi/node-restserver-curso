const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Obtenemos el esquema
let Schema = mongoose.Schema;

let rolesValidosEnum = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

// Declaramos el esquema
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es obligatorio']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidosEnum
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Modificamos el método toJSON
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    // Para que al mostrarse el usuario no se vea la contraseña
    delete userObject.password;

    return userObject;
};

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único' // El mensaje de error lo inyecta Mongo en el PATH
});

// Exportamos el archivo
module.exports = mongoose.model('Usuario', usuarioSchema);