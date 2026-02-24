import { IconCircleCheck, IconCircleX, IconFilter, IconSearch, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { AnimatePresence, motion } from 'motion/react'

interface GradingFiltersProps {
  search: string
  setSearch: (search: string) => void
  onFilterClick?: () => void
  selectedRows: string[]
  totalPendingSelected: number
  onBulkReject: () => void
  onBulkValidate: () => void
  t: any
}

export function GradingFilters({
  search,
  setSearch,
  selectedRows,
  totalPendingSelected,
  onBulkReject,
  onBulkValidate,
  t,
}: GradingFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between shadow-xl"
    >
      <div className="flex flex-1 gap-3">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder={t.common.search()}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-11 border-border/40 bg-background/50 pl-9 transition-all focus:bg-background shadow-none rounded-xl"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/40 hover:text-muted-foreground"
              onClick={() => setSearch('')}
            >
              <IconX className="size-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          className="h-11 px-4 border-border/40 bg-background/50 backdrop-blur-sm shadow-none hover:bg-background rounded-xl"
        >
          <IconFilter className="mr-2 h-4 w-4" />
          {t.academic.grades.filters.title()}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {selectedRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <Badge
                variant="secondary"
                className="h-11 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-none font-bold"
              >
                {selectedRows.length}
                {' '}
                {t.common.selected()}
                {' '}
                (
                {totalPendingSelected}
                {' '}
                {t.academic.grades.entry.studentGrades().toLowerCase()}
                )
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={onBulkReject}
                className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
              >
                <IconCircleX className="mr-1.5 size-4" />
                {t.academic.grades.validations.reject()}
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={onBulkValidate}
                className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-success hover:bg-success/90 shadow-lg shadow-success/20"
              >
                <IconCircleCheck className="mr-1.5 size-4" />
                {t.academic.grades.validations.validate()}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
