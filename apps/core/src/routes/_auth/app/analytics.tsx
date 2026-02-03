import {
  IconChartBar,
  IconChartPie,
  IconDownload,
  IconFileText,
  IconMapPin,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AnalyticsErrorBoundary } from '@/components/error-boundary'
import { useI18nContext } from '@/i18n/i18n-react'
import {
  analyticsOverviewQueryOptions,
  platformUsageQueryOptions,
  schoolsPerformanceQueryOptions,
} from '@/integrations/tanstack-query/analytics-options'
import { exportAnalyticsToExcel } from '@/lib/excel/analytics-excel'
import { useLogger } from '@/lib/logger'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/analytics')({
  component: () => (
    <AnalyticsErrorBoundary>
      <AnalyticsPage />
    </AnalyticsErrorBoundary>
  ),
})

function AnalyticsPage() {
  const { logger } = useLogger()
  const { LL } = useI18nContext()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery(
    analyticsOverviewQueryOptions(timeRange),
  )
  const { data: schoolsPerf, isLoading: schoolsPerfLoading } = useQuery(
    schoolsPerformanceQueryOptions(timeRange),
  )
  const { data: platformUsage, isLoading: usageLoading } = useQuery(
    platformUsageQueryOptions(timeRange),
  )

  useEffect(() => {
    logger.info('Analytics page viewed', {
      page: 'analytics',
      timeRange,
      activeTab,
    })
  }, [logger, timeRange, activeTab])

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      if (format === 'excel') {
        if (!overview || !schoolsPerf || !platformUsage) {
          toast.error(LL.analytics.export.noData())
          return
        }
        toast.info(LL.analytics.export.generating())
        exportAnalyticsToExcel(overview, schoolsPerf, platformUsage, timeRange)
        toast.success(LL.analytics.export.excelSuccess())
        logger.info('Report exported', { format, timeRange })
      }
      else {
        // PDF export not yet implemented
        toast.info(LL.analytics.export.pdfComingSoon())
        logger.info('PDF export requested but not implemented', { timeRange })
      }
    }
    catch (error) {
      toast.error(LL.analytics.export.error())
      logger.error('Report export failed', error instanceof Error ? error : new Error(String(error)))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{LL.analytics.title()}</h1>
          <p className="text-muted-foreground">
            {LL.analytics.subtitle()}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={v => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={LL.analytics.period()}>
                {timeRange === '7d' && LL.analytics.periods['7d']()}
                {timeRange === '30d' && LL.analytics.periods['30d']()}
                {timeRange === '90d' && LL.analytics.periods['90d']()}
                {timeRange === '1y' && LL.analytics.periods['1y']()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{LL.analytics.periods['7d']()}</SelectItem>
              <SelectItem value="30d">{LL.analytics.periods['30d']()}</SelectItem>
              <SelectItem value="90d">{LL.analytics.periods['90d']()}</SelectItem>
              <SelectItem value="1y">{LL.analytics.periods['1y']()}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportReport('excel')}>
            <IconDownload className="h-4 w-4 mr-2" />
            {LL.analytics.export.excel()}
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('pdf')}>
            <IconFileText className="h-4 w-4 mr-2" />
            {LL.analytics.export.pdf()}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{LL.analytics.tabs.overview()}</TabsTrigger>
          <TabsTrigger value="schools">{LL.analytics.tabs.schools()}</TabsTrigger>
          <TabsTrigger value="usage">{LL.analytics.tabs.usage()}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {overviewLoading
              ? (
                  Array.from({ length: 4 }).map(() => (
                    <Card key={generateUUID()}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                )
              : (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{LL.analytics.metrics.totalSchools()}</CardTitle>
                        <IconChartBar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview?.totalSchools || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          +
                          {overview?.schoolsGrowth || 0}
                          %
                          {' '}
                          {LL.analytics.metrics.growth()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{LL.analytics.metrics.activeUsers()}</CardTitle>
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview?.activeUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview?.userGrowth || 0}
                          %
                          {' '}
                          {LL.analytics.metrics.growthLabel()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{LL.analytics.metrics.engagementRate()}</CardTitle>
                        <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overview?.engagementRate || 0}
                          %
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {LL.analytics.metrics.dailyActive()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{LL.analytics.metrics.responseTime()}</CardTitle>
                        <IconChartPie className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {overview?.avgResponseTime || 0}
                          ms
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {LL.analytics.metrics.avgResponse()}
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
          </div>

          {/* Charts Placeholder */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.charts.enrollmentTrend()}</CardTitle>
                <CardDescription>{LL.analytics.charts.enrollmentTrendDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <IconChartBar className="h-12 w-12 mx-auto mb-2" />
                    <p>{LL.analytics.charts.comingSoon()}</p>
                    <p className="text-xs">{LL.analytics.charts.integrationInProgress()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.charts.statusDistribution()}</CardTitle>
                <CardDescription>{LL.analytics.charts.statusDistributionDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <IconChartPie className="h-12 w-12 mx-auto mb-2" />
                    <p>{LL.analytics.charts.comingSoon()}</p>
                    <p className="text-xs">{LL.analytics.charts.integrationInProgress()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schools Performance Tab */}
        <TabsContent value="schools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Schools by Status */}
            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.schools.byStatus()}</CardTitle>
                <CardDescription>{LL.analytics.schools.byStatusDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                {schoolsPerfLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map(() => (
                          <Skeleton key={generateUUID()} className="h-12 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{LL.analytics.schools.active()}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.active || 0}
                              {' '}
                              {LL.analytics.schools.schoolsCount()}
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.active || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{LL.analytics.schools.inactive()}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.inactive || 0}
                              {' '}
                              {LL.analytics.schools.schoolsCount()}
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.inactive || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{LL.analytics.schools.suspended()}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {schoolsPerf?.byStatus.suspended || 0}
                              {' '}
                              {LL.analytics.schools.schoolsCount()}
                            </span>
                          </div>
                          <span className="text-2xl font-bold">{schoolsPerf?.byStatus.suspended || 0}</span>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.schools.geographic()}</CardTitle>
                <CardDescription>{LL.analytics.schools.geographicDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <IconMapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>{LL.analytics.schools.mapComingSoon()}</p>
                    <p className="text-xs">{LL.analytics.schools.mapIntegration()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Schools */}
          <Card>
            <CardHeader>
              <CardTitle>{LL.analytics.schools.topPerforming()}</CardTitle>
              <CardDescription>{LL.analytics.schools.topPerformingDesc()}</CardDescription>
            </CardHeader>
            <CardContent>
              {schoolsPerfLoading
                ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map(() => (
                        <Skeleton key={generateUUID()} className="h-16 w-full" />
                      ))}
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      {schoolsPerf?.topSchools.map((school: { id: string, name: string, code: string, status: string, engagementScore: number }, index: number) => (
                        <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <span className="text-lg font-bold text-primary">
                                #
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{school.name}</p>
                              <p className="text-sm text-muted-foreground">{school.code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {school.engagementScore}
                              %
                              {' '}
                              {LL.analytics.schools.engagement()}
                            </p>
                            <Badge variant="outline">{school.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Daily Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.usage.activeUsers()}</CardTitle>
                <CardDescription>{LL.analytics.usage.activeUsersDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map(() => (
                          <Skeleton key={generateUUID()} className="h-12 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{LL.analytics.usage.dau()}</span>
                          <span className="text-2xl font-bold">{platformUsage?.dau || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{LL.analytics.usage.wau()}</span>
                          <span className="text-2xl font-bold">{platformUsage?.wau || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{LL.analytics.usage.mau()}</span>
                          <span className="text-2xl font-bold">{platformUsage?.mau || 0}</span>
                        </div>
                      </div>
                    )}
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>{LL.analytics.usage.featureUsage()}</CardTitle>
                <CardDescription>{LL.analytics.usage.featureUsageDesc()}</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading
                  ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map(() => (
                          <Skeleton key={generateUUID()} className="h-8 w-full" />
                        ))}
                      </div>
                    )
                  : (
                      <div className="space-y-3">
                        {platformUsage?.featureUsage.map((feature: { name: string, usage: number }) => (
                          <div key={feature.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{feature.name}</span>
                              <span className="font-medium">
                                {feature.usage}
                                %
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${feature.usage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
              </CardContent>
            </Card>
          </div>

          {/* API Usage */}
          <Card>
            <CardHeader>
              <CardTitle>{LL.analytics.usage.apiUsage()}</CardTitle>
              <CardDescription>{LL.analytics.usage.apiUsageDesc()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <IconChartBar className="h-12 w-12 mx-auto mb-2" />
                  <p>{LL.analytics.charts.comingSoon()}</p>
                  <p className="text-xs">{LL.analytics.charts.integrationInProgress()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
