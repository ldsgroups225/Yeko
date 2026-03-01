import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { lazy, Suspense } from 'react'
import { useTranslations } from '@/i18n'
import { ClassCoverageSummary } from './class-coverage-summary'
import { useClassSubjectManager } from './class-subject-manager-context'
import { ClassSubjectManagerProvider } from './class-subject-manager-provider'
import { ClassSubjectManagerTable } from './class-subject-manager-table'

const ClassSubjectManagerDialogs = lazy(() => import('./class-subject-manager-dialogs').then(m => ({ default: m.ClassSubjectManagerDialogs })))

interface ClassSubjectManagerProps {
  classId: string
  className: string
}

export function ClassSubjectManager({
  classId,
  className,
}: ClassSubjectManagerProps) {
  return (
    <ClassSubjectManagerProvider classId={classId} className={className}>
      <ClassSubjectManagerContent />
    </ClassSubjectManagerProvider>
  )
}

function ClassSubjectManagerContent() {
  const t = useTranslations()
  const { state, actions } = useClassSubjectManager()
  const { subjects, className, isPending } = state
  const { setIsDialogOpen, setIsCopyDialogOpen } = actions

  return (
    <div className="space-y-6">
      {!isPending && subjects && <ClassCoverageSummary subjects={subjects} />}

      <Card className="border-border/40 bg-card/50 shadow-sm backdrop-blur-xl">
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-4
        "
        >
          <div>
            <CardTitle>{t.academic.classes.subjectsTitle()}</CardTitle>
            <CardDescription>
              {t.academic.classes.subjectsDescription()}
              {' '}
              {className}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCopyDialogOpen(true)}
              className="
                focus-visible:ring-ring
                border-input
                hover:bg-accent hover:text-accent-foreground
                inline-flex h-9 items-center justify-center rounded-md border
                bg-transparent px-3 text-sm font-medium shadow-sm
                transition-colors
                focus-visible:ring-1 focus-visible:outline-none
                disabled:pointer-events-none disabled:opacity-50
              "
            >
              {t.academic.classes.copyFrom()}
            </button>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="
                focus-visible:ring-ring
                bg-primary text-primary-foreground
                hover:bg-primary/90
                inline-flex h-9 items-center justify-center rounded-md px-3
                text-sm font-medium shadow-sm transition-colors
                focus-visible:ring-1 focus-visible:outline-none
                disabled:pointer-events-none disabled:opacity-50
              "
            >
              {t.academic.classes.addSubject()}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ClassSubjectManagerTable />
        </CardContent>
        <Suspense fallback={null}>
          <ClassSubjectManagerDialogs />
        </Suspense>
      </Card>
    </div>
  )
}
