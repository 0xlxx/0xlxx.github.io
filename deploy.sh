#!/bin/bash

git pull

BUILD_VERSION=$(git rev-parse HEAD)

echo "$(date --utc +%FT%TZ): Releasing new server version. $BUILD_VERSION"

echo "$(date --utc +%FT%TZ): Running build..."
pnpm build
echo "$(date --utc +%FT%TZ): Restarting PM server..."
pm2 restart all

sleep 10

caddy reload
