FROM node:22-slim AS builder

WORKDIR /app

# Backend deps
COPY backend/package*.json backend/
RUN cd backend && npm install

# Frontend deps + build
COPY frontend/package*.json frontend/
RUN cd frontend && npm install
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
EXPOSE 3100

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3100/api/health', r => {let d='';r.on('data',c=>d+=c);r.on('end',()=>process.exit(d.includes('operational')?0:1))}).on('error',()=>process.exit(1))"

CMD ["node", "/app/backend/node_modules/.bin/tsx", "/app/backend/src/server.ts"]
