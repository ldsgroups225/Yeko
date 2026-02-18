import { createFileRoute } from '@tanstack/react-router'
import { ClassDetailPage } from '@/components/class-details/ClassDetailPage'

export const Route = createFileRoute('/_auth/app/schools/$schoolId/class/$classId')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      timetableSessionId: (search.timetableSessionId as string) || undefined,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { schoolId, classId } = Route.useParams()
  const { timetableSessionId } = Route.useSearch()

  return (
    <ClassDetailPage
      schoolId={schoolId}
      classId={classId}
      timetableSessionId={timetableSessionId}
    />
  )
}
