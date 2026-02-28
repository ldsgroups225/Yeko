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
      className="
        border-border/40 bg-card/30 flex flex-col gap-4 rounded-2xl border p-4
        shadow-xl backdrop-blur-xl
        sm:flex-row sm:items-center sm:justify-between
      "
    >
      <div className="flex flex-1 gap-3">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="
            text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4
            -translate-y-1/2
          "
          />
          <Input
            placeholder={t.common.search()}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              border-border/40 bg-background/50
              focus:bg-background
              h-11 rounded-xl pl-9 shadow-none transition-all
            "
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="
                text-muted-foreground/40
                hover:text-muted-foreground
                absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2
              "
              onClick={() => setSearch('')}
            >
              <IconX className="size-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          className="
            border-border/40 bg-background/50
            hover:bg-background
            h-11 rounded-xl px-4 shadow-none backdrop-blur-sm
          "
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
                className="
                  bg-primary/10 text-primary border-primary/20 h-11 rounded-xl
                  border px-4 font-bold shadow-none
                "
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
                className="
                  border-destructive/30 text-destructive
                  hover:bg-destructive hover:text-destructive-foreground
                  h-11 rounded-xl text-[10px] font-bold tracking-widest
                  uppercase shadow-sm transition-all
                "
              >
                <IconCircleX className="mr-1.5 size-4" />
                {t.academic.grades.validations.reject()}
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={onBulkValidate}
                className="
                  bg-success
                  hover:bg-success/90
                  shadow-success/20 h-11 rounded-xl text-[10px] font-bold
                  tracking-widest uppercase shadow-lg
                "
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
