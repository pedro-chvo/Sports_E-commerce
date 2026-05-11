const express = require('express');
const router = express.Router();
const {
    crearVenta, getVentas, getMisVentas,
    cambiarEstatus, cancelarPedido, getVentaById, getMetricas
} = require('../controllers/venta.controller');
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearVenta);
router.get('/mias', verificarToken, getMisVentas);
router.get('/metricas', verificarToken, soloAdmin, getMetricas);
router.get('/', verificarToken, soloAdmin, getVentas);
router.get('/:id', verificarToken, getVentaById);
router.patch('/:id/cancelar', verificarToken, cancelarPedido);
router.put('/:id/estatus', verificarToken, soloAdmin, cambiarEstatus);

module.exports = router;
