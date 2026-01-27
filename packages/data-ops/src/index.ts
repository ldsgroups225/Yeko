export * from './auth/permissions'
// NOTE: database/setup is intentionally NOT exported here to prevent Node.js-only
// dependencies (pg, events, Buffer) from being bundled in client code.
// Import it explicitly via '@repo/data-ops/database/setup' for server-side code only.
export * from './drizzle/auth-schema'
export * from './drizzle/core-schema'
export * from './drizzle/school-schema'
export * from './drizzle/support-schema'
export * from './queries/accounts'
export * from './queries/activity-tracking'
export * from './queries/analytics'
export * from './queries/attendance-alerts'
export * from './queries/attendance-settings'
export * from './queries/averages'
export * from './queries/catalogs'
export * from './queries/class-subjects'
export * from './queries/classes'
export * from './queries/classrooms'
export * from './queries/coefficients'
export * from './queries/conduct-records'
export * from './queries/curriculum-progress'
export * from './queries/dashboard-stats'
export * from './queries/discounts'
export * from './queries/enrollments'
export * from './queries/fee-structures'
export * from './queries/fee-types'
export * from './queries/fiscal-years'
export * from './queries/grades'
export * from './queries/installments'
export * from './queries/onboarding'
export * from './queries/parents'
export * from './queries/payment-plan-templates'
export * from './queries/payment-plans'
export * from './queries/payments'
export * from './queries/polar'
export * from './queries/programs'
export * from './queries/receipts'
export * from './queries/refunds'
export * from './queries/report-cards'
export * from './queries/school-admin/roles'
export * from './queries/school-admin/users'
export * from './queries/school-coefficients'
export * from './queries/school-subjects'
export * from './queries/schools'
export * from './queries/student-attendance'
export * from './queries/student-fees'
export * from './queries/students'

// Explicitly handle teacher-app exports to avoid conflicts
export {
  completeTeacherClassSession,
  createHomeworkAssignment,
  createTeacherClassSession,
  deleteHomeworkAssignment,
  getClassSubjectInfo,
  getCurrentTermForSchoolYear,
  getHomeworkById,
  getMessageDetailsQuery,
  getMessageTemplatesQuery,
  getSessionParticipationGrades,
  getTeacherActiveSession,
  getTeacherAssignedClasses,
  getTeacherClassSessionById,
  getTeacherDaySchedule,
  getTeacherHomework,
  getTeacherMessagesQuery,
  getTeacherNotificationsQuery,
  getTeacherPendingGradesCount,
  getTeacherRecentMessages,
  getTeacherSessionHistory,
  getTeacherUnreadMessagesCount,
  getTeacherWeeklySchedule,
  markMessageAsRead,
  searchParentsForTeacher,
  sendTeacherMessage,
  submitStudentGrades,
  updateHomeworkAssignment,
  upsertParticipationGrades,
} from './queries/teacher-app'

export * from './queries/teacher-attendance'

export {
  addStudentToClass as addTeacherStudentToClass,
  getClassDetails as getTeacherClassDetails,
  getTeacherClasses,
  getClassStats as getTeacherClassStats,
  getClassStudents as getTeacherClassStudents,
  removeStudentFromClass as removeTeacherStudentFromClass,
} from './queries/teacher-classes'

export * from './queries/teacher-notes'

export * from './queries/teacher-schedule'
export {
  bulkSaveAttendance,
  getClassRosterForAttendance,
  getOrCreateAttendanceSession,
  getClassAttendanceRates as getTeacherClassAttendanceRates,
  getClassAttendanceStats as getTeacherClassAttendanceStats,
  getStudentAttendanceHistory as getTeacherStudentAttendanceHistory,
  getStudentAttendanceTrend as getTeacherStudentAttendanceTrend,
  saveStudentAttendance,
} from './queries/teacher-student-attendance'

export * from './queries/teacher-subjects'

export * from './queries/timetables'
export * from './queries/transactions'
export * from './schemas/dashboard'
export * from './storage'
export {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notBetween,
  notExists,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
