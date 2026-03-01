import { motion } from 'motion/react'
import { item } from '../constants'

interface AbsenceItemProps {
  name: string
  class: string
  status: 'justified' | 'unjustified' | 'pending'
  reason: string
}

function AbsenceItem({
  name,
  class: className,
  status,
  reason,
}: AbsenceItemProps) {
  const statusConfig = {
    justified: {
      label: 'Justifiée',
      color: 'bg-success/10 text-success',
    },
    unjustified: {
      label: 'Non justifiée',
      color: 'bg-destructive/10 text-destructive',
    },
    pending: {
      label: 'En attente',
      color: 'bg-accent/10 text-accent-foreground',
    },
  }

  return (
    <div className="
      border-border/40 bg-background flex items-center justify-between
      rounded-md border p-4
    "
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{className}</p>
        <p className="text-muted-foreground text-xs">{reason}</p>
      </div>
      <span
        className={`
          rounded-full px-2 py-1 text-xs font-medium
          ${statusConfig[status].color}
        `}
      >
        {statusConfig[status].label}
      </span>
    </div>
  )
}

export function AbsencesSection() {
  return (
    <motion.div
      variants={item}
      className="border-border/40 bg-card rounded-lg border p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">Absences du Jour</h2>
      <div className="space-y-3">
        <AbsenceItem
          name="Jean Kouadio"
          class="3ème A"
          status="justified"
          reason="Maladie (certificat médical)"
        />
        <AbsenceItem
          name="Marie Diallo"
          class="2nde B"
          status="unjustified"
          reason="Non justifiée"
        />
        <AbsenceItem
          name="Kofi Mensah"
          class="1ère C"
          status="pending"
          reason="En attente de justification"
        />
      </div>
    </motion.div>
  )
}
