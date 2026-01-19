#!/bin/sh
cd /app
pnpm install --frozen-lockfile
cd /app/apps/data-service
exec npx wrangler dev --host 0.0.0.0 --port 8787
