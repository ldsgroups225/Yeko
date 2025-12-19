import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { conductRecordsOptions } from '@/lib/queries/conduct-records'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/conducts/conduct/reports')({
  component: ConductReportsPage,
})

interface ConductRecordData {
  id: string
  studentId: string
  type: string
  category: string
  title: string
  severity?: string | null
  status: string
  incidentDate?: string | null
  createdAt: string
  student?: {
    user?: { name?: string | null }
  }
  class?: { name?: string | null }
}

function ConductReportsPage() {
  const { t } = useTranslation()
  const [classId, setClassId] = useState('')
  const [type, setType] = useState<'incident' | 'sanction' | 'reward' | 'note' | undefined>()
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d
  })
  const [endDate, setEndDate] = useState(() => new Date())

  // TODO: Get schoolYearId from context
  const schoolYearId = 'current-year'

  const startDateStr = startDate.toISOString().split('T')[0] ?? ''
  const endDateStr = endDate.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery(
    conductRecordsOptions({
      schoolYearId,
      classId: classId || undefined,
      type,
      startDate: startDateStr,
      endDate: endDateStr,
      pageSize: 100,
    }),
  )

  const rawRecords = (data as { data?: ConductRecordData[] })?.data ?? []

  // Calculate statistics
  const stats = {
    total: rawRecords.length,
    incidents: rawRecords.filter(r => r.type === 'incident').length,
    sanctions: rawRecords.filter(r => r.type === 'sanction').length,
    rewards: rawRecords.filter(r => r.type === 'reward').length,
    bySeverity: {
      low: rawRecords.filter(r => r.severity === 'low').length,
      medium: rawRecords.filter(r => r.severity === 'medium').length,
      high: rawRecords.filter(r => r.severity === 'high').length,
      critical: rawRecords.filter(r => r.severity === 'critical').length,
    },
    byCategory: rawRecords.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link to="/conducts/conduct">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('conduct.reports')}</h1>
        <p className="text-muted-foreground">{t('conduct.reportsDescription')}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t('conduct.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('conduct.allClasses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('conduct.allClasses')}</SelectItem>
                <SelectItem value="class-1">6ème A</SelectItem>
                <SelectItem value="class-2">6ème B</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type ?? ''} onValueChange={v => setType(v as typeof type || undefined)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('conduct.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('conduct.allTypes')}</SelectItem>
                <SelectItem value="incident">{t('conduct.type.incident')}</SelectItem>
                <SelectItem value="sanction">{t('conduct.type.sanction')}</SelectItem>
                <SelectItem value="reward">{t('conduct.type.reward')}</SelectItem>
              </SelectContent>
            </Select>

            <div>
              <DatePicker date={startDate} onSelect={d => d && setStartDate(d)} />
            </div>
            <div>
              <DatePicker date={endDate} onSelect={d => d && setEndDate(d)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading
        ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map(() => (
              <Skeleton key={`skeleton-${generateUUID()}`} className="h-24" />
            ))}
          </div>
        )
        : (
          <>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('conduct.totalRecords')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('conduct.type.incident')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.incidents}</div>
                  <Progress
                    value={stats.total > 0 ? (stats.incidents / stats.total) * 100 : 0}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('conduct.type.sanction')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{stats.sanctions}</div>
                  <Progress
                    value={stats.total > 0 ? (stats.sanctions / stats.total) * 100 : 0}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('conduct.type.reward')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.rewards}</div>
                  <Progress
                    value={stats.total > 0 ? (stats.rewards / stats.total) * 100 : 0}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('conduct.bySeverity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['low', 'medium', 'high', 'critical'] as const).map(severity => (
                      <div key={severity} className="flex items-center justify-between">
                        <ConductSeverityBadge severity={severity} />
                        <span className="font-medium">{stats.bySeverity[severity]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('conduct.byCategory')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{t(`conduct.category.${category}`)}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('conduct.recentRecords')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('conduct.date')}</TableHead>
                      <TableHead>{t('conduct.student')}</TableHead>
                      <TableHead>{t('conduct.type.label')}</TableHead>
                      <TableHead>{t('conduct.title')}</TableHead>
                      <TableHead>{t('conduct.severity.label')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawRecords.slice(0, 10).map(record => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.incidentDate
                            ? new Date(record.incidentDate).toLocaleDateString('fr-FR')
                            : new Date(record.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>{record.student?.user?.name ?? 'Unknown'}</TableCell>
                        <TableCell>
                          <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{record.title}</TableCell>
                        <TableCell>
                          {record.severity && (
                            <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical'} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
    </div>
  )
}
