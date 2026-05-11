# Sports E-commerce

Aplicación web de venta de productos deportivos. Permite a los usuarios navegar el catálogo completo de más de 40 artículos organizados por deporte y categoría, gestionar su carrito de compras, lista de deseos, realizar pedidos y consultar su historial de compras. Los administradores cuentan con un panel para gestionar productos (incluyendo imágenes), usuarios, órdenes y métricas de ventas.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js, Express 5 |
| Autenticación | JWT (jsonwebtoken), bcryptjs |
| Frontend | HTML, CSS, JavaScript vanilla |
| Almacenamiento | Archivos JSON (sin base de datos) |
| Subida de archivos | multer |
| Dev tooling | nodemon, dotenv |

---

## Cómo iniciar el proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

### Instalación

1. Instala las dependencias del backend:

```bash
cd backend
npm install
```

2. Crea el archivo `.env` dentro de la carpeta `backend` basándote en `.env.example`:

```bash
# Linux/Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

3. Edita `.env` y define tu propia `JWT_SECRET`.

### Arrancar el servidor

Desde la carpeta `backend`:

```bash
# Modo desarrollo — reinicia automáticamente al guardar cambios
npm run dev

# Modo producción
npm start
```

El servidor queda disponible en `http://localhost:3000`.

### Páginas disponibles

| Página | URL |
|--------|-----|
| Inicio / Catálogo | `http://localhost:3000` |
| Login / Registro | `http://localhost:3000/pages/login.html` |
| Búsqueda | `http://localhost:3000/pages/busqueda.html` |
| Detalle de producto | `http://localhost:3000/pages/producto.html` |
| Carrito | `http://localhost:3000/pages/cart.html` |
| Checkout | `http://localhost:3000/pages/checkout.html` |
| Lista de deseos | `http://localhost:3000/pages/wishlist.html` |
| Mis pedidos | `http://localhost:3000/pages/pedidos.html` |
| Mi perfil | `http://localhost:3000/pages/perfil.html` |
| Panel Admin | `http://localhost:3000/pages/admin.html` |

---

## Credenciales de administrador

```
Email:    admin@sports.com
Password: admin123
```

---

## Estructura del proyecto

```
proyecto/
├── backend/
│   ├── .env.example
│   ├── server.js               # Punto de entrada del servidor
│   ├── package.json
│   ├── data/                   # Almacenamiento JSON
│   │   ├── usuarios.json
│   │   ├── productos.json
│   │   ├── carritos.json
│   │   ├── ventas.json
│   │   └── deseos.json
│   └── src/
│       ├── controllers/        # Lógica de negocio
│       │   ├── user.controller.js
│       │   ├── usuario.controller.js
│       │   ├── producto.controller.js
│       │   ├── carrito.controller.js
│       │   ├── venta.controller.js
│       │   └── deseos.controller.js
│       ├── routes/             # Definición de rutas
│       │   ├── user.routes.js
│       │   ├── usuario.routes.js
│       │   ├── producto.routes.js
│       │   ├── carrito.routes.js
│       │   ├── venta.routes.js
│       │   └── deseos.routes.js
│       ├── middlewares/
│       │   └── auth.middleware.js   # Verificación JWT y rol admin
│       └── utils/
│           └── jsonDB.js            # Lectura/escritura de archivos JSON
└── frontend/
    ├── index.html              # Página principal
    ├── pages/
    │   ├── login.html
    │   ├── busqueda.html
    │   ├── producto.html
    │   ├── cart.html
    │   ├── checkout.html
    │   ├── wishlist.html
    │   ├── perfil.html
    │   ├── pedidos.html
    │   ├── admin.html
    │   └── categorias/
    │       ├── futbol.html
    │       ├── basquetbol.html
    │       ├── voleibol.html
    │       ├── tenis.html
    │       ├── running.html
    │       ├── training.html
    │       └── lifestyle.html
    └── src/
        ├── css/
        │   └── styles.css
        ├── js/
        │   ├── api.js          # Utilidad de comunicación con el backend
        │   ├── auth.js         # Manejo de sesión y tokens
        │   ├── cart.js         # Lógica del carrito
        │   └── catalog.js      # Filtros y renderizado del catálogo
        └── assets/             # Imágenes de productos y categorías
```

---

## API Endpoints

### Autenticación — `/api/auth`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión, devuelve JWT |

### Productos — `/api/productos`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/productos` | Público | Listar productos (soporta filtros y paginación) |
| GET | `/api/productos?deporte=futbol` | Público | Filtrar por deporte |
| GET | `/api/productos?categoria=calzado` | Público | Filtrar por categoría |
| GET | `/api/productos?marca=nike` | Público | Filtrar por marca |
| GET | `/api/productos?destacado=true` | Público | Filtrar destacados |
| GET | `/api/productos?q=texto` | Público | Buscar por nombre, marca o descripción |
| GET | `/api/productos/:id` | Público | Obtener producto por ID |
| POST | `/api/productos` | Admin | Crear producto |
| PUT | `/api/productos/:id` | Admin | Actualizar producto |
| DELETE | `/api/productos/:id` | Admin | Eliminar producto |
| POST | `/api/productos/imagen` | Admin | Subir imagen de producto (multipart/form-data) |

### Usuarios — `/api/usuarios`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/usuarios` | Admin | Listar todos los usuarios |
| POST | `/api/usuarios` | Admin | Crear usuario manualmente |
| DELETE | `/api/usuarios/:id` | Admin | Eliminar usuario |
| PATCH | `/api/usuarios/:id/rol` | Admin | Cambiar rol (usuario/admin) |
| PUT | `/api/usuarios/perfil` | Autenticado | Actualizar nombre/email propios |
| PUT | `/api/usuarios/password` | Autenticado | Cambiar contraseña |

### Carrito — `/api/carrito`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/carrito` | Autenticado | Obtener carrito con totales |
| POST | `/api/carrito` | Autenticado | Agregar producto al carrito |
| PUT | `/api/carrito/:productoId` | Autenticado | Actualizar cantidad de un ítem |
| DELETE | `/api/carrito/:productoId` | Autenticado | Eliminar ítem del carrito |
| DELETE | `/api/carrito` | Autenticado | Vaciar carrito completo |

### Ventas / Pedidos — `/api/ventas`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/ventas` | Autenticado | Confirmar compra (descuenta stock) |
| GET | `/api/ventas` | Admin | Ver todas las ventas |
| GET | `/api/ventas/mis-ventas` | Autenticado | Ver historial de compras propio |
| GET | `/api/ventas/:id` | Autenticado | Ver detalle de un pedido |
| PATCH | `/api/ventas/:id/cancelar` | Autenticado | Cancelar pedido propio (solo si está en `pendiente`) |
| PATCH | `/api/ventas/:id/estatus` | Admin | Cambiar estatus del pedido |
| GET | `/api/ventas/metricas` | Admin | Métricas: ingresos, top productos, ventas por deporte |

> **Estatus posibles de un pedido:** `pendiente` → `procesando` → `enviado` → `entregado` / `cancelado`

### Lista de deseos — `/api/deseos`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/deseos` | Autenticado | Obtener lista de deseos propia |
| POST | `/api/deseos` | Autenticado | Agregar producto a la lista de deseos |
| DELETE | `/api/deseos/:productoId` | Autenticado | Eliminar producto de la lista de deseos |

---

## Equipo

- **Pedro** 
- **Alex** 



## Mensaje sobre coleccion de postman

Los tokens que se usan en postman para las llamadas  a la api no funcionaran debido a que expiran cada 8horas, los tokens JWT tienen tiempo de expiración y lo configuramos cada 8 horas. 
---
