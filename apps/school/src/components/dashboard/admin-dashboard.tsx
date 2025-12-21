import {
  AlertCircle,
  BarChart3,
  BookOpen,
  DollarSign,
  GraduationCap,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
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
import { generateUUID } from '@/utils/generateUUID'

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

export function AdminDashboard() {
  const t = useTranslations()
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

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t.dashboard.totalStudents()}
          value="1,234"
          change="+12%"
          trend="up"
          icon={GraduationCap}
        />
        <MetricCard
          title={t.dashboard.teachers()}
          value="89"
          change="+3"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title={t.dashboard.activeClasses()}
          value="42"
          change="0"
          trend="neutral"
          icon={BookOpen}
        />
        <MetricCard
          title={t.dashboard.revenueThisMonth()}
          value="245,000 FCFA"
          change="+8%"
          trend="up"
          icon={DollarSign}
        />
      </motion.div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart (Area) */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.dashboard.overview()}
              </h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.revenueSubtitle()}</p>
            </div>
          </div>
          <RevenueChart />
        </motion.div>

        {/* New: Attendance/Enrollment Chart (Bar) */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                {t.dashboard.enrollmentChartTitle()}
              </h2>
              <p className="text-sm text-muted-foreground">{t.dashboard.enrollmentChartSubtitle()}</p>
            </div>
          </div>
          <EnrollmentBarChart />
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* New: Gender Distribution (Pie) */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-pink-500" />
              {t.dashboard.genderChartTitle()}
            </h2>
            <p className="text-sm text-muted-foreground">{t.dashboard.genderChartSubtitle()}</p>
          </div>
          <GenderPieChart />
        </motion.div>

        {/* Existing: Quick Actions (Spanning 2 columns) */}
        <motion.div variants={item} className="lg:col-span-2 rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.quickActions()}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickActionButton icon={Users} label={t.dashboard.addUser()} color="bg-blue-500/10 text-blue-600" />
            <QuickActionButton icon={GraduationCap} label={t.dashboard.enrollStudent()} color="bg-green-500/10 text-green-600" />
            <QuickActionButton icon={BookOpen} label={t.dashboard.createClass()} color="bg-orange-500/10 text-orange-600" />
            <QuickActionButton icon={DollarSign} label={t.dashboard.recordPayment()} color="bg-purple-500/10 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Alerts */}
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
            <AlertItem
              type="warning"
              title={t.dashboard.alertsSection.overduePayments()}
              description={t.dashboard.alertsSection.overduePaymentsDesc({ count: 23 })}
            />
            <AlertItem
              type="info"
              title={t.dashboard.alertsSection.termEnd()}
              description={t.dashboard.alertsSection.termEndDesc({ days: 15 })}
            />
            <AlertItem
              type="warning"
              title={t.dashboard.alertsSection.classCapacity()}
              description={t.dashboard.alertsSection.classCapacityDesc({ count: 3 })}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
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
      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${colors[type]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function RevenueChart() {
  const chartData = [
    { name: 'Jan', value: 150 },
    { name: 'Fév', value: 230 },
    { name: 'Mar', value: 180 },
    { name: 'Avr', value: 290 },
    { name: 'Mai', value: 320 },
    { name: 'Juin', value: 380 },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tickFormatter={value => `${value}k`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}
            itemStyle={{ color: 'var(--foreground)' }}
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

function EnrollmentBarChart() {
  const enrollmentData = [
    { name: '6ème', value: 120 },
    { name: '5ème', value: 98 },
    { name: '4ème', value: 86 },
    { name: '3ème', value: 75 },
    { name: '2nde', value: 65 },
    { name: '1ère', value: 55 },
    { name: 'Tle', value: 45 },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function GenderPieChart() {
  const t = useTranslations()

  const genderData = [
    { name: t.students.female(), value: 540, color: '#ec4899' }, // Pink-500
    { name: t.students.male(), value: 694, color: '#3b82f6' }, // Blue-500
  ]

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {genderData.map(entry => (
              <Cell key={`cell-${generateUUID()}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6">
        {genderData.map(entry => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">
              {entry.name}
              {' '}
              (
              {Math.round((entry.value / 1234) * 100)}
              %)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
