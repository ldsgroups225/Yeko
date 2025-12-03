/**
 * Test data generators for E2E tests
 * Provides realistic test data for Côte d'Ivoire context
 */

export const testData = {
  roles: {
    valid: {
      name: 'Directeur Pédagogique',
      slug: 'directeur-pedagogique',
      description: 'Responsable de la pédagogie et des programmes',
      scope: 'school',
    },
    withAccents: {
      name: 'Enseignant Côte d\'Ivoire',
      slug: 'enseignant-cote-d-ivoire',
      description: 'Enseignant certifié pour les écoles ivoiriennes',
      scope: 'school',
    },
  },

  users: {
    valid: {
      name: 'Kouassi Yao',
      email: 'kouassi.yao@yeko.test',
      phone: '+225 07 12 34 56 78',
      status: 'active',
    },
    withAccents: {
      name: 'Aïcha Traoré',
      email: 'aicha.traore@yeko.test',
      phone: '+225 05 98 76 54 32',
      status: 'active',
    },
  },

  staff: {
    valid: {
      position: 'principal',
      department: 'Administration',
      hireDate: '2024-01-15',
      status: 'active',
    },
    secretary: {
      position: 'secretary',
      department: 'Secrétariat',
      hireDate: '2024-03-01',
      status: 'active',
    },
  },

  teachers: {
    valid: {
      specialization: 'Mathématiques',
      hireDate: '2024-02-01',
      status: 'active',
      subjects: ['Mathématiques', 'Physique'],
    },
    withMultipleSubjects: {
      specialization: 'Sciences',
      hireDate: '2024-01-10',
      status: 'active',
      subjects: ['Biologie', 'Chimie', 'SVT'],
    },
  },

  permissions: {
    fullAccess: [
      { resource: 'users', action: 'view' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'edit' },
      { resource: 'users', action: 'delete' },
      { resource: 'roles', action: 'view' },
      { resource: 'roles', action: 'create' },
      { resource: 'roles', action: 'edit' },
      { resource: 'roles', action: 'delete' },
    ],
    readOnly: [
      { resource: 'users', action: 'view' },
      { resource: 'roles', action: 'view' },
      { resource: 'staff', action: 'view' },
      { resource: 'teachers', action: 'view' },
    ],
  },
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateUniqueData(base: string): string {
  const timestamp = Date.now()
  return `${base}-${timestamp}`
}

/**
 * Generate random Ivorian phone number
 */
export function generateIvorianPhone(): string {
  const prefixes = ['07', '05', '01']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  return `+225 ${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 6)} ${number.slice(6, 8)}`
}

/**
 * Generate random email
 */
export function generateEmail(name: string): string {
  const timestamp = Date.now()
  const cleanName = name.toLowerCase().replace(/\s+/g, '.')
  return `${cleanName}.${timestamp}@yeko.test`
}
