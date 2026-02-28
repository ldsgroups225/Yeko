import type { ClassroomItem } from './types'
import { IconEye, IconStack2, IconUsers } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { AnimatePresence, motion } from 'motion/react'

interface ClassroomsTableMobileViewProps {
  data: ClassroomItem[]
}

export function ClassroomsTableMobileView({
  data,
}: ClassroomsTableMobileViewProps) {
  const navigate = useNavigate()

  return (
    <div className="
      space-y-4 p-4
      md:hidden
    "
    >
      <AnimatePresence>
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="
              bg-card/50 border-border/40 space-y-3 rounded-2xl border p-4
              backdrop-blur-md
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="
                  text-muted-foreground bg-muted/20 rounded-md px-2 py-1
                  font-mono text-xs font-bold
                "
                >
                  {item.code}
                </div>
                <Badge
                  variant={item.status === 'active' ? 'default' : 'secondary'}
                  className="rounded-md text-[10px] capitalize"
                >
                  {item.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground -mt-2 -mr-2 h-8 w-8 rounded-lg"
                onClick={() =>
                  navigate({
                    to: `/spaces/classrooms/${item.id}`,
                  })}
              >
                <IconEye className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <div className="text-lg font-bold">{item.name}</div>
              <Badge
                variant="outline"
                className="mt-1 text-xs font-medium capitalize"
              >
                {item.type}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="
                bg-muted/20 flex flex-col items-center justify-center rounded-xl
                p-2 text-center
              "
              >
                <IconUsers className="text-muted-foreground mb-1 h-4 w-4" />
                <span className="text-muted-foreground text-xs">Capacité</span>
                <span className="font-bold">{item.capacity}</span>
              </div>
              <div className="
                bg-muted/20 flex flex-col items-center justify-center rounded-xl
                p-2 text-center
              "
              >
                <IconStack2 className="text-muted-foreground mb-1 h-4 w-4" />
                <span className="text-muted-foreground text-xs">Classes</span>
                <span className="font-bold">
                  {item.assignedClassesCount ?? 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
