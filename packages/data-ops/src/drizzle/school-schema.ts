import { relations } from 'drizzle-orm'
import { boolean, date, index, integer, jsonb, pgTable, smallint, text, timestamp, unique } from 'drizzle-orm/pg-core'

// Import from core and auth schemas
import { auth_user } from './auth-schema'
import { coefficientTemplates, grades, schools, schoolYearTemplates, series, subjects, termTemplates } from './core-schema'

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
