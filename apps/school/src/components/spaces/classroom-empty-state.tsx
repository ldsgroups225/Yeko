import { IconBuilding, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { useTranslations } from '@/i18n'

export function ClassroomEmptyState() {
  const t = useTranslations()

  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
      <CardContent className="p-16">
        <div className="
          flex flex-col items-center justify-center space-y-6 text-center
        "
        >
          <div className="bg-muted/30 ring-border/50 rounded-full p-8 ring-1">
            <IconBuilding className="text-muted-foreground/50 h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{t.empty.noClassrooms()}</h3>
            <p className="text-muted-foreground mx-auto max-w-md">
              {t.empty.createClassroomsDescription()}
            </p>
          </div>
          <Button
            render={(
              <Link to="/spaces/classrooms">
                <IconPlus className="mr-2 h-4 w-4" />
                {t.empty.createClassroom()}
              </Link>
            )}
            className="shadow-primary/20 mt-4 h-11 rounded-xl px-8 shadow-lg"
          />
        </div>
      </CardContent>
    </Card>
  )
}
