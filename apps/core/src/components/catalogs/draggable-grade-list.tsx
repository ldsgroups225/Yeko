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
import { IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

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
      className="
        hover:bg-accent/50
        bg-background flex items-center justify-between rounded-lg border p-4
        transition-colors
      "
    >
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          className="
            cursor-grab touch-none
            active:cursor-grabbing
          "
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="text-muted-foreground h-5 w-5" />
        </button>
        <div className="
          bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg
        "
        >
          <IconGripVertical className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{grade.name}</h3>
          <div className="mt-1 flex items-center gap-2">
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
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete({ id: grade.id, name: grade.name })}
        >
          <IconTrash className="h-4 w-4" />
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
