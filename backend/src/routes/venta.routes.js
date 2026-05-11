const express = require('express');
const router = express.Router();
const {
    crearVenta, getVentas, getMisVentas,
    cambiarEstatus, cancelarPedido, getVentaById, getMetricas
} = require('../controllers/venta.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

// Crear una nueva venta (checkout) — usuario autenticado
router.post('/', verificarToken, crearVenta);

// Obtener el historial de ventas del usuario autenticado
// Debe declararse antes de /:id para que '/mias' no se interprete como un ID
router.get('/mias', verificarToken, getMisVentas);

// Obtener métricas del dashboard (solo admin)
// Debe declararse antes de /:id por la misma razón que '/mias'
router.get('/metricas', verificarToken, soloAdmin, getMetricas);

// Obtener todas las ventas del sistema con filtros opcionales (solo admin)
router.get('/', verificarToken, soloAdmin, getVentas);

// Obtener el detalle de una venta por ID (dueño o admin)
router.get('/:id', verificarToken, getVentaById);

// Cancelar un pedido propio (usuario autenticado, solo si está pendiente)
router.patch('/:id/cancelar', verificarToken, cancelarPedido);

// Cambiar el estatus de una venta (solo admin)
router.put('/:id/estatus', verificarToken, soloAdmin, cambiarEstatus);

module.exports = router;
