import type { UseFormReturn } from 'react-hook-form'
import type { UserFormData } from '@/schemas/user'
import { IconShield } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { RoleSelector } from '@/components/hr/users/role-selector'
import { useTranslations } from '@/i18n'

interface UserRolesSectionProps {
  form: UseFormReturn<UserFormData>
  isPending: boolean
}

export function UserRolesSection({ form, isPending }: UserRolesSectionProps) {
  const t = useTranslations()
  const { watch, setValue } = form

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-xl p-8 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconShield className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-serif font-semibold">{t.hr.users.roleAssignment()}</h2>
      </div>
      <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
        {t.hr.users.roleAssignmentDescription()}
        {' '}
        (
        {t.common.optional()}
        )
      </p>
      <div className="space-y-4">
        {t.hr.common.roles()}
        <RoleSelector
          selectedRoleIds={watch('roleIds') || []}
          onChange={roleIds => setValue('roleIds', roleIds, { shouldValidate: true })}
          disabled={isPending}
        />
      </div>
    </motion.div>
  )
}
