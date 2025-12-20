import { CheckCircle, FileText, UserPlus, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

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

export function RegistrarDashboard() {
  const t = useTranslations()

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.registrar.title()}</h1>
        <p className="text-muted-foreground">
          {t.dashboard.registrar.subtitle()}
        </p>
      </div>

      {/* Registration Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t.dashboard.registrar.totalStudents()}
          value="1,234"
          subtitle={t.dashboard.registrar.active()}
          icon={Users}
        />
        <MetricCard
          title={t.dashboard.registrar.newEnrollments()}
          value="45"
          subtitle={t.common.pending()}
          icon={UserPlus}
        />
        <MetricCard
          title={t.dashboard.registrar.incompleteFiles()}
          value="12"
          subtitle={t.common.pending()}
          icon={FileText}
        />
        <MetricCard
          title={t.dashboard.registrar.enrollmentsValidated()}
          value="33"
          subtitle={t.common.pending()}
          icon={CheckCircle}
        />
      </motion.div>

      {/* Pending Enrollments */}
      <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t.dashboard.registrar.pendingEnrollments()}</h2>
        <div className="space-y-3">
          <EnrollmentItem
            name="Ibrahim Traoré"
            class="6ème A"
            date="2 hours ago"
            status="pending"
            missingDocs={['Birth Certificate', 'Photo']}
          />
          <EnrollmentItem
            name="Aisha Bamba"
            class="5ème B"
            date="5 hours ago"
            status="review"
            missingDocs={[]}
          />
          <EnrollmentItem
            name="Yao Kouassi"
            class="4ème C"
            date="1 day ago"
            status="pending"
            missingDocs={['Previous Report']}
          />
        </div>
      </motion.div>

      {/* Recent Activity & Statistics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.registrar.recentActivity()}</h2>
          <div className="space-y-3">
            <ActivityItem
              action="Inscription validée"
              name="Fatou Sow"
              class="3ème A"
              time="Il y a 1 heure"
            />
            <ActivityItem
              action="Dossier complété"
              name="Kwame Nkrumah"
              class="2nde B"
              time="Il y a 3 heures"
            />
            <ActivityItem
              action="Parent ajouté"
              name="Ama Asante"
              class="1ère C"
              time="Il y a 5 heures"
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t.dashboard.registrar.distributionByLevel()}</h2>
          <div className="space-y-4">
            <LevelBar level="6ème" count={245} total={1234} />
            <LevelBar level="5ème" count={218} total={1234} />
            <LevelBar level="4ème" count={203} total={1234} />
            <LevelBar level="3ème" count={189} total={1234} />
            <LevelBar level="2nde" count={156} total={1234} />
            <LevelBar level="1ère" count={134} total={1234} />
            <LevelBar level="Tle" count={89} total={1234} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-lg border border-border/40 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </motion.div>
  )
}

interface EnrollmentItemProps {
  name: string
  class: string
  date: string
  status: 'pending' | 'review'
  missingDocs: string[]
}

function EnrollmentItem({ name, class: className, date, status, missingDocs }: EnrollmentItemProps) {
  const t = useTranslations()

  return (
    <div className="rounded-md border border-border/40 bg-background p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{className}</p>
          <p className="text-xs text-muted-foreground">{date}</p>
          {missingDocs.length > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {t.dashboard.registrar.missing()}
              :
              {' '}
              {missingDocs.join(', ')}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${status === 'review'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}
        >
          {status === 'review' ? t.dashboard.registrar.toReview() : t.common.pending()}
        </span>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  action: string
  name: string
  class: string
  time: string
}

function ActivityItem({ action, name, class: className, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{action}</p>
        <p className="text-xs text-muted-foreground">
          {name}
          {' '}
          •
          {className}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

interface LevelBarProps {
  level: string
  count: number
  total: number
}

function LevelBar({ level, count, total }: LevelBarProps) {
  const t = useTranslations()
  const percentage = (count / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{level}</span>
        <span className="text-muted-foreground">
          {count}
          {' '}
          {t.dashboard.registrar.students()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
