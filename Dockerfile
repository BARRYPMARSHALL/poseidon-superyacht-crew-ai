FROM node:22-alpine

WORKDIR /app

# Install backend deps
COPY backend/package*.json backend/
RUN cd backend && npm install

# Build frontend
COPY frontend/package*.json frontend/
RUN cd frontend && npm install
COPY frontend/ frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ backend/

# Copy config files
COPY nixpacks.toml Procfile ./

ENV NODE_ENV=production
ENV PORT=3100
ENV DATABASE_PATH=/app/data/poseidon.db

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3100

CMD ["node", "backend/node_modules/.bin/tsx", "backend/src/server.ts"]
