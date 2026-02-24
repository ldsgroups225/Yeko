export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    asset: 'Actif',
    liability: 'Passif',
    equity: 'Capitaux',
    revenue: 'Produits',
    expense: 'Charges',
  }
  return labels[type] || type
}

export function getTypeColor(type: string) {
  switch (type) {
    case 'asset':
      return 'bg-secondary/10 text-secondary border-secondary/20'
    case 'liability':
      return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'equity':
      return 'bg-secondary/10 text-secondary border-secondary/20'
    case 'revenue':
      return 'bg-success/10 text-success border-success/20'
    case 'expense':
      return 'bg-accent/10 text-accent border-accent/20'
    default:
      return ''
  }
}
