import type { GradeStatus, GradeType } from '@/schemas/grade'
import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from '@/i18n'
import { gradeStatuses, gradeStatusLabels, gradeTypeLabels, gradeTypes } from '@/schemas/grade'

interface GradeFiltersProps {
  status?: GradeStatus
  type?: GradeType
  onStatusChange: (status: GradeStatus | undefined) => void
  onTypeChange: (type: GradeType | undefined) => void
  onClear: () => void
}

export function GradeFilters({
  status,
  type,
  onStatusChange,
  onTypeChange,
  onClear,
}: GradeFiltersProps) {
  const t = useTranslations()
  const activeFilters = [status, type].filter(Boolean).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="mr-2 size-4" />
          {t.academic.grades.filters.title()}
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-2 rounded-full px-1.5">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t.academic.grades.filters.title()}</h4>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-auto p-1 text-muted-foreground"
              >
                <X className="mr-1 size-3" />
                {t.academic.grades.filters.clear()}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-status-filter">{t.academic.grades.filters.status()}</Label>
            <Select
              value={status ?? 'all'}
              onValueChange={v => onStatusChange(v === 'all' ? undefined : v as GradeStatus)}
            >
              <SelectTrigger id="grade-status-filter">
                <SelectValue placeholder={t.academic.grades.filters.allStatuses()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.academic.grades.filters.allStatuses()}</SelectItem>
                {gradeStatuses.map(s => (
                  <SelectItem key={s} value={s}>
                    {gradeStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-type-filter">{t.academic.grades.filters.gradeType()}</Label>
            <Select
              value={type ?? 'all'}
              onValueChange={v => onTypeChange(v === 'all' ? undefined : v as GradeType)}
            >
              <SelectTrigger id="grade-type-filter">
                <SelectValue placeholder={t.academic.grades.filters.allTypes()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.academic.grades.filters.allTypes()}</SelectItem>
                {gradeTypes.map(t => (
                  <SelectItem key={t} value={t}>
                    {gradeTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
