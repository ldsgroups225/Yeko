import { IconBook } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { useSchoolSubjectList } from './school-subject-list-context'
import { SubjectStatusToggle } from './subject-status-toggle'

export function SchoolSubjectListMobile() {
  const t = useTranslations()
  const { state, actions } = useSchoolSubjectList()
  const { table, subjectsData } = state
  const { toggleStatus } = actions

  const hasNoData = subjectsData.length === 0

  if (hasNoData) {
    return (
      <div className="flex md:hidden flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/40 bg-card/50 p-6">
        <IconBook className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-semibold">
          {t.academic.subjects.noSubjects()}
        </h3>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:hidden">
      <AnimatePresence>
        {table.getRowModel().rows.map((row, index) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="overflow-hidden rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-foreground">
                  {row.original.subject.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {row.original.subject.shortName}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-card/30 border-0 shadow-none text-[10px]"
              >
                {row.original.subject.category || 'Autre'}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-3">
              <span className="text-xs text-muted-foreground">
                {t.common.status()}
              </span>
              <SubjectStatusToggle
                status={row.original.status}
                onToggle={status => toggleStatus(row.original.id, status)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
