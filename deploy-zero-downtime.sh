#!/bin/bash
set -e

SERVER_USER=huy
SERVER_IP=your.server.ip
APP_DIR=/var/www/api-podcast-app
IMAGE_NAME=demoage
ACTIVE_COLOR_FILE=/tmp/active_color

ssh $SERVER_USER@$SERVER_IP << 'EOF'
set -e

cd /var/www/api-podcast-app

echo ">>> Pull code"
git pull origin main

echo ">>> Build image"
docker build -t demoage:latest .

# Xác định đang chạy color nào
if [ ! -f /tmp/active_color ]; then
  echo "blue" > /tmp/active_color
fi

ACTIVE=$(cat /tmp/active_color)

if [ "$ACTIVE" = "blue" ]; then
  NEW="green"
  OLD="blue"
  NEW_PORT=8089
else
  NEW="blue"
  OLD="green"
  NEW_PORT=8088
fi

echo ">>> Deploy $NEW"

docker compose -f docker-compose.$NEW.yaml up -d

echo ">>> Health check"
sleep 5
curl -f http://127.0.0.1:$NEW_PORT || exit 1

echo ">>> Switch Nginx traffic"

sudo sed -i "s/808[89]/$NEW_PORT/g" /etc/nginx/conf.d/api.conf
sudo nginx -s reload

echo ">>> Stop old container"
docker compose -f docker-compose.$OLD.yaml down

echo $NEW > /tmp/active_color

echo ">>> Deploy SUCCESS"
EOF
