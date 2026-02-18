import { IconChevronDown } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { Input } from '@workspace/ui/components/input'
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@workspace/ui/components/number-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, m as motion } from 'motion/react'
import { Suspense } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

interface GradeEntryControlsProps {
  isEntryMode: boolean
  isMetaExpanded: boolean
  setIsMetaExpanded: (open: boolean) => void
  noteType: 'quizzes' | 'tests' | 'level_tests'
  setNoteType: (type: 'quizzes' | 'tests' | 'level_tests') => void
  noteTitle: string
  setNoteTitle: (title: string) => void
  weight: number
  setWeight: (weight: number) => void
  gradeOutOf: number
  setGradeOutOf: (outOf: number) => void
  teacherSubjects: Array<{ id: string, name: string }>
  selectedSubjectId: string | null
  setSelectedSubjectId: (id: string) => void
}

export function GradeEntryControls({
  isEntryMode,
  isMetaExpanded,
  setIsMetaExpanded,
  noteType,
  setNoteType,
  noteTitle,
  setNoteTitle,
  weight,
  setWeight,
  gradeOutOf,
  setGradeOutOf,
  teacherSubjects,
  selectedSubjectId,
  setSelectedSubjectId,
}: GradeEntryControlsProps) {
  const { LL } = useI18nContext()

  return (
    <AnimatePresence>
      {isEntryMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4"
        >
          <Collapsible open={isMetaExpanded} onOpenChange={setIsMetaExpanded}>
            <div className="rounded-2xl bg-muted/20 border border-border/50 overflow-hidden shadow-sm">
              <CollapsibleTrigger
                className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground text-left">
                    {teacherSubjects.length > 0 && selectedSubjectId && (
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs font-bold text-muted-foreground">
                          {teacherSubjects.find(s => s.id === selectedSubjectId)?.name}
                        </span>
                      </div>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 text-[10px] font-bold uppercase bg-primary/5 border-primary/20 text-primary">
                      {LL.grades[noteType]()}
                    </Badge>
                    <span className="text-sm font-black text-foreground">
                      {noteTitle || LL.grades.noDescription()}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      C.
                      {weight}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      /
                      {gradeOutOf}
                    </span>
                  </div>
                </div>
                <IconChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground transition-transform duration-300',
                    isMetaExpanded && 'rotate-180',
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4 border-t border-border/40 bg-muted/10">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mt-4">
                    {/* Evaluation Type */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 truncate block">
                        {LL.grades.nature()}
                      </label>
                      <Suspense fallback={<Skeleton className="h-11 w-full" />}>
                        <Select
                          value={noteType}
                          onValueChange={val => setNoteType(val as 'quizzes' | 'tests' | 'level_tests')}
                        >
                          <SelectTrigger className="w-full h-11! rounded-xl bg-background border-border/50 font-semibold px-3 overflow-hidden">
                            <SelectValue placeholder={LL.grades.selectType()}>
                              {noteType && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2 h-5">
                                    {noteType === 'quizzes'
                                      ? LL.grades.quizzes()
                                      : noteType === 'tests'
                                        ? LL.grades.tests()
                                        : LL.grades.level_tests()}
                                  </Badge>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quizzes">{LL.grades.quizzes()}</SelectItem>
                            <SelectItem value="tests">{LL.grades.tests()}</SelectItem>
                            <SelectItem value="level_tests">{LL.grades.level_tests()}</SelectItem>
                          </SelectContent>
                        </Select>
                      </Suspense>
                    </div>

                    {/* Weight, Barème & Subject Group */}
                    <div className="flex-[2] flex flex-row items-end gap-2">
                      <div className="w-20 shrink-0 space-y-1.5">
                        <label
                          htmlFor="note-weight-input"
                          className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                        >
                          Coef.
                        </label>
                        <NumberField
                          id="note-weight-input"
                          min={1}
                          max={10}
                          value={weight}
                          onValueChange={val => setWeight(val || 1)}
                        >
                          <NumberFieldGroup className="h-11! rounded-xl bg-background border border-border/50 overflow-hidden">
                            <NumberFieldDecrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none cursor-pointer" />
                            <NumberFieldInput className="border-none h-full bg-transparent font-bold ring-0! shadow-none! text-center p-0" title={LL.grades.coeff()} />
                            <NumberFieldIncrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none cursor-pointer" />
                          </NumberFieldGroup>
                        </NumberField>
                      </div>

                      <div className="w-20 shrink-0 space-y-1.5">
                        <label
                          htmlFor="note-outof-input"
                          className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                        >
                          {LL.grades.grading()}
                        </label>
                        <NumberField
                          id="note-outof-input"
                          min={1}
                          max={100}
                          value={gradeOutOf}
                          onValueChange={val => setGradeOutOf(val || 20)}
                        >
                          <NumberFieldGroup className="h-11! rounded-xl bg-background border border-border/50 overflow-hidden">
                            <NumberFieldDecrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none cursor-pointer" />
                            <NumberFieldInput className="border-none h-full bg-transparent font-bold ring-0! shadow-none! text-center p-0" title={LL.grades.grading()} />
                            <NumberFieldIncrement className="border-none h-full w-8 bg-transparent hover:bg-muted/50 rounded-none cursor-pointer" />
                          </NumberFieldGroup>
                        </NumberField>
                      </div>

                      {teacherSubjects.length > 1 && (
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1 truncate block">
                            {LL.grades.subject()}
                          </label>
                          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
                            <Select
                              value={selectedSubjectId || ''}
                              onValueChange={val => val && setSelectedSubjectId(val)}
                            >
                              <SelectTrigger className="w-full h-11! rounded-xl bg-background border-border/50 font-semibold px-3 overflow-hidden">
                                <SelectValue placeholder={LL.grades.selectSubject()}>
                                  {selectedSubjectId && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2 h-5">
                                        {teacherSubjects.find(s => s.id === selectedSubjectId)?.name}
                                      </Badge>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {teacherSubjects.map(subject => (
                                  <SelectItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Suspense>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="note-description-input"
                      className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1"
                    >
                      {LL.grades.description()}
                    </label>
                    <Input
                      id="note-description-input"
                      value={noteTitle}
                      onChange={e => setNoteTitle(e.target.value)}
                      placeholder={LL.grades.egInterro1()}
                      className="h-11 rounded-xl bg-background border-border/50 text-sm"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
