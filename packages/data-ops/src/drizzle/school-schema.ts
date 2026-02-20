import type { SystemPermissions } from '../auth/permissions'
import { relations } from 'drizzle-orm'

import { boolean, date, decimal, index, integer, jsonb, pgTable, smallint, text, timestamp, unique } from 'drizzle-orm/pg-core'
// Import from core and auth schemas
import { auth_user } from './auth-schema'
import { coefficientTemplates, feeTypeTemplates, grades, programTemplateChapters, programTemplates, schools, schoolYearTemplates, series, subjects, termTemplates } from './core-schema'

// --- Level 0: Identity & Access (Foundation) ---

export const userStatuses = ['active', 'inactive', 'suspended'] as const
export type UserStatus = typeof userStatuses[number]

export const users = pgTable('users', {
  id: text('id').primaryKey(), // UUID or CUID
  authUserId: text('auth_user_id').unique().references(() => auth_user.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  status: text('status', { enum: userStatuses }).default('active').notNull(),
  lastLoginAt: timestamp('last_login_at'), // Phase 11: Activity tracking
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete support
}, table => ({
  emailIdx: index('idx_users_email').on(table.email),
  phoneIdx: index('idx_users_phone').on(table.phone),
  statusIdx: index('idx_users_status').on(table.status),
  authUserIdx: index('idx_users_auth_user').on(table.authUserId),
}))

export const userSchools = pgTable('user_schools', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  userIdx: index('idx_user_schools_user').on(table.userId),
  schoolIdx: index('idx_user_schools_school').on(table.schoolId),
  compositeIdx: index('idx_user_schools_composite').on(table.userId, table.schoolId),
  uniqueUserSchool: unique('unique_user_school').on(table.userId, table.schoolId),
}))

export const roleScopes = ['school', 'system'] as const
export type RoleScope = typeof roleScopes[number]

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'), // For UI display
  permissions: jsonb('permissions').$type<SystemPermissions>().notNull().default({}),
  scope: text('scope', { enum: roleScopes }).notNull(),
  isSystemRole: boolean('is_system_role').default(false).notNull(), // Phase 11: Prevent deletion of system roles
  extraLanguages: jsonb('extra_languages').$type<Record<string, { name: string, description?: string }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  slugIdx: index('idx_roles_slug').on(table.slug),
  scopeIdx: index('idx_roles_scope').on(table.scope),
}))

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').references(() => schools.id, { onDelete: 'cascade' }), // Nullable for system-scoped roles
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  compositeIdx: index('idx_user_roles_composite').on(table.userId, table.schoolId, table.roleId),
  schoolIdx: index('idx_user_roles_school').on(table.schoolId),
  uniqueUserRoleSchool: unique('unique_user_role_school').on(table.userId, table.roleId, table.schoolId),
}))

// --- Level 1: Organization Structure ---

export const teacherStatuses = ['active', 'inactive', 'on_leave'] as const
export type TeacherStatus = typeof teacherStatuses[number]

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  specialization: text('specialization'),
  hireDate: date('hire_date'),
  status: text('status', { enum: teacherStatuses }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  userIdx: index('idx_teachers_user').on(table.userId),
  schoolIdx: index('idx_teachers_school').on(table.schoolId),
  schoolStatusIdx: index('idx_teachers_school_status').on(table.schoolId, table.status),
}))

export const teacherSubjects = pgTable('teacher_subjects', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  compositeIdx: index('idx_teacher_subjects_composite').on(table.teacherId, table.subjectId),
  uniqueTeacherSubject: unique('unique_teacher_subject').on(table.teacherId, table.subjectId),
}))

export const staffStatuses = ['active', 'inactive', 'on_leave'] as const
export type StaffStatus = typeof staffStatuses[number]

export const staff = pgTable('staff', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  position: text('position').notNull(), // Academic Coordinator, Discipline Officer, etc.
  department: text('department'),
  hireDate: date('hire_date'),
  status: text('status', { enum: staffStatuses }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  userIdx: index('idx_staff_user').on(table.userId),
  schoolIdx: index('idx_staff_school').on(table.schoolId),
  positionIdx: index('idx_staff_position').on(table.position),
}))

export const classroomTypes = ['regular', 'lab', 'gym', 'library', 'auditorium'] as const
export type ClassroomType = typeof classroomTypes[number]

export const classroomStatuses = ['active', 'maintenance', 'inactive'] as const
export type ClassroomStatus = typeof classroomStatuses[number]

export const classrooms = pgTable('classrooms', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: text('type', { enum: classroomTypes }).default('regular').notNull(),
  capacity: integer('capacity').notNull().default(30),
  floor: text('floor'),
  building: text('building'),
  equipment: jsonb('equipment').$type<{
    projector?: boolean
    computers?: number
    whiteboard?: boolean
    smartboard?: boolean
    ac?: boolean
    other?: string[]
  }>(),
  status: text('status', { enum: classroomStatuses }).default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_classrooms_school').on(table.schoolId),
  typeIdx: index('idx_classrooms_type').on(table.type),
  statusIdx: index('idx_classrooms_status').on(table.status),
  schoolStatusTypeIdx: index('idx_classrooms_school_status_type').on(table.schoolId, table.status, table.type),
  uniqueSchoolCode: unique('unique_school_code').on(table.schoolId, table.code),
}))

// --- Level 2: Academic Structure (Template Instances) ---

export const schoolYears = pgTable('school_years', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearTemplateId: text('school_year_template_id').notNull().references(() => schoolYearTemplates.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_school_years_school').on(table.schoolId),
  activeIdx: index('idx_school_years_active').on(table.isActive),
  schoolActiveIdx: index('idx_school_years_school_active').on(table.schoolId, table.isActive),
}))

export const terms = pgTable('terms', {
  id: text('id').primaryKey(),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  termTemplateId: text('term_template_id').notNull().references(() => termTemplates.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolYearIdx: index('idx_terms_school_year').on(table.schoolYearId),
}))

export const classStatuses = ['active', 'archived'] as const
export type ClassStatus = typeof classStatuses[number]

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  gradeId: text('grade_id').notNull().references(() => grades.id),
  seriesId: text('series_id').references(() => series.id),
  section: text('section').notNull(), // "1", "2", "A", "B"
  classroomId: text('classroom_id').references(() => classrooms.id, { onDelete: 'set null' }),
  homeroomTeacherId: text('homeroom_teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  maxStudents: integer('max_students').notNull().default(40),
  status: text('status', { enum: classStatuses }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_classes_school').on(table.schoolId),
  schoolYearIdx: index('idx_classes_school_year').on(table.schoolYearId),
  homeroomIdx: index('idx_classes_homeroom').on(table.homeroomTeacherId),
  classroomIdx: index('idx_classes_classroom').on(table.classroomId),
  schoolYearCompositeIdx: index('idx_classes_school_year_composite').on(table.schoolId, table.schoolYearId),
  gradeSeriesIdx: index('idx_classes_grade_series').on(table.gradeId, table.seriesId),
}))

export const classSubjectStatuses = ['active', 'inactive'] as const
export type ClassSubjectStatus = typeof classSubjectStatuses[number]

export const classSubjects = pgTable('class_subjects', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  teacherId: text('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  coefficient: integer('coefficient').notNull().default(1),
  hoursPerWeek: integer('hours_per_week').notNull().default(2),
  status: text('status', { enum: classSubjectStatuses }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  teacherIdx: index('idx_class_subjects_teacher').on(table.teacherId),
  classSubjectIdx: index('idx_class_subjects_class_subject').on(table.classId, table.subjectId),
  teacherSubjectIdx: index('idx_class_subjects_teacher_subject').on(table.teacherId, table.subjectId),
  uniqueClassSubject: unique('unique_class_subject').on(table.classId, table.subjectId),
}))

// --- Level 3: Student Management ---

export const genders = ['M', 'F', 'other'] as const
export type Gender = typeof genders[number]

export const studentStatuses = ['active', 'graduated', 'transferred', 'withdrawn'] as const
export type StudentStatus = typeof studentStatuses[number]

export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
export type BloodType = typeof bloodTypes[number]

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dob: date('dob').notNull(),
  gender: text('gender', { enum: genders }),
  photoUrl: text('photo_url'),
  matricule: text('matricule').notNull(), // Format: AB2024C001
  status: text('status', { enum: studentStatuses }).default('active').notNull(),
  // Phase 13: Enhanced fields
  birthPlace: text('birth_place'),
  nationality: text('nationality').default('Ivoirien'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  bloodType: text('blood_type', { enum: bloodTypes }),
  medicalNotes: text('medical_notes'),
  previousSchool: text('previous_school'),
  admissionDate: date('admission_date'),
  graduationDate: date('graduation_date'),
  transferDate: date('transfer_date'),
  transferReason: text('transfer_reason'),
  withdrawalDate: date('withdrawal_date'),
  withdrawalReason: text('withdrawal_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_students_school').on(table.schoolId),
  matriculeIdx: index('idx_students_matricule').on(table.matricule),
  statusIdx: index('idx_students_status').on(table.status),
  schoolStatusIdx: index('idx_students_school_status').on(table.schoolId, table.status),
  uniqueSchoolMatricule: unique('unique_school_matricule').on(table.schoolId, table.matricule),
  // Phase 13: New indexes
  nameIdx: index('idx_students_name').on(table.lastName, table.firstName),
  dobIdx: index('idx_students_dob').on(table.dob),
  admissionIdx: index('idx_students_admission').on(table.schoolId, table.admissionDate),
}))

export const invitationStatuses = ['pending', 'sent', 'accepted', 'expired'] as const
export type InvitationStatus = typeof invitationStatuses[number]

export const parents = pgTable('parents', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // Made nullable for unregistered parents
  // Phase 13: Enhanced fields
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  phone2: text('phone_2'), // Secondary phone
  address: text('address'),
  occupation: text('occupation'),
  workplace: text('workplace'),
  invitationStatus: text('invitation_status', { enum: invitationStatuses }).default('pending'),
  invitationSentAt: timestamp('invitation_sent_at'),
  invitationToken: text('invitation_token'),
  invitationExpiresAt: timestamp('invitation_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  userIdx: index('idx_parents_user').on(table.userId),
  phoneIdx: index('idx_parents_phone').on(table.phone),
  // Phase 13: New indexes
  emailIdx: index('idx_parents_email').on(table.email),
  phone2Idx: index('idx_parents_phone2').on(table.phone2),
  invitationStatusIdx: index('idx_parents_invitation_status').on(table.invitationStatus),
  nameIdx: index('idx_parents_name').on(table.lastName, table.firstName),
}))

export const relationshipTypes = ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'] as const
export type Relationship = typeof relationshipTypes[number]

export const studentParents = pgTable('student_parents', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  parentId: text('parent_id').notNull().references(() => parents.id, { onDelete: 'cascade' }),
  relationship: text('relationship', { enum: relationshipTypes }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  // Phase 13: Enhanced fields
  canPickup: boolean('can_pickup').default(true).notNull(), // Authorized to pick up student
  receiveNotifications: boolean('receive_notifications').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  compositeIdx: index('idx_student_parents_composite').on(table.studentId, table.parentId),
  parentIdx: index('idx_student_parents_parent').on(table.parentId),
  uniqueStudentParent: unique('unique_student_parent').on(table.studentId, table.parentId),
  // Phase 13: New index
  primaryIdx: index('idx_student_parents_primary').on(table.studentId, table.isPrimary),
}))

