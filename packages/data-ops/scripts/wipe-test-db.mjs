#!/usr/bin/env node
import { Pool } from 'pg';

const connectionString = 'postgresql://root:root@127.0.0.1:5432/app';
const pool = new Pool({ connectionString });

async function wipeDatabase() {
  try {
    console.log('Wiping all tables from test database...');

    // Drop all tables in the public schema
    const dropTablesSQL = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;

    await pool.query(dropTablesSQL);
    console.log('✓ All tables dropped successfully');

    // Also drop the drizzle schema if it exists
    await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    console.log('✓ Drizzle schema dropped');

  } catch (error) {
    console.error('Failed to wipe database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

wipeDatabase();
