import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { ClassForm } from '@/components/academic/class-form'
import { ClassesTable } from '@/components/academic/classes/classes-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTranslations } from '@/i18n'

const classesSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})

export const Route = createFileRoute('/_auth/classes/')({
  component: ClassesPage,
  validateSearch: classesSearchSchema,
})

function ClassesPage() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.classes() },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.classes()}</h1>
          <p className="text-muted-foreground">{t.classes.description()}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.buttons.newClass()}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.dialogs.createClass.title()}</DialogTitle>
              <DialogDescription>{t.dialogs.createClass.description()}</DialogDescription>
            </DialogHeader>
            <ClassForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ClassesTable filters={search} />
    </div>
  )
}
