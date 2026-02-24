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

      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              {t.academic.classes.copyFrom()}
            </button>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3"
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
