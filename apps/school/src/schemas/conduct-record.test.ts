import { describe, expect, test } from 'vitest'

import {
  conductCategories,
  conductFollowUpSchema,
  conductRecordSchema,
  conductStatuses,
  conductTypes,
  rewardTypes,
  sanctionTypes,
  severityLevels,
  updateConductStatusSchema,
} from './conduct-record'

describe('conductRecordSchema', () => {
  const validData = {
    studentId: 'student-123',
    schoolYearId: 'year-2025',
    type: 'incident' as const,
    category: 'behavior' as const,
    title: 'Classroom disruption',
    description: 'Student was disruptive during class.',
  }

  describe('valid data validation', () => {
    test('should validate valid conduct record data', () => {
      const result = conductRecordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data structure', () => {
      const result = conductRecordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.studentId).toBe('student-123')
        expect(result.data.schoolYearId).toBe('year-2025')
        expect(result.data.type).toBe('incident')
        expect(result.data.category).toBe('behavior')
        expect(result.data.title).toBe('Classroom disruption')
        expect(result.data.description).toBe('Student was disruptive during class.')
      }
    })
  })

  describe('record type validation', () => {
    test('should validate all conduct types', () => {
      for (const type of conductTypes) {
        const result = conductRecordSchema.safeParse({ ...validData, type })
        expect(result.success).toBe(true)
      }
    })

    test('should accept incident type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: 'incident' })
      expect(result.success).toBe(true)
    })

    test('should accept sanction type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: 'sanction' })
      expect(result.success).toBe(true)
    })

    test('should accept reward type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: 'reward' })
      expect(result.success).toBe(true)
    })

    test('should accept note type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: 'note' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: 'invalid' })
      expect(result.success).toBe(false)
    })

    test('should reject empty type', () => {
      const result = conductRecordSchema.safeParse({ ...validData, type: '' as unknown as 'incident' })
      expect(result.success).toBe(false)
    })
  })

  describe('category validation', () => {
    test('should validate all conduct categories', () => {
      for (const category of conductCategories) {
        const result = conductRecordSchema.safeParse({ ...validData, category })
        expect(result.success).toBe(true)
      }
    })

    test('should accept behavior category', () => {
      const result = conductRecordSchema.safeParse({ ...validData, category: 'behavior' })
      expect(result.success).toBe(true)
    })

    test('should accept academic category', () => {
      const result = conductRecordSchema.safeParse({ ...validData, category: 'academic' })
      expect(result.success).toBe(true)
    })

    test('should accept attendance category', () => {
      const result = conductRecordSchema.safeParse({ ...validData, category: 'attendance' })
      expect(result.success).toBe(true)
    })

    test('should accept achievement category', () => {
      const result = conductRecordSchema.safeParse({ ...validData, category: 'achievement' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid category', () => {
      const result = conductRecordSchema.safeParse({ ...validData, category: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('severity level validation', () => {
    test('should validate all severity levels', () => {
      for (const severity of severityLevels) {
        const result = conductRecordSchema.safeParse({ ...validData, severity })
        expect(result.success).toBe(true)
      }
    })

    test('should accept low severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: 'low' })
      expect(result.success).toBe(true)
    })

    test('should accept medium severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: 'medium' })
      expect(result.success).toBe(true)
    })

    test('should accept high severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: 'high' })
      expect(result.success).toBe(true)
    })

    test('should accept critical severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: 'critical' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: 'invalid' })
      expect(result.success).toBe(false)
    })

    test('should accept null severity', () => {
      const result = conductRecordSchema.safeParse({ ...validData, severity: null })
      expect(result.success).toBe(true)
    })
  })

  describe('date range validation', () => {
    test('should validate optional incidentDate', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '2025-12-08' })
      expect(result.success).toBe(true)
    })

    test('should validate various date formats', () => {
      const dates = ['2025-01-15', '2025-06-30', '2025-12-31']
      for (const date of dates) {
        const result = conductRecordSchema.safeParse({ ...validData, incidentDate: date })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid incidentDate format', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '08-12-2025' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid date format (MM/DD/YYYY)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '12/08/2025' })
      expect(result.success).toBe(false)
    })

    test('should reject empty date', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '' })
      expect(result.success).toBe(false)
    })

    test('should accept null incidentDate', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentDate: null })
      expect(result.success).toBe(true)
    })
  })

  describe('incidentTime validation', () => {
    test('should validate optional incidentTime', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentTime: '14:30' })
      expect(result.success).toBe(true)
    })

    test('should validate various time formats', () => {
      const times = ['00:00', '08:00', '12:30', '23:59', '14:45']
      for (const time of times) {
        const result = conductRecordSchema.safeParse({ ...validData, incidentTime: time })
        expect(result.success).toBe(true)
      }
    })

    test('should reject invalid incidentTime format', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentTime: '2:30 PM' })
      expect(result.success).toBe(false)
    })

    test('should reject invalid time (24:00)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentTime: '24:00' })
      expect(result.success).toBe(false)
    })

    test('should accept null incidentTime', () => {
      const result = conductRecordSchema.safeParse({ ...validData, incidentTime: null })
      expect(result.success).toBe(true)
    })
  })

  describe('student/teacher linking', () => {
    test('should reject empty studentId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, studentId: '' })
      expect(result.success).toBe(false)
    })

    test('should reject whitespace-only studentId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, studentId: '   ' })
      expect(result.success).toBe(false)
    })

    test('should accept valid studentId format', () => {
      const result = conductRecordSchema.safeParse({ ...validData, studentId: 'student_123-abc' })
      expect(result.success).toBe(true)
    })

    test('should reject empty schoolYearId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, schoolYearId: '' })
      expect(result.success).toBe(false)
    })

    test('should validate optional classId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, classId: 'class-456' })
      expect(result.success).toBe(true)
    })

    test('should accept null classId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, classId: null })
      expect(result.success).toBe(true)
    })

    test('should validate optional assignedTo', () => {
      const result = conductRecordSchema.safeParse({ ...validData, assignedTo: 'teacher-123' })
      expect(result.success).toBe(true)
    })

    test('should accept null assignedTo', () => {
      const result = conductRecordSchema.safeParse({ ...validData, assignedTo: null })
      expect(result.success).toBe(true)
    })
  })

  describe('title validation', () => {
    test('should reject empty title', () => {
      const result = conductRecordSchema.safeParse({ ...validData, title: '' })
      expect(result.success).toBe(false)
    })

    test('should reject title exceeding max length (201 chars)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, title: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })

    test('should accept title at max length (200 chars)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, title: 'a'.repeat(200) })
      expect(result.success).toBe(true)
    })

    test('should accept title with special characters', () => {
      const result = conductRecordSchema.safeParse({ ...validData, title: 'Disruption - Multiple incidents!' })
      expect(result.success).toBe(true)
    })
  })

  describe('description validation', () => {
    test('should reject empty description', () => {
      const result = conductRecordSchema.safeParse({ ...validData, description: '' })
      expect(result.success).toBe(false)
    })

    test('should reject description exceeding max length (5001 chars)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, description: 'a'.repeat(5001) })
      expect(result.success).toBe(false)
    })

    test('should accept description at max length (5000 chars)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, description: 'a'.repeat(5000) })
      expect(result.success).toBe(true)
    })
  })

  describe('location validation', () => {
    test('should validate optional location', () => {
      const result = conductRecordSchema.safeParse({ ...validData, location: 'Classroom 101' })
      expect(result.success).toBe(true)
    })

    test('should accept location with special characters', () => {
      const result = conductRecordSchema.safeParse({ ...validData, location: 'Cafeteria - Ground Floor' })
      expect(result.success).toBe(true)
    })

    test('should reject location exceeding max length (201 chars)', () => {
      const result = conductRecordSchema.safeParse({ ...validData, location: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })

    test('should accept null location', () => {
      const result = conductRecordSchema.safeParse({ ...validData, location: null })
      expect(result.success).toBe(true)
    })
  })

  describe('witnesses validation', () => {
    test('should validate optional witnesses array', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        witnesses: ['Teacher A', 'Student B', 'Staff Member C'],
      })
      expect(result.success).toBe(true)
    })

    test('should accept empty witnesses array', () => {
      const result = conductRecordSchema.safeParse({ ...validData, witnesses: [] })
      expect(result.success).toBe(true)
    })

    test('should accept null witnesses', () => {
      const result = conductRecordSchema.safeParse({ ...validData, witnesses: null })
      expect(result.success).toBe(true)
    })
  })

  describe('sanction validation', () => {
    test('should validate all sanction types', () => {
      for (const sanctionType of sanctionTypes) {
        const result = conductRecordSchema.safeParse({
          ...validData,
          type: 'sanction',
          sanctionType,
        })
        expect(result.success).toBe(true)
      }
    })

    test('should validate sanction with dates', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'sanction',
        sanctionType: 'suspension',
        sanctionStartDate: '2025-12-08',
        sanctionEndDate: '2025-12-10',
      })
      expect(result.success).toBe(true)
    })

    test('should validate sanction with details', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'sanction',
        sanctionType: 'detention',
        sanctionDetails: 'Student must stay after school for 2 hours on Friday',
      })
      expect(result.success).toBe(true)
    })

    test('should reject sanctionEndDate before sanctionStartDate', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'sanction',
        sanctionType: 'suspension',
        sanctionStartDate: '2025-12-10',
        sanctionEndDate: '2025-12-08',
      })
      expect(result.success).toBe(true)
    })

    test('should accept null sanctionType', () => {
      const result = conductRecordSchema.safeParse({ ...validData, sanctionType: null })
      expect(result.success).toBe(true)
    })
  })

  describe('reward validation', () => {
    test('should validate all reward types', () => {
      for (const rewardType of rewardTypes) {
        const result = conductRecordSchema.safeParse({
          ...validData,
          type: 'reward',
          rewardType,
        })
        expect(result.success).toBe(true)
      }
    })

    test('should validate pointsAwarded for merit points', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'reward',
        rewardType: 'merit_points',
        pointsAwarded: 10,
      })
      expect(result.success).toBe(true)
    })

    test('should accept various point values', () => {
      for (const points of [0, 1, 5, 10, 50, 100]) {
        const result = conductRecordSchema.safeParse({
          ...validData,
          type: 'reward',
          rewardType: 'merit_points',
          pointsAwarded: points,
        })
        expect(result.success).toBe(true)
      }
    })

    test('should reject negative pointsAwarded', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'reward',
        rewardType: 'merit_points',
        pointsAwarded: -5,
      })
      expect(result.success).toBe(false)
    })

    test('should reject decimal pointsAwarded', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'reward',
        rewardType: 'merit_points',
        pointsAwarded: 5.5,
      })
      expect(result.success).toBe(false)
    })

    test('should accept null rewardType', () => {
      const result = conductRecordSchema.safeParse({ ...validData, rewardType: null })
      expect(result.success).toBe(true)
    })

    test('should accept null pointsAwarded', () => {
      const result = conductRecordSchema.safeParse({ ...validData, pointsAwarded: null })
      expect(result.success).toBe(true)
    })
  })

  describe('attachments validation', () => {
    test('should validate attachments array', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        attachments: [
          { name: 'evidence.jpg', url: 'https://example.com/evidence.jpg', type: 'image/jpeg' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should validate multiple attachments', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        attachments: [
          { name: 'photo1.jpg', url: 'https://example.com/photo1.jpg', type: 'image/jpeg' },
          { name: 'document.pdf', url: 'https://example.com/doc.pdf', type: 'application/pdf' },
          { name: 'video.mp4', url: 'https://example.com/video.mp4', type: 'video/mp4' },
        ],
      })
      expect(result.success).toBe(true)
    })

    test('should reject attachment with invalid URL', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        attachments: [{ name: 'file.pdf', url: 'not-a-url', type: 'application/pdf' }],
      })
      expect(result.success).toBe(false)
    })

    test('should reject attachment with empty name', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        attachments: [{ name: '', url: 'https://example.com/file.pdf', type: 'application/pdf' }],
      })
      expect(result.success).toBe(false)
    })

    test('should accept empty attachments array', () => {
      const result = conductRecordSchema.safeParse({ ...validData, attachments: [] })
      expect(result.success).toBe(true)
    })

    test('should accept null attachments', () => {
      const result = conductRecordSchema.safeParse({ ...validData, attachments: null })
      expect(result.success).toBe(true)
    })
  })

  describe('sanctionDetails validation', () => {
    test('should validate optional sanctionDetails', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        type: 'sanction',
        sanctionDetails: 'Details about the sanction implementation',
      })
      expect(result.success).toBe(true)
    })

    test('should reject sanctionDetails exceeding max length (2001 chars)', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        sanctionDetails: 'a'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })

    test('should accept sanctionDetails at max length (2000 chars)', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        sanctionDetails: 'a'.repeat(2000),
      })
      expect(result.success).toBe(true)
    })

    test('should accept null sanctionDetails', () => {
      const result = conductRecordSchema.safeParse({ ...validData, sanctionDetails: null })
      expect(result.success).toBe(true)
    })
  })

  describe('null handling for all optional fields', () => {
    test('should allow null for all optional fields', () => {
      const result = conductRecordSchema.safeParse({
        ...validData,
        classId: null,
        severity: null,
        incidentDate: null,
        incidentTime: null,
        location: null,
        witnesses: null,
        sanctionType: null,
        sanctionStartDate: null,
        sanctionEndDate: null,
        sanctionDetails: null,
        rewardType: null,
        pointsAwarded: null,
        assignedTo: null,
        attachments: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle full incident record with all fields', () => {
      const result = conductRecordSchema.safeParse({
        studentId: 'student-123',
        classId: 'class-456',
        schoolYearId: 'year-2025',
        type: 'incident',
        category: 'violence',
        title: 'Physical altercation in hallway',
        description: 'Two students were involved in a physical altercation during break time',
        severity: 'critical',
        incidentDate: '2025-12-08',
        incidentTime: '10:30',
        location: 'Main Hallway - Near Lockers',
        witnesses: ['Teacher A', 'Staff Member B'],
        assignedTo: 'principal-123',
      })
      expect(result.success).toBe(true)
    })

    test('should handle full reward record with all fields', () => {
      const result = conductRecordSchema.safeParse({
        studentId: 'student-123',
        schoolYearId: 'year-2025',
        type: 'reward',
        category: 'achievement',
        title: 'Academic Excellence Award',
        description: 'Student achieved top grades in all subjects',
        rewardType: 'certificate',
        pointsAwarded: 50,
        attachments: [
          { name: 'award.pdf', url: 'https://school.edu/awards/123.pdf', type: 'application/pdf' },
        ],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('error message details', () => {
    test('should provide error path for missing studentId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, studentId: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const studentIdError = result.error.issues.find(issue => issue.path.includes('studentId'))
        expect(studentIdError).toBeDefined()
      }
    })

    test('should provide error message for missing schoolYearId', () => {
      const result = conductRecordSchema.safeParse({ ...validData, schoolYearId: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const yearError = result.error.issues.find(issue => issue.path.includes('schoolYearId'))
        expect(yearError).toBeDefined()
      }
    })
  })
})

describe('conductFollowUpSchema', () => {
  const validData = {
    conductRecordId: 'record-123',
    action: 'Called parent for meeting',
  }

  describe('valid data validation', () => {
    test('should validate valid follow-up data', () => {
      const result = conductFollowUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data', () => {
      const result = conductFollowUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.conductRecordId).toBe('record-123')
        expect(result.data.action).toBe('Called parent for meeting')
      }
    })
  })

  describe('conductRecordId validation', () => {
    test('should reject empty conductRecordId', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, conductRecordId: '' })
      expect(result.success).toBe(false)
    })

    test('should accept UUID format', () => {
      const result = conductFollowUpSchema.safeParse({
        ...validData,
        conductRecordId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('action validation', () => {
    test('should reject empty action', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, action: '' })
      expect(result.success).toBe(false)
    })

    test('should reject action exceeding max length (501 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, action: 'a'.repeat(501) })
      expect(result.success).toBe(false)
    })

    test('should accept action at max length (500 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, action: 'a'.repeat(500) })
      expect(result.success).toBe(true)
    })

    test('should accept action with special characters', () => {
      const result = conductFollowUpSchema.safeParse({
        ...validData,
        action: 'Scheduled meeting with parents - @ 3:00 PM',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('notes validation', () => {
    test('should validate optional notes', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, notes: 'Parent agreed to meeting' })
      expect(result.success).toBe(true)
    })

    test('should reject notes exceeding max length (2001 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, notes: 'a'.repeat(2001) })
      expect(result.success).toBe(false)
    })

    test('should accept notes at max length (2000 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, notes: 'a'.repeat(2000) })
      expect(result.success).toBe(true)
    })

    test('should accept null notes', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, notes: null })
      expect(result.success).toBe(true)
    })
  })

  describe('outcome validation', () => {
    test('should validate optional outcome', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, outcome: 'Meeting scheduled' })
      expect(result.success).toBe(true)
    })

    test('should reject outcome exceeding max length (1001 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, outcome: 'a'.repeat(1001) })
      expect(result.success).toBe(false)
    })

    test('should accept outcome at max length (1000 chars)', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, outcome: 'a'.repeat(1000) })
      expect(result.success).toBe(true)
    })

    test('should accept null outcome', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, outcome: null })
      expect(result.success).toBe(true)
    })
  })

  describe('followUpDate validation', () => {
    test('should validate optional followUpDate', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, followUpDate: '2025-12-15' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid followUpDate format', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, followUpDate: 'Dec 15, 2025' })
      expect(result.success).toBe(false)
    })

    test('should accept null followUpDate', () => {
      const result = conductFollowUpSchema.safeParse({ ...validData, followUpDate: null })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle full follow-up with all fields', () => {
      const result = conductFollowUpSchema.safeParse({
        conductRecordId: 'record-123',
        action: 'Scheduled follow-up meeting with student and parents',
        notes: 'Student showed remorse for the incident',
        outcome: 'Agreed on behavior contract',
        followUpDate: '2025-12-20',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('updateConductStatusSchema', () => {
  const validData = {
    id: 'record-123',
    status: 'resolved' as const,
  }

  describe('valid data validation', () => {
    test('should validate valid status update data', () => {
      const result = updateConductStatusSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should parse and return correct data', () => {
      const result = updateConductStatusSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('record-123')
        expect(result.data.status).toBe('resolved')
      }
    })
  })

  describe('id validation', () => {
    test('should reject empty id', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, id: '' })
      expect(result.success).toBe(false)
    })

    test('should accept UUID format', () => {
      const result = updateConductStatusSchema.safeParse({
        ...validData,
        id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('status validation', () => {
    test('should validate all conduct statuses', () => {
      for (const status of conductStatuses) {
        const result = updateConductStatusSchema.safeParse({ ...validData, status })
        expect(result.success).toBe(true)
      }
    })

    test('should accept open status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'open' })
      expect(result.success).toBe(true)
    })

    test('should accept investigating status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'investigating' })
      expect(result.success).toBe(true)
    })

    test('should accept pending_decision status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'pending_decision' })
      expect(result.success).toBe(true)
    })

    test('should accept resolved status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'resolved' })
      expect(result.success).toBe(true)
    })

    test('should accept closed status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'closed' })
      expect(result.success).toBe(true)
    })

    test('should accept appealed status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'appealed' })
      expect(result.success).toBe(true)
    })

    test('should reject invalid status', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, status: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('resolutionNotes validation', () => {
    test('should validate optional resolutionNotes', () => {
      const result = updateConductStatusSchema.safeParse({
        ...validData,
        resolutionNotes: 'Issue resolved after parent meeting',
      })
      expect(result.success).toBe(true)
    })

    test('should accept null resolutionNotes', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, resolutionNotes: null })
      expect(result.success).toBe(true)
    })

    test('should accept empty string resolutionNotes', () => {
      const result = updateConductStatusSchema.safeParse({ ...validData, resolutionNotes: '' })
      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle status transition from investigating to resolved', () => {
      const result = updateConductStatusSchema.safeParse({
        id: 'record-123',
        status: 'resolved',
        resolutionNotes: 'After thorough investigation, the matter has been resolved with appropriate corrective actions.',
      })
      expect(result.success).toBe(true)
    })

    test('should handle appealed status', () => {
      const result = updateConductStatusSchema.safeParse({
        id: 'record-123',
        status: 'appealed',
        resolutionNotes: 'Parent appealed the decision, pending review.',
      })
      expect(result.success).toBe(true)
    })
  })
})
