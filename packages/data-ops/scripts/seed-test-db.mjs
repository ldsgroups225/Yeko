#!/usr/bin/env node
import { Pool } from 'pg'
import { scryptAsync } from '@noble/hashes/scrypt.js'
import { hex } from '@better-auth/utils/hex'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

// Read .env file
const envPath = path.resolve(process.cwd(), '../../apps/teacher/.env')
const envFile = fs.readFileSync(envPath, 'utf-8')
const envConfig = Object.fromEntries(
  envFile.split('\n').map(line => {
    const [key, ...value] = line.split('=')
    return [key, value.join('=').replace(/"/g, '')]
  }),
)

const connectionString = `postgresql://${envConfig.DATABASE_USERNAME}:${envConfig.DATABASE_PASSWORD}@${envConfig.DATABASE_HOST}`
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Configuration for scryptAsync, matching better-auth's defaults
const scryptConfig = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
};

async function generateKey(password, salt) {
    return await scryptAsync(password.normalize("NFKC"), salt, {
        N: scryptConfig.N,
        p: scryptConfig.p,
        r: scryptConfig.r,
        dkLen: scryptConfig.dkLen,
        maxmem: 128 * scryptConfig.N * scryptConfig.r * 2,
    });
}

export const hashPassword = async (password) => {
    const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
    const key = await generateKey(password, salt);
    return `${salt}:${hex.encode(key)}`;
};


async function seedDatabase() {
  try {
    console.log('🌱 Seeding test database...')

    // Test user credentials
    const email = 'enseignant@ecole.com'
    const name = 'Test Teacher'
    const password = 'password'

    // Remove existing user with this email first
    console.log(`🗑️  Removing existing user: ${email}`)
    await pool.query(
      `DELETE FROM auth_account WHERE user_id IN (SELECT id FROM auth_user WHERE email = $1)`,
      [email]
    )
    await pool.query(
      `DELETE FROM auth_user WHERE email = $1`,
      [email]
    )
    console.log('✓ Existing user removed')

    // Generate new user ID and password hash
    const userId = randomUUID()

    // Use better-auth's hashPassword logic
    const hashedPasswordString = await hashPassword(password);

    // Insert new user
    const userResult = await pool.query(
      `
      INSERT INTO auth_user (id, name, email, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, true, NOW(), NOW())
      RETURNING id;
    `,
      [userId, name, email],
    )
    const newUserId = userResult.rows[0].id

    // Insert account with "credential" provider_id (correct for Better Auth)
    await pool.query(
      `
      INSERT INTO auth_account (id, "account_id", provider_id, user_id, password, created_at, updated_at)
      VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `,
      [randomUUID(), email, newUserId, hashedPasswordString],
    )
    console.log('✓ Test user seeded with credential provider')
    // Insert education levels
    await pool.query(`
      INSERT INTO education_levels (id, name, "order") VALUES
      (1, 'Maternelle', 1),
      (2, 'Primaire', 2),
      (3, 'Secondaire', 3),
      (4, 'Supérieur', 4)
      ON CONFLICT (id) DO NOTHING;
    `)
    console.log('✓ Education levels seeded')

    // Insert tracks
    const trackResult = await pool.query(`
      INSERT INTO tracks (id, name, code, education_level_id, created_at, updated_at) VALUES
      (gen_random_uuid(), 'Général', 'GEN', 3, NOW(), NOW()),
      (gen_random_uuid(), 'Technique', 'TECH', 3, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code;
    `)

    const genTrack = trackResult.rows.find(r => r.code === 'GEN')
    console.log('✓ Tracks seeded')

    // Insert grades for general track
    if (genTrack) {
      await pool.query(`
        INSERT INTO grades (id, name, code, "order", track_id, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Sixième', '6EME', 1, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Cinquième', '5EME', 2, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Quatrième', '4EME', 3, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Troisième', '3EME', 4, $1, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `, [genTrack.id])
      console.log('✓ Grades seeded')

      // Insert series
      await pool.query(`
        INSERT INTO series (id, name, code, track_id, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Série A', 'A', $1, NOW(), NOW()),
        (gen_random_uuid(), 'Série C', 'C', $1, NOW(), NOW()),
        (gen_random_uuid(), 'Série D', 'D', $1, NOW(), NOW())
        ON CONFLICT (code) DO NOTHING;
      `, [genTrack.id])
      console.log('✓ Series seeded')
    }

    // Insert subjects
    await pool.query(`
      INSERT INTO subjects (id, name, short_name, category, created_at, updated_at) VALUES
      (gen_random_uuid(), 'Mathématiques', 'Math', 'Scientifique', NOW(), NOW()),
      (gen_random_uuid(), 'Français', 'Fr', 'Littéraire', NOW(), NOW()),
      (gen_random_uuid(), 'Anglais', 'Ang', 'Littéraire', NOW(), NOW()),
      (gen_random_uuid(), 'Physique-Chimie', 'PC', 'Scientifique', NOW(), NOW()),
      (gen_random_uuid(), 'SVT', 'SVT', 'Scientifique', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✓ Subjects seeded')

    // Insert school year template
    await pool.query(`
      INSERT INTO school_year_templates (id, name, is_active, created_at, updated_at) VALUES
      (gen_random_uuid(), '2025-2026', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✓ School year template seeded')

    console.log('✅ Seeding complete!')
  }
  catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
  finally {
    await pool.end()
  }
}

seedDatabase()
