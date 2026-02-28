import { IconDeviceFloppy } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'

interface CoefficientsFiltersProps {
  yearFilter: string
  setYearFilter: (val: string) => void
  gradeFilter: string
  setGradeFilter: (val: string) => void
  seriesFilter: string
  setSeriesFilter: (val: string) => void
  viewMode: 'matrix' | 'list'
  setViewMode: (val: 'matrix' | 'list') => void
  schoolYears: any[]
  grades: any[]
  seriesData: any[]
  editingCellsCount: number
  onSaveChanges: () => void
  isBulkUpdating: boolean
}

export function CoefficientsFilters({
  yearFilter,
  setYearFilter,
  gradeFilter,
  setGradeFilter,
  seriesFilter,
  setSeriesFilter,
  viewMode,
  setViewMode,
  schoolYears,
  grades,
  seriesData,
  editingCellsCount,
  onSaveChanges,
  isBulkUpdating,
}: CoefficientsFiltersProps) {
  return (
    <Card className="
      dark:bg-card/40 dark:border-border/10
      border-white/20 bg-white/40 backdrop-blur-sm
    "
    >
      <CardContent className="py-4">
        <div className="
          flex flex-col items-start gap-4
          lg:flex-row lg:items-center
        "
        >
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <Select value={yearFilter} onValueChange={val => val && setYearFilter(val)}>
              <SelectTrigger className="
                dark:bg-card/50
                w-[180px] bg-white/50
              "
              >
                <SelectValue placeholder="Année">
                  {yearFilter === 'all'
                    ? 'Toutes les années'
                    : (() => {
                        const year = schoolYears?.find(y => y.id === yearFilter)
                        return year
                          ? (
                              <div className="flex items-center gap-2">
                                <span>{year.name}</span>
                                {year.isActive && (
                                  <Badge
                                    variant="secondary"
                                    className="
                                      bg-primary/10 text-primary h-4 border-none
                                      text-[10px]
                                    "
                                  >
                                    Active
                                  </Badge>
                                )}
                              </div>
                            )
                          : undefined
                      })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {schoolYears?.map(year => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={val => val && setGradeFilter(val)}>
              <SelectTrigger className="
                dark:bg-card/50
                w-[180px] bg-white/50
              "
              >
                <SelectValue placeholder="Classe">
                  {gradeFilter === 'all'
                    ? 'Toutes les classes'
                    : grades?.find(g => g.id === gradeFilter)?.name || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {grades?.map(grade => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seriesFilter} onValueChange={val => val && setSeriesFilter(val)}>
              <SelectTrigger className="
                dark:bg-card/50
                w-[180px] bg-white/50
              "
              >
                <SelectValue placeholder="Série">
                  {seriesFilter === 'all'
                    ? 'Toutes les séries'
                    : seriesData?.find(s => s.id === seriesFilter)?.name || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les séries</SelectItem>
                {seriesData?.map(serie => (
                  <SelectItem key={serie.id} value={serie.id}>
                    {serie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="
            flex w-full items-center gap-4
            lg:w-auto
          "
          >
            {editingCellsCount > 0 && (
              <Button
                onClick={onSaveChanges}
                disabled={isBulkUpdating}
                className="
                  animate-in fade-in zoom-in slide-in-from-right-4 bg-orange-500
                  shadow-md transition-all
                  hover:bg-orange-600
                  active:scale-95
                "
              >
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                Enregistrer (
                {editingCellsCount}
                )
              </Button>
            )}

            <div className="
              bg-border/50 hidden h-8 w-px
              lg:block
            "
            />

            <Tabs
              value={viewMode}
              onValueChange={v => setViewMode(v as 'matrix' | 'list')}
              className="
                w-full
                lg:w-auto
              "
            >
              <TabsList className="
                bg-background/50 grid grid-cols-2 rounded-lg p-1
                lg:inline-flex
              "
              >
                <TabsTrigger
                  value="matrix"
                  className="
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    rounded-md
                  "
                >
                  Matrice
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    rounded-md
                  "
                >
                  Liste
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
