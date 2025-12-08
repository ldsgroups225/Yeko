import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { ParticipationGradeInput } from './participation-grade-input'

interface Student {
  id: string
  firstName: string
  lastName: string
  matricule: string
  photoUrl: string | null
}

interface ParticipationGrade {
  studentId: string
  grade: number
  comment?: string
}

interface StudentParticipationListProps {
  students: Student[]
  grades: ParticipationGrade[]
  onGradeChange: (studentId: string, grade: number) => void
  onCommentChange: (studentId: string, comment: string) => void
  onSave: () => void
  isSaving?: boolean
}

export function StudentParticipationList({
  students,
  grades,
  onGradeChange,
  onCommentChange,
  onSave,
  isSaving,
}: StudentParticipationListProps) {
  const { t } = useTranslation()
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  const getGrade = (studentId: string) => {
    return grades.find(g => g.studentId === studentId)?.grade ?? null
  }

  const getComment = (studentId: string) => {
    return grades.find(g => g.studentId === studentId)?.comment ?? ''
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const gradedCount = grades.filter(g => g.grade > 0).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {gradedCount}
          /
          {students.length}
          {' '}
          {t('session.participation').toLowerCase()}
        </p>
        <Button onClick={onSave} disabled={isSaving || gradedCount === 0} size="sm">
          {isSaving ? t('common.loading') : t('participation.save')}
        </Button>
      </div>

      <div className="space-y-2">
        {students.map(student => (
          <div
            key={student.id}
            className="rounded-lg border bg-card p-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={student.photoUrl ?? undefined} />
                <AvatarFallback>
                  {getInitials(student.firstName, student.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {student.lastName}
                  {' '}
                  {student.firstName}
                </p>
                <p className="text-xs text-muted-foreground">{student.matricule}</p>
              </div>

              <ParticipationGradeInput
                value={getGrade(student.id)}
                onChange={grade => onGradeChange(student.id, grade)}
              />
            </div>

            {expandedStudent === student.id && (
              <div className="mt-3 pt-3 border-t">
                <Input
                  placeholder={t('participation.comment')}
                  value={getComment(student.id)}
                  onChange={e => onCommentChange(student.id, e.target.value)}
                  className="text-sm"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setExpandedStudent(
                  expandedStudent === student.id ? null : student.id,
                )}
              className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {expandedStudent === student.id
                ? t('common.cancel')
                : t('participation.comment')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
