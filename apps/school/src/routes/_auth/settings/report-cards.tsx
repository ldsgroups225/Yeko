import {
  IconCircleCheck,
  IconDots,
  IconFileText,
  IconLoader2,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
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
  const { data: templatesResult, isPending } = useQuery({
    queryKey: ['report-card-templates', schoolId],
    queryFn: () =>
      getReportCardTemplates({ data: { schoolId: schoolId ?? '' } }),
    enabled: !!schoolId,
  })
  const templates = templatesResult?.success ? templatesResult.data : []

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationKey: schoolMutationKeys.reportCards.update,
    mutationFn: (id: string) =>
      updateReportCardTemplate({ data: { id, isDefault: true } }),
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
    mutationKey: schoolMutationKeys.reportCards.delete,
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
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="
            shadow-primary/20 bg-primary
            hover:bg-primary/90
            rounded-xl shadow-lg
          "
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.common.create()}
        </Button>
      </div>

      {/* Templates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden rounded-3xl border
          shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="
              text-muted-foreground flex items-center gap-2 text-xl font-bold
              tracking-wider uppercase
            "
            >
              <IconFileText className="text-primary h-5 w-5" />
              {t.settings.reportCards.title()}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {t.settings.reportCards.description()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isPending
              ? (
                  <div className="space-y-4 p-6">
                    {Array.from({ length: 3 }).map(() => (
                      <Skeleton
                        key={generateUUID()}
                        className="h-16 w-full rounded-xl"
                      />
                    ))}
                  </div>
                )
              : templates && templates.length > 0
                ? (
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="
                          border-border/40
                          hover:bg-transparent
                        "
                        >
                          <TableHead className="
                            text-muted-foreground pl-6 font-semibold
                          "
                          >
                            {t.common.name()}
                          </TableHead>
                          <TableHead className="
                            text-muted-foreground font-semibold
                          "
                          >
                            {t.common.status()}
                          </TableHead>
                          <TableHead className="
                            text-muted-foreground pr-6 text-right font-semibold
                          "
                          >
                            {t.common.actions()}
                          </TableHead>
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
                              className="
                                group
                                hover:bg-muted/30
                                border-border/40 transition-colors
                              "
                            >
                              <TableCell className="
                                text-foreground pl-6 font-bold
                              "
                              >
                                {template.name}
                              </TableCell>
                              <TableCell>
                                {template.isDefault
                                  ? (
                                      <Badge
                                        variant="default"
                                        className="
                                          gap-1 rounded-lg border-green-200
                                          bg-green-500/15 pr-3 pl-3
                                          text-green-700
                                          hover:bg-green-500/25
                                          dark:border-green-800
                                          dark:text-green-400
                                        "
                                      >
                                        <IconCircleCheck className="h-3.5 w-3.5" />
                                        Default
                                      </Badge>
                                    )
                                  : (
                                      <span className="
                                        text-muted-foreground text-sm
                                      "
                                      >
                                        -
                                      </span>
                                    )}
                              </TableCell>
                              <TableCell className="pr-6 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={(
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="
                                          h-8 w-8 rounded-lg opacity-0
                                          transition-opacity
                                          group-hover:opacity-100
                                        "
                                      >
                                        <IconDots className="h-4 w-4" />
                                      </Button>
                                    )}
                                  />
                                  <DropdownMenuContent
                                    align="end"
                                    className="
                                      border-border/40 bg-card/95 w-48
                                      rounded-xl shadow-xl backdrop-blur-xl
                                    "
                                  >
                                    {!template.isDefault && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setDefaultMutation.mutate(template.id)}
                                        disabled={setDefaultMutation.isPending}
                                        className="
                                          focus:bg-primary/10
                                          cursor-pointer rounded-lg font-medium
                                        "
                                      >
                                        <IconCircleCheck className="
                                          mr-2 h-4 w-4 text-green-600
                                        "
                                        />
                                        {t.settings.reportCards.isDefault()}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="
                                      bg-border/40
                                    "
                                    />
                                    <DropdownMenuItem
                                      className="
                                        text-destructive
                                        focus:bg-destructive/10
                                        focus:text-destructive
                                        cursor-pointer rounded-lg font-medium
                                      "
                                      onClick={() => setDeleteConfirmId(template.id)}
                                    >
                                      <IconTrash className="mr-2 h-4 w-4" />
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
                    <div className="
                      flex flex-col items-center justify-center space-y-4 py-16
                      text-center
                    "
                    >
                      <div className="bg-muted/20 rounded-full p-4">
                        <IconFileText className="
                          text-muted-foreground/50 h-10 w-10
                        "
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-foreground text-lg font-bold">
                          {t.empty.noResults()}
                        </h3>
                        <p className="
                          text-muted-foreground mx-auto max-w-sm text-sm
                        "
                        >
                          {t.settings.reportCards.createDescription()}
                        </p>
                      </div>
                      <Button
                        className="mt-4 rounded-xl"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
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
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="
          bg-card/95 border-border/40 rounded-3xl p-6 shadow-2xl
          backdrop-blur-xl
          sm:max-w-[425px]
        "
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t.settings.reportCards.deleteTitle()}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              {t.settings.reportCards.deleteDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="
            gap-2
            sm:gap-0
          "
          >
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-border/40 rounded-xl"
            >
              {t.common.cancel()}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="shadow-destructive/20 rounded-xl shadow-lg"
            >
              {deleteMutation.isPending && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
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

function CreateTemplateDialog({
  open,
  onOpenChange,
  schoolId,
}: CreateTemplateDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const resetForm = () => {
    setName('')
    setIsDefault(false)
  }

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.reportCards.create,
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

  const inputClass
    = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl
        sm:max-w-[500px]
      "
      >
        <DialogHeader>
          <DialogTitle className="
            text-2xl font-black tracking-tight uppercase italic
          "
          >
            {t.settings.reportCards.createTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-medium">
            {t.settings.reportCards.createDescription()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
            >
              {t.settings.reportCards.templateName()}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder={t.settings.reportCards.templateNamePlaceholder()}
            />
          </div>

          <div className="
            bg-muted/10 border-border/40 flex items-center gap-3 rounded-xl
            border p-4
          "
          >
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="
                border-border/40 text-primary
                focus:ring-primary/20
                bg-muted/20 h-5 w-5 rounded-md
              "
            />
            <Label
              htmlFor="isDefault"
              className="cursor-pointer text-sm font-medium select-none"
            >
              {t.settings.reportCards.setAsDefault()}
            </Label>
          </div>

          <DialogFooter className="
            gap-2 pt-2
            sm:gap-0
          "
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/40 rounded-xl"
            >
              {t.common.cancel()}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="shadow-primary/20 rounded-xl shadow-lg"
            >
              {createMutation.isPending && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t.common.create()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
