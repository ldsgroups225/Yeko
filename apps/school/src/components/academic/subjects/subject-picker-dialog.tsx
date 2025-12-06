import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { schoolSubjectsKeys, schoolSubjectsOptions } from '@/lib/queries/school-subjects'
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
      toast.success(`Added ${result.length} subject(s) successfully`)
      setSelectedIds(new Set())
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add subjects')
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
    const categorySubjects = subjects.filter((s: CoreSubject) => (s.category || 'Autre') === category)
    const allSelected = categorySubjects.every((s: CoreSubject) => selectedIds.has(s.id))

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
      toast.error('Please select at least one subject')
      return
    }
    addMutation.mutate(Array.from(selectedIds))
  }

  // Group subjects by category with proper typing
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Subjects from Catalog</DialogTitle>
          <DialogDescription>
            Choose subjects to add to your school's curriculum
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category-filter" className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Scientifique">Scientifique</SelectItem>
              <SelectItem value="Littéraire">Littéraire</SelectItem>
              <SelectItem value="Sportif">Sportif</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject List */}
        <ScrollArea className="h-[400px] pr-4">
          {isLoading
            ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-[120px]" />
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map(j => (
                          <Skeleton key={j} className="h-10 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            : subjects.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>No subjects available to add</p>
                    <p className="text-sm">All subjects from the catalog have been added</p>
                  </div>
                )
              : (
                  <div className="space-y-6">
                    {Object.entries(groupedSubjects).map(([category, categorySubjects]) => {
                      const allSelected = categorySubjects.every((s: CoreSubject) => selectedIds.has(s.id))
                      const someSelected = categorySubjects.some((s: CoreSubject) => selectedIds.has(s.id))

                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={allSelected}
                              data-indeterminate={someSelected && !allSelected}
                              onCheckedChange={() => handleSelectAll(category)}
                            />
                            <Label
                              htmlFor={`category-${category}`}
                              className="font-semibold cursor-pointer"
                            >
                              {category}
                            </Label>
                            <span className="text-sm text-muted-foreground">
                              (
                              {categorySubjects.length}
                              )
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pl-6">
                            {categorySubjects.map((subject: CoreSubject) => (
                              <div
                                key={subject.id}
                                className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent cursor-pointer"
                                onClick={() => handleToggle(subject.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleToggle(subject.id)
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                <Checkbox
                                  id={subject.id}
                                  checked={selectedIds.has(subject.id)}
                                  onCheckedChange={() => handleToggle(subject.id)}
                                />
                                <Label
                                  htmlFor={subject.id}
                                  className="flex-1 cursor-pointer"
                                >
                                  <span className="font-medium">{subject.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    (
                                    {subject.shortName}
                                    )
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size}
            {' '}
            subject(s) selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || addMutation.isPending}
            >
              {addMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
