#!/bin/sh
cd /app
pnpm install --frozen-lockfile
cd /app/apps/teacher
exec npx vite dev --host 0.0.0.0 --port 3002
