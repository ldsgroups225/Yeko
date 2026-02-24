export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export const chartMargin = { top: 10, right: 10, left: 0, bottom: 0 }

export const tooltipContentStyle = {
  backgroundColor: 'var(--card)',
  borderColor: 'var(--border)',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-lg)',
}

export const tooltipItemStyle = { color: 'var(--foreground)' }

export const barTooltipCursor = { fill: 'var(--muted)', opacity: 0.2 }

export const MONTH_LABELS: Record<string, Record<string, string>> = {
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

export function formatMonthLabel(yearMonth: string): string {
  const month = yearMonth.split('-')[1] ?? ''
  const labels = MONTH_LABELS.fr ?? {}
  return labels[month] ?? month
}
