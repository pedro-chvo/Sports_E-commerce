const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/usuario.controller');

// Registro de nuevo usuario (público)
router.post('/register', register);

// Inicio de sesión — retorna JWT y datos del usuario (público)
router.post('/login', login);

module.exports = router;
