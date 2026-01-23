/**
 * Teacher Classes Queries
 * Specific queries for teachers to manage their assigned classes
 */
import { and, asc, count, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "../database/setup";
import { grades, subjects } from "../drizzle/core-schema";
import {
  classes,
  classSubjects,
  enrollments,
  students,
} from "../drizzle/school-schema";

/**
 * Get classes assigned to a teacher for a school year
 */
export async function getTeacherClasses(params: {
  teacherId: string;
  schoolYearId: string;
  schoolId?: string;
  includeInactive?: boolean;
}) {
  const db = getDb();

  const results = await db
    .select({
      id: classes.id,
      name: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      gradeName: grades.name,
      studentCount: sql<number>`(SELECT count(*) FROM ${enrollments} WHERE ${enrollments.classId} = ${classes.id} AND ${enrollments.status} = 'confirmed')::int`,
      subjectCount: count(classSubjects.id),
    })
    .from(classSubjects)
    .innerJoin(classes, eq(classSubjects.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(
      and(
        eq(classSubjects.teacherId, params.teacherId),
        eq(classes.schoolYearId, params.schoolYearId),
      ),
    )
    .groupBy(classes.id, grades.name)
    .orderBy(grades.name, classes.section);

  return results;
}

/**
 * Get detailed info for a specific class
 */
export async function getClassDetails(params: {
  classId: string;
  schoolYearId: string;
}) {
  const db = getDb();

  const [result] = await db
    .select({
      id: classes.id,
      name: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      gradeId: classes.gradeId,
      schoolYearId: classes.schoolYearId,
      teacherId: classes.homeroomTeacherId,
    })
    .from(classes)
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(
      and(
        eq(classes.id, params.classId),
        eq(classes.schoolYearId, params.schoolYearId),
      ),
    )
    .limit(1);

  return result ?? null;
}

/**
 * Get students in a class
 */
export async function getClassStudents(params: {
  classId: string;
  schoolYearId: string;
  searchQuery?: string;
}) {
  const db = getDb();

  const conditions = [
    eq(enrollments.classId, params.classId),
    eq(enrollments.schoolYearId, params.schoolYearId),
    eq(enrollments.status, "confirmed"),
  ];

  if (params.searchQuery) {
    conditions.push(
      sql`(${students.firstName} || ' ' || ${students.lastName}) ILIKE ${`%${params.searchQuery}%`}`,
    );
  }

  return db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      photoUrl: students.photoUrl,
    })
    .from(students)
    .innerJoin(enrollments, eq(enrollments.studentId, students.id))
    .where(and(...conditions))
    .orderBy(asc(students.lastName), asc(students.firstName));
}

/**
 * Add a student to a class (enrollment)
 */
export async function addStudentToClass(params: {
  studentId: string;
  classId: string;
  schoolYearId: string;
}) {
  const db = getDb();

  // Get schoolId from class
  const classData = await db
    .select({ schoolId: classes.schoolId })
    .from(classes)
    .where(eq(classes.id, params.classId))
    .limit(1);

  if (!classData[0]) throw new Error("Class not found");

  // Simplified enrollment
  const [result] = await db
    .insert(enrollments)
    .values({
      id: nanoid(),
      studentId: params.studentId,
      classId: params.classId,
      schoolYearId: params.schoolYearId,
      status: "confirmed",
      enrollmentDate: new Date().toISOString().split("T")[0]!,
    })
    .returning();

  return result;
}

/**
 * Remove a student from a class
 */
export async function removeStudentFromClass(params: {
  studentId: string;
  classId: string;
  schoolYearId: string;
}) {
  const db = getDb();
  return db
    .delete(enrollments)
    .where(
      and(
        eq(enrollments.studentId, params.studentId),
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
      ),
    );
}

/**
 * Get class statistics
 */
export async function getClassStats(params: {
  classId: string;
  schoolYearId: string;
}) {
  const db = getDb();

  const [result] = await db
    .select({
      totalStudents: count(),
      genderBreakdown: sql<any>`jsonb_build_object(
        'male', count(*) FILTER (WHERE ${students.gender} = 'male'),
        'female', count(*) FILTER (WHERE ${students.gender} = 'female')
      )`,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, "confirmed"),
      ),
    );

  return (
    result ?? { totalStudents: 0, genderBreakdown: { male: 0, female: 0 } }
  );
}
