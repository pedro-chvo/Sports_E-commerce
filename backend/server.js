require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const productoRoutes = require('./src/routes/producto.routes');
const authRoutes = require('./src/routes/user.routes');

const PORT = process.env.PORT || 3000;

app.use(express.json());
const frontendPath = path.resolve(__dirname, '../frontend');
console.log('Sirviendo frontend desde:', frontendPath);
app.use(express.static(frontendPath));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
