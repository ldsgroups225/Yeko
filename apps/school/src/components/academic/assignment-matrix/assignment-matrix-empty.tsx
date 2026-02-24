import { IconPlus, IconSettings } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'

export function AssignmentMatrixEmpty() {
  const t = useTranslations()
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <IconSettings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {t.assignmentMatrix.emptyTitle()}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t.assignmentMatrix.emptyDescription()}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              render={(
                <Link to="/classes">
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t.classes.create()}
                </Link>
              )}
            />
            <Button
              variant="outline"
              render={(
                <Link to="/programs/subjects">
                  <IconSettings className="mr-2 h-4 w-4" />
                  {t.subjects.configure()}
                </Link>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
