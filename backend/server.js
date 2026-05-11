require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Importación de módulos de rutas por recurso
const productoRoutes = require('./src/routes/producto.routes');
const authRoutes     = require('./src/routes/auth.routes');
const usuarioRoutes  = require('./src/routes/usuario.routes');
const carritoRoutes  = require('./src/routes/carrito.routes');
const ventaRoutes    = require('./src/routes/venta.routes');
const deseosRoutes   = require('./src/routes/deseos.routes');

const PORT = process.env.PORT || 3000;

// Permite leer JSON en el body de las peticiones POST/PUT
app.use(express.json());

// Sirve todos los archivos estáticos del frontend (HTML, CSS, JS, imágenes)
const frontendPath = path.resolve(__dirname, '../frontend');
console.log('Sirviendo frontend desde:', frontendPath);
app.use(express.static(frontendPath));

// Registro de rutas bajo el prefijo /api
app.use('/api/auth',      authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios',  usuarioRoutes);
app.use('/api/carrito',   carritoRoutes);
app.use('/api/ventas',    ventaRoutes);
app.use('/api/deseos',    deseosRoutes);

// Inicia el servidor en el puerto configurado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
