import { IconMessage } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'

export function SchoolSupportTab() {
  return (
    <div className="
      grid gap-4
      md:grid-cols-2
    "
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessage className="h-5 w-5" />
            Notes CRM
          </CardTitle>
          <CardDescription>Notes internes sur cette école</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <textarea
                className="
                  border-input
                  placeholder:text-muted-foreground
                  focus-visible:ring-ring
                  min-h-[100px] w-full rounded-md border bg-transparent px-3
                  py-2 text-sm shadow-sm
                  focus-visible:ring-1 focus-visible:outline-none
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                placeholder="Ajouter une note..."
              />
              <Button size="sm" className="self-end">Ajouter la note</Button>
            </div>
            <Separator />
            <div className="text-muted-foreground py-4 text-center text-sm">
              Aucune note pour le moment.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
