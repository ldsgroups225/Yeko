import type { School } from '@repo/data-ops'
import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'

// Export schools to Excel
export function exportSchoolsToExcel(schools: School[]) {
  // Create schema for schools
  const schema = ExcelSchemaBuilder.create<School>()
    .column('ID', { key: 'id' })
    .column('Nom', { key: 'name' })
    .column('Code', { key: 'code' })
    .column('Adresse', { key: 'address', transform: val => val || '' })
    .column('Téléphone', { key: 'phone', transform: val => val || '' })
    .column('Email', { key: 'email', transform: val => val || '' })
    .column('Logo URL', { key: 'logoUrl', transform: val => val || '' })
    .column('Statut', { key: 'status' })
    .column('Date de création', {
      key: 'createdAt',
      transform: val => new Date(val).toLocaleDateString('fr-FR'),
    })
    .column('Dernière mise à jour', {
      key: 'updatedAt',
      transform: val => new Date(val).toLocaleDateString('fr-FR'),
    })
    .build()

  // Build Excel file
  const excelFile = ExcelBuilder.create()
    .sheet('Écoles')
    .addTable({
      data: schools,
      schema,
    })
    .build({ output: 'buffer' })

  // Create download link - convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ecoles_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Import schools from Excel
export async function importSchoolsFromExcel(file: File): Promise<Partial<School>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('Impossible de lire le fichier'))
          return
        }

        // Use SheetJS to parse the Excel file
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

        // Map Excel data to School format
        const schools: Partial<School>[] = jsonData.map((row: any) => ({
          name: row.Nom || row.name,
          code: row.Code || row.code,
          address: row.Adresse || row.address || null,
          phone: row.Téléphone || row.phone || null,
          email: row.Email || row.email || null,
          logoUrl: row['Logo URL'] || row.logoUrl || null,
          status: (row.Statut || row.status || 'active') as 'active' | 'inactive' | 'suspended',
          settings: {},
        }))

        resolve(schools)
      }
      catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
    reader.readAsBinaryString(file)
  })
}
