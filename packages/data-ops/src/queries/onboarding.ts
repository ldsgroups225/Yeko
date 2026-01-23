import { and, count, eq } from "drizzle-orm";
import { getDb } from "../database/setup";
import { programTemplates } from "../drizzle/core-schema";
import { classes, schoolSubjects, schoolYears } from "../drizzle/school-schema";

export async function importSmartTemplate(schoolId: string) {
  const db = getDb();

  // 1. Get Active School Year
  const activeYear = await db.query.schoolYears.findFirst({
    where: and(
      eq(schoolYears.schoolId, schoolId),
      eq(schoolYears.isActive, true),
    ),
  });

  if (!activeYear) {
    throw new Error(
      "No active school year found. Please configure Academic Year first.",
    );
  }

  // 2. Get Program Templates for this Year Template
  const programs = await db
    .select({
      subjectId: programTemplates.subjectId,
      gradeId: programTemplates.gradeId,
    })
    .from(programTemplates)
    .where(
      eq(
        programTemplates.schoolYearTemplateId,
        activeYear.schoolYearTemplateId,
      ),
    );

  if (programs.length === 0) {
    throw new Error("No curriculum found for this Academic Year template.");
  }

  // 3. Import Subjects (School Subjects)
  const uniqueSubjectIds = [...new Set(programs.map((p) => p.subjectId))];
  const existingSchoolSubjects = await db
    .select({ subjectId: schoolSubjects.subjectId })
    .from(schoolSubjects)
    .where(
      and(
        eq(schoolSubjects.schoolId, schoolId),
        eq(schoolSubjects.schoolYearId, activeYear.id),
      ),
    );

  const existingIds = new Set(existingSchoolSubjects.map((s) => s.subjectId));
  const newSubjectIds = uniqueSubjectIds.filter((id) => !existingIds.has(id));

  if (newSubjectIds.length > 0) {
    await db.insert(schoolSubjects).values(
      newSubjectIds.map((subjectId) => ({
        id: crypto.randomUUID(),
        schoolId,
        subjectId,
        schoolYearId: activeYear.id,
        status: "active" as const,
      })),
    );
  }

  // 4. Import Structure (Classes)
  const uniqueGradeIds = [...new Set(programs.map((p) => p.gradeId))];

  const existingClasses = await db
    .select({ gradeId: classes.gradeId })
    .from(classes)
    .where(
      and(
        eq(classes.schoolId, schoolId),
        eq(classes.schoolYearId, activeYear.id),
      ),
    );

  const existingGradeIds = new Set(existingClasses.map((c) => c.gradeId));
  const newGradeIds = uniqueGradeIds.filter((id) => !existingGradeIds.has(id));

  if (newGradeIds.length > 0) {
    await db.insert(classes).values(
      newGradeIds.map((gradeId) => ({
        id: crypto.randomUUID(),
        schoolId,
        schoolYearId: activeYear.id,
        gradeId,
        section: "A",
        status: "active" as const,
      })),
    );
  }

  return {
    importedSubjects: newSubjectIds.length,
    importedClasses: newGradeIds.length,
  };
}

export async function getOnboardingStatus(schoolId: string) {
  const db = getDb();

  // 1. Identity (Assuming schoolId existence means identity exists for now)
  const hasIdentity = true;

  // 2. Year (Active School Year)
  const activeYear = await db.query.schoolYears.findFirst({
    where: and(
      eq(schoolYears.schoolId, schoolId),
      eq(schoolYears.isActive, true),
    ),
  });
  const hasYear = !!activeYear;

  // 3. Structure (School Subjects)
  let hasStructure = false;
  if (hasYear) {
    const [subjectCount] = await db
      .select({ count: count() })
      .from(schoolSubjects)
      .where(
        and(
          eq(schoolSubjects.schoolId, schoolId),
          eq(schoolSubjects.schoolYearId, activeYear!.id),
        ),
      );
    hasStructure = (subjectCount?.count ?? 0) > 0;
  }

  return {
    hasIdentity,
    hasYear,
    hasStructure,
  };
}
