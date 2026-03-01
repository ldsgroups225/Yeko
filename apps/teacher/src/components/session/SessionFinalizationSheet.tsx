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
      <SheetContent
        side="bottom"
        className="
          bg-background mx-auto max-h-[90vh] max-w-2xl overflow-hidden
          overflow-y-auto rounded-t-[2.5rem] border-t-0 p-0
        "
      >
        <SheetHeader className="
          border-border/40 flex flex-row items-center justify-between border-b
          p-6 pb-4
        "
        >
          <div className="space-y-1">
            <SheetTitle className="text-xl font-black">
              {LL.session.finalize()}
            </SheetTitle>
            <SheetDescription>
              {LL.session.confirmLessonProgress()}
            </SheetDescription>
          </div>
          <Badge
            variant="outline"
            className="
              bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px]
              font-bold tracking-widest uppercase
            "
          >
            {LL.session.completed()}
          </Badge>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Session Summary */}
          <div className="
            bg-muted/30 border-border/50 space-y-4 rounded-2xl border p-4
          "
          >
            <h4 className="text-foreground flex items-center gap-2 font-black">
              <IconBook className="text-primary h-5 w-5" />
              {LL.session.summary()}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.session.statsPresent()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-emerald-500">{attendanceStats.present}</span>
                  <span className="text-muted-foreground text-sm">{LL.common.students()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.session.statsAbsent()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-red-500">{attendanceStats.absent}</span>
                  <span className="text-muted-foreground text-sm">{LL.common.students()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.session.statsLate()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-accent text-xl font-black">{attendanceStats.late}</span>
                  <span className="text-muted-foreground text-sm">{LL.common.students()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.session.statsParticipated()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl font-black">{participationStats.participatedCount}</span>
                  <span className="text-muted-foreground text-sm">
                    /
                    {participationStats.totalStudents}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Homework Section */}
          <div className="
            bg-muted/30 border-border/50 space-y-4 rounded-2xl border p-4
          "
          >
            <div className="flex items-center justify-between">
              <h4 className="text-foreground flex items-center gap-2 font-black">
                <IconHome className="text-primary h-5 w-5" />
                {LL.session.homeworkQuestion()}
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={showHomeworkForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowHomeworkForm(true)}
                  className="h-8"
                >
                  <IconCheck className="mr-1 h-4 w-4" />
                  {LL.common.yes()}
                </Button>
                <Button
                  variant={!showHomeworkForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowHomeworkForm(false)}
                  className="h-8"
                >
                  <IconX className="mr-1 h-4 w-4" />
                  {LL.common.no()}
                </Button>
              </div>
            </div>

            {showHomeworkForm && (
              <div className="border-border/40 space-y-4 border-t pt-2">
                <div className="space-y-2">
                  <Label htmlFor="homework-title">{LL.homework.titleField()}</Label>
                  <Input
                    id="homework-title"
                    value={homeworkTitle}
                    onChange={e => setHomeworkTitle(e.target.value)}
                    placeholder={LL.homework.titlePlaceholder()}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homework-description">{LL.homework.description()}</Label>
                  <Textarea
                    id="homework-description"
                    value={homeworkDescription}
                    onChange={e => setHomeworkDescription(e.target.value)}
                    placeholder={LL.homework.descriptionPlaceholder()}
                    className="resize-none rounded-xl"
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
          <div className="bg-muted/30 border-border/50 rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-foreground font-black">
                  {LL.session.lessonCompleted()}
                </h4>
                <p className="text-muted-foreground text-sm">
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
            <div className="
              bg-accent/5 border-accent/10 flex items-start gap-3 rounded-xl
              border p-4
            "
            >
              <IconAlertCircle className="text-accent mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-accent/80 text-xs leading-relaxed font-medium">
                {LL.session.homeworkWarning()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              className={cn(
                `
                  shadow-primary/20 h-14 w-full rounded-2xl text-lg font-black
                  shadow-xl
                `,
              )}
              onClick={handleFinalize}
              disabled={isSubmitting}
            >
              {isSubmitting ? LL.common.loading() : LL.session.finalize()}
            </Button>
            <Button
              variant="ghost"
              className="h-12 w-full rounded-2xl font-semibold"
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
