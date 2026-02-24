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
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <IconCalculator className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Aucun coefficient trouvé</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-sm">
            Ajustez vos filtres ou commencez par créer votre premier coefficient pour voir la matrice.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle>Vue Matrice</CardTitle>
        <CardDescription>Visualisation et modification rapide des coefficients par classe et matière</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 bg-muted sticky left-0 z-10 font-bold border-r">Matière</th>
                {matrixData.columns.map((columnKey: string) => {
                  const info = matrixData.columnInfo[columnKey]
                  return (
                    <th key={columnKey} className="text-center p-4 bg-muted/30 min-w-28 border-r">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-primary">{info?.gradeName}</span>
                        {info?.seriesName && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">
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
                <tr key={subjectName} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'} hover:bg-primary/5 transition-colors border-b`}>
                  <td className="font-semibold p-4 border-r sticky left-0 bg-background/90 backdrop-blur-sm z-10">
                    {subjectName}
                  </td>
                  {matrixData.columns.map((columnKey: string) => {
                    const coef = columnCoefs[columnKey]
                    return (
                      <td key={columnKey} className="text-center p-3 border-r">
                        {coef
                          ? (
                              <div className="flex flex-col items-center gap-1 group">
                                <Input
                                  type="number"
                                  value={coef.weight}
                                  onChange={e => onCellEdit(coef.id, Number.parseInt(e.target.value))}
                                  className={`w-16 mx-auto text-center font-bold focus:ring-primary/30 transition-all ${coef.weight === 0 ? 'border-red-500 text-red-500 bg-red-50' : 'border-input shadow-none group-hover:border-primary/50'}`}
                                  min={COEFFICIENT_LIMITS.MIN}
                                  max={COEFFICIENT_LIMITS.MAX}
                                />
                                {coef.weight === 0 && (
                                  <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold animate-pulse">
                                    <IconAlertTriangle className="h-3 w-3" />
                                    <span>COEF 0</span>
                                  </div>
                                )}
                              </div>
                            )
                          : (
                              <div className="flex items-center justify-center opacity-20">
                                <div className="h-0.5 w-4 bg-muted-foreground rounded-full" />
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
