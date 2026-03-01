import type { GradeStatus, GradeType } from '@/schemas/grade'
import {
  IconBriefcase,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconFileText,
  IconFilter,
  IconHelpCircle,
  IconHome,
  IconLayoutDashboard,
  IconSchool,
  IconSend,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import {
  gradeStatuses,
  gradeStatusLabels,
  gradeTypeLabels,
  gradeTypes,
} from '@/schemas/grade'

interface GradeFiltersProps {
  status?: GradeStatus
  type?: GradeType
  onStatusChange: (status: GradeStatus | undefined) => void
  onTypeChange: (type: GradeType | undefined) => void
  onClear: () => void
}

const statusIcons: Record<GradeStatus, React.ElementType> = {
  draft: IconEdit,
  submitted: IconSend,
  validated: IconCircleCheck,
  rejected: IconCircleX,
}

const gradeTypeIcons: Record<GradeType, React.ElementType> = {
  quiz: IconHelpCircle,
  test: IconFileText,
  exam: IconSchool,
  participation: IconUserCheck,
  homework: IconHome,
  project: IconBriefcase,
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
      <PopoverTrigger
        render={(
          <Button
            variant="outline"
            size="sm"
            className="
              border-border/40 bg-background/50
              hover:bg-background
              group h-10 rounded-xl shadow-sm transition-all
            "
          >
            <IconFilter className="
              mr-2 size-4 transition-transform
              group-hover:rotate-12
            "
            />
            <span className="font-semibold">
              {t.academic.grades.filters.title()}
            </span>
            {activeFilters > 0 && (
              <Badge
                variant="secondary"
                className="
                  bg-primary text-primary-foreground ml-2 h-5 min-w-[20px]
                  rounded-full px-1.5 text-[10px] font-bold
                "
              >
                {activeFilters}
              </Badge>
            )}
          </Button>
        )}
      />
      <PopoverContent
        className="
          bg-popover/90 border-border/40 w-80 rounded-xl p-5 shadow-xl
          backdrop-blur-2xl
        "
        align="end"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="
                bg-primary/10 text-primary flex h-7 w-7 items-center
                justify-center rounded-lg
              "
              >
                <IconFilter className="h-3.5 w-3.5" />
              </div>
              <h4 className="
                text-foreground text-sm font-bold tracking-wider uppercase
              "
              >
                {t.academic.grades.filters.title()}
              </h4>
            </div>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="
                  text-destructive
                  hover:bg-destructive/10
                  h-7 rounded-lg px-2 text-[10px] font-bold tracking-widest
                  uppercase transition-colors
                "
              >
                <IconX className="mr-1 size-3" />
                {t.academic.grades.filters.clear()}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="grade-status-filter"
              className="
                text-muted-foreground ml-1 text-[11px] font-bold tracking-widest
                uppercase
              "
            >
              {t.academic.grades.filters.status()}
            </Label>
            <Select
              value={status ?? 'all'}
              onValueChange={v =>
                onStatusChange(v === 'all' ? undefined : (v as GradeStatus))}
            >
              <SelectTrigger
                id="grade-status-filter"
                className="
                  border-border/40 bg-background/50
                  focus:bg-background
                  h-11 rounded-xl transition-all
                "
              >
                <SelectValue
                  placeholder={t.academic.grades.filters.allStatuses()}
                />
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-xl backdrop-blur-2xl
              "
              >
                <SelectItem value="all" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="
                      bg-muted text-muted-foreground flex h-6 w-6 items-center
                      justify-center rounded-md
                    "
                    >
                      <IconLayoutDashboard className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">
                      {t.academic.grades.filters.allStatuses()}
                    </span>
                  </div>
                </SelectItem>
                {gradeStatuses.map((s) => {
                  const Icon = statusIcons[s]
                  return (
                    <SelectItem key={s} value={s} className="rounded-lg py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            `
                              flex h-6 w-6 items-center justify-center
                              rounded-md border
                            `,
                            s === 'draft'
                            && `
                              border-slate-500/20 bg-slate-500/10 text-slate-600
                            `,
                            s === 'submitted'
                            && 'border-blue-500/20 bg-blue-500/10 text-blue-600',
                            s === 'validated'
                            && `
                              border-emerald-500/20 bg-emerald-500/10
                              text-emerald-600
                            `,
                            s === 'rejected'
                            && `
                              bg-destructive/10 text-destructive
                              border-destructive/20
                            `,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">
                          {gradeStatusLabels[s]}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="grade-type-filter"
              className="
                text-muted-foreground ml-1 text-[11px] font-bold tracking-widest
                uppercase
              "
            >
              {t.academic.grades.filters.gradeType()}
            </Label>
            <Select
              value={type ?? 'all'}
              onValueChange={v =>
                onTypeChange(v === 'all' ? undefined : (v as GradeType))}
            >
              <SelectTrigger
                id="grade-type-filter"
                className="
                  border-border/40 bg-background/50
                  focus:bg-background
                  h-11 rounded-xl transition-all
                "
              >
                <SelectValue
                  placeholder={t.academic.grades.filters.allTypes()}
                />
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-xl backdrop-blur-2xl
              "
              >
                <SelectItem value="all" className="rounded-lg py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="
                      bg-muted text-muted-foreground flex h-6 w-6 items-center
                      justify-center rounded-md
                    "
                    >
                      <IconLayoutDashboard className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium">
                      {t.academic.grades.filters.allTypes()}
                    </span>
                  </div>
                </SelectItem>
                {gradeTypes.map((gt) => {
                  const Icon = gradeTypeIcons[gt]
                  return (
                    <SelectItem
                      key={gt}
                      value={gt}
                      className="rounded-lg py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="
                          bg-primary/10 text-primary border-primary/20 flex h-6
                          w-6 items-center justify-center rounded-md border
                        "
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium">
                          {gradeTypeLabels[gt]}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
