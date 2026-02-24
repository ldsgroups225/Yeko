import {
  IconDots,
  IconPencil,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useClassesTable } from './classes-table-context'

export function ClassesTableMobile() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { state, actions } = useClassesTable()
  const { data, isPending, selectedRows } = state
  const { handleSelectRow, setClassToDelete, setClassToEdit, setIsEditDialogOpen } = actions

  if (isPending) {
    return (
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 5 }, () => (
          <div
            key={`card-skeleton-${Math.random()}`}
            className="rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data?.length === 0) {
    return (
      <div className="md:hidden flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-card/50 p-8 text-center backdrop-blur-sm">
        <IconUsers className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">
          {t.tables.noClassesFound()}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t.tables.createFirstClass()}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:hidden">
      <AnimatePresence>
        {data?.map((item, index) => (
          <motion.div
            key={item.class.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border/40 bg-card/50 p-4 shadow-sm backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedRows.includes(item.class.id)}
                  onCheckedChange={checked =>
                    handleSelectRow(item.class.id, !!checked)}
                  className="mr-2 border-primary/50 data-[state=checked]:border-primary"
                />
                <div
                  onClick={() =>
                    navigate({ to: `/classes/${item.class.id}` })}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate({ to: `/classes/${item.class.id}` })
                    }
                  }}
                >
                  <p className="font-medium text-foreground">
                    {item.grade.name}
                    {' '}
                    {item.series?.name}
                    {' '}
                    <span className="text-muted-foreground">
                      {item.class.section}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.classroom?.name || t.classes.noClassroom()}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={(
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-card/20"
                    >
                      <IconDots className="h-4 w-4" />
                    </Button>
                  )}
                />
                <DropdownMenuContent
                  align="end"
                  className="backdrop-blur-xl bg-popover/90 border border-border/40"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setClassToEdit(item)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <IconPencil className="mr-2 h-4 w-4" />
                    {t.common.edit()}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setClassToDelete(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  item.class.status === 'active' ? 'default' : 'secondary'
                }
                className="border-0 shadow-none"
              >
                {item.class.status === 'active'
                  ? t.common.active()
                  : t.common.archived()}
              </Badge>
              <Badge
                variant="outline"
                className="border-border/40 bg-card/20 backdrop-blur-md"
              >
                <IconUsers className="mr-1 h-3 w-3" />
                {item.studentsCount}
              </Badge>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
