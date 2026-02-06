import type { CreateSchoolInput } from '@/schemas/school'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { SchoolForm } from '@/components/schools/school-form'
import { createSchoolMutationOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

export const Route = createFileRoute('/_auth/app/schools/create')({
  component: CreateSchool,
})

function CreateSchool() {
  const navigate = useNavigate()
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  // Set up mutation for creating school
  const createSchoolMutation = useMutation({
    ...createSchoolMutationOptions,
    onSuccess: (data) => {
      const schoolData = data
      logger.info('School created successfully', {
        schoolId: schoolData.id,
        schoolName: schoolData.name,
        action: 'create_school_success',
        timestamp: new Date().toISOString(),
      })

      // Invalidate schools list cache
      queryClient.invalidateQueries({ queryKey: ['schools'] })

      // Navigate back to schools list
      navigate({ to: '/app/schools' })
    },
    onError: (error: unknown) => {
      const message = parseServerFnError(error, 'Une erreur est survenue lors de la création de l\'école')
      toast.error(message)
      console.error('School creation failed:', error)
    },
  })

  // Handle form submission
  const onSubmit = async (data: CreateSchoolInput) => {
    try {
      await createSchoolMutation.mutateAsync(data)
    }
    catch {
      // Error is handled by the mutation's onError callback
    }
  }

  useEffect(() => {
    logger.info('Create school page viewed', {
      page: 'schools-create',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/app/schools' })}
          className="h-8 w-8"
        >
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une École</h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle école partenaire à l'écosystème Yeko
          </p>
        </div>
      </div>

      {/* Error Display */}
      {!!createSchoolMutation.error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {parseServerFnError(createSchoolMutation.error, 'Une erreur est survenue lors de la création de l\'école')}
          </AlertDescription>
        </Alert>
      )}

      <SchoolForm
        onSubmit={onSubmit}
        isSubmitting={createSchoolMutation.isPending}
        mode="create"
        onCancel={() => navigate({ to: '/app/schools' })}
      />
    </div>
  )
}
