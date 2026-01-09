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

  test('should validate valid conduct record data', () => {
    const result = conductRecordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should validate all conduct types', () => {
    for (const type of conductTypes) {
      const result = conductRecordSchema.safeParse({ ...validData, type })
      expect(result.success).toBe(true)
    }
  })

  test('should validate all conduct categories', () => {
    for (const category of conductCategories) {
      const result = conductRecordSchema.safeParse({ ...validData, category })
      expect(result.success).toBe(true)
    }
  })

  test('should validate all severity levels', () => {
    for (const severity of severityLevels) {
      const result = conductRecordSchema.safeParse({ ...validData, severity })
      expect(result.success).toBe(true)
    }
  })

  test('should reject empty studentId', () => {
    const result = conductRecordSchema.safeParse({ ...validData, studentId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject empty schoolYearId', () => {
    const result = conductRecordSchema.safeParse({ ...validData, schoolYearId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject empty title', () => {
    const result = conductRecordSchema.safeParse({ ...validData, title: '' })
    expect(result.success).toBe(false)
  })

  test('should reject title exceeding max length', () => {
    const result = conductRecordSchema.safeParse({ ...validData, title: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  test('should reject empty description', () => {
    const result = conductRecordSchema.safeParse({ ...validData, description: '' })
    expect(result.success).toBe(false)
  })

  test('should reject description exceeding max length', () => {
    const result = conductRecordSchema.safeParse({ ...validData, description: 'a'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  test('should reject invalid type', () => {
    const result = conductRecordSchema.safeParse({ ...validData, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid category', () => {
    const result = conductRecordSchema.safeParse({ ...validData, category: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should validate optional incidentDate', () => {
    const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '2025-12-08' })
    expect(result.success).toBe(true)
  })

  test('should reject invalid incidentDate format', () => {
    const result = conductRecordSchema.safeParse({ ...validData, incidentDate: '08-12-2025' })
    expect(result.success).toBe(false)
  })

  test('should validate optional incidentTime', () => {
    const result = conductRecordSchema.safeParse({ ...validData, incidentTime: '14:30' })
    expect(result.success).toBe(true)
  })

  test('should reject invalid incidentTime format', () => {
    const result = conductRecordSchema.safeParse({ ...validData, incidentTime: '2:30 PM' })
    expect(result.success).toBe(false)
  })

  test('should validate optional classId', () => {
    const result = conductRecordSchema.safeParse({ ...validData, classId: 'class-456' })
    expect(result.success).toBe(true)
  })

  test('should validate optional location', () => {
    const result = conductRecordSchema.safeParse({ ...validData, location: 'Classroom 101' })
    expect(result.success).toBe(true)
  })

  test('should reject location exceeding max length', () => {
    const result = conductRecordSchema.safeParse({ ...validData, location: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  test('should validate optional witnesses array', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      witnesses: ['Teacher A', 'Student B'],
    })
    expect(result.success).toBe(true)
  })

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

  test('should validate sanction dates', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      type: 'sanction',
      sanctionType: 'suspension',
      sanctionStartDate: '2025-12-08',
      sanctionEndDate: '2025-12-10',
    })
    expect(result.success).toBe(true)
  })

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

  test('should validate pointsAwarded for rewards', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      type: 'reward',
      rewardType: 'merit_points',
      pointsAwarded: 10,
    })
    expect(result.success).toBe(true)
  })

  test('should reject negative pointsAwarded', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      type: 'reward',
      pointsAwarded: -5,
    })
    expect(result.success).toBe(false)
  })

  test('should validate attachments array', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      attachments: [
        { name: 'evidence.jpg', url: 'https://example.com/evidence.jpg', type: 'image/jpeg' },
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

  test('should allow null for optional fields', () => {
    const result = conductRecordSchema.safeParse({
      ...validData,
      classId: null,
      severity: null,
      incidentDate: null,
      incidentTime: null,
      location: null,
      witnesses: null,
      sanctionType: null,
      rewardType: null,
      pointsAwarded: null,
      assignedTo: null,
      attachments: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('conductFollowUpSchema', () => {
  const validData = {
    conductRecordId: 'record-123',
    action: 'Called parent for meeting',
  }

  test('should validate valid follow-up data', () => {
    const result = conductFollowUpSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should reject empty conductRecordId', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, conductRecordId: '' })
    expect(result.success).toBe(false)
  })

  test('should reject empty action', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, action: '' })
    expect(result.success).toBe(false)
  })

  test('should reject action exceeding max length', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, action: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })

  test('should validate optional notes', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, notes: 'Parent agreed to meeting' })
    expect(result.success).toBe(true)
  })

  test('should validate optional outcome', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, outcome: 'Meeting scheduled' })
    expect(result.success).toBe(true)
  })

  test('should validate optional followUpDate', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, followUpDate: '2025-12-15' })
    expect(result.success).toBe(true)
  })

  test('should reject invalid followUpDate format', () => {
    const result = conductFollowUpSchema.safeParse({ ...validData, followUpDate: 'Dec 15, 2025' })
    expect(result.success).toBe(false)
  })
})

describe('updateConductStatusSchema', () => {
  const validData = {
    id: 'record-123',
    status: 'resolved' as const,
  }

  test('should validate valid status update data', () => {
    const result = updateConductStatusSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should validate all conduct statuses', () => {
    for (const status of conductStatuses) {
      const result = updateConductStatusSchema.safeParse({ ...validData, status })
      expect(result.success).toBe(true)
    }
  })

  test('should reject empty id', () => {
    const result = updateConductStatusSchema.safeParse({ ...validData, id: '' })
    expect(result.success).toBe(false)
  })

  test('should reject invalid status', () => {
    const result = updateConductStatusSchema.safeParse({ ...validData, status: 'invalid' })
    expect(result.success).toBe(false)
  })

  test('should validate optional resolutionNotes', () => {
    const result = updateConductStatusSchema.safeParse({
      ...validData,
      resolutionNotes: 'Issue resolved after parent meeting',
    })
    expect(result.success).toBe(true)
  })

  test('should allow null for resolutionNotes', () => {
    const result = updateConductStatusSchema.safeParse({ ...validData, resolutionNotes: null })
    expect(result.success).toBe(true)
  })
})
