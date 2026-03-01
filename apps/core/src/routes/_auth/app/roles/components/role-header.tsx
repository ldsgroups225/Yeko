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
    <div className="
      flex flex-col justify-between gap-4
      md:flex-row md:items-center
    "
    >
      <div>
        <h1 className="
          from-foreground via-foreground to-foreground/40 bg-linear-to-br
          bg-clip-text text-4xl font-black tracking-tighter text-transparent
          md:text-5xl
        "
        >
          {title}
        </h1>
        <p className="
          text-muted-foreground/80 mt-2 max-w-2xl text-lg font-medium
        "
        >
          {subtitle}
        </p>
      </div>

      {canCreate && (
        <Button
          onClick={onCreate}
          size="lg"
          className="
            hover:shadow-primary/20
            rounded-full shadow-lg transition-all
          "
        >
          <IconPlus className="mr-2 h-5 w-5" />
          {createLabel}
        </Button>
      )}
    </div>
  )
}
