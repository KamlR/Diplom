#!/bin/sh

echo "⏳ Waiting for /shared/frontend.env..."

while [ ! -f /shared/frontend.env ]; do
  sleep 1
done

echo "✅ Found /shared/frontend.env, updating /app/.env..."

sed -i '/^REACT_APP_ENTRYPOINT_ADDRESS=/d' /app/.env
sed -i '/^REACT_APP_SMART_CONTRACT_ADDRESS=/d' /app/.env

tail -c1 /app/.env | read -r _ || echo >> /app/.env
cat /shared/frontend.env >> /app/.env

echo "🚀 Starting frontend..."
exec npm start
