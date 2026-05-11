const express = require('express');
const router = express.Router();
const { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto, subirImagen, upload } = require('../controllers/producto.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Subida de imagen de producto (solo admin)
router.post('/imagen', verificarToken, soloAdmin, upload.single('imagen'), subirImagen);

// Listado de productos con filtros y paginación (público)
router.get('/', getProductos);

// Detalle de un producto por ID (público)
router.get('/:id', getProductoById);

// Crear nuevo producto (solo admin)
router.post('/', verificarToken, soloAdmin, crearProducto);

// Actualizar producto por ID (solo admin)
router.put('/:id', verificarToken, soloAdmin, actualizarProducto);

// Eliminar producto por ID (solo admin)
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto);

module.exports = router;
