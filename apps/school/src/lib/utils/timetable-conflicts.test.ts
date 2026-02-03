import { describe, expect, test } from 'vitest'
import { detectConflicts } from './timetable-conflicts'

describe('detectConflicts', () => {
  test('should return no conflicts when sessions do not overlap', () => {
    const sessions = [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        subjectId: 's1',
        subjectName: 'Math',
        teacherId: 't1',
        teacherName: 'John',
      },
      {
        id: '2',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: 's2',
        subjectName: 'Physics',
        teacherId: 't2',
        teacherName: 'Jane',
      },
    ]

    const results = detectConflicts(sessions)
    expect(results[0]?.hasConflict).toBe(false)
    expect(results[1]?.hasConflict).toBe(false)
  })

  test('should detect conflict when two sessions overlap on the same day', () => {
    const sessions = [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        subjectId: 's1',
        subjectName: 'Math',
        teacherId: 't1',
        teacherName: 'John',
      },
      {
        id: '2',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: 's2',
        subjectName: 'Physics',
        teacherId: 't2',
        teacherName: 'Jane',
      },
    ]

    const results = detectConflicts(sessions)
    expect(results[0]?.hasConflict).toBe(true)
    expect(results[1]?.hasConflict).toBe(true)
    expect(results[0]?.conflictsWith).toContain('2')
    expect(results[1]?.conflictsWith).toContain('1')
  })

  test('should not detect conflict for sessions on different days with same time', () => {
    const sessions = [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:30',
        subjectId: 's1',
        subjectName: 'Math',
        teacherId: 't1',
        teacherName: 'John',
      },
      {
        id: '2',
        dayOfWeek: 2,
        startTime: '08:00',
        endTime: '09:30',
        subjectId: 's2',
        subjectName: 'Physics',
        teacherId: 't2',
        teacherName: 'Jane',
      },
    ]

    const results = detectConflicts(sessions)
    expect(results[0]?.hasConflict).toBe(false)
    expect(results[1]?.hasConflict).toBe(false)
  })

  test('should not detect conflict for back-to-back sessions', () => {
    const sessions = [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
        subjectId: 's1',
        subjectName: 'Math',
        teacherId: 't1',
        teacherName: 'John',
      },
      {
        id: '2',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: 's2',
        subjectName: 'Physics',
        teacherId: 't2',
        teacherName: 'Jane',
      },
    ]

    const results = detectConflicts(sessions)
    expect(results[0]?.hasConflict).toBe(false)
    expect(results[1]?.hasConflict).toBe(false)
  })

  test('should detect multiple conflicts correctly', () => {
    const sessions = [
      {
        id: '1',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:00',
        subjectId: 's1',
        subjectName: 'Math',
        teacherId: 't1',
        teacherName: 'John',
      },
      {
        id: '2',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
        subjectId: 's2',
        subjectName: 'Physics',
        teacherId: 't2',
        teacherName: 'Jane',
      },
      {
        id: '3',
        dayOfWeek: 1,
        startTime: '10:30',
        endTime: '12:00',
        subjectId: 's3',
        subjectName: 'History',
        teacherId: 't3',
        teacherName: 'Bob',
      },
    ]

    const results = detectConflicts(sessions)

    // Session 1 conflicts with 2
    expect(results[0]?.hasConflict).toBe(true)
    expect(results[0]?.conflictsWith).toContain('2')
    expect(results[0]?.conflictsWith).not.toContain('3')

    // Session 2 conflicts with 1 and 3
    expect(results[1]?.hasConflict).toBe(true)
    expect(results[1]?.conflictsWith).toContain('1')
    expect(results[1]?.conflictsWith).toContain('3')

    // Session 3 conflicts with 2
    expect(results[2]?.hasConflict).toBe(true)
    expect(results[2]?.conflictsWith).toContain('2')
    expect(results[2]?.conflictsWith).not.toContain('1')
  })
})
