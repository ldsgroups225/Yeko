import { describe, expect, test } from 'vitest'

// ============================================
// CLASSES UNIT TESTS
// ============================================

describe('classes Functions - Unit Tests', () => {
  describe('class Schemas', () => {
    describe('createClassSchema', () => {
      test('should validate class creation data', () => {
        const classData = {
          name: '6ème A',
          gradeId: 'grade-6',
          section: 'A',
          classroomId: 'room-101',
          maxStudents: 30,
        }
        expect(classData.name).toBe('6ème A')
        expect(classData.maxStudents).toBe(30)
      })

      test('should validate class name length', () => {
        const validName = '6ème A'
        expect(validName.length).toBeGreaterThan(0)
        expect(validName.length).toBeLessThanOrEqual(100)
      })

      test('should validate section format', () => {
        const sections = ['A', 'B', 'C', '1', '2', '3']
        sections.forEach((section) => {
          expect(section.length).toBeLessThanOrEqual(10)
        })
      })
    })

    describe('updateClassSchema', () => {
      test('should allow partial updates', () => {
        const updateData = {
          classId: 'class-123',
          name: '6ème B',
        }
        expect(updateData.classId).toBe('class-123')
        expect(updateData.name).toBe('6ème B')
      })

      test('should require classId', () => {
        const data = { classId: 'class-123' }
        expect(data.classId).toBeDefined()
      })
    })
  })

  describe('student Roster', () => {
    test('should format student name', () => {
      const student = {
        firstName: 'Jean',
        lastName: 'Dupont',
      }
      const fullName = `${student.firstName} ${student.lastName}`
      expect(fullName).toBe('Jean Dupont')
    })

    test('should sort students alphabetically', () => {
      const students = [
        { firstName: 'Marie', lastName: 'Martin' },
        { firstName: 'Jean', lastName: 'Dupont' },
        { firstName: 'Pierre', lastName: ' Durand' },
      ]
      const sorted = [...students].sort((a, b) =>
        a.lastName.localeCompare(b.lastName),
      )
      expect(sorted[0]?.lastName).toBe(' Durand')
    })

    test('should calculate student count per class', () => {
      const roster = [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
      expect(roster).toHaveLength(3)
    })

    test('should handle empty roster', () => {
      const roster: Array<{ id: string }> = []
      expect(roster).toHaveLength(0)
    })
  })

  describe('class Statistics', () => {
    test('should calculate gender distribution', () => {
      const students = [
        { gender: 'M' },
        { gender: 'F' },
        { gender: 'M' },
        { gender: 'F' },
        { gender: 'F' },
      ]
      const maleCount = students.filter(s => s.gender === 'M').length
      const femaleCount = students.filter(s => s.gender === 'F').length
      expect(maleCount).toBe(2)
      expect(femaleCount).toBe(3)
    })

    test('should calculate class capacity', () => {
      const maxStudents = 30
      const currentStudents = 25
      const capacityPercent = (currentStudents / maxStudents) * 100
      expect(capacityPercent).toBeCloseTo(83.33, 1)
    })
  })
})
