const express = require('express');
const router = express.Router();
const {
    getUsuarios, eliminarUsuario, cambiarRol,
    actualizarPerfil, cambiarPassword
} = require('../controllers/usuario.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Admin: gestión de usuarios
router.get('/', verificarToken, soloAdmin, getUsuarios);
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);
router.put('/:id/rol', verificarToken, soloAdmin, cambiarRol);

// Usuario autenticado: perfil
router.put('/perfil/datos', verificarToken, actualizarPerfil);
router.put('/perfil/password', verificarToken, cambiarPassword);

module.exports = router;
