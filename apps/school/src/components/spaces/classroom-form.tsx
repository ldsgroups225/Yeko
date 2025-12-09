import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClassroom, updateClassroom } from '@/school/functions/classrooms'

const classroomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['regular', 'lab', 'gym', 'library', 'auditorium']),
  capacity: z.number().int().min(1).max(200),
  floor: z.string().optional(),
  building: z.string().optional(),
  status: z.enum(['active', 'maintenance', 'inactive']),
  notes: z.string().optional(),
})

type ClassroomFormData = z.infer<typeof classroomSchema>

interface ClassroomFormProps {
  classroom?: any
  onSuccess?: () => void
}

export function ClassroomForm({ classroom, onSuccess }: ClassroomFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEditing = !!classroom

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: classroom || {
      type: 'regular',
      capacity: 30,
      status: 'active',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ClassroomFormData) =>
      isEditing
        ? updateClassroom({ data: { id: classroom.id, updates: data } })
        : createClassroom({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast.success(isEditing ? t('spaces.classrooms.updateSuccess') : t('spaces.classrooms.createSuccess'))
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || t('spaces.classrooms.saveFailed'))
    },
  })

  const onSubmit = (data: ClassroomFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('spaces.classrooms.name')}
            {' '}
            *
          </Label>
          <Input id="name" {...register('name')} placeholder={t('spaces.classrooms.namePlaceholder')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">
            {t('spaces.classrooms.code')}
            {' '}
            *
          </Label>
          <Input id="code" {...register('code')} placeholder={t('spaces.classrooms.codePlaceholder')} />
          {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">
            {t('spaces.classrooms.type')}
            {' '}
            *
          </Label>
          <Select value={watch('type')} onValueChange={v => setValue('type', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">{t('spaces.classrooms.types.regular')}</SelectItem>
              <SelectItem value="lab">{t('spaces.classrooms.types.lab')}</SelectItem>
              <SelectItem value="gym">{t('spaces.classrooms.types.gym')}</SelectItem>
              <SelectItem value="library">{t('spaces.classrooms.types.library')}</SelectItem>
              <SelectItem value="auditorium">{t('spaces.classrooms.types.auditorium')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">
            {t('spaces.classrooms.capacity')}
            {' '}
            *
          </Label>
          <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">{t('spaces.classrooms.floor')}</Label>
          <Input id="floor" {...register('floor')} placeholder={t('spaces.classrooms.floorPlaceholder')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="building">{t('spaces.classrooms.building')}</Label>
          <Input id="building" {...register('building')} placeholder={t('spaces.classrooms.buildingPlaceholder')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            {t('common.status')}
            {' '}
            *
          </Label>
          <Select value={watch('status')} onValueChange={v => setValue('status', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('common.active')}</SelectItem>
              <SelectItem value="maintenance">{t('spaces.classrooms.status.maintenance')}</SelectItem>
              <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('common.notes')}</Label>
        <Textarea id="notes" {...register('notes')} rows={3} placeholder={t('spaces.classrooms.notesPlaceholder')} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t('common.update') : t('common.create')}
        </Button>
      </div>
    </form>
  )
}
