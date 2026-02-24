import { IconCalculator, IconDeviceFloppy } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

interface CoefficientsStatsProps {
  total: number
  activeYearName: string
  pendingChangesCount: number
}

export function CoefficientsStats({ total, activeYearName, pendingChangesCount }: CoefficientsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-white/50 dark:bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Coefficients</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <IconCalculator className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{total}</div>
          <p className="text-xs text-muted-foreground">Configurations actives</p>
        </CardContent>
      </Card>

      <Card className="bg-white/50 dark:bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Année Active</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <IconCalculator className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeYearName}</div>
          <p className="text-xs text-muted-foreground">Année scolaire en cours</p>
        </CardContent>
      </Card>

      <Card className="bg-white/50 dark:bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Modifications</CardTitle>
          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <IconDeviceFloppy className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{pendingChangesCount}</div>
          <p className="text-xs text-muted-foreground">En attente de sauvegarde</p>
        </CardContent>
      </Card>
    </div>
  )
}
