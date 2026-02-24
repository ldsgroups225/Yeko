import type { Grade, Student } from './grade-entry/types'
import type { GradeType } from '@/schemas/grade'

import { lazy, Suspense } from 'react'

import { GradeEntryFooter } from './grade-entry/grade-entry-footer'
import { GradeEntryHeader } from './grade-entry/grade-entry-header'
import { GradeEntryProvider } from './grade-entry/grade-entry-provider'
import { GradeEntryTableContent } from './grade-entry/grade-entry-table'

// Lazy load dialogs as they are not needed for initial render
const GradeEntryDialogs = lazy(() => import('./grade-entry/grade-entry-dialogs').then(m => ({ default: m.GradeEntryDialogs })))

interface GradeEntryTableProps {
  classId: string
  subjectId: string
  termId: string
  teacherId: string
  gradeType: GradeType
  weight: number
  description?: string
  gradeDate?: string
  students: Student[]
  existingGrades: Grade[]
  onSaveComplete?: () => void
  onSubmissionComplete?: () => void
  onReset?: () => void
}

export function GradeEntryTable(props: GradeEntryTableProps) {
  return (
    <GradeEntryProvider {...props}>
      <div className="space-y-6">
        <GradeEntryHeader />
        <GradeEntryTableContent />
        <GradeEntryFooter />
        <Suspense fallback={null}>
          <GradeEntryDialogs />
        </Suspense>
      </div>
    </GradeEntryProvider>
  )
}
