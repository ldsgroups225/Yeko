import type { FeeCategory } from '../drizzle/school-schema'

export interface FeeTypeData {
  code: string
  name: string
  nameEn: string
  category: FeeCategory
  displayOrder: number
  isMandatory: boolean
  isRecurring: boolean
}

export const feeTypesData: FeeTypeData[] = [
  {
    code: 'TUITION',
    name: 'Frais de scolarité',
    nameEn: 'Tuition Fee',
    category: 'tuition',
    displayOrder: 1,
    isMandatory: true,
    isRecurring: true,
  },
  {
    code: 'REGISTRATION',
    name: 'Frais d\'inscription',
    nameEn: 'Registration Fee',
    category: 'registration',
    displayOrder: 2,
    isMandatory: true,
    isRecurring: false,
  },
  {
    code: 'EXAM',
    name: 'Frais d\'examen',
    nameEn: 'Exam Fee',
    category: 'exam',
    displayOrder: 3,
    isMandatory: true,
    isRecurring: false,
  },
  {
    code: 'BOOKS',
    name: 'Frais de livres',
    nameEn: 'Books Fee',
    category: 'books',
    displayOrder: 4,
    isMandatory: false,
    isRecurring: false,
  },
  {
    code: 'TRANSPORT',
    name: 'Frais de transport',
    nameEn: 'Transport Fee',
    category: 'transport',
    displayOrder: 5,
    isMandatory: false,
    isRecurring: true,
  },
  {
    code: 'UNIFORM',
    name: 'Frais de uniforme',
    nameEn: 'Uniform Fee',
    category: 'uniform',
    displayOrder: 6,
    isMandatory: false,
    isRecurring: false,
  },
  {
    code: 'MEALS',
    name: 'Frais de cantine',
    nameEn: 'Meals Fee',
    category: 'meals',
    displayOrder: 7,
    isMandatory: false,
    isRecurring: true,
  },
  {
    code: 'ACTIVITIES',
    name: 'Frais activités',
    nameEn: 'Activities Fee',
    category: 'activities',
    displayOrder: 8,
    isMandatory: false,
    isRecurring: false,
  },
]
