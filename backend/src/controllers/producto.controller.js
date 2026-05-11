const { leer, escribir } = require('../utils/jsonDB');
const multer = require('multer');
const path   = require('path');

// Directorio donde se guardan las imágenes de productos
const assetsDir = path.resolve(__dirname, '../../../frontend/src/assets');

// Configuración de multer para subida de imágenes:
// - Guarda el archivo con su nombre original en la carpeta de assets
// - Limita el tamaño a 5 MB y acepta solo formatos de imagen comunes
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, assetsDir),
        filename:    (req, file, cb) => cb(null, file.originalname),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, /jpeg|jpg|png|avif|webp/.test(file.mimetype));
    },
});

// Responde con la ruta relativa de la imagen recién subida
const subirImagen = (req, res) => {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ninguna imagen' });
    res.json({ imagen: '/src/assets/' + req.file.originalname });
};

// Retorna la lista de productos con soporte para filtros y paginación.
// Filtros opcionales (query params): q (búsqueda de texto), deporte, categoria, marca, destacado.
// Si se envía el parámetro page, responde con el objeto paginado { data, total, page, limit, totalPages }.
const getProductos = (req, res) => {
    const productos = leer('productos');
    const { deporte, categoria, marca, destacado, page, limit, q } = req.query;

    let resultado = productos;

    // Búsqueda por texto en nombre, marca y descripción
    if (q) {
        const term = q.toLowerCase();
        resultado = resultado.filter(p =>
            p.nombre.toLowerCase().includes(term) ||
            (p.marca && p.marca.toLowerCase().includes(term)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(term))
        );
    }

    if (deporte)   resultado = resultado.filter(p => p.deporte === deporte);
    if (categoria) resultado = resultado.filter(p => p.categoria === categoria);
    if (marca)     resultado = resultado.filter(p => p.marca.toLowerCase() === marca.toLowerCase());
    if (destacado) resultado = resultado.filter(p => p.destacado === true);

    // Paginación: si se envía `page`, se devuelve solo el slice correspondiente
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

// Retorna un producto específico por su ID
const getProductoById = (req, res) => {
    const productos = leer('productos');
    const producto = productos.find(p => p.id === parseInt(req.params.id));
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
};

// Crea un nuevo producto. Campos obligatorios: nombre, precio, stock, deporte, categoria.
const crearProducto = (req, res) => {
    const productos = leer('productos');
    const { nombre, descripcion, precio, stock, deporte, categoria, marca, color, imagen } = req.body;

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
        imagen: imagen || ''
    };

    productos.push(nuevo);
    escribir('productos', productos);
    res.status(201).json(nuevo);
};

// Actualiza los campos enviados en el body para el producto indicado por ID.
// Solo modifica los campos presentes; el ID nunca cambia.
const actualizarProducto = (req, res) => {
    const productos = leer('productos');
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const { nombre, descripcion, precio, stock, deporte, categoria, marca, color, imagen, destacado } = req.body;
    const campos = { nombre, descripcion, precio, stock, deporte, categoria, marca, color, imagen, destacado };
    // Elimina claves con valor undefined para no sobreescribir campos no enviados
    Object.keys(campos).forEach(k => campos[k] === undefined && delete campos[k]);

    productos[index] = { ...productos[index], ...campos, id: productos[index].id };
    escribir('productos', productos);
    res.json(productos[index]);
};

// Elimina un producto del catálogo por ID
const eliminarProducto = (req, res) => {
    const productos = leer('productos');
    const index = productos.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    productos.splice(index, 1);
    escribir('productos', productos);
    res.json({ mensaje: 'Producto eliminado' });
};

module.exports = { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto, subirImagen, upload };
