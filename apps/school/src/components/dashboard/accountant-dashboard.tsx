import { AlertCircle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'

export function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Comptable</h1>
        <p className="text-muted-foreground">
          Gestion financière et rapports comptables
        </p>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenus ce mois"
          value="2,450,000"
          currency="FCFA"
          icon={DollarSign}
          trend="positive"
        />
        <MetricCard
          title="Dépenses ce mois"
          value="1,230,000"
          currency="FCFA"
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title="Solde"
          value="1,220,000"
          currency="FCFA"
          icon={CheckCircle}
          trend="positive"
        />
        <MetricCard
          title="Impayés"
          value="450,000"
          currency="FCFA"
          icon={AlertCircle}
          trend="negative"
        />
      </div>

      {/* Recent Transactions & Pending Payments */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Transactions Récentes</h2>
          <div className="space-y-3">
            <TransactionItem
              type="income"
              description="Frais de scolarité - Jean Kouadio"
              amount="45,000"
              date="Aujourd'hui"
            />
            <TransactionItem
              type="expense"
              description="Salaire enseignants"
              amount="850,000"
              date="Hier"
            />
            <TransactionItem
              type="income"
              description="Frais d'inscription - 15 élèves"
              amount="225,000"
              date="Il y a 2 jours"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Paiements en Retard</h2>
          <div className="space-y-3">
            <PendingPaymentItem
              name="Marie Diallo"
              class="3ème A"
              amount="45,000"
              daysLate={15}
            />
            <PendingPaymentItem
              name="Kofi Mensah"
              class="2nde B"
              amount="45,000"
              daysLate={8}
            />
            <PendingPaymentItem
              name="Ama Asante"
              class="1ère C"
              amount="45,000"
              daysLate={3}
            />
          </div>
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
  trend: 'positive' | 'negative' | 'neutral'
}

function MetricCard({ title, value, currency, icon: Icon, trend }: MetricCardProps) {
  const trendColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`h-4 w-4 ${trendColors[trend]}`} />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{currency}</p>
      </div>
    </div>
  )
}

interface TransactionItemProps {
  type: 'income' | 'expense'
  description: string
  amount: string
  date: string
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
}

function PendingPaymentItem({ name, class: className, amount, daysLate }: PendingPaymentItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{className}</p>
        <p className="text-xs text-red-600 dark:text-red-400">
          Retard:
          {daysLate}
          {' '}
          jours
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
