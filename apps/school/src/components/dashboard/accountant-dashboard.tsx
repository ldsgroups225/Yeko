import { AlertCircle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

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

export function AccountantDashboard() {
  const { t } = useTranslation()

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.accountant.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.accountant.subtitle')}
        </p>
      </div>

      {/* Financial Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title={t('dashboard.accountant.monthlyRevenue')}
          value="2,450,000"
          currency="FCFA"
          icon={DollarSign}
          trend="positive"
        />
        <MetricCard
          title={t('dashboard.accountant.monthlyExpenses')}
          value="1,230,000"
          currency="FCFA"
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title={t('dashboard.accountant.balance')}
          value="1,220,000"
          currency="FCFA"
          icon={CheckCircle}
          trend="positive"
        />
        <MetricCard
          title={t('dashboard.accountant.unpaidFees')}
          value="450,000"
          currency="FCFA"
          icon={AlertCircle}
          trend="negative"
        />
      </motion.div>

      {/* Recent Transactions & Pending Payments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('dashboard.accountant.recentTransactions')}</h2>
          <div className="space-y-3">
            <TransactionItem
              type="income"
              description={`${t('dashboard.accountant.tuitionFees')} - Jean Kouadio`}
              amount="45,000"
              date={t('dashboard.accountant.today')}
              t={t}
            />
            <TransactionItem
              type="expense"
              description={t('dashboard.accountant.teacherSalaries')}
              amount="850,000"
              date={t('dashboard.accountant.yesterday')}
              t={t}
            />
            <TransactionItem
              type="income"
              description={`${t('dashboard.accountant.registrationFees')} - 15 students`}
              amount="225,000"
              date="2 days ago"
              t={t}
            />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('dashboard.accountant.overduePayments')}</h2>
          <div className="space-y-3">
            <PendingPaymentItem
              name="Marie Diallo"
              class="3ème A"
              amount="45,000"
              daysLate={15}
              t={t}
            />
            <PendingPaymentItem
              name="Kofi Mensah"
              class="2nde B"
              amount="45,000"
              daysLate={8}
              t={t}
            />
            <PendingPaymentItem
              name="Ama Asante"
              class="1ère C"
              amount="45,000"
              daysLate={3}
              t={t}
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
  currency: string
  icon: React.ComponentType<{ className?: string }>
  trend: 'positive' | 'negative' | 'neutral'
}

function MetricCard({ title, value, currency, icon: Icon, trend }: MetricCardProps) {
  const trendColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  }

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-lg border border-border/40 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{currency}</p>
      </div>
    </motion.div>
  )
}

interface TransactionItemProps {
  type: 'income' | 'expense'
  description: string
  amount: string
  date: string
  t: (key: string) => string
}

function TransactionItem({ type, description, amount, date }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{description}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <p
        className={`text-sm font-bold ${type === 'income'
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
        }`}
      >
        {type === 'income' ? '+' : '-'}
        {amount}
        {' '}
        FCFA
      </p>
    </div>
  )
}

interface PendingPaymentItemProps {
  name: string
  class: string
  amount: string
  daysLate: number
  t: (key: string) => string
}

function PendingPaymentItem({ name, class: className, amount, daysLate, t }: PendingPaymentItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{className}</p>
        <p className="text-xs text-red-600 dark:text-red-400">
          {t('dashboard.accountant.daysLate')}
          :
          {daysLate}
          {' '}
          {t('dashboard.accountant.daysAgo')}
        </p>
      </div>
      <p className="text-sm font-bold">
        {amount}
        {' '}
        FCFA
      </p>
    </div>
  )
}
