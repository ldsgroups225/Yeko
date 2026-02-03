// packages/data-ops/drizzle.config.ts

import type { Config } from 'drizzle-kit'

const config: Config = {
  out: './src/drizzle',
  schema: [
    './src/drizzle/auth-schema.ts',
    './src/drizzle/core-schema.ts',
    './src/drizzle/school-schema.ts',
    './src/drizzle/support-schema.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    // Include database name and SSL mode to ensure a stable connection in Neon/serverless environments
    url: `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}?sslmode=verify-full`,
  },
  tablesFilter: ['!_cf_KV', '!auth_*'],
}

export default config satisfies Config
