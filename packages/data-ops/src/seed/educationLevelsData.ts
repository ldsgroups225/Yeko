import type { EducationLevelInsert } from '../drizzle/core-schema'

export const educationLevelsData: EducationLevelInsert[] = [
  { id: 1, name: 'Maternelle', order: 1 },
  { id: 2, name: 'Primaire', order: 2 },
  { id: 3, name: 'Secondaire', order: 3 },
  { id: 4, name: 'Supérieur', order: 4 },
]
