import { createFileRoute } from '@tanstack/react-router'
import { PreInscriptionWizard } from '@/components/pre-inscription'

export const Route = createFileRoute('/pre-inscription')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PreInscriptionWizard />
}
