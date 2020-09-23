/**
 * PUERTO
 */
process.env.PORT = process.env.PORT || 3000;

/**
 * ENTORNO
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Base de Datos
 */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // Conexión local
    urlDB = 'mongodb://localhost:27017/cafeDB';
} else {
    // Conexión remota
    // urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;