export const enrollmentStatuses = ['pending', 'confirmed', 'cancelled', 'transferred'] as const
export type EnrollmentStatus = typeof enrollmentStatuses[number]

export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  status: text('status', { enum: enrollmentStatuses }).default('pending').notNull(),
  enrollmentDate: date('enrollment_date').notNull(),
  // Phase 13: Enhanced fields
  confirmedAt: timestamp('confirmed_at'),
  confirmedBy: text('confirmed_by').references(() => users.id, { onDelete: 'set null' }),
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: text('cancelled_by').references(() => users.id, { onDelete: 'set null' }),
  cancellationReason: text('cancellation_reason'),
  transferredAt: timestamp('transferred_at'),
  transferredTo: text('transferred_to').references(() => classes.id, { onDelete: 'set null' }), // New class
  transferReason: text('transfer_reason'),
  previousEnrollmentId: text('previous_enrollment_id'), // Self-reference for re-enrollment tracking
  rollNumber: integer('roll_number'), // Student number in class
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  studentIdx: index('idx_enrollments_student').on(table.studentId),
  classIdx: index('idx_enrollments_class').on(table.classId),
  schoolYearIdx: index('idx_enrollments_school_year').on(table.schoolYearId),
  classYearStatusIdx: index('idx_enrollments_class_year_status').on(table.classId, table.schoolYearId, table.status),
  studentYearIdx: index('idx_enrollments_student_year').on(table.studentId, table.schoolYearId),
  // Performance optimizations
  studentYearStatusIdx: index('idx_enrollments_student_year_status').on(table.studentId, table.schoolYearId, table.status),
  // Phase 13: New indexes
  statusIdx: index('idx_enrollments_status').on(table.status),
  confirmedByIdx: index('idx_enrollments_confirmed_by').on(table.confirmedBy),
  rollNumberIdx: index('idx_enrollments_roll_number').on(table.classId, table.rollNumber),
  // NOTE: Partial unique index for active enrollments is enforced via:
  // 1. Runtime check in createEnrollment() query
  // 2. Custom SQL migration: CREATE UNIQUE INDEX unique_student_year_active
  //    ON enrollments (student_id, school_year_id) WHERE status NOT IN ('cancelled', 'transferred');
}))

// Phase 13: Matricule Sequences for auto-generation
export const matriculeSequences = pgTable('matricule_sequences', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  prefix: text('prefix').notNull(), // e.g., "AB" for school code
  lastNumber: integer('last_number').default(0).notNull(),
  format: text('format').default('{prefix}{year}{sequence:4}').notNull(), // e.g., AB2024C001
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolYearIdx: index('idx_matricule_seq_school_year').on(table.schoolId, table.schoolYearId),
  uniqueSchoolYear: unique('unique_matricule_seq_school_year').on(table.schoolId, table.schoolYearId),
}))

// --- Level 4: Audit & Security ---

export const auditActions = ['create', 'update', 'delete', 'view'] as const
export type AuditAction = typeof auditActions[number]

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  action: text('action', { enum: auditActions }).notNull(),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  oldValues: jsonb('old_values').$type<Record<string, any>>(),
  newValues: jsonb('new_values').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  schoolTimeIdx: index('idx_audit_school_time').on(table.schoolId, table.createdAt.desc()),
  userIdx: index('idx_audit_user').on(table.userId),
  tableRecordIdx: index('idx_audit_table_record').on(table.tableName, table.recordId),
  actionIdx: index('idx_audit_action').on(table.action),
}))

export const schoolSubjectCoefficients = pgTable('school_subject_coefficients', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  coefficientTemplateId: text('coefficient_template_id').notNull().references(() => coefficientTemplates.id, { onDelete: 'cascade' }),
  weightOverride: smallint('weight_override').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_school_coeffs_school').on(table.schoolId),
  templateIdx: index('idx_school_coeffs_template').on(table.coefficientTemplateId),
  lookupIdx: index('idx_school_coeffs_lookup').on(table.schoolId, table.coefficientTemplateId), // Phase 14: Added for fast lookup
  uniqueSchoolTemplate: unique('unique_school_template').on(table.schoolId, table.coefficientTemplateId),
}))

// --- Relations ---

export const usersRelations = relations(users, ({ one, many }) => ({
  authUser: one(auth_user, {
    fields: [users.authUserId],
    references: [auth_user.id],
  }),
  userSchools: many(userSchools),
  userRoles: many(userRoles),
  teacher: one(teachers),
  staff: one(staff),
  parent: one(parents),
}))

export const userSchoolsRelations = relations(userSchools, ({ one }) => ({
  user: one(users, {
    fields: [userSchools.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [userSchools.schoolId],
    references: [schools.id],
  }),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  school: one(schools, {
    fields: [userRoles.schoolId],
    references: [schools.id],
  }),
}))

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [teachers.schoolId],
    references: [schools.id],
  }),
  teacherSubjects: many(teacherSubjects),
  classes: many(classes),
}))

export const teacherSubjectsRelations = relations(teacherSubjects, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherSubjects.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [teacherSubjects.subjectId],
    references: [subjects.id],
  }),
}))

export const staffRelations = relations(staff, ({ one }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [staff.schoolId],
    references: [schools.id],
  }),
}))

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  school: one(schools, {
    fields: [classrooms.schoolId],
    references: [schools.id],
  }),
  classes: many(classes),
}))

export const schoolYearsRelations = relations(schoolYears, ({ one, many }) => ({
  school: one(schools, {
    fields: [schoolYears.schoolId],
    references: [schools.id],
  }),
  schoolYearTemplate: one(schoolYearTemplates, {
    fields: [schoolYears.schoolYearTemplateId],
    references: [schoolYearTemplates.id],
  }),
  terms: many(terms),
  classes: many(classes),
  enrollments: many(enrollments),
}))

export const termsRelations = relations(terms, ({ one }) => ({
  schoolYear: one(schoolYears, {
    fields: [terms.schoolYearId],
    references: [schoolYears.id],
  }),
  termTemplate: one(termTemplates, {
    fields: [terms.termTemplateId],
    references: [termTemplates.id],
  }),
}))

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [classes.schoolYearId],
    references: [schoolYears.id],
  }),
  grade: one(grades, {
    fields: [classes.gradeId],
    references: [grades.id],
  }),
  series: one(series, {
    fields: [classes.seriesId],
    references: [series.id],
  }),
  classroom: one(classrooms, {
    fields: [classes.classroomId],
    references: [classrooms.id],
  }),
  homeroomTeacher: one(teachers, {
    fields: [classes.homeroomTeacherId],
    references: [teachers.id],
  }),
  enrollments: many(enrollments),
  classSubjects: many(classSubjects),
}))

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  class: one(classes, {
    fields: [classSubjects.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [classSubjects.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [classSubjects.teacherId],
    references: [teachers.id],
  }),
}))

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  studentParents: many(studentParents),
  enrollments: many(enrollments),
}))

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  studentParents: many(studentParents),
}))

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(students, {
    fields: [studentParents.studentId],
    references: [students.id],
  }),
  parent: one(parents, {
    fields: [studentParents.parentId],
    references: [parents.id],
  }),
}))

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [enrollments.schoolYearId],
    references: [schoolYears.id],
  }),
  confirmedByUser: one(users, {
    fields: [enrollments.confirmedBy],
    references: [users.id],
  }),
  cancelledByUser: one(users, {
    fields: [enrollments.cancelledBy],
    references: [users.id],
  }),
  transferredToClass: one(classes, {
    fields: [enrollments.transferredTo],
    references: [classes.id],
  }),
}))

