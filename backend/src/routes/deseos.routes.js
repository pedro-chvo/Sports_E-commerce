const express = require('express');
const router = express.Router();
const { getDeseos, agregarDeseo, eliminarDeseo } = require('../controllers/deseos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, getDeseos);
router.post('/', verificarToken, agregarDeseo);
router.delete('/:productoId', verificarToken, eliminarDeseo);

module.exports = router;
