import { IconSchool } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'
import { useAssignmentMatrix } from './assignment-matrix-context'

export function AssignmentMatrixHeader() {
  const t = useTranslations()
  const { state } = useAssignmentMatrix()
  const { classes, subjects, matrixData } = state

  return (
    <CardHeader className="border-b border-border/10 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconSchool className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t.assignmentMatrix.title()}</CardTitle>
            <CardDescription>
              {classes.length}
              {' '}
              {t.common.classes()}
              {' '}
              ×
              {' '}
              {subjects.length}
              {' '}
              {t.common.subjects()}
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="border-border/40 bg-white/5">
          {matrixData.length}
          {' '}
          {t.common.total()}
        </Badge>
      </div>
    </CardHeader>
  )
}
