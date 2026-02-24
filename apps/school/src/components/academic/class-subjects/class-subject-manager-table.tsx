import { IconLoader2, IconTrash, IconUserPlus } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import { useTranslations } from '@/i18n'
import { useClassSubjectManager } from './class-subject-manager-context'

export function ClassSubjectManagerTable() {
  const t = useTranslations()
  const { state, actions } = useClassSubjectManager()
  const { subjects, teachers, isPending, isAssigning } = state
  const { setSubjectToDelete, setPendingAssignment } = actions

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.academic.classes.subject()}</TableHead>
            <TableHead>{t.academic.classes.teacher()}</TableHead>
            <TableHead className="text-center">{t.academic.classes.coeff()}</TableHead>
            <TableHead className="text-center">{t.academic.classes.hoursPerWeek()}</TableHead>
            <TableHead className="text-right">{t.common.actions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
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
                      {t.academic.classes.noSubjects()}
                    </TableCell>
                  </TableRow>
                )
              : (
                  subjects?.map(item => (
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
                        <Select
                          disabled={isAssigning}
                          value={item.teacher?.id || 'none'}
                          onValueChange={(val) => {
                            if (val && val !== 'none') {
                              const teacher = teachers.find(t => t.id === val)
                              if (teacher) {
                                setPendingAssignment({
                                  subjectId: item.subject.id,
                                  subjectName: item.subject.name,
                                  teacherId: val,
                                  teacherName: teacher.user.name,
                                })
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-[180px] text-xs border-none bg-transparent hover:bg-white/5 focus:ring-0 px-0 shadow-none">
                            <div className="flex items-center gap-2">
                              {isAssigning
                                ? (
                                    <IconLoader2 className="size-3 animate-spin" />
                                  )
                                : item.teacher?.name
                                  ? (
                                      <span className="font-medium">{item.teacher.name}</span>
                                    )
                                  : (
                                      <div className="flex items-center gap-2 text-muted-foreground italic">
                                        <IconUserPlus className="size-3" />
                                        <span>{t.academic.classes.unassigned()}</span>
                                      </div>
                                    )}
                            </div>
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur-xl bg-card/95 border-border/40">
                            <SelectItem value="none" disabled className="text-xs italic opacity-50">
                              {t.academic.classes.unassigned()}
                            </SelectItem>
                            {teachers.map(teacher => (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id}
                                className="text-xs font-medium focus:bg-primary/5 focus:text-primary"
                              >
                                {teacher.user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          onClick={() => setSubjectToDelete({ id: item.subject.id, name: item.subject.name })}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
        </TableBody>
      </Table>
    </div>
  )
}