export const matriculeSequencesRelations = relations(matriculeSequences, ({ one }) => ({
  school: one(schools, {
    fields: [matriculeSequences.schoolId],
    references: [schools.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [matriculeSequences.schoolYearId],
    references: [schoolYears.id],
  }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  school: one(schools, {
    fields: [auditLogs.schoolId],
    references: [schools.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}))

// Phase 14: School Subjects - Subjects activated for a specific school
export const schoolSubjects = pgTable('school_subjects', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'inactive'] }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, table => ({
  schoolIdx: index('idx_school_subjects_school').on(table.schoolId),
  yearIdx: index('idx_school_subjects_year').on(table.schoolYearId),
  statusIdx: index('idx_school_subjects_status').on(table.status),
  lookupIdx: index('idx_school_subjects_lookup').on(table.schoolId, table.schoolYearId, table.status),
  uniqueSchoolSubjectYear: unique('unique_school_subject_year').on(table.schoolId, table.subjectId, table.schoolYearId),
}))

// Phase 14: School Subjects Relations
export const schoolSubjectsRelations = relations(schoolSubjects, ({ one }) => ({
  school: one(schools, {
    fields: [schoolSubjects.schoolId],
    references: [schools.id],
  }),
  subject: one(subjects, {
    fields: [schoolSubjects.subjectId],
    references: [subjects.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [schoolSubjects.schoolYearId],
    references: [schoolYears.id],
  }),
}))

export const schoolSubjectCoefficientsRelations = relations(schoolSubjectCoefficients, ({ one }) => ({
  school: one(schools, {
    fields: [schoolSubjectCoefficients.schoolId],
    references: [schools.id],
  }),
  coefficientTemplate: one(coefficientTemplates, {
    fields: [schoolSubjectCoefficients.coefficientTemplateId],
    references: [coefficientTemplates.id],
  }),
}))

// --- Level 5: Grade Management ---

export const gradeTypes = ['quiz', 'test', 'exam', 'participation', 'homework', 'project'] as const
export type GradeType = typeof gradeTypes[number]

export const gradeStatuses = ['draft', 'submitted', 'validated', 'rejected'] as const
export type GradeStatus = typeof gradeStatuses[number]

export const studentGrades = pgTable('student_grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  termId: text('term_id').notNull().references(() => terms.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id),

  value: decimal('value', { precision: 5, scale: 2 }).notNull(), // 20.00
  type: text('type', { enum: gradeTypes }).notNull(),
  weight: smallint('weight').notNull().default(1),
  description: text('description'),
  gradeDate: date('grade_date').notNull().defaultNow(),

  status: text('status', { enum: gradeStatuses }).notNull().default('draft'),
  submittedAt: timestamp('submitted_at'),
  validatedAt: timestamp('validated_at'),
  validatedBy: text('validated_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentTermSubjectIdx: index('idx_grades_student_term_subject').on(table.studentId, table.termId, table.subjectId),
  classSubjectTermIdx: index('idx_grades_class_subject_term').on(table.classId, table.subjectId, table.termId),
  teacherIdx: index('idx_grades_teacher_status').on(table.teacherId, table.status),
  statusIdx: index('idx_grades_status').on(table.status),
  termStatusIdx: index('idx_grades_term_status').on(table.termId, table.status),
  classTermIdx: index('idx_grades_class_term').on(table.classId, table.termId),
}))

export const gradeValidations = pgTable('grade_validations', {
  id: text('id').primaryKey(),
  gradeId: text('grade_id').notNull().references(() => studentGrades.id, { onDelete: 'cascade' }),
  validatorId: text('validator_id').notNull().references(() => users.id),
  action: text('action', { enum: ['submitted', 'validated', 'rejected', 'edited'] }).notNull(),
  previousValue: decimal('previous_value', { precision: 5, scale: 2 }),
  newValue: decimal('new_value', { precision: 5, scale: 2 }),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  gradeIdx: index('idx_validations_grade').on(table.gradeId),
  validatorIdx: index('idx_validations_validator').on(table.validatorId),
}))

export const studentAverages = pgTable('student_averages', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  termId: text('term_id').notNull().references(() => terms.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').references(() => subjects.id),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),

  average: decimal('average', { precision: 5, scale: 2 }).notNull(),
  weightedAverage: decimal('weighted_average', { precision: 5, scale: 2 }),
  gradeCount: integer('grade_count').notNull().default(0),
  rankInClass: smallint('rank_in_class'),
  rankInGrade: smallint('rank_in_grade'),

  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
  isFinal: boolean('is_final').notNull().default(false),
}, table => ({
  studentTermIdx: index('idx_averages_student_term').on(table.studentId, table.termId),
  classTermIdx: index('idx_averages_class_term').on(table.classId, table.termId),
  classTermFinalIdx: index('idx_averages_class_term_final').on(table.classId, table.termId, table.isFinal),
  uniqueStudentTermSubject: unique('unique_student_term_subject').on(table.studentId, table.termId, table.subjectId),
}))

export const studentGradesRelations = relations(studentGrades, ({ one, many }) => ({
  student: one(students, {
    fields: [studentGrades.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentGrades.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [studentGrades.subjectId],
    references: [subjects.id],
  }),
  term: one(terms, {
    fields: [studentGrades.termId],
    references: [terms.id],
  }),
  teacher: one(teachers, {
    fields: [studentGrades.teacherId],
    references: [teachers.id],
  }),
  creator: one(users, {
    fields: [studentGrades.validatedBy],
    references: [users.id],
  }),
  validations: many(gradeValidations),
}))

export const gradeValidationsRelations = relations(gradeValidations, ({ one }) => ({
  grade: one(studentGrades, {
    fields: [gradeValidations.gradeId],
    references: [studentGrades.id],
  }),
  validator: one(users, {
    fields: [gradeValidations.validatorId],
    references: [users.id],
  }),
}))

export const studentAveragesRelations = relations(studentAverages, ({ one }) => ({
  student: one(students, {
    fields: [studentAverages.studentId],
    references: [students.id],
  }),
  term: one(terms, {
    fields: [studentAverages.termId],
    references: [terms.id],
  }),
  subject: one(subjects, {
    fields: [studentAverages.subjectId],
    references: [subjects.id],
  }),
  class: one(classes, {
    fields: [studentAverages.classId],
    references: [classes.id],
  }),
}))

// --- Phase 16: Report Cards, Timetables, Curriculum Progress ---

// Report Card Status Types
export const reportCardStatuses = ['draft', 'generated', 'sent', 'delivered', 'viewed'] as const
export type ReportCardStatus = typeof reportCardStatuses[number]

export const deliveryMethods = ['email', 'in_app', 'sms', 'print'] as const
export type DeliveryMethod = typeof deliveryMethods[number]

// Report Card Templates
export const reportCardTemplates = pgTable('report_card_templates', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isDefault: boolean('is_default').default(false),
  config: jsonb('config').$type<{
    showRank?: boolean
    showAttendance?: boolean
    showConduct?: boolean
    showComments?: boolean
    sections?: string[]
    gradingScale?: { min: number, max: number, label: string }[]
  }>().notNull().default({}),
  primaryColor: text('primary_color').default('#1e40af'),
  fontFamily: text('font_family').default('DM Sans'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_report_templates_school').on(table.schoolId),
}))

// Report Cards
export const reportCards = pgTable('report_cards', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  termId: text('term_id').notNull().references(() => terms.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  templateId: text('template_id').references(() => reportCardTemplates.id, { onDelete: 'set null' }),

  status: text('status', { enum: reportCardStatuses }).default('draft').notNull(),
  generatedAt: timestamp('generated_at'),
  generatedBy: text('generated_by').references(() => users.id, { onDelete: 'set null' }),

  pdfUrl: text('pdf_url'),
  pdfSize: integer('pdf_size'),

  sentAt: timestamp('sent_at'),
  sentTo: text('sent_to'),
  deliveryMethod: text('delivery_method', { enum: deliveryMethods }),
  deliveredAt: timestamp('delivered_at'),
  viewedAt: timestamp('viewed_at'),
  bounceReason: text('bounce_reason'),

  homeroomComment: text('homeroom_comment'),
  conductSummary: text('conduct_summary'),
  attendanceSummary: jsonb('attendance_summary').$type<{
    totalDays?: number
    presentDays?: number
    absentDays?: number
    lateDays?: number
  }>(),

  templateVersion: text('template_version'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  classTermIdx: index('idx_report_cards_class_term').on(table.classId, table.termId),
  statusIdx: index('idx_report_cards_status').on(table.status),
  studentIdx: index('idx_report_cards_student').on(table.studentId),
  schoolYearIdx: index('idx_report_cards_school_year').on(table.schoolYearId),
  uniqueStudentTerm: unique('unique_student_term').on(table.studentId, table.termId),
}))

// Teacher Comments (Subject-Specific)
export const teacherComments = pgTable('teacher_comments', {
  id: text('id').primaryKey(),
  reportCardId: text('report_card_id').notNull().references(() => reportCards.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  reportIdx: index('idx_teacher_comments_report').on(table.reportCardId),
  teacherIdx: index('idx_teacher_comments_teacher').on(table.teacherId),
  uniqueReportSubject: unique('unique_report_subject').on(table.reportCardId, table.subjectId),
}))

// Timetable Sessions
export const timetableSessions = pgTable('timetable_sessions', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  classroomId: text('classroom_id').references(() => classrooms.id, { onDelete: 'set null' }),

  dayOfWeek: smallint('day_of_week').notNull(), // 1-7 (Monday-Sunday)
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format

  effectiveFrom: date('effective_from'),
  effectiveUntil: date('effective_until'),
  isRecurring: boolean('is_recurring').default(true),

  notes: text('notes'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  classDayIdx: index('idx_timetable_class_day').on(table.classId, table.dayOfWeek),
  teacherDayIdx: index('idx_timetable_teacher_day').on(table.teacherId, table.dayOfWeek),
  classroomDayIdx: index('idx_timetable_classroom_day').on(table.classroomId, table.dayOfWeek),
  conflictsIdx: index('idx_timetable_conflicts').on(table.schoolId, table.dayOfWeek, table.startTime, table.endTime),
  schoolYearDayIdx: index('idx_timetable_school_year_day').on(table.schoolId, table.schoolYearId, table.dayOfWeek),
}))

// Class Sessions (Actual Teaching Sessions)
export const classSessionStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const
export type ClassSessionStatus = typeof classSessionStatuses[number]

export const classSessions = pgTable('class_sessions', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id').references(() => programTemplateChapters.id, { onDelete: 'set null' }),
  timetableSessionId: text('timetable_session_id').references(() => timetableSessions.id, { onDelete: 'set null' }),

  date: date('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  topic: text('topic'),
  objectives: text('objectives'),
  homework: text('homework'),

  status: text('status', { enum: classSessionStatuses }).default('scheduled').notNull(),
  completedAt: timestamp('completed_at'),

  studentsPresent: integer('students_present'),
  studentsAbsent: integer('students_absent'),
  notes: text('notes'),
  attachments: jsonb('attachments').$type<{ name: string, url: string, type: string }[]>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  classSubjectIdx: index('idx_class_sessions_class_subject').on(table.classId, table.subjectId),
  chapterIdx: index('idx_class_sessions_chapter').on(table.chapterId),
  dateIdx: index('idx_class_sessions_date').on(table.date),
  teacherIdx: index('idx_class_sessions_teacher').on(table.teacherId),
  statusIdx: index('idx_class_sessions_status').on(table.status),
}))

// Curriculum Progress
export const progressStatuses = ['on_track', 'slightly_behind', 'significantly_behind', 'ahead'] as const
export type ProgressStatus = typeof progressStatuses[number]

export const curriculumProgress = pgTable('curriculum_progress', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  programTemplateId: text('program_template_id').notNull().references(() => programTemplates.id, { onDelete: 'cascade' }),
  termId: text('term_id').notNull().references(() => terms.id, { onDelete: 'cascade' }),

  totalChapters: integer('total_chapters').notNull().default(0),
  completedChapters: integer('completed_chapters').notNull().default(0),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).notNull().default('0'),

  expectedPercentage: decimal('expected_percentage', { precision: 5, scale: 2 }),
  variance: decimal('variance', { precision: 5, scale: 2 }),

  status: text('status', { enum: progressStatuses }).default('on_track').notNull(),

  lastChapterCompletedAt: timestamp('last_chapter_completed_at'),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
}, table => ({
  classIdx: index('idx_progress_class').on(table.classId),
  statusIdx: index('idx_progress_status').on(table.status),
  termIdx: index('idx_progress_term').on(table.termId),
  subjectIdx: index('idx_progress_subject').on(table.subjectId),
  uniqueClassSubjectTerm: unique('unique_class_subject_term').on(table.classId, table.subjectId, table.termId),
}))

// Chapter Completions
export const chapterCompletions = pgTable('chapter_completions', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id').notNull().references(() => programTemplateChapters.id, { onDelete: 'cascade' }),
  classSessionId: text('class_session_id').references(() => classSessions.id, { onDelete: 'set null' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),

  completedAt: timestamp('completed_at').defaultNow().notNull(),
  notes: text('notes'),
}, table => ({
  classSubjectIdx: index('idx_chapter_completions_class').on(table.classId, table.subjectId),
  chapterIdx: index('idx_chapter_completions_chapter').on(table.chapterId),
  uniqueClassChapter: unique('unique_class_chapter').on(table.classId, table.chapterId),
}))

// --- Phase 16 Relations ---

export const reportCardTemplatesRelations = relations(reportCardTemplates, ({ one, many }) => ({
  school: one(schools, {
    fields: [reportCardTemplates.schoolId],
    references: [schools.id],
  }),
  reportCards: many(reportCards),
}))

