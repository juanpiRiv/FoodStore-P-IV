# Food Store

Trabajo Práctico Integrador de Programación 4 (UTN, Tecnicatura Universitaria en Programación a Distancia). Es una aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman el carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Autor:** Juan Pablo Rivero Albornoz
- **Repositorio:** <https://github.com/juanpiRiv/FoodStore-P-IV>
- **Video de demostración (10 a 15 min):** <https://youtu.be/4FqPN5Hmd3g>

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Backend | FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose), bcrypt (passlib) |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios |

El backend está organizado en capas por dominio: Router, Service, Unit of Work, Repository y Model. El commit se hace solo en `UnitOfWork.__exit__`. El frontend se organiza por features que reflejan los módulos del backend.

## Requisitos

- Python 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- PostgreSQL 15 o superior (para desarrollo también sirve SQLite cambiando `DATABASE_URL`)
- Node.js 20.19 o superior y pnpm 9 o superior

## Inicio rápido

Se necesitan dos terminales, una para el backend y otra para el frontend. Los detalles de cada paso están en las secciones siguientes.

| Paso | Terminal 1: backend (`backend/`) | Terminal 2: frontend (`frontend/`) |
|------|----------------------------------|------------------------------------|
| 1. Entorno | `createdb foodstore_db`, `python -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt` | `pnpm install` |
| 2. Variables | `cp .env.example .env` y ajustar `DATABASE_URL` y `SECRET_KEY` | `cp .env.example .env` |
| 3. Datos | `python -m app.db.seed` | |
| 4. Ejecución | `uvicorn app.main:app --reload` (puerto 8000) | `pnpm dev` (puerto 5173) |

Luego abrir <http://localhost:5173> e ingresar con `admin` / `Admin1234!`, o registrar un cliente nuevo desde `/register`. La documentación de la API está en <http://localhost:8000/docs>.

### Problemas frecuentes

| Síntoma | Causa y solución |
|---------|------------------|
| `role "user" does not exist` al correr el seed | `DATABASE_URL` conserva los valores de ejemplo (`user:pass`). Reemplazarlos por el usuario real de PostgreSQL, por ejemplo `postgresql://mi_usuario@localhost:5432/foodstore_db` (con `:contraseña` si el usuario la tiene). |
| El login falla sin mensaje claro | El frontend se levantó en otro puerto (por ejemplo 5174) porque el 5173 estaba ocupado, y CORS rechaza el origen. Liberar el 5173 (`lsof -nP -iTCP:5173 -sTCP:LISTEN`) o ejecutar `pnpm dev --port 5173 --strictPort`. |
| `createdb: database "foodstore_db" already exists` | La base ya fue creada; omitir ese paso. Para empezar de cero: `dropdb foodstore_db && createdb foodstore_db` y volver a correr el seed. |
| Error al instalar dependencias de Python | Verificar la versión con `python --version`: se requiere 3.11 a 3.13. |
| Las imágenes de los productos se ven en blanco | Las imágenes son URLs externas (`placehold.co`); se necesita conexión a internet. |

## Backend (`backend/`)

```bash
cd backend
createdb foodstore_db              # una sola vez; crea la base vacía
python -m venv .venv
source .venv/bin/activate          # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # después editá SECRET_KEY y DATABASE_URL
python -m app.db.seed              # idempotente: crea el admin, las categorías y los productos
uvicorn app.main:app --reload
```

La API queda en <http://localhost:8000/api/v1>. La documentación interactiva está en <http://localhost:8000/docs> y <http://localhost:8000/redoc>.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Clave para firmar el JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### Usuario del seed

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `Admin1234!` | `admin` |

El seed también carga 4 categorías y 8 productos con stock. Cualquier otra cuenta se crea desde la pantalla de registro con rol `user`.

## Frontend (`frontend/`)

```bash
cd frontend
cp .env.example .env               # VITE_API_URL=http://localhost:8000/api/v1
pnpm install
pnpm build                         # verifica los tipos y compila
pnpm dev
```

La aplicación abre en <http://localhost:5173>. Conviene levantar primero el backend. El frontend tiene que correr en el puerto 5173, que es el origen que el backend permite por CORS.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Rutas

| Ruta | Acceso |
|------|--------|
| `/login`, `/register`, `/`, `/carrito`, `/unauthorized` | Público |
| `/checkout`, `/mis-pedidos` | Con sesión |
| `/admin/resumen`, `/admin/categorias`, `/admin/productos`, `/admin/pedidos`, `/admin/usuarios` | Rol `admin` |

## Reglas de negocio (resumen)

- El pedido se crea en una sola transacción: por cada ítem se verifica y descuenta el stock, la línea copia el nombre y el precio del producto, y el total queda fijo.
- Estados del pedido: `PENDIENTE` pasa a `EN_PREPARACION` o `CANCELADO`; `EN_PREPARACION` pasa a `ENTREGADO` o `CANCELADO`; los dos últimos son terminales. Una transición inválida responde 400.
- Cancelar un pedido devuelve el stock de todas sus líneas en la misma transacción. El cliente solo puede cancelar sus propios pedidos y únicamente mientras estén en `PENDIENTE`.
- Los pedidos no se borran. Categorías, productos y usuarios tienen baja lógica.
