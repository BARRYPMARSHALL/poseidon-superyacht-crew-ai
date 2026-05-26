FROM node:22-slim

WORKDIR /app

# Copy and install backend
COPY backend/package*.json backend/
RUN cd backend && npm install

# Copy and build frontend
COPY frontend/package*.json frontend/
RUN cd frontend && npm install
COPY frontend/ frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ backend/

ENV NODE_ENV=production
EXPOSE 3100

CMD ["node", "backend/node_modules/.bin/tsx", "backend/src/server.ts"]
