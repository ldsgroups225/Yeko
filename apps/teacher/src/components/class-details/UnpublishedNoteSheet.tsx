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
      <SheetContent
        side="bottom"
        className="
          bg-background mx-auto max-w-2xl overflow-hidden rounded-t-[2.5rem]
          border-t-0 p-0
        "
      >
        <SheetHeader className="
          border-border/40 flex flex-row items-center justify-between border-b
          p-6 pb-4
        "
        >
          <div className="space-y-1">
            <SheetTitle className="text-xl font-black">
              {LL.grades.draftTitle()}
            </SheetTitle>
            <SheetDescription>
              {LL.grades.draftSubtitle()}
            </SheetDescription>
          </div>
          <Badge
            variant="outline"
            className="
              border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px]
              font-bold tracking-widest text-amber-600 uppercase
            "
          >
            {LL.grades.pendingBadge()}
          </Badge>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Note Metadata Card */}
          <div className="
            bg-muted/30 border-border/50 space-y-4 rounded-2xl border p-4
          "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="
                  bg-primary/10 text-primary flex h-10 w-10 items-center
                  justify-center rounded-xl
                "
                >
                  <IconBook className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-foreground font-black">{note.title}</h4>
                  <p className="
                    text-muted-foreground text-xs font-bold tracking-wider
                    uppercase
                  "
                  >
                    {String((LL.grades[note.type as keyof TranslationFunctions['grades']] as () => string)?.() || note.type)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-foreground block text-lg font-black">
                  {LL.grades.coeff()}
                  {' '}
                  {note.weight}
                </span>
                <span className="
                  text-muted-foreground text-xs font-bold uppercase
                "
                >
                  {LL.grades.outOf()}
                  {' '}
                  {note.totalPoints || 20}
                </span>
              </div>
            </div>

            <div className="
              border-border/40 grid grid-cols-2 gap-3 border-t pt-4
            "
            >
              <div className="space-y-1">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.grades.participations()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-xl font-black">{participatedCount}</span>
                  <span className="text-muted-foreground text-sm font-bold">
                    /
                    {totalStudents}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="
                  text-muted-foreground text-[10px] font-black tracking-widest
                  uppercase
                "
                >
                  {LL.grades.missing()}
                </span>
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
              className="
                shadow-primary/20 h-14 w-full rounded-2xl text-lg font-black
                shadow-xl
              "
              onClick={onResume}
            >
              <IconEdit className="mr-3 h-5 w-5" />
              {LL.grades.resumeEntry()}
            </Button>

            <Button
              variant="outline"
              className={cn(
                'h-14 w-full rounded-2xl text-lg font-black',
                isComplete
                  ? `
                    border-emerald-500/30 bg-emerald-500/10 text-emerald-600
                    hover:bg-emerald-500/20
                  `
                  : `
                    border-amber-500/30 bg-amber-500/10 text-amber-600
                    hover:bg-amber-500/20
                  `,
              )}
              onClick={onPublish}
              disabled={isPublishing}
            >
              <IconPlayerPlay className="mr-3 h-5 w-5" />
              {isPublishing ? LL.grades.publishing() : LL.grades.publishDraft()}
            </Button>

            {!isComplete && (
              <div className="
                flex items-start gap-3 rounded-xl border border-amber-500/10
                bg-amber-500/5 p-4
              "
              >
                <IconAlertCircle className="
                  mt-0.5 h-5 w-5 shrink-0 text-amber-500
                "
                />
                <p className="
                  text-xs leading-relaxed font-medium text-amber-700/80
                "
                >
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
