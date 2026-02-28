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
            <div className="
              bg-muted/20 border-border/50 overflow-hidden rounded-2xl border
              shadow-sm
            "
            >
              <CollapsibleTrigger
                className="
                  hover:bg-muted/30
                  group flex h-auto w-full cursor-pointer items-center
                  justify-between p-4 transition-colors
                "
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="
                    text-muted-foreground text-left text-[10px] font-black
                    tracking-widest uppercase
                  "
                  >
                    {teacherSubjects.length > 0 && selectedSubjectId && (
                      <div className="flex items-center gap-2">
                        <div className="
                          bg-muted-foreground/30 h-1 w-1 rounded-full
                        "
                        />
                        <span className="
                          text-muted-foreground text-xs font-bold
                        "
                        >
                          {teacherSubjects.find(s => s.id === selectedSubjectId)?.name}
                        </span>
                      </div>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="
                        bg-primary/5 border-primary/20 text-primary h-5
                        text-[10px] font-bold uppercase
                      "
                    >
                      {LL.grades[noteType]()}
                    </Badge>
                    <span className="text-foreground text-sm font-black">
                      {noteTitle || LL.grades.noDescription()}
                    </span>
                    <div className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                    <span className="
                      text-muted-foreground text-xs font-bold uppercase
                    "
                    >
                      C.
                      {weight}
                    </span>
                    <div className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                    <span className="
                      text-muted-foreground text-xs font-bold uppercase
                    "
                    >
                      /
                      {gradeOutOf}
                    </span>
                  </div>
                </div>
                <IconChevronDown
                  className={cn(
                    `
                      text-muted-foreground h-5 w-5 transition-transform
                      duration-300
                    `,
                    isMetaExpanded && 'rotate-180',
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="
                  border-border/40 bg-muted/10 space-y-4 border-t p-4 pt-0
                "
                >
                  <div className="
                    mt-4 flex flex-col items-stretch gap-3
                    sm:flex-row sm:items-end
                  "
                  >
                    {/* Evaluation Type */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <label className="
                        text-muted-foreground ml-1 block truncate text-[10px]
                        font-black tracking-widest uppercase
                      "
                      >
                        {LL.grades.nature()}
                      </label>
                      <Suspense fallback={<Skeleton className="h-11 w-full" />}>
                        <Select
                          value={noteType}
                          onValueChange={val => setNoteType(val as 'quizzes' | 'tests' | 'level_tests')}
                        >
                          <SelectTrigger className="
                            bg-background border-border/50 h-11! w-full
                            overflow-hidden rounded-xl px-3 font-semibold
                          "
                          >
                            <SelectValue placeholder={LL.grades.selectType()}>
                              {noteType && (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="
                                      bg-primary/10 text-primary
                                      border-primary/20 h-5 px-2 text-[10px]
                                      font-black tracking-widest uppercase
                                    "
                                  >
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
                    <div className="flex flex-[2] flex-row items-end gap-2">
                      <div className="w-20 shrink-0 space-y-1.5">
                        <label
                          htmlFor="note-weight-input"
                          className="
                            text-muted-foreground ml-1 text-[10px] font-black
                            tracking-widest uppercase
                          "
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
                          <NumberFieldGroup className="
                            bg-background border-border/50 h-11! overflow-hidden
                            rounded-xl border
                          "
                          >
                            <NumberFieldDecrement className="
                              hover:bg-muted/50
                              h-full w-8 cursor-pointer rounded-none border-none
                              bg-transparent
                            "
                            />
                            <NumberFieldInput
                              className="
                                h-full border-none bg-transparent p-0
                                text-center font-bold shadow-none! ring-0!
                              "
                              title={LL.grades.coeff()}
                            />
                            <NumberFieldIncrement className="
                              hover:bg-muted/50
                              h-full w-8 cursor-pointer rounded-none border-none
                              bg-transparent
                            "
                            />
                          </NumberFieldGroup>
                        </NumberField>
                      </div>

                      <div className="w-20 shrink-0 space-y-1.5">
                        <label
                          htmlFor="note-outof-input"
                          className="
                            text-muted-foreground ml-1 text-[10px] font-black
                            tracking-widest uppercase
                          "
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
                          <NumberFieldGroup className="
                            bg-background border-border/50 h-11! overflow-hidden
                            rounded-xl border
                          "
                          >
                            <NumberFieldDecrement className="
                              hover:bg-muted/50
                              h-full w-8 cursor-pointer rounded-none border-none
                              bg-transparent
                            "
                            />
                            <NumberFieldInput
                              className="
                                h-full border-none bg-transparent p-0
                                text-center font-bold shadow-none! ring-0!
                              "
                              title={LL.grades.grading()}
                            />
                            <NumberFieldIncrement className="
                              hover:bg-muted/50
                              h-full w-8 cursor-pointer rounded-none border-none
                              bg-transparent
                            "
                            />
                          </NumberFieldGroup>
                        </NumberField>
                      </div>

                      {teacherSubjects.length > 1 && (
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <label className="
                            text-muted-foreground ml-1 block truncate
                            text-[10px] font-black tracking-widest uppercase
                          "
                          >
                            {LL.grades.subject()}
                          </label>
                          <Suspense fallback={<Skeleton className="h-11 w-full" />}>
                            <Select
                              value={selectedSubjectId || ''}
                              onValueChange={val => val && setSelectedSubjectId(val)}
                            >
                              <SelectTrigger className="
                                bg-background border-border/50 h-11! w-full
                                overflow-hidden rounded-xl px-3 font-semibold
                              "
                              >
                                <SelectValue placeholder={LL.grades.selectSubject()}>
                                  {selectedSubjectId && (
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="
                                          bg-primary/10 text-primary
                                          border-primary/20 h-5 px-2 text-[10px]
                                          font-black tracking-widest uppercase
                                        "
                                      >
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
                      className="
                        text-muted-foreground ml-1 text-[10px] font-black
                        tracking-widest uppercase
                      "
                    >
                      {LL.grades.description()}
                    </label>
                    <Input
                      id="note-description-input"
                      value={noteTitle}
                      onChange={e => setNoteTitle(e.target.value)}
                      placeholder={LL.grades.egInterro1()}
                      className="
                        bg-background border-border/50 h-11 rounded-xl text-sm
                      "
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
