import { IconCalendar, IconLayoutGrid, IconSettings } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useState } from 'react'
import { ClassAveragesTable, GradeStatisticsCard } from '@/components/grades'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { gradesOptions } from '@/lib/queries/grades'
import { termsOptions } from '@/lib/queries/terms'

export const Route = createFileRoute('/_auth/grades/statistics')({
  component: GradeStatisticsPage,
})

function GradeStatisticsPage() {
  const t = useTranslations()
  const { schoolYearId, isPending: contextPending } = useSchoolYearContext()
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')

  const { data: classesData = [], isPending: classesPending } = useQuery(
    classesOptions.list({ schoolYearId: schoolYearId ?? undefined, status: 'active' }),
  )

  const { data: termsData = [], isPending: termsPending } = useQuery(
    termsOptions.list(schoolYearId ?? ''),
  )

  const canFetchStats = selectedClassId && selectedTermId
  const { data: statisticsData = [], isPending: statsPending } = useQuery({
    ...gradesOptions.statistics({
      classId: selectedClassId,
      termId: selectedTermId,
    }),
    enabled: !!canFetchStats,
  })

  // Transform statistics for display
  const statistics = statisticsData?.[0] ?? {
    count: 0,
    average: 0,
    min: 0,
    max: 0,
    below10: 0,
    above15: 0,
  }

  return (
    <div className="space-y-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl">
          <CardHeader className="bg-muted/20 border-b border-border/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background/50 text-muted-foreground shadow-sm">
                <IconSettings className="size-4" />
              </div>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">{t.academic.grades.filters.title()}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="class-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.class()}
                </Label>
                {classesPending || contextPending
                  ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    )
                  : (
                      <Select value={selectedClassId} onValueChange={val => setSelectedClassId(val ?? '')}>
                        <SelectTrigger id="class-select" className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                          <SelectValue placeholder={t.academic.grades.entry.selectClass()}>
                            {selectedClassId
                              ? (() => {
                                  const selectedItem = classesData?.find(item => item.class.id === selectedClassId)
                                  return selectedItem
                                    ? (
                                        <div className="flex items-center gap-2">
                                          <IconLayoutGrid className="size-3.5 text-primary/60" />
                                          <span className="font-semibold">
                                            {selectedItem.grade.name}
                                            {' '}
                                            {selectedItem.class.section}
                                          </span>
                                        </div>
                                      )
                                    : null
                                })()
                              : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                          {classesData?.map(item => (
                            <SelectItem key={item.class.id} value={item.class.id} className="rounded-lg font-semibold">
                              <div className="flex items-center gap-2">
                                <IconLayoutGrid className="size-3.5 text-primary/60" />
                                {item.grade.name}
                                {' '}
                                {item.class.section}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="term-select" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.academic.grades.entry.term()}
                </Label>
                {termsPending || contextPending
                  ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    )
                  : (
                      <Select value={selectedTermId} onValueChange={val => setSelectedTermId(val ?? '')}>
                        <SelectTrigger id="term-select" className="h-11 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all">
                          <SelectValue placeholder={t.academic.grades.entry.selectTerm()}>
                            {selectedTermId
                              ? (() => {
                                  const selectedItem = termsData?.find(term => term.id === selectedTermId)
                                  return selectedItem
                                    ? (
                                        <div className="flex items-center gap-2">
                                          <IconCalendar className="size-3.5 text-primary/60" />
                                          <span className="font-semibold">{selectedItem.template.name}</span>
                                        </div>
                                      )
                                    : null
                                })()
                              : null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl backdrop-blur-2xl bg-popover/90 border-border/40">
                          {termsData?.map(term => (
                            <SelectItem key={term.id} value={term.id} className="rounded-lg font-semibold">
                              {term.template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {canFetchStats && (
        <div className="space-y-8">
          {statsPending
            ? (
                <div className="grid gap-6 md:grid-cols-3">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              )
            : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <GradeStatisticsCard statistics={statistics} />
                </motion.div>
              )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ClassAveragesTable averages={[]} />
          </motion.div>
        </div>
      )}
    </div>
  )
}
