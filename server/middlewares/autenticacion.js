const jwt = require('jsonwebtoken');

/**
 * Verificar token
 */
let verificarToken = (req, res, next) => {

    // Leemos el token del header
    let token = req.get('token'); // De esta forma se obtienen los headers

    // Comprobamos que el token sea válido
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                error: {
                    message: 'Token no válido'
                }
            });
        }

        // decoded es el payload
        req.usuario = decoded.usuario;

        // next continúa con la ejecución del programa
        next();
    });
};

/**
 * Verificar AdminRole
 */
let verificarAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        // next continúa con la ejecución del programa
        next();
    } else {
        return res.json({
            ok: false,
            error: {
                message: 'El usuario no tiene permisos de administrador'
            }
        });
    }
};


module.exports = {
    verificarToken,
    verificarAdminRole
}