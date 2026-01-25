import type { CreateSchoolInput } from '@/schemas/school'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { SchoolForm } from '@/components/schools/school-form'
import { schoolQueryOptions, updateSchoolMutationOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

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
    onSuccess: (data) => {
      logger.info('School updated successfully', {
        schoolId: (data)?.id,
        schoolName: (data)?.name,
        action: 'update_school_success',
        timestamp: new Date().toISOString(),
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })

      // Navigate back to school details
      navigate({ to: '/app/schools/$schoolId', params: { schoolId } })
    },
    onError: (error: unknown) => {
      const message = parseServerFnError(error, 'Une erreur est survenue lors de la mise à jour')
      toast.error(message)
      console.error('School update failed:', error)
    },
  })

  // Handle form submission
  const onSubmit = async (data: CreateSchoolInput) => {
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
    } as const)
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
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {parseServerFnError(error, 'École non trouvée')}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/app/schools' })}>
          Retour à la liste
        </Button>
      </div>
    )
  }

  const schoolData = school as any

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
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'École</h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations de
            {' '}
            {schoolData.name}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {!!updateSchoolMutation.error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {parseServerFnError(updateSchoolMutation.error, 'Une erreur est survenue lors de la mise à jour')}
          </AlertDescription>
        </Alert>
      )}

      <SchoolForm
        defaultValues={{
          name: schoolData.name,
          code: schoolData.code,
          address: schoolData.address || '',
          phone: schoolData.phone || '',
          email: schoolData.email || '',
          logoUrl: schoolData.logoUrl || '',
          status: schoolData.status,
          settings: schoolData.settings as Record<string, unknown>,
        }}
        onSubmit={onSubmit}
        isSubmitting={updateSchoolMutation.isPending}
        mode="edit"
        onCancel={() => navigate({ to: '/app/schools/$schoolId', params: { schoolId } })}
      />
    </div>
  )
}
