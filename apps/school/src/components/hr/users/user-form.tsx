import type { UserFormData } from '@/schemas/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconLoader2, IconUserPlus } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { userCreateSchema } from '@/schemas/user'
import { createNewUser, updateExistingUser } from '@/school/functions/users'
import { UserBasicInfoSection } from './user-basic-info-section'
import { UserRolesSection } from './user-roles-section'

interface UserFormProps {
  user?: UserFormData & { id: string }
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const isEditing = !!user

  const form = useForm<UserFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatarUrl: user.avatarUrl || '',
          status: user.status,
          roleIds: user.roleIds || [],
        }
      : {
          name: '',
          email: '',
          phone: '',
          avatarUrl: '',
          status: 'active',
          roleIds: [],
        },
  })

  const { handleSubmit } = form

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.users.create,
    mutationFn: async (data: UserFormData) => createNewUser({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(t.hr.users.createSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      const errorMessage = error.message || t.errors.generic()
      if (errorMessage.includes('Email already exists'))
        toast.error(t.hr.users.emailAlreadyExists())
      else toast.error(errorMessage)
    },
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.users.update,
    mutationFn: async (data: UserFormData) =>
      updateExistingUser({
        data: { userId: user!.id, data },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', user!.id] })
      toast.success(t.hr.users.updateSuccess())
      onSuccess?.()
    },
    onError: (error: Error) => {
      const errorMessage = error.message || t.errors.generic()
      if (errorMessage.includes('Email already exists'))
        toast.error(t.hr.users.emailAlreadyExists())
      else toast.error(errorMessage)
    },
  })

  const onSubmit = (data: UserFormData) => {
    if (isEditing)
      updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <UserBasicInfoSection form={form} isEditing={isEditing} />
      <UserRolesSection form={form} isPending={isPending} />

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSuccess?.()}
          className="
            hover:bg-muted
            rounded-xl px-6 font-medium
          "
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="
            shadow-primary/20 min-w-[140px] rounded-xl px-8 font-semibold
            shadow-lg transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          {isPending
            ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )
            : isEditing
              ? (
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                )
              : (
                  <IconUserPlus className="mr-2 h-4 w-4" />
                )}
          {isEditing ? t.common.save() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
