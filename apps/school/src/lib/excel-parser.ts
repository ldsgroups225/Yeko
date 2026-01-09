import * as XLSX from 'xlsx'

export interface ParsedSession {
  className: string
  subjectName: string
  teacherName: string
  classroomName?: string
  dayOfWeek: number
  startTime: string
  endTime: string

  // Resolved IDs
  classId?: string
  subjectId?: string
  teacherId?: string
  classroomId?: string
}

export interface TimetableImportContext {
  classes: Array<{ class: { id: string, section: string }, grade: { name: string } }>
  subjects: Array<{ id: string, name: string }>
  teachers: Array<{ id: string, user: { name: string } }>
  classrooms: Array<{ id: string, name: string, classroom: { id: string, name: string } }>
}

const COLUMN_MAPPINGS: Record<string, string[]> = {
  className: ['classe', 'class', 'classe_nom'],
  subjectName: ['matiere', 'matière', 'subject', 'cours'],
  teacherName: ['enseignant', 'professeur', 'prof', 'teacher', 'enseignant_nom'],
  classroomName: ['salle', 'classroom', 'room', 'classroomId'],
  day: ['jour', 'day', 'dayofweek'],
  startTime: ['debut', 'start', 'starttime', 'heure_debut'],
  endTime: ['fin', 'end', 'endtime', 'heure_fin'],
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[_\s\-']/g, '').trim()
}

function findColumnMapping(header: string): string | null {
  const normalized = normalizeHeader(header)
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalizeHeader(alias) === normalized || normalized.includes(normalizeHeader(alias)))) {
      return field
    }
  }
  return null
}

function parseDay(value: any): number {
  if (typeof value === 'number')
    return value
  const str = String(value).toLowerCase().trim()
  if (str.includes('lundi') || str === 'mon')
    return 1
  if (str.includes('mardi') || str === 'tue')
    return 2
  if (str.includes('mercredi') || str === 'wed')
    return 3
  if (str.includes('jeudi') || str === 'thu')
    return 4
  if (str.includes('vendredi') || str === 'fri')
    return 5
  if (str.includes('samedi') || str === 'sat')
    return 6
  if (str.includes('dimanche') || str === 'sun')
    return 7
  return 0
}

function parseTime(value: any): string {
  if (!value)
    return ''

  // Excel decimal time (fraction of day)
  if (typeof value === 'number') {
    const totalSeconds = Math.round(value * 24 * 60 * 60)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const str = String(value).trim()
  // HH:MM format
  if (/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(str)) {
    return str.padStart(5, '0')
  }
  return ''
}

export async function parseTimetableExcel(
  file: File,
  context: TimetableImportContext,
): Promise<{ success: boolean, parsed?: ParsedSession[], errorKey?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0] || '']
        if (!firstSheet) {
          resolve({ success: false, errorKey: 'timetables.errors.readError' })
          return
        }

        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' })
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0] || {}) : []

        // Map headers
        const headerMapping: Record<string, string> = {}
        for (const header of headers) {
          const mapped = findColumnMapping(header)
          if (mapped)
            headerMapping[header] = mapped
        }

        // IconCheck required
        const mappedFields = Object.values(headerMapping)
        const required = ['className', 'subjectName', 'teacherName', 'day', 'startTime']
        if (!required.every(f => mappedFields.includes(f))) {
          resolve({ success: false, errorKey: 'timetables.errors.missingColumns' })
          return
        }

        // Prepare Lookups
        const classByNameMap = new Map<string, any>()
        context.classes.forEach((c) => {
          classByNameMap.set(`${c.grade.name} ${c.class.section}`.toLowerCase(), c.class)
          classByNameMap.set(`${c.grade.name}${c.class.section}`.toLowerCase().replace(/\s/g, ''), c.class)
        })

        const subjectMap = new Map(context.subjects.map(s => [s.name.toLowerCase(), s]))
        const teacherMap = new Map(context.teachers.map(t => [t.user.name.toLowerCase(), t]))
        const classroomMap = new Map<string, any>(
          context.classrooms.map((c) => {
            const name = c.classroom?.name || c.name
            return [name.toLowerCase(), c.classroom || c]
          }),
        )

        const parsed: ParsedSession[] = jsonData.map((row) => {
          const data: any = {}
          for (const [header, val] of Object.entries(row)) {
            const field = headerMapping[header]
            if (field)
              data[field] = val
          }

          // Basic Schema check (optional, but good for structure)
          // We continue even if schema fails slightly to report "invalid" status in UI

          const className = String(data.className || '').trim()
          const foundClass = classByNameMap.get(className.toLowerCase().replace(/\s/g, ''))
            || classByNameMap.get(className.toLowerCase())

          const subjectName = String(data.subjectName || '').trim()
          const foundSubject = subjectMap.get(subjectName.toLowerCase())

          const teacherName = String(data.teacherName || '').trim()
          const foundTeacher = teacherMap.get(teacherName.toLowerCase())
          const foundTeacherPartial = !foundTeacher
            ? context.teachers.find(t => t.user.name.toLowerCase().includes(teacherName.toLowerCase()))
            : null

          const classroomName = String(data.classroomName || '').trim()
          const foundClassroom = classroomMap.get(classroomName.toLowerCase())

          const dayOfWeek = parseDay(data.day)
          const startTime = parseTime(data.startTime)
          const endTime = parseTime(data.endTime)

          return {
            className,
            subjectName,
            teacherName,
            classroomName,
            dayOfWeek,
            startTime,
            endTime,
            classId: foundClass?.id,
            subjectId: foundSubject?.id,
            teacherId: foundTeacher?.id || foundTeacherPartial?.id,
            classroomId: foundClassroom?.id,
          }
        })

        resolve({ success: true, parsed })
      }
      catch {
        resolve({ success: false, errorKey: 'timetables.errors.readError' })
      }
    }
    reader.onerror = () => resolve({ success: false, errorKey: 'timetables.errors.readError' })
    reader.readAsArrayBuffer(file)
  })
}