export const reportCardsRelations = relations(reportCards, ({ one, many }) => ({
  student: one(students, {
    fields: [reportCards.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [reportCards.classId],
    references: [classes.id],
  }),
  term: one(terms, {
    fields: [reportCards.termId],
    references: [terms.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [reportCards.schoolYearId],
    references: [schoolYears.id],
  }),
  template: one(reportCardTemplates, {
    fields: [reportCards.templateId],
    references: [reportCardTemplates.id],
  }),
  generatedByUser: one(users, {
    fields: [reportCards.generatedBy],
    references: [users.id],
  }),
  teacherComments: many(teacherComments),
}))

export const teacherCommentsRelations = relations(teacherComments, ({ one }) => ({
  reportCard: one(reportCards, {
    fields: [teacherComments.reportCardId],
    references: [reportCards.id],
  }),
  subject: one(subjects, {
    fields: [teacherComments.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [teacherComments.teacherId],
    references: [teachers.id],
  }),
}))

export const timetableSessionsRelations = relations(timetableSessions, ({ one, many }) => ({
  school: one(schools, {
    fields: [timetableSessions.schoolId],
    references: [schools.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [timetableSessions.schoolYearId],
    references: [schoolYears.id],
  }),
  class: one(classes, {
    fields: [timetableSessions.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [timetableSessions.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [timetableSessions.teacherId],
    references: [teachers.id],
  }),
  classroom: one(classrooms, {
    fields: [timetableSessions.classroomId],
    references: [classrooms.id],
  }),
  classSessions: many(classSessions),
}))

export const classSessionsRelations = relations(classSessions, ({ one }) => ({
  class: one(classes, {
    fields: [classSessions.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [classSessions.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [classSessions.teacherId],
    references: [teachers.id],
  }),
  chapter: one(programTemplateChapters, {
    fields: [classSessions.chapterId],
    references: [programTemplateChapters.id],
  }),
  timetableSession: one(timetableSessions, {
    fields: [classSessions.timetableSessionId],
    references: [timetableSessions.id],
  }),
}))

export const curriculumProgressRelations = relations(curriculumProgress, ({ one }) => ({
  class: one(classes, {
    fields: [curriculumProgress.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [curriculumProgress.subjectId],
    references: [subjects.id],
  }),
  programTemplate: one(programTemplates, {
    fields: [curriculumProgress.programTemplateId],
    references: [programTemplates.id],
  }),
  term: one(terms, {
    fields: [curriculumProgress.termId],
    references: [terms.id],
  }),
}))

export const chapterCompletionsRelations = relations(chapterCompletions, ({ one }) => ({
  class: one(classes, {
    fields: [chapterCompletions.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [chapterCompletions.subjectId],
    references: [subjects.id],
  }),
  chapter: one(programTemplateChapters, {
    fields: [chapterCompletions.chapterId],
    references: [programTemplateChapters.id],
  }),
  classSession: one(classSessions, {
    fields: [chapterCompletions.classSessionId],
    references: [classSessions.id],
  }),
  teacher: one(teachers, {
    fields: [chapterCompletions.teacherId],
    references: [teachers.id],
  }),
}))

// --- Phase 17: School Life Management ---

// Teacher Attendance Status Types
export const teacherAttendanceStatuses = ['present', 'late', 'absent', 'excused', 'on_leave'] as const
export type TeacherAttendanceStatus = (typeof teacherAttendanceStatuses)[number]

// Student Attendance Status Types
export const studentAttendanceStatuses = ['present', 'late', 'absent', 'excused'] as const
export type StudentAttendanceStatus = (typeof studentAttendanceStatuses)[number]

// Absence Reason Categories
export const absenceReasonCategories = ['illness', 'family', 'transport', 'weather', 'other', 'unexcused'] as const
export type AbsenceReasonCategory = (typeof absenceReasonCategories)[number]

// Conduct Types
export const conductTypes = ['incident', 'sanction', 'reward', 'note'] as const
export type ConductType = (typeof conductTypes)[number]

// Conduct Categories
export const conductCategories = [
  'behavior',
  'academic',
  'attendance',
  'uniform',
  'property',
  'violence',
  'bullying',
  'cheating',
  'achievement',
  'improvement',
  'general',
  'other',
] as const
export type ConductCategory = (typeof conductCategories)[number]

// Severity Levels
export const severityLevels = ['low', 'medium', 'high', 'critical', 'urgent'] as const
export type SeverityLevel = (typeof severityLevels)[number]

// Sanction Types
export const sanctionTypes = [
  'verbal_warning',
  'written_warning',
  'detention',
  'suspension',
  'community_service',
  'parent_meeting',
  'expulsion',
  'other',
] as const
export type SanctionType = (typeof sanctionTypes)[number]

// Reward Types
export const rewardTypes = [
  'certificate',
  'merit_points',
  'public_recognition',
  'prize',
  'scholarship',
  'other',
] as const
export type RewardType = (typeof rewardTypes)[number]

// Conduct Status
export const conductStatuses = ['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed'] as const
export type ConductStatus = (typeof conductStatuses)[number]

// Alert Types
export const alertTypes = [
  'teacher_repeated_lateness',
  'teacher_absence_streak',
  'student_chronic_absence',
  'student_attendance_drop',
  'class_low_attendance',
] as const
export type AlertType = (typeof alertTypes)[number]

// Alert Status
export const alertStatuses = ['active', 'acknowledged', 'resolved', 'dismissed'] as const
export type AlertStatus = (typeof alertStatuses)[number]

// Notification Methods
export const notificationMethods = ['email', 'sms', 'in_app'] as const
export type NotificationMethod = (typeof notificationMethods)[number]

// Alert Severity
export const alertSeverities = ['info', 'warning', 'critical'] as const
export type AlertSeverity = (typeof alertSeverities)[number]

// Teacher Attendance Table
export const teacherAttendance = pgTable('teacher_attendance', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  status: text('status', { enum: teacherAttendanceStatuses }).default('present').notNull(),
  arrivalTime: text('arrival_time'),
  departureTime: text('departure_time'),
  lateMinutes: integer('late_minutes'),
  reason: text('reason'),
  notes: text('notes'),
  recordedBy: text('recorded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  teacherDateIdx: index('idx_teacher_attendance_teacher_date').on(table.teacherId, table.date),
  schoolDateIdx: index('idx_teacher_attendance_school_date').on(table.schoolId, table.date),
  statusIdx: index('idx_teacher_attendance_status').on(table.status),
  dateRangeIdx: index('idx_teacher_attendance_date_range').on(table.schoolId, table.date),
  uniqueTeacherDate: unique('unique_teacher_date').on(table.teacherId, table.date),
}))

// Student Attendance Table
export const studentAttendance = pgTable('student_attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  classSessionId: text('class_session_id').references(() => classSessions.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  status: text('status', { enum: studentAttendanceStatuses }).default('present').notNull(),
  arrivalTime: text('arrival_time'),
  lateMinutes: integer('late_minutes'),
  reason: text('reason'),
  reasonCategory: text('reason_category', { enum: absenceReasonCategories }),
  excusedBy: text('excused_by').references(() => users.id, { onDelete: 'set null' }),
  excusedAt: timestamp('excused_at'),
  parentNotified: boolean('parent_notified').default(false),
  notifiedAt: timestamp('notified_at'),
  notificationMethod: text('notification_method', { enum: notificationMethods }),
  notes: text('notes'),
  recordedBy: text('recorded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentDateIdx: index('idx_student_attendance_student_date').on(table.studentId, table.date),
  classDateSessionIdx: index('idx_student_attendance_class_date_session').on(table.classId, table.date, table.classSessionId),
  sessionIdx: index('idx_student_attendance_session').on(table.classSessionId),
  statusIdx: index('idx_student_attendance_status').on(table.status),
  schoolDateStatusIdx: index('idx_student_attendance_school_date_status').on(table.schoolId, table.date, table.status),
  uniqueAttendance: unique('unique_student_attendance').on(table.studentId, table.date, table.classId, table.classSessionId).nullsNotDistinct(),
}))

// Conduct Records Table
export const conductRecords = pgTable('conduct_records', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  classId: text('class_id').references(() => classes.id, { onDelete: 'set null' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  type: text('type', { enum: conductTypes }).notNull(),
  category: text('category', { enum: conductCategories }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: severityLevels }),
  incidentDate: date('incident_date'),
  incidentTime: text('incident_time'),
  location: text('location'),
  witnesses: text('witnesses').array(),
  sanctionType: text('sanction_type', { enum: sanctionTypes }),
  sanctionStartDate: date('sanction_start_date'),
  sanctionEndDate: date('sanction_end_date'),
  sanctionDetails: text('sanction_details'),
  rewardType: text('reward_type', { enum: rewardTypes }),
  pointsAwarded: integer('points_awarded'),
  status: text('status', { enum: conductStatuses }).default('open').notNull(),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  parentNotified: boolean('parent_notified').default(false),
  parentNotifiedAt: timestamp('parent_notified_at'),
  parentAcknowledged: boolean('parent_acknowledged').default(false),
  parentAcknowledgedAt: timestamp('parent_acknowledged_at'),
  parentResponse: text('parent_response'),
  attachments: jsonb('attachments').$type<{ name: string, url: string, type: string }[]>().default([]),
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentIdx: index('idx_conduct_student').on(table.studentId),
  schoolYearIdx: index('idx_conduct_school_year').on(table.schoolId, table.schoolYearId),
  typeIdx: index('idx_conduct_type').on(table.type),
  categoryIdx: index('idx_conduct_category').on(table.category),
  statusIdx: index('idx_conduct_status').on(table.status),
  severityIdx: index('idx_conduct_severity').on(table.severity),
  dateIdx: index('idx_conduct_date').on(table.incidentDate),
  studentYearIdx: index('idx_conduct_student_year').on(table.studentId, table.schoolYearId),
}))

// Conduct Follow-ups Table
export const conductFollowUps = pgTable('conduct_follow_ups', {
  id: text('id').primaryKey(),
  conductRecordId: text('conduct_record_id').notNull().references(() => conductRecords.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  notes: text('notes'),
  outcome: text('outcome'),
  followUpDate: date('follow_up_date'),
  completedAt: timestamp('completed_at'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  conductIdx: index('idx_follow_ups_conduct').on(table.conductRecordId),
  dateIdx: index('idx_follow_ups_date').on(table.followUpDate),
}))

// Attendance Alerts Table
export const attendanceAlerts = pgTable('attendance_alerts', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  alertType: text('alert_type', { enum: alertTypes }).notNull(),
  teacherId: text('teacher_id').references(() => teachers.id, { onDelete: 'cascade' }),
  studentId: text('student_id').references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').references(() => classes.id, { onDelete: 'cascade' }),
  severity: text('severity', { enum: alertSeverities }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data').$type<Record<string, unknown> | null>(),
  status: text('status', { enum: alertStatuses }).default('active').notNull(),
  acknowledgedBy: text('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedAt: timestamp('resolved_at'),
  notifiedUsers: jsonb('notified_users').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, table => ({
  schoolIdx: index('idx_alerts_school').on(table.schoolId),
  statusIdx: index('idx_alerts_status').on(table.status),
  typeIdx: index('idx_alerts_type').on(table.alertType),
  teacherIdx: index('idx_alerts_teacher').on(table.teacherId),
  studentIdx: index('idx_alerts_student').on(table.studentId),
  activeIdx: index('idx_alerts_active').on(table.schoolId, table.status),
}))

// Attendance Settings Table
export const attendanceSettings = pgTable('attendance_settings', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  teacherExpectedArrival: text('teacher_expected_arrival').default('07:30'),
  teacherLateThresholdMinutes: integer('teacher_late_threshold_minutes').default(15),
  teacherLatenessAlertCount: integer('teacher_lateness_alert_count').default(3),
  studentLateThresholdMinutes: integer('student_late_threshold_minutes').default(10),
  chronicAbsenceThresholdPercent: decimal('chronic_absence_threshold_percent', { precision: 5, scale: 2 }).default('10.00'),
  notifyParentOnAbsence: boolean('notify_parent_on_absence').default(true),
  notifyParentOnLate: boolean('notify_parent_on_late').default(false),
  workingDays: smallint('working_days').array().default([1, 2, 3, 4, 5]),
  notificationMethods: text('notification_methods').array().default(['email']),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_attendance_settings_school').on(table.schoolId),
  uniqueSchool: unique('unique_attendance_settings_school').on(table.schoolId),
}))

// --- Phase 17 Relations ---

export const teacherAttendanceRelations = relations(teacherAttendance, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherAttendance.teacherId],
    references: [teachers.id],
  }),
  school: one(schools, {
    fields: [teacherAttendance.schoolId],
    references: [schools.id],
  }),
  recordedByUser: one(users, {
    fields: [teacherAttendance.recordedBy],
    references: [users.id],
  }),
}))

export const studentAttendanceRelations = relations(studentAttendance, ({ one }) => ({
  student: one(students, {
    fields: [studentAttendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentAttendance.classId],
    references: [classes.id],
  }),
  school: one(schools, {
    fields: [studentAttendance.schoolId],
    references: [schools.id],
  }),
  classSession: one(classSessions, {
    fields: [studentAttendance.classSessionId],
    references: [classSessions.id],
  }),
  excusedByUser: one(users, {
    fields: [studentAttendance.excusedBy],
    references: [users.id],
  }),
  recordedByUser: one(users, {
    fields: [studentAttendance.recordedBy],
    references: [users.id],
  }),
}))

export const conductRecordsRelations = relations(conductRecords, ({ one, many }) => ({
  student: one(students, {
    fields: [conductRecords.studentId],
    references: [students.id],
  }),
  school: one(schools, {
    fields: [conductRecords.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [conductRecords.classId],
    references: [classes.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [conductRecords.schoolYearId],
    references: [schoolYears.id],
  }),
  assignedToUser: one(users, {
    fields: [conductRecords.assignedTo],
    references: [users.id],
  }),
  recordedByUser: one(users, {
    fields: [conductRecords.recordedBy],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [conductRecords.resolvedBy],
    references: [users.id],
  }),
  followUps: many(conductFollowUps),
}))

export const conductFollowUpsRelations = relations(conductFollowUps, ({ one }) => ({
  conductRecord: one(conductRecords, {
    fields: [conductFollowUps.conductRecordId],
    references: [conductRecords.id],
  }),
  createdByUser: one(users, {
    fields: [conductFollowUps.createdBy],
    references: [users.id],
  }),
}))

export const attendanceAlertsRelations = relations(attendanceAlerts, ({ one }) => ({
  school: one(schools, {
    fields: [attendanceAlerts.schoolId],
    references: [schools.id],
  }),
  teacher: one(teachers, {
    fields: [attendanceAlerts.teacherId],
    references: [teachers.id],
  }),
  student: one(students, {
    fields: [attendanceAlerts.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendanceAlerts.classId],
    references: [classes.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [attendanceAlerts.acknowledgedBy],
    references: [users.id],
  }),
}))

export const attendanceSettingsRelations = relations(attendanceSettings, ({ one }) => ({
  school: one(schools, {
    fields: [attendanceSettings.schoolId],
    references: [schools.id],
  }),
}))

// --- Phase 18: Financial Management ---

// Account Types
export const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const
export type AccountType = (typeof accountTypes)[number]

// Normal Balance Types
export const normalBalances = ['debit', 'credit'] as const
export type NormalBalance = (typeof normalBalances)[number]

// Transaction Types
export const transactionTypes = ['journal', 'payment', 'receipt', 'refund', 'adjustment', 'opening', 'closing'] as const
export type TransactionType = (typeof transactionTypes)[number]

// Transaction Statuses
export const transactionStatuses = ['draft', 'posted', 'voided'] as const
export type TransactionStatus = (typeof transactionStatuses)[number]

// Fee Categories
export const feeCategories = ['tuition', 'registration', 'exam', 'transport', 'uniform', 'books', 'meals', 'activities', 'other'] as const
export type FeeCategory = (typeof feeCategories)[number]

// Discount Types
export const discountTypes = ['sibling', 'scholarship', 'staff', 'early_payment', 'financial_aid', 'other'] as const
export type DiscountType = (typeof discountTypes)[number]

// Calculation Types
export const calculationTypes = ['percentage', 'fixed'] as const
export type CalculationType = (typeof calculationTypes)[number]

// Payment Methods
export const paymentMethods = ['cash', 'bank_transfer', 'mobile_money', 'card', 'check', 'other'] as const
export type PaymentMethod = (typeof paymentMethods)[number]

// Mobile Providers (West Africa)
export const mobileProviders = ['orange', 'mtn', 'moov', 'wave', 'other'] as const
export type MobileProvider = (typeof mobileProviders)[number]

// Fee Statuses
export const feeStatuses = ['pending', 'partial', 'paid', 'waived', 'cancelled'] as const
export type FeeStatus = (typeof feeStatuses)[number]

// Installment Statuses
export const installmentStatuses = ['pending', 'partial', 'paid', 'overdue', 'waived'] as const
export type InstallmentStatus = (typeof installmentStatuses)[number]

// Payment Statuses
export const paymentStatuses = ['pending', 'completed', 'cancelled', 'refunded', 'partial_refund'] as const
export type PaymentStatus = (typeof paymentStatuses)[number]

// Payment Plan Statuses
export const paymentPlanStatuses = ['active', 'completed', 'defaulted', 'cancelled'] as const
export type PaymentPlanStatus = (typeof paymentPlanStatuses)[number]

// Refund Statuses
export const refundStatuses = ['pending', 'approved', 'rejected', 'processed', 'cancelled'] as const
export type RefundStatus = (typeof refundStatuses)[number]

// Refund Reason Categories
export const refundReasonCategories = ['overpayment', 'withdrawal', 'transfer', 'error', 'other'] as const
export type RefundReasonCategory = (typeof refundReasonCategories)[number]

// Refund Methods
export const refundMethods = ['cash', 'bank_transfer', 'mobile_money', 'check', 'credit'] as const
export type RefundMethod = (typeof refundMethods)[number]

// Fiscal Year Statuses
export const fiscalYearStatuses = ['open', 'closed', 'locked'] as const
export type FiscalYearStatus = (typeof fiscalYearStatuses)[number]

// Student Discount Statuses
export const studentDiscountStatuses = ['pending', 'approved', 'rejected'] as const
export type StudentDiscountStatus = (typeof studentDiscountStatuses)[number]

// Accounts Table (Chart of Accounts)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  type: text('type', { enum: accountTypes }).notNull(),
  parentId: text('parent_id'),
  level: smallint('level').notNull().default(1),
  isHeader: boolean('is_header').default(false),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0'),
  normalBalance: text('normal_balance', { enum: normalBalances }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_accounts_school').on(table.schoolId),
  parentIdx: index('idx_accounts_parent').on(table.parentId),
  typeIdx: index('idx_accounts_type').on(table.type),
  codeIdx: index('idx_accounts_code').on(table.schoolId, table.code),
  hierarchyIdx: index('idx_accounts_hierarchy').on(table.schoolId, table.level, table.parentId),
  uniqueSchoolCode: unique('unique_school_account_code').on(table.schoolId, table.code),
}))

// Fiscal Years Table
export const fiscalYears = pgTable('fiscal_years', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status', { enum: fiscalYearStatuses }).default('open'),
  closedAt: timestamp('closed_at'),
  closedBy: text('closed_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_fiscal_years_school').on(table.schoolId),
  statusIdx: index('idx_fiscal_years_status').on(table.status),
  datesIdx: index('idx_fiscal_years_dates').on(table.schoolId, table.startDate, table.endDate),
  uniqueSchoolYear: unique('unique_school_fiscal_year').on(table.schoolId, table.schoolYearId),
}))

// Fee Types Table
export const feeTypes = pgTable('fee_types', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  feeTypeTemplateId: text('fee_type_template_id').references(() => feeTypeTemplates.id), // Template reference for SaaS architecture
  code: text('code').notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  category: text('category', { enum: feeCategories }).notNull(),
  isMandatory: boolean('is_mandatory').default(true),
  isRecurring: boolean('is_recurring').default(true),
  revenueAccountId: text('revenue_account_id').references(() => accounts.id, { onDelete: 'set null' }),
  receivableAccountId: text('receivable_account_id').references(() => accounts.id, { onDelete: 'set null' }),
  displayOrder: smallint('display_order').default(0),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_fee_types_school').on(table.schoolId),
  templateIdx: index('idx_fee_types_template').on(table.feeTypeTemplateId),
  categoryIdx: index('idx_fee_types_category').on(table.category),
  statusIdx: index('idx_fee_types_status').on(table.status),
  uniqueSchoolCode: unique('unique_school_fee_code').on(table.schoolId, table.code),
  uniqueSchoolTemplate: unique('unique_school_fee_template').on(table.schoolId, table.feeTypeTemplateId).nullsNotDistinct(),
}))

