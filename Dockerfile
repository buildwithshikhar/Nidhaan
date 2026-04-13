FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    unzip git curl libsqlite3-dev

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN touch /tmp/database.sqlite

RUN php artisan key:generate

RUN php artisan migrate --force

CMD php artisan serve --host=0.0.0.0 --port=$PORT