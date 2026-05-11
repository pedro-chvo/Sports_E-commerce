const fs = require('fs');
const path = require('path');

// Ruta base donde se almacenan todos los archivos JSON de datos
const dataPath = path.join(__dirname, '../../data');

// Lee y parsea un archivo JSON de la carpeta data
// archivo: nombre del archivo sin extensión (ej. 'productos')
const leer = (archivo) => {
    const ruta = path.join(dataPath, `${archivo}.json`);
    return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
};

// Serializa y guarda datos en un archivo JSON de la carpeta data
// archivo: nombre del archivo sin extensión; datos: array u objeto a guardar
const escribir = (archivo, datos) => {
    const ruta = path.join(dataPath, `${archivo}.json`);
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
};

module.exports = { leer, escribir };
