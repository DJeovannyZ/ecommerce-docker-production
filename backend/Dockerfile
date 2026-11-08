# syntax=docker/dockerfile:1.7

# =============================================================================
# API Laravel 12 - imagen de produccion (PHP-FPM + Nginx)
#
# Etapas:
#   php-builder -> compila las extensiones PHP necesarias (y queda como base
#                  para las etapas de Composer)
#   vendor      -> instala dependencias de Composer con cache de BuildKit
#   app         -> copia el codigo y genera el autoload optimizado
#   runtime     -> imagen final limpia (sin compiladores), Nginx + PHP-FPM
#
# La consigna recomienda php:8.2-fpm-alpine, pero el composer.lock actual
# resuelve paquetes Symfony 8.1 que exigen PHP >= 8.4.1 (ademas de jwt-auth
# y spatie/laravel-permission, que exigen PHP >= 8.3). Por eso se usa PHP 8.4,
# que sigue cumpliendo el requisito "PHP 8.2+".
# =============================================================================

ARG PHP_VERSION=8.4

# --- Etapa 1: extensiones PHP ----------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS php-builder

# Dependencias de compilacion. Esta etapa no llega a produccion: la imagen
# final copia solo los .so compilados y las librerias runtime.
RUN apk add --no-cache --virtual .build-deps \
      $PHPIZE_DEPS \
      oniguruma-dev \
      libxml2-dev \
      libsodium-dev \
      curl-dev \
  && docker-php-ext-install -j"$(nproc)" \
      pdo_mysql \
      mbstring \
      bcmath \
      sodium \
      curl \
      dom \
      opcache

# --- Etapa 2: dependencias de Composer -------------------------------------
# Solo se copian manifiestos + lockfile: si el codigo cambia, esta capa sigue
# cacheada y `composer install` no se repite.
FROM php-builder AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache composer install \
      --no-dev \
      --no-interaction \
      --prefer-dist \
      --no-progress \
      --no-scripts \
      --no-autoloader

# --- Etapa 3: aplicacion ----------------------------------------------------
# Une codigo + vendor y genera un autoloader optimizado para produccion.
FROM php-builder AS app
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app
COPY . .
COPY --from=vendor /app/vendor ./vendor
RUN composer dump-autoload --no-dev --optimize --no-interaction --no-scripts \
  && php artisan package:discover --ansi \
  && mkdir -p \
       storage/framework/cache/data \
       storage/framework/sessions \
       storage/framework/views \
       storage/logs \
       storage/api-docs \
       bootstrap/cache \
  && chown -R www-data:www-data storage bootstrap/cache

# --- Etapa 4: runtime -------------------------------------------------------
# Imagen limpia: sin toolchain de compilacion, solo Nginx, PHP-FPM, supervisor
# y las librerias compartidas que necesitan las extensiones copiadas.
FROM php:${PHP_VERSION}-fpm-alpine AS runtime

RUN apk add --no-cache \
      nginx \
      supervisor \
      su-exec \
      libsodium \
      oniguruma \
      libxml2 \
      curl

# Extensiones compiladas en php-builder.
COPY --from=php-builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=php-builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Configuracion de PHP, PHP-FPM, Nginx y supervisor.
RUN rm -f /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/00-app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint-app
RUN chmod +x /usr/local/bin/docker-entrypoint-app

WORKDIR /var/www/html

# El codigo se copia al final para maximizar la reutilizacion de capas.
COPY --from=app /app /var/www/html
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:8000/up || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-app"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
