import { IconCircleCheck } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { DialogFooter } from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'

interface AutoMatchResultViewProps {
  linked: number
  created: number
  onClose: () => void
}

export function AutoMatchResultView({ linked, created, onClose }: AutoMatchResultViewProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6">
        <IconCircleCheck className="h-12 w-12 text-success" />
        <h3 className="text-lg font-semibold">{t.students.autoMatchComplete()}</h3>
        <div className="text-center text-sm text-muted-foreground">
          <p>{t.students.autoMatchLinked({ count: linked })}</p>
          {created > 0 && <p>{t.students.autoMatchCreated({ count: created })}</p>}
        </div>
      </div>
      <DialogFooter><Button onClick={onClose}>{t.common.close()}</Button></DialogFooter>
    </div>
  )
}
