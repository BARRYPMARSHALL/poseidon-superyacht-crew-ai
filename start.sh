#!/bin/bash
set -e

echo "⚓ Poseidon — Superyacht Crew AI"
echo "================================"
echo "Node: $(node -v)"
echo "Dir: $(pwd)"
echo ""

cd backend

# Install deps
if [ ! -d "node_modules" ]; then
  echo "Installing backend deps..."
  npm install --omit=dev 2>&1 | tail -1
fi

# Start with tsx directly (no npx)
echo "Starting Poseidon on port ${PORT:-3100}..."
exec node node_modules/.bin/tsx src/server.ts
