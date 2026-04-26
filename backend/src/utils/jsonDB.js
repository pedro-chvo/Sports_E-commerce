const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data');

const leer = (archivo) => {
    const ruta = path.join(dataPath, `${archivo}.json`);
    return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
};

const escribir = (archivo, datos) => {
    const ruta = path.join(dataPath, `${archivo}.json`);
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
};

module.exports = { leer, escribir };
