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
          <div className="
            bg-muted mb-4 flex h-16 w-16 items-center justify-center
            rounded-full
          "
          >
            <IconCalculator className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground text-xl font-semibold">Aucun coefficient trouvé</h3>
          <p className="text-muted-foreground mt-2 max-w-sm text-center">
            Commencez par créer votre premier coefficient.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="
      border-primary/10 overflow-hidden shadow-sm transition-all
      hover:shadow-md
    "
    >
      <CardHeader className="
        bg-muted/30 flex flex-row items-center justify-between
      "
      >
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
                  className="
                    bg-card
                    hover:border-primary/50 hover:bg-primary/5
                    group flex items-center justify-between rounded-xl border
                    p-4 transition-all
                  "
                >
                  <div className="flex flex-1 items-center gap-5">
                    <div className="
                      bg-primary/10 border-primary/20
                      group-hover:bg-primary group-hover:text-primary-foreground
                      flex h-12 w-12 items-center justify-center rounded-xl
                      border shadow-sm transition-colors
                    "
                    >
                      <span className="text-xl font-black">{coef.weight}</span>
                    </div>
                    <div className="flex-1">
                      <div className="
                        flex flex-wrap items-center gap-x-3 gap-y-1
                      "
                      >
                        <h3 className="text-foreground/90 text-lg font-bold">{coef.subject?.name}</h3>
                        <Badge
                          variant="secondary"
                          className="
                            border-none bg-blue-500/10 font-bold text-blue-600
                          "
                        >
                          {coef.grade?.name}
                        </Badge>
                        {coef.series && (
                          <Badge
                            variant="outline"
                            className="
                              border-orange-200 bg-orange-50/50 text-orange-600
                            "
                          >
                            {coef.series.name}
                          </Badge>
                        )}
                      </div>
                      <div className="
                        text-muted-foreground mt-1 flex items-center gap-2
                        text-sm
                      "
                      >
                        <span className="
                          bg-muted-foreground/30 inline-block h-1.5 w-1.5
                          rounded-full
                        "
                        />
                        {coef.schoolYearTemplate?.name}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(coef)}
                    className="
                      text-muted-foreground h-10 w-10 rounded-full
                      transition-colors
                      hover:bg-red-50 hover:text-red-500
                    "
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
