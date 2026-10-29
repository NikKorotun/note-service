FROM php:8.4-fpm-alpine

ARG UID=1000
ARG GID=1000

RUN apk add --no-cache \
        git \
        unzip \
        icu-libs \
        libzip \
        postgresql-libs \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libzip-dev \
        postgresql-dev \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        intl \
        zip \
        bcmath \
        opcache \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY php.ini /usr/local/etc/php/conf.d/zz-app.ini

# Запускаем fpm от пользователя с UID/GID хоста
RUN apk add --no-cache shadow \
    && usermod -o -u "${UID}" www-data \
    && groupmod -o -g "${GID}" www-data \
    && apk del shadow

WORKDIR /data

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
