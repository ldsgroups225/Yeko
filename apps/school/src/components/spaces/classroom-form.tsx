import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
      toast.success(isEditing ? 'Classroom updated' : 'Classroom created')
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save classroom')
    },
  })

  const onSubmit = (data: ClassroomFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input id="code" {...register('code')} />
          {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select value={watch('type')} onValueChange={v => setValue('type', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="gym">Gym</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="auditorium">Auditorium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input id="floor" {...register('floor')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="building">Building</Label>
          <Input id="building" {...register('building')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={watch('status')} onValueChange={v => setValue('status', v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
