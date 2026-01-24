import type { RoleData } from '../drizzle/school-schema'

export const defaultRoles: RoleData[] = [
  {
    name: 'roles.super_admin',
    slug: 'super_admin',
    description: 'roles.descriptions.super_admin',
    scope: 'system',
    permissions: {
      schools: ['view', 'create', 'edit', 'delete'],
      users: ['view', 'create', 'edit', 'delete'],
      system_monitoring: ['view', 'manage'],
      global_settings: ['view', 'edit'],
    },
  },
  {
    name: 'roles.system_admin',
    slug: 'system_admin',
    description: 'roles.descriptions.system_admin',
    scope: 'system',
    permissions: {
      schools: ['view', 'create', 'edit'],
      users: ['view', 'create', 'edit'],
      system_monitoring: ['view'],
      global_settings: ['view'],
    },
  },
  {
    name: 'roles.school_administrator',
    slug: 'school_administrator',
    description: 'roles.descriptions.school_administrator',
    scope: 'school',
    permissions: {
      users: ['view', 'create', 'edit', 'delete'],
      teachers: ['view', 'create', 'edit', 'delete', 'assign'],
      staff: ['view', 'create', 'edit', 'delete'],
      students: ['view', 'create', 'edit', 'delete', 'enroll'],
      parents: ['view', 'create', 'edit', 'delete'],
      classes: ['view', 'create', 'edit', 'delete'],
      classrooms: ['view', 'create', 'edit', 'delete'],
      grades: ['view', 'create', 'edit', 'validate', 'delete'],
      attendance: ['view', 'create', 'edit', 'delete'],
      conduct: ['view', 'create', 'edit', 'delete'],
      finance: ['view', 'create', 'edit', 'delete', 'process_payment'],
      reports: ['view', 'export'],
      settings: ['view', 'edit'],
      // Phase 14: Academic Management
      school_subjects: ['view', 'create', 'edit', 'delete'],
      coefficients: ['view', 'edit'],
      teacher_assignments: ['view', 'edit'],
    },
  },
  {
    name: 'roles.academic_coordinator',
    slug: 'academic_coordinator',
    description: 'roles.descriptions.academic_coordinator',
    scope: 'school',
    permissions: {
      teachers: ['view'],
      students: ['view'],
      classes: ['view'],
      grades: ['view', 'validate'],
      reports: ['view', 'export'],
      settings: ['view'],
      // Phase 14: Academic Management
      school_subjects: ['view', 'create', 'edit'],
      coefficients: ['view', 'edit'],
      teacher_assignments: ['view', 'edit'],
    },
  },
  {
    name: 'roles.discipline_officer',
    slug: 'discipline_officer',
    description: 'roles.descriptions.discipline_officer',
    scope: 'school',
    permissions: {
      students: ['view'],
      attendance: ['view', 'create', 'edit'],
      conduct: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
      // Phase 14: Academic Management (view only)
      school_subjects: ['view'],
      coefficients: ['view'],
    },
  },
  {
    name: 'roles.accountant',
    slug: 'accountant',
    description: 'roles.descriptions.accountant',
    scope: 'school',
    permissions: {
      students: ['view'],
      finance: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
    },
  },
  {
    name: 'roles.cashier',
    slug: 'cashier',
    description: 'roles.descriptions.cashier',
    scope: 'school',
    permissions: {
      students: ['view'],
      finance: ['view', 'process_payment'],
    },
  },
  {
    name: 'roles.registrar',
    slug: 'registrar',
    description: 'roles.descriptions.registrar',
    scope: 'school',
    permissions: {
      students: ['view', 'create', 'edit', 'enroll'],
      parents: ['view', 'create', 'edit'],
      enrollments: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
      // Phase 14: Academic Management (view only)
      school_subjects: ['view'],
      coefficients: ['view'],
    },
  },
]