// Fee Structures Table
export const feeStructures = pgTable('fee_structures', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  feeTypeId: text('fee_type_id').notNull().references(() => feeTypes.id, { onDelete: 'cascade' }),
  gradeId: text('grade_id').references(() => grades.id, { onDelete: 'cascade' }),
  seriesId: text('series_id').references(() => series.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('XOF'),
  newStudentAmount: decimal('new_student_amount', { precision: 15, scale: 2 }),
  effectiveDate: date('effective_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolYearIdx: index('idx_fee_structures_school_year').on(table.schoolId, table.schoolYearId),
  gradeIdx: index('idx_fee_structures_grade').on(table.gradeId),
  feeTypeIdx: index('idx_fee_structures_fee_type').on(table.feeTypeId),
  lookupIdx: index('idx_fee_structures_lookup').on(table.schoolId, table.schoolYearId, table.gradeId),
  uniqueFeeStructure: unique('unique_fee_structure').on(table.schoolId, table.schoolYearId, table.feeTypeId, table.gradeId, table.seriesId).nullsNotDistinct(),
}))

// Discounts Table
export const discounts = pgTable('discounts', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  type: text('type', { enum: discountTypes }).notNull(),
  calculationType: text('calculation_type', { enum: calculationTypes }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  appliesToFeeTypes: text('applies_to_fee_types').array(),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 15, scale: 2 }),
  requiresApproval: boolean('requires_approval').default(false),
  autoApply: boolean('auto_apply').default(false),
  validFrom: date('valid_from'),
  validUntil: date('valid_until'),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_discounts_school').on(table.schoolId),
  typeIdx: index('idx_discounts_type').on(table.type),
  statusIdx: index('idx_discounts_status').on(table.status),
  uniqueSchoolCode: unique('unique_school_discount_code').on(table.schoolId, table.code),
}))

