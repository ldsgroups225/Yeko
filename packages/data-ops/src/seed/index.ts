import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/core-schema";
import { eq } from "drizzle-orm";
import { SubjectCategory, TermType } from "../drizzle/core-schema";
import fs from "fs";
import { tracksData } from "./tracksData";
import { gradesData } from "./gradesData";
import { educationLevelsData } from "./educationLevelsData";
import { seriesData } from "./seriesData";
import { subjectsData } from "./subjectsData";
import { termsData } from "./termData";

// Manually load .env if not present
if (!process.env.DATABASE_HOST) {
  try {
    const envContent = fs.readFileSync(".env", "utf-8");
    envContent.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=").trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key.trim()] = value;
      }
    });
  } catch (e) {
    console.warn("Could not load .env file", e);
  }
}

// Load env vars if needed, or assume they are present in environment
const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`;

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function clearCoreTables() {
  console.log("🧹 Clearing existing data (excluding auth tables)...");

  // Delete in reverse order of dependencies to avoid foreign key constraints
  await db.delete(schema.coefficientTemplates);
  await db.delete(schema.programTemplateChapters);
  await db.delete(schema.programTemplates);
  await db.delete(schema.termTemplates);
  await db.delete(schema.schoolYearTemplates);
  await db.delete(schema.subjects);
  await db.delete(schema.series);
  await db.delete(schema.grades);
  await db.delete(schema.tracks);
  await db.delete(schema.educationLevels);

  console.log("✅ Core tables cleared");
}

async function main() {
  const args = process.argv.slice(2);
  const isFresh = args.includes('--fresh');

  if (isFresh) {
    await clearCoreTables();
    console.log("🌱 Fresh seeding database...");
  } else {
    console.log("🌱 Seeding database...");
  }

  // --- Level 0 ---

  console.log("Seeding Education Levels...");
  const seedMethod = isFresh ? db.insert(schema.educationLevels).values(educationLevelsData) :
    db.insert(schema.educationLevels).values(educationLevelsData).onConflictDoNothing();
  await seedMethod;

  console.log("Seeding Tracks...");

  for (const track of tracksData) {
    const insertQuery = db.insert(schema.tracks).values({
      id: crypto.randomUUID(),
      ...track,
    });

    if (isFresh) {
      await insertQuery;
    } else {
      await insertQuery.onConflictDoNothing({ target: schema.tracks.code });
    }
  }

  const generalTrack = await db.query.tracks.findFirst({ where: eq(schema.tracks.code, "GEN") });
  const techTrack = await db.query.tracks.findFirst({ where: eq(schema.tracks.code, "TECH") });

  if (!generalTrack || !techTrack) {
    throw new Error("Tracks not found after seeding");
  }

  // --- Level 1 ---

  console.log("Seeding Grades...");

  for (const grade of gradesData(generalTrack.id)) {
    if (isFresh) {
      await db.insert(schema.grades).values({
        id: crypto.randomUUID(),
        ...grade,
      });
    } else {
      // Check if exists to avoid duplicates (since code is not unique globally)
      const existing = await db.query.grades.findFirst({
        where: (grades, { and, eq }) => and(eq(grades.code, grade.code), eq(grades.trackId, grade.trackId))
      });

      if (!existing) {
        await db.insert(schema.grades).values({
          id: crypto.randomUUID(),
          ...grade,
        });
      }
    }
  }

  console.log("Seeding Series...");

  for (const s of seriesData(generalTrack.id)) {
    const insertQuery = db.insert(schema.series).values({
      id: crypto.randomUUID(),
      ...s,
    });

    if (isFresh) {
      await insertQuery;
    } else {
      await insertQuery.onConflictDoNothing({ target: schema.series.code });
    }
  }

  console.log("Seeding Subjects...");

  for (const subject of subjectsData) {
    if (isFresh) {
      await db.insert(schema.subjects).values({
        id: crypto.randomUUID(),
        ...subject,
        category: subject.category as SubjectCategory,
      });
    } else {
      // Check by name as we don't have unique code
      const existing = await db.query.subjects.findFirst({ where: eq(schema.subjects.name, subject.name) });
      if (!existing) {
        await db.insert(schema.subjects).values({
          id: crypto.randomUUID(),
          ...subject,
          category: subject.category as SubjectCategory,
        });
      }
    }
  }

  // --- Level 2 ---

  console.log("Seeding Templates...");
  const yearName = "2025-2026";

  let yearTemplate = await db.query.schoolYearTemplates.findFirst({ where: eq(schema.schoolYearTemplates.name, yearName) });

  if (!yearTemplate || isFresh) {
    if (isFresh) {
      // Always create the school year template in fresh mode
      const res = await db.insert(schema.schoolYearTemplates).values({
        id: crypto.randomUUID(),
        name: yearName,
        isActive: true,
      }).returning();
      yearTemplate = res[0];
    } else {
      // Create only if not exists in normal mode
      const res = await db.insert(schema.schoolYearTemplates).values({
        id: crypto.randomUUID(),
        name: yearName,
        isActive: true,
      }).onConflictDoNothing().returning();
      yearTemplate = res[0];
    }
  }

  for (const term of termsData) {
    if (isFresh) {
      await db.insert(schema.termTemplates).values({
        id: crypto.randomUUID(),
        ...term,
        type: term.type as TermType,
        schoolYearTemplateId: yearTemplate!.id,
      });
    } else {
      const existing = await db.query.termTemplates.findFirst({
        where: (t, { and, eq }) => and(eq(t.name, term.name), eq(t.schoolYearTemplateId, yearTemplate!.id))
      });
      if (!existing) {
        await db.insert(schema.termTemplates).values({
          id: crypto.randomUUID(),
          ...term,
          type: term.type as TermType,
          schoolYearTemplateId: yearTemplate!.id,
        });
      }
    }
  }

  await client.end();
  console.log("✅ Seeding complete!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
