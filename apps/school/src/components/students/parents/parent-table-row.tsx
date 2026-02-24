import { formatPhone } from '@repo/data-ops'
import { IconDots, IconMail, IconPhone, IconSend, IconTrash } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { TableCell } from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

const invitationStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

interface ParentTableRowProps {
  item: any
  index: number
  onInvite: (id: string) => void
  onDelete: (parent: any) => void
  isInviting: boolean
}

export function ParentTableRow({
  item,
  index,
  onInvite,
  onDelete,
  isInviting,
}: ParentTableRowProps) {
  const t = useTranslations()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border-b"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {item.firstName?.[0]}
              {item.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {item.lastName}
              {' '}
              {item.firstName}
            </p>
            {item.occupation && <p className="text-sm text-muted-foreground">{item.occupation}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <IconPhone className="h-3 w-3 text-muted-foreground" />
          {formatPhone(item.phone)}
        </div>
      </TableCell>
      <TableCell>
        {item.email
          ? (
              <div className="flex items-center gap-1">
                <IconMail className="h-3 w-3 text-muted-foreground" />
                {item.email}
              </div>
            )
          : <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          {item.childrenCount}
          {' '}
          {t.parents.childrenCount()}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={invitationStatusColors[item.invitationStatus || 'pending']}>
          {{
            pending: t.parents.statusPending,
            sent: t.parents.statusSent,
            accepted: t.parents.statusAccepted,
            expired: t.parents.statusExpired,
          }[item.invitationStatus as 'pending' | 'sent' | 'accepted' | 'expired']()}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <IconDots className="h-4 w-4" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            {item.invitationStatus !== 'accepted' && (
              <DropdownMenuItem onClick={() => onInvite(item.id)} disabled={isInviting}>
                <IconSend className="mr-2 h-4 w-4" />
                {t.parents.sendInvitation()}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
              <IconTrash className="mr-2 h-4 w-4" />
              {t.common.delete()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
}
