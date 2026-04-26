const express = require('express');
const router = express.Router();
const { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/producto.controller');

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
