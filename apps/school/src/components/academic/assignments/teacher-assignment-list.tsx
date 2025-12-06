import { useQuery } from '@tanstack/react-query'
import { BookOpen, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TableSkeleton } from '@/components/hr/table-skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { teacherOptions } from '@/lib/queries/teachers'
import { generateUUID } from '@/utils/generateUUID'
import { TeacherAssignmentDialog } from './teacher-assignment-dialog'

export function TeacherAssignmentList() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [
    selectedTeacher,
    setSelectedTeacher,
  ] = useState<{ id: string, name: string } | null>(null)

  const { data, isLoading } = useQuery(teacherOptions.list({ search }))

  const teachers = data?.teachers || []

  if (isLoading) {
    return <TableSkeleton columns={4} rows={5} />
  }

  const hasNoData = teachers.length === 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('academic.assignments.listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('academic.assignments.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {hasNoData
            ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookOpen />
                    </EmptyMedia>
                    <EmptyTitle>{t('academic.assignments.noTeachers')}</EmptyTitle>
                    <EmptyDescription>
                      {search
                        ? t('academic.assignments.adjustSearch')
                        : t('academic.assignments.noTeachersForAssignment')}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('academic.assignments.teacher')}</TableHead>
                        <TableHead>
                          {t('academic.assignments.specialization')}
                        </TableHead>
                        <TableHead>
                          {t('academic.assignments.assignedSubjects')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('academic.assignments.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map(teacher => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage
                                  src={teacher.user.avatarUrl || undefined}
                                />
                                <AvatarFallback>
                                  {teacher.user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {teacher.user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {teacher.user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {teacher.specialization
                              ? (
                                  <Badge variant="outline">
                                    {teacher.specialization}
                                  </Badge>
                                )
                              : (
                                  <span className="text-muted-foreground text-sm">
                                    -
                                  </span>
                                )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(teacher.subjects as any[])?.length > 0
                                ? (
                                    (teacher.subjects as any[]).slice(0, 3).map((
                                      sub: string,
                                    ) => (

                                      <Badge
                                        key={`${teacher.id}-${sub}-${generateUUID()}`}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {sub}
                                      </Badge>
                                    ))
                                  )
                                : (
                                    <span className="text-muted-foreground text-xs italic">
                                      {t('academic.assignments.noSubjectsAssigned')}
                                    </span>
                                  )}
                              {(teacher.subjects as any[])?.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +
                                  {(teacher.subjects as any[]).length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedTeacher({
                                  id: teacher.id,
                                  name: teacher.user.name,
                                })}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              {t('academic.assignments.assign')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
        </CardContent>
      </Card>

      {selectedTeacher && (
        <TeacherAssignmentDialog
          open={!!selectedTeacher}
          onOpenChange={open => !open && setSelectedTeacher(null)}
          teacherId={selectedTeacher.id}
          teacherName={selectedTeacher.name}
        />
      )}
    </>
  )
}
