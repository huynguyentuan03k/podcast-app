#!/bin/bash
set -e

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

if ! grep -q "APP_KEY=base64:" /var/www/.env; then
    php artisan key:generate --force
fi

php artisan migrate --force

php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan l5-swagger:generate

exec /usr/bin/supervisord
