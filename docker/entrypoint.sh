#!/bin/bash
set -e

echo "🚀 [ENTRYPOINT] Khởi động cấu hình Runtime cho Laravel..."

# 1. Đảm bảo thư mục và file có quyền chính xác
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database
chmod -R 775 /var/www/storage /var/www/bootstrap/cache /var/www/database

if [ -f /var/www/database/database.sqlite ]; then
    chmod 664 /var/www/database/database.sqlite
fi

# 2. Tạo Storage Link một cách an toàn
if [ ! -d "/var/www/public/storage" ]; then
    echo "🔗 Tạo symlink public/storage..."
    su -s /bin/bash www-data -c "php artisan storage:link"
fi

# =====================================================================
# LƯU Ý LỚN: ĐÃ LƯỢC BỎ CÁC LỆNH CLEAR CACHE GÂY SẬP CONTAINER TẠI ĐÂY.
# Việc cache và dọn dẹp config ĐÃ được xử lý triệt để lúc BUILD và PREDEPLOY.
# =====================================================================

# 3. Chỉ giữ lại lệnh sinh Swagger (nếu thực sự cần sinh động khi chạy app)
if php artisan list | grep -q "l5-swagger:generate"; then
    echo "📝 Đang sinh tài liệu Swagger API..."
    su -s /bin/bash www-data -c "php artisan l5-swagger:generate" || true
fi

# 4. Tự động chạy Migration cập nhật Database (Có cấu chế tự bắt lỗi nếu DB chưa sẵn sàng)
echo "🗄️ Chạy Database Migration..."
su -s /bin/bash www-data -c "php artisan migrate --force" || echo "⚠️ Chưa kết nối được DB để migrate, bỏ qua bước này để app khởi động trước."

# 5. Chạy Supervisor quản lý Nginx + PHP-FPM
echo "🏁 Khởi động Supervisor process manager..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
