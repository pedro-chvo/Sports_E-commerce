const express = require('express');
const app = express();

const PORT = 3000;

// Una ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola! El servidor está funcionando perfectamente.');
});

// Esta es la parte que mantiene el servidor "vivo"
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});