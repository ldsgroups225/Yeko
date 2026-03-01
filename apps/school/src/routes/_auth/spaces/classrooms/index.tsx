import { IconBuilding, IconPlus } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { motion } from 'motion/react'
import { useState } from 'react'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { ClassroomsTable } from '@/components/spaces/classrooms/classrooms-table'
import { useTranslations } from '@/i18n'

const classroomsSearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/_auth/spaces/classrooms/')({
  component: ClassroomsPage,
  validateSearch: classroomsSearchSchema,
})

function ClassroomsPage() {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const search = Route.useSearch()

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.spaces.title() },
        ]}
      />

      <div className="
        flex flex-col gap-4
        sm:flex-row sm:items-end sm:justify-between
      "
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="
            bg-primary/10 border-primary/20 rounded-2xl border p-3 shadow-lg
            backdrop-blur-xl
          "
          >
            <IconBuilding className="text-primary size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.spaces.title()}
            </h1>
            <p className="
              text-muted-foreground max-w-lg text-sm font-medium italic
            "
            >
              {t.spaces.description()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={(
                <Button className="shadow-primary/20 h-10 rounded-xl shadow-lg">
                  <IconPlus className="mr-2 h-4 w-4" />
                  {t.buttons.newClassroom()}
                </Button>
              )}
            />
            <DialogContent className="
              bg-card/95 border-border/40 max-w-2xl rounded-3xl p-6 shadow-2xl
              backdrop-blur-xl
              sm:max-w-3xl
            "
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {t.dialogs.createClassroom.title()}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80">
                  {t.dialogs.createClassroom.description()}
                </DialogDescription>
              </DialogHeader>
              <ClassroomForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ClassroomsTable filters={search} />
      </motion.div>
    </div>
  )
}
