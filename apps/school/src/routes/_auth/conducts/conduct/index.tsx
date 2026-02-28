import { IconChartBar, IconInfoCircle, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react'
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
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { conductRecordsOptions } from '@/lib/queries/conduct-records'

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

  const { schoolYearId } = useSchoolYearContext()

  const { data: recordsData, isPending } = useQuery(
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
      <div className="flex justify-end gap-3">
        <Link to="/conducts/conduct/reports">
          <Button
            variant="outline"
            className="
              border-border/40
              hover:bg-muted/50
              h-12 rounded-2xl px-6 text-[10px] font-black tracking-widest
              uppercase transition-all
            "
          >
            <IconChartBar className="mr-2 h-4 w-4" />
            {t.conduct.reports()}
          </Button>
        </Link>
        <Link to="/conducts/conduct/new">
          <Button className="
            bg-primary shadow-primary/20 h-12 rounded-2xl px-8 text-[10px]
            font-black tracking-widest uppercase shadow-xl transition-all
            hover:scale-105
            active:scale-95
          "
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t.conduct.newRecord()}
          </Button>
        </Link>
      </div>

      {/* Filters & Bulk Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="
          border-border/40 bg-card/20 flex flex-col gap-4 rounded-3xl border p-6
          shadow-xl backdrop-blur-xl
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div className="
          flex flex-1 flex-col gap-4
          sm:flex-row
        "
        >
          <div className="flex-1 space-y-2">
            <label className="
              text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
              font-black tracking-widest uppercase
            "
            >
              <IconSearch className="size-3" />
              {t.conduct.searchPlaceholder()}
            </label>
            <div className="relative">
              <Input
                placeholder={t.conduct.searchPlaceholder()}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="
                  bg-background/50 border-border/40
                  focus:ring-primary/20
                  h-12 rounded-2xl pr-12 font-bold transition-all
                "
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    text-muted-foreground/40
                    hover:text-muted-foreground
                    absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-xl
                  "
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

          <div className="
            w-full space-y-2
            sm:w-[180px]
          "
          >
            <label className="
              text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
              font-black tracking-widest uppercase
            "
            >
              {t.conduct.filterByType()}
            </label>
            <Select value={search.type ?? 'all'} onValueChange={v => handleTypeChange(v ?? 'all')}>
              <SelectTrigger className="
                bg-background/50 border-border/40
                focus:ring-primary/20
                h-12 rounded-2xl font-bold transition-all
              "
              >
                <SelectValue placeholder={t.conduct.filterByType()}>
                  <span className="
                    text-[10px] font-bold tracking-widest uppercase
                  "
                  >
                    {search.type === 'incident' && t.conduct.type.incident()}
                    {search.type === 'sanction' && t.conduct.type.sanction()}
                    {search.type === 'reward' && t.conduct.type.reward()}
                    {search.type === 'note' && t.conduct.type.note()}
                    {!search.type && t.common.all()}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
              "
              >
                <SelectItem
                  value="all"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.common.all()}
                </SelectItem>
                <SelectItem
                  value="incident"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.type.incident()}
                </SelectItem>
                <SelectItem
                  value="sanction"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.type.sanction()}
                </SelectItem>
                <SelectItem
                  value="reward"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.type.reward()}
                </SelectItem>
                <SelectItem
                  value="note"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.type.note()}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="
            w-full space-y-2
            sm:w-[180px]
          "
          >
            <label className="
              text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
              font-black tracking-widest uppercase
            "
            >
              <IconInfoCircle className="size-3" />
              {t.conduct.filterByStatus()}
            </label>
            <Select value={search.status ?? 'all'} onValueChange={v => handleStatusChange(v ?? 'all')}>
              <SelectTrigger className="
                bg-background/50 border-border/40
                focus:ring-primary/20
                h-12 rounded-2xl font-bold transition-all
              "
              >
                <SelectValue placeholder={t.conduct.filterByStatus()}>
                  <span className="
                    text-[10px] font-bold tracking-widest uppercase
                  "
                  >
                    {search.status === 'open' && t.conduct.status.open()}
                    {search.status === 'investigating' && t.conduct.status.investigating()}
                    {search.status === 'pending_decision' && t.conduct.status.pending_decision()}
                    {search.status === 'resolved' && t.conduct.status.resolved()}
                    {search.status === 'closed' && t.conduct.status.closed()}
                    {search.status === 'appealed' && t.conduct.status.appealed()}
                    {!search.status && t.common.all()}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
              "
              >
                <SelectItem
                  value="all"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.common.all()}
                </SelectItem>
                <SelectItem
                  value="open"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.open()}
                </SelectItem>
                <SelectItem
                  value="investigating"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.investigating()}
                </SelectItem>
                <SelectItem
                  value="pending_decision"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.pending_decision()}
                </SelectItem>
                <SelectItem
                  value="resolved"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.resolved()}
                </SelectItem>
                <SelectItem
                  value="closed"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.closed()}
                </SelectItem>
                <SelectItem
                  value="appealed"
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.status.appealed()}
                </SelectItem>
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
                className="
                  mt-6 flex items-center gap-2
                  sm:mt-0
                "
              >
                <Badge
                  variant="secondary"
                  className="
                    bg-primary/10 text-primary border-primary/20 h-12 rounded-xl
                    border px-4 font-bold shadow-none
                  "
                >
                  {selectedIds.size}
                  {' '}
                  {t.common.selected()}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="
                    border-destructive/30 text-destructive
                    hover:bg-destructive hover:text-destructive-foreground
                    h-12 rounded-xl text-[10px] font-bold tracking-widest
                    uppercase shadow-sm transition-all
                  "
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
          isPending={isPending}
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
