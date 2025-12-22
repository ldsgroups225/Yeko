'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  CheckCircle2,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import {
  createReportCardTemplate,
  deleteReportCardTemplate,
  getReportCardTemplates,
  updateReportCardTemplate,
} from '@/school/functions/report-cards'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/settings/report-cards')({
  component: ReportCardTemplatesSettingsPage,
})

function ReportCardTemplatesSettingsPage() {
  const t = useTranslations()
  const { schoolId } = useSchoolContext()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['report-card-templates', schoolId],
    queryFn: () => getReportCardTemplates({ data: { schoolId: schoolId ?? '' } }),
    enabled: !!schoolId,
  })

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => updateReportCardTemplate({ data: { id, isDefault: true } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-card-templates'] })
      toast.success(t.common.success())
    },
    onError: () => {
      toast.error(t.common.error())
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReportCardTemplate({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-card-templates'] })
      toast.success(t.common.deleteSuccess())
      setDeleteConfirmId(null)
    },
    onError: () => {
      toast.error(t.common.error())
    },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          {/* Header handled by layout */}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          {t.common.create()}
        </Button>
      </motion.div>

      {/* Templates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-5 w-5 text-primary" />
              {t.settings.reportCards.title()}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {t.settings.reportCards.description()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading
              ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 3 }).map(() => (
                    <Skeleton key={generateUUID()} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              )
              : templates && templates.length > 0
                ? (
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent border-border/40">
                        <TableHead className="font-semibold text-muted-foreground pl-6">{t.common.name()}</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">{t.common.status()}</TableHead>
                        <TableHead className="text-right font-semibold text-muted-foreground pr-6">{t.common.actions()}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {templates.map((template, index) => (
                          <motion.tr
                            key={template.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-muted/30 border-border/40 transition-colors"
                          >
                            <TableCell className="font-bold pl-6 text-foreground">
                              {template.name}
                            </TableCell>
                            <TableCell>
                              {template.isDefault
                                ? (
                                  <Badge variant="default" className="gap-1 bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200 dark:border-green-800 dark:text-green-400 rounded-lg pr-3 pl-3">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Default
                                  </Badge>
                                )
                                : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl shadow-xl w-48">
                                  {!template.isDefault && (
                                    <DropdownMenuItem
                                      onClick={() => setDefaultMutation.mutate(template.id)}
                                      disabled={setDefaultMutation.isPending}
                                      className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                      {t.settings.reportCards.isDefault()}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-border/40" />
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                                    onClick={() => setDeleteConfirmId(template.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t.common.delete()}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                )
                : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-4 rounded-full bg-muted/20">
                      <FileText className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {t.empty.noResults()}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        {t.settings.reportCards.createDescription()}
                      </p>
                    </div>
                    <Button className="mt-4 rounded-xl" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t.common.create()}
                    </Button>
                  </div>
                )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        schoolId={schoolId || ''}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t.settings.reportCards.deleteTitle()}</DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              {t.settings.reportCards.deleteDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="rounded-xl border-border/40">
              {t.common.cancel()}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="rounded-xl shadow-lg shadow-destructive/20"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.delete()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
}

function CreateTemplateDialog({ open, onOpenChange, schoolId }: CreateTemplateDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const resetForm = () => {
    setName('')
    setIsDefault(false)
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createReportCardTemplate({
        data: {
          schoolId,
          name,
          isDefault,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-card-templates'] })
      toast.success(t.common.success())
      onOpenChange(false)
      resetForm()
    },
    onError: () => {
      toast.error(t.common.error())
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error(t.common.error())
      return
    }
    createMutation.mutate()
  }

  const inputClass = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">{t.settings.reportCards.createTitle()}</DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-medium">
            {t.settings.reportCards.createDescription()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.reportCards.templateName()}</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder={t.settings.reportCards.templateNamePlaceholder()}
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/10 border border-border/40">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="h-5 w-5 rounded-md border-border/40 text-primary focus:ring-primary/20 bg-muted/20"
            />
            <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer select-none">
              {t.settings.reportCards.setAsDefault()}
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl border-border/40">
              {t.common.cancel()}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="rounded-xl shadow-lg shadow-primary/20">
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.create()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
