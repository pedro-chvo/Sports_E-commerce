const express = require('express');
const router = express.Router();
const {
    crearUsuario, getUsuarios, eliminarUsuario, cambiarRol,
    actualizarPerfil, cambiarPassword
} = require('../controllers/usuario.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// ── Admin: gestión de usuarios ────────────────────────────────────────────────

// Crear usuario desde el panel de admin (puede asignar rol)
router.post('/', verificarToken, soloAdmin, crearUsuario);

// Listar todos los usuarios
router.get('/', verificarToken, soloAdmin, getUsuarios);

// Eliminar usuario por ID
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);

// Cambiar el rol de un usuario (usuario ↔ admin)
router.put('/:id/rol', verificarToken, soloAdmin, cambiarRol);

// ── Usuario autenticado: perfil ───────────────────────────────────────────────

// Actualizar nombre o email del perfil propio
router.put('/perfil/datos', verificarToken, actualizarPerfil);

// Cambiar contraseña del perfil propio
router.put('/perfil/password', verificarToken, cambiarPassword);

module.exports = router;
