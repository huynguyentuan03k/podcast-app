# Sử dụng bản chuẩn Debian để chạy được lệnh apt-get mượt mà nhất
FROM php:8.4-fpm

# Cài đặt các extension hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    git \
    unzip \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql pcntl

# Cài đặt Node.js 20 để biên dịch asset frontend
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Kéo Composer từ Image chính thức
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Nạp cấu hình dịch vụ
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/php-fpm/php.ini /usr/local/etc/php/conf.d/php.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN rm -f /etc/nginx/sites-enabled/default

WORKDIR /var/www

# ==========================================
# TỐI ƯU CACHE LAYER 1: Cài đặt PHP Packages
# ==========================================
COPY composer.json composer.lock ./
COPY modules/frieren-core ./modules/frieren-core
RUN composer install --no-dev --no-autoloader --no-scripts

# ==========================================
# TỐI ƯU CACHE LAYER 2: Cài đặt NodeJS (Chỉ cài, chưa build)
# ==========================================
COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm ci; fi

# ==========================================
# HOÀN THIỆN: Copy toàn bộ mã nguồn còn lại vào Container
# ==========================================
COPY . .

# ==========================================
# BIÊN DỊCH FRONTEND VÀ AUTOLOAD (Khi đã đầy đủ code)
# ==========================================
# 1. Chạy build Vite tại đây để bảo đảm có đầy đủ file trong thư mục resources/
RUN if [ -f package.json ]; then npm run build; fi

# 2. Xóa các file cache cũ đi kèm theo code
RUN rm -f bootstrap/cache/*.php

# 3. Chạy tối ưu autoload sinh classmap cho PHP
RUN composer dump-autoload --optimize

# Khởi tạo SQLite phòng hờ
RUN mkdir -p /var/www/database && touch /var/www/database/database.sqlite

# Phân quyền sở hữu ban đầu cho hệ thống
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

RUN rm -f /var/www/public/index.html

EXPOSE 80

# Cấu hình Entrypoint điều hướng khởi động
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
