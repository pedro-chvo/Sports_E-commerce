const express = require('express');
const router = express.Router();
const {
    getCarrito, agregarItem, actualizarItem,
    eliminarItem, limpiarCarrito
} = require('../controllers/carrito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, getCarrito);
router.post('/', verificarToken, agregarItem);
router.put('/:productoId', verificarToken, actualizarItem);
router.delete('/vaciar', verificarToken, limpiarCarrito);
router.delete('/:productoId', verificarToken, eliminarItem);

module.exports = router;
