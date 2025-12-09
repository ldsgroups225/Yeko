'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createSchoolYear,
  deleteSchoolYear,
  getAvailableSchoolYearTemplates,
  getSchoolYears,
  setActiveSchoolYear,
} from '@/school/functions/school-years'

export const Route = createFileRoute('/_auth/app/settings/school-years')({
  component: SchoolYearsSettingsPage,
})

function SchoolYearsSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch school years
  const { data: schoolYears, isLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })

  // Fetch available templates
  const { data: templates } = useQuery({
    queryKey: ['school-year-templates'],
    queryFn: () => getAvailableSchoolYearTemplates(),
  })

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationFn: (id: string) => setActiveSchoolYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      queryClient.invalidateQueries({ queryKey: ['school-context'] })
      toast.success(t('settings.schoolYears.activatedSuccess'))
    },
    onError: () => {
      toast.error(t('settings.schoolYears.activatedError'))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSchoolYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      toast.success(t('settings.schoolYears.deletedSuccess'))
      setDeleteConfirmId(null)
    },
    onError: () => {
      toast.error(t('settings.schoolYears.deletedError'))
    },
  })

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/app/dashboard">
              {t('common.dashboard')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/app/settings">
              {t('settings.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('settings.schoolYears.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.schoolYears.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.schoolYears.description')}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.schoolYears.create')}
        </Button>
      </div>

      {/* School Years Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('settings.schoolYears.list')}
          </CardTitle>
          <CardDescription>
            {t('settings.schoolYears.listDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : schoolYears && schoolYears.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('settings.schoolYears.name')}</TableHead>
                  <TableHead>{t('settings.schoolYears.startDate')}</TableHead>
                  <TableHead>{t('settings.schoolYears.endDate')}</TableHead>
                  <TableHead>{t('settings.schoolYears.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolYears.map(year => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">
                      {year.template?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(year.startDate), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(year.endDate), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {year.isActive ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('settings.schoolYears.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('settings.schoolYears.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!year.isActive && (
                            <DropdownMenuItem
                              onClick={() => setActiveMutation.mutate(year.id)}
                              disabled={setActiveMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('settings.schoolYears.setActive')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteConfirmId(year.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t('settings.schoolYears.empty')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('settings.schoolYears.emptyDescription')}
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('settings.schoolYears.create')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateSchoolYearDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        templates={templates || []}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.schoolYears.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('settings.schoolYears.deleteConfirmDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


interface CreateSchoolYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Array<{ id: string, name: string, isActive: boolean }>
}

function CreateSchoolYearDialog({ open, onOpenChange, templates }: CreateSchoolYearDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [templateId, setTemplateId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(false)

  const createMutation = useMutation({
    mutationFn: () =>
      createSchoolYear({
        data: {
          schoolYearTemplateId: templateId,
          startDate,
          endDate,
          isActive,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      if (isActive) {
        queryClient.invalidateQueries({ queryKey: ['school-context'] })
      }
      toast.success(t('settings.schoolYears.createdSuccess'))
      onOpenChange(false)
      resetForm()
    },
    onError: () => {
      toast.error(t('settings.schoolYears.createdError'))
    },
  })

  const resetForm = () => {
    setTemplateId('')
    setStartDate('')
    setEndDate('')
    setIsActive(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateId || !startDate || !endDate) {
      toast.error(t('settings.schoolYears.fillAllFields'))
      return
    }
    createMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.schoolYears.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('settings.schoolYears.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">{t('settings.schoolYears.template')}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.schoolYears.selectTemplate')} />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.isActive && (
                      <Badge variant="secondary" className="ml-2">
                        {t('common.current')}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('settings.schoolYears.startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('settings.schoolYears.endDate')}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              {t('settings.schoolYears.setAsActive')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
