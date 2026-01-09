import { ExcelBuilder, ExcelSchemaBuilder } from '@chronicstone/typed-xlsx'

interface StudentExportData {
  matricule: string
  lastName: string
  firstName: string
  dateOfBirth: string
  gender: string
  status: string
  class: string
  series: string
  nationality: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  admissionDate: string
}

interface ExportTranslations {
  matricule: string
  lastName: string
  firstName: string
  dateOfBirth: string
  gender: string
  status: string
  class: string
  series: string
  nationality: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  admissionDate: string
  sheetName: string
}

/**
 * Export students to Excel with natural column names
 */
export function exportStudentsToExcel(
  data: StudentExportData[],
  translations: ExportTranslations,
): ArrayBuffer {
  // Build schema with translated labels
  const schema = ExcelSchemaBuilder.create<StudentExportData>()
    .column('matricule', { key: 'matricule', label: translations.matricule })
    .column('lastName', { key: 'lastName', label: translations.lastName })
    .column('firstName', { key: 'firstName', label: translations.firstName })
    .column('dateOfBirth', { key: 'dateOfBirth', label: translations.dateOfBirth })
    .column('gender', { key: 'gender', label: translations.gender })
    .column('status', { key: 'status', label: translations.status })
    .column('class', { key: 'class', label: translations.class })
    .column('series', { key: 'series', label: translations.series })
    .column('nationality', { key: 'nationality', label: translations.nationality })
    .column('address', { key: 'address', label: translations.address })
    .column('emergencyContact', { key: 'emergencyContact', label: translations.emergencyContact })
    .column('emergencyPhone', { key: 'emergencyPhone', label: translations.emergencyPhone })
    .column('admissionDate', { key: 'admissionDate', label: translations.admissionDate })
    .build()

  const file = ExcelBuilder.create()
    .sheet(translations.sheetName)
    .addTable({
      data,
      schema,
    })
    .build({ output: 'buffer' })

  // Handle both Node Buffer and Uint8Array
  if (file instanceof Uint8Array) {
    return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
  }
  return file
}

/**
 * IconDownload Excel file in browser
 */
export function downloadExcelFile(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
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
