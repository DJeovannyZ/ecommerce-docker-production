# Web Vitals Store — Frontend E-commerce en Next.js

> **Nota:** este directorio forma parte del repositorio
> `ecommerce-docker-production`. Para levantar el ecosistema completo
> (frontend + API + MySQL) usa el `docker-compose.yml` y el `README.md` de la
> raíz del repositorio. Las secciones de Docker de este documento describen el
> flujo original con dos repositorios hermanos y se conservan como referencia
> del proyecto de origen.

Aplicación frontend en **Next.js 16 (App Router)** que consume la API REST del e-commerce
([`ecommerce-laravel`](https://github.com/DJeovannyZ/ecommerce-laravel)) e implementa el flujo de
compra completo: catálogo, autenticación con cookie httpOnly, carrito local, creación de orden,
pago con Stripe y historial de compras.

El foco del proyecto es el **rendimiento** (Web Vitals) y la **resiliencia**: lecturas en Server
Components, mutaciones con Server Actions, caché explícito con tags y revalidación on-demand,
`loading.tsx` / `error.tsx` por segmento y `Suspense` granular.

---

## Stack

| Concern            | Elección                                                                     |
| ------------------ | ---------------------------------------------------------------------------- |
| Framework          | Next.js 16.4 (App Router, Turbopack, Cache Components + Partial Prefetching) |
| Lenguaje           | TypeScript 5 estricto, sin `any`                                             |
| Estilos            | Tailwind CSS 4                                                               |
| Estado del carrito | Zustand 5 + `persist` (localStorage)                                         |
| Datos              | `fetch` server-side sobre la API Laravel (`/api/v1`)                         |
| Mutaciones         | Server Actions + Route Handlers                                              |
| Sesión             | JWT en cookie `httpOnly` (`SameSite=Lax`), gestionada en el servidor         |
| Runtime            | Node 24 · Docker / Docker Compose                                            |

---

## Arquitectura

```text
Navegador ──► Next.js (servidor)  ──►  API Laravel  ──►  MySQL
   │              │                        │
   │              ├── Server Components: catálogo, detalle, historial
   │              ├── Server Actions: login, registro, crear orden, checkout, webhook demo
   │              ├── Route Handlers: /api/auth/*, /api/orders/[id]/payment
   │              └── proxy.ts (ex-middleware): guard de /checkout y /orders
   └── Cookie httpOnly con el JWT (el navegador nunca ve el token)
```

Puntos clave:

- **El token nunca llega al cliente.** Se guarda en una cookie `httpOnly` y solo lo lee el servidor
  (`src/lib/auth/session.ts`). El JavaScript del navegador no puede acceder a ella
  (`document.cookie` queda vacío).
- **Ninguna llamada a la API se hace desde el navegador.** Todo pasa por Server Components,
  Server Actions o Route Handlers, por lo que no se necesita CORS ni variables `NEXT_PUBLIC_*` con
  la URL del API.
- **Caché explícito (Cache Components).** El catálogo usa `use cache` + `cacheLife('minutes')` +
  `cacheTag('products')`. Tras una mutación se invalida con `revalidateTag('products', 'max')` y
  `revalidatePath('/orders')`, de modo que la UI nunca queda desactualizada.
- **Build desacoplado del API.** Las páginas que consumen el API resuelven sus datos en tiempo de
  petición dentro de límites `<Suspense>`, así que `next build` no necesita que el backend esté
  arriba.

---

## Requisitos

- Node.js 24+ y pnpm 11+ (o Docker + Docker Compose).
- El repositorio de la API [`ecommerce-laravel`](https://github.com/DJeovannyZ/ecommerce-laravel)
  clonado **como carpeta hermana** de este repositorio:

```text
workspace/
├── ecommerce-laravel/     # API Laravel 12 (backend)
└── web-vitals-ecommerce/  # este repositorio (frontend)
```

---

## Configuración del entorno (`.env.example`)

```bash
cp .env.example .env
```

| Variable                                                           | Descripción                                                       | Valor por defecto                             |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------- |
| `API_BASE_URL`                                                     | **BASE_URL de la API REST** (host + puerto, sin path)             | `http://localhost:8000`                       |
| `API_PREFIX`                                                       | Prefijo de versionado de la API                                   | `/api/v1`                                     |
| `API_TIMEOUT_MS`                                                   | Timeout por petición al API                                       | `8000`                                        |
| `NEXT_PUBLIC_SITE_URL`                                             | URL pública del frontend (`metadataBase` para SEO)                | `http://localhost:3000`                       |
| `NEXT_PUBLIC_SITE_NAME`                                            | Nombre visible de la tienda                                       | `Web Vitals Store`                            |
| `SESSION_COOKIE_SECURE`                                            | `true` en producción (HTTPS); `false` en localhost                | `false`                                       |
| `DEMO_CHECKOUT_FALLBACK`                                           | Continúa a la confirmación si la API no tiene Stripe configurado  | `true`                                        |
| `API_PATH`                                                         | (Docker) ruta al repositorio de la API                            | `../ecommerce-laravel`                        |
| `FRONTEND_URL`                                                     | (Docker) URL pública usada por la API para los retornos de Stripe | `http://localhost:3000`                       |
| `FRONTEND_PORT` / `API_PORT` / `DB_PORT`                           | (Docker) puertos publicados en el host                            | `3000` / `8000` / `3307`                      |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` / `DB_ROOT_PASSWORD` | (Docker) credenciales de MySQL                                    | `ecommerce` / `ecommerce` / `secret` / `root` |

> En Docker, `API_BASE_URL` se sobrescribe con `http://api:8000` (red interna del compose).

---

## Puesta en marcha

### Opción A — Docker Compose (recomendada)

Levanta **MySQL + API Laravel + frontend** con un solo comando:

```bash
# 1. Clonar ambos repositorios como hermanos
git clone https://github.com/DJeovannyZ/ecommerce-laravel.git
git clone <url-de-este-repo>.git web-vitals-ecommerce
cd web-vitals-ecommerce

# 2. Configurar el entorno del frontend
cp .env.example .env

# 3. Levantar todo
docker compose up -d --build
```

Servicios:

| Servicio | URL                                     | Notas                                                      |
| -------- | --------------------------------------- | ---------------------------------------------------------- |
| Frontend | http://localhost:3000                   | Next.js en modo producción (`output: standalone`)          |
| API      | http://localhost:8000                   | `php artisan serve` con el código montado desde `API_PATH` |
| Swagger  | http://localhost:8000/api/documentation | Documentación interactiva del API                          |
| MySQL    | `localhost:3307`                        | Volumen `mysql-data`                                       |

El contenedor de la API crea `.env` desde `.env.example` si falta, instala Composer, genera
`APP_KEY` / `JWT_SECRET` cuando están vacíos y ejecuta `migrate --seed` (idempotente) en cada
arranque.

Para detener: `docker compose down` (añade `-v` para borrar la base de datos).

### Opción B — Local (API nativa + frontend con pnpm)

```bash
# Terminal 1 — API (sigue las instrucciones del repositorio ecommerce-laravel)
cd ../ecommerce-laravel
docker compose up -d          # MySQL
php artisan migrate --seed
php artisan serve             # http://localhost:8000

# Terminal 2 — Frontend
cd web-vitals-ecommerce
cp .env.example .env
pnpm install
pnpm dev                      # http://localhost:3000
```

Credenciales sembradas por la API:

| Rol     | Email                  | Contraseña |
| ------- | ---------------------- | ---------- |
| Cliente | `customer@example.com` | `password` |
| Admin   | `admin@example.com`    | `password` |

---

## Rutas implementadas

| Ruta                       | Tipo             | Descripción                                                                  |
| -------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `/`                        | Server Component | Portada con destacados (streaming vía `Suspense`)                            |
| `/products`                | Server Component | Catálogo paginado server-side (`?page=N`), caché por tag                     |
| `/products/[id]`           | Server Component | Detalle con `generateMetadata` (title, description, canonical, OG) y JSON-LD |
| `/cart`                    | Client Component | Carrito local (Zustand + persist), alta/baja y cantidades                    |
| `/checkout`                | Server + Client  | Resumen de la orden y disparo del pago (protegida)                           |
| `/checkout/success`        | Server Component | Confirmación y estado del pago (polling + webhook demo)                      |
| `/checkout/cancel`         | Server Component | Pago cancelado                                                               |
| `/orders`                  | Server Component | Historial de compras (protegida)                                             |
| `/login`                   | Server Action    | Inicio de sesión con cookie httpOnly                                         |
| `/register`                | Server Action    | Registro de cliente                                                          |
| `/api/auth/login`          | Route Handler    | Login programático; guarda el JWT en cookie httpOnly                         |
| `/api/auth/register`       | Route Handler    | Registro programático con el mismo contrato                                  |
| `/api/auth/logout`         | Route Handler    | Invalida el token en la API y limpia cookies                                 |
| `/api/orders/[id]/payment` | Route Handler    | Estado del pago para el polling del cliente                                  |

### Endpoints de la API consumidos

| Método | Endpoint                       | Uso en el frontend                                   |
| ------ | ------------------------------ | ---------------------------------------------------- |
| `GET`  | `/api/v1/products`             | Catálogo y destacados (`use cache` + tag `products`) |
| `GET`  | `/api/v1/products/{id}`        | Detalle de producto y metadata SEO                   |
| `POST` | `/api/v1/auth/register`        | Registro (Server Action / Route Handler)             |
| `POST` | `/api/v1/auth/login`           | Login (Server Action / Route Handler)                |
| `GET`  | `/api/v1/auth/me`              | Disponible para extender el perfil                   |
| `POST` | `/api/v1/auth/logout`          | Cierre de sesión                                     |
| `GET`  | `/api/v1/orders`               | Historial de compras                                 |
| `POST` | `/api/v1/orders`               | Creación de la orden desde el carrito                |
| `GET`  | `/api/v1/orders/{id}`          | Verificación de la orden antes de simular el pago    |
| `POST` | `/api/v1/orders/{id}/checkout` | Checkout Session de Stripe                           |
| `GET`  | `/api/v1/orders/{id}/payment`  | Estado del pago (confirmación y polling)             |
| `POST` | `/api/v1/payments/webhook`     | Evento simulado `checkout.session.completed`         |

---

## Pago con Stripe

1. El usuario pulsa **Pagar con Stripe** en `/checkout`.
2. El Server Action `createOrderAndCheckoutAction`:
   - `POST /orders` → crea la orden,
   - guarda la orden pendiente en una cookie httpOnly,
   - `POST /orders/{id}/checkout` → obtiene `checkout_url`,
   - invalida el catálogo (`revalidateTag('products', 'max')`) y el historial,
   - redirige al checkout hospedado de Stripe.
3. Stripe devuelve al usuario a `STRIPE_SUCCESS_URL` (`/checkout/success`) o
   `STRIPE_CANCEL_URL` (`/checkout/cancel`).
4. `/checkout/success` consulta `GET /orders/{id}/payment`, hace polling mientras el pago esté
   `pending` y muestra la confirmación.
5. El botón **Simular webhook de pago confirmado** envía a la API el evento
   `checkout.session.completed` que Stripe dispararía. La API omite la verificación de firma cuando
   `STRIPE_WEBHOOK_SECRET` está vacío, lo que permite demostrar el ciclo `pending → paid` y el
   decremento de stock sin la CLI de Stripe.

### Requisitos para el flujo real

En el `.env` del **repositorio de la API**:

```dotenv
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=            # vacío para permitir el webhook simulado
FRONTEND_URL=http://localhost:3000
STRIPE_SUCCESS_URL="${FRONTEND_URL}/checkout/success"
STRIPE_CANCEL_URL="${FRONTEND_URL}/checkout/cancel"
```

### Modo demo (sin claves de Stripe)

Si la API no tiene claves de Stripe, `POST /orders/{id}/checkout` responde 5xx. Con
`DEMO_CHECKOUT_FALLBACK=true` el checkout **no rompe**: la orden se crea y la app redirige a
`/checkout/success?demo=1`, donde se muestra un aviso explícito de que no hubo redirección a Stripe
y de que no existe una sesión de pago. El botón de webhook simulado queda deshabilitado porque la
API necesita una fila de pago creada por Stripe. Con `DEMO_CHECKOUT_FALLBACK=false` el error del
endpoint se propaga al usuario.

---

## Rendimiento y resiliencia

| Requisito                    | Implementación                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `loading.tsx` en rutas clave | `/products`, `/products/[id]`, `/checkout`, `/orders`                                                                                    |
| `error.tsx` con reintento    | `/` (raíz), `/products`, `/products/[id]`, `/checkout`, `/orders` (usa `retry()`)                                                        |
| `Suspense` granular          | Destacados de la portada, resultados del catálogo, detalle, sección de checkout, historial y cabecera de sesión                          |
| Evitar UI desactualizada     | `revalidateTag('products', 'max')` tras checkout y pago; `revalidatePath('/orders')` y `revalidatePath('/', 'layout')` tras login/logout |
| Imágenes                     | `next/image` con `sizes`, `priority` en el primer viewport y placeholders PNG locales optimizados (AVIF/WebP)                            |
| SEO                          | `metadataBase`, `generateMetadata` por producto, canonical, OpenGraph, JSON-LD y `sitemap`-ready                                         |
| Accesibilidad                | Skip link, landmarks, `aria-live`, foco visible, contraste AA                                                                            |

### Resultado de Lighthouse

Medido sobre el build de producción (`output: standalone`) en Docker, viewport móvil:

| Vista         | Performance | Accessibility | Best Practices | SEO | LCP   | CLS   | TBT   |
| ------------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ----- |
| `/`           | **98**      | 100           | 100            | 100 | 2.3 s | 0     | 10 ms |
| `/products`   | **95**      | 100           | 100            | 100 | 3.0 s | 0     | 20 ms |
| `/products/1` | **97**      | 100           | 100            | 100 | 2.5 s | 0     | 20 ms |
| `/checkout`   | **97**      | 100           | 100            | 60¹ | 2.5 s | 0.001 | 40 ms |

¹ `/checkout` declara `robots: { index: false }` de forma intencional por ser una vista privada.

Los reportes (HTML/PDF) y las capturas de Swagger y del flujo de compra se adjuntan en el documento
de entrega.

---

## Scripts

```bash
pnpm dev         # desarrollo (Turbopack)
pnpm build       # build de producción (standalone)
pnpm start       # servidor de producción
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm format      # Prettier + orden de clases Tailwind
pnpm verify      # format + lint + typecheck + build

node scripts/generate-product-placeholders.mjs   # regenera los placeholders PNG
```

---

## Estructura del proyecto

```text
src/
├── actions/              # Server Actions (auth, orders, payments)
├── app/
│   ├── api/              # Route Handlers (auth, payment polling)
│   ├── cart/             # carrito
│   ├── checkout/         # checkout, success, cancel
│   ├── login/ register/  # autenticación
│   ├── orders/           # historial protegido
│   ├── products/         # catálogo y detalle
│   ├── error.tsx         # error boundary raíz
│   ├── layout.tsx        # layout raíz (header, footer, metadata)
│   └── page.tsx          # portada
├── components/           # UI (catalog, cart, checkout, orders, layout, ui)
├── lib/
│   ├── api/              # cliente HTTP, tipos y capa de datos
│   ├── auth/             # sesión (cookie httpOnly), servicio y guard
│   ├── config.ts         # configuración desde variables de entorno
│   └── format.ts         # formato de moneda y fechas
├── store/cart.ts         # Zustand + persist
└── proxy.ts              # guard de navegación (ex middleware)
docker/api/               # Dockerfile + entrypoint de la API Laravel
```

---

## Decisiones técnicas

- **`proxy.ts` en lugar de `middleware.ts`**: Next.js 16 renombró la convención. Se usa solo para
  redirecciones de navegación; la autorización real se revalida en cada Server Action y Route
  Handler contra la API.
- **Dos superficies de autenticación**: los formularios usan Server Actions y, además, se exponen
  `POST /api/auth/*` como Route Handlers con el mismo contrato (`authenticate()` compartido) para
  uso programático y pruebas con `curl`.
- **`htmlLimitedBots: /.*/`**: fuerza metadata bloqueante para que `<title>` y
  `<meta name="description">` por producto lleguen en el `<head>` del HTML inicial.
- **Placeholders locales**: el seeder de la API entrega `image_url: null`; el frontend resuelve un
  PNG local determinista por producto para que el pipeline de `next/image` tenga trabajo real.

---

## Licencia

MIT.
