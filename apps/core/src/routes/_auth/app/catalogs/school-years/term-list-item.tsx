import type { FormEvent } from 'react'
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'

interface TermTemplate {
  id: string
  name: string
  type: 'trimester' | 'semester'
  order: number
}

interface TermListItemProps {
  term: TermTemplate
  isEditing: boolean
  editTermType: string
  setEditTermType: (val: string) => void
  onEdit: () => void
  onCancelEdit: () => void
  onUpdate: (e: FormEvent<HTMLFormElement>) => void
  onDelete: () => void
  isPending: boolean
}

export function TermListItem({
  term,
  isEditing,
  editTermType,
  setEditTermType,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  isPending,
}: TermListItemProps) {
  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
        <form onSubmit={onUpdate} className="flex items-center gap-2 flex-1">
          <Input name="name" defaultValue={term.name} className="w-40" />
          <Select
            name="type"
            value={editTermType}
            onValueChange={val => val && setEditTermType(val)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type">
                {editTermType === 'trimester' ? 'Trimestre' : editTermType === 'semester' ? 'Semestre' : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trimester">Trimestre</SelectItem>
              <SelectItem value="semester">Semestre</SelectItem>
            </SelectContent>
          </Select>
          <Input name="order" type="number" min="1" defaultValue={term.order} className="w-20" />
          <Button type="submit" size="sm" disabled={isPending}>
            <IconCheck className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
            <IconX className="h-4 w-4" />
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
          {term.order}
        </span>
        <span className="font-medium">{term.name}</span>
        <Badge variant="outline" className="text-xs">
          {term.type === 'trimester' ? 'Trimestre' : 'Semestre'}
        </Badge>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <IconEdit className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
