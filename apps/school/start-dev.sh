#!/bin/sh
cd /app
pnpm install --frozen-lockfile
cd /app/apps/school
exec npx vite dev --host 0.0.0.0 --port 3001
