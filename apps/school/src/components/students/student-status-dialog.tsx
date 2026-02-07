import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'

import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { useTranslations } from '@/i18n'

interface StudentStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: {
    id: string
    firstName: string
    lastName: string
    status: string
  }
  onConfirm: (status: string, reason?: string) => void
  isPending?: boolean
}

export function StudentStatusDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
  isPending,
}: StudentStatusDialogProps) {
  const t = useTranslations()
  const [status, setStatus] = useState(student?.status || 'active')
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(status, reason || undefined)
  }

  const requiresReason = status === 'transferred' || status === 'withdrawn'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.students.changeStatus()}</DialogTitle>
          <DialogDescription>
            {student ? `${student.firstName} ${student.lastName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t.students.newStatus()}</Label>
            <Select
              value={status}
              onValueChange={val => setStatus(val ?? '')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.students.newStatus()}>
                  {status === 'active' && t.students.statusActive()}
                  {status === 'graduated' && t.students.statusGraduated()}
                  {status === 'transferred' && t.students.statusTransferred()}
                  {status === 'withdrawn' && t.students.statusWithdrawn()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  {t.students.statusActive()}
                </SelectItem>
                <SelectItem value="graduated">
                  {t.students.statusGraduated()}
                </SelectItem>
                <SelectItem value="transferred">
                  {t.students.statusTransferred()}
                </SelectItem>
                <SelectItem value="withdrawn">
                  {t.students.statusWithdrawn()}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requiresReason && (
            <div className="space-y-2">
              <Label>{t.students.reason()}</Label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t.students.reasonPlaceholder()}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t.common.cancel()}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || (requiresReason && !reason)}
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.common.confirm()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
