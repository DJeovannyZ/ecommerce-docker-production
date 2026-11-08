# E-commerce API

> **Nota:** este directorio forma parte del repositorio
> `ecommerce-docker-production`. Para levantar el ecosistema completo
> (frontend + API + MySQL) usa el `docker-compose.yml` y el `README.md` de la
> raíz. Las instrucciones de este documento describen el flujo de desarrollo
> original (MySQL local y `php artisan serve`).

A REST API for a basic e-commerce store built with **Laravel 12** and **PHP 8.2+**. It covers the full purchase flow: customer registration, product catalog browsing, order creation and secure payment processing through **Stripe**. Every endpoint is documented with **Swagger / OpenAPI**.

## Features

- Customer registration and authentication with **JWT** tokens.
- Public product catalog with pagination.
- Admin-only product management (`create`, `update`, `delete`) enforced through roles and permissions.
- Order creation from catalog products with stock and availability validation.
- Per-user purchase history.
- Stripe **Checkout Sessions** integration and signed webhook processing.
- Consistent JSON success and error responses.
- Automated feature test suite with **Pest**.

## Tech stack

| Concern           | Choice                                  |
| ----------------- | --------------------------------------- |
| Framework         | Laravel 12                              |
| Language          | PHP 8.2+ (tested on PHP 8.5)            |
| Database          | MySQL 8.4 (via Docker Compose)          |
| Authentication    | `php-open-source-saver/jwt-auth`        |
| Authorization     | `spatie/laravel-permission`             |
| API documentation | `darkaonline/l5-swagger`                |
| Payments          | `stripe/stripe-php` (Checkout Sessions) |
| Testing           | Pest 3                                  |

## Requirements

- PHP 8.2 or higher with the `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo` and `sodium` extensions.
    - `ext-sodium` is required by the JWT library. Install the matching system package if it is missing (`php-sodium` on Arch, `php8.x-sodium` on Debian/Ubuntu, `php-sodium` on Alpine).
- Composer 2.
- Docker and Docker Compose (used only to run MySQL).

## Getting started

```bash
# 1. Clone the repository
git clone <repository-url>
cd ecommerce-laravel

# 2. Install PHP dependencies
composer install

# 3. Create the environment file and application key
cp .env.example .env
php artisan key:generate

# 4. Generate the JWT secret
php artisan jwt:secret

# 5. Start MySQL (Docker Compose runs the database only)
docker compose up -d

# 6. Create the schema and load sample data
php artisan migrate --seed

# 7. Serve the application
php artisan serve
```

The API is then available at `http://localhost:8000` and the interactive documentation at:

- Swagger UI: `http://localhost:8000/api/documentation`
- OpenAPI JSON: `http://localhost:8000/docs`

The database container is defined in `docker-compose.yml` and reads its credentials from your `.env` file. Application code always runs through `php artisan` (or any PHP server), so you can develop without rebuilding containers.

## Environment variables

Key variables from `.env.example`:

| Variable                                   | Description                                                  | Default                 |
| ------------------------------------------ | ------------------------------------------------------------ | ----------------------- |
| `APP_URL`                                  | Base URL of the application                                  | `http://localhost:8000` |
| `DB_CONNECTION`                            | Database driver                                              | `mysql`                 |
| `DB_HOST` / `DB_PORT`                      | MySQL host and port                                          | `127.0.0.1` / `3306`    |
| `DB_DATABASE`                              | Database name                                                | `ecommerce`             |
| `DB_USERNAME` / `DB_PASSWORD`              | Database credentials                                         | `ecommerce` / `secret`  |
| `DB_ROOT_PASSWORD`                         | MySQL root password (used by Docker Compose)                 | `root`                  |
| `JWT_SECRET`                               | JWT signing secret (generated with `php artisan jwt:secret`) | —                       |
| `JWT_TTL`                                  | Access token lifetime in minutes                             | `60`                    |
| `JWT_REFRESH_TTL`                          | Refresh window in minutes                                    | `20160`                 |
| `STRIPE_KEY` / `STRIPE_SECRET`             | Stripe API keys (test mode recommended)                      | —                       |
| `STRIPE_WEBHOOK_SECRET`                    | Stripe webhook signing secret                                | —                       |
| `STRIPE_CURRENCY`                          | ISO currency code                                            | `usd`                   |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | Redirect URLs after checkout                                 | —                       |
| `TAX_RATE`                                 | Decimal tax rate applied to the subtotal                     | `0`                     |
| `L5_SWAGGER_GENERATE_ALWAYS`               | Regenerate the OpenAPI spec on demand                        | `true`                  |

## Seeded credentials

Running `php artisan migrate --seed` creates two demo accounts and ten sample products:

| Role     | Email                  | Password   |
| -------- | ---------------------- | ---------- |
| Admin    | `admin@example.com`    | `password` |
| Customer | `customer@example.com` | `password` |

The admin user is assigned the `admin` role, which grants the `create products`, `update products`, `delete products` and `view orders` permissions. Newly registered users receive the `customer` role.

## API overview

Base path: `/api/v1`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint         | Access        | Description                          |
| ------ | ---------------- | ------------- | ------------------------------------ |
| `POST` | `/auth/register` | Public        | Register a customer and return a JWT |
| `POST` | `/auth/login`    | Public        | Authenticate and return a JWT        |
| `GET`  | `/auth/me`       | Authenticated | Return the current user              |
| `POST` | `/auth/logout`   | Authenticated | Invalidate the current token         |
| `POST` | `/auth/refresh`  | Authenticated | Refresh the current token            |

