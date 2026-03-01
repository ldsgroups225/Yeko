import type { FormEvent } from 'react'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { COEFFICIENT_LIMITS } from '@/constants/coefficients'

interface CoefficientsFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isPending: boolean
  schoolYears: any[]
  subjects: any[]
  grades: any[]
  seriesData: any[]
  newCoefYear: string
  setNewCoefYear: (val: string) => void
  newCoefSubject: string
  setNewCoefSubject: (val: string) => void
  newCoefGrade: string
  setNewCoefGrade: (val: string) => void
  newCoefSeries: string
  setNewCoefSeries: (val: string) => void
}

export function CoefficientsForm({
  onSubmit,
  onCancel,
  isPending,
  schoolYears,
  subjects,
  grades,
  seriesData,
  newCoefYear,
  setNewCoefYear,
  newCoefSubject,
  setNewCoefSubject,
  newCoefGrade,
  setNewCoefGrade,
  newCoefSeries,
  setNewCoefSeries,
}: CoefficientsFormProps) {
  return (
    <Card className="
      border-primary/20
      dark:bg-card/80
      overflow-hidden bg-white/80 shadow-lg backdrop-blur-md
    "
    >
      <CardHeader className="bg-primary/5 border-primary/10 border-b">
        <CardTitle>Créer un Nouveau Coefficient</CardTitle>
        <CardDescription>Ajouter un coefficient pour une matière et une classe</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-3
          "
          >
            <div className="space-y-2">
              <Label htmlFor="coef-year" className="text-sm font-semibold">Année Scolaire *</Label>
              <Select
                name="schoolYearTemplateId"
                required
                value={newCoefYear}
                onValueChange={val => val && setNewCoefYear(val)}
              >
                <SelectTrigger className="
                  bg-background/50 border-input/50
                  focus:ring-primary/20
                "
                >
                  <SelectValue placeholder="Sélectionner l'année">
                    {newCoefYear
                      ? (() => {
                          const year = schoolYears?.find(y => y.id === newCoefYear)
                          return year
                            ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{year.name}</span>
                                  {year.isActive && (
                                    <Badge
                                      variant="secondary"
                                      className="
                                        bg-primary/10 text-primary h-4
                                        border-none text-[10px]
                                      "
                                    >
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              )
                            : undefined
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {schoolYears?.map(year => (
                    <SelectItem
                      key={year.id}
                      value={year.id}
                      className="focus:bg-primary/5 focus:text-primary"
                    >
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coef-subject" className="text-sm font-semibold">Matière *</Label>
              <Select name="subjectId" required value={newCoefSubject} onValueChange={val => val && setNewCoefSubject(val)}>
                <SelectTrigger className="
                  bg-background/50 border-input/50
                  focus:ring-primary/20
                "
                >
                  <SelectValue placeholder="Sélectionner la matière">
                    {newCoefSubject
                      ? subjects.find(s => s.id === newCoefSubject)?.name
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem
                      key={subject.id}
                      value={subject.id}
                      className="focus:bg-primary/5 focus:text-primary"
                    >
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coef-grade" className="text-sm font-semibold">Classe *</Label>
              <Select name="gradeId" required value={newCoefGrade} onValueChange={val => val && setNewCoefGrade(val)}>
                <SelectTrigger className="
                  bg-background/50 border-input/50
                  focus:ring-primary/20
                "
                >
                  <SelectValue placeholder="Sélectionner la classe">
                    {newCoefGrade
                      ? grades?.find(g => g.id === newCoefGrade)?.name
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {grades?.map(grade => (
                    <SelectItem
                      key={grade.id}
                      value={grade.id}
                      className="focus:bg-primary/5 focus:text-primary"
                    >
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coef-series" className="text-sm font-semibold">Série (optionnel)</Label>
              <Select name="seriesId" defaultValue="__none__" value={newCoefSeries} onValueChange={val => val && setNewCoefSeries(val)}>
                <SelectTrigger className="
                  bg-background/50 border-input/50
                  focus:ring-primary/20
                "
                >
                  <SelectValue placeholder="Aucune série">
                    {newCoefSeries === '__none__'
                      ? 'Aucune série'
                      : seriesData?.find(s => s.id === newCoefSeries)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune série</SelectItem>
                  {seriesData?.map(serie => (
                    <SelectItem
                      key={serie.id}
                      value={serie.id}
                      className="focus:bg-primary/5 focus:text-primary"
                    >
                      {serie.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="
              space-y-2
              lg:col-span-2
            "
            >
              <Label htmlFor="coef-weight" className="text-sm font-semibold">Coefficient *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="coef-weight"
                  name="weight"
                  type="number"
                  min={COEFFICIENT_LIMITS.MIN}
                  max={COEFFICIENT_LIMITS.MAX}
                  required
                  placeholder={String(COEFFICIENT_LIMITS.DEFAULT)}
                  className="
                    bg-background/50 border-input/50
                    focus:ring-primary/20
                    max-w-[200px] text-lg font-bold
                  "
                />
                <p className="text-muted-foreground text-xs italic">
                  Valeur comprise entre
                  {' '}
                  <span className="text-foreground font-semibold">{COEFFICIENT_LIMITS.MIN}</span>
                  {' '}
                  et
                  {' '}
                  <span className="text-foreground font-semibold">{COEFFICIENT_LIMITS.MAX}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-border/50 flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="
                transition-colors
                hover:bg-red-500/10 hover:text-red-500
              "
            >
              <IconX className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="
                bg-primary
                hover:bg-primary/90
                px-8 shadow-md transition-all
                active:scale-95
              "
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isPending ? 'Création...' : 'Créer le coefficient'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
