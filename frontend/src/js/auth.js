const API = '/api/auth';

// Inicia sesión con email y contraseña.
// Limpia el carrito y wishlist locales antes de guardar el nuevo token,
// para evitar mezclar datos de sesiones distintas.
const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);
    localStorage.removeItem('sportzone_cart');
    localStorage.removeItem('sportzone_wishlist');
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
};

// Registra una cuenta nueva y hace login automáticamente con las mismas credenciales.
const register = async (nombre, email, password) => {
    const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);
    return await login(email, password);
};

// Cierra la sesión eliminando token y datos del usuario del localStorage y redirige al login.
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/pages/login.html';
};

// Retorna el JWT almacenado o null si no hay sesión activa.
const getToken = () => localStorage.getItem('token');

// Indica si hay un usuario con sesión activa (tiene token).
const estaLogueado = () => !!getToken();

// Decodifica el payload del JWT para verificar si el rol del usuario es 'admin'.
// No valida la firma: solo se usa para condicionar la UI, la seguridad real está en el servidor.
const esAdmin = () => {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol === 'admin';
    } catch {
        return false;
    }
};

// Retorna el objeto del usuario almacenado en localStorage, o null si no hay sesión.
const getUsuario = () => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
};
