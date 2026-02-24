import * as XLSX from 'xlsx'

export interface ParsedStudent {
  firstName: string
  lastName: string
  dob: string
  gender?: 'M' | 'F' | 'other'
  matricule?: string
  birthPlace?: string
  nationality?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  previousSchool?: string
}

export const COLUMN_MAPPINGS: Record<string, string[]> = {
  firstName: ['firstname', 'first_name', 'prenom', 'prénom', 'first name'],
  lastName: ['lastname', 'last_name', 'nom', 'last name', 'nom de famille'],
  dob: ['dob', 'dateofbirth', 'date_of_birth', 'datenaissance', 'date_naissance', 'naissance', 'date of birth', 'date de naissance'],
  gender: ['gender', 'sexe', 'genre', 'sex'],
  matricule: ['matricule', 'student_id', 'studentid', 'id'],
  birthPlace: ['birthplace', 'birth_place', 'lieu_naissance', 'lieunaissance', 'lieu de naissance'],
  nationality: ['nationality', 'nationalite', 'nationalité'],
  address: ['address', 'adresse'],
  emergencyContact: ['emergencycontact', 'emergency_contact', 'contact_urgence', 'contacturgence', 'contact d\'urgence'],
  emergencyPhone: ['emergencyphone', 'emergency_phone', 'telephone_urgence', 'telephoneurgence', 'téléphone d\'urgence'],
  previousSchool: ['previousschool', 'previous_school', 'ecole_precedente', 'ecoleprecedente', 'école précédente'],
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[_\s\-']/g, '').trim()
}

export function findColumnMapping(header: string): string | null {
  const normalized = normalizeHeader(header)
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalizeHeader(alias) === normalized || normalized.includes(normalizeHeader(alias)))) {
      return field
    }
  }
  return null
}

export function normalizeDate(value: unknown): string {
  if (!value)
    return ''
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date)
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  const str = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str))
    return str
  if (str.includes('/')) {
    const parts = str.split('/')
    if (parts.length === 3) {
      const [a, b, c] = parts
      if (Number(a) > 12)
        return `${c}-${b?.padStart(2, '0')}-${a?.padStart(2, '0')}`
      return `${c}-${a?.padStart(2, '0')}-${b?.padStart(2, '0')}`
    }
  }
  const date = new Date(str)
  return !Number.isNaN(date.getTime()) ? date.toISOString().split('T')[0] || '' : str
}

export function normalizeGender(value: unknown): 'M' | 'F' | 'other' | undefined {
  if (!value)
    return undefined
  const str = String(value).toUpperCase().trim()
  if (['M', 'MALE', 'MASCULIN', 'H', 'HOMME', 'GARÇON', 'GARCON'].includes(str))
    return 'M'
  if (['F', 'FEMALE', 'FEMININ', 'FÉMININ', 'FEMME', 'FILLE'].includes(str))
    return 'F'
  return undefined
}

export function parseExcelData(workbook: XLSX.WorkBook): { headers: string[], rows: Record<string, any>[] } {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0] || '']
  if (!firstSheet)
    return { headers: [], rows: [] }
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' })
  const headers = jsonData.length > 0 ? Object.keys(jsonData[0] || {}) : []
  return { headers, rows: jsonData }
}

export function mapRowToStudent(row: Record<string, any>, headerMapping: Record<string, string>): ParsedStudent | null {
  const data: Record<string, any> = {}
  for (const [originalHeader, value] of Object.entries(row)) {
    const mappedField = headerMapping[originalHeader]
    if (mappedField && value !== undefined && value !== '')
      data[mappedField] = value
  }
  if (!data.firstName || !data.lastName || !data.dob)
    return null
  return {
    firstName: String(data.firstName).trim(),
    lastName: String(data.lastName).trim(),
    dob: normalizeDate(data.dob),
    gender: normalizeGender(data.gender),
    matricule: data.matricule ? String(data.matricule).trim() : undefined,
    birthPlace: data.birthPlace ? String(data.birthPlace).trim() : undefined,
    nationality: data.nationality ? String(data.nationality).trim() : undefined,
    address: data.address ? String(data.address).trim() : undefined,
    emergencyContact: data.emergencyContact ? String(data.emergencyContact).trim() : undefined,
    emergencyPhone: data.emergencyPhone ? String(data.emergencyPhone).trim() : undefined,
    previousSchool: data.previousSchool ? String(data.previousSchool).trim() : undefined,
  }
}
