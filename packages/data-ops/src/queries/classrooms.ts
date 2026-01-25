import type { ClassroomInsert, ClassroomStatus, ClassroomType } from '../drizzle/school-schema'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { classes, classrooms } from '../drizzle/school-schema'

export interface ClassroomFilters {
  schoolId: string
  type?: ClassroomType
  status?: ClassroomStatus
  search?: string
}

export async function getClassrooms(filters: ClassroomFilters) {
  const db = getDb()
  const conditions = [eq(classrooms.schoolId, filters.schoolId)]

  if (filters.type) {
    conditions.push(eq(classrooms.type, filters.type))
  }

  if (filters.status) {
    conditions.push(eq(classrooms.status, filters.status))
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(classrooms.name, `%${filters.search}%`),
        ilike(classrooms.code, `%${filters.search}%`),
      )!,
    )
  }

  const results = await db
    .select({
      classroom: classrooms,
      assignedClassesCount: sql<number>`COUNT(DISTINCT ${classes.id})`.as('assigned_classes_count'),
    })
    .from(classrooms)
    .leftJoin(classes, eq(classes.classroomId, classrooms.id))
    .where(and(...conditions))
    .groupBy(classrooms.id)
    .orderBy(classrooms.name)

  return results
}

export async function getClassroomById(id: string) {
  const db = getDb()
  const [classroom] = await db
    .select({
      classroom: classrooms,
      assignedClasses: sql<any[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${classes.id},
              'section', ${classes.section},
              'gradeName', ${grades.name},
              'seriesName', ${series.name}
            )
          ) FILTER (WHERE ${classes.id} IS NOT NULL),
          '[]'
        )
      `.as('assigned_classes'),
    })
    .from(classrooms)
    .leftJoin(classes, eq(classes.classroomId, classrooms.id))
    .leftJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .where(eq(classrooms.id, id))
    .groupBy(classrooms.id)

  return classroom
}

export async function createClassroom(data: ClassroomInsert) {
  const db = getDb()
  const [classroom] = await db.insert(classrooms).values(data).returning()
  return classroom
}

export async function updateClassroom(id: string, data: Partial<ClassroomInsert>) {
  const db = getDb()
  const [classroom] = await db
    .update(classrooms)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classrooms.id, id))
    .returning()
  return classroom
}

export async function deleteClassroom(id: string) {
  const db = getDb()
  // Check if classroom is assigned to any active classes
  const [assignedClass] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.classroomId, id), eq(classes.status, 'active')))
    .limit(1)

  if (assignedClass) {
    throw new Error('Cannot delete classroom assigned to active classes')
  }

  await db.delete(classrooms).where(eq(classrooms.id, id))
}

export async function checkClassroomAvailability(
  classroomId: string,
  schoolYearId: string,
): Promise<{ available: boolean, assignedTo?: string }> {
  const db = getDb()
  const [result] = await db
    .select({
      classId: classes.id,
      className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
    })
    .from(classes)
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(and(eq(classes.classroomId, classroomId), eq(classes.schoolYearId, schoolYearId), eq(classes.status, 'active')))
    .limit(1)

  if (result) {
    return { available: false, assignedTo: result.className }
  }

  return { available: true }
}
