import { initDatabase } from '@repo/data-ops/database/setup';
import handler from '@tanstack/react-start/server-entry';
import { env } from 'cloudflare:workers';

console.warn('[server-entry]: using custom server entry in \'src/server.ts\'');

export default {
  fetch(request: Request) {
    // Initialize database on each request
    initDatabase({
      host: env.DATABASE_HOST,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
    });

    return handler.fetch(request);
  },
};
