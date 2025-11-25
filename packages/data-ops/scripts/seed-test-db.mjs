#!/usr/bin/env node
import { Pool } from 'pg';

const connectionString = 'postgresql://root:root@127.0.0.1:5432/app';
const pool = new Pool({ connectionString });

async function seedDatabase() {
  try {
    console.log('🌱 Seeding test database...');

    // Insert education levels
    await pool.query(`
      INSERT INTO education_levels (id, name, "order") VALUES
      (1, 'Maternelle', 1),
      (2, 'Primaire', 2),
      (3, 'Secondaire', 3),
      (4, 'Supérieur', 4)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Education levels seeded');

    // Insert tracks
    const trackResult = await pool.query(`
      INSERT INTO tracks (id, name, code, education_level_id, created_at, updated_at) VALUES
      (gen_random_uuid(), 'Général', 'GEN', 3, NOW(), NOW()),
      (gen_random_uuid(), 'Technique', 'TECH', 3, NOW(), NOW())
      ON CONFLICT (code) DO NOTHING
      RETURNING id, code;
    `);

    const genTrack = trackResult.rows.find(r => r.code === 'GEN');
    console.log('✓ Tracks seeded');

    // Insert grades for general track
    if (genTrack) {
      await pool.query(`
        INSERT INTO grades (id, name, code, "order", track_id, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Sixième', '6EME', 1, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Cinquième', '5EME', 2, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Quatrième', '4EME', 3, $1, NOW(), NOW()),
        (gen_random_uuid(), 'Troisième', '3EME', 4, $1, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `, [genTrack.id]);
      console.log('✓ Grades seeded');

      // Insert series
      await pool.query(`
        INSERT INTO series (id, name, code, track_id, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Série A', 'A', $1, NOW(), NOW()),
        (gen_random_uuid(), 'Série C', 'C', $1, NOW(), NOW()),
        (gen_random_uuid(), 'Série D', 'D', $1, NOW(), NOW())
        ON CONFLICT (code) DO NOTHING;
      `, [genTrack.id]);
      console.log('✓ Series seeded');
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
    `);
    console.log('✓ Subjects seeded');

    // Insert school year template
    await pool.query(`
      INSERT INTO school_year_templates (id, name, is_active, created_at, updated_at) VALUES
      (gen_random_uuid(), '2025-2026', true, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ School year template seeded');

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
