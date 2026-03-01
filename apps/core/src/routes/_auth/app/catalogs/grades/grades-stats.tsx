import { IconAward, IconSchool } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

interface GradesStatsProps {
  gradesCount: number
  seriesCount: number
  tracksCount: number
}

export function GradesStats({ gradesCount, seriesCount, tracksCount }: GradesStatsProps) {
  return (
    <div className="
      grid gap-4
      md:grid-cols-3
    "
    >
      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">Total Niveaux</CardTitle>
          <IconSchool className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{gradesCount}</div>
          <p className="text-muted-foreground text-xs">Niveaux d'étude</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">Total Séries</CardTitle>
          <IconAward className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{seriesCount}</div>
          <p className="text-muted-foreground text-xs">Séries académiques</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">Filières</CardTitle>
          <IconAward className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tracksCount}</div>
          <p className="text-muted-foreground text-xs">Filières disponibles</p>
        </CardContent>
      </Card>
    </div>
  )
}
