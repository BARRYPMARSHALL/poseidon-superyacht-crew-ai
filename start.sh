#!/bin/bash
# Poseidon — Superyacht Crew AI
# Railway production entrypoint

set -e

echo "⚓ Poseidon — Superyacht Crew AI"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  exit 1
fi

echo "Node.js: $(node -v)"

# Navigate to backend
cd /app/backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  npm install --production 2>&1 | tail -1
fi

# Build frontend if not already built
if [ ! -f "../frontend/dist/index.html" ] && [ -d "../frontend" ]; then
  echo "🔨 Building frontend..."
  cd /app/frontend
  if [ ! -d "node_modules" ]; then npm install 2>&1 | tail -1; fi
  npm run build 2>&1 | tail -1
  cd /app/backend
fi

echo "🔧 Starting Poseidon on port ${PORT:-3100}..."

# Use tsx via node_modules (no npx needed)
exec node ./node_modules/.bin/tsx src/server.ts
