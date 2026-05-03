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
        ${img}
        <div class="product-card-body">
          <div class="product-card-meta">${p.deporte} &middot; ${p.categoria}</div>
          <div class="product-card-name">${p.nombre}</div>
          <div class="product-card-brand">${p.marca || ''}</div>
          <div class="product-card-price">$${p.precio.toLocaleString('es-MX')}</div>
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

async function cargarProductos(containerId, params) {
  mostrarLoading(containerId);
  try {
    const lista = await productosAPI.getAll(params);
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
