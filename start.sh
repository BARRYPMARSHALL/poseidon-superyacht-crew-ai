#!/bin/bash
# Poseidon — Superyacht Crew AI
# Complete startup script

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "⚓ Poseidon — Superyacht Crew AI"
echo "================================"
echo ""

# Check if database exists, seed if not
if [ ! -f "$BACKEND_DIR/data/poseidon.db" ]; then
  echo "📦 First run: Seeding demo database..."
  cd "$BACKEND_DIR" && npx tsx src/seed.ts
  echo ""
fi

# Start backend
echo "🔧 Starting backend API on port 3100..."
cd "$BACKEND_DIR"
npx tsx src/server.ts &
BACKEND_PID=$!
sleep 2

# Verify backend
if curl -s http://localhost:3100/api/health > /dev/null 2>&1; then
  echo "✅ Backend operational"
else
  echo "❌ Backend failed to start"
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# Start frontend
echo "🎨 Starting frontend on port 5173..."
cd "$FRONTEND_DIR"
npx vite --host &
FRONTEND_PID=$!
sleep 2

echo ""
echo "================================"
echo "🚀 Poseidon is live!"
echo ""
echo "   Dashboard:  http://localhost:5173"
echo "   API:        http://localhost:3100"
echo "   Health:     http://localhost:3100/api/health"
echo ""
echo "   Demo Login: captain@oceanstar.yacht"
echo "   Password:   captain123"
echo ""
echo "   Vessel:     M/Y OCEAN STAR (65m Feadship)"
echo "   Crew:       16 members across 5 departments"
echo "   Flag:       Cayman Islands"
echo "================================"
echo ""
echo "Agents running:"
echo "  🐕 Cerberus — Cert scanning (every 6h)"
echo "  🌊 Nereus   — Rotation checks (daily 8am)"
echo "  💰 Plutus   — Payroll engine"
echo "  📨 Hermes   — Owner reports (monthly 1st)"
echo "  🎓 Mentor   — Crew development"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap cleanup
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait
wait
