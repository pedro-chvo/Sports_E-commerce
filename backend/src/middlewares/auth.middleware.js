const jwt = require('jsonwebtoken');

// Verifica que la petición incluya un JWT válido en el header Authorization.
// Si el token es correcto, adjunta el payload decodificado en req.usuario y llama a next().
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

    if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).json({ mensaje: 'Token inválido' });
        req.usuario = payload;
        next();
    });
};

// Middleware de autorización: permite continuar solo si el usuario autenticado tiene rol 'admin'.
// Debe usarse después de verificarToken, ya que depende de req.usuario.
const soloAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
    }
    next();
};

module.exports = { verificarToken, soloAdmin };
