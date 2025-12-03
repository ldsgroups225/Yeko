import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string // Optional text user must type to enable confirmation
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const [inputValue, setInputValue] = React.useState('')
  const isConfirmEnabled = confirmText ? inputValue === confirmText : true

  React.useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setInputValue('')
    }
  }, [open])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {confirmText && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Tapez
              {' '}
              <span className="font-mono font-semibold">{confirmText}</span>
              {' '}
              pour confirmer
            </Label>
            <Input
              id="confirm-text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={confirmText}
              disabled={isLoading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isConfirmEnabled) {
                  onConfirm()
                }
              }}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              if (isConfirmEnabled) {
                onConfirm()
              }
            }}
            disabled={!isConfirmEnabled || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
