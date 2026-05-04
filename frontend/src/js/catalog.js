/* ── Catalog helpers ── */

const ICONOS = { basquetbol: '🏀', futbol: '⚽', voleibol: '🏐' };

function iconoDeporte(deporte) {
  return ICONOS[deporte] || '🏋️';
}

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
        </div>
      </div>
    </div>`;
}

function mostrarLoading(id) {
  document.getElementById(id).innerHTML =
    `<div class="loading-box col-12"><div class="spinner"></div>Cargando productos…</div>`;
}

function mostrarVacio(id, msg) {
  document.getElementById(id).innerHTML = `
    <div class="empty-state col-12">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">${msg || 'Sin productos'}</div>
      <p>Intenta con otros filtros.</p>
    </div>`;
}

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
