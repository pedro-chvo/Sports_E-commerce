const { leer, escribir } = require('../utils/jsonDB');

const obtenerCarritoUsuario = (carritos, usuarioId) => {
    let carrito = carritos.find(c => c.usuarioId === usuarioId);
    if (!carrito) {
        carrito = { usuarioId, items: [] };
        carritos.push(carrito);
    }
    return carrito;
};

const getCarrito = (req, res) => {
    const carritos = leer('carritos');
    const productos = leer('productos');
    const carrito = obtenerCarritoUsuario(carritos, req.usuario.id);

    const itemsDetallados = carrito.items.map(item => {
        const producto = productos.find(p => p.id === item.productoId);
        if (!producto) return null;
        return {
            productoId: item.productoId,
            cantidad: item.cantidad,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            deporte: producto.deporte,
            marca: producto.marca,
            subtotal: parseFloat((producto.precio * item.cantidad).toFixed(2))
        };
    }).filter(Boolean);

    const total = itemsDetallados.reduce((acc, i) => acc + i.subtotal, 0);
    res.json({ items: itemsDetallados, total: parseFloat(total.toFixed(2)) });
};

const agregarItem = (req, res) => {
    const { productoId, cantidad = 1 } = req.body;
    if (!productoId) return res.status(400).json({ mensaje: 'productoId es obligatorio' });

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
        return res.status(400).json({ mensaje: 'cantidad debe ser un número mayor a 0' });
    }

    const productos = leer('productos');
    const producto = productos.find(p => p.id === parseInt(productoId));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    if (producto.stock < 1) return res.status(400).json({ mensaje: 'Producto sin stock disponible' });

    const carritos = leer('carritos');
    const carrito = obtenerCarritoUsuario(carritos, req.usuario.id);

    const itemExistente = carrito.items.find(i => i.productoId === producto.id);
    if (itemExistente) {
        const nuevaCantidad = itemExistente.cantidad + cantidadNum;
        if (nuevaCantidad > producto.stock) {
            return res.status(400).json({ mensaje: `Stock insuficiente. Disponible: ${producto.stock}` });
        }
        itemExistente.cantidad = nuevaCantidad;
    } else {
        if (cantidadNum > producto.stock) {
            return res.status(400).json({ mensaje: `Stock insuficiente. Disponible: ${producto.stock}` });
        }
        carrito.items.push({ productoId: producto.id, cantidad: cantidadNum });
    }

    escribir('carritos', carritos);
    res.status(201).json({ mensaje: 'Producto agregado al carrito', items: carrito.items });
};

const actualizarItem = (req, res) => {
    const productoId = parseInt(req.params.productoId);
    const { cantidad } = req.body;
    const cantidadNum = parseInt(cantidad);

    if (isNaN(cantidadNum) || cantidadNum < 1) {
        return res.status(400).json({ mensaje: 'cantidad debe ser un número mayor a 0' });
    }

    const productos = leer('productos');
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    if (cantidadNum > producto.stock) {
        return res.status(400).json({ mensaje: `Stock insuficiente. Disponible: ${producto.stock}` });
    }

    const carritos = leer('carritos');
    const carrito = obtenerCarritoUsuario(carritos, req.usuario.id);
    const item = carrito.items.find(i => i.productoId === productoId);
    if (!item) return res.status(404).json({ mensaje: 'Producto no está en el carrito' });

    item.cantidad = cantidadNum;
    escribir('carritos', carritos);
    res.json({ mensaje: 'Cantidad actualizada', items: carrito.items });
};

const eliminarItem = (req, res) => {
    const productoId = parseInt(req.params.productoId);

    const carritos = leer('carritos');
    const carrito = obtenerCarritoUsuario(carritos, req.usuario.id);
    const index = carrito.items.findIndex(i => i.productoId === productoId);
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no está en el carrito' });

    carrito.items.splice(index, 1);
    escribir('carritos', carritos);
    res.json({ mensaje: 'Producto eliminado del carrito', items: carrito.items });
};

const limpiarCarrito = (req, res) => {
    const carritos = leer('carritos');
    const carrito = obtenerCarritoUsuario(carritos, req.usuario.id);
    carrito.items = [];
    escribir('carritos', carritos);
    res.json({ mensaje: 'Carrito vaciado' });
};

module.exports = { getCarrito, agregarItem, actualizarItem, eliminarItem, limpiarCarrito };
