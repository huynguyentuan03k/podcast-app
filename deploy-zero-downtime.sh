#!/bin/bash

MAP_FILE="/home/huy/nginx/conf.d/active_backend.map"
CURRENT_ACTIVE=$(cat $MAP_FILE)

if [[ "$CURRENT_ACTIVE" == *"laravel-blue"* ]]; then
    TARGET="green"
    OLD="blue"
    PORT="8081"
else
    TARGET="blue"
    OLD="green"
    PORT="8088"
fi

echo "--- Deploying to $TARGET ---"

docker-compose up -d --build $TARGET

echo "Waiting for $TARGET to be ready..."
sleep 10

echo "server laravel-$TARGET:80;" > $MAP_FILE

docker exec nginx nginx -s reload

echo "--- Deployment Successful: $TARGET is now Active ---"
