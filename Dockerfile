FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    git \
    unzip \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

COPY . .

RUN composer dump-autoload --optimize

# Build frontend
RUN npm ci
RUN npm run build

RUN cp .env.example .env || true

RUN touch /var/www/database/database.sqlite

RUN chown -R www-data:www-data \
    /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/database

RUN chmod -R 775 \
    /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/database

RUN chmod 664 /var/www/database/database.sqlite

RUN rm -f /var/www/public/index.html

EXPOSE 80

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
