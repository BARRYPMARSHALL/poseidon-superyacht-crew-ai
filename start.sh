#!/bin/bash
set -e

echo "⚓ Poseidon — Superyacht Crew AI"
echo "================================"
echo "Node: $(node -v)"
echo "PWD: $(pwd)"
echo "PORT: ${PORT:-3100}"
echo ""

# Go to backend
cd /app/backend 2>/dev/null || cd backend
echo "Working dir: $(pwd)"

# Verify node_modules exist
if [ ! -d "node_modules" ]; then
  echo "⚠ node_modules missing — installing..."
  npm install --omit=dev 2>&1
fi

# Verify tsx is available
if [ ! -f "node_modules/.bin/tsx" ]; then
  echo "⚠ tsx not found — installing with all deps..."
  npm install 2>&1
fi

echo "Starting server..."
exec node node_modules/.bin/tsx src/server.ts
