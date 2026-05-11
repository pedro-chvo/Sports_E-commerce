const { leer, escribir } = require('../utils/jsonDB');

const ESTATUSES = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

// ── Usuario: crear venta (checkout) ──────────────────────────────────────────

const crearVenta = (req, res) => {
    // Acepta items del body o toma los del carrito guardado en servidor
    let items = req.body.items;
    const direccionEnvio = req.body.direccionEnvio || null;
    const pagoInfo = req.body.pago || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
        // Fallback: usar carrito del servidor
        const carritos = leer('carritos');
        const carrito = carritos.find(c => c.usuarioId === req.usuario.id);
        if (!carrito || carrito.items.length === 0) {
            return res.status(400).json({ mensaje: 'No hay productos para procesar la compra' });
        }
        items = carrito.items;
    }

    const productos = leer('productos');
    const productosActualizados = [...productos];
    const productosVenta = [];

    for (const item of items) {
        const idx = productosActualizados.findIndex(p => p.id === parseInt(item.productoId));
        if (idx === -1) {
            return res.status(404).json({ mensaje: `Producto ${item.productoId} no encontrado` });
        }
        const prod = productosActualizados[idx];
        const cantidad = parseInt(item.cantidad);
        if (prod.stock < cantidad) {
            return res.status(400).json({
                mensaje: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}`
            });
        }
        productosActualizados[idx] = { ...prod, stock: prod.stock - cantidad };
        productosVenta.push({
            productoId: prod.id,
            nombre: prod.nombre,
            marca: prod.marca,
            precio: prod.precio,
            cantidad,
            subtotal: parseFloat((prod.precio * cantidad).toFixed(2))
        });
    }

    const ventas = leer('ventas');
    const nuevaVenta = {
        id: ventas.length > 0 ? ventas[ventas.length - 1].id + 1 : 1,
        usuarioId: req.usuario.id,
        usuarioNombre: req.usuario.nombre,
        usuarioEmail: req.usuario.email,
        productos: productosVenta,
        total: parseFloat(productosVenta.reduce((acc, p) => acc + p.subtotal, 0).toFixed(2)),
        estatus: 'pendiente',
        fecha: new Date().toISOString(),
        direccionEnvio,
        pago: pagoInfo
    };

    ventas.push(nuevaVenta);
    escribir('ventas', ventas);
    escribir('productos', productosActualizados);

    // Limpiar carrito del servidor si existía
    const carritos = leer('carritos');
    const idxCarrito = carritos.findIndex(c => c.usuarioId === req.usuario.id);
    if (idxCarrito !== -1) {
        carritos[idxCarrito].items = [];
        escribir('carritos', carritos);
    }

    res.status(201).json(nuevaVenta);
};

// ── Admin: consultar todas las ventas ─────────────────────────────────────────

const getVentas = (req, res) => {
    const ventas = leer('ventas');
    const { estatus, usuarioId } = req.query;

    let resultado = ventas;
    if (estatus) resultado = resultado.filter(v => v.estatus === estatus);
    if (usuarioId) resultado = resultado.filter(v => v.usuarioId === parseInt(usuarioId));

    // Más recientes primero
    resultado = resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(resultado);
};

// ── Usuario: ver su propio historial ─────────────────────────────────────────

const getMisVentas = (req, res) => {
    const ventas = leer('ventas');
    const misVentas = ventas
        .filter(v => v.usuarioId === req.usuario.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(misVentas);
};

// ── Restaurar stock al cancelar ───────────────────────────────────────────────

const restaurarStock = (venta) => {
    const productos = leer('productos');
    venta.productos.forEach(item => {
        const idx = productos.findIndex(p => p.id === item.productoId);
        if (idx !== -1) productos[idx].stock += item.cantidad;
    });
    escribir('productos', productos);
};

// ── Admin: cambiar estatus de una venta ───────────────────────────────────────

const cambiarEstatus = (req, res) => {
    const { estatus } = req.body;
    if (!estatus || !ESTATUSES.includes(estatus)) {
        return res.status(400).json({
            mensaje: `Estatus inválido. Opciones: ${ESTATUSES.join(', ')}`
        });
    }

    const ventas = leer('ventas');
    const index = ventas.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    const anterior = ventas[index].estatus;
    if (estatus === 'cancelado' && anterior !== 'cancelado') {
        restaurarStock(ventas[index]);
    }

    ventas[index].estatus = estatus;
    escribir('ventas', ventas);
    res.json(ventas[index]);
};

// ── Usuario: cancelar su propio pedido ───────────────────────────────────────

const cancelarPedido = (req, res) => {
    const ventas = leer('ventas');
    const index = ventas.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    const venta = ventas[index];
    if (venta.usuarioId !== req.usuario.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para cancelar este pedido' });
    }
    if (venta.estatus !== 'pendiente') {
        return res.status(400).json({ mensaje: 'Solo puedes cancelar pedidos en estatus pendiente' });
    }

    restaurarStock(venta);
    ventas[index].estatus = 'cancelado';
    escribir('ventas', ventas);
    res.json(ventas[index]);
};

// ── Admin/Usuario: detalle de una venta ──────────────────────────────────────

const getVentaById = (req, res) => {
    const ventas = leer('ventas');
    const venta = ventas.find(v => v.id === parseInt(req.params.id));
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    // Solo el dueño o un admin puede ver la venta
    if (venta.usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'No tienes permiso para ver esta venta' });
    }
    res.json(venta);
};

// ── Admin: métricas del dashboard ─────────────────────────────────────────────

const getMetricas = (req, res) => {
    const ventas   = leer('ventas');
    const productos = leer('productos');

    const deporteMap = {};
    productos.forEach(p => { deporteMap[p.id] = p.deporte; });

    const ventasActivas = ventas.filter(v => v.estatus !== 'cancelado');

    const ingresosTotales = parseFloat(
        ventasActivas.reduce((s, v) => s + v.total, 0).toFixed(2)
    );

    const ventasPorEstatus = { pendiente: 0, procesando: 0, enviado: 0, entregado: 0, cancelado: 0 };
    ventas.forEach(v => { ventasPorEstatus[v.estatus] = (ventasPorEstatus[v.estatus] || 0) + 1; });

    const productosMap = {};
    ventasActivas.forEach(v => {
        v.productos.forEach(p => {
            if (!productosMap[p.productoId]) {
                productosMap[p.productoId] = { nombre: p.nombre, marca: p.marca || '', cantidad: 0, ingresos: 0 };
            }
            productosMap[p.productoId].cantidad += p.cantidad;
            productosMap[p.productoId].ingresos  = parseFloat((productosMap[p.productoId].ingresos + p.subtotal).toFixed(2));
        });
    });
    const productosMasVendidos = Object.values(productosMap)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 7);

    const ingresosPorDeporte = {};
    ventasActivas.forEach(v => {
        v.productos.forEach(p => {
            const dep = deporteMap[p.productoId] || 'otro';
            ingresosPorDeporte[dep] = parseFloat(((ingresosPorDeporte[dep] || 0) + p.subtotal).toFixed(2));
        });
    });

    res.json({
        ingresosTotales,
        totalVentas: ventas.length,
        ventasPorEstatus,
        productosMasVendidos,
        ingresosPorDeporte,
    });
};

module.exports = { crearVenta, getVentas, getMisVentas, cambiarEstatus, cancelarPedido, getVentaById, getMetricas };
