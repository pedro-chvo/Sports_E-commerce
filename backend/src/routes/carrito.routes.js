const express = require('express');
const router = express.Router();
const {
    getCarrito, agregarItem, actualizarItem,
    eliminarItem, limpiarCarrito
} = require('../controllers/carrito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Obtener el carrito del usuario autenticado
router.get('/', verificarToken, getCarrito);

// Agregar un producto al carrito
router.post('/', verificarToken, agregarItem);

// Actualizar la cantidad de un producto en el carrito
router.put('/:productoId', verificarToken, actualizarItem);

// Vaciar todo el carrito — debe ir antes de /:productoId para que Express no interprete 'vaciar' como un ID
router.delete('/vaciar', verificarToken, limpiarCarrito);

// Eliminar un producto específico del carrito
router.delete('/:productoId', verificarToken, eliminarItem);

module.exports = router;
