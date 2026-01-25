import type { Grade, Serie, Subject, SubjectCategory } from '@repo/data-ops'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'
import { formatDate } from '@/utils/formatDate'

// ===== SUBJECTS EXPORT/IMPORT =====

export function exportSubjectsToExcel(subjects: Subject[]) {
  const schema = ExcelSchemaBuilder.create<Subject>()
    .column('ID', { key: 'id' })
    .column('Nom', { key: 'name' })
    .column('Nom Court', { key: 'shortName', transform: val => val || '' })
    .column('Catégorie', { key: 'category' })
    .column('Date de création', {
      key: 'createdAt',
      transform: val => formatDate(val, 'MEDIUM', 'fr'),
    })
    .build()

  const excelFile = ExcelBuilder.create()
    .sheet('Matières')
    .addTable({
      data: subjects,
      schema,
    })
    .build({ output: 'buffer' })

  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `matieres_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importSubjectsFromExcel(file: File): Promise<Partial<Subject>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('Impossible de lire le fichier'))
          return
        }

        const XLSX = await import('xlsx')
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]

        if (!firstSheetName) {
          reject(new Error('Le fichier Excel ne contient aucune feuille'))
          return
        }

        const firstSheet = workbook.Sheets[firstSheetName]
        if (!firstSheet) {
          reject(new Error('Impossible de lire la première feuille'))
          return
        }

        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        const subjects: Partial<Subject>[] = (jsonData as Record<string, unknown>[]).map(row => ({
          name: (row.Nom || row.name) as string,
          shortName: (row['Nom Court'] || row.shortName || null) as string | null,
          category: (row.Catégorie || row.category || 'Autre') as SubjectCategory,
        }))

        resolve(subjects)
      }
      catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsBinaryString(file)
  })
}

// ===== GRADES EXPORT/IMPORT =====

export function exportGradesToExcel(grades: Grade[]) {
  const schema = ExcelSchemaBuilder.create<Grade>()
    .column('ID', { key: 'id' })
    .column('Nom', { key: 'name' })
    .column('Code', { key: 'code' })
    .column('Ordre', { key: 'order' })
    .column('ID Filière', { key: 'trackId' })
    .column('Date de création', {
      key: 'createdAt',
      transform: val => formatDate(val, 'MEDIUM', 'fr'),
    })
    .build()

  const excelFile = ExcelBuilder.create()
    .sheet('Classes')
    .addTable({
      data: grades,
      schema,
    })
    .build({ output: 'buffer' })

  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `classes_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ===== SERIES EXPORT/IMPORT =====

export function exportSeriesToExcel(series: Serie[]) {
  const schema = ExcelSchemaBuilder.create<Serie>()
    .column('ID', { key: 'id' })
    .column('Nom', { key: 'name' })
    .column('Code', { key: 'code' })
    .column('ID Filière', { key: 'trackId' })
    .column('Date de création', {
      key: 'createdAt',
      transform: val => formatDate(val, 'MEDIUM', 'fr'),
    })
    .build()

  const excelFile = ExcelBuilder.create()
    .sheet('Séries')
    .addTable({
      data: series,
      schema,
    })
    .build({ output: 'buffer' })

  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `series_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function importSeriesFromExcel(file: File): Promise<Partial<Serie>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('Impossible de lire le fichier'))
          return
        }

        const XLSX = await import('xlsx')
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]

        if (!firstSheetName) {
          reject(new Error('Le fichier Excel ne contient aucune feuille'))
          return
        }

        const firstSheet = workbook.Sheets[firstSheetName]
        if (!firstSheet) {
          reject(new Error('Impossible de lire la première feuille'))
          return
        }

        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        const series: Partial<Serie>[] = (jsonData as Record<string, unknown>[]).map(row => ({
          name: (row.Nom || row.name) as string,
          code: (row.Code || row.code) as string,
          trackId: (row['ID Filière'] || row.trackId) as string,
        }))

        resolve(series)
      }
      catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsBinaryString(file)
  })
}

// ===== TEMPLATE GENERATION =====

export function downloadSubjectsTemplate(): void {
  const template = [
    { 'Nom': 'Mathématiques', 'Nom Court': 'Maths', 'Catégorie': 'Scientifique' },
    { 'Nom': 'Français', 'Nom Court': 'Fr', 'Catégorie': 'Littéraire' },
    { 'Nom': 'EPS', 'Nom Court': 'EPS', 'Catégorie': 'Sportif' },
  ]

  const schema = ExcelSchemaBuilder.create<typeof template[0]>()
    .column('Nom', { key: 'Nom' })
    .column('Nom Court', { key: 'Nom Court' })
    .column('Catégorie', { key: 'Catégorie' })
    .build()

  const excelFile = ExcelBuilder.create()
    .sheet('Template')
    .addTable({
      data: template,
      schema,
    })
    .build({ output: 'buffer' })

  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'template_matieres.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
