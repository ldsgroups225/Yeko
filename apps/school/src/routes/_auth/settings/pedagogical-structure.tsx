import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/settings/pedagogical-structure')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/settings/pedagogical-structure"!</div>
}
