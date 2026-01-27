import { IconAlertCircle, IconBook, IconCheck, IconHome, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { Switch } from '@workspace/ui/components/switch'
import { Textarea } from '@workspace/ui/components/textarea'
import { cn } from '@workspace/ui/lib/utils'
import { useState } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

interface SessionFinalizationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendanceStats: {
    present: number
    absent: number
    late: number
  }
  participationStats: {
    totalStudents: number
    participatedCount: number
    participationRate: string
  }
  onFinalize: (data: {
    homework: HomeworkData | null
    lessonCompleted: boolean
  }) => void
  isSubmitting: boolean
}

interface HomeworkData {
  title: string
  description: string
  dueDate: string
}

export function SessionFinalizationSheet({
  open,
  onOpenChange,
  attendanceStats,
  participationStats,
  onFinalize,
  isSubmitting,
}: SessionFinalizationSheetProps) {
  const { LL } = useI18nContext()

  const [showHomeworkForm, setShowHomeworkForm] = useState(false)
  const [homeworkTitle, setHomeworkTitle] = useState('')
  const [homeworkDescription, setHomeworkDescription] = useState('')
  const [homeworkDueDate, setHomeworkDueDate] = useState('')
  const [lessonCompleted, setLessonCompleted] = useState(true)

  const handleFinalize = () => {
    const homework: HomeworkData | null = showHomeworkForm && homeworkTitle.trim()
      ? {
          title: homeworkTitle.trim(),
          description: homeworkDescription.trim(),
          dueDate: homeworkDueDate,
        }
      : null

    onFinalize({ homework, lessonCompleted })
  }

  const resetForm = () => {
    setShowHomeworkForm(false)
    setHomeworkTitle('')
    setHomeworkDescription('')
    setHomeworkDueDate('')
    setLessonCompleted(true)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen)
          resetForm()
        onOpenChange(isOpen)
      }}
    >
      <SheetContent side="bottom" className="rounded-t-[2.5rem] p-0 overflow-hidden border-t-0 bg-background max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <SheetHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-black">
              {LL.session.finalize()}
            </SheetTitle>
            <SheetDescription>
              {LL.session.confirmLessonProgress()}
            </SheetDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
            {LL.session.completed()}
          </Badge>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Session Summary */}
          <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-4">
            <h4 className="font-black text-foreground flex items-center gap-2">
              <IconBook className="w-5 h-5 text-primary" />
              Résumé de la session
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {LL.session.statsPresent()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-emerald-500">{attendanceStats.present}</span>
                  <span className="text-sm text-muted-foreground">élèves</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {LL.session.statsAbsent()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-red-500">{attendanceStats.absent}</span>
                  <span className="text-sm text-muted-foreground">élèves</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {LL.session.statsLate()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-amber-500">{attendanceStats.late}</span>
                  <span className="text-sm text-muted-foreground">élèves</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {LL.session.statsParticipated()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-primary">{participationStats.participatedCount}</span>
                  <span className="text-sm text-muted-foreground">
                    /
                    {participationStats.totalStudents}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Homework Section */}
          <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-foreground flex items-center gap-2">
                <IconHome className="w-5 h-5 text-primary" />
                {LL.session.homeworkQuestion()}
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={showHomeworkForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowHomeworkForm(true)}
                  className="h-8"
                >
                  <IconCheck className="w-4 h-4 mr-1" />
                  Oui
                </Button>
                <Button
                  variant={!showHomeworkForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowHomeworkForm(false)}
                  className="h-8"
                >
                  <IconX className="w-4 h-4 mr-1" />
                  Non
                </Button>
              </div>
            </div>

            {showHomeworkForm && (
              <div className="space-y-4 pt-2 border-t border-border/40">
                <div className="space-y-2">
                  <Label htmlFor="homework-title">{LL.homework.titleField()}</Label>
                  <Input
                    id="homework-title"
                    value={homeworkTitle}
                    onChange={e => setHomeworkTitle(e.target.value)}
                    placeholder="Ex: Exercices page 42..."
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homework-description">{LL.homework.description()}</Label>
                  <Textarea
                    id="homework-description"
                    value={homeworkDescription}
                    onChange={e => setHomeworkDescription(e.target.value)}
                    placeholder="Instructions pour les élèves..."
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homework-duedate">{LL.homework.dueDate()}</Label>
                  <Input
                    id="homework-duedate"
                    type="date"
                    value={homeworkDueDate}
                    onChange={e => setHomeworkDueDate(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lesson Completion */}
          <div className="rounded-2xl bg-muted/30 border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-black text-foreground">
                  {LL.session.lessonCompleted()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {lessonCompleted ? LL.session.lessonCompletedYes() : LL.session.lessonCompletedNo()}
                </p>
              </div>
              <Switch
                checked={lessonCompleted}
                onCheckedChange={setLessonCompleted}
              />
            </div>
          </div>

          {/* Warning if homework form is open but empty */}
          {showHomeworkForm && !homeworkTitle.trim() && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <IconAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                Vous avez indiqué vouloir assigner un devoir mais le titre est vide. Le devoir ne sera pas enregistré si vous finalisez maintenant.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              className={cn(
                'w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20',
              )}
              onClick={handleFinalize}
              disabled={isSubmitting}
            >
              {isSubmitting ? LL.common.loading() : LL.session.finalize()}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl font-semibold"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {LL.common.cancel()}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
