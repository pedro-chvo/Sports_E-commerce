const express = require('express');
const router = express.Router();
const { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/producto.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', verificarToken, soloAdmin, crearProducto);
router.put('/:id', verificarToken, soloAdmin, actualizarProducto);
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto);

module.exports = router;
