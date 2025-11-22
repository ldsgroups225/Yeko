import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle/core-schema";
import fs from "fs";

// Load env
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
  } catch (e) { }
}

const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log("🔍 Verifying database content...");

  const levels = await db.select().from(schema.educationLevels);
  console.log(`Education Levels: ${levels.length} (Expected: 4)`);

  const tracks = await db.select().from(schema.tracks);
  console.log(`Tracks: ${tracks.length} (Expected: 2)`);

  const grades = await db.select().from(schema.grades);
  console.log(`Grades: ${grades.length} (Expected: 7)`);

  const series = await db.select().from(schema.series);
  console.log(`Series: ${series.length} (Expected: 5)`);

  const subjects = await db.select().from(schema.subjects);
  console.log(`Subjects: ${subjects.length} (Expected: 12)`);

  const years = await db.select().from(schema.schoolYearTemplates);
  console.log(`School Years: ${years.length} (Expected: 1)`);

  const terms = await db.select().from(schema.termTemplates);
  console.log(`Term Templates: ${terms.length} (Expected: 5)`);

  await client.end();
}

main();