// Payment Plan Templates Table
export const paymentPlanTemplates = pgTable('payment_plan_templates', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  installmentsCount: smallint('installments_count').notNull(),
  schedule: jsonb('schedule').$type<{ number: number, percentage: number, dueDaysFromStart: number, label: string }[]>().notNull(),
  isDefault: boolean('is_default').default(false),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_payment_plan_templates_school').on(table.schoolId),
  yearIdx: index('idx_payment_plan_templates_year').on(table.schoolYearId),
}))

// Payment Plans Table (Student-specific)
export const paymentPlans = pgTable('payment_plans', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  templateId: text('template_id').references(() => paymentPlanTemplates.id, { onDelete: 'set null' }),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull(),
  status: text('status', { enum: paymentPlanStatuses }).default('active'),
  notes: text('notes'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentIdx: index('idx_payment_plans_student').on(table.studentId),
  yearIdx: index('idx_payment_plans_year').on(table.schoolYearId),
  statusIdx: index('idx_payment_plans_status').on(table.status),
  uniqueStudentYear: unique('unique_student_payment_plan').on(table.studentId, table.schoolYearId),
}))

// Installments Table
export const installments = pgTable('installments', {
  id: text('id').primaryKey(),
  paymentPlanId: text('payment_plan_id').notNull().references(() => paymentPlans.id, { onDelete: 'cascade' }),
  installmentNumber: smallint('installment_number').notNull(),
  label: text('label'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status', { enum: installmentStatuses }).default('pending'),
  paidAt: timestamp('paid_at'),
  daysOverdue: integer('days_overdue').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  planIdx: index('idx_installments_plan').on(table.paymentPlanId),
  dueDateIdx: index('idx_installments_due_date').on(table.dueDate),
  statusIdx: index('idx_installments_status').on(table.status),
}))

// Student Fees Table
export const studentFees = pgTable('student_fees', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  enrollmentId: text('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  feeStructureId: text('fee_structure_id').notNull().references(() => feeStructures.id, { onDelete: 'restrict' }),
  originalAmount: decimal('original_amount', { precision: 15, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull(),
  status: text('status', { enum: feeStatuses }).default('pending'),
  waivedAt: timestamp('waived_at'),
  waivedBy: text('waived_by').references(() => users.id, { onDelete: 'set null' }),
  waiverReason: text('waiver_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentIdx: index('idx_student_fees_student').on(table.studentId),
  enrollmentIdx: index('idx_student_fees_enrollment').on(table.enrollmentId),
  statusIdx: index('idx_student_fees_status').on(table.status),
  uniqueStudentFee: unique('unique_student_fee').on(table.studentId, table.enrollmentId, table.feeStructureId),
}))

// Student Discounts Table
export const studentDiscounts = pgTable('student_discounts', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  discountId: text('discount_id').notNull().references(() => discounts.id, { onDelete: 'restrict' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  calculatedAmount: decimal('calculated_amount', { precision: 15, scale: 2 }).notNull(),
  status: text('status', { enum: studentDiscountStatuses }).default('pending'),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  studentIdx: index('idx_student_discounts_student').on(table.studentId),
  yearIdx: index('idx_student_discounts_year').on(table.schoolYearId),
  statusIdx: index('idx_student_discounts_status').on(table.status),
  uniqueStudentDiscountYear: unique('unique_student_discount_year').on(table.studentId, table.discountId, table.schoolYearId),
}))

// Payments Table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  paymentPlanId: text('payment_plan_id').references(() => paymentPlans.id, { onDelete: 'set null' }),
  receiptNumber: text('receipt_number').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('XOF'),
  method: text('method', { enum: paymentMethods }).notNull(),
  reference: text('reference'),
  bankName: text('bank_name'),
  mobileProvider: text('mobile_provider', { enum: mobileProviders }),
  paymentDate: date('payment_date').notNull(),
  payerName: text('payer_name'),
  payerPhone: text('payer_phone'),
  notes: text('notes'),
  status: text('status', { enum: paymentStatuses }).default('completed'),
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: text('cancelled_by').references(() => users.id, { onDelete: 'set null' }),
  cancellationReason: text('cancellation_reason'),
  processedBy: text('processed_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_payments_school').on(table.schoolId),
  studentIdx: index('idx_payments_student').on(table.studentId),
  planIdx: index('idx_payments_plan').on(table.paymentPlanId),
  dateIdx: index('idx_payments_date').on(table.schoolId, table.paymentDate),
  methodIdx: index('idx_payments_method').on(table.method),
  statusIdx: index('idx_payments_status').on(table.status),
  receiptIdx: index('idx_payments_receipt').on(table.schoolId, table.receiptNumber),
  processedByIdx: index('idx_payments_processed_by').on(table.processedBy, table.paymentDate),
  uniqueReceipt: unique('unique_receipt_number').on(table.schoolId, table.receiptNumber),
}))

// Payment Allocations Table
export const paymentAllocations = pgTable('payment_allocations', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  studentFeeId: text('student_fee_id').notNull().references(() => studentFees.id, { onDelete: 'restrict' }),
  installmentId: text('installment_id').references(() => installments.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  paymentIdx: index('idx_payment_allocations_payment').on(table.paymentId),
  feeIdx: index('idx_payment_allocations_fee').on(table.studentFeeId),
  installmentIdx: index('idx_payment_allocations_installment').on(table.installmentId),
}))

// Transactions Table (Accounting)
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  fiscalYearId: text('fiscal_year_id').notNull().references(() => fiscalYears.id, { onDelete: 'restrict' }),
  transactionNumber: text('transaction_number').notNull(),
  date: date('date').notNull(),
  type: text('type', { enum: transactionTypes }).notNull(),
  description: text('description').notNull(),
  reference: text('reference'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('XOF'),
  studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),
  paymentId: text('payment_id').references(() => payments.id, { onDelete: 'set null' }),
  status: text('status', { enum: transactionStatuses }).default('posted'),
  voidedAt: timestamp('voided_at'),
  voidedBy: text('voided_by').references(() => users.id, { onDelete: 'set null' }),
  voidReason: text('void_reason'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_transactions_school').on(table.schoolId),
  fiscalYearIdx: index('idx_transactions_fiscal_year').on(table.fiscalYearId),
  dateIdx: index('idx_transactions_date').on(table.schoolId, table.date),
  typeIdx: index('idx_transactions_type').on(table.type),
  statusIdx: index('idx_transactions_status').on(table.status),
  uniqueTransactionNumber: unique('unique_transaction_number').on(table.schoolId, table.transactionNumber),
}))

// Transaction Lines Table (Double-Entry)
export const transactionLines = pgTable('transaction_lines', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
  lineNumber: smallint('line_number').notNull(),
  description: text('description'),
  debitAmount: decimal('debit_amount', { precision: 15, scale: 2 }).default('0'),
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  transactionIdx: index('idx_transaction_lines_transaction').on(table.transactionId),
  accountIdx: index('idx_transaction_lines_account').on(table.accountId),
  amountsIdx: index('idx_transaction_lines_amounts').on(table.accountId, table.debitAmount, table.creditAmount),
}))

// Receipts Table
export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  receiptNumber: text('receipt_number').notNull(),
  studentName: text('student_name').notNull(),
  studentMatricule: text('student_matricule').notNull(),
  className: text('class_name').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  amountInWords: text('amount_in_words'),
  paymentMethod: text('payment_method').notNull(),
  paymentReference: text('payment_reference'),
  paymentDate: date('payment_date').notNull(),
  feeDetails: jsonb('fee_details').$type<{ feeType: string, amount: number }[]>().notNull(),
  schoolName: text('school_name').notNull(),
  schoolAddress: text('school_address'),
  schoolPhone: text('school_phone'),
  schoolLogoUrl: text('school_logo_url'),
  issuedBy: text('issued_by').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  reprintCount: integer('reprint_count').default(0),
  lastReprintedAt: timestamp('last_reprinted_at'),
  lastReprintedBy: text('last_reprinted_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  paymentIdx: index('idx_receipts_payment').on(table.paymentId),
  numberIdx: index('idx_receipts_number').on(table.receiptNumber),
  dateIdx: index('idx_receipts_date').on(table.paymentDate),
}))

// Refunds Table
export const refunds = pgTable('refunds', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').notNull().references(() => payments.id, { onDelete: 'restrict' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  refundNumber: text('refund_number').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  reasonCategory: text('reason_category', { enum: refundReasonCategories }),
  method: text('method', { enum: refundMethods }).notNull(),
  reference: text('reference'),
  status: text('status', { enum: refundStatuses }).default('pending'),
  requestedBy: text('requested_by').notNull().references(() => users.id),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  processedBy: text('processed_by').references(() => users.id, { onDelete: 'set null' }),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  paymentIdx: index('idx_refunds_payment').on(table.paymentId),
  schoolIdx: index('idx_refunds_school').on(table.schoolId),
  statusIdx: index('idx_refunds_status').on(table.status),
  dateIdx: index('idx_refunds_date').on(table.schoolId, table.requestedAt),
  uniqueRefundNumber: unique('unique_refund_number').on(table.schoolId, table.refundNumber),
}))

// --- Phase 18 Relations ---

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  school: one(schools, { fields: [accounts.schoolId], references: [schools.id] }),
  parent: one(accounts, { fields: [accounts.parentId], references: [accounts.id], relationName: 'accountHierarchy' }),
  children: many(accounts, { relationName: 'accountHierarchy' }),
  transactionLines: many(transactionLines),
  feeTypesRevenue: many(feeTypes, { relationName: 'revenueAccount' }),
  feeTypesReceivable: many(feeTypes, { relationName: 'receivableAccount' }),
}))

export const fiscalYearsRelations = relations(fiscalYears, ({ one, many }) => ({
  school: one(schools, { fields: [fiscalYears.schoolId], references: [schools.id] }),
  schoolYear: one(schoolYears, { fields: [fiscalYears.schoolYearId], references: [schoolYears.id] }),
  closedByUser: one(users, { fields: [fiscalYears.closedBy], references: [users.id] }),
  transactions: many(transactions),
}))

export const feeTypesRelations = relations(feeTypes, ({ one, many }) => ({
  school: one(schools, { fields: [feeTypes.schoolId], references: [schools.id] }),
  revenueAccount: one(accounts, { fields: [feeTypes.revenueAccountId], references: [accounts.id], relationName: 'revenueAccount' }),
  receivableAccount: one(accounts, { fields: [feeTypes.receivableAccountId], references: [accounts.id], relationName: 'receivableAccount' }),
  feeStructures: many(feeStructures),
}))

export const feeStructuresRelations = relations(feeStructures, ({ one, many }) => ({
  school: one(schools, { fields: [feeStructures.schoolId], references: [schools.id] }),
  schoolYear: one(schoolYears, { fields: [feeStructures.schoolYearId], references: [schoolYears.id] }),
  feeType: one(feeTypes, { fields: [feeStructures.feeTypeId], references: [feeTypes.id] }),
  grade: one(grades, { fields: [feeStructures.gradeId], references: [grades.id] }),
  series: one(series, { fields: [feeStructures.seriesId], references: [series.id] }),
  studentFees: many(studentFees),
}))

