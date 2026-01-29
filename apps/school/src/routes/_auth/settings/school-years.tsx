import {
  IconCalendar,
  IconCircleCheck,
  IconDots,
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
import { DatePicker } from '@workspace/ui/components/date-picker'
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

import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
import { useTranslations } from '@/i18n'
import {
  createSchoolYear,
  deleteSchoolYear,
  getAvailableSchoolYearTemplates,
  getSchoolYears,
  setActiveSchoolYear,
} from '@/school/functions/school-years'
import { formatDate } from '@/utils/formatDate'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/settings/school-years')({
  component: SchoolYearsSettingsPage,
})

function SchoolYearsSettingsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch school years
  const { data: schoolYearsResult, isLoading } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })

  // Fetch available templates
  const { data: templatesResult } = useQuery({
    queryKey: ['school-year-templates'],
    queryFn: () => getAvailableSchoolYearTemplates(),
  })

  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []
  const templates = templatesResult?.success ? templatesResult.data : []

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationFn: (id: string) => setActiveSchoolYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      queryClient.invalidateQueries({ queryKey: ['school-context'] })
      toast.success(t.settings.schoolYears.activatedSuccess())
    },
    onError: () => {
      toast.error(t.settings.schoolYears.activatedError())
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSchoolYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] })
      toast.success(t.settings.schoolYears.deletedSuccess())
      setDeleteConfirmId(null)
    },
    onError: () => {
      toast.error(t.settings.schoolYears.deletedError())
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
          {/* Header is handled by SettingsLayout now, so we might not need this duplication if it's the main page.
               However, keeping it as sub-section header or removing if redundant.
               The layout has the main header. This part seems to be specific actions for this tab.
           */}
          {/* Let's keep the action button but maybe simplify the text if it's redundant with layout header */}
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          {t.settings.schoolYears.create()}
        </Button>
      </motion.div>

      {/* School Years Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-wider text-muted-foreground">
              <IconCalendar className="h-5 w-5 text-primary" />
              {t.settings.schoolYears.list()}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {t.settings.schoolYears.listDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading
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
              : schoolYears && schoolYears.length > 0
                ? (
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border/40">
                          <TableHead className="font-semibold text-muted-foreground pl-6">
                            {t.settings.schoolYears.name()}
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            {t.settings.schoolYears.startDate()}
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            {t.settings.schoolYears.endDate()}
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            {t.settings.schoolYears.status()}
                          </TableHead>
                          <TableHead className="text-right font-semibold text-muted-foreground pr-6">
                            {t.common.actions()}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {schoolYears.map((year, index) => (
                            <motion.tr
                              key={year.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group hover:bg-muted/30 border-border/40 transition-colors"
                            >
                              <TableCell className="font-bold pl-6 text-foreground">
                                {year.template?.name || 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground">
                                {formatDate(year.startDate, 'MEDIUM')}
                              </TableCell>
                              <TableCell className="font-medium text-muted-foreground">
                                {formatDate(year.endDate, 'MEDIUM')}
                              </TableCell>
                              <TableCell>
                                {year.isActive
                                  ? (
                                      <Badge
                                        variant="default"
                                        className="gap-1 bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200 dark:border-green-800 dark:text-green-400 rounded-lg pr-3 pl-3"
                                      >
                                        <IconCircleCheck className="h-3.5 w-3.5" />
                                        {t.settings.schoolYears.active()}
                                      </Badge>
                                    )
                                  : (
                                      <Badge
                                        variant="secondary"
                                        className="bg-muted text-muted-foreground rounded-lg"
                                      >
                                        {t.settings.schoolYears.inactive()}
                                      </Badge>
                                    )}
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={(
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <IconDots className="h-4 w-4" />
                                      </Button>
                                    )}
                                  />
                                  <DropdownMenuContent
                                    align="end"
                                    className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl shadow-xl w-48"
                                  >
                                    {!year.isActive && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setActiveMutation.mutate(year.id)}
                                        disabled={setActiveMutation.isPending}
                                        className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                                      >
                                        <IconCircleCheck className="mr-2 h-4 w-4 text-green-600" />
                                        {t.settings.schoolYears.setActive()}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-border/40" />
                                    <DropdownMenuItem
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                                      onClick={() => setDeleteConfirmId(year.id)}
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
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <div className="p-4 rounded-full bg-muted/20">
                        <IconCalendar className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {t.settings.schoolYears.empty()}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          {t.settings.schoolYears.emptyDescription()}
                        </p>
                      </div>
                      <Button
                        className="mt-4 rounded-xl"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        {t.settings.schoolYears.create()}
                      </Button>
                    </div>
                  )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <CreateSchoolYearDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        templates={templates || []}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t.settings.schoolYears.deleteConfirmTitle()}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              {t.settings.schoolYears.deleteConfirmDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-xl border-border/40"
            >
              {t.common.cancel()}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="rounded-xl shadow-lg shadow-destructive/20"
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

interface CreateSchoolYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: Array<{ id: string, name: string, isActive: boolean }>
}

function CreateSchoolYearDialog({
  open,
  onOpenChange,
  templates,
}: CreateSchoolYearDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [templateId, setTemplateId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(false)

  const resetForm = () => {
    setTemplateId('')
    setStartDate('')
    setEndDate('')
    setIsActive(false)
  }

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
      toast.success(t.settings.schoolYears.createdSuccess())
      onOpenChange(false)
      resetForm()
    },
    onError: () => {
      toast.error(t.settings.schoolYears.createdError())
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateId || !startDate || !endDate) {
      toast.error(t.settings.schoolYears.fillAllFields())
      return
    }
    createMutation.mutate()
  }

  const inputClass
    = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'
  const selectTriggerClass
    = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors data-[placeholder]:text-muted-foreground'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight uppercase italic">
            {t.settings.schoolYears.createTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-medium">
            {t.settings.schoolYears.createDescription()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label
              htmlFor="template"
              className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
            >
              {t.settings.schoolYears.template()}
            </Label>
            <Select
              value={templateId}
              onValueChange={val => setTemplateId(val ?? '')}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue
                  placeholder={t.settings.schoolYears.selectTemplate()}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl backdrop-blur-xl bg-card/95 border-border/40 shadow-xl">
                {templates.map(template => (
                  <SelectItem
                    key={template.id}
                    value={template.id}
                    className="rounded-lg cursor-pointer focus:bg-primary/10"
                  >
                    <span className="flex items-center gap-2">
                      {template.name}
                      {template.isActive && (
                        <Badge
                          variant="secondary"
                          className="ml-2 px-1 py-0 text-[10px]"
                        >
                          {t.common.current()}
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
              >
                {t.settings.schoolYears.startDate()}
              </Label>
              <DatePicker
                date={startDate ? new Date(startDate) : undefined}
                onSelect={(date: Date | undefined) => setStartDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
              >
                {t.settings.schoolYears.endDate()}
              </Label>
              <DatePicker
                date={endDate ? new Date(endDate) : undefined}
                onSelect={(date: Date | undefined) => setEndDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/10 border border-border/40">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded-md border-border/40 text-primary focus:ring-primary/20 bg-muted/20"
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium cursor-pointer select-none"
            >
              {t.settings.schoolYears.setAsActive()}
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/40"
            >
              {t.common.cancel()}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl shadow-lg shadow-primary/20"
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
