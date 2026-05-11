/* ── Catalog helpers ── */

// Mapa de iconos por deporte para las cards sin imagen
const ICONOS = { basquetbol: '🏀', futbol: '⚽', voleibol: '🏐' };

// Retorna el emoji correspondiente al deporte o el ícono de gym por defecto
function iconoDeporte(deporte) {
  return ICONOS[deporte] || '🏋️';
}

// Genera el HTML de una card de producto para el catálogo.
// Incluye imagen o placeholder, datos del producto, botón de carrito y botón de wishlist.
function renderProductCard(p) {
  const img = p.imagen
    ? `<img src="${p.imagen}" alt="${p.nombre}" class="product-card-img">`
    : `<div class="product-card-placeholder">${iconoDeporte(p.deporte)}</div>`;

  return `
    <div class="col">
      <div class="product-card">
        <a href="/pages/producto.html?id=${p.id}" class="product-card-link">
          ${img}
          <div class="product-card-body">
            <div class="product-card-meta">${p.deporte} &middot; ${p.categoria}</div>
            <div class="product-card-name">${p.nombre}</div>
            <div class="product-card-brand">${p.marca || ''}</div>
            <div class="product-card-price">$${p.precio.toLocaleString('es-MX')}</div>
          </div>
        </a>
        <div class="product-card-footer">
          <button class="btn-add-cart" onclick="agregarAlCarrito(${p.id})">
            Agregar al carrito
          </button>
          <button class="btn-wishlist${enListaDeseos(p.id) ? ' activo' : ''}" id="wish-${p.id}"
                  onclick="toggleDeseo(${p.id})" title="Lista de deseos">
            <i class="bi ${enListaDeseos(p.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
        </div>
      </div>
    </div>`;
}

// Muestra un spinner de carga en el contenedor dado mientras se obtienen los productos
function mostrarLoading(id) {
  document.getElementById(id).innerHTML =
    `<div class="loading-box col-12"><div class="spinner"></div>Cargando productos…</div>`;
}

// Muestra un estado vacío con mensaje en el contenedor dado (sin resultados o error)
function mostrarVacio(id, msg) {
  document.getElementById(id).innerHTML = `
    <div class="empty-state col-12">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">${msg || 'Sin productos'}</div>
      <p>Intenta con otros filtros.</p>
    </div>`;
}

// Carga productos desde la API con los parámetros dados y los renderiza en el contenedor.
// Si se pasa un límite, recorta la lista antes de renderizar (útil para secciones destacadas).
async function cargarProductos(containerId, params, limite) {
  mostrarLoading(containerId);
  try {
    let lista = await productosAPI.getAll(params);
    if (limite) lista = lista.slice(0, limite);
    const el = document.getElementById(containerId);
    if (!lista.length) { mostrarVacio(containerId, 'No se encontraron productos'); return; }
    el.innerHTML = lista.map(renderProductCard).join('');
  } catch {
    document.getElementById(containerId).innerHTML =
      `<div class="empty-state col-12">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Error al cargar productos</div>
        <p>Verifica que el servidor esté corriendo.</p>
      </div>`;
  }
}

// Renderiza los controles de paginación en el elemento nav indicado.
// Muestra botones de página anterior, páginas cercanas a la actual y página siguiente.
// La función irPaginaCat(n) debe estar definida en cada página que use este componente.
function renderPaginacion(navId, totalPages, currentPage) {
  const nav = document.getElementById(navId);
  if (!nav) return;
  const ul = nav.querySelector('ul');
  if (!ul) return;

  if (totalPages <= 1) { nav.classList.add('d-none'); return; }
  nav.classList.remove('d-none');

  let items = '';
  items += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="irPaginaCat(${currentPage - 1});return false;">‹</a>
  </li>`;

  const inicio = Math.max(1, currentPage - 2);
  const fin    = Math.min(totalPages, currentPage + 2);

  if (inicio > 1) {
    items += `<li class="page-item"><a class="page-link" href="#" onclick="irPaginaCat(1);return false;">1</a></li>`;
    if (inicio > 2) items += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }
  for (let i = inicio; i <= fin; i++) {
    items += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="#" onclick="irPaginaCat(${i});return false;">${i}</a>
    </li>`;
  }
  if (fin < totalPages) {
    if (fin < totalPages - 1) items += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    items += `<li class="page-item"><a class="page-link" href="#" onclick="irPaginaCat(${totalPages});return false;">${totalPages}</a></li>`;
  }

  items += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" onclick="irPaginaCat(${currentPage + 1});return false;">›</a>
  </li>`;

  ul.innerHTML = items;
}
