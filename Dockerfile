FROM node:22-slim AS builder

WORKDIR /app

# Backend deps
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev

# Frontend deps + build
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npm run build

# Backend source
COPY backend/ backend/

# ========== Production image ==========
FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy backend (node_modules + source)
COPY --from=builder /app/backend /app/backend

# Copy built frontend
COPY --from=builder /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production

# Railway sets PORT env var — app reads it
EXPOSE 3100

# Healthcheck — uses PORT env or falls back to 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD sh -c 'PORT=${PORT:-3100}; node -e "require(\"http\").get(\"http://localhost:\" + process.env.PORT + \"/api/health\", r => {let d=\"\";r.on(\"data\",c=>d+=c);r.on(\"end\",()=>process.exit(d.includes(\"operational\")?0:1))}).on(\"error\",()=>process.exit(1))"'

# Use npm start script which runs tsx
WORKDIR /app/backend
CMD ["npm", "start"]
