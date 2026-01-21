export function generateUniqueSchoolName(base: string): string {
  const timestamp = Date.now()
  return `${base}-${timestamp}`
}

export function generateUniqueSchoolCode(): string {
  const timestamp = Date.now().toString().slice(-6)
  return `SCH${timestamp}`
}

export function generateIvorianPhone(): string {
  const prefixes = ['07', '05', '01']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  return `+225 ${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 6)} ${number.slice(6, 8)}`
}

export function generateEmail(name: string): string {
  const timestamp = Date.now()
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '.')
  return `${cleanName}.${timestamp}@yeko.test`
}

export function generateAcademicYear(): string {
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  return `${currentYear}-${nextYear}`
}

export function generateFrenchSchoolName(): string {
  const names = [
    'École Primaire Publique',
    'Collège Moderne',
    'Lycée Technique',
    'Institution Catholique',
    'École Privée',
  ]
  const cities = [
    'Abidjan',
    'Yamoussoukro',
    'Bouaké',
    'Daloa',
    'San-Pédro',
    'Korhogo',
    'Man',
  ]
  const name = names[Math.floor(Math.random() * names.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const timestamp = Date.now().toString().slice(-4)
  return `${name} de ${city}-${timestamp}`
}

export function generateFrenchAddress(): string {
  const streets = [
    'Avenue de la République',
    ' Boulevard du Général de Gaulle',
    'Rue Pasteur',
    'Avenue Charles de Gaulle',
    'Place de la Paix',
  ]
  const cities = [
    'Abidjan',
    'Yamoussoukro',
    'Bouaké',
    'Daloa',
    'Korhogo',
  ]
  const street = streets[Math.floor(Math.random() * streets.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const number = Math.floor(Math.random() * 500) + 1
  return `${number} ${street}, ${city}`
}

export const testData = {
  schools: {
    valid: {
      name: 'Test School',
      code: 'TEST001',
      address: '123 Test Street',
      phone: '+225 07 12 34 56 78',
      email: 'contact@testschool.ci',
      status: 'active',
    },
    withAccents: {
      name: 'École Côte d\'Ivoire Test',
      code: 'ECI001',
      address: '456 Avenue Principale, Abidjan',
      phone: '+225 05 98 76 54 32',
      email: 'contact@ecitest.ci',
      status: 'active',
    },
  },

  users: {
    admin: {
      email: 'admin@yeko.test',
      password: 'password123',
    },
  },

  catalogs: {
    subjects: {
      mathematics: { name: 'Mathématiques', category: 'science' },
      physics: { name: 'Physique-Chimie', category: 'science' },
      french: { name: 'Français', category: 'language' },
      english: { name: 'Anglais', category: 'language' },
      philosophy: { name: 'Philosophie', category: 'humanities' },
      history: { name: 'Histoire-Géographie', category: 'humanities' },
      biology: { name: 'Sciences de la Vie et de la Terre', category: 'science' },
    },
    grades: {
      primary: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      secondary: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'],
    },
    series: {
      general: ['Série A', 'Série C', 'Série D', 'Série A1', 'A2', 'C', 'D'],
      technical: ['Série F', 'Série G', 'Série E'],
    },
  },
}
