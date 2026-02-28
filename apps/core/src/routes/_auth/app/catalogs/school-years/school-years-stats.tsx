import { IconCalendar, IconCheck } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

interface SchoolYearsStatsProps {
  totalYears: number
  totalTerms: number
  activeYearName: string
}

export function SchoolYearsStats({ totalYears, totalTerms, activeYearName }: SchoolYearsStatsProps) {
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
          <CardTitle className="text-sm font-medium">Années Scolaires</CardTitle>
          <IconCalendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalYears}</div>
          <p className="text-muted-foreground text-xs">Modèles disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">Périodes</CardTitle>
          <IconCalendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTerms}</div>
          <p className="text-muted-foreground text-xs">Trimestres/Semestres</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="
          flex flex-row items-center justify-between space-y-0 pb-2
        "
        >
          <CardTitle className="text-sm font-medium">Année Active</CardTitle>
          <IconCheck className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeYearName}</div>
          <p className="text-muted-foreground text-xs">Année en cours</p>
        </CardContent>
      </Card>
    </div>
  )
}
