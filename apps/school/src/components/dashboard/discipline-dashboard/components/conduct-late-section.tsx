import { motion } from 'motion/react'
import { item } from '../constants'

interface ConductItemProps {
  name: string
  class: string
  incident: string
  severity: 'minor' | 'moderate' | 'major'
  date: string
}

function ConductItem({
  name,
  class: className,
  incident,
  severity,
  date,
}: ConductItemProps) {
  const severityConfig = {
    minor: {
      label: 'Mineur',
      color: 'bg-accent/10 text-accent-foreground',
    },
    moderate: {
      label: 'Modéré',
      color: 'bg-accent/10 text-accent-foreground',
    },
    major: {
      label: 'Grave',
      color: 'bg-destructive/10 text-destructive',
    },
  }

  return (
    <div className="space-y-2 rounded-md border border-border/40 bg-background p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{className}</p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${severityConfig[severity].color}`}
        >
          {severityConfig[severity].label}
        </span>
      </div>
      <p className="text-sm">{incident}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  )
}

interface LateItemProps {
  name: string
  class: string
  count: number
  period: string
}

function LateItem({ name, class: className, count, period }: LateItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{className}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">
          {count}
          {' '}
          retards
        </p>
        <p className="text-xs text-muted-foreground">{period}</p>
      </div>
    </div>
  )
}

export function ConductLateSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        variants={item}
        className="rounded-lg border border-border/40 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Incidents de Conduite</h2>
        <div className="space-y-3">
          <ConductItem
            name="Ama Asante"
            class="4ème A"
            incident="Perturbation en classe"
            severity="minor"
            date="Aujourd'hui"
          />
          <ConductItem
            name="Kwame Nkrumah"
            class="3ème B"
            incident="Conflit avec un camarade"
            severity="moderate"
            date="Hier"
          />
          <ConductItem
            name="Fatou Sow"
            class="2nde C"
            incident="Manque de respect"
            severity="major"
            date="Il y a 2 jours"
          />
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="rounded-lg border border-border/40 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Retards Fréquents</h2>
        <div className="space-y-3">
          <LateItem
            name="Ibrahim Traoré"
            class="6ème A"
            count={8}
            period="Ce mois"
          />
          <LateItem
            name="Aisha Bamba"
            class="5ème B"
            count={6}
            period="Ce mois"
          />
          <LateItem
            name="Yao Kouassi"
            class="4ème C"
            count={5}
            period="Ce mois"
          />
        </div>
      </motion.div>
    </div>
  )
}
