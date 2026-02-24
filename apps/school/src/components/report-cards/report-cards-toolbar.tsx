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
    <div className="pt-4 border-t border-border/10 flex flex-col sm:flex-row items-center gap-4">
      <div className="relative flex-1 w-full">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder={t.students.searchPlaceholder()}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-11 border-border/40 bg-background/40 pl-9 transition-all focus:bg-background shadow-none rounded-xl"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex bg-muted/20 p-1 rounded-xl border border-border/20 mr-2">
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
          className="h-11 px-6 border-border/40 bg-background/40 hover:bg-background rounded-xl font-bold uppercase tracking-widest text-[10px]"
        >
          <IconFilter className="mr-2 h-4 w-4" />
          {t.common.filters()}
        </Button>
        <Button
          variant={viewMode === 'averages' ? 'secondary' : 'default'}
          className={cn(
            'h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]',
            viewMode === 'averages' ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground',
          )}
          onClick={() => {
            if (viewMode === 'averages')
              onRecalculate()
            else
              onGenerateClick()
          }}
          disabled={isRecalculating}
        >
          {isRecalculating ? <IconSchool className="mr-2 h-4 w-4 animate-spin" /> : <IconFileText className="mr-2 h-4 w-4" />}
          {viewMode === 'averages' ? t.academic.grades.averages.recalculate() : t.reportCards.generate()}
        </Button>
      </div>
    </div>
  )
}
