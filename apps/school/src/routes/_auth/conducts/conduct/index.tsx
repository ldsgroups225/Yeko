import { IconChartBar, IconInfoCircle, IconPlus, IconSearch, IconSparkles, IconTrash, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { AnimatePresence, motion } from 'motion/react'

import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConductRecordTable } from '@/components/conduct/conduct-record-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { conductRecordsOptions } from '@/lib/queries/conduct-records'
import { getSchoolYears } from '@/school/functions/school-years'

const searchSchema = z.object({
  type: z.enum(['incident', 'sanction', 'reward', 'note']).optional(),
  status: z.enum(['open', 'investigating', 'pending_decision', 'resolved', 'closed', 'appealed']).optional(),
  search: z.string().optional(),
  page: z.number().default(1),
})

export const Route = createFileRoute('/_auth/conducts/conduct/')({
  validateSearch: searchSchema,
  component: ConductPage,
})

function ConductPage() {
  const t = useTranslations()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(search.search ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const { data: schoolYearsResult } = useQuery({ queryKey: ['school-years'], queryFn: () => getSchoolYears() })
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []
  const activeSchoolYear = schoolYears.find(sy => sy.isActive)
  const schoolYearId = contextSchoolYearId || activeSchoolYear?.id || 'current-year'

  const { data: recordsData, isLoading } = useQuery(
    conductRecordsOptions({
      schoolYearId,
      type: search.type,
      status: search.status,
      search: search.search,
      page: search.page,
    }),
  )

  const handleSearch = () => {
    navigate({
      search: { ...search, search: searchTerm || undefined, page: 1 },
    })
  }

  const handleTypeChange = (type: string) => {
    navigate({
      search: {
        ...search,
        type: type === 'all' ? undefined : type as typeof search.type,
        page: 1,
      },
    })
  }

  const handleStatusChange = (status: string) => {
    navigate({
      search: {
        ...search,
        status: status === 'all' ? undefined : status as typeof search.status,
        page: 1,
      },
    })
  }

  const handleBulkDelete = () => {
    // Placeholder for bulk delete
    toast.info('Bulk delete not implemented yet')
    setSelectedIds(new Set())
  }

  const rawRecords = recordsData?.data ?? []
  const records = rawRecords.map(record => ({
    id: record.id,
    studentId: record.studentId,
    studentName: record.studentName ?? 'Unknown',
    studentPhoto: record.studentMatricule ?? undefined,
    type: record.type as 'incident' | 'sanction' | 'reward' | 'note',
    category: record.category,
    title: record.title,
    description: record.description,
    severity: record.severity as 'low' | 'medium' | 'high' | 'critical' | null,
    status: record.status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed',
    incidentDate: record.incidentDate ?? undefined,
    location: record.location ?? undefined,
    createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
  }))

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.conduct() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconInfoCircle className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.schoolLife.conduct()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.conduct.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/conducts/conduct/reports">
            <Button variant="outline" className="h-12 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 px-6 transition-all">
              <IconChartBar className="mr-2 h-4 w-4" />
              {t.conduct.reports()}
            </Button>
          </Link>
          <Link to="/conducts/conduct/new">
            <Button className="h-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] px-8 transition-all hover:scale-105 active:scale-95">
              <IconPlus className="mr-2 h-4 w-4" />
              {t.conduct.newRecord()}
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Filters & Bulk Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-card/20 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between shadow-xl"
      >
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
              <IconSearch className="size-3" />
              {t.conduct.searchPlaceholder()}
            </label>
            <div className="relative">
              <Input
                placeholder={t.conduct.searchPlaceholder()}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold pr-12"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/40 hover:text-muted-foreground rounded-xl"
                  onClick={() => {
                    setSearchTerm('')
                    handleSearch()
                  }}
                >
                  <IconX className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 w-full sm:w-[180px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
              <IconSparkles className="size-3" />
              {t.conduct.filterByType()}
            </label>
            <Select value={search.type ?? 'all'} onValueChange={v => handleTypeChange(v ?? 'all')}>
              <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                <SelectValue placeholder={t.conduct.filterByType()} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
                <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.common.all()}</SelectItem>
                <SelectItem value="incident" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.incident()}</SelectItem>
                <SelectItem value="sanction" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.sanction()}</SelectItem>
                <SelectItem value="reward" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.reward()}</SelectItem>
                <SelectItem value="note" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.note()}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full sm:w-[180px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
              <IconInfoCircle className="size-3" />
              {t.conduct.filterByStatus()}
            </label>
            <Select value={search.status ?? 'all'} onValueChange={v => handleStatusChange(v ?? 'all')}>
              <SelectTrigger className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                <SelectValue placeholder={t.conduct.filterByStatus()} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
                <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.common.all()}</SelectItem>
                <SelectItem value="open" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.status.open()}</SelectItem>
                <SelectItem value="investigating" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.status.investigating()}</SelectItem>
                <SelectItem value="pending_decision" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.status.pending_decision()}</SelectItem>
                <SelectItem value="resolved" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.status.resolved()}</SelectItem>
                <SelectItem value="closed" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.status.closed()}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 mt-6 sm:mt-0"
              >
                <Badge variant="secondary" className="h-12 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-none font-bold">
                  {selectedIds.size}
                  {' '}
                  {t.common.selected()}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                >
                  <IconTrash className="mr-1.5 size-4" />
                  {t.common.delete()}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ConductRecordTable
          records={records}
          isLoading={isLoading}
          onView={id => navigate({ to: `/conducts/conduct/${id}` })}
          onEdit={id => navigate({ to: `/conducts/conduct/${id}/edit` })}
          selection={{
            selectedIds,
            onSelectionChange: setSelectedIds,
          }}
        />
      </motion.div>
    </div>
  )
}
