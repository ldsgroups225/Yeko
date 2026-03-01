import { IconAlertTriangle, IconCalculator } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { COEFFICIENT_LIMITS } from '@/constants/coefficients'

interface CoefficientsMatrixViewProps {
  matrixData: any
  onCellEdit: (id: string, weight: number) => void
}

export function CoefficientsMatrixView({ matrixData, onCellEdit }: CoefficientsMatrixViewProps) {
  if (!matrixData || matrixData.columns.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="
            bg-muted mb-4 flex h-16 w-16 items-center justify-center
            rounded-full
          "
          >
            <IconCalculator className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">Aucun coefficient trouvé</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-center">
            Ajustez vos filtres ou commencez par créer votre premier coefficient pour voir la matrice.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/10 overflow-hidden shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle>Vue Matrice</CardTitle>
        <CardDescription>Visualisation et modification rapide des coefficients par classe et matière</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="
                  bg-muted sticky left-0 z-10 border-r p-4 text-left font-bold
                "
                >
                  Matière
                </th>
                {matrixData.columns.map((columnKey: string) => {
                  const info = matrixData.columnInfo[columnKey]
                  return (
                    <th
                      key={columnKey}
                      className="bg-muted/30 min-w-28 border-r p-4 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-primary font-bold">{info?.gradeName}</span>
                        {info?.seriesName && (
                          <span className="
                            text-muted-foreground mt-1 text-[10px] font-semibold
                            tracking-wider uppercase
                          "
                          >
                            {info.seriesName}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrixData.matrix as Record<string, any>).map(([subjectName, columnCoefs], index) => (
                <tr
                  key={subjectName}
                  className={`
                    ${index % 2 === 0
                  ? `bg-background`
                  : `bg-muted/10`}
                    hover:bg-primary/5
                    border-b transition-colors
                  `}
                >
                  <td className="
                    bg-background/90 sticky left-0 z-10 border-r p-4
                    font-semibold backdrop-blur-sm
                  "
                  >
                    {subjectName}
                  </td>
                  {matrixData.columns.map((columnKey: string) => {
                    const coef = columnCoefs[columnKey]
                    return (
                      <td key={columnKey} className="border-r p-3 text-center">
                        {coef
                          ? (
                              <div className="
                                group flex flex-col items-center gap-1
                              "
                              >
                                <Input
                                  type="number"
                                  value={coef.weight}
                                  onChange={e => onCellEdit(coef.id, Number.parseInt(e.target.value))}
                                  className={`
                                    focus:ring-primary/30
                                    mx-auto w-16 text-center font-bold
                                    transition-all
                                    ${coef.weight === 0
                                ? `border-red-500 bg-red-50 text-red-500`
                                : `
                                  border-input
                                  group-hover:border-primary/50
                                  shadow-none
                                `}
                                  `}
                                  min={COEFFICIENT_LIMITS.MIN}
                                  max={COEFFICIENT_LIMITS.MAX}
                                />
                                {coef.weight === 0 && (
                                  <div className="
                                    flex animate-pulse items-center gap-1
                                    text-[10px] font-bold text-red-500
                                  "
                                  >
                                    <IconAlertTriangle className="h-3 w-3" />
                                    <span>COEF 0</span>
                                  </div>
                                )}
                              </div>
                            )
                          : (
                              <div className="
                                flex items-center justify-center opacity-20
                              "
                              >
                                <div className="
                                  bg-muted-foreground h-0.5 w-4 rounded-full
                                "
                                />
                              </div>
                            )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
