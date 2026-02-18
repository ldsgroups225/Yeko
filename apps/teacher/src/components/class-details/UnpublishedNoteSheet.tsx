import type { TranslationFunctions } from '@/i18n/i18n-types'
import type { NoteWithDetails } from '@/lib/db/local-notes'
import { IconAlertCircle, IconBook, IconEdit, IconPlayerPlay } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import { cn } from '@workspace/ui/lib/utils'
import { useI18nContext } from '@/i18n/i18n-react'

interface UnpublishedNoteSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note: NoteWithDetails
  totalStudents: number
  onPublish: () => void
  onResume: () => void
  isPublishing: boolean
}

export function UnpublishedNoteSheet({
  open,
  onOpenChange,
  note,
  totalStudents,
  onPublish,
  onResume,
  isPublishing,
}: UnpublishedNoteSheetProps) {
  const { LL } = useI18nContext()
  const participatedCount = note.details.length
  const missingCount = totalStudents - participatedCount
  const isComplete = missingCount === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] p-0 overflow-hidden border-t-0 bg-background max-w-2xl mx-auto">
        <SheetHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-border/40">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-black">
              {LL.grades.draftTitle()}
            </SheetTitle>
            <SheetDescription>
              {LL.grades.draftSubtitle()}
            </SheetDescription>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
            {LL.grades.pendingBadge()}
          </Badge>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Note Metadata Card */}
          <div className="rounded-2xl bg-muted/30 border border-border/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconBook className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-foreground">{note.title}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {String((LL.grades[note.type as keyof TranslationFunctions['grades']] as () => string)?.() || note.type)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-foreground">
                  {LL.grades.coeff()}
                  {' '}
                  {note.weight}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {LL.grades.outOf()}
                  {' '}
                  {note.totalPoints || 20}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{LL.grades.participations()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{participatedCount}</span>
                  <span className="text-sm font-bold text-muted-foreground">
                    /
                    {totalStudents}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{LL.grades.missing()}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className={cn(
                    'text-xl font-black',
                    missingCount > 0 ? 'text-amber-500' : 'text-emerald-500',
                  )}
                  >
                    {missingCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              onClick={onResume}
            >
              <IconEdit className="w-5 h-5 mr-3" />
              {LL.grades.resumeEntry()}
            </Button>

            <Button
              variant="outline"
              className={cn(
                'w-full h-14 rounded-2xl font-black text-lg',
                isComplete
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
              )}
              onClick={onPublish}
              disabled={isPublishing}
            >
              <IconPlayerPlay className="w-5 h-5 mr-3" />
              {isPublishing ? LL.grades.publishing() : LL.grades.publishDraft()}
            </Button>

            {!isComplete && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <IconAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                  {LL.grades.missingStudentsWarningPublish({ count: missingCount })}
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
