#!/bin/sh
cd /app
pnpm install --frozen-lockfile
cd /app/packages/queue-worker
exec npx wrangler dev --host 0.0.0.0
