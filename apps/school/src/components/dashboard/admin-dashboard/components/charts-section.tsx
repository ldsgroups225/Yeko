import { formatCompact, formatCurrency, formatNumber } from '@repo/data-ops'
import { IconChartBar, IconChartPie, IconTrendingUp } from '@tabler/icons-react'
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
import {
  barTooltipCursor,
  chartMargin,
  item,
  tooltipContentStyle,
  tooltipItemStyle,
} from '../constants'

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

interface ChartsSectionProps {
  revenueData: any[]
  enrollmentData: any[]
  genderData: any[]
  totalGender: number
  t: any
}

export function ChartsSection({ revenueData, enrollmentData, genderData, totalGender, t }: ChartsSectionProps) {
  return (
    <>
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
          <RevenueChart data={revenueData} />
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconChartBar className="h-5 w-5 text-secondary" />
                {t.dashboard.enrollmentChartTitle()}
              </h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.enrollmentChartSubtitle()}</p>
            </div>
          </div>
          <EnrollmentBarChart data={enrollmentData} />
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
      </div>
    </>
  )
}
