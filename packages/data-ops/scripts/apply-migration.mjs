#!/usr/bin/env node
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = 'postgresql://root:root@127.0.0.1:5432/app';
const pool = new Pool({ connectionString });

const migrationSQL = readFileSync(join(__dirname, '../src/drizzle/0004_nappy_firestar.sql'), 'utf-8');

async function applyMigration() {
  try {
    console.log('Applying migration...');
    await pool.query(migrationSQL);
    console.log('✓ Migration applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
