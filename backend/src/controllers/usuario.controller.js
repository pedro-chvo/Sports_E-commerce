const bcrypt = require('bcryptjs');
const { leer, escribir } = require('../utils/jsonDB');

// ── Admin: gestión de usuarios ────────────────────────────────────────────────

const getUsuarios = (req, res) => {
    const usuarios = leer('usuarios');
    const resultado = usuarios.map(({ password, ...u }) => u);
    res.json(resultado);
};

const eliminarUsuario = (req, res) => {
    const id = parseInt(req.params.id);
    if (id === req.usuario.id) {
        return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    const usuarios = leer('usuarios');
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuarios.splice(index, 1);
    escribir('usuarios', usuarios);
    res.json({ mensaje: 'Usuario eliminado' });
};

const cambiarRol = (req, res) => {
    const id = parseInt(req.params.id);
    if (id === req.usuario.id) {
        return res.status(400).json({ mensaje: 'No puedes cambiar tu propio rol' });
    }

    const { rol } = req.body;
    if (!['usuario', 'admin'].includes(rol)) {
        return res.status(400).json({ mensaje: 'Rol inválido. Usa "usuario" o "admin"' });
    }

    const usuarios = leer('usuarios');
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuarios[index].rol = rol;
    escribir('usuarios', usuarios);

    const { password, ...usuarioSinPassword } = usuarios[index];
    res.json(usuarioSinPassword);
};

// ── Usuario: perfil ───────────────────────────────────────────────────────────

const actualizarPerfil = (req, res) => {
    const { nombre, email } = req.body;
    if (!nombre && !email) {
        return res.status(400).json({ mensaje: 'Envía al menos nombre o email para actualizar' });
    }

    const usuarios = leer('usuarios');
    const index = usuarios.findIndex(u => u.id === req.usuario.id);
    if (index === -1) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (email && email !== usuarios[index].email) {
        const emailEnUso = usuarios.some((u, i) => i !== index && u.email === email);
        if (emailEnUso) return res.status(409).json({ mensaje: 'El email ya está en uso' });
        usuarios[index].email = email;
    }
    if (nombre) usuarios[index].nombre = nombre;

    escribir('usuarios', usuarios);
    const { password, ...usuarioSinPassword } = usuarios[index];
    res.json(usuarioSinPassword);
};

const cambiarPassword = async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ mensaje: 'passwordActual y passwordNueva son obligatorios' });
    }
    if (passwordNueva.length < 6) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuarios = leer('usuarios');
    const index = usuarios.findIndex(u => u.id === req.usuario.id);
    if (index === -1) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(passwordActual, usuarios[index].password);
    if (!valido) return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });

    usuarios[index].password = await bcrypt.hash(passwordNueva, 10);
    escribir('usuarios', usuarios);
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
};

module.exports = { getUsuarios, eliminarUsuario, cambiarRol, actualizarPerfil, cambiarPassword };
