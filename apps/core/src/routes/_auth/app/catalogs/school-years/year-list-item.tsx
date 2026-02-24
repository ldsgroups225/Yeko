import type { FormEvent } from 'react'
import { IconCalendar, IconCheck, IconChevronRight, IconClock, IconEdit, IconPlus, IconTrash, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { AnimatePresence, m } from 'motion/react'
import { TermListItem } from './term-list-item'

interface TermTemplate {
  id: string
  name: string
  type: 'trimester' | 'semester'
  order: number
  schoolYearTemplateId: string
}

interface SchoolYearWithTerms {
  id: string
  name: string
  isActive: boolean
  terms: TermTemplate[]
}

interface YearListItemProps {
  year: SchoolYearWithTerms
  isExpanded: boolean
  onToggleExpand: () => void
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onUpdate: (e: FormEvent<HTMLFormElement>) => void
  onDelete: () => void
  editYearIsActive: string
  setEditYearIsActive: (val: string) => void
  isUpdatePending: boolean

  // Term related
  addingTermToYear: string | null
  setAddingTermToYear: (id: string | null) => void
  createTermType: string
  setCreateTermType: (val: string) => void
  onCreateTerm: (e: FormEvent<HTMLFormElement>) => void
  isCreateTermPending: boolean

  editingTerm: TermTemplate | null
  setEditingTerm: (term: TermTemplate | null) => void
  editTermType: string
  setEditTermType: (val: string) => void
  onUpdateTerm: (e: FormEvent<HTMLFormElement>) => void
  isUpdateTermPending: boolean
  onDeleteTerm: (term: { id: string, name: string }) => void
}

export function YearListItem({
  year,
  isExpanded,
  onToggleExpand,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  editYearIsActive,
  setEditYearIsActive,
  isUpdatePending,
  addingTermToYear,
  setAddingTermToYear,
  createTermType,
  setCreateTermType,
  onCreateTerm,
  isCreateTermPending,
  editingTerm,
  setEditingTerm,
  editTermType,
  setEditTermType,
  onUpdateTerm,
  isUpdateTermPending,
  onDeleteTerm,
}: YearListItemProps) {
  return (
    <Card className={year.isActive ? 'border-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1 hover:bg-accent rounded"
            >
              <m.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <IconChevronRight className="h-5 w-5" />
              </m.div>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IconCalendar className="h-5 w-5 text-primary" />
            </div>
            {isEditing
              ? (
                  <form onSubmit={onUpdate} className="flex items-center gap-2">
                    <Input name="name" defaultValue={year.name} className="w-32" />
                    <Select name="isActive" value={editYearIsActive} onValueChange={val => val && setEditYearIsActive(val)}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Statut">
                          {editYearIsActive === 'true' ? 'Active' : editYearIsActive === 'false' ? 'Inactive' : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" size="sm" disabled={isUpdatePending}>
                      <IconCheck className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
                      <IconX className="h-4 w-4" />
                    </Button>
                  </form>
                )
              : (
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{year.name}</CardTitle>
                      {year.isActive && <Badge variant="default">Active</Badge>}
                    </div>
                    <CardDescription>
                      {year.terms.length}
                      {' '}
                      période(s) configurée(s)
                    </CardDescription>
                  </div>
                )}
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onStartEdit}>
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-4 border-t">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconClock className="h-4 w-4" />
                    Périodes (Trimestres/Semestres)
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => setAddingTermToYear(year.id)}>
                    <IconPlus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <AnimatePresence>
                  {addingTermToYear === year.id && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-muted/50 rounded-lg"
                    >
                      <form onSubmit={onCreateTerm} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Nom *</Label>
                            <Input name="name" placeholder="1er Trimestre" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select name="type" value={createTermType} onValueChange={val => val && setCreateTermType(val)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Type">
                                  {createTermType === 'trimester' ? 'Trimestre' : createTermType === 'semester' ? 'Semestre' : undefined}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="trimester">Trimestre</SelectItem>
                                <SelectItem value="semester">Semestre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ordre *</Label>
                            <Input name="order" type="number" min="1" defaultValue={year.terms.length + 1} required />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setAddingTermToYear(null)}>
                            Annuler
                          </Button>
                          <Button type="submit" size="sm" disabled={isCreateTermPending}>
                            {isCreateTermPending ? 'Création...' : 'Ajouter'}
                          </Button>
                        </div>
                      </form>
                    </m.div>
                  )}
                </AnimatePresence>

                {year.terms.length === 0
                  ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <IconCalendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune période configurée</p>
                        <p className="text-sm">Ajoutez des trimestres ou semestres pour cette année</p>
                      </div>
                    )
                  : (
                      <div className="space-y-2">
                        {year.terms
                          .sort((a, b) => a.order - b.order)
                          .map(term => (
                            <TermListItem
                              key={term.id}
                              term={term}
                              isEditing={editingTerm?.id === term.id}
                              editTermType={editTermType}
                              setEditTermType={setEditTermType}
                              onEdit={() => {
                                setEditingTerm(term)
                                setEditTermType(term.type)
                              }}
                              onCancelEdit={() => setEditingTerm(null)}
                              onUpdate={onUpdateTerm}
                              onDelete={() => onDeleteTerm({ id: term.id, name: term.name })}
                              isPending={isUpdateTermPending}
                            />
                          ))}
                      </div>
                    )}
              </div>
            </CardContent>
          </m.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
