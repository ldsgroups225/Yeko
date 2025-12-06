import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, Plus, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { schoolSubjectsKeys, schoolSubjectsOptions } from '@/lib/queries/school-subjects'
import { toggleSchoolSubjectStatus } from '@/school/functions/school-subjects'
import { SubjectPickerDialog } from './subject-picker-dialog'
import { SubjectStatusToggle } from './subject-status-toggle'

interface SchoolSubjectListProps {
  schoolYearId?: string
}

interface SchoolSubjectItem {
  id: string
  schoolId: string
  subjectId: string
  schoolYearId: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  subject: {
    id: string
    name: string
    shortName: string
    category: string | null
  }
}

const CATEGORIES = ['Scientifique', 'Littéraire', 'Sportif', 'Autre'] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function SchoolSubjectList({ schoolYearId }: SchoolSubjectListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pickerOpen, setPickerOpen] = useState(false)

  const queryClient = useQueryClient()

  const filters = {
    schoolYearId,
    search: search || undefined,
    category: categoryFilter !== 'all' ? (categoryFilter as typeof CATEGORIES[number]) : undefined,
    status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
  }

  const { data, isLoading, error } = useQuery(schoolSubjectsOptions.list(filters))

  const toggleStatusMutation = useMutation({
    mutationFn: (params: { id: string, status: 'active' | 'inactive' }) =>
      toggleSchoolSubjectStatus({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolSubjectsKeys.all })
      toast.success('Subject status updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status')
    },
  })

  // Group subjects by category with proper typing
  const subjects = (data?.subjects || []) as SchoolSubjectItem[]
  const groupedSubjects: Record<string, SchoolSubjectItem[]> = {}

  for (const subject of subjects) {
    const category = subject.subject.category || 'Autre'
    if (!groupedSubjects[category]) {
      groupedSubjects[category] = []
    }
    groupedSubjects[category].push(subject)
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Subjects</CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">School Subjects</h2>
          <p className="text-muted-foreground">
            Manage subjects available for your school
          </p>
        </div>
        <Button onClick={() => setPickerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subjects
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subject List by Category */}
      {!isLoading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {Object.entries(groupedSubjects).map(([category, categorySubjects]) => (
            <motion.div key={category} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category}
                    <Badge variant="secondary">{categorySubjects.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySubjects.map((subject: SchoolSubjectItem) => (
                      <motion.div
                        key={subject.id}
                        variants={itemVariants}
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{subject.subject.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {subject.subject.shortName}
                            </p>
                          </div>
                          <SubjectStatusToggle
                            status={subject.status}
                            onToggle={status => toggleStatusMutation.mutate({
                              id: subject.id,
                              status,
                            })}
                            disabled={toggleStatusMutation.isPending}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Empty State */}
          {Object.keys(groupedSubjects).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  No subjects configured yet
                </p>
                <Button onClick={() => setPickerOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Subject
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Subject Picker Dialog */}
      <SubjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        schoolYearId={schoolYearId}
      />
    </div>
  )
}
