#!/bin/bash
# Poseidon — Superyacht Crew AI
# Works on Railway and locally

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "⚓ Poseidon — Superyacht Crew AI"
echo "================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  exit 1
fi

# Install deps if needed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd "$BACKEND_DIR" && npm install --production
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd "$FRONTEND_DIR" && npm install
fi

# Build frontend if not built
if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
  echo "🔨 Building frontend..."
  cd "$FRONTEND_DIR" && npm run build
fi

echo "🔧 Starting Poseidon..."
cd "$BACKEND_DIR"

# Use node directly (works on Railway where npx may not be in PATH)
if command -v npx &> /dev/null; then
  exec npx tsx src/server.ts
else
  exec node ./node_modules/.bin/tsx src/server.ts
fi
