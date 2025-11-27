// Error codes for school context
export const SCHOOL_ERRORS = {
  NO_SCHOOL_CONTEXT: 'E001',
  SCHOOL_ACCESS_DENIED: 'E002',
  INVALID_SCHOOL_ID: 'E003',
  SCHOOL_SUSPENDED: 'E004',
  ROLE_NOT_FOUND: 'E005',
  PERMISSION_DENIED: 'E006',
  STUDENT_NOT_FOUND: 'E007',
  CLASS_NOT_FOUND: 'E008',
  ALREADY_ENROLLED: 'E009',
  USER_NOT_FOUND: 'E010',
  TEACHER_NOT_FOUND: 'E011',
  PARENT_NOT_FOUND: 'E012',
  CLASSROOM_NOT_FOUND: 'E013',
  SCHOOL_YEAR_NOT_FOUND: 'E014',
  TERM_NOT_FOUND: 'E015',
} as const

// Validation rules
export const VALIDATION_RULES = {
  matricule: {
    pattern: /^[A-Z]{2}\d{4}[A-Z]\d{3}$/,
    example: 'AB2024C001',
    description: 'Format: 2 letters + 4 digits + 1 letter + 3 digits',
  },
  phone: {
    pattern: /^\+?\d{8,15}$/,
    example: '+22501234567',
  },
  email: {
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const
