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
    <div className="md:hidden space-y-4 p-4">
      <AnimatePresence>
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                  {item.code}
                </div>
                <Badge
                  variant={item.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize rounded-md text-[10px]"
                >
                  {item.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg -mr-2 -mt-2 text-muted-foreground"
                onClick={() =>
                  navigate({
                    to: `/spaces/classrooms/${item.id}`,
                  })}
              >
                <IconEye className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <div className="font-bold text-lg">{item.name}</div>
              <Badge
                variant="outline"
                className="mt-1 font-medium text-xs capitalize"
              >
                {item.type}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center">
                <IconUsers className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Capacité</span>
                <span className="font-bold">{item.capacity}</span>
              </div>
              <div className="p-2 rounded-xl bg-muted/20 flex flex-col items-center justify-center text-center">
                <IconStack2 className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Classes</span>
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
