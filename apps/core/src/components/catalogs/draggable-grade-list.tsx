import type { DragEndEvent } from '@dnd-kit/core'
import type { Grade } from '@repo/data-ops'
import {
  closestCenter,
  DndContext,

  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DraggableGradeListProps {
  grades: Grade[]
  onReorder: (grades: Grade[]) => void
  onEdit: (gradeId: string) => void
  onDelete: (grade: { id: string, name: string }) => void
}

function SortableGradeItem({
  grade,
  onEdit,
  onDelete,
}: {
  grade: Grade
  onEdit: (id: string) => void
  onDelete: (grade: { id: string, name: string }) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grade.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-background"
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
          <GripVertical className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold">{grade.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {grade.code}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Ordre:
              {' '}
              {grade.order}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(grade.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete({ id: grade.id, name: grade.name })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function DraggableGradeList({
  grades,
  onReorder,
  onEdit,
  onDelete,
}: DraggableGradeListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = grades.findIndex(g => g.id === active.id)
      const newIndex = grades.findIndex(g => g.id === over.id)

      const reorderedGrades = arrayMove(grades, oldIndex, newIndex).map((grade, index) => ({
        ...grade,
        order: index + 1,
      }))

      onReorder(reorderedGrades)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={grades.map(g => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {grades.map(grade => (
            <SortableGradeItem
              key={grade.id}
              grade={grade}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
