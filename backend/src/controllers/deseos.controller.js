const { leer, escribir } = require('../utils/jsonDB');

const obtenerDeseosUsuario = (listaDeseos, usuarioId) => {
    let deseos = listaDeseos.find(d => d.usuarioId === usuarioId);
    if (!deseos) {
        deseos = { usuarioId, productos: [] };
        listaDeseos.push(deseos);
    }
    return deseos;
};

const getDeseos = (req, res) => {
    const listaDeseos = leer('deseos');
    const productos = leer('productos');
    const deseos = obtenerDeseosUsuario(listaDeseos, req.usuario.id);

    const productosDetallados = deseos.productos.map(productoId => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto) return null;
        return {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            deporte: producto.deporte,
            marca: producto.marca,
            categoria: producto.categoria,
            stock: producto.stock
        };
    }).filter(Boolean);

    res.json({ productos: productosDetallados });
};

const agregarDeseo = (req, res) => {
    const { productoId } = req.body;
    if (!productoId) return res.status(400).json({ mensaje: 'productoId es obligatorio' });

    const productos = leer('productos');
    const producto = productos.find(p => p.id === parseInt(productoId));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const listaDeseos = leer('deseos');
    const deseos = obtenerDeseosUsuario(listaDeseos, req.usuario.id);

    if (deseos.productos.includes(producto.id)) {
        return res.status(400).json({ mensaje: 'El producto ya está en tu lista de deseos' });
    }

    deseos.productos.push(producto.id);
    escribir('deseos', listaDeseos);
    res.status(201).json({ mensaje: 'Producto agregado a la lista de deseos', productos: deseos.productos });
};

const eliminarDeseo = (req, res) => {
    const productoId = parseInt(req.params.productoId);

    const listaDeseos = leer('deseos');
    const deseos = obtenerDeseosUsuario(listaDeseos, req.usuario.id);

    const index = deseos.productos.indexOf(productoId);
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no está en la lista de deseos' });

    deseos.productos.splice(index, 1);
    escribir('deseos', listaDeseos);
    res.json({ mensaje: 'Producto eliminado de la lista de deseos', productos: deseos.productos });
};

module.exports = { getDeseos, agregarDeseo, eliminarDeseo };