export const discountsRelations = relations(discounts, ({ one, many }) => ({
  school: one(schools, { fields: [discounts.schoolId], references: [schools.id] }),
  studentDiscounts: many(studentDiscounts),
}))

export const paymentPlanTemplatesRelations = relations(paymentPlanTemplates, ({ one, many }) => ({
  school: one(schools, { fields: [paymentPlanTemplates.schoolId], references: [schools.id] }),
  schoolYear: one(schoolYears, { fields: [paymentPlanTemplates.schoolYearId], references: [schoolYears.id] }),
  paymentPlans: many(paymentPlans),
}))

export const paymentPlansRelations = relations(paymentPlans, ({ one, many }) => ({
  student: one(students, { fields: [paymentPlans.studentId], references: [students.id] }),
  schoolYear: one(schoolYears, { fields: [paymentPlans.schoolYearId], references: [schoolYears.id] }),
  template: one(paymentPlanTemplates, { fields: [paymentPlans.templateId], references: [paymentPlanTemplates.id] }),
  createdByUser: one(users, { fields: [paymentPlans.createdBy], references: [users.id] }),
  installments: many(installments),
  payments: many(payments),
}))

export const installmentsRelations = relations(installments, ({ one, many }) => ({
  paymentPlan: one(paymentPlans, { fields: [installments.paymentPlanId], references: [paymentPlans.id] }),
  paymentAllocations: many(paymentAllocations),
}))

export const studentFeesRelations = relations(studentFees, ({ one, many }) => ({
  student: one(students, { fields: [studentFees.studentId], references: [students.id] }),
  enrollment: one(enrollments, { fields: [studentFees.enrollmentId], references: [enrollments.id] }),
  feeStructure: one(feeStructures, { fields: [studentFees.feeStructureId], references: [feeStructures.id] }),
  waivedByUser: one(users, { fields: [studentFees.waivedBy], references: [users.id] }),
  paymentAllocations: many(paymentAllocations),
}))

export const studentDiscountsRelations = relations(studentDiscounts, ({ one }) => ({
  student: one(students, { fields: [studentDiscounts.studentId], references: [students.id] }),
  discount: one(discounts, { fields: [studentDiscounts.discountId], references: [discounts.id] }),
  schoolYear: one(schoolYears, { fields: [studentDiscounts.schoolYearId], references: [schoolYears.id] }),
  approvedByUser: one(users, { fields: [studentDiscounts.approvedBy], references: [users.id] }),
}))

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  school: one(schools, { fields: [payments.schoolId], references: [schools.id] }),
  student: one(students, { fields: [payments.studentId], references: [students.id] }),
  paymentPlan: one(paymentPlans, { fields: [payments.paymentPlanId], references: [paymentPlans.id] }),
  processedByUser: one(users, { fields: [payments.processedBy], references: [users.id] }),
  cancelledByUser: one(users, { fields: [payments.cancelledBy], references: [users.id] }),
  allocations: many(paymentAllocations),
  receipts: many(receipts),
  refunds: many(refunds),
  transactions: many(transactions),
}))

export const paymentAllocationsRelations = relations(paymentAllocations, ({ one }) => ({
  payment: one(payments, { fields: [paymentAllocations.paymentId], references: [payments.id] }),
  studentFee: one(studentFees, { fields: [paymentAllocations.studentFeeId], references: [studentFees.id] }),
  installment: one(installments, { fields: [paymentAllocations.installmentId], references: [installments.id] }),
}))

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  school: one(schools, { fields: [transactions.schoolId], references: [schools.id] }),
  fiscalYear: one(fiscalYears, { fields: [transactions.fiscalYearId], references: [fiscalYears.id] }),
  student: one(students, { fields: [transactions.studentId], references: [students.id] }),
  payment: one(payments, { fields: [transactions.paymentId], references: [payments.id] }),
  createdByUser: one(users, { fields: [transactions.createdBy], references: [users.id] }),
  voidedByUser: one(users, { fields: [transactions.voidedBy], references: [users.id] }),
  lines: many(transactionLines),
}))

export const transactionLinesRelations = relations(transactionLines, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionLines.transactionId], references: [transactions.id] }),
  account: one(accounts, { fields: [transactionLines.accountId], references: [accounts.id] }),
}))

export const receiptsRelations = relations(receipts, ({ one }) => ({
  payment: one(payments, { fields: [receipts.paymentId], references: [payments.id] }),
  lastReprintedByUser: one(users, { fields: [receipts.lastReprintedBy], references: [users.id] }),
}))

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, { fields: [refunds.paymentId], references: [payments.id] }),
  school: one(schools, { fields: [refunds.schoolId], references: [schools.id] }),
  requestedByUser: one(users, { fields: [refunds.requestedBy], references: [users.id] }),
  approvedByUser: one(users, { fields: [refunds.approvedBy], references: [users.id] }),
  processedByUser: one(users, { fields: [refunds.processedBy], references: [users.id] }),
}))

// --- Type Exports ---

// Insert types
export type UserInsert = typeof users.$inferInsert
export type UserSchoolInsert = typeof userSchools.$inferInsert
export type RoleInsert = typeof roles.$inferInsert
export type UserRoleInsert = typeof userRoles.$inferInsert
export type TeacherInsert = typeof teachers.$inferInsert
export type TeacherSubjectInsert = typeof teacherSubjects.$inferInsert
export type StaffInsert = typeof staff.$inferInsert
export type ClassroomInsert = typeof classrooms.$inferInsert
export type SchoolYearInsert = typeof schoolYears.$inferInsert
export type TermInsert = typeof terms.$inferInsert
export type ClassInsert = typeof classes.$inferInsert
export type ClassSubjectInsert = typeof classSubjects.$inferInsert
export type StudentInsert = typeof students.$inferInsert
export type ParentInsert = typeof parents.$inferInsert
export type StudentParentInsert = typeof studentParents.$inferInsert
export type EnrollmentInsert = typeof enrollments.$inferInsert
export type AuditLogInsert = typeof auditLogs.$inferInsert
export type SchoolSubjectCoefficientInsert = typeof schoolSubjectCoefficients.$inferInsert
export type SchoolSubjectInsert = typeof schoolSubjects.$inferInsert
export type MatriculeSequenceInsert = typeof matriculeSequences.$inferInsert
export type StudentGradeInsert = typeof studentGrades.$inferInsert
export type GradeValidationInsert = typeof gradeValidations.$inferInsert
export type StudentAverageInsert = typeof studentAverages.$inferInsert
// Phase 16 Insert types
export type ReportCardTemplateInsert = typeof reportCardTemplates.$inferInsert
export type ReportCardInsert = typeof reportCards.$inferInsert
export type TeacherCommentInsert = typeof teacherComments.$inferInsert
export type TimetableSessionInsert = typeof timetableSessions.$inferInsert
export type ClassSessionInsert = typeof classSessions.$inferInsert
export type CurriculumProgressInsert = typeof curriculumProgress.$inferInsert
export type ChapterCompletionInsert = typeof chapterCompletions.$inferInsert

// Data types (for seeding)
export type RoleData = Omit<RoleInsert, 'id' | 'createdAt' | 'updatedAt'>

// Select types
export type User = typeof users.$inferSelect
export type UserSchool = typeof userSchools.$inferSelect
export type Role = typeof roles.$inferSelect
export type UserRole = typeof userRoles.$inferSelect
export type Teacher = typeof teachers.$inferSelect
export type TeacherSubject = typeof teacherSubjects.$inferSelect
export type Staff = typeof staff.$inferSelect
export type Classroom = typeof classrooms.$inferSelect
export type SchoolYear = typeof schoolYears.$inferSelect
export type Term = typeof terms.$inferSelect
export type Class = typeof classes.$inferSelect
export type ClassSubject = typeof classSubjects.$inferSelect
export type Student = typeof students.$inferSelect
export type Parent = typeof parents.$inferSelect
export type StudentParent = typeof studentParents.$inferSelect
export type Enrollment = typeof enrollments.$inferSelect
export type AuditLog = typeof auditLogs.$inferSelect
export type SchoolSubjectCoefficient = typeof schoolSubjectCoefficients.$inferSelect
export type SchoolSubject = typeof schoolSubjects.$inferSelect
export type MatriculeSequence = typeof matriculeSequences.$inferSelect
export type StudentGrade = typeof studentGrades.$inferSelect
export type GradeValidation = typeof gradeValidations.$inferSelect
export type StudentAverage = typeof studentAverages.$inferSelect
// Phase 16 Select types
export type ReportCardTemplate = typeof reportCardTemplates.$inferSelect
export type ReportCard = typeof reportCards.$inferSelect
export type TeacherComment = typeof teacherComments.$inferSelect
export type TimetableSession = typeof timetableSessions.$inferSelect
export type ClassSession = typeof classSessions.$inferSelect
export type CurriculumProgress = typeof curriculumProgress.$inferSelect
export type ChapterCompletion = typeof chapterCompletions.$inferSelect
// Phase 17 Insert types
export type TeacherAttendanceInsert = typeof teacherAttendance.$inferInsert
export type StudentAttendanceInsert = typeof studentAttendance.$inferInsert
export type ConductRecordInsert = typeof conductRecords.$inferInsert
export type ConductFollowUpInsert = typeof conductFollowUps.$inferInsert
export type AttendanceAlertInsert = typeof attendanceAlerts.$inferInsert
export type AttendanceSettingsInsert = typeof attendanceSettings.$inferInsert
// Phase 17 Select types
export type TeacherAttendance = typeof teacherAttendance.$inferSelect
export type StudentAttendance = typeof studentAttendance.$inferSelect
export type ConductRecord = typeof conductRecords.$inferSelect
export type ConductFollowUp = typeof conductFollowUps.$inferSelect
export type AttendanceAlert = typeof attendanceAlerts.$inferSelect
export type AttendanceSettings = typeof attendanceSettings.$inferSelect
// Phase 18 Insert types
export type AccountInsert = typeof accounts.$inferInsert
export type FiscalYearInsert = typeof fiscalYears.$inferInsert
export type FeeTypeInsert = typeof feeTypes.$inferInsert
export type FeeStructureInsert = typeof feeStructures.$inferInsert
export type DiscountInsert = typeof discounts.$inferInsert
export type PaymentPlanTemplateInsert = typeof paymentPlanTemplates.$inferInsert
export type PaymentPlanInsert = typeof paymentPlans.$inferInsert
export type InstallmentInsert = typeof installments.$inferInsert
export type StudentFeeInsert = typeof studentFees.$inferInsert
export type StudentDiscountInsert = typeof studentDiscounts.$inferInsert
export type PaymentInsert = typeof payments.$inferInsert
export type PaymentAllocationInsert = typeof paymentAllocations.$inferInsert
export type TransactionInsert = typeof transactions.$inferInsert
export type TransactionLineInsert = typeof transactionLines.$inferInsert
export type ReceiptInsert = typeof receipts.$inferInsert
export type RefundInsert = typeof refunds.$inferInsert
// Phase 18 Select types
export type Account = typeof accounts.$inferSelect
export type FiscalYear = typeof fiscalYears.$inferSelect
export type FeeType = typeof feeTypes.$inferSelect
export type FeeStructure = typeof feeStructures.$inferSelect
export type Discount = typeof discounts.$inferSelect
export type PaymentPlanTemplate = typeof paymentPlanTemplates.$inferSelect
export type PaymentPlan = typeof paymentPlans.$inferSelect
export type Installment = typeof installments.$inferSelect
export type StudentFee = typeof studentFees.$inferSelect
export type StudentDiscount = typeof studentDiscounts.$inferSelect
export type Payment = typeof payments.$inferSelect
export type PaymentAllocation = typeof paymentAllocations.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type TransactionLine = typeof transactionLines.$inferSelect
export type Receipt = typeof receipts.$inferSelect
export type Refund = typeof refunds.$inferSelect

