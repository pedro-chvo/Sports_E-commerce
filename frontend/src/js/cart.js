
const CART_KEY     = 'sportzone_cart';
const WISHLIST_KEY = 'sportzone_wishlist';

// ── Carrito ───────────────────────────────────────────────────────────────────

// Lee el carrito guardado en localStorage y lo retorna como array.
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

// Guarda el carrito en localStorage y actualiza el badge del navbar.
function guardarCarrito(c) {
  localStorage.setItem(CART_KEY, JSON.stringify(c));
  actualizarBadge();
}

// Actualiza el número visible en el ícono del carrito en el navbar.
// Muestra el total de unidades; oculta el badge si el carrito está vacío.
function actualizarBadge() {
  const total = obtenerCarrito().reduce((s, i) => s + i.cantidad, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

// Lee la lista de deseos guardada en localStorage y la retorna como array.
function obtenerDeseos() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

// Guarda la lista de deseos en localStorage y actualiza el badge del navbar.
function guardarDeseos(d) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(d));
  actualizarWishlistBadge();
}

// Indica si un producto (por ID) está en la lista de deseos local.
function enListaDeseos(id) {
  return obtenerDeseos().some(i => i.id === id);
}

// Actualiza el número visible en el ícono de wishlist del navbar.
// Muestra la cantidad de productos guardados; oculta el badge si está vacía.
function actualizarWishlistBadge() {
  const total = obtenerDeseos().length;
  document.querySelectorAll('.wishlist-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// Actualiza el ícono del botón de wishlist de una card de producto
// para reflejar si el producto está o no en la lista de deseos.
function actualizarIconoDeseo(productoId, enDeseos) {
  const btn = document.getElementById('wish-' + productoId);
  if (!btn) return;
  btn.classList.toggle('activo', enDeseos);
  btn.querySelector('i').className = 'bi ' + (enDeseos ? 'bi-heart-fill' : 'bi-heart');
}

// Alterna un producto en la lista de deseos local y sincroniza con el servidor.
// Si el usuario no está logueado, muestra un toast y redirige al login.
function toggleDeseo(productoId) {
  if (!estaLogueado()) {
    mostrarToast('Debes iniciar sesión para guardar en tu lista de deseos.', 'error');
    setTimeout(() => { window.location.href = '/pages/login.html'; }, 1600);
    return;
  }
  const deseos = obtenerDeseos();
  const idx = deseos.findIndex(i => i.id === productoId);
  if (idx >= 0) {
    // Ya está en deseos → eliminar
    const nombre = deseos[idx].nombre;
    deseos.splice(idx, 1);
    guardarDeseos(deseos);
    mostrarToast(nombre + ' eliminado de tu lista de deseos.', 'info');
    actualizarIconoDeseo(productoId, false);
    deseosAPI.eliminar(productoId).catch(() => {});
  } else {
    // No está → obtener datos del producto y agregar
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

// ── Toast ─────────────────────────────────────────────────────────────────────

// Muestra una notificación temporal en la esquina de la pantalla.
// tipo: 'success' | 'error' | 'info'. Se auto-elimina a los 3.2 segundos.
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

// ── Carrito: agregar desde catálogo ──────────────────────────────────────────

// Agrega un producto al carrito local e incrementa su cantidad si ya existe.
// Sincroniza el cambio con el servidor en segundo plano.
// Si el usuario no está logueado, muestra un toast y redirige al login.
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

// ── Navbar ────────────────────────────────────────────────────────────────────

// Renderiza el bloque de autenticación del navbar.
// Si hay sesión activa muestra el nombre del usuario con un dropdown de opciones;
// si no, muestra el botón de iniciar sesión. Si es admin, agrega el enlace al panel.
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

// ── Sincronización ────────────────────────────────────────────────────────────

// Al cargar cualquier página, sincroniza el carrito y la wishlist locales con los datos
// del servidor para mantener consistencia entre dispositivos o sesiones.
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
  } catch(e) { /* Falla silenciosamente: se mantienen los valores de localStorage */ }
}

// Inicializa los badges, el navbar y la sincronización en cada carga de página
document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();
  actualizarWishlistBadge();
  renderNavAuth();
  sincronizarBadges();
});
