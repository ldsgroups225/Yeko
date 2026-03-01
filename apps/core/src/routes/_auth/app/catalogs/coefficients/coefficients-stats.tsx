import { IconCalculator, IconDeviceFloppy } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

interface CoefficientsStatsProps {
  total: number
  activeYearName: string
  pendingChangesCount: number
}

export function CoefficientsStats({ total, activeYearName, pendingChangesCount }: CoefficientsStatsProps) {
  return (
    <div className="
      grid gap-4
      md:grid-cols-3
    "
    >
      <Card className="
        dark:bg-card/50
        border-primary/10 bg-white/50 shadow-sm backdrop-blur-sm transition-all
        hover:shadow-md
      "
      >
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-muted-foreground text-sm font-medium">Total Coefficients</CardTitle>
          <div className="
            bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full
          "
          >
            <IconCalculator className="text-primary h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">{total}</div>
          <p className="text-muted-foreground text-xs">Configurations actives</p>
        </CardContent>
      </Card>

      <Card className="
        dark:bg-card/50
        border-primary/10 bg-white/50 shadow-sm backdrop-blur-sm transition-all
        hover:shadow-md
      "
      >
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-muted-foreground text-sm font-medium">Année Active</CardTitle>
          <div className="
            flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10
          "
          >
            <IconCalculator className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">{activeYearName}</div>
          <p className="text-muted-foreground text-xs">Année scolaire en cours</p>
        </CardContent>
      </Card>

      <Card className="
        dark:bg-card/50
        border-primary/10 bg-white/50 shadow-sm backdrop-blur-sm transition-all
        hover:shadow-md
      "
      >
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-muted-foreground text-sm font-medium">Modifications</CardTitle>
          <div className="
            flex h-8 w-8 items-center justify-center rounded-full
            bg-orange-500/10
          "
          >
            <IconDeviceFloppy className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">{pendingChangesCount}</div>
          <p className="text-muted-foreground text-xs">En attente de sauvegarde</p>
        </CardContent>
      </Card>
    </div>
  )
}
