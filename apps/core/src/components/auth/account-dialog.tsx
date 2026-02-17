import { Dialog, DialogTrigger } from '@workspace/ui/components/dialog'
import { lazy, Suspense } from 'react'
import { authClient } from '@/lib/auth-client'

const AccountDialogContent = lazy(() => import('./account-dialog-content'))

interface AccountDialogProps {
  children: React.ReactElement
}

export function AccountDialog({ children }: AccountDialogProps) {
  const { data: session } = authClient.useSession()

  if (!session) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger render={children} />
      <Suspense fallback={null}>
        <AccountDialogContent />
      </Suspense>
    </Dialog>
  )
}
