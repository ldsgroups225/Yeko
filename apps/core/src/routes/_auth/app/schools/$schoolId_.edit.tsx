import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { SchoolForm } from '@/components/schools/school-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { schoolQueryOptions, updateSchoolMutationOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/schools/$schoolId_/edit')({
  component: EditSchool,
})

function EditSchool() {
  const { schoolId } = Route.useParams()
  const navigate = useNavigate()
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  // Fetch school data
  const { data: school, isLoading, error } = useQuery(schoolQueryOptions(schoolId))

  // Set up mutation for updating school
  const updateSchoolMutation = useMutation({
    ...updateSchoolMutationOptions,
    onSuccess: (data: any) => {
      logger.info('School updated successfully', {
        schoolId: (data as any)?.id,
        schoolName: (data as any)?.name,
        action: 'update_school_success',
        timestamp: new Date().toISOString(),
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })

      // Navigate back to school details
      navigate({ to: '/app/schools/$schoolId', params: { schoolId } })
    },
    onError: (error: any) => {
      console.error('School update failed:', error)
    },
  })

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      await updateSchoolMutation.mutateAsync({ id: schoolId, ...data })
    }
    catch {
      // Error is handled by the mutation's onError callback
    }
  }

  useEffect(() => {
    logger.info('Edit school page viewed', {
      page: 'schools-edit',
      schoolId,
      timestamp: new Date().toISOString(),
    })
  }, [logger, schoolId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'École non trouvée'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/app/schools' })}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/app/schools/$schoolId', params: { schoolId } })}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'École</h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations de
            {' '}
            {school.name}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {updateSchoolMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {updateSchoolMutation.error.message || 'Une erreur est survenue lors de la mise à jour'}
          </AlertDescription>
        </Alert>
      )}

      <SchoolForm
        defaultValues={school}
        onSubmit={onSubmit}
        isSubmitting={updateSchoolMutation.isPending}
        mode="edit"
        onCancel={() => navigate({ to: '/app/schools/$schoolId', params: { schoolId } })}
      />
    </div>
  )
}
