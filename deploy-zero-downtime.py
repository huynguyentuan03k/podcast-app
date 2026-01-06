import os

MAP_PATH = "/etc/nginx/conf.d/active_backend.map"

def main():
    try:
        if os.path.exists(MAP_PATH):
            with open(MAP_PATH, 'r') as f:
                content = f.read()
        else:
            content = ""

        if "laravel-blue" in content:
            print("TARGET=green")
            print("OLD=blue")
        else:
            print("TARGET=blue")
            print("OLD=green")

    except Exception as e:

        print("TARGET=blue")
        print("OLD=green")

if __name__ == "__main__":
    main()
