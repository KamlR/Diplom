#!/bin/sh

echo "[start] Launching Hardhat node..."

# Запускаем ноду в фоне
npx hardhat node &
NODE_PID=$!

# Ждем, пока нода станет доступной
echo "[wait] Waiting for Hardhat node to be ready..."
until curl -s http://localhost:8545 >/dev/null; do
  sleep 1
done

echo "[deploy] Node is up. Running deploy script..."
npx hardhat run scripts/deploy.js --network localhost

# Держим контейнер живым, пока работает node
wait $NODE_PID
