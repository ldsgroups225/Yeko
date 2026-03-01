import { formatDate } from '@repo/data-ops'
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
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  schoolYearsKeys,
  schoolYearsOptions,
  schoolYearTemplatesOptions,
} from '@/lib/queries/school-years'
import {
  createSchoolYear,
  deleteSchoolYear,
  setActiveSchoolYear,
} from '@/school/functions/school-years'
import { parseServerFnError } from '@/utils/error-handlers'
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
  const { data: schoolYears = [], isPending: isYearsPending } = useQuery(schoolYearsOptions())

  // Fetch available templates
  const { data: templates = [], isPending: isTemplatesPending } = useQuery(schoolYearTemplatesOptions())

  // Set active mutation
  const setActiveMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolYears.setActive,
    mutationFn: (id: string) => setActiveSchoolYear({ data: { id } }),
    onMutate: async (id) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: schoolYearsKeys.all })

      // Snapshot the previous value
      const previousSchoolYears = queryClient.getQueryData(schoolYearsOptions().queryKey)

      // Optimistically update to the new value
      queryClient.setQueryData(schoolYearsOptions().queryKey, (old) => {
        if (!old)
          return []
        return old.map(sy => ({
          ...sy,
          isActive: sy.id === id,
        }))
      })

      // Return a context object with the snapshotted value
      return { previousSchoolYears }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolYearsKeys.all })
      queryClient.invalidateQueries({ queryKey: ['school-context'] })
      toast.success(t.settings.schoolYears.activatedSuccess())
    },
    onError: (err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSchoolYears) {
        queryClient.setQueryData(schoolYearsOptions().queryKey, context.previousSchoolYears)
      }
      toast.error(parseServerFnError(err, t.settings.schoolYears.activatedError()))
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolYears.delete,
    mutationFn: (id: string) => deleteSchoolYear({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolYearsKeys.all })
      toast.success(t.settings.schoolYears.deletedSuccess())
      setDeleteConfirmId(null)
    },
    onError: (err) => {
      toast.error(parseServerFnError(err, t.settings.schoolYears.deletedError()))
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
          {t.settings.schoolYears.create()}
        </Button>
      </div>

      {/* School Years Table */}
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
              <IconCalendar className="text-primary h-5 w-5" />
              {t.settings.schoolYears.list()}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              {t.settings.schoolYears.listDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isYearsPending || isTemplatesPending
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
                        <TableRow className="
                          border-border/40
                          hover:bg-transparent
                        "
                        >
                          <TableHead className="
                            text-muted-foreground pl-6 font-semibold
                          "
                          >
                            {t.settings.schoolYears.name()}
                          </TableHead>
                          <TableHead className="
                            text-muted-foreground font-semibold
                          "
                          >
                            {t.settings.schoolYears.startDate()}
                          </TableHead>
                          <TableHead className="
                            text-muted-foreground font-semibold
                          "
                          >
                            {t.settings.schoolYears.endDate()}
                          </TableHead>
                          <TableHead className="
                            text-muted-foreground font-semibold
                          "
                          >
                            {t.settings.schoolYears.status()}
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
                          {schoolYears.map((year, index) => (
                            <motion.tr
                              key={year.id}
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
                                {year.template?.name || 'N/A'}
                              </TableCell>
                              <TableCell className="
                                text-muted-foreground font-medium
                              "
                              >
                                {formatDate(year.startDate, 'MEDIUM')}
                              </TableCell>
                              <TableCell className="
                                text-muted-foreground font-medium
                              "
                              >
                                {formatDate(year.endDate, 'MEDIUM')}
                              </TableCell>
                              <TableCell>
                                {year.isActive
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
                                        {t.settings.schoolYears.active()}
                                      </Badge>
                                    )
                                  : (
                                      <Badge
                                        variant="secondary"
                                        className="
                                          bg-muted text-muted-foreground
                                          rounded-lg
                                        "
                                      >
                                        {t.settings.schoolYears.inactive()}
                                      </Badge>
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
                                    {!year.isActive && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setActiveMutation.mutate(year.id)}
                                        disabled={setActiveMutation.isPending}
                                        className="
                                          focus:bg-primary/10
                                          cursor-pointer rounded-lg font-medium
                                        "
                                      >
                                        <IconCircleCheck className="
                                          mr-2 h-4 w-4 text-green-600
                                        "
                                        />
                                        {t.settings.schoolYears.setActive()}
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
                    <div className="
                      flex flex-col items-center justify-center space-y-4 py-16
                      text-center
                    "
                    >
                      <div className="bg-muted/20 rounded-full p-4">
                        <IconCalendar className="
                          text-muted-foreground/50 h-10 w-10
                        "
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-foreground text-lg font-bold">
                          {t.settings.schoolYears.empty()}
                        </h3>
                        <p className="
                          text-muted-foreground mx-auto max-w-sm text-sm
                        "
                        >
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
        <DialogContent className="
          bg-card/95 border-border/40 rounded-3xl p-6 shadow-2xl
          backdrop-blur-xl
          sm:max-w-[425px]
        "
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t.settings.schoolYears.deleteConfirmTitle()}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              {t.settings.schoolYears.deleteConfirmDescription()}
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

  const selectedTemplate = templates.find(t => t.id === templateId)

  const resetForm = () => {
    setTemplateId('')
    setStartDate('')
    setEndDate('')
    setIsActive(false)
  }

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.schoolYears.create,
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
      queryClient.invalidateQueries({ queryKey: schoolYearsKeys.all })
      if (isActive) {
        queryClient.invalidateQueries({ queryKey: ['school-context'] })
      }
      toast.success(t.settings.schoolYears.createdSuccess())
      onOpenChange(false)
      resetForm()
    },
    onError: (err) => {
      toast.error(parseServerFnError(err, t.settings.schoolYears.createdError()))
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
            {t.settings.schoolYears.createTitle()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 font-medium">
            {t.settings.schoolYears.createDescription()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="template"
              className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
            >
              {t.settings.schoolYears.template()}
            </Label>
            <Select
              value={templateId}
              onValueChange={val => setTemplateId(val ?? '')}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder={t.settings.schoolYears.selectTemplate()}>
                  {selectedTemplate?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="
                bg-card/95 border-border/40 rounded-xl shadow-xl
                backdrop-blur-xl
              "
              >
                {templates.map(template => (
                  <SelectItem
                    key={template.id}
                    value={template.id}
                    className="
                      focus:bg-primary/10
                      cursor-pointer rounded-lg
                    "
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

          <div className="
            grid gap-6
            sm:grid-cols-2
          "
          >
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
              >
                {t.settings.schoolYears.startDate()}
              </Label>
              <DatePicker
                captionLayout="dropdown"
                date={startDate ? new Date(startDate) : undefined}
                onSelect={(date: Date | undefined) => setStartDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
              >
                {t.settings.schoolYears.endDate()}
              </Label>
              <DatePicker
                captionLayout="dropdown"
                date={endDate ? new Date(endDate) : undefined}
                onSelect={(date: Date | undefined) => setEndDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                className={inputClass}
              />
            </div>
          </div>

          <div className="
            bg-muted/10 border-border/40 flex items-center gap-3 rounded-xl
            border p-4
          "
          >
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="
                border-border/40 text-primary
                focus:ring-primary/20
                bg-muted/20 h-5 w-5 rounded-md
              "
            />
            <Label
              htmlFor="isActive"
              className="cursor-pointer text-sm font-medium select-none"
            >
              {t.settings.schoolYears.setAsActive()}
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
