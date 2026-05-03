/* ── API helpers ── */

async function fetchAPI(endpoint, options = {}) {
  const token = getToken ? getToken() : localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  Object.assign(headers, options.headers || {});

  const res = await fetch('/api' + endpoint, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error en la solicitud');
  return data;
}

const productosAPI = {
  getAll(params) {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI('/productos' + q);
  },
  getById(id)       { return fetchAPI('/productos/' + id); },
  crear(data)       { return fetchAPI('/productos',      { method: 'POST',   body: JSON.stringify(data) }); },
  actualizar(id, d) { return fetchAPI('/productos/' + id, { method: 'PUT',    body: JSON.stringify(d)    }); },
  eliminar(id)      { return fetchAPI('/productos/' + id, { method: 'DELETE'                              }); },
};
