import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpenCheck, Calendar, Filter, GraduationCap, LayoutGrid, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ReportCardList } from '@/components/report-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { getTerms } from '@/school/functions/terms'

export const Route = createFileRoute('/_auth/grades/report-cards')({
  component: ReportCardsPage,
})

function ReportCardsPage() {
  const t = useTranslations()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [localYearId, setLocalYearId] = useState<string>('')
  const [search, setSearch] = useState('')

  // Fetch school years
  const { data: schoolYears, isLoading: yearsLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    staleTime: 5 * 60 * 1000,
  })

  // Determine effective year ID
  const activeYear = schoolYears?.find((y: { isActive: boolean }) => y.isActive)
  const effectiveYearId = contextSchoolYearId || localYearId || activeYear?.id || ''

  // Fetch terms for selected year
  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms', effectiveYearId],
    queryFn: () => getTerms({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch classes for selected year
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', effectiveYearId],
    queryFn: () => getClasses({ data: { schoolYearId: effectiveYearId } }),
    enabled: !!effectiveYearId,
    staleTime: 5 * 60 * 1000,
  })

  const canShowReportCards = effectiveYearId && selectedTermId && selectedClassId

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: t.nav.grades(), href: '/grades' },
          { label: t.reportCards.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
            <BookOpenCheck className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t.reportCards.title()}</h1>
            <p className="text-muted-foreground font-medium italic">{t.reportCards.description()}</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/40 bg-card/30 p-6 backdrop-blur-xl shadow-xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* School Year */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.settings.schoolYears.title()}
            </Label>
            {yearsLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={effectiveYearId}
                    onValueChange={val => setLocalYearId(val)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder={t.schoolYear.select()} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id} className="rounded-lg font-semibold">
                          {year.template.name}
                          {year.isActive && ` (${t.schoolYear.activeSuffix()})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Term */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.academic.grades.entry.term()}
            </Label>
            {termsLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedTermId}
                    onValueChange={setSelectedTermId}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <SelectValue placeholder={t.terms.select()} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {terms?.map(term => (
                        <SelectItem key={term.id} value={term.id} className="rounded-lg font-semibold">
                          {term.template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>

          {/* Class */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.academic.grades.entry.class()}
            </Label>
            {classesLoading
              ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                )
              : (
                  <Select
                    value={selectedClassId}
                    onValueChange={setSelectedClassId}
                    disabled={!effectiveYearId}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="size-3.5 text-muted-foreground" />
                        <SelectValue placeholder={t.classes.select()} />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                      {classes?.map(item => (
                        <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg font-semibold">
                          {item.grade.name}
                          {' '}
                          {item.class.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
          </div>
        </div>

        {canShowReportCards && (
          <div className="pt-4 border-t border-border/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder={t.students.searchPlaceholder()}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 border-border/40 bg-background/40 pl-9 transition-all focus:bg-background shadow-none rounded-xl"
              />
            </div>
            <Button variant="outline" className="h-11 px-6 border-border/40 bg-background/40 hover:bg-background rounded-xl font-bold uppercase tracking-widest text-[10px]">
              <Filter className="mr-2 h-4 w-4" />
              {t.common.filters()}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Report Cards List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {canShowReportCards
          ? (
              <ReportCardList
                reportCards={[]}
                isLoading={false}
              />
            )
          : (
              <Card className="rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-6 rounded-full bg-background/50 mb-6 shadow-inner">
                    <GraduationCap className="size-16 text-muted-foreground/20" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground mb-2">{t.reportCards.selectFiltersPrompt()}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{t.academic.grades.statistics.description()}</p>
                </CardContent>
              </Card>
            )}
      </motion.div>
    </div>
  )
}
