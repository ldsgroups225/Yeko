import type { RoleData } from '../drizzle/school-schema'

export const defaultRoles: RoleData[] = [
  {
    name: 'Administrateur Scolaire',
    slug: 'school_administrator',
    description: 'Accès complet à tous les modules',
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
    },
  },
  {
    name: 'Coordinateur Académique',
    slug: 'academic_coordinator',
    description: 'Gestion du curriculum et validation des notes',
    scope: 'school',
    permissions: {
      teachers: ['view'],
      students: ['view'],
      classes: ['view'],
      grades: ['view', 'validate'],
      reports: ['view', 'export'],
      settings: ['view'],
    },
  },
  {
    name: 'Responsable Discipline',
    slug: 'discipline_officer',
    description: 'Gestion de la présence et de la conduite',
    scope: 'school',
    permissions: {
      students: ['view'],
      attendance: ['view', 'create', 'edit'],
      conduct: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
    },
  },
  {
    name: 'Comptable',
    slug: 'accountant',
    description: 'Gestion financière et rapports',
    scope: 'school',
    permissions: {
      students: ['view'],
      finance: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
    },
  },
  {
    name: 'Caissier',
    slug: 'cashier',
    description: 'Traitement des paiements uniquement',
    scope: 'school',
    permissions: {
      students: ['view'],
      finance: ['view', 'process_payment'],
    },
  },
  {
    name: 'Registraire',
    slug: 'registrar',
    description: 'Gestion des dossiers étudiants et inscriptions',
    scope: 'school',
    permissions: {
      students: ['view', 'create', 'edit', 'enroll'],
      parents: ['view', 'create', 'edit'],
      enrollments: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
    },
  },
]
