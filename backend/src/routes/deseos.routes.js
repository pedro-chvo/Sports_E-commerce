const express = require('express');
const router = express.Router();
const { getDeseos, agregarDeseo, eliminarDeseo } = require('../controllers/deseos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Obtener la lista de deseos del usuario autenticado
router.get('/', verificarToken, getDeseos);

// Agregar un producto a la lista de deseos
router.post('/', verificarToken, agregarDeseo);

// Eliminar un producto específico de la lista de deseos
router.delete('/:productoId', verificarToken, eliminarDeseo);

module.exports = router;
