#!/bin/bash
set -e
cd backend
echo "Starting minimal server on port 3100..."
node node_modules/.bin/tsx src/server-minimal.ts
