FROM php:8.4-fpm-alpine

# Cài đặt các extension hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    nginx \
    libpq-dev \
    git \
    unzip \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql

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

# TỐI ƯU CACHE: Copy file dependencies trước
COPY composer.json composer.lock ./

# Chỉ cài package, không chạy script ở bước này để tối ưu cache layer [cite: 90]
RUN composer install --no-dev --no-autoloader --no-scripts

# Copy toàn bộ mã nguồn còn lại vào Container [cite: 91]
COPY . .

# Xóa các file cache cũ đi kèm theo code
RUN rm -f bootstrap/cache/*.php

# Chạy tối ưu autoload sinh classmap [cite: 91]
RUN composer dump-autoload --optimize

# Biên dịch frontend
RUN npm ci && npm run build

# Khởi tạo SQLite phòng hờ (Mặc định khuyên dùng pgsql từ xa trên .22) [cite: 92, 94]
RUN touch /var/www/database/database.sqlite

# Phân quyền sở hữu ban đầu cho hệ thống
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

RUN rm -f /var/www/public/index.html

EXPOSE 80

# Cấu hình Entrypoint điều hướng khởi động
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
