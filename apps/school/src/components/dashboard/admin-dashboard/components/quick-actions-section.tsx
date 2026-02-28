import { IconBook, IconCurrencyDollar, IconSchool, IconUsers } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { item } from '../constants'

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
      className="
        border-border/50 bg-card/80 flex items-center gap-4 rounded-xl border
        p-4 text-sm font-medium shadow-sm transition-all
        hover:shadow-md
      "
    >
      <div className={`
        rounded-lg p-2.5
        ${color}
      `}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-base font-semibold">{label}</span>
    </motion.button>
  )
}

interface QuickActionsSectionProps {
  t: any
}

export function QuickActionsSection({ t }: QuickActionsSectionProps) {
  return (
    <motion.div
      variants={item}
      className="
        border-border/40 bg-card/50 rounded-xl border p-6 shadow-sm
        backdrop-blur-xl
        lg:col-span-2
      "
    >
      <h2 className="mb-4 text-lg font-semibold">{t.dashboard.quickActions()}</h2>
      <div className="
        grid gap-3
        sm:grid-cols-2
      "
      >
        <QuickActionButton icon={IconUsers} label={t.dashboard.addUser()} color="bg-secondary/10 text-secondary" />
        <QuickActionButton icon={IconSchool} label={t.dashboard.enrollStudent()} color="bg-success/10 text-success" />
        <QuickActionButton icon={IconBook} label={t.dashboard.createClass()} color="bg-accent/10 text-accent-foreground" />
        <QuickActionButton icon={IconCurrencyDollar} label={t.dashboard.recordPayment()} color="bg-secondary/10 text-secondary" />
      </div>
    </motion.div>
  )
}
