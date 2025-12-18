import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { ClassroomsTable } from '@/components/spaces/classrooms/classrooms-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const classroomsSearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/_auth/app/spaces/classrooms/')({
  component: ClassroomsPage,
  validateSearch: classroomsSearchSchema,
})

function ClassroomsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.spaces'), href: '/app/spaces/classrooms' },
          { label: t('spaces.title') },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('spaces.title')}</h1>
          <p className="text-muted-foreground">{t('spaces.description')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('buttons.newClassroom')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('dialogs.createClassroom.title')}</DialogTitle>
              <DialogDescription>{t('dialogs.createClassroom.description')}</DialogDescription>
            </DialogHeader>
            <ClassroomForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ClassroomsTable filters={search} />
    </div>
  )
}
