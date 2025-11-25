#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function recreateSchema() {
  try {
    console.log('Recreating schema from TypeScript definitions...');

    // Set environment variables for test database
    const env = {
      ...process.env,
      DATABASE_HOST: '127.0.0.1:5432/app',
      DATABASE_USERNAME: 'root',
      DATABASE_PASSWORD: 'root',
    };

    // Use drizzle-kit push to create tables from schema
    const { stdout, stderr } = await execAsync('pnpm exec drizzle-kit push', {
      cwd: '/home/darius-kassi/Projects/Yeko/packages/data-ops',
      env,
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✓ Schema recreated successfully');
  } catch (error) {
    console.error('Failed to recreate schema:', error);
    process.exit(1);
  }
}

recreateSchema();
