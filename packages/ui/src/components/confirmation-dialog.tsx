'use client'

import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
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
} from '@workspace/ui/components/alert-dialog'
import { cn } from '@workspace/ui/lib/utils'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  confirmLabel?: string // Alias for confirmText
  cancelText?: string
  isLoading?: boolean
  variant?: 'default' | 'destructive'
}

function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmer',
  description = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText,
  confirmLabel,
  cancelText = 'Annuler',
  isLoading = false,
  variant = 'default',
}: ConfirmationDialogProps) {
  const finalConfirmText = confirmText || confirmLabel || 'Confirmer'
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === 'destructive' && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <IconAlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          )}
          {variant === 'default' && <AlertDialogTitle>{title}</AlertDialogTitle>}
          <AlertDialogDescription className={variant === 'destructive' ? 'pt-2' : ''}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === 'destructive' &&
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {finalConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { ConfirmationDialog }
