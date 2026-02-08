import { IconAlertCircle, IconBook, IconChartBar, IconChartPie, IconCurrencyDollar, IconSchool, IconTrendingUp, IconUsers } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslations } from '@/i18n'
import { dashboardOptions } from '@/lib/queries/dashboard'
import { formatCompact, formatCurrency, formatNumber } from '@/utils/formatNumber'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const chartMargin = { top: 10, right: 10, left: 0, bottom: 0 }

const tooltipContentStyle = {
  backgroundColor: 'var(--card)',
  borderColor: 'var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-lg)',
}

const tooltipItemStyle = { color: 'var(--foreground)' }

const barTooltipCursor = { fill: 'var(--muted)', opacity: 0.2 }

const MONTH_LABELS: Record<string, Record<string, string>> = {
  fr: {
    '01': 'Jan',
    '02': 'Fév',
    '03': 'Mar',
    '04': 'Avr',
    '05': 'Mai',
    '06': 'Juin',
    '07': 'Juil',
    '08': 'Août',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Déc',
  },
  en: {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
  },
}

function formatMonthLabel(yearMonth: string): string {
  const month = yearMonth.split('-')[1] ?? ''
  const labels = MONTH_LABELS.fr ?? {}
  return labels[month] ?? month
}

export function AdminDashboard() {
  const t = useTranslations()
  const { data, isPending } = useQuery(dashboardOptions.admin())

  if (isPending) {
    return <DashboardSkeleton />
  }

  const metrics = data?.metrics
  const charts = data?.charts

  const totalStudents = metrics?.totalStudents ?? 0
  const totalGender = charts?.genderDistribution?.reduce((sum, g) => sum + g.count, 0) ?? 0

  const revenueChartData = (charts?.revenueLast6Months ?? []).map(m => ({
    name: formatMonthLabel(m.month),
    value: m.revenue,
  }))

  const enrollmentChartData = (charts?.enrollmentByGrade ?? []).map(g => ({
    name: g.gradeName,
    value: g.count,
  }))

  const genderData = (charts?.genderDistribution ?? []).map(g => ({
    name: g.gender === 'M' ? t.students.male() : g.gender === 'F' ? t.students.female() : t.students.other(),
    value: g.count,
    color: g.gender === 'F' ? '#ec4899' : '#3b82f6',
  }))

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.nav.dashboard()}</h1>
        <p className="text-muted-foreground">
          {t.dashboard.description()}
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t.dashboard.totalStudents()}
          value={formatNumber(totalStudents)}
          change=""
          trend="neutral"
          icon={IconSchool}
        />
        <MetricCard
          title={t.dashboard.teachers()}
          value={formatNumber(metrics?.totalTeachers ?? 0)}
          change=""
          trend="neutral"
          icon={IconUsers}
        />
        <MetricCard
          title={t.dashboard.activeClasses()}
          value={formatNumber(metrics?.activeClasses ?? 0)}
          change=""
          trend="neutral"
          icon={IconBook}
        />
        <MetricCard
          title={t.dashboard.revenueThisMonth()}
          value={formatCurrency(metrics?.revenueThisMonth ?? 0)}
          change=""
          trend="neutral"
          icon={IconCurrencyDollar}
        />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5 text-primary" />
                {t.dashboard.overview()}
              </h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.revenueSubtitle()}</p>
            </div>
          </div>
          <RevenueChart data={revenueChartData} />
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconChartBar className="h-5 w-5 text-purple-500" />
                {t.dashboard.enrollmentChartTitle()}
              </h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.enrollmentChartSubtitle()}</p>
            </div>
          </div>
          <EnrollmentBarChart data={enrollmentChartData} />
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <IconChartPie className="h-5 w-5 text-pink-500" />
              {t.dashboard.genderChartTitle()}
            </h2>
            <p className="text-sm text-muted-foreground">{t.dashboard.genderChartSubtitle()}</p>
          </div>
          <GenderPieChart data={genderData} total={totalGender} />
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.quickActions()}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickActionButton icon={IconUsers} label={t.dashboard.addUser()} color="bg-blue-500/10 text-blue-600" />
            <QuickActionButton icon={IconSchool} label={t.dashboard.enrollStudent()} color="bg-green-500/10 text-green-600" />
            <QuickActionButton icon={IconBook} label={t.dashboard.createClass()} color="bg-orange-500/10 text-orange-600" />
            <QuickActionButton icon={IconCurrencyDollar} label={t.dashboard.recordPayment()} color="bg-purple-500/10 text-purple-600" />
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.recentActivity()}</h2>
          <div className="space-y-3">
            <ActivityItem
              title={t.dashboard.activity.teacherAdded()}
              description="Marie Kouassi - Mathématiques"
              time={t.common.timeAgo({ time: '2 heures' })}
            />
            <ActivityItem
              title={t.dashboard.activity.studentsEnrolled({ count: 15 })}
              description="Classe de 6ème A"
              time={t.common.timeAgo({ time: '5 heures' })}
            />
            <ActivityItem
              title={t.dashboard.activity.paymentReceived()}
              description="45,000 FCFA - Jean Kouadio"
              time={t.common.timeAgo({ time: '1 jour' })}
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.alerts()}</h2>
          <div className="space-y-3">
            {(metrics?.overdueAmount ?? 0) > 0 && (
              <AlertItem
                type="warning"
                title={t.dashboard.alertsSection.overduePayments()}
                description={`${formatCurrency(metrics?.overdueAmount ?? 0)} ${t.dashboard.alertsSection.overduePaymentsDesc({ count: 0 })}`}
              />
            )}
            <AlertItem
              type="info"
              title={t.dashboard.alertsSection.termEnd()}
              description={t.dashboard.alertsSection.termEndDesc({ days: 15 })}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => `metric-${i}`).map(key => (
          <Skeleton key={key} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="lg:col-span-2 h-[300px] rounded-xl" />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 transition-all group-hover:bg-primary/20 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={`text-xs ${trend === 'up'
              ? 'text-green-600 dark:text-green-400'
              : trend === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color?: string
}

function QuickActionButton({ icon: Icon, label, color = 'bg-primary/10 text-primary' }: QuickActionButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-4 text-sm font-medium shadow-sm transition-all hover:shadow-md"
    >
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-base font-semibold">{label}</span>
    </motion.button>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

interface AlertItemProps {
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
}

function AlertItem({ type, title, description }: AlertItemProps) {
  const colors = {
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="flex gap-3">
      <IconAlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${colors[type]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface RevenueChartProps {
  data: Array<{ name: string, value: number }>
}

function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={chartMargin}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => formatCompact(value)}
            dx={-10}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value: number | undefined) => [formatCurrency(Number(value ?? 0)), '']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface EnrollmentBarChartProps {
  data: Array<{ name: string, value: number }>
}

function EnrollmentBarChart({ data }: EnrollmentBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip
            cursor={barTooltipCursor}
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value: number | undefined) => [formatNumber(Number(value ?? 0)), '']}
          />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface GenderPieChartProps {
  data: Array<{ name: string, value: number, color: string }>
  total: number
}

function GenderPieChart({ data, total }: GenderPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value: number | undefined) => [formatNumber(Number(value ?? 0)), '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6">
        {data.map(entry => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">
              {entry.name}
              {' '}
              (
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}
              %)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
