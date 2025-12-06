import type { ClassSubject, Subject } from '@repo/data-ops'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ClassCoverageSummaryProps {
  subjects: Array<{
    classSubject: ClassSubject
    subject: Subject
    teacher?: { id: string, name: string } | null
  }>
}

export function ClassCoverageSummary({ subjects }: ClassCoverageSummaryProps) {
  const totalSubjects = subjects.length
  const assignedSubjects = subjects.filter(s => !!s.classSubject.teacherId).length

  const totalHours = subjects.reduce((acc, curr) => acc + curr.classSubject.hoursPerWeek, 0)
  const totalCoefficient = subjects.reduce((acc, curr) => acc + curr.classSubject.coefficient, 0)

  const coveragePercentage = totalSubjects > 0
    ? Math.round((assignedSubjects / totalSubjects) * 100)
    : 0

  const isComplete = coveragePercentage === 100 && totalSubjects > 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="text-2xl font-bold">{totalSubjects}</div>
        <p className="text-xs text-muted-foreground">Total Subjects</p>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="text-2xl font-bold">{totalCoefficient}</div>
        <p className="text-xs text-muted-foreground">Total Coefficient</p>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
        <div className="text-2xl font-bold">
          {totalHours}
          h
        </div>
        <p className="text-xs text-muted-foreground">Weekly Hours</p>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Assignment Coverage</span>
            <span className="text-sm text-muted-foreground">
              {coveragePercentage}
              %
            </span>
          </div>
          <Progress value={coveragePercentage} className="h-2" />
        </div>
        <div className="mt-4">
          {isComplete
            ? (
              <div className="flex items-center text-xs text-green-600 font-medium">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                All subjects assigned
              </div>
            )
            : (
              <div className="flex items-center text-xs text-amber-600 font-medium">
                <AlertCircle className="mr-1 h-3 w-3" />
                {totalSubjects - assignedSubjects}
                {' '}
                unassigned
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
