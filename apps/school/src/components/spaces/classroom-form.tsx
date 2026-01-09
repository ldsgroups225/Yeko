import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
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
  classroom?: ClassroomFormData & { id: string }
  onSuccess?: () => void
}

export function ClassroomForm({ classroom, onSuccess }: ClassroomFormProps) {
  const t = useTranslations()
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
      toast.success(isEditing ? t.spaces.classrooms.updateSuccess() : t.spaces.classrooms.createSuccess())
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || t.spaces.classrooms.saveFailed())
    },
  })

  const onSubmit = (data: ClassroomFormData) => {
    mutation.mutate(data)
  }

  const inputClass = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'
  const selectTriggerClass = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors data-[placeholder]:text-muted-foreground'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            {t.spaces.classrooms.name()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="name" {...register('name')} placeholder={t.spaces.classrooms.namePlaceholder()} className={inputClass} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            {t.spaces.classrooms.code()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="code" {...register('code')} placeholder={t.spaces.classrooms.codePlaceholder()} className={`${inputClass} font-mono`} />
          {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            {t.spaces.classrooms.type()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Select value={watch('type')} onValueChange={v => setValue('type', v as 'regular' | 'lab' | 'gym' | 'library' | 'auditorium')}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
              <SelectItem value="regular" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.types.regular()}</SelectItem>
              <SelectItem value="lab" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.types.lab()}</SelectItem>
              <SelectItem value="gym" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.types.gym()}</SelectItem>
              <SelectItem value="library" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.types.library()}</SelectItem>
              <SelectItem value="auditorium" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.types.auditorium()}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            {t.spaces.classrooms.capacity()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} className={inputClass} />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.spaces.classrooms.floor()}</Label>
          <Input id="floor" {...register('floor')} placeholder={t.spaces.classrooms.floorPlaceholder()} className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="building" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.spaces.classrooms.building()}</Label>
          <Input id="building" {...register('building')} placeholder={t.spaces.classrooms.buildingPlaceholder()} className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            {t.common.status()}
            {' '}
            <span className="text-destructive">*</span>
          </Label>
          <Select value={watch('status')} onValueChange={v => setValue('status', v as 'active' | 'maintenance' | 'inactive')}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
              <SelectItem value="active" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.common.active()}</SelectItem>
              <SelectItem value="maintenance" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.spaces.classrooms.status.maintenance()}</SelectItem>
              <SelectItem value="inactive" className="rounded-lg cursor-pointer focus:bg-primary/10">{t.common.inactive()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.common.notes()}</Label>
        <Textarea id="notes" {...register('notes')} rows={3} placeholder={t.spaces.classrooms.notesPlaceholder()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors resize-none" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending} className="rounded-xl shadow-lg shadow-primary/20">
          {mutation.isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? t.common.update() : t.common.create()}
        </Button>
      </div>
    </form>
  )
}
