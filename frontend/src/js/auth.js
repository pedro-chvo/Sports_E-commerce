const API = '/api/auth';

const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data;
};

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

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/pages/login.html';
};

const getToken = () => localStorage.getItem('token');

const estaLogueado = () => !!getToken();

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

const getUsuario = () => {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
};
