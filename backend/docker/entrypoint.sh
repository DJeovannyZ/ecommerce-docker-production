#!/bin/sh
# =============================================================================
# Entrypoint de la API Laravel
#
# 1. Genera APP_KEY / JWT_SECRET efimeros si no se inyectaron (solo demo).
# 2. Cachea la configuracion con las variables reales del contenedor.
# 3. Espera a MySQL y aplica migraciones (y seed opcional).
# 4. Genera la documentacion OpenAPI una sola vez.
# 5. Arranca supervisord (Nginx + PHP-FPM).
#
# Las variables de entorno de Docker Compose tienen prioridad porque Laravel
# lee el entorno del proceso; no se usa ningun archivo .env dentro de la imagen.
# =============================================================================
set -eu

cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
  echo "[entrypoint] APP_KEY no definido: generando clave efimera."
  echo "[entrypoint] En produccion define APP_KEY y JWT_SECRET en el .env."
  APP_KEY="base64:$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
  export APP_KEY
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "[entrypoint] JWT_SECRET no definido: generando secreto efimero."
  JWT_SECRET="$(head -c 48 /dev/urandom | base64 | tr -d '\n')"
  export JWT_SECRET
fi

echo "[entrypoint] Cacheando configuracion..."
su-exec www-data php artisan config:cache --no-interaction

echo "[entrypoint] Esperando a MySQL y aplicando migraciones..."
attempt=1
max_attempts="${DB_WAIT_ATTEMPTS:-30}"
until su-exec www-data php artisan migrate --force --no-interaction; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "[entrypoint] MySQL no respondio tras ${max_attempts} intentos." >&2
    exit 1
  fi
  echo "[entrypoint] MySQL no disponible (intento ${attempt}/${max_attempts}); reintentando en 2s..."
  attempt=$((attempt + 1))
  sleep 2
done

if [ "${RUN_SEEDER:-true}" = "true" ]; then
  echo "[entrypoint] Ejecutando seeders (idempotentes)..."
  su-exec www-data php artisan db:seed --force --no-interaction
fi

echo "[entrypoint] Generando documentacion OpenAPI..."
su-exec www-data php artisan l5-swagger:generate --no-interaction \
  || echo "[entrypoint] Aviso: no se pudo generar Swagger; se reintentara en la peticion."

echo "[entrypoint] Arrancando Nginx + PHP-FPM en 0.0.0.0:8000..."
exec "$@"
