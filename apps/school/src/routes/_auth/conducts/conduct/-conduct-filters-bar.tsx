import type { ConductClassOption } from './-conduct.types'
import type { TranslationFunctions } from '@/i18n'
import { IconChartBar, IconFilter, IconPlus, IconSearch } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

interface ConductFiltersBarProps {
  t: TranslationFunctions
  classes: ConductClassOption[]
  selectedClassId?: string
  selectedClassLabel: string
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onClassChange: (value: string) => void
}

export function ConductFiltersBar({
  t,
  classes,
  selectedClassId,
  selectedClassLabel,
  searchTerm,
  onSearchTermChange,
  onClassChange,
}: ConductFiltersBarProps) {
  return (
    <Card className="rounded-[28px] border-white/60 bg-white/85 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground/70 flex items-center gap-2 text-xs font-black tracking-[0.24em] uppercase">
          <IconFilter className="h-4 w-4" />
          {t.conduct.filters()}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px_auto]">
        <div className="relative flex items-center">
          <Input
            value={searchTerm}
            placeholder={t.conduct.searchPlaceholder()}
            onChange={e => onSearchTermChange(e.target.value)}
            className="h-12 rounded-2xl border-slate-200 bg-white pr-10 shadow-none"
          />
          <IconSearch className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>

        <Select value={selectedClassId ?? 'all'} onValueChange={value => onClassChange(value ?? 'all')}>
          <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-white shadow-none">
            <SelectValue>{selectedClassLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.conduct.allClasses()}</SelectItem>
            {classes.map(item => (
              <SelectItem key={item.class.id} value={item.class.id}>
                {`${item.grade?.name ?? ''} ${item.class.section}`.trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link to="/conducts/conduct/reports">
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white px-4 shadow-none">
              <IconChartBar className="mr-2 h-4 w-4" />
              {t.conduct.reports()}
            </Button>
          </Link>
          <Link to="/conducts/conduct/new">
            <Button className="h-12 rounded-2xl bg-orange-500 px-4 text-white hover:bg-orange-600">
              <IconPlus className="mr-2 h-4 w-4" />
              {t.conduct.newRecord()}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
