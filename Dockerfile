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
COPY docker/php-fpm/php.ini /usr/local/etc/php/conf.d/php.ini

RUN rm -f /etc/nginx/sites-enabled/default

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www

# =========================================================================
# FIX CHÍ MẠNG 1: Copy thư mục code nguồn của module frieren/core vào container
# (Hãy đảm bảo thư mục "frieren-core" này nằm trong thư mục git bạn đẩy lên)
# =========================================================================
COPY frieren-core /var/core

COPY composer.json composer.lock ./

# Khởi chạy cài đặt các package (Bỏ cờ --no-scripts để composer tự tạo package-discover)
RUN composer install --no-dev --no-autoloader --no-scripts

COPY . .

RUN rm -f bootstrap/cache/*.php

# Cho phép dump-autoload chạy bình thường để Laravel ghi nhận Auto-discovery của module core
RUN composer dump-autoload --optimize

# Build frontend
RUN npm ci
RUN npm run build

# =========================================================================
# FIX CHÍ MẠNG 2: XÓA BỎ LỆNH COPY .env.example đè ở cuối.
# Dokku sẽ tự động mount file .env xịn qua biến cấu hình của nó khi chạy ứng dụng.
# =========================================================================

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
