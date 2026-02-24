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
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden flex flex-col">
        <SubjectPickerProvider open={open} onOpenChange={onOpenChange} schoolYearId={schoolYearId}>
          <div className="p-6 pb-4 border-b border-border/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconBook className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">{t.academic.subjects.picker.title()}</DialogTitle>
                  <DialogDescription className="text-xs font-semibold opacity-70 uppercase tracking-wider">
                    {t.academic.subjects.picker.description()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <SubjectPickerFilters />

          <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-none">
            <SubjectPickerGrid />
          </div>

          <SubjectPickerFooter />
        </SubjectPickerProvider>
      </DialogContent>
    </Dialog>
  )
}
