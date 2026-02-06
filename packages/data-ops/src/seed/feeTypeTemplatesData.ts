import type { FeeTypeCategory } from '../drizzle/core-schema'

export interface FeeTypeTemplateData {
  id: string
  code: string
  name: string
  nameEn: string
  category: FeeTypeCategory
  description: string
  defaultAmount: number
  isMandatory: boolean
  isRecurring: boolean
  displayOrder: number
  isActive: boolean
}

export const feeTypeTemplatesData: FeeTypeTemplateData[] = [
  {
    id: 'ftpl-tuition-001',
    code: 'TUITION',
    name: 'Frais de Scolarité',
    nameEn: 'Tuition Fee',
    category: 'tuition',
    description: 'Annual tuition fees for academic enrollment',
    defaultAmount: 150000, // 150,000 XOF
    isMandatory: true,
    isRecurring: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'ftpl-registration-001',
    code: 'REGISTRATION',
    name: "Frais d'Inscription",
    nameEn: 'Registration Fee',
    category: 'registration',
    description: 'One-time registration and enrollment fees',
    defaultAmount: 50000,
    isMandatory: true,
    isRecurring: false,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'ftpl-exam-001',
    code: 'EXAM',
    name: "Frais d'Examen",
    nameEn: 'Exam Fee',
    category: 'exam',
    description: 'Fees for official examinations and assessments',
    defaultAmount: 25000,
    isMandatory: true,
    isRecurring: false,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'ftpl-books-001',
    code: 'BOOKS',
    name: 'Frais de Livres',
    nameEn: 'Books Fee',
    category: 'books',
    description: 'Textbooks and educational materials',
    defaultAmount: 30000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'ftpl-transport-001',
    code: 'TRANSPORT',
    name: 'Frais de Transport',
    nameEn: 'Transport Fee',
    category: 'transport',
    description: 'School bus and transportation services',
    defaultAmount: 45000,
    isMandatory: false,
    isRecurring: true,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'ftpl-uniform-001',
    code: 'UNIFORM',
    name: 'Frais de Uniforme',
    nameEn: 'Uniform Fee',
    category: 'uniform',
    description: 'School uniform and sportswear',
    defaultAmount: 20000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'ftpl-meals-001',
    code: 'MEALS',
    name: 'Frais de Cantine',
    nameEn: 'Meals Fee',
    category: 'meals',
    description: 'School cafeteria and meal plans',
    defaultAmount: 35000,
    isMandatory: false,
    isRecurring: true,
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'ftpl-activities-001',
    code: 'ACTIVITIES',
    name: "Frais d'Activités",
    nameEn: 'Activities Fee',
    category: 'activities',
    description: 'Extracurricular activities and sports',
    defaultAmount: 15000,
    isMandatory: false,
    isRecurring: false,
    displayOrder: 8,
    isActive: true,
  },
]
