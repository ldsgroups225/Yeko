import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { schoolUsersQueryOptions } from '@/integrations/tanstack-query/school-users-options'
import {
  deleteSchoolMutationOptions,
  schoolQueryOptions,
  schoolsKeys,
} from '@/integrations/tanstack-query/schools-options'
import {
  removeUserMutationOptions,
  suspendUserMutationOptions,
} from '@/integrations/tanstack-query/user-actions-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'
import { SchoolHeader } from './$schoolId/school-header'
import { SchoolInfoTab } from './$schoolId/school-info-tab'
import { SchoolSettingsTab } from './$schoolId/school-settings-tab'
import { SchoolSupportTab } from './$schoolId/school-support-tab'
import { SchoolUsersTab } from './$schoolId/school-users-tab'
import { SchoolYearsTab } from './$schoolId/school-years-tab'

export const Route = createFileRoute('/_auth/app/schools/$schoolId')({
  component: SchoolDetails,
})

function SchoolDetails() {
  const { schoolId } = Route.useParams()
  const { logger } = useLogger()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { format: formatDate } = useDateFormatter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<{
    id: string
    name: string
  } | null>(null)
  const [selectedUserForRemove, setSelectedUserForRemove] = useState<{
    id: string
    name: string
  } | null>(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  const {
    data: school,
    isPending,
    error,
  } = useQuery(schoolQueryOptions(schoolId))
  const { data: usersData, isPending: usersPending } = useQuery(
    schoolUsersQueryOptions({ schoolId }),
  )

  // Process users data
  const users = usersData?.data?.users || []
  const adminCount = users.filter(user =>
    user.roles?.includes('school_director'),
  ).length
  const teacherCount = users.filter(user =>
    user.roles?.includes('teacher'),
  ).length
  const staffCount = users.filter(
    user =>
      user.roles?.includes('staff')
      || (user.roles
        && !user.roles.includes('school_director')
        && !user.roles.includes('teacher')),
  ).length

  // Delete mutation
  const deleteSchoolMutation = useMutation({
    ...deleteSchoolMutationOptions,
    onSuccess: () => {
      logger.info('School deleted successfully', {
        schoolId,
        action: 'delete_school_success',
        timestamp: new Date().toISOString(),
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: schoolsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['schoolUsers', { schoolId }] })

      // Navigate to schools list
      navigate({ to: '/app/schools' })
    },
    onError: (error: unknown) => {
      const message = parseServerFnError(
        error,
        'Une erreur est survenue lors de la suppression de l\'école',
      )
      toast.error(message)
      console.error('School deletion failed:', error)
    },
  })

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    ...suspendUserMutationOptions,
    onSuccess: () => {
      logger.info('User suspended successfully', {
        schoolId,
        userId: selectedUserForSuspend?.id,
        action: 'suspend_user_success',
        timestamp: new Date().toISOString(),
      })
      toast.success('Utilisateur suspendu avec succès')
      queryClient.invalidateQueries({ queryKey: ['schoolUsers', { schoolId }] })
      setSuspendDialogOpen(false)
      setSelectedUserForSuspend(null)
    },
    onError: (error: unknown) => {
      const message = parseServerFnError(
        error,
        'Une erreur est survenue lors de la suspension de l\'utilisateur',
      )
      toast.error(message)
      console.error('User suspension failed:', error)
    },
  })

  // Remove user mutation
  const removeUserMutation = useMutation({
    ...removeUserMutationOptions,
    onSuccess: () => {
      logger.info('User removed successfully', {
        schoolId,
        userId: selectedUserForRemove?.id,
        action: 'remove_user_success',
        timestamp: new Date().toISOString(),
      })
      toast.success('Utilisateur supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['schoolUsers', { schoolId }] })
      setRemoveDialogOpen(false)
      setSelectedUserForRemove(null)
    },
    onError: (error: unknown) => {
      const message = parseServerFnError(
        error,
        'Une erreur est survenue lors de la suppression de l\'utilisateur',
      )
      toast.error(message)
      console.error('User removal failed:', error)
    },
  })

  useEffect(() => {
    if (school) {
      logger.info('School details viewed', {
        schoolId,
        schoolName: school.name,
        timestamp: new Date().toISOString(),
      })
    }
  }, [school, schoolId, logger])

  if (isPending) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Info cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-destructive font-medium">
          {error?.message || 'École non trouvée'}
        </div>
        <Link to="/app/schools">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SchoolHeader
        school={school}
        formatDate={formatDate}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      {/* Content Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="years">Années Scolaires</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="support">Support & CRM</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <SchoolInfoTab school={school} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <SchoolUsersTab
            schoolId={schoolId}
            schoolName={school.name}
            users={users}
            isPending={usersPending}
            adminCount={adminCount}
            teacherCount={teacherCount}
            staffCount={staffCount}
            onSuspend={(user) => {
              setSelectedUserForSuspend(user)
              setSuspendDialogOpen(true)
            }}
            onRemove={(user) => {
              setSelectedUserForRemove(user)
              setRemoveDialogOpen(true)
            }}
          />
        </TabsContent>

        {/* Years Tab */}
        <TabsContent value="years">
          <SchoolYearsTab />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SchoolSettingsTab settings={school.settings} />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <SchoolSupportTab />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteSchoolMutation.mutate({ id: schoolId })}
        title="Supprimer l'école"
        description={`Êtes-vous sûr de vouloir supprimer l'école "${school.name}" ? Cette action est irréversible et supprimera toutes les données associées.`}
        isPending={deleteSchoolMutation.isPending}
      />

      {/* Suspend User Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={suspendDialogOpen}
        onOpenChange={(open) => {
          setSuspendDialogOpen(open)
          if (!open) {
            setSelectedUserForSuspend(null)
          }
        }}
        onConfirm={() => {
          if (selectedUserForSuspend)
            suspendUserMutation.mutate({ userId: selectedUserForSuspend.id, schoolId })
        }}
        title="Suspendre l'utilisateur"
        description={`Êtes-vous sûr de vouloir suspendre l'accès de "${selectedUserForSuspend?.name}" ?`}
        isPending={suspendUserMutation.isPending}
      />

      {/* Remove User Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={(open) => {
          setRemoveDialogOpen(open)
          if (!open) {
            setSelectedUserForRemove(null)
          }
        }}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedUserForRemove?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={() => {
          if (selectedUserForRemove)
            removeUserMutation.mutate({ userId: selectedUserForRemove.id, schoolId })
        }}
        isPending={removeUserMutation.isPending}
      />
    </div>
  )
}
