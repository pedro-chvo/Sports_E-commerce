const { leer, escribir } = require('../utils/jsonDB');

const getProductos = (req, res) => {
    const productos = leer('productos');
    const { deporte, categoria, marca, destacado, page, limit } = req.query;

    let resultado = productos;
    if (deporte)    resultado = resultado.filter(p => p.deporte === deporte);
    if (categoria)  resultado = resultado.filter(p => p.categoria === categoria);
    if (marca)      resultado = resultado.filter(p => p.marca.toLowerCase() === marca.toLowerCase());
    if (destacado)  resultado = resultado.filter(p => p.destacado === true);

    if (page !== undefined) {
        const pageNum  = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const total      = resultado.length;
        const totalPages = Math.ceil(total / limitNum);
        const data       = resultado.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        return res.json({ data, total, page: pageNum, limit: limitNum, totalPages });
    }

    res.json(resultado);
};

const getProductoById = (req, res) => {
    const productos = leer('productos');
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
};

const crearProducto = (req, res) => {
    const productos = leer('productos');
    const { nombre, descripcion, precio, stock, deporte, categoria, marca, color } = req.body;

    if (!nombre || !precio || !stock || !deporte || !categoria) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const nuevo = {
        id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        stock: parseInt(stock),
        deporte,
        categoria,
        marca: marca || '',
        color: color || '',
        imagen: ''
    };

    productos.push(nuevo);
    escribir('productos', productos);
    res.status(201).json(nuevo);
};

const actualizarProducto = (req, res) => {
    const productos = leer('productos');
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    productos[index] = { ...productos[index], ...req.body, id: productos[index].id };
    escribir('productos', productos);
    res.json(productos[index]);
};

const eliminarProducto = (req, res) => {
    const productos = leer('productos');
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    productos.splice(index, 1);
    escribir('productos', productos);
    res.json({ mensaje: 'Producto eliminado' });
};

module.exports = { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto };
