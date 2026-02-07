/**
 * School App Mutation Key Factories
 *
 * Centralized mutation keys for TanStack Query v5 compatibility.
 * Following convention: ['app', 'domain', 'action']
 *
 * These keys enable:
 * - useMutationState() filtering for cross-component mutation tracking
 * - DevTools filtering and debugging
 * - Global mutation observers
 */

export const schoolMutationKeys = {
  // ============================================================================
  // Students & Enrollment
  // ============================================================================
  students: {
    create: ['school', 'students', 'create'] as const,
    update: ['school', 'students', 'update'] as const,
    delete: ['school', 'students', 'delete'] as const,
    import: ['school', 'students', 'import'] as const,
    uploadPhoto: ['school', 'students', 'upload-photo'] as const,
    transfer: ['school', 'students', 'transfer'] as const,
    bulkEnroll: ['school', 'students', 'bulk-enroll'] as const,
    bulkReEnroll: ['school', 'students', 'bulk-re-enroll'] as const,
    bulkAssignFees: ['school', 'students', 'bulk-assign-fees'] as const,
    bulkImport: ['school', 'students', 'bulk-import'] as const,
    validateImport: ['school', 'students', 'validate-import'] as const,
    generateMatricule: ['school', 'students', 'generate-matricule'] as const,
  },

  enrollments: {
    create: ['school', 'enrollments', 'create'] as const,
    update: ['school', 'enrollments', 'update'] as const,
    delete: ['school', 'enrollments', 'delete'] as const,
    activate: ['school', 'enrollments', 'activate'] as const,
    deactivate: ['school', 'enrollments', 'deactivate'] as const,
    cancel: ['school', 'enrollments', 'cancel'] as const,
    confirm: ['school', 'enrollments', 'confirm'] as const,
  },

  parents: {
    create: ['school', 'parents', 'create'] as const,
    update: ['school', 'parents', 'update'] as const,
    delete: ['school', 'parents', 'delete'] as const,
    link: ['school', 'parents', 'link'] as const,
    unlink: ['school', 'parents', 'unlink'] as const,
    invite: ['school', 'parents', 'invite'] as const,
    autoMatch: ['school', 'parents', 'auto-match'] as const,
  },

  // ============================================================================
  // Finance
  // ============================================================================
  fees: {
    assign: ['school', 'fees', 'assign'] as const,
    bulkAssign: ['school', 'fees', 'bulk-assign'] as const,
    remove: ['school', 'fees', 'remove'] as const,
  },

  feeStructures: {
    create: ['school', 'fee-structures', 'create'] as const,
    update: ['school', 'fee-structures', 'update'] as const,
    delete: ['school', 'fee-structures', 'delete'] as const,
  },

  feeTypes: {
    create: ['school', 'fee-types', 'create'] as const,
    update: ['school', 'fee-types', 'update'] as const,
    delete: ['school', 'fee-types', 'delete'] as const,
  },

  payments: {
    create: ['school', 'payments', 'create'] as const,
    update: ['school', 'payments', 'update'] as const,
    delete: ['school', 'payments', 'delete'] as const,
    void: ['school', 'payments', 'void'] as const,
  },

  paymentPlans: {
    create: ['school', 'payment-plans', 'create'] as const,
    cancel: ['school', 'payment-plans', 'cancel'] as const,
  },

  paymentPlanTemplates: {
    create: ['school', 'payment-plan-templates', 'create'] as const,
    update: ['school', 'payment-plan-templates', 'update'] as const,
    delete: ['school', 'payment-plan-templates', 'delete'] as const,
    setDefault: ['school', 'payment-plan-templates', 'set-default'] as const,
  },

  refunds: {
    create: ['school', 'refunds', 'create'] as const,
    update: ['school', 'refunds', 'update'] as const,
    approve: ['school', 'refunds', 'approve'] as const,
    reject: ['school', 'refunds', 'reject'] as const,
    process: ['school', 'refunds', 'process'] as const,
    cancel: ['school', 'refunds', 'cancel'] as const,
  },

  discounts: {
    create: ['school', 'discounts', 'create'] as const,
    update: ['school', 'discounts', 'update'] as const,
    delete: ['school', 'discounts', 'delete'] as const,
    apply: ['school', 'discounts', 'apply'] as const,
  },

  accounts: {
    create: ['school', 'accounts', 'create'] as const,
    update: ['school', 'accounts', 'update'] as const,
    delete: ['school', 'accounts', 'delete'] as const,
  },

  // ============================================================================
  // Staff & Users
  // ============================================================================
  users: {
    create: ['school', 'users', 'create'] as const,
    update: ['school', 'users', 'update'] as const,
    delete: ['school', 'users', 'delete'] as const,
    activate: ['school', 'users', 'activate'] as const,
    deactivate: ['school', 'users', 'deactivate'] as const,
  },

  teachers: {
    create: ['school', 'teachers', 'create'] as const,
    update: ['school', 'teachers', 'update'] as const,
    delete: ['school', 'teachers', 'delete'] as const,
    link: ['school', 'teachers', 'link'] as const,
    assign: ['school', 'teachers', 'assign'] as const,
    unassign: ['school', 'teachers', 'unassign'] as const,
  },

  // ============================================================================
  // Academic
  // ============================================================================
  classes: {
    create: ['school', 'classes', 'create'] as const,
    update: ['school', 'classes', 'update'] as const,
    delete: ['school', 'classes', 'delete'] as const,
  },

  subjects: {
    create: ['school', 'subjects', 'create'] as const,
    update: ['school', 'subjects', 'update'] as const,
    delete: ['school', 'subjects', 'delete'] as const,
    pick: ['school', 'subjects', 'pick'] as const,
  },

  schoolSubjects: {
    import: ['school', 'school-subjects', 'import'] as const,
    toggleStatus: ['school', 'school-subjects', 'toggle-status'] as const,
    delete: ['school', 'school-subjects', 'delete'] as const,
  },

  classSubjects: {
    create: ['school', 'class-subjects', 'create'] as const,
    update: ['school', 'class-subjects', 'update'] as const,
    delete: ['school', 'class-subjects', 'delete'] as const,
    copy: ['school', 'class-subjects', 'copy'] as const,
    assignTeacher: ['school', 'class-subjects', 'assign-teacher'] as const,
    save: ['school', 'class-subjects', 'save'] as const,
    updateConfig: ['school', 'class-subjects', 'update-config'] as const,
  },

  coefficients: {
    create: ['school', 'coefficients', 'create'] as const,
    update: ['school', 'coefficients', 'update'] as const,
    bulkUpdate: ['school', 'coefficients', 'bulk-update'] as const,
    delete: ['school', 'coefficients', 'delete'] as const,
    copy: ['school', 'coefficients', 'copy'] as const,
    reset: ['school', 'coefficients', 'reset'] as const,
  },

  assignments: {
    create: ['school', 'assignments', 'create'] as const,
    update: ['school', 'assignments', 'update'] as const,
    delete: ['school', 'assignments', 'delete'] as const,
    bulkAssign: ['school', 'assignments', 'bulk-assign'] as const,
  },

  // ============================================================================
  // Grades
  // ============================================================================
  grades: {
    save: ['school', 'grades', 'save'] as const,
    bulkSave: ['school', 'grades', 'bulk-save'] as const,
    validate: ['school', 'grades', 'validate'] as const,
    invalidate: ['school', 'grades', 'invalidate'] as const,
    publish: ['school', 'grades', 'publish'] as const,
    reject: ['school', 'grades', 'reject'] as const,
    delete: ['school', 'grades', 'delete'] as const,
  },

  reportCards: {
    generate: ['school', 'report-cards', 'generate'] as const,
    publish: ['school', 'report-cards', 'publish'] as const,
    configure: ['school', 'report-cards', 'configure'] as const,
    create: ['school', 'report-cards', 'create'] as const,
    update: ['school', 'report-cards', 'update'] as const,
    delete: ['school', 'report-cards', 'delete'] as const,
    bulkGenerate: ['school', 'report-cards', 'bulk-generate'] as const,
    send: ['school', 'report-cards', 'send'] as const,
    bulkSend: ['school', 'report-cards', 'bulk-send'] as const,
    markDelivered: ['school', 'report-cards', 'mark-delivered'] as const,
    markViewed: ['school', 'report-cards', 'mark-viewed'] as const,
  },

  reportCardTemplates: {
    create: ['school', 'report-card-templates', 'create'] as const,
    update: ['school', 'report-card-templates', 'update'] as const,
    delete: ['school', 'report-card-templates', 'delete'] as const,
  },

  teacherComments: {
    create: ['school', 'teacher-comments', 'create'] as const,
    update: ['school', 'teacher-comments', 'update'] as const,
    delete: ['school', 'teacher-comments', 'delete'] as const,
  },

  validations: {
    approve: ['school', 'validations', 'approve'] as const,
    reject: ['school', 'validations', 'reject'] as const,
    bulkApprove: ['school', 'validations', 'bulk-approve'] as const,
  },

  // ============================================================================
  // Conduct & Attendance
  // ============================================================================
  studentAttendance: {
    record: ['school', 'student-attendance', 'record'] as const,
    bulkRecord: ['school', 'student-attendance', 'bulk-record'] as const,
    excuse: ['school', 'student-attendance', 'excuse'] as const,
    notify: ['school', 'student-attendance', 'notify'] as const,
    delete: ['school', 'student-attendance', 'delete'] as const,
  },

  teacherAttendance: {
    record: ['school', 'teacher-attendance', 'record'] as const,
    bulkRecord: ['school', 'teacher-attendance', 'bulk-record'] as const,
    delete: ['school', 'teacher-attendance', 'delete'] as const,
  },

  conductRecords: {
    create: ['school', 'conduct-records', 'create'] as const,
    update: ['school', 'conduct-records', 'update'] as const,
    delete: ['school', 'conduct-records', 'delete'] as const,
  },

  alerts: {
    create: ['school', 'alerts', 'create'] as const,
    dismiss: ['school', 'alerts', 'dismiss'] as const,
    resolve: ['school', 'alerts', 'resolve'] as const,
    acknowledge: ['school', 'alerts', 'acknowledge'] as const,
  },

  conductSettings: {
    update: ['school', 'conduct-settings', 'update'] as const,
  },

  // ============================================================================
  // Timetables & Schedules
  // ============================================================================
  timetables: {
    create: ['school', 'timetables', 'create'] as const,
    update: ['school', 'timetables', 'update'] as const,
    delete: ['school', 'timetables', 'delete'] as const,
    deleteClass: ['school', 'timetables', 'delete-class'] as const,
    import: ['school', 'timetables', 'import'] as const,
  },

  schedules: {
    create: ['school', 'schedules', 'create'] as const,
    update: ['school', 'schedules', 'update'] as const,
    delete: ['school', 'schedules', 'delete'] as const,
  },

  // ============================================================================
  // Spaces
  // ============================================================================
  classrooms: {
    create: ['school', 'classrooms', 'create'] as const,
    update: ['school', 'classrooms', 'update'] as const,
    delete: ['school', 'classrooms', 'delete'] as const,
  },

  // ============================================================================
  // Settings & Configuration
  // ============================================================================
  schoolProfile: {
    update: ['school', 'school-profile', 'update'] as const,
    updateLogo: ['school', 'school-profile', 'update-logo'] as const,
    updateSettings: ['school', 'school-profile', 'update-settings'] as const,
  },

  schoolYears: {
    create: ['school', 'school-years', 'create'] as const,
    update: ['school', 'school-years', 'update'] as const,
    delete: ['school', 'school-years', 'delete'] as const,
    setActive: ['school', 'school-years', 'set-active'] as const,
    activate: ['school', 'school-years', 'activate'] as const,
  },

  terms: {
    create: ['school', 'terms', 'create'] as const,
    update: ['school', 'terms', 'update'] as const,
    delete: ['school', 'terms', 'delete'] as const,
  },

  notifications: {
    markRead: ['school', 'notifications', 'mark-read'] as const,
    markAllRead: ['school', 'notifications', 'mark-all-read'] as const,
    updateSettings: ['school', 'notifications', 'update-settings'] as const,
  },

  // ============================================================================
  // Context (School/Year selection)
  // ============================================================================
  context: {
    selectSchool: ['school', 'context', 'select-school'] as const,
    selectSchoolYear: ['school', 'context', 'select-school-year'] as const,
  },
}
