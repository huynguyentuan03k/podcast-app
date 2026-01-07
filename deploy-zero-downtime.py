import os
import sys

MAP_PATH = "/etc/nginx/conf.d/active_backend.map"

def log(message):
    print(f"[PYTHON-LOG] {message}")

def main():
    log("Đang bắt đầu kiểm tra cấu hình Nginx...")

    try:
        if os.path.exists(MAP_PATH):
            with open(MAP_PATH, 'r') as f:
                content = f.read()
            log(f"Đã đọc file map thành công.")
        else:
            log(f"CẢNH BÁO: Không tìm thấy file tại {MAP_PATH}")
            content = ""


        if "laravel-blue" in content:
            target, old = "green", "blue"
        else:
            target, old = "blue", "green"

        log(f"Trạng thái hiện tại: {old}")
        log(f"Mục tiêu deploy mới: {target}")

        print(f"TARGET={target}")
        print(f"OLD={old}")

    except Exception as e:
        log(f"LỖI: {str(e)}")

        print("TARGET=blue")
        print("OLD=green")

if __name__ == "__main__":
    main()
