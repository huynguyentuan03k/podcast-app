FROM php:8.2-fpm

# Cài PHP extension
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    git \
    unzip \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql

# Cài Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy nginx config
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www

# Copy composer files
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

# Copy code
COPY . .

# Hoàn tất composer
RUN composer dump-autoload --optimize

# Setup Laravel
RUN cp .env.example .env || true

# Tạo database SQLite
RUN touch /var/www/database/database.sqlite

# Phân quyền CHO CẢ THƯ MỤC VÀ FILE
RUN chown -R www-data:www-data \
    /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/database

RUN chmod -R 775 \
    /var/www/storage \
    /var/www/bootstrap/cache \
    /var/www/database

RUN chmod 664 /var/www/database/database.sqlite

# Xóa index.html nếu có
RUN rm -f /var/www/public/index.html

EXPOSE 80

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
