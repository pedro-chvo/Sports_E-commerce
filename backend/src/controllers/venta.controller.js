const { leer, escribir } = require('../utils/jsonDB');

const ESTATUSES = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

// ── Usuario: crear venta (checkout) ──────────────────────────────────────────

// Procesa el checkout y crea una nueva venta.
// Acepta los items del body o, como fallback, toma los del carrito guardado en el servidor.
// Valida stock, descuenta unidades, guarda la venta y limpia el carrito del usuario.
const crearVenta = (req, res) => {
    let items = req.body.items;
    const direccionEnvio = req.body.direccionEnvio || null;
    const pagoInfo = req.body.pago || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
        // Fallback: usar carrito guardado en el servidor si no vienen items en el body
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

    // Valida stock de cada item y prepara el snapshot de productos para la venta
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

    // Limpia el carrito del servidor una vez confirmada la venta
    const carritos = leer('carritos');
    const idxCarrito = carritos.findIndex(c => c.usuarioId === req.usuario.id);
    if (idxCarrito !== -1) {
        carritos[idxCarrito].items = [];
        escribir('carritos', carritos);
    }

    res.status(201).json(nuevaVenta);
};

// ── Admin: consultar todas las ventas ─────────────────────────────────────────

// Retorna todas las ventas del sistema, ordenadas de más reciente a más antigua.
// Filtros opcionales: estatus, usuarioId.
const getVentas = (req, res) => {
    const ventas = leer('ventas');
    const { estatus, usuarioId } = req.query;

    let resultado = ventas;
    if (estatus)    resultado = resultado.filter(v => v.estatus === estatus);
    if (usuarioId)  resultado = resultado.filter(v => v.usuarioId === parseInt(usuarioId));

    resultado = resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(resultado);
};

// ── Usuario: ver su propio historial ─────────────────────────────────────────

// Retorna únicamente las ventas del usuario autenticado, ordenadas de más reciente a más antigua.
const getMisVentas = (req, res) => {
    const ventas = leer('ventas');
    const misVentas = ventas
        .filter(v => v.usuarioId === req.usuario.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json(misVentas);
};

// ── Restaurar stock al cancelar ───────────────────────────────────────────────

// Devuelve el stock de cada producto al nivel previo a la venta.
// Se llama internamente al cancelar una venta para que los productos vuelvan a estar disponibles.
const restaurarStock = (venta) => {
    const productos = leer('productos');
    venta.productos.forEach(item => {
        const idx = productos.findIndex(p => p.id === item.productoId);
        if (idx !== -1) productos[idx].stock += item.cantidad;
    });
    escribir('productos', productos);
};

// ── Admin: cambiar estatus de una venta ───────────────────────────────────────

// Actualiza el estatus de una venta. Si el nuevo estatus es 'cancelado', restaura el stock.
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

// Permite al usuario cancelar su pedido si aún está en estatus 'pendiente'.
// Restaura el stock de los productos al cancelar.
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

// Retorna el detalle completo de una venta por ID.
// Solo el dueño de la venta o un administrador puede consultarla.
const getVentaById = (req, res) => {
    const ventas = leer('ventas');
    const venta = ventas.find(v => v.id === parseInt(req.params.id));
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    if (venta.usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'No tienes permiso para ver esta venta' });
    }
    res.json(venta);
};

// ── Admin: métricas del dashboard ─────────────────────────────────────────────

// Calcula y retorna estadísticas globales para el panel de administración:
// ingresos totales, total de ventas, ventas por estatus,
// los 7 productos más vendidos e ingresos desglosados por deporte.
const getMetricas = (req, res) => {
    const ventas    = leer('ventas');
    const productos = leer('productos');

    // Mapa auxiliar id → deporte para enriquecer los items de venta
    const deporteMap = {};
    productos.forEach(p => { deporteMap[p.id] = p.deporte; });

    // Excluye ventas canceladas del cálculo de ingresos
    const ventasActivas = ventas.filter(v => v.estatus !== 'cancelado');

    const ingresosTotales = parseFloat(
        ventasActivas.reduce((s, v) => s + v.total, 0).toFixed(2)
    );

    // Conteo de ventas agrupadas por cada estatus posible
    const ventasPorEstatus = { pendiente: 0, procesando: 0, enviado: 0, entregado: 0, cancelado: 0 };
    ventas.forEach(v => { ventasPorEstatus[v.estatus] = (ventasPorEstatus[v.estatus] || 0) + 1; });

    // Agrupación de cantidad e ingresos por producto para el ranking
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

    // Ingresos agrupados por deporte usando el mapa auxiliar
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
