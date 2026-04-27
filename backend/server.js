require('dotenv').config();
const express = require('express');
const app = express();

const productoRoutes = require('./src/routes/producto.routes');
const authRoutes = require('./src/routes/user.routes');

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Sports E-commerce funcionando' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
