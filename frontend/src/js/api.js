/* ── API helpers ── */

// Función base para todas las peticiones a la API.
// Adjunta el JWT del localStorage en el header Authorization.
// Si el servidor responde 401, limpia la sesión y redirige al login.
// Lanza un Error con el mensaje del servidor si la respuesta no es OK.
async function fetchAPI(endpoint, options = {}) {
  const token = getToken ? getToken() : localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  Object.assign(headers, options.headers || {});

  const res = await fetch('/api' + endpoint, { ...options, headers });

  if (res.status === 401 && token) {
    // Token expirado o inválido: cierra sesión y redirige
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/pages/login.html';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error en la solicitud');
  return data;
}

// Métodos del catálogo de productos.
// getAll acepta un objeto de filtros/paginación que se convierte en query params.
const productosAPI = {
  getAll(params) {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI('/productos' + q);
  },
  getById(id)       { return fetchAPI('/productos/' + id); },
  crear(data)       { return fetchAPI('/productos',       { method: 'POST',   body: JSON.stringify(data) }); },
  actualizar(id, d) { return fetchAPI('/productos/' + id, { method: 'PUT',    body: JSON.stringify(d)    }); },
  eliminar(id)      { return fetchAPI('/productos/' + id, { method: 'DELETE'                              }); },
};

// Métodos de gestión de usuarios (admin) y perfil propio (usuario autenticado).
const usuariosAPI = {
  crear(d)            { return fetchAPI('/usuarios',                { method: 'POST',   body: JSON.stringify(d)       }); },
  getAll()            { return fetchAPI('/usuarios'); },
  eliminar(id)        { return fetchAPI('/usuarios/' + id,          { method: 'DELETE'                                }); },
  cambiarRol(id, rol) { return fetchAPI('/usuarios/' + id + '/rol', { method: 'PUT',    body: JSON.stringify({ rol }) }); },
  actualizarPerfil(d) { return fetchAPI('/usuarios/perfil/datos',    { method: 'PUT',    body: JSON.stringify(d)       }); },
  cambiarPassword(d)  { return fetchAPI('/usuarios/perfil/password', { method: 'PUT',    body: JSON.stringify(d)       }); },
};

// Métodos de la lista de deseos del usuario autenticado.
const deseosAPI = {
  getAll()     { return fetchAPI('/deseos'); },
  agregar(id)  { return fetchAPI('/deseos',       { method: 'POST',   body: JSON.stringify({ productoId: id }) }); },
  eliminar(id) { return fetchAPI('/deseos/' + id, { method: 'DELETE'                                           }); },
};

// Métodos del carrito de compras del usuario autenticado.
const carritoAPI = {
  get()                    { return fetchAPI('/carrito'); },
  agregar(id, cantidad)    { return fetchAPI('/carrito',       { method: 'POST',   body: JSON.stringify({ productoId: id, cantidad }) }); },
  actualizar(id, cantidad) { return fetchAPI('/carrito/' + id, { method: 'PUT',    body: JSON.stringify({ cantidad })                  }); },
  eliminar(id)             { return fetchAPI('/carrito/' + id, { method: 'DELETE'                                                      }); },
  vaciar()                 { return fetchAPI('/carrito/vaciar', { method: 'DELETE'                                                     }); },
};

// Métodos de ventas: creación (checkout), historial, detalle, métricas (admin) y cancelación.
const ventasAPI = {
  crear(data)  { return fetchAPI('/ventas',             { method: 'POST', body: JSON.stringify(data) }); },
  getMias()    { return fetchAPI('/ventas/mias'); },
  getAll(params) {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI('/ventas' + q);
  },
  getById(id)  { return fetchAPI('/ventas/' + id); },
  cambiarEstatus(id, estatus) {
    return fetchAPI('/ventas/' + id + '/estatus', { method: 'PUT', body: JSON.stringify({ estatus }) });
  },
  cancelar(id) { return fetchAPI('/ventas/' + id + '/cancelar', { method: 'PATCH' }); },
  metricas()   { return fetchAPI('/ventas/metricas'); },
};
