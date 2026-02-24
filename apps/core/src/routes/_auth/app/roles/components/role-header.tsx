import { IconPlus } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'

interface RoleHeaderProps {
  title: string
  subtitle: string
  onCreate: () => void
  canCreate: boolean
  createLabel: string
}

export function RoleHeader({ title, subtitle, onCreate, canCreate, createLabel }: RoleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-linear-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-muted-foreground/80 mt-2 text-lg font-medium max-w-2xl">
          {subtitle}
        </p>
      </div>

      {canCreate && (
        <Button onClick={onCreate} size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
          <IconPlus className="mr-2 h-5 w-5" />
          {createLabel}
        </Button>
      )}
    </div>
  )
}
