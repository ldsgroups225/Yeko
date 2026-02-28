import { IconChartBar, IconFileText, IconFilter, IconList, IconSchool, IconSearch } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface ReportCardsToolbarProps {
  search: string
  setSearch: (value: string) => void
  viewMode: 'cards' | 'averages'
  setViewMode: (mode: 'cards' | 'averages') => void
  onRecalculate: () => void
  isRecalculating: boolean
  onGenerateClick: () => void
}

export function ReportCardsToolbar({
  search,
  setSearch,
  viewMode,
  setViewMode,
  onRecalculate,
  isRecalculating,
  onGenerateClick,
}: ReportCardsToolbarProps) {
  const t = useTranslations()

  return (
    <div className="
      border-border/10 flex flex-col items-center gap-4 border-t pt-4
      sm:flex-row
    "
    >
      <div className="relative w-full flex-1">
        <IconSearch className="
          text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4
          -translate-y-1/2
        "
        />
        <Input
          placeholder={t.students.searchPlaceholder()}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="
            border-border/40 bg-background/40
            focus:bg-background
            h-11 rounded-xl pl-9 shadow-none transition-all
          "
        />
      </div>
      <div className="flex gap-2">
        <div className="
          bg-muted/20 border-border/20 mr-2 flex rounded-xl border p-1
        "
        >
          <Button
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={cn('h-9 px-3', viewMode === 'cards' && 'shadow-sm')}
          >
            <IconList className="mr-2 h-4 w-4" />
            {t.academic.grades.averages.viewCards()}
          </Button>
          <Button
            variant={viewMode === 'averages' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('averages')}
            className={cn('h-9 px-3', viewMode === 'averages' && 'shadow-sm')}
          >
            <IconChartBar className="mr-2 h-4 w-4" />
            {t.academic.grades.averages.viewAverages()}
          </Button>
        </div>

        <Button
          variant="outline"
          className="
            border-border/40 bg-background/40
            hover:bg-background
            h-11 rounded-xl px-6 text-[10px] font-bold tracking-widest uppercase
          "
        >
          <IconFilter className="mr-2 h-4 w-4" />
          {t.common.filters()}
        </Button>
        <Button
          variant={viewMode === 'averages' ? 'secondary' : 'default'}
          className={cn(
            `
              h-11 rounded-xl px-6 text-[10px] font-bold tracking-widest
              uppercase
            `,
            viewMode === 'averages'
              ? `
                bg-primary/10 text-primary
                hover:bg-primary/20
                border-primary/20 border
              `
              : `
                bg-primary
                hover:bg-primary/90
                text-primary-foreground
              `,
          )}
          onClick={() => {
            if (viewMode === 'averages')
              onRecalculate()
            else
              onGenerateClick()
          }}
          disabled={isRecalculating}
        >
          {isRecalculating
            ? <IconSchool className="mr-2 h-4 w-4 animate-spin" />
            : (
                <IconFileText className="mr-2 h-4 w-4" />
              )}
          {viewMode === 'averages' ? t.academic.grades.averages.recalculate() : t.reportCards.generate()}
        </Button>
      </div>
    </div>
  )
}
