#!/bin/sh
# Startup script for Docker development
# Installs dependencies after volume mounts are active

echo "Installing dependencies..."
cd /app
pnpm install --frozen-lockfile

echo "Starting development server..."
cd /app/apps/core
exec npx vite dev --host 0.0.0.0 --port 3000
