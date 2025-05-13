#!/bin/sh

echo "⏳ Waiting for /shared/backend.env..."

while [ ! -f /shared/backend.env ]; do
  sleep 1
done

echo "✅ Found /shared/backend.env, updating /app/env/blockchain.env..."

sed -i '/^ENTRYPOINT_ADDRESS=/d' /app/env/blockchain.env
sed -i '/^SMART_CONTRACT_ADDRESS=/d' /app/env/blockchain.env

tail -c1 /app/env/blockchain.env | read -r _ || echo >> /app/env/blockchain.env
cat /shared/backend.env >> /app/env/blockchain.env

echo "🚀 Starting backend..."
exec npm start
