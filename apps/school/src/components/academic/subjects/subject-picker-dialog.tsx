import { IconBook } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'
import { SubjectPickerFilters } from './subject-picker-filters'
import { SubjectPickerFooter } from './subject-picker-footer'
import { SubjectPickerGrid } from './subject-picker-grid'
import { SubjectPickerProvider } from './subject-picker-provider'

interface SubjectPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId?: string
}

export function SubjectPickerDialog({
  open,
  onOpenChange,
  schoolYearId,
}: SubjectPickerDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 flex max-h-[90vh] max-w-2xl flex-col
        overflow-hidden p-0 backdrop-blur-xl
        sm:max-w-3xl
      "
      >
        <SubjectPickerProvider open={open} onOpenChange={onOpenChange} schoolYearId={schoolYearId}>
          <div className="border-border/10 border-b p-6 pb-4">
            <DialogHeader>
              <div className="mb-1 flex items-center gap-3">
                <div className="
                  bg-primary/10 flex h-10 w-10 items-center justify-center
                  rounded-xl
                "
                >
                  <IconBook className="text-primary h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{t.academic.subjects.picker.title()}</DialogTitle>
                  <DialogDescription className="
                    text-xs font-semibold tracking-wider uppercase opacity-70
                  "
                  >
                    {t.academic.subjects.picker.description()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <SubjectPickerFilters />

          <div className="scrollbar-none flex-1 overflow-y-auto px-6 py-4">
            <SubjectPickerGrid />
          </div>

          <SubjectPickerFooter />
        </SubjectPickerProvider>
      </DialogContent>
    </Dialog>
  )
}
