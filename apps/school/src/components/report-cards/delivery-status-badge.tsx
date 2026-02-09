import type { DeliveryMethod } from '@/schemas/report-card'
import { IconDeviceMobile, IconMail, IconMessage, IconPrinter } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@/lib/utils'
import { deliveryMethodLabels } from '@/schemas/report-card'

interface DeliveryStatusBadgeProps {
  method: DeliveryMethod
  className?: string
}

const methodVariants: Record<DeliveryMethod, string> = {
  email: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20',
  in_app: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20',
  sms: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  print: 'bg-muted text-muted-foreground hover:bg-muted/80 border-muted',
}

const methodIcons: Record<DeliveryMethod, React.ReactNode> = {
  email: <IconMail className="h-3 w-3" />,
  in_app: <IconDeviceMobile className="h-3 w-3" />,
  sms: <IconMessage className="h-3 w-3" />,
  print: <IconPrinter className="h-3 w-3" />,
}

export function DeliveryStatusBadge({ method, className }: DeliveryStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('gap-1', methodVariants[method], className)}
    >
      {methodIcons[method]}
      {deliveryMethodLabels[method]}
    </Badge>
  )
}
