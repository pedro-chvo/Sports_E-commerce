
const CART_KEY     = 'sportzone_cart';
const WISHLIST_KEY = 'sportzone_wishlist';

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function guardarCarrito(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  actualizarBadge();
}

function actualizarBadge() {
  const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ── Wishlist ── */

function obtenerDeseos() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}
function guardarDeseos(d) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(d));
  actualizarWishlistBadge();
}
function enListaDeseos(id) {
  return obtenerDeseos().some(i => i.id === id);
}
function actualizarWishlistBadge() {
  const total = obtenerDeseos().length;
  document.querySelectorAll('.wishlist-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}
function actualizarIconoDeseo(productoId, enDeseos) {
  const btn = document.getElementById('wish-' + productoId);
  if (!btn) return;
  btn.classList.toggle('activo', enDeseos);
  btn.querySelector('i').className = 'bi ' + (enDeseos ? 'bi-heart-fill' : 'bi-heart');
}
function toggleDeseo(productoId) {
  if (!estaLogueado()) {
    mostrarToast('Debes iniciar sesión para guardar en tu lista de deseos.', 'error');
    setTimeout(() => { window.location.href = '/pages/login.html'; }, 1600);
    return;
  }
  const deseos = obtenerDeseos();
  const idx = deseos.findIndex(i => i.id === productoId);
  if (idx >= 0) {
    const nombre = deseos[idx].nombre;
    deseos.splice(idx, 1);
    guardarDeseos(deseos);
    mostrarToast(nombre + ' eliminado de tu lista de deseos.', 'info');
    actualizarIconoDeseo(productoId, false);
    deseosAPI.eliminar(productoId).catch(() => {});
  } else {
    productosAPI.getById(productoId)
      .then(p => {
        deseos.push({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen,
                      marca: p.marca, deporte: p.deporte, categoria: p.categoria });
        guardarDeseos(deseos);
        mostrarToast(p.nombre + ' agregado a tu lista de deseos.', 'success');
        actualizarIconoDeseo(productoId, true);
        deseosAPI.agregar(productoId).catch(() => {});
      })
      .catch(() => mostrarToast('Error al actualizar la lista de deseos.', 'error'));
  }
}

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
        carritoAPI.actualizar(productoId, carrito[idx].cantidad).catch(() => {});
      } else {
        carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio,
                       imagen: p.imagen, marca: p.marca, deporte: p.deporte, cantidad: 1 });
        carritoAPI.agregar(productoId, 1).catch(() => {});
      }
      guardarCarrito(carrito);
      mostrarToast(p.nombre + ' agregado al carrito.', 'success');
    })
    .catch(() => mostrarToast('Error al agregar el producto.', 'error'));
}

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
          <li><a class="dropdown-item" href="/pages/perfil.html">Mi perfil</a></li>
          <li><a class="dropdown-item" href="/pages/pedidos.html">Mis pedidos</a></li>
          <li><a class="dropdown-item" href="/pages/wishlist.html">Lista de deseos</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout();return false;">Cerrar sesión</a></li>
        </ul>
      </div>`;
  } else {
    el.innerHTML = `<a href="/pages/login.html" class="btn btn-primary btn-sm">Iniciar sesión</a>`;
  }
}

async function sincronizarBadges() {
  if (!estaLogueado()) return;
  try {
    const [carritoData, deseos] = await Promise.all([
      carritoAPI.get(),
      deseosAPI.getAll()
    ]);
    const itemsCarrito = (carritoData.items || []).map(i => ({
      id: i.productoId, nombre: i.nombre, precio: i.precio,
      imagen: i.imagen, marca: i.marca, deporte: i.deporte, cantidad: i.cantidad
    }));
    guardarCarrito(itemsCarrito);
    const itemsDeseos = (deseos.productos || []).map(p => ({
      id: p.id, nombre: p.nombre, precio: p.precio,
      imagen: p.imagen, marca: p.marca, deporte: p.deporte, categoria: p.categoria
    }));
    guardarDeseos(itemsDeseos);
  } catch(e) { /* silently keep localStorage values */ }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();
  actualizarWishlistBadge();
  renderNavAuth();
  sincronizarBadges();
});
