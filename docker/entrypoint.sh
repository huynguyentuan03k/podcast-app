#!/bin/bash
set -e

echo "🚀 [ENTRYPOINT] Khởi động cấu hình Runtime cho Laravel..."

# 1. Đảm bảo thư mục và file có quyền chính xác TRƯỚC KHI chạy lệnh Artisan
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

if [ -f /var/www/database/database.sqlite ]; then
    chmod 664 /var/www/database/database.sqlite
fi

# 2. Tạo Storage Link một cách an toàn (Kiểm tra xem link tồn tại chưa)
if [ ! -d "/var/www/public/storage" ]; then
    echo "🔗 Tạo symlink public/storage..."
    su -s /bin/bash www-data -c "php artisan storage:link"
fi

# 3. Đồng bộ và làm sạch cấu hình (Luôn thực thi dưới quyền user www-data)
echo "🧹 Làm sạch và tối ưu cấu hình Laravel..."
su -s /bin/bash www-data -c "php artisan optimize:clear"
su -s /bin/bash www-data -c "php artisan config:cache"
su -s /bin/bash www-data -c "php artisan route:cache"
su -s /bin/bash www-data -c "php artisan view:cache"

# 4. Tự động sinh tài liệu Swagger (nếu có package)
if php artisan list | grep -q "l5-swagger:generate"; then
    echo "📝 Đang sinh tài liệu Swagger API..."
    su -s /bin/bash www-data -c "php artisan l5-swagger:generate" || true
fi

# 5. Tự động chạy Migration cập nhật Database lên hp70602
echo "🗄️ Chạy Database Migration..."
su -s /bin/bash www-data -c "php artisan migrate --force"

# 6. Trao quyền lại cuối cùng và chạy Supervisor quản lý Nginx + PHP-FPM
echo "🏁 Khởi động Supervisor process manager..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
