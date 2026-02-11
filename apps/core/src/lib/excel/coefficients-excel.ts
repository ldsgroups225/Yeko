import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { formatDate } from '@repo/data-ops'
import * as XLSX from 'xlsx'

/**
 * Excel Import/Export for Coefficients
 * Handles bulk import and export of coefficient templates
 */

export interface CoefficientExportRow {
  'Année Scolaire': string
  'Matière': string
  'Classe': string
  'Série': string
  'Coefficient': number
  'Date de Création': string
}

export interface CoefficientImportRow {
  'Année Scolaire': string
  'Matière': string
  'Classe': string
  'Série'?: string
  'Coefficient': number
}

/**
 * Export coefficients to Excel
 */
export function exportCoefficientsToExcel(
  coefficients: Array<{
    schoolYearTemplate?: { name: string } | null
    subject?: { name: string } | null
    grade?: { name: string } | null
    series?: { name: string } | null
    weight: number
    createdAt: Date
  }>,
  filename = 'coefficients.xlsx',
) {
  // Transform data to export format
  const data: CoefficientExportRow[] = coefficients.map(coef => ({
    'Année Scolaire': coef.schoolYearTemplate?.name || 'N/A',
    'Matière': coef.subject?.name || 'N/A',
    'Classe': coef.grade?.name || 'N/A',
    'Série': coef.series?.name || 'Général',
    'Coefficient': coef.weight,
    'Date de Création': formatDate(coef.createdAt, 'MEDIUM', 'fr'),
  }))

  // Create schema
  const schema = ExcelSchemaBuilder.create<CoefficientExportRow>()
    .column('year', { key: 'Année Scolaire' })
    .column('subject', { key: 'Matière' })
    .column('grade', { key: 'Classe' })
    .column('series', { key: 'Série' })
    .column('coef', { key: 'Coefficient' })
    .column('date', { key: 'Date de Création' })
    .build()

  // Build Excel file
  const excelFile = ExcelBuilder.create()
    .sheet('Coefficients')
    .addTable({
      data,
      schema,
    })
    .build({ output: 'buffer' })

  // Create download link
  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Parse Excel file for coefficient import
 */
export function parseCoefficientsExcel(file: File): Promise<{
  data: CoefficientImportRow[]
  errors: string[]
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]

        if (!sheetName) {
          resolve({
            data: [],
            errors: ['Le fichier Excel ne contient aucune feuille'],
          })
          return
        }

        const worksheet = workbook.Sheets[sheetName]

        if (!worksheet) {
          resolve({
            data: [],
            errors: ['Impossible de lire la première feuille'],
          })
          return
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

        const errors: string[] = []
        const validData: CoefficientImportRow[] = []

        jsonData.forEach((row, index) => {
          const rowNum = index + 2 // Excel rows start at 1, header is row 1

          // Support both French and English column names
          const yearName = row['Année Scolaire'] || row['School Year']
          const subjectName = row['Matière'] || row.Subject
          const gradeName = row.Classe || row.Grade
          const seriesName = row['Série'] || row.Series
          const weight = row.Coefficient || row.Weight

          // Validation
          if (!yearName) {
            errors.push(`Ligne ${rowNum}: Année scolaire manquante`)
            return
          }

          if (!subjectName) {
            errors.push(`Ligne ${rowNum}: Matière manquante`)
            return
          }

          if (!gradeName) {
            errors.push(`Ligne ${rowNum}: Classe manquante`)
            return
          }

          if (weight === undefined || weight === null) {
            errors.push(`Ligne ${rowNum}: Coefficient manquant`)
            return
          }

          const weightNum = Number(weight)
          if (Number.isNaN(weightNum) || weightNum < 0 || weightNum > 20) {
            errors.push(`Ligne ${rowNum}: Coefficient invalide (doit être entre 0 et 20)`)
            return
          }

          validData.push({
            'Année Scolaire': String(yearName).trim(),
            'Matière': String(subjectName).trim(),
            'Classe': String(gradeName).trim(),
            'Série': seriesName ? String(seriesName).trim() : undefined,
            'Coefficient': weightNum,
          })
        })

        resolve({ data: validData, errors })
      }
      catch (error) {
        resolve({
          data: [],
          errors: [`Erreur lors de la lecture du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
        })
      }
    }

    reader.onerror = () => {
      resolve({
        data: [],
        errors: ['Erreur lors de la lecture du fichier'],
      })
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Generate Excel template for coefficient import
 */
export function generateCoefficientTemplate(filename = 'coefficient-template.xlsx') {
  const sampleData: CoefficientImportRow[] = [
    {
      'Année Scolaire': '2025-2026',
      'Matière': 'Mathématiques',
      'Classe': 'Terminale',
      'Série': 'C',
      'Coefficient': 5,
    },
    {
      'Année Scolaire': '2025-2026',
      'Matière': 'Physique-Chimie',
      'Classe': 'Terminale',
      'Série': 'C',
      'Coefficient': 4,
    },
    {
      'Année Scolaire': '2025-2026',
      'Matière': 'Français',
      'Classe': 'Terminale',
      'Coefficient': 3,
    },
  ]

  // Create schema for coefficients
  const schema = ExcelSchemaBuilder.create<CoefficientImportRow>()
    .column('year', { key: 'Année Scolaire' })
    .column('subject', { key: 'Matière' })
    .column('grade', { key: 'Classe' })
    .column('series', { key: 'Série', transform: val => val || '' })
    .column('coef', { key: 'Coefficient' })
    .build()

  // Build Excel file
  const excelFile = ExcelBuilder.create()
    .sheet('Coefficients')
    .addTable({
      data: sampleData,
      schema,
    })
    .build({ output: 'buffer' })

  // Create download link
  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
