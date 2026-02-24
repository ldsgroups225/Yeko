import { IconCalculator, IconTrash } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { AnimatePresence, domMax, LazyMotion, m } from 'motion/react'
import { CatalogListSkeleton } from '@/components/catalogs/catalog-skeleton'

interface CoefficientsListViewProps {
  isPending: boolean
  coefficients: any[]
  onDelete: (coef: any) => void
}

export function CoefficientsListView({ isPending, coefficients, onDelete }: CoefficientsListViewProps) {
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
        <CardContent>
          <CatalogListSkeleton count={5} />
        </CardContent>
      </Card>
    )
  }

  if (coefficients.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <IconCalculator className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Aucun coefficient trouvé</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-sm">
            Commencez par créer votre premier coefficient.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des Coefficients</CardTitle>
          <CardDescription>
            {coefficients.length}
            {' '}
            coefficient(s) configuré(s)
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <LazyMotion features={domMax}>
            <AnimatePresence mode="popLayout">
              {coefficients.map(coef => (
                <m.div
                  key={coef.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 border rounded-xl bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                      <span className="text-xl font-black">{coef.weight}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-bold text-lg text-foreground/90">{coef.subject?.name}</h3>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none font-bold">
                          {coef.grade?.name}
                        </Badge>
                        {coef.series && (
                          <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50/50">
                            {coef.series.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        {coef.schoolYearTemplate?.name}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(coef)}
                    className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <IconTrash className="h-5 w-5" />
                  </Button>
                </m.div>
              ))}
            </AnimatePresence>
          </LazyMotion>
        </div>
      </CardContent>
    </Card>
  )
}
