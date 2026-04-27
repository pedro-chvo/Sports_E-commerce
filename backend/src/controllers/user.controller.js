const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { leer, escribir } = require('../utils/jsonDB');

const register = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const usuarios = leer('usuarios');
    if (usuarios.find(u => u.email === email)) {
        return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevo = {
        id: usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1,
        nombre,
        email,
        password: hash,
        rol: 'usuario'
    };

    usuarios.push(nuevo);
    escribir('usuarios', usuarios);

    const { password: _, ...usuarioSinPassword } = nuevo;
    res.status(201).json(usuarioSinPassword);
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    const usuarios = leer('usuarios');
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign(
        { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    const { password: _, ...usuarioSinPassword } = usuario;
    res.json({ token, usuario: usuarioSinPassword });
};

module.exports = { register, login };
