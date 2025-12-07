#!/bin/bash
set -e

# Đảm bảo quyền đúng
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Generate APP_KEY nếu chưa có
if ! grep -q "APP_KEY=base64:" /var/www/.env; then
    php artisan key:generate --force
fi

# Chạy migration
php artisan migrate --force

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Start supervisor
exec /usr/bin/supervisord
