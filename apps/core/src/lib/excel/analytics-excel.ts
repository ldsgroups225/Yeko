/**
 * Excel Export for Analytics Reports
 * Generates comprehensive analytics reports in Excel format
 */

export interface AnalyticsOverview {
  totalSchools: number
  schoolsGrowth: number
  activeUsers: number
  userGrowth: number
  engagementRate: number
  avgResponseTime: number
}

export interface SchoolsPerformance {
  byStatus: {
    active: number
    inactive: number
    suspended: number
  }
  topSchools: Array<{
    id: string
    name: string
    code: string
    status: string
    engagementScore: number
  }>
}

export interface PlatformUsage {
  dau: number
  wau: number
  mau: number
  featureUsage: Array<{
    name: string
    usage: number
  }>
}

interface OverviewRow {
  Métrique: string
  Valeur: string | number
  Croissance: string
}

interface SchoolStatusRow {
  Statut: string
  Nombre: number
}

interface TopSchoolRow {
  'Rang': number
  'Nom': string
  'Code': string
  'Statut': string
  'Engagement (%)': number
}

interface UsageRow {
  Métrique: string
  Valeur: number
}

interface FeatureUsageRow {
  'Fonctionnalité': string
  'Utilisation (%)': number
}

function formatTimeRange(range: string): string {
  const map: Record<string, string> = {
    '7d': '7 derniers jours',
    '30d': '30 derniers jours',
    '90d': '90 derniers jours',
    '1y': '1 an',
  }
  return map[range] || range
}

/**
 * Export analytics data to Excel
 */
export async function exportAnalyticsToExcel(
  overview: AnalyticsOverview,
  schoolsPerf: SchoolsPerformance,
  platformUsage: PlatformUsage,
  timeRange: string,
  filename?: string,
) {
  const [{ ExcelBuilder, ExcelSchemaBuilder }] = await Promise.all([
    import('@chronicstone/typed-xlsx'),
  ])

  const timestamp = new Date().toISOString().split('T')[0]
  const finalFilename = filename || `yeko-analytics-${timeRange}-${timestamp}.xlsx`

  // Sheet 1: Overview
  const overviewData: OverviewRow[] = [
    { Métrique: 'Total Écoles', Valeur: overview.totalSchools, Croissance: `${overview.schoolsGrowth}%` },
    { Métrique: 'Utilisateurs Actifs', Valeur: overview.activeUsers, Croissance: `${overview.userGrowth}%` },
    { Métrique: 'Taux d\'Engagement', Valeur: `${overview.engagementRate}%`, Croissance: '-' },
    { Métrique: 'Temps de Réponse Moyen', Valeur: `${overview.avgResponseTime}ms`, Croissance: '-' },
  ]

  const overviewSchema = ExcelSchemaBuilder.create<OverviewRow>()
    .column('metric', { key: 'Métrique' })
    .column('value', { key: 'Valeur' })
    .column('growth', { key: 'Croissance' })
    .build()

  // Sheet 2: Schools by Status
  const statusData: SchoolStatusRow[] = [
    { Statut: 'Actives', Nombre: schoolsPerf.byStatus.active },
    { Statut: 'Inactives', Nombre: schoolsPerf.byStatus.inactive },
    { Statut: 'Suspendues', Nombre: schoolsPerf.byStatus.suspended },
  ]

  const statusSchema = ExcelSchemaBuilder.create<SchoolStatusRow>()
    .column('status', { key: 'Statut' })
    .column('count', { key: 'Nombre' })
    .build()

  // Sheet 3: Top Schools
  const topSchoolsData: TopSchoolRow[] = schoolsPerf.topSchools.map((school, index) => ({
    'Rang': index + 1,
    'Nom': school.name,
    'Code': school.code,
    'Statut': school.status,
    'Engagement (%)': school.engagementScore,
  }))

  const topSchoolsSchema = ExcelSchemaBuilder.create<TopSchoolRow>()
    .column('rank', { key: 'Rang' })
    .column('name', { key: 'Nom' })
    .column('code', { key: 'Code' })
    .column('status', { key: 'Statut' })
    .column('engagement', { key: 'Engagement (%)' })
    .build()

  // Sheet 4: Platform Usage
  const usageData: UsageRow[] = [
    { Métrique: 'Utilisateurs Actifs Quotidiens (DAU)', Valeur: platformUsage.dau },
    { Métrique: 'Utilisateurs Actifs Hebdomadaires (WAU)', Valeur: platformUsage.wau },
    { Métrique: 'Utilisateurs Actifs Mensuels (MAU)', Valeur: platformUsage.mau },
  ]

  const usageSchema = ExcelSchemaBuilder.create<UsageRow>()
    .column('metric', { key: 'Métrique' })
    .column('value', { key: 'Valeur' })
    .build()

  // Sheet 5: Feature Usage
  const featureData: FeatureUsageRow[] = platformUsage.featureUsage.map(feature => ({
    'Fonctionnalité': feature.name,
    'Utilisation (%)': feature.usage,
  }))

  const featureSchema = ExcelSchemaBuilder.create<FeatureUsageRow>()
    .column('feature', { key: 'Fonctionnalité' })
    .column('usage', { key: 'Utilisation (%)' })
    .build()

  // Build Excel file with multiple sheets
  const excelFile = ExcelBuilder.create()
    .sheet(`Vue d'ensemble (${formatTimeRange(timeRange)})`)
    .addTable({ data: overviewData, schema: overviewSchema })
    .sheet('Écoles par Statut')
    .addTable({ data: statusData, schema: statusSchema })
    .sheet('Top Écoles')
    .addTable({ data: topSchoolsData, schema: topSchoolsSchema })
    .sheet('Utilisation Plateforme')
    .addTable({ data: usageData, schema: usageSchema })
    .sheet('Utilisation Fonctionnalités')
    .addTable({ data: featureData, schema: featureSchema })
    .build({ output: 'buffer' })

  // Create download link
  const uint8Array = new Uint8Array(excelFile)
  const blob = new Blob([uint8Array], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
