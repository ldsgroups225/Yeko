import { IconBook, IconBuilding, IconCheck, IconPlus, IconUser, IconX } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useTranslations } from '@/i18n'
import { classSubjectsMutations, classSubjectsOptions } from '@/lib/queries/class-subjects'
import { classesOptions } from '@/lib/queries/classes'
import { teacherKeys } from '@/lib/queries/teachers'
import { cn } from '@/lib/utils'

export interface TeacherClass {
  id: string
  gradeName: string
  section: string
  seriesName?: string | null
  classroomName?: string | null
  isHomeroom: boolean
  subjects?: string[]
}

interface TeacherClassesProps {
  classes: TeacherClass[]
  isPending?: boolean
  teacherId?: string
}

interface ClassItem {
  class: {
    id: string
    gradeName: string
    section: string
  }
}

interface ClassSubjectItem {
  subjectId: string
  subjectName: string
}

export function TeacherClasses({ classes, isPending, teacherId }: TeacherClassesProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')

  const { data: allClasses } = useQuery(classesOptions.list({ status: 'active' }))
  const { data: classSubjects } = useQuery({
    ...classSubjectsOptions.list({ classId: selectedClassId }),
    enabled: !!selectedClassId,
  })

  const assignClassMutation = useMutation({
    ...classSubjectsMutations.assignTeacher,
    onSuccess: () => {
      if (teacherId) {
        queryClient.invalidateQueries({ queryKey: teacherKeys.classes(teacherId) })
      }
      setIsAddingClass(false)
      setSelectedClassId('')
      setSelectedSubjectId('')
      toast.success(t.hr.teachers.assignSuccess())
    },
    onError: (error: Error) => {
      toast.error(error.message || t.hr.teachers.assignError())
    },
  })

  const handleAssignClass = () => {
    if (!selectedClassId || !selectedSubjectId || !teacherId) return
    assignClassMutation.mutate({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      teacherId,
    })
  }

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['skeleton-1', 'skeleton-2', 'skeleton-3'].map(key => (
          <div key={key} className="h-32 animate-pulse rounded-2xl bg-card/40 border border-border/40" />
        ))}
      </div>
    )
  }

  const hasClasses = classes && classes.length > 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Add Card */}
      {teacherId && (
        <motion.div
          layout
          className={cn(
            "relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all",
            isAddingClass
              ? "border-primary/40 bg-primary/5 p-5 shadow-sm"
              : "border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center min-h-[160px]"
          )}
          onClick={!isAddingClass ? () => setIsAddingClass(true) : undefined}
        >
          {isAddingClass ? (
            <div className="flex flex-col gap-3 h-full">
              <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">{t.hr.teachers.newAssignment()}</h3>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <Select value={selectedClassId} onValueChange={(v) => setSelectedClassId(v || '')}>
                  <SelectTrigger className="w-full bg-background/50 border-primary/20 h-9">
                    <SelectValue placeholder={t.hr.teachers.classPlaceholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    {(allClasses as unknown as ClassItem[] | undefined)?.map((item) => (
                      <SelectItem key={item.class.id} value={item.class.id}>
                        {item.class.gradeName} {item.class.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSubjectId}
                  onValueChange={(v) => setSelectedSubjectId(v || '')}
                  disabled={!selectedClassId}
                >
                  <SelectTrigger className="w-full bg-background/50 border-primary/20 h-9">
                    <SelectValue placeholder={t.hr.teachers.subjectPlaceholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    {(classSubjects as unknown as ClassSubjectItem[] | undefined)?.map((sub) => (
                      <SelectItem key={sub.subjectId} value={sub.subjectId}>
                        {sub.subjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAssignClass()
                  }}
                  disabled={!selectedClassId || !selectedSubjectId || assignClassMutation.isPending}
                >
                  <IconCheck className="mr-2 size-3" />
                  {t.common.confirm()}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 rounded-xl hover:bg-destructive/10 hover:text-destructive h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddingClass(false)
                  }}
                >
                  <IconX className="mr-2 size-3" />
                  {t.common.cancel()}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <IconPlus className="size-5 text-primary" />
              </div>
              <span className="font-semibold text-primary text-sm">{t.hr.teachers.addClass()}</span>
            </>
          )}
        </motion.div>
      )}

      {hasClasses ? (
        classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Link
                  to="/classes/$classId"
                  params={{ classId: cls.id }}
                  className="text-lg font-bold tracking-tight hover:text-primary transition-colors"
                >
                  {cls.gradeName}
                  {' '}
                  {cls.section}
                  {cls.seriesName && (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      (
                      {cls.seriesName}
                      )
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconBuilding className="size-3.5" />
                  <span>{cls.classroomName || 'N/A'}</span>
                </div>
              </div>
              {cls.isHomeroom && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider">
                  <IconUser className="mr-1 size-3" />
                  Titulaire
                </Badge>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {cls.subjects?.map((subject: string) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="bg-secondary/30 text-xs font-medium px-2 py-0"
                >
                  <IconBook className="mr-1 size-3 opacity-60" />
                  {subject}
                </Badge>
              ))}
            </div>

            <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                to="/classes/$classId"
                params={{ classId: cls.id }}
                className="text-xs font-semibold text-primary/80 hover:text-primary"
              >
                Voir détails →
              </Link>
            </div>
          </motion.div>
        ))
      ) : (
        !isAddingClass && !teacherId && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-card/40 rounded-2xl border border-dashed border-border/40 backdrop-blur-sm">
            <IconBuilding className="mb-4 size-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">{t.hr.teachers.noClasses()}</h3>
            <p className="text-sm text-muted-foreground">{t.hr.teachers.noClassesDescription()}</p>
          </div>
        )
      )}
    </div>
  )
}
