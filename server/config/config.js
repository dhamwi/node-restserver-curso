/**
 * PUERTO
 */
process.env.PORT = process.env.PORT || 3000;

/**
 * ENTORNO
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/**
 * Fecha de vencimiento del token
 */
// 60 segundos * 60 mins * 24h * 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

/**
 * Seed de autenticación
 */
process.env.SEED = process.env.SEED || 'secret-seed-desarrollo';

/**
 * Base de Datos
 */
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    // Conexión local
    urlDB = 'mongodb://localhost:27017/cafeDB';
} else {
    // Conexión remota
    urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;

/**
 * Google Client ID
 */
process.env.CLIENT_ID = process.env.CLIENT_ID || '97733416665-en6bg4s9uum3s22tin6rgvugrrers2kp.apps.googleusercontent.com';