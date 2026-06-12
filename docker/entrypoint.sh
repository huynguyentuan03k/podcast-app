#!/bin/bash
set -e

echo "🚀 [ENTRYPOINT] Khởi động cấu hình Runtime cho Laravel..."

# 1. Tạo đầy đủ thư mục storage/framework (QUAN TRỌNG - Blade cache cần điều này)
echo "📁 Tạo cấu trúc thư mục storage..."
mkdir -p /var/www/storage/framework/{views,cache,sessions}
mkdir -p /var/www/storage/logs
mkdir -p /var/www/bootstrap/cache

# 2. Đảm bảo thư mục và file có quyền chính xác
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

if [ -f /var/www/database/database.sqlite ]; then
    chmod 664 /var/www/database/database.sqlite
fi

# 3. Xóa cache runtime trước mọi lệnh artisan để tránh dùng bootstrap cũ
echo "🧹 Xóa Laravel runtime cache..."
rm -f /var/www/bootstrap/cache/*.php
rm -f /var/www/storage/framework/cache/data/*

# 4. Tạo Storage Link một cách an toàn
echo "🔗 Tạo symlink public/storage..."
su -s /bin/bash www-data -c "php artisan storage:link" || true

# 5. Chỉ giữ lại lệnh sinh Swagger (nếu thực sự cần sinh động khi chạy app)
if [ -d /var/www/vendor/darkaonline/l5-swagger ]; then
    echo "📝 Đang sinh tài liệu Swagger API..."
    su -s /bin/bash www-data -c "php artisan l5-swagger:generate" || true
fi

# 6. Tự động chạy Migration cập nhật Database
echo "🗄️ Chạy Database Migration..."
su -s /bin/bash www-data -c "php artisan migrate --force" || echo "⚠️ Chưa kết nối được DB để migrate, bỏ qua bước này để app khởi động trước."

# 7. Chạy Supervisor quản lý Nginx + PHP-FPM
echo "🏁 Khởi động Supervisor process manager..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