// --- Phase 19: Teacher App Tables ---

// Participation Grades (Session Participation Tracking)
export const participationGradeValues = [1, 2, 3, 4, 5] as const
export type ParticipationGradeValue = typeof participationGradeValues[number]

export const participationGrades = pgTable('participation_grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classSessionId: text('class_session_id').notNull().references(() => classSessions.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  grade: smallint('grade').notNull(), // 1-5 scale
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  sessionIdx: index('idx_participation_session').on(table.classSessionId),
  studentIdx: index('idx_participation_student').on(table.studentId),
  teacherIdx: index('idx_participation_teacher').on(table.teacherId),
  uniqueStudentSession: unique('unique_student_session_participation').on(table.studentId, table.classSessionId),
}))

// Homework Assignments
export const homeworkStatuses = ['draft', 'active', 'closed', 'cancelled'] as const
export type HomeworkStatus = typeof homeworkStatuses[number]

export const homework = pgTable('homework', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  classSessionId: text('class_session_id').references(() => classSessions.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time'), // HH:MM format
  maxPoints: smallint('max_points'),
  isGraded: boolean('is_graded').default(false),
  attachments: jsonb('attachments').$type<{ name: string, url: string, type: string, size: number }[]>().default([]),
  status: text('status', { enum: homeworkStatuses }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  classIdx: index('idx_homework_class').on(table.classId),
  teacherStatusIdx: index('idx_homework_teacher_status').on(table.teacherId, table.status),
  dueDateIdx: index('idx_homework_due_date').on(table.dueDate),
  statusIdx: index('idx_homework_status').on(table.status),
  classDueIdx: index('idx_homework_class_due').on(table.classId, table.dueDate),
}))

// Homework Submissions (for future use)
export const submissionStatuses = ['submitted', 'late', 'graded', 'returned'] as const
export type SubmissionStatus = typeof submissionStatuses[number]

export const homeworkSubmissions = pgTable('homework_submissions', {
  id: text('id').primaryKey(),
  homeworkId: text('homework_id').notNull().references(() => homework.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  content: text('content'),
  attachments: jsonb('attachments').$type<{ name: string, url: string, type: string, size: number }[]>().default([]),
  grade: decimal('grade', { precision: 5, scale: 2 }),
  gradedAt: timestamp('graded_at'),
  gradedBy: text('graded_by').references(() => teachers.id, { onDelete: 'set null' }),
  feedback: text('feedback'),
  status: text('status', { enum: submissionStatuses }).default('submitted').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  homeworkIdx: index('idx_submission_homework').on(table.homeworkId),
  studentIdx: index('idx_submission_student').on(table.studentId),
  uniqueHomeworkStudent: unique('unique_homework_student').on(table.homeworkId, table.studentId),
}))

// Teacher Messages (Parent-Teacher Communication)
export const messageSenderTypes = ['teacher', 'parent'] as const
export type MessageSenderType = typeof messageSenderTypes[number]

export const teacherMessages = pgTable('teacher_messages', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  senderType: text('sender_type', { enum: messageSenderTypes }).notNull(),
  senderId: text('sender_id').notNull(),
  recipientType: text('recipient_type', { enum: messageSenderTypes }).notNull(),
  recipientId: text('recipient_id').notNull(),
  studentId: text('student_id').references(() => students.id, { onDelete: 'set null' }),
  classId: text('class_id').references(() => classes.id, { onDelete: 'set null' }),
  threadId: text('thread_id'),
  replyToId: text('reply_to_id'),
  subject: text('subject'),
  content: text('content').notNull(),
  attachments: jsonb('attachments').$type<{ name: string, url: string, type: string, size: number }[]>().default([]),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isArchived: boolean('is_archived').default(false),
  isStarred: boolean('is_starred').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  senderIdx: index('idx_messages_sender').on(table.senderType, table.senderId),
  recipientArchivedIdx: index('idx_messages_recipient_archived').on(table.recipientType, table.recipientId, table.isArchived),
  threadCreatedIdx: index('idx_messages_thread_created').on(table.threadId, table.createdAt),
  createdIdx: index('idx_messages_created').on(table.createdAt),
}))

// Message Templates
export const messageCategories = ['attendance', 'grades', 'behavior', 'general', 'reminder', 'congratulations'] as const
export type MessageCategory = typeof messageCategories[number]

export const messageTemplates = pgTable('message_templates', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  category: text('category', { enum: messageCategories }).notNull(),
  subject: text('subject'),
  content: text('content').notNull(),
  placeholders: jsonb('placeholders').$type<string[]>().default([]),
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_templates_school').on(table.schoolId),
  categoryIdx: index('idx_templates_category').on(table.category),
}))

// Teacher Notifications
export const notificationTypes = ['message', 'grade_validation', 'schedule_change', 'attendance_alert', 'system', 'reminder'] as const
export type NotificationType = typeof notificationTypes[number]

export const teacherNotifications = pgTable('teacher_notifications', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  type: text('type', { enum: notificationTypes }).notNull(),
  title: text('title').notNull(),
  body: text('body'),
  actionType: text('action_type'),
  actionData: jsonb('action_data').$type<{ route?: string, params?: Record<string, string> }>(),
  relatedType: text('related_type'),
  relatedId: text('related_id'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, table => ({
  teacherIdx: index('idx_notifications_teacher').on(table.teacherId),
  createdIdx: index('idx_notifications_created').on(table.createdAt),
}))

// Phase 19 Relations
export const participationGradesRelations = relations(participationGrades, ({ one }) => ({
  student: one(students, { fields: [participationGrades.studentId], references: [students.id] }),
  classSession: one(classSessions, { fields: [participationGrades.classSessionId], references: [classSessions.id] }),
  teacher: one(teachers, { fields: [participationGrades.teacherId], references: [teachers.id] }),
}))

export const homeworkRelations = relations(homework, ({ one, many }) => ({
  school: one(schools, { fields: [homework.schoolId], references: [schools.id] }),
  class: one(classes, { fields: [homework.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [homework.subjectId], references: [subjects.id] }),
  teacher: one(teachers, { fields: [homework.teacherId], references: [teachers.id] }),
  classSession: one(classSessions, { fields: [homework.classSessionId], references: [classSessions.id] }),
  submissions: many(homeworkSubmissions),
}))

export const homeworkSubmissionsRelations = relations(homeworkSubmissions, ({ one }) => ({
  homework: one(homework, { fields: [homeworkSubmissions.homeworkId], references: [homework.id] }),
  student: one(students, { fields: [homeworkSubmissions.studentId], references: [students.id] }),
  gradedByTeacher: one(teachers, { fields: [homeworkSubmissions.gradedBy], references: [teachers.id] }),
}))

export const teacherMessagesRelations = relations(teacherMessages, ({ one }) => ({
  school: one(schools, { fields: [teacherMessages.schoolId], references: [schools.id] }),
  student: one(students, { fields: [teacherMessages.studentId], references: [students.id] }),
  class: one(classes, { fields: [teacherMessages.classId], references: [classes.id] }),
}))

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
  school: one(schools, { fields: [messageTemplates.schoolId], references: [schools.id] }),
  creator: one(users, { fields: [messageTemplates.createdBy], references: [users.id] }),
}))

export const teacherNotificationsRelations = relations(teacherNotifications, ({ one }) => ({
  teacher: one(teachers, { fields: [teacherNotifications.teacherId], references: [teachers.id] }),
}))

// Phase 19 Type Exports
export type ParticipationGrade = typeof participationGrades.$inferSelect
export type ParticipationGradeInsert = typeof participationGrades.$inferInsert
export type Homework = typeof homework.$inferSelect
export type HomeworkInsert = typeof homework.$inferInsert
export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect
export type HomeworkSubmissionInsert = typeof homeworkSubmissions.$inferInsert
export type TeacherMessage = typeof teacherMessages.$inferSelect
export type TeacherMessageInsert = typeof teacherMessages.$inferInsert
export type MessageTemplate = typeof messageTemplates.$inferSelect
export type MessageTemplateInsert = typeof messageTemplates.$inferInsert
export type TeacherNotification = typeof teacherNotifications.$inferSelect
export type TeacherNotificationInsert = typeof teacherNotifications.$inferInsert

// School Files & Storage Metadata
export const schoolFiles = pgTable('school_files', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  key: text('key').notNull().unique(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size'),
  entityType: text('entity_type'), // student, staff, user
  entityId: text('entity_id'),
  uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  deletedBy: text('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, table => ({
  schoolIdx: index('idx_school_files_school').on(table.schoolId),
  entityIdx: index('idx_school_files_entity').on(table.entityType, table.entityId),
  deletedAtIdx: index('idx_school_files_deleted_at').on(table.deletedAt),
}))

export const schoolFilesRelations = relations(schoolFiles, ({ one }) => ({
  school: one(schools, { fields: [schoolFiles.schoolId], references: [schools.id] }),
  uploader: one(users, { fields: [schoolFiles.uploadedBy], references: [users.id] }),
  deleter: one(users, { fields: [schoolFiles.deletedBy], references: [users.id] }),
}))

export type SchoolFile = typeof schoolFiles.$inferSelect
export type SchoolFileInsert = typeof schoolFiles.$inferInsert

// --- Teacher Tracking ---

export const trackingEvents = pgTable('tracking_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  teacherId: text('teacher_id').notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal('accuracy', { precision: 8, scale: 2 }),
  type: text('type').notNull(), // 'start', 'ping', 'end'
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  sessionIdx: index('idx_tracking_session').on(table.sessionId),
  teacherIdx: index('idx_tracking_teacher').on(table.teacherId),
  schoolIdx: index('idx_tracking_school').on(table.schoolId),
  timestampIdx: index('idx_tracking_timestamp').on(table.timestamp),
}))

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  teacher: one(teachers, {
    fields: [trackingEvents.teacherId],
    references: [teachers.id],
  }),
  school: one(schools, {
    fields: [trackingEvents.schoolId],
    references: [schools.id],
  }),
}))

export type TrackingEventInsert = typeof trackingEvents.$inferInsert
export type TrackingEventSelect = typeof trackingEvents.$inferSelect
