import { IconBook, IconCheck, IconFilter, IconLoader2, IconSearch, IconSparkles } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import {
  schoolSubjectsKeys,
  schoolSubjectsOptions,
} from '@/lib/queries/school-subjects'
import { cn } from '@/lib/utils'
import { addSubjectsToSchool } from '@/school/functions/school-subjects'

interface SubjectPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId?: string
}

interface CoreSubject {
  id: string
  name: string
  shortName: string
  category: string | null
}

export function SubjectPickerDialog({
  open,
  onOpenChange,
  schoolYearId,
}: SubjectPickerDialogProps) {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    ...schoolSubjectsOptions.available({
      search: search || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      schoolYearId,
    }),
    enabled: open,
  })

  const subjects = (data || []) as CoreSubject[]

  const addMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      addSubjectsToSchool({
        data: {
          subjectIds,
          schoolYearId,
        },
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success(
        t.academic.subjects.messages.addSuccess({ count: result.length }),
      )
      setSelectedIds(new Set())
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t.academic.subjects.messages.addError())
    },
  })

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    }
    else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (category: string) => {
    const categorySubjects = subjects.filter(
      (s: CoreSubject) => (s.category || 'Autre') === category,
    )
    const allSelected = categorySubjects.every((s: CoreSubject) =>
      selectedIds.has(s.id),
    )

    const newSelected = new Set(selectedIds)
    if (allSelected) {
      categorySubjects.forEach((s: CoreSubject) => newSelected.delete(s.id))
    }
    else {
      categorySubjects.forEach((s: CoreSubject) => newSelected.add(s.id))
    }
    setSelectedIds(newSelected)
  }

  const handleSubmit = () => {
    if (selectedIds.size === 0) {
      toast.error(t.academic.subjects.messages.selectAtLeastOne())
      return
    }
    addMutation.mutate(Array.from(selectedIds))
  }

  const groupedSubjects: Record<string, CoreSubject[]> = {}
  for (const subject of subjects) {
    const category = subject.category || 'Autre'
    if (!groupedSubjects[category]) {
      groupedSubjects[category] = []
    }
    groupedSubjects[category].push(subject)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b border-border/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconSparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.subjects.picker.title()}</DialogTitle>
                <DialogDescription className="text-xs font-semibold opacity-70 uppercase tracking-wider">
                  {t.academic.subjects.picker.description()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 bg-white/5 border-b border-border/10">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.academic.subjects.searchPlaceholder()}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white/5 border-white/10 focus:ring-primary/40 shadow-none text-sm transition-all focus:bg-white/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={categoryFilter} onValueChange={val => val && setCategoryFilter(val)}>
              <SelectTrigger id="category-filter" className="w-full sm:w-[180px] h-10 bg-white/5 border-white/10 focus:ring-primary/40 shadow-none text-sm">
                <SelectValue placeholder={t.academic.subjects.allCategories()}>
                  {categoryFilter && (() => {
                    const categoryConfig = {
                      all: { color: 'bg-gray-400', label: t.academic.subjects.allCategories(), icon: '📚' },
                      Scientifique: { color: 'bg-blue-500', label: t.academic.subjects.categories.scientifique(), icon: '🔬' },
                      Littéraire: { color: 'bg-green-500', label: t.academic.subjects.categories.litteraire(), icon: '📖' },
                      Sportif: { color: 'bg-orange-500', label: t.academic.subjects.categories.sportif(), icon: '⚽' },
                      Autre: { color: 'bg-purple-500', label: t.academic.subjects.categories.autre(), icon: '🎨' },
                    }
                    const config = categoryConfig[categoryFilter as keyof typeof categoryConfig] || categoryConfig.all
                    return (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        <span>
                          {config.icon}
                          {' '}
                          {config.label}
                        </span>
                      </div>
                    )
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-card/95 border-white/10">
                <SelectItem value="all">{t.academic.subjects.allCategories()}</SelectItem>
                <SelectItem value="Scientifique">{t.academic.subjects.categories.scientifique()}</SelectItem>
                <SelectItem value="Littéraire">{t.academic.subjects.categories.litteraire()}</SelectItem>
                <SelectItem value="Sportif">{t.academic.subjects.categories.sportif()}</SelectItem>
                <SelectItem value="Autre">{t.academic.subjects.categories.autre()}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-none">
          <AnimatePresence mode="wait">
            {isLoading
              ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8 py-4"
                  >
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-4 w-32 bg-white/5" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map(j => (
                            <Skeleton key={j} className="h-16 w-full rounded-xl bg-white/5" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )
              : subjects.length === 0
                ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                    >
                      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                        <IconBook className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{t.academic.subjects.picker.noAvailable()}</p>
                        <p className="text-xs text-muted-foreground max-w-[280px]">
                          {t.academic.subjects.picker.noAvailableDescription()}
                        </p>
                      </div>
                    </motion.div>
                  )
                : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-10 pb-6"
                    >
                      {Object.entries(groupedSubjects).map(([category, categorySubjects], catIdx) => {
                        const allSelected = categorySubjects.every((s: CoreSubject) => selectedIds.has(s.id))
                        const someSelected = categorySubjects.some((s: CoreSubject) => selectedIds.has(s.id))

                        return (
                          <div key={category} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`category-${category}`}
                                checked={allSelected}
                                className={cn(
                                  'h-4 w-4 rounded border-white/20 data-[state=checked]:bg-primary',
                                  someSelected && !allSelected && 'data-[state=unchecked]:bg-primary/40',
                                )}
                                onCheckedChange={() => handleSelectAll(category)}
                              />
                              <Label
                                htmlFor={`category-${category}`}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                              >
                                {category}
                                {' '}
                                <span className="ml-1 opacity-50">
                                  (
                                  {categorySubjects.length}
                                  )
                                </span>
                              </Label>
                              <div className="h-px flex-1 bg-border/20" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {categorySubjects.map((subject: CoreSubject, idx: number) => {
                                const isSelected = selectedIds.has(subject.id)
                                return (
                                  <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={cn(
                                      'group relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden',
                                      isSelected
                                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
                                        : 'border-border/40 bg-white/5 hover:border-primary/30 hover:bg-white/10',
                                    )}
                                    onClick={() => handleToggle(subject.id)}
                                  >
                                    <div className={cn(
                                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground',
                                    )}
                                    >
                                      {isSelected ? <IconCheck className="h-5 w-5" /> : <IconBook className="h-5 w-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                                        {subject.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                        {subject.shortName}
                                      </p>
                                    </div>

                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => handleToggle(subject.id)}
                                      className="sr-only"
                                    />

                                    {isSelected && (
                                      <div className="absolute top-0 right-0 p-1">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                      </div>
                                    )}
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white/5 border-t border-border/10">
          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono bg-primary/10 text-primary border-primary/20 h-6 px-2">
                {selectedIds.size}
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                {t.academic.subjects.picker.selected()}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none hover:bg-white/10"
              >
                {t.common.cancel()}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0 || addMutation.isPending}
                className="flex-1 sm:min-w-[160px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {addMutation.isPending
                  ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    )
                  : (
                      <IconCheck className="mr-2 h-4 w-4" />
                    )}
                {t.academic.subjects.picker.addSelected()}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
