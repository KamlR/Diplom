#!/bin/sh

echo "[start] Launching Hardhat node..."

npx hardhat node &
NODE_PID=$!

echo "[wait] Waiting for Hardhat node to be ready..."
until curl -s http://localhost:8545 >/dev/null; do
  sleep 1
done

echo "[deploy] Node is up. Running deploy script..."
npx hardhat run scripts/deploy.js --network localhost

wait $NODE_PID
