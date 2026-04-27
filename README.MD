# Sports E-commerce

Aplicación web de venta de productos deportivos. Permite a los usuarios navegar el catálogo, filtrar por deporte o categoría y gestionar su carrito de compras. Los administradores pueden gestionar productos y ver métricas de ventas.

## Tecnologías

- **Backend:** Node.js, Express 5, JWT, bcryptjs
- **Frontend:** HTML, CSS, JavaScript vanilla
- **Almacenamiento:** Archivos JSON

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

## Instalación

1. Instala las dependencias del backend:

```bash
cd backend
npm install
```

2. Crea el archivo `.env` dentro de la carpeta `backend` basándote en `.env.example`:

```bash
cp .env.example .env
```

Luego edita `.env` y pon tu propia `JWT_SECRET`.

## Correr el proyecto

Desde la carpeta `backend`:

```bash
# Modo desarrollo (reinicia automáticamente al guardar cambios)
npm run dev

# Modo producción
npm start
```

El servidor quedará corriendo en `http://localhost:3000`.

## Uso

Abre tu navegador y ve a:

| Página | URL |
|--------|-----|
| Inicio | `http://localhost:3000` |
| Login / Registro | `http://localhost:3000/pages/login.html` |
| Carrito | `http://localhost:3000/pages/cart.html` |
| Panel Admin | `http://localhost:3000/pages/admin.html` |

## Credenciales de administrador

```
Email:    admin@sports.com
Password: admin123
```

## Estructura del proyecto

```
Sports_E-commerce/
├── backend/
│   ├── data/               # Almacenamiento JSON
│   │   ├── productos.json
│   │   ├── usuarios.json
│   │   ├── pedidos.json
│   │   └── carrito.json
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middlewares/    # Autenticación y roles
│   │   ├── routes/         # Endpoints de la API
│   │   └── utils/          # Helpers (lectura/escritura JSON)
│   └── server.js           # Entrada principal
└── frontend/
    ├── index.html          # Página principal
    ├── pages/              # Resto de páginas
    └── src/
        ├── css/
        ├── js/
        └── assets/
```

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Productos
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/productos` | Público | Obtener todos los productos |
| GET | `/api/productos?deporte=futbol` | Público | Filtrar por deporte |
| GET | `/api/productos?categoria=calzado` | Público | Filtrar por categoría |
| GET | `/api/productos/:id` | Público | Obtener producto por ID |
| POST | `/api/productos` | Admin | Crear producto |
| PUT | `/api/productos/:id` | Admin | Actualizar producto |
| DELETE | `/api/productos/:id` | Admin | Eliminar producto |

## Equipo

- **Pedro** — Módulo de usuarios, autenticación y ventas
- **Alex** — Módulo de catálogo e inventarios