### Products

| Method      | Endpoint              | Access | Description                       |
| ----------- | --------------------- | ------ | --------------------------------- |
| `GET`       | `/products`           | Public | Paginated list of active products |
| `GET`       | `/products/{product}` | Public | Product detail                    |
| `POST`      | `/products`           | Admin  | Create a product                  |
| `PUT/PATCH` | `/products/{product}` | Admin  | Update a product                  |
| `DELETE`    | `/products/{product}` | Admin  | Delete a product                  |

### Orders

| Method | Endpoint          | Access        | Description                               |
| ------ | ----------------- | ------------- | ----------------------------------------- |
| `GET`  | `/orders`         | Authenticated | Purchase history (admins see every order) |
| `POST` | `/orders`         | Authenticated | Create an order from catalog items        |
| `GET`  | `/orders/{order}` | Owner / Admin | Order detail                              |

### Payments

| Method | Endpoint                   | Access        | Description                        |
| ------ | -------------------------- | ------------- | ---------------------------------- |
| `POST` | `/orders/{order}/checkout` | Owner / Admin | Create a Stripe Checkout Session   |
| `GET`  | `/orders/{order}/payment`  | Owner / Admin | Payment status of an order         |
| `POST` | `/payments/webhook`        | Stripe        | Webhook receiver for Stripe events |

## Example request

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Create an order using the returned token
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"items": [{"product_id": 1, "quantity": 2}]}'

# Start a Stripe checkout for the order
curl -X POST http://localhost:8000/api/v1/orders/1/checkout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <access_token>"
```

### Response format

Successful responses:

```json
{
    "success": true,
    "message": "Order created.",
    "data": { "...": "..." }
}
```

Error responses:

```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": { "items": ["The items field is required."] },
    "code": "VALIDATION_ERROR"
}
```

## Stripe setup

1. Create a Stripe account and copy the **test** keys from the dashboard into `STRIPE_KEY` and `STRIPE_SECRET`.
2. For local webhook testing, use the Stripe CLI:

    ```bash
    stripe listen --forward-to localhost:8000/api/v1/payments/webhook
    ```

    Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

3. Set `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` to the frontend routes that should handle the result (defaults point to API endpoints).

When `STRIPE_WEBHOOK_SECRET` is empty, signature verification is skipped so local development and tests can post events without a Stripe account. Always configure the secret in production.

Payment lifecycle:

1. `POST /orders/{order}/checkout` creates a Checkout Session and a `pending` payment.
2. The customer pays on Stripe's hosted page.
3. Stripe calls `POST /payments/webhook` with `checkout.session.completed`; the API marks the payment and order as `paid` and decrements stock.
4. `checkout.session.expired` and `payment_intent.payment_failed` mark the payment as `failed`.

## Frontend integration (Next.js)

This API is consumed by a separate Next.js 16 (App Router) frontend that implements the full
purchase flow. The contract between both repositories is:

1. `FRONTEND_URL` points at the frontend origin (`http://localhost:3000` by default) and is used
   to build the Stripe return URLs:
    - `STRIPE_SUCCESS_URL="${FRONTEND_URL}/checkout/success"`
    - `STRIPE_CANCEL_URL="${FRONTEND_URL}/checkout/cancel"`
2. `POST /api/v1/orders/{order}/checkout` returns `checkout_url` and Stripe appends
   `?session_id={CHECKOUT_SESSION_ID}` to the success URL, so the frontend can display the payment
   status of the order.
3. No CORS configuration is required: the frontend performs every call server-side (Server
   Components and Server Actions) and keeps the JWT in an httpOnly cookie, so the browser never
   talks to this API directly.
4. When `STRIPE_WEBHOOK_SECRET` is empty, signature verification is skipped
   (`StripePaymentService::parseEvent`). That allows injecting a `checkout.session.completed` event
   without the Stripe CLI to demonstrate the `pending` to `paid` transition locally. Always set the
   secret in production.

## Testing

The feature suite runs against an in-memory SQLite database and covers authentication, products, orders and payments:

```bash
php artisan test
# or
./vendor/bin/pest
```

## Code formatting

Formatting is enforced with Laravel Pint:

```bash
./vendor/bin/pint
```

## Project structure

```
app/
├── Data/                # Read-only data transfer objects
├── Enums/               # Order and payment status enums
├── Exceptions/          # Domain exceptions and JSON rendering
├── Http/
│   ├── Controllers/Api/ # API controllers
│   ├── Requests/        # Form request validation
│   └── Resources/       # API resources
├── Models/              # Eloquent models
├── OpenApi/             # Swagger/OpenAPI annotations
├── Policies/            # Authorization policies
├── Services/            # Order and Stripe payment services
└── Support/             # ApiResponse helper
database/
├── factories/           # Model factories
├── migrations/          # Schema migrations
└── seeders/             # Roles, users and product seeders
routes/
├── api.php              # API entry point
├── auth.php             # Authentication routes
├── product.php          # Product routes
├── order.php            # Order routes
└── payment.php          # Payment routes
```

## Branching model

This repository follows **git-flow**:

- `main` — stable, released code.
- `develop` — integration branch.
- `feature/*`, `fix/*`, `docs/*` — short-lived branches merged into `develop`.

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).
