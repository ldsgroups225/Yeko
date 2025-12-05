'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
  isLoading?: boolean
}

export function StudentStatusDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
  isLoading,
}: StudentStatusDialogProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState(student?.status || 'active')
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(status, reason || undefined)
  }

  const requiresReason = status === 'transferred' || status === 'withdrawn'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('students.changeStatus')}</DialogTitle>
          <DialogDescription>
            {t('students.changeStatusDescription', {
              name: student ? `${student.firstName} ${student.lastName}` : '',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('students.newStatus')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('students.statusActive')}</SelectItem>
                <SelectItem value="graduated">{t('students.statusGraduated')}</SelectItem>
                <SelectItem value="transferred">{t('students.statusTransferred')}</SelectItem>
                <SelectItem value="withdrawn">{t('students.statusWithdrawn')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requiresReason && (
            <div className="space-y-2">
              <Label>{t('students.reason')}</Label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={t('students.reasonPlaceholder')}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || (requiresReason && !reason)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
