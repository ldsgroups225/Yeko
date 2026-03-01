import type { FeeTypeCategory } from '@repo/data-ops'
import { IconCheck, IconCircleX, IconDotsVertical, IconEdit, IconPlus, IconReceipt, IconSearch, IconTrash, IconX } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@workspace/ui/components/sheet'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Switch } from '@workspace/ui/components/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createFeeTypeTemplateMutationOptions,
  deleteFeeTypeTemplateMutationOptions,
  feeTypeTemplatesQueryOptions,
  updateFeeTypeTemplateMutationOptions,
} from '@/integrations/tanstack-query/fee-type-templates-options'
import { feeTypeCategories } from '@/schemas/catalog'

export const Route = createFileRoute('/_auth/app/catalogs/fee-type-templates')({
  component: FeeTypeTemplatesPage,
})

function FeeTypeTemplatesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')

  // Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null)

  // Dialog state
  const [deletingTemplate, setDeletingTemplate] = useState<any | null>(null)

  const { data: templates, isLoading, error } = useQuery(
    feeTypeTemplatesQueryOptions({
      category: selectedCategory === 'all' ? undefined : (selectedCategory as FeeTypeCategory),
      includeInactive: true,
    }),
  )

  const createMutation = useMutation({
    ...createFeeTypeTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-type-templates'] })
      setIsSheetOpen(false)
      toast.success('Modèle créé avec succès')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })

  const updateMutation = useMutation({
    ...updateFeeTypeTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-type-templates'] })
      setIsSheetOpen(false)
      setEditingTemplate(null)
      toast.success('Modèle mis à jour avec succès')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const deleteMutation = useMutation({
    ...deleteFeeTypeTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-type-templates'] })
      setDeletingTemplate(null)
      toast.success('Modèle supprimé avec succès')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })

  // Filter templates based on search
  const filteredTemplates = templates?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
    || t.code.toLowerCase().includes(search.toLowerCase()),
  )

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined)
      return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      tuition: 'Scolarité',
      registration: 'Inscription',
      exam: 'Examen',
      books: 'Livres',
      transport: 'Transport',
      uniform: 'Uniforme',
      meals: 'Cantine',
      activities: 'Activités',
      other: 'Autre',
    }
    return labels[category] || category
  }

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setIsSheetOpen(true)
  }

  const handleOpenEdit = (template: any) => {
    setEditingTemplate(template)
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: any = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      nameEn: (formData.get('nameEn') as string) || undefined,
      category: formData.get('category') as FeeTypeCategory,
      description: (formData.get('description') as string) || undefined,
      defaultAmount: formData.get('defaultAmount') ? Number(formData.get('defaultAmount')) : undefined,
      isMandatory: formData.get('isMandatory') === 'on',
      isRecurring: formData.get('isRecurring') === 'on',
      isActive: formData.get('isActive') === 'on',
      displayOrder: Number(formData.get('displayOrder')) || 0,
    }

    if (editingTemplate) {
      updateMutation.mutate({ ...data, id: editingTemplate.id })
    }
    else {
      createMutation.mutate(data)
    }
  }

  if (error) {
    return (
      <div className="
        flex flex-col items-center justify-center py-20 text-center
      "
      >
        <IconCircleX className="text-destructive mb-4 h-12 w-12" />
        <h2 className="text-destructive text-2xl font-bold">Erreur</h2>
        <p className="text-muted-foreground mt-2">{error.message}</p>
        <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modèles de Frais</h1>
          <p className="text-muted-foreground">
            Gérer les types de frais standards applicables dans toutes les écoles
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreate}>
          <IconPlus className="h-4 w-4" />
          Nouveau Modèle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="
            flex flex-col justify-between gap-4
            md:flex-row md:items-center
          "
          >
            <div className="
              relative w-full
              md:w-96
            "
            >
              <IconSearch className="
                text-muted-foreground absolute top-1/2 left-3 h-4 w-4
                -translate-y-1/2
              "
              />
              <Input
                placeholder="Rechercher par nom ou code..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="
              flex items-center gap-2 overflow-x-auto pb-2
              md:pb-0
            "
            >
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Tous
              </Button>
              {feeTypeCategories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {getCategoryLabel(cat)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant Défaut</TableHead>
                  <TableHead className="text-center">Mandat.</TableHead>
                  <TableHead className="text-center">Récurrent</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? (
                      [1, 2, 3, 4, 5].map(item1 => (
                        <TableRow key={item1}>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(item2 => (
                            <TableCell key={item2}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
                  : filteredTemplates?.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Aucun modèle trouvé.
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        filteredTemplates?.map(template => (
                          <TableRow key={template.id}>
                            <TableCell className="font-mono text-xs">{template.code}</TableCell>
                            <TableCell>
                              <div className="font-medium">{template.name}</div>
                              {template.nameEn && (
                                <div className="text-muted-foreground text-xs">
                                  {template.nameEn}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                            </TableCell>
                            <TableCell>{formatAmount(template.defaultAmount)}</TableCell>
                            <TableCell className="text-center">
                              {template.isMandatory
                                ? (
                                    <IconCheck className="
                                      mx-auto h-4 w-4 text-green-500
                                    "
                                    />
                                  )
                                : (
                                    <IconX className="
                                      text-muted-foreground mx-auto h-4 w-4
                                    "
                                    />
                                  )}
                            </TableCell>
                            <TableCell className="text-center">
                              {template.isRecurring
                                ? (
                                    <IconCheck className="
                                      mx-auto h-4 w-4 text-blue-500
                                    "
                                    />
                                  )
                                : (
                                    <IconX className="
                                      text-muted-foreground mx-auto h-4 w-4
                                    "
                                    />
                                  )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                {template.isActive ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={props => (
                                    <Button
                                      {...props}
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <IconDotsVertical className="h-4 w-4" />
                                    </Button>
                                  )}
                                />
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2" onClick={() => handleOpenEdit(template)}>
                                    <IconEdit className="h-4 w-4" />
                                    {' '}
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive gap-2"
                                    onClick={() => setDeletingTemplate(template)}
                                  >
                                    <IconTrash className="h-4 w-4" />
                                    {' '}
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="
          flex flex-col gap-0 p-0
          sm:max-w-md
        "
        >
          <SheetHeader className="bg-muted/10 border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2">
              <IconReceipt className="text-primary h-5 w-5" />
              {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle de frais'}
            </SheetTitle>
            <SheetDescription>
              Définissez les paramètres globaux pour ce type de frais standards.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* Identification Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 rounded-full" />
                    <h3 className="
                      text-muted-foreground text-sm font-semibold tracking-wider
                      uppercase
                    "
                    >
                      Identification
                    </h3>
                  </div>
                  <div className="
                    bg-card grid gap-4 rounded-xl border p-4 shadow-sm
                  "
                  >
                    <div className="grid gap-2">
                      <Label
                        htmlFor="code"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Code Unique *
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        placeholder="EX: TUI_PRI"
                        defaultValue={editingTemplate?.code}
                        required
                        disabled={!!editingTemplate}
                        className="
                          focus:ring-primary/20
                          font-mono uppercase transition-all
                          focus:ring-2
                        "
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="name"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Nom (Français) *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Ex: Scolarité Primaire"
                        defaultValue={editingTemplate?.name}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="nameEn"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Nom (Anglais)
                      </Label>
                      <Input
                        id="nameEn"
                        name="nameEn"
                        placeholder="Ex: Primary Tuition"
                        defaultValue={editingTemplate?.nameEn}
                      />
                    </div>
                  </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 rounded-full" />
                    <h3 className="
                      text-muted-foreground text-sm font-semibold tracking-wider
                      uppercase
                    "
                    >
                      Configuration
                    </h3>
                  </div>
                  <div className="
                    bg-card grid gap-4 rounded-xl border p-4 shadow-sm
                  "
                  >
                    <div className="grid gap-2">
                      <Label
                        htmlFor="category"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Catégorie *
                      </Label>
                      <Select name="category" defaultValue={editingTemplate?.category} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypeCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="defaultAmount"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Montant par défaut (XOF)
                      </Label>
                      <div className="relative">
                        <Input
                          id="defaultAmount"
                          name="defaultAmount"
                          type="number"
                          placeholder="0"
                          defaultValue={editingTemplate?.defaultAmount}
                          className="pr-12"
                        />
                        <div className="
                          pointer-events-none absolute inset-y-0 right-0 flex
                          items-center pr-3
                        "
                        >
                          <span className="
                            text-muted-foreground text-xs font-bold
                          "
                          >
                            XOF
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="description"
                        className="
                          text-muted-foreground text-xs font-bold tracking-tight
                          uppercase
                        "
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Détails additionnels..."
                        defaultValue={editingTemplate?.description}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Options */}
                <div className="space-y-4 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/20 h-1 w-8 rounded-full" />
                    <h3 className="
                      text-muted-foreground text-sm font-semibold tracking-wider
                      uppercase
                    "
                    >
                      Options & Statut
                    </h3>
                  </div>
                  <div className="bg-card divide-y rounded-xl border shadow-sm">
                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Obligatoire</Label>
                        <p className="text-muted-foreground text-xs text-pretty">Requis pour l'inscription</p>
                      </div>
                      <Switch name="isMandatory" defaultChecked={editingTemplate?.isMandatory} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Récurrent</Label>
                        <p className="text-muted-foreground text-xs">Frais périodique (ex: mensuel)</p>
                      </div>
                      <Switch name="isRecurring" defaultChecked={editingTemplate?.isRecurring} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="space-y-0.5">
                        <Label className="text-primary text-sm font-medium">Statut Actif</Label>
                        <p className="text-muted-foreground text-xs">Rendre disponible pour les écoles</p>
                      </div>
                      <Switch name="isActive" defaultChecked={editingTemplate?.isActive ?? true} />
                    </div>

                    <div className="p-4 pt-2">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="displayOrder"
                          className="
                            text-muted-foreground text-xs font-bold
                            tracking-tight uppercase
                          "
                        >
                          Ordre d'affichage
                        </Label>
                        <Input
                          id="displayOrder"
                          name="displayOrder"
                          type="number"
                          defaultValue={editingTemplate?.displayOrder ?? 0}
                          className="h-9 w-24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="
              bg-muted/10 mt-auto flex items-center justify-end gap-3 border-t
              px-6 py-4
            "
            >
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="shadow-primary/20 min-w-[140px] shadow-lg"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Chargement...'
                  : editingTemplate ? 'Mettre à jour' : 'Créer le modèle'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={!!deletingTemplate}
        onOpenChange={open => !open && setDeletingTemplate(null)}
        title="Supprimer le modèle"
        description={`Êtes-vous sûr de vouloir supprimer le modèle "${deletingTemplate?.name}" ? Cette action est irréversible et pourrait affecter les écoles utilisant ce modèle.`}
        confirmText={deletingTemplate?.name}
        onConfirm={() => deleteMutation.mutate({ id: deletingTemplate.id })}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
