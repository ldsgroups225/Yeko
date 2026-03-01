import type { FormEvent } from 'react'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { m } from 'motion/react'

interface YearCreateFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isPending: boolean
  isActive: string
  setIsActive: (val: string) => void
}

export function YearCreateForm({ onSubmit, onCancel, isPending, isActive, setIsActive }: YearCreateFormProps) {
  return (
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Créer une Nouvelle Année Scolaire</CardTitle>
          <CardDescription>
            Définissez le nom de l'année scolaire, puis ajoutez les périodes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="
              grid gap-4
              md:grid-cols-2
            "
            >
              <div className="space-y-2">
                <Label htmlFor="year-name">Nom de l'année *</Label>
                <Input id="year-name" name="name" placeholder="2025-2026" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year-status">Statut</Label>
                <Select
                  name="isActive"
                  value={isActive}
                  onValueChange={val => val && setIsActive(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut">
                      {isActive === 'true' ? 'Active' : isActive === 'false' ? 'Inactive' : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <IconX className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </m.div>
  )
}
