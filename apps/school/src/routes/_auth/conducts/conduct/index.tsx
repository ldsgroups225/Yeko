import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { ConductRecordTable } from '@/components/conduct/conduct-record-table'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
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

interface ConductRecordData {
  id: string
  studentId: string
  type: string
  category: string
  title: string
  description: string
  severity?: string | null
  status: string
  incidentDate?: string | null
  location?: string | null
  createdAt: string
  student?: {
    user?: { name?: string | null, image?: string | null }
  }
}

function ConductPage() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(search.search ?? '')

  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const { data: schoolYears } = useQuery({ queryKey: ['school-years'], queryFn: () => getSchoolYears() })
  const activeSchoolYear = schoolYears?.find((sy: any) => sy.isActive)
  const schoolYearId = contextSchoolYearId || activeSchoolYear?.id || 'current-year'

  const { data, isLoading } = useQuery(
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

  const rawRecords = (data as { data?: ConductRecordData[] })?.data ?? []
  const records = rawRecords.map(record => ({
    id: record.id,
    studentId: record.studentId,
    studentName: record.student?.user?.name ?? 'Unknown',
    studentPhoto: record.student?.user?.image ?? undefined,
    type: record.type as 'incident' | 'sanction' | 'reward' | 'note',
    category: record.category,
    title: record.title,
    description: record.description,
    severity: record.severity as 'low' | 'medium' | 'high' | 'critical' | null,
    status: record.status as 'open' | 'investigating' | 'pending_decision' | 'resolved' | 'closed' | 'appealed',
    incidentDate: record.incidentDate ?? undefined,
    location: record.location ?? undefined,
    createdAt: record.createdAt,
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.schoolLife'), href: '/conducts' },
          { label: t('schoolLife.conduct') },
        ]}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('schoolLife.conduct')}</h1>
          <p className="text-muted-foreground">{t('conduct.description')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/conducts/conduct/reports">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t('conduct.reports')}
            </Button>
          </Link>
          <Link to="/conducts/conduct/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('conduct.newRecord')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('conduct.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-[250px]"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select value={search.type ?? 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('conduct.filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="incident">{t('conduct.type.incident')}</SelectItem>
            <SelectItem value="sanction">{t('conduct.type.sanction')}</SelectItem>
            <SelectItem value="reward">{t('conduct.type.reward')}</SelectItem>
            <SelectItem value="note">{t('conduct.type.note')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={search.status ?? 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('conduct.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="open">{t('conduct.status.open')}</SelectItem>
            <SelectItem value="investigating">{t('conduct.status.investigating')}</SelectItem>
            <SelectItem value="pending_decision">{t('conduct.status.pending_decision')}</SelectItem>
            <SelectItem value="resolved">{t('conduct.status.resolved')}</SelectItem>
            <SelectItem value="closed">{t('conduct.status.closed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ConductRecordTable
        records={records}
        isLoading={isLoading}
        onView={id => navigate({ to: `/conducts/conduct/${id}` })}
        onEdit={id => navigate({ to: `/conducts/conduct/${id}/edit` })}
      // onDelete is handled inside if we implement it, currently not in the list props but referenced
      />
    </div>
  )
}
