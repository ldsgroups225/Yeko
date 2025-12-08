import type { DeliveryMethod } from '@/schemas/report-card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { deliveryMethodLabels } from '@/schemas/report-card'
import { Mail, MessageSquare, Printer, Smartphone } from 'lucide-react'

interface DeliveryStatusBadgeProps {
  method: DeliveryMethod
  className?: string
}

const methodVariants: Record<DeliveryMethod, string> = {
  email: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  in_app: 'bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  sms: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  print: 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
}

const methodIcons: Record<DeliveryMethod, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  in_app: <Smartphone className="h-3 w-3" />,
  sms: <MessageSquare className="h-3 w-3" />,
  print: <Printer className="h-3 w-3" />,
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
