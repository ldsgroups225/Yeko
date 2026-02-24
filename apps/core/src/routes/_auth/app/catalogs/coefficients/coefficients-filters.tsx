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
    <Card className="bg-white/40 dark:bg-card/40 backdrop-blur-sm border-white/20 dark:border-border/10">
      <CardContent className="py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select value={yearFilter} onValueChange={val => val && setYearFilter(val)}>
              <SelectTrigger className="w-[180px] bg-white/50 dark:bg-card/50">
                <SelectValue placeholder="Année">
                  {yearFilter === 'all'
                    ? 'Toutes les années'
                    : (() => {
                        const year = schoolYears?.find(y => y.id === yearFilter)
                        return year
                          ? (
                              <div className="flex items-center gap-2">
                                <span>{year.name}</span>
                                {year.isActive && <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none">Active</Badge>}
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
              <SelectTrigger className="w-[180px] bg-white/50 dark:bg-card/50">
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
              <SelectTrigger className="w-[180px] bg-white/50 dark:bg-card/50">
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

          <div className="flex items-center gap-4 w-full lg:w-auto">
            {editingCellsCount > 0 && (
              <Button onClick={onSaveChanges} disabled={isBulkUpdating} className="bg-orange-500 hover:bg-orange-600 shadow-md transition-all active:scale-95 animate-in fade-in zoom-in slide-in-from-right-4">
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                Enregistrer ({editingCellsCount})
              </Button>
            )}
            
            <div className="h-8 w-px bg-border/50 hidden lg:block" />

            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'matrix' | 'list')} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-2 lg:inline-flex bg-background/50 p-1 rounded-lg">
                <TabsTrigger value="matrix" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Matrice</TabsTrigger>
                <TabsTrigger value="list" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Liste</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
