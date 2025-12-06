import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { classSubjectsKeys, classSubjectsOptions } from '@/lib/queries/class-subjects'
import { removeClassSubject } from '@/school/functions/class-subjects'
import { ClassCoverageSummary } from './class-coverage-summary'
import { ClassSubjectDialog } from './class-subject-dialog'
import { SubjectCopyDialog } from './subject-copy-dialog'

interface ClassSubjectManagerProps {
  classId: string
  className: string
}

export function ClassSubjectManager({ classId, className }: ClassSubjectManagerProps) {
  const queryClient = useQueryClient()
  const { data: subjects, isLoading } = useQuery(classSubjectsOptions.list({ classId }))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classSubjectsKeys.list({ classId }) })
      toast.success('Subject removed from class')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove subject')
    },
  })

  // Group subjects by category for better display if needed, but for now simple list
  // The query returns subjects sorted by name

  return (
    <div className="space-y-6">
      {!isLoading && subjects && <ClassCoverageSummary subjects={subjects} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Subjects & Configuration</CardTitle>
            <CardDescription>
              Manage subjects, coefficients, and teachers for
              {' '}
              {className}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCopyDialogOpen(true)} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy from...
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-center">Coeff.</TableHead>
                  <TableHead className="text-center">Hours/Week</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? (
                      Array.from({ length: 3 }, (_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    )
                  : subjects?.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No subjects configured for this class.
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        subjects?.map((item: any) => (
                          <TableRow key={item.classSubject.id}>
                            <TableCell className="font-medium">
                              {item.subject.name}
                              <span className="text-xs text-muted-foreground ml-2">
                                (
                                {item.subject.shortName}
                                )
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.teacher?.name
                                ? (
                                    <span className="text-sm">{item.teacher.name}</span>
                                  )
                                : (
                                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                  )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.classSubject.coefficient}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">
                                {item.classSubject.hoursPerWeek}
                                h
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                // eslint-disable-next-line no-alert
                                  if (confirm(`Remove ${item.subject.name} from class?`)) {
                                    deleteMutation.mutate({ classId, subjectId: item.subject.id })
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <ClassSubjectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          classId={classId}
          className={className}
        />

        <SubjectCopyDialog
          open={isCopyDialogOpen}
          onOpenChange={setIsCopyDialogOpen}
          targetClassId={classId}
          targetClassName={className}
        />
      </Card>
    </div>
  )
}
