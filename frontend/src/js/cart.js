/* ── Cart & shared UI utilities ── */

const CART_KEY = 'sportzone_cart';

/* ── LocalStorage helpers ── */
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function guardarCarrito(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  actualizarBadge();
}

/* ── Badge ── */
function actualizarBadge() {
  const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ── Toast notifications ── */
function mostrarToast(msg, tipo) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast-item ' + (tipo || 'success');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ── Add to cart ── */
function agregarAlCarrito(productoId) {
  if (!estaLogueado()) {
    mostrarToast('Debes iniciar sesión para agregar al carrito.', 'error');
    setTimeout(() => { window.location.href = '/pages/login.html'; }, 1600);
    return;
  }
  productosAPI.getById(productoId)
    .then(p => {
      const carrito = obtenerCarrito();
      const idx = carrito.findIndex(i => i.id === p.id);
      if (idx >= 0) {
        carrito[idx].cantidad++;
      } else {
        carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio,
                       imagen: p.imagen, marca: p.marca, deporte: p.deporte, cantidad: 1 });
      }
      guardarCarrito(carrito);
      mostrarToast(p.nombre + ' agregado al carrito.', 'success');
    })
    .catch(() => mostrarToast('Error al agregar el producto.', 'error'));
}

/* ── Navbar auth section ── */
function renderNavAuth() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  if (estaLogueado()) {
    const u = getUsuario();
    const adminLink = esAdmin()
      ? `<li><a class="dropdown-item" href="/pages/admin.html">Panel Admin</a></li>
         <li><hr class="dropdown-divider"></li>`
      : '';
    el.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"
          style="font-size:.8rem;font-weight:600;">
          ${u.nombre}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          ${adminLink}
          <li><a class="dropdown-item" href="#" onclick="logout();return false;">Cerrar sesión</a></li>
        </ul>
      </div>`;
  } else {
    el.innerHTML = `<a href="/pages/login.html" class="btn btn-primary btn-sm">Iniciar sesión</a>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();
  renderNavAuth();
});
