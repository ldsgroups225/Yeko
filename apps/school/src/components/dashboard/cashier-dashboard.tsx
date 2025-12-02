import { CheckCircle, Clock, CreditCard, DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CashierDashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.cashier.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.cashier.subtitle')}
        </p>
      </div>

      {/* Daily Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('dashboard.cashier.dailyCollections')}
          value="180,000"
          currency="FCFA"
          icon={DollarSign}
        />
        <MetricCard
          title={t('dashboard.cashier.transactions')}
          value="12"
          currency={t('dashboard.cashier.today')}
          icon={CreditCard}
        />
        <MetricCard
          title={t('dashboard.cashier.validated')}
          value="10"
          currency={t('dashboard.cashier.today')}
          icon={CheckCircle}
        />
        <MetricCard
          title={t('dashboard.cashier.pending')}
          value="2"
          currency={t('common.pending')}
          icon={Clock}
        />
      </div>

      {/* Quick Payment Form */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('dashboard.cashier.recordPayment')}</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="student-matricule" className="text-sm font-medium">{t('dashboard.cashier.studentMatricule')}</label>
              <input
                id="student-matricule"
                type="text"
                placeholder="AB2024C001"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="payment-amount" className="text-sm font-medium">{t('dashboard.cashier.paymentAmount')}</label>
              <input
                id="payment-amount"
                type="number"
                placeholder="45000"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('dashboard.cashier.recordPayment')}
          </button>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('dashboard.cashier.recentPayments')}</h2>
        <div className="space-y-3">
          <PaymentItem
            name="Jean Kouadio"
            matricule="AB2024C001"
            amount="45,000"
            method={t('dashboard.cashier.cash')}
            time="10 min ago"
            status="completed"
            t={t}
          />
          <PaymentItem
            name="Marie Diallo"
            matricule="AB2024C002"
            amount="45,000"
            method={t('dashboard.cashier.mobileMoney')}
            time="25 min ago"
            status="completed"
            t={t}
          />
          <PaymentItem
            name="Kofi Mensah"
            matricule="AB2024C003"
            amount="22,500"
            method={t('dashboard.cashier.cash')}
            time="1 hour ago"
            status="pending"
            t={t}
          />
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  currency: string
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, currency, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{currency}</p>
      </div>
    </div>
  )
}

interface PaymentItemProps {
  name: string
  matricule: string
  amount: string
  method: string
  time: string
  status: 'completed' | 'pending'
  t: (key: string) => string
}

function PaymentItem({ name, matricule, amount, method, time, status, t }: PaymentItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{matricule}</p>
        <p className="text-xs text-muted-foreground">
          {method}
          {' '}
          •
          {time}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">
          {amount}
          {' '}
          FCFA
        </p>
        <span
          className={`text-xs ${status === 'completed'
            ? 'text-green-600 dark:text-green-400'
            : 'text-yellow-600 dark:text-yellow-400'
            }`}
        >
          {status === 'completed' ? t('dashboard.cashier.completed') : t('dashboard.cashier.pending')}
        </span>
      </div>
    </div>
  )
}
