import type { RoleData } from '../drizzle/school-schema'

export const defaultRoles: RoleData[] = [
  // --- ROLES SYSTÈME (Pour la plateforme Yeko) ---
  {
    name: 'Super Administrateur',
    slug: 'super_admin',
    description: 'Accès total à toutes les ressources du système et de toutes les écoles.',
    scope: 'system',
    isSystemRole: true,
    extraLanguages: {
      en: {
        name: 'Super Administrator',
        description: 'Full access to all system and school resources.',
      },
    },
    permissions: {
      schools: ['view', 'create', 'edit', 'delete'],
      users: ['view', 'create', 'edit', 'delete'],
      system_monitoring: ['view', 'manage'],
      global_settings: ['view', 'edit'],
    },
  },
  {
    name: 'Administrateur Système',
    slug: 'system_admin',
    description: 'Gestion de la plateforme et maintenance globale.',
    scope: 'system',
    isSystemRole: true,
    extraLanguages: {
      en: {
        name: 'System Administrator',
        description: 'Platform management and global maintenance.',
      },
    },
    permissions: {
      schools: ['view', 'create', 'edit'],
      users: ['view', 'create', 'edit'],
      system_monitoring: ['view'],
      global_settings: ['view'],
    },
  },

  // --- ROLES ÉCOLE (MVP RECOMMANDÉ) ---
  {
    name: 'Fondateur / Promoteur',
    slug: 'school_founder',
    description: 'Accès global stratégique : effectifs, finances et performances globales.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Founder / Promoter',
        description: 'Strategic global access: enrollment, finance, and global performance.',
      },
    },
    permissions: {
      users: ['view', 'manage'],
      teachers: ['view', 'manage'],
      staff: ['view', 'manage'],
      students: ['view', 'manage'],
      parents: ['view', 'manage'],
      classes: ['view', 'manage'],
      classrooms: ['view', 'manage'],
      grades: ['view', 'manage'],
      attendance: ['view', 'manage'],
      conduct: ['view', 'manage'],
      finance: ['view', 'manage'],
      reports: ['view', 'manage', 'export'],
      settings: ['view', 'manage'],
      school_subjects: ['view', 'manage'],
      coefficients: ['view', 'manage'],
      teacher_assignments: ['view', 'manage'],
    },
  },
  {
    name: 'Directeur / Proviseur / Principal',
    slug: 'school_director',
    description: 'Chef opérationnel : supervision générale, validation des décisions et discipline.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Principal / Director',
        description: 'Operational head: general supervision, decision validation, and discipline.',
      },
    },
    permissions: {
      users: ['view', 'create', 'edit'],
      teachers: ['view', 'create', 'edit'],
      staff: ['view', 'create', 'edit'],
      students: ['view', 'create', 'edit'],
      parents: ['view', 'create', 'edit'],
      classes: ['view', 'create', 'edit'],
      classrooms: ['view', 'create', 'edit'],
      grades: ['view', 'validate'],
      attendance: ['view', 'create'],
      conduct: ['view', 'create', 'validate'],
      finance: ['view'],
      reports: ['view', 'export'],
      settings: ['view', 'edit'],
      school_subjects: ['view'],
      coefficients: ['view'],
    },
  },
  {
    name: 'Censeur',
    slug: 'school_censor',
    description: 'Gestion de la vie scolaire : absences, retards, discipline et examens internes.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Censor / Dean',
        description: 'School life management: absences, delays, discipline, and internal exams.',
      },
    },
    permissions: {
      students: ['view'],
      classes: ['view'],
      attendance: ['view', 'create', 'edit', 'delete'],
      conduct: ['view', 'create', 'edit', 'delete'],
      grades: ['view'],
      reports: ['view', 'export'],
      school_subjects: ['view'],
      coefficients: ['view'],
    },
  },
  {
    name: 'Professeur / Enseignant',
    slug: 'teacher',
    description: 'Cœur pédagogique : saisie des notes, appréciations et suivi académique.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Teacher / Professor',
        description: 'Pedagogical core: entry of grades, evaluations, and academic tracking.',
      },
    },
    permissions: {
      students: ['view'],
      classes: ['view'],
      grades: ['view', 'create', 'edit'],
      school_subjects: ['view'],
      attendance: ['view', 'create'],
    },
  },
  {
    name: 'Éducateur',
    slug: 'educator',
    description: 'Encadrement quotidien : surveillance, marquage des absences et rapports d\'incidents.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Educator / Proctor',
        description: 'Daily supervision: monitoring, marking absences, and incident reports.',
      },
    },
    permissions: {
      students: ['view'],
      attendance: ['view', 'create', 'edit'],
      conduct: ['view', 'create'],
    },
  },
  {
    name: 'Secrétaire',
    slug: 'secretary',
    description: 'Administration : inscriptions, dossiers élèves, certificats et communication.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Secretary',
        description: 'Administration: registrations, student records, certificates, and communication.',
      },
    },
    permissions: {
      students: ['view', 'create', 'edit', 'enroll'],
      parents: ['view', 'create', 'edit'],
      enrollments: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
      classes: ['view'],
    },
  },
  {
    name: 'Comptable',
    slug: 'accountant',
    description: 'Gestion financière globale : frais, dépenses, salaires et reporting.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Accountant',
        description: 'Global financial management: fees, expenses, salaries, and reporting.',
      },
    },
    permissions: {
      students: ['view'],
      finance: ['view', 'create', 'edit'],
      reports: ['view', 'export'],
    },
  },
  {
    name: 'Caissier/ère',
    slug: 'cashier',
    description: 'Opérations quotidiennes : encaissement des frais et émission de reçus.',
    scope: 'school',
    extraLanguages: {
      en: {
        name: 'Cashier',
        description: 'Daily operations: fee collection and receipt issuance.',
      },
    },
    permissions: {
      students: ['view'],
      finance: ['view', 'process_payment'],
    },
  },
]
