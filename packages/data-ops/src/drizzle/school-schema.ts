import { relations } from 'drizzle-orm'
import { boolean, date, decimal, index, integer, jsonb, pgTable, smallint, text, timestamp, unique } from 'drizzle-orm/pg-core'

// Import from core and auth schemas
import { auth_user } from './auth-schema'
import { coefficientTemplates, grades, programTemplateChapters, programTemplates, schools, schoolYearTemplates, series, subjects, termTemplates } from './core-schema'

// --- Level 0: Identity & Access (Foundation) ---

export const users = pgTable('users', {
  id: text('id').primaryKey(), // UUID or CUID
  authUserId: text('auth_user_id').unique().references(() => auth_user.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
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

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'), // For UI display
  permissions: jsonb('permissions').$type<Record<string, string[]>>().notNull().default({}),
  scope: text('scope', { enum: ['school', 'system'] }).notNull(),
  isSystemRole: boolean('is_system_role').default(false).notNull(), // Phase 11: Prevent deletion of system roles
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
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, table => ({
  compositeIdx: index('idx_user_roles_composite').on(table.userId, table.schoolId, table.roleId),
  schoolIdx: index('idx_user_roles_school').on(table.schoolId),
  uniqueUserRoleSchool: unique('unique_user_role_school').on(table.userId, table.roleId, table.schoolId),
}))

// --- Level 1: Organization Structure ---

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  specialization: text('specialization'),
  hireDate: date('hire_date'),
  status: text('status', { enum: ['active', 'inactive', 'on_leave'] }).default('active').notNull(),
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

export const staff = pgTable('staff', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  position: text('position').notNull(), // Academic Coordinator, Discipline Officer, etc.
  department: text('department'),
  hireDate: date('hire_date'),
  status: text('status', { enum: ['active', 'inactive', 'on_leave'] }).default('active').notNull(),
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

export const classrooms = pgTable('classrooms', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  type: text('type', { enum: ['regular', 'lab', 'gym', 'library', 'auditorium'] }).default('regular').notNull(),
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
  status: text('status', { enum: ['active', 'maintenance', 'inactive'] }).default('active').notNull(),
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
  status: text('status', { enum: ['active', 'archived'] }).default('active').notNull(),
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

export const classSubjects = pgTable('class_subjects', {
  id: text('id').primaryKey(),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  teacherId: text('teacher_id').references(() => teachers.id, { onDelete: 'set null' }),
  coefficient: integer('coefficient').notNull().default(1),
  hoursPerWeek: integer('hours_per_week').notNull().default(2),
  status: text('status', { enum: ['active', 'inactive'] }).default('active').notNull(),
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

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dob: date('dob').notNull(),
  gender: text('gender', { enum: ['M', 'F', 'other'] }),
  photoUrl: text('photo_url'),
  matricule: text('matricule').notNull(), // Format: AB2024C001
  status: text('status', { enum: ['active', 'graduated', 'transferred', 'withdrawn'] }).default('active').notNull(),
  // Phase 13: Enhanced fields
  birthPlace: text('birth_place'),
  nationality: text('nationality').default('Ivoirien'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  bloodType: text('blood_type', { enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }),
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
  invitationStatus: text('invitation_status', { enum: ['pending', 'sent', 'accepted', 'expired'] }).default('pending'),
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

export const studentParents = pgTable('student_parents', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  parentId: text('parent_id').notNull().references(() => parents.id, { onDelete: 'cascade' }),
  relationship: text('relationship', { enum: ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'] }).notNull(),
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

export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  schoolYearId: text('school_year_id').notNull().references(() => schoolYears.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled', 'transferred'] }).default('pending').notNull(),
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

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  schoolId: text('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  action: text('action', { enum: ['create', 'update', 'delete', 'view'] }).notNull(),
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
  teacherIdx: index('idx_grades_teacher').on(table.teacherId),
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
  schoolYearIdx: index('idx_timetable_school_year').on(table.schoolId, table.schoolYearId),
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
  'other',
] as const
export type ConductCategory = (typeof conductCategories)[number]

// Severity Levels
export const severityLevels = ['low', 'medium', 'high', 'critical'] as const
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
  classDateIdx: index('idx_student_attendance_class_date').on(table.classId, table.date),
  sessionIdx: index('idx_student_attendance_session').on(table.classSessionId),
  statusIdx: index('idx_student_attendance_status').on(table.status),
  schoolDateIdx: index('idx_student_attendance_school_date').on(table.schoolId, table.date),
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
  data: jsonb('data').$type<Record<string, unknown>>().default({}),
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

// Enum types
export type UserStatus = 'active' | 'inactive' | 'suspended'
export type TeacherStatus = 'active' | 'inactive' | 'on_leave'
export type StaffStatus = 'active' | 'inactive' | 'on_leave'
export type ClassroomType = 'regular' | 'lab' | 'gym' | 'library' | 'auditorium'
export type ClassroomStatus = 'active' | 'maintenance' | 'inactive'
export type ClassStatus = 'active' | 'archived'
export type ClassSubjectStatus = 'active' | 'inactive'
export type StudentStatus = 'active' | 'graduated' | 'transferred' | 'withdrawn'
export type Gender = 'M' | 'F' | 'other'
export type Relationship = 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'other'
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'transferred'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'expired'
export type AuditAction = 'create' | 'update' | 'delete' | 'view'
export type RoleScope = 'school' | 'system'